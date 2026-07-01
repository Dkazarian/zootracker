import { type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';
import { auth } from '../src/auth/auth';
import { prisma } from '../src/database/prisma.service';

const describeWithDatabase =
  process.env.RUN_DATABASE_TESTS === 'true' ? describe : describe.skip;

describeWithDatabase('Personnel and roles (database e2e)', () => {
  const administrator = {
    name: 'Personnel Test Admin',
    email: 'personnel-test-admin@example.com',
    password: 'personnel-admin-password-123',
    role: 'admin' as const,
  };
  const keeper = {
    name: 'Personnel Test Keeper',
    email: 'personnel-test-keeper@example.com',
    password: 'personnel-keeper-password-123',
    role: 'keeper' as const,
  };
  const secondAdministrator = {
    name: 'Second Personnel Admin',
    email: 'personnel-second-admin@example.com',
    password: 'second-admin-password-123',
    role: 'admin' as const,
  };
  const createdEmail = 'personnel-created@example.com';
  let app: INestApplication<App>;
  let administratorId: string;
  let keeperId: string;

  async function signIn(
    credentials: Pick<typeof administrator, 'email' | 'password'>,
  ) {
    const agent = request.agent(app.getHttpServer());
    await agent
      .post('/api/auth/sign-in/email')
      .set('origin', 'http://localhost:5173')
      .send(credentials)
      .expect(200);
    return agent;
  }

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication({ bodyParser: false });
    configureApp(app);
    await app.init();
  });

  beforeEach(async () => {
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [
            administrator.email,
            keeper.email,
            secondAdministrator.email,
            createdEmail,
          ],
        },
      },
    });

    const adminResult = await auth.api.createUser({
      body: administrator,
    });
    const keeperResult = await auth.api.createUser({
      body: keeper,
    });
    administratorId = adminResult.user.id;
    keeperId = keeperResult.user.id;
  });

  it('enforces authentication and administrator permission on every endpoint', async () => {
    const unauthenticated = request(app.getHttpServer());
    const keeperAgent = await signIn(keeper);

    await unauthenticated.get('/api/personnel').expect(401);
    await unauthenticated.post('/api/personnel').send({}).expect(401);
    await unauthenticated
      .patch(`/api/personnel/${keeperId}/deactivate`)
      .expect(401);
    await unauthenticated
      .patch(`/api/personnel/${keeperId}/reactivate`)
      .expect(401);

    await keeperAgent.get('/api/personnel').expect(403);
    await keeperAgent.post('/api/personnel').send({}).expect(403);
    await keeperAgent
      .patch(`/api/personnel/${administratorId}/deactivate`)
      .expect(403);
    await keeperAgent
      .patch(`/api/personnel/${administratorId}/reactivate`)
      .expect(403);

    await keeperAgent.get('/api/me').expect(200).expect({
      id: keeperId,
      name: keeper.name,
      email: keeper.email,
      role: 'keeper',
    });
  });

  it('lists, creates, and validates personnel using safe fields', async () => {
    const administratorAgent = await signIn(administrator);

    const listResponse = await administratorAgent
      .get('/api/personnel')
      .expect(200);
    expect(listResponse.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: administratorId,
          email: administrator.email,
          role: 'admin',
          active: true,
        }),
        expect.objectContaining({
          id: keeperId,
          email: keeper.email,
          role: 'keeper',
          active: true,
        }),
      ]),
    );
    expect(listResponse.text).not.toContain('password');
    expect(listResponse.text).not.toContain('token');
    expect(listResponse.text).not.toContain('banReason');

    const createResponse = await administratorAgent
      .post('/api/personnel')
      .send({
        name: 'Created Keeper',
        email: `  ${createdEmail.toUpperCase()}  `,
        role: 'keeper',
        password: 'created-keeper-password-123',
      })
      .expect(201);
    const created = createResponse.body as {
      id: string;
      name: string;
      email: string;
      role: string;
      createdAt: string;
      updatedAt: string;
    };
    expect(typeof created.id).toBe('string');
    expect(typeof created.createdAt).toBe('string');
    expect(typeof created.updatedAt).toBe('string');
    expect(created).toMatchObject({
      name: 'Created Keeper',
      email: createdEmail,
      role: 'keeper',
      active: true,
    });

    await administratorAgent
      .post('/api/personnel')
      .send({
        name: 'Duplicate',
        email: createdEmail,
        role: 'keeper',
        password: 'duplicate-password-123',
      })
      .expect(409);
    await administratorAgent
      .post('/api/personnel')
      .send({
        name: 'Invalid Role',
        email: 'invalid-role@example.com',
        role: 'user',
        password: 'invalid-role-password-123',
      })
      .expect(400);
  });

  it('does not expose generic Better Auth administration as a second API', async () => {
    const administratorAgent = await signIn(administrator);

    await administratorAgent
      .post('/api/auth/admin/remove-user')
      .set('origin', 'http://localhost:5173')
      .send({ userId: keeperId })
      .expect(403);

    await administratorAgent
      .post('/api/auth/admin/set-role')
      .set('origin', 'http://localhost:5173')
      .send({ userId: keeperId, role: 'admin' })
      .expect(403);

    await expect(
      prisma.user.findUnique({ where: { id: keeperId } }),
    ).resolves.not.toBeNull();
  });

  it('deactivates, revokes sessions, and reactivates the same account', async () => {
    const administratorAgent = await signIn(administrator);
    const keeperAgent = await signIn(keeper);
    const accountBefore = await prisma.account.findFirstOrThrow({
      where: { userId: keeperId },
      select: { id: true, password: true },
    });

    await administratorAgent
      .patch(`/api/personnel/${keeperId}/deactivate`)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          id: keeperId,
          role: 'keeper',
          active: false,
        });
      });

    await keeperAgent.get('/api/me').expect(401);
    await request(app.getHttpServer())
      .post('/api/auth/sign-in/email')
      .set('origin', 'http://localhost:5173')
      .send({ email: keeper.email, password: keeper.password })
      .expect(403);

    const inactiveAccount = await prisma.user.findUniqueOrThrow({
      where: { id: keeperId },
      select: { id: true, role: true, banned: true },
    });
    const accountAfterDeactivation = await prisma.account.findFirstOrThrow({
      where: { userId: keeperId },
      select: { id: true, password: true },
    });
    expect(inactiveAccount).toEqual({
      id: keeperId,
      role: 'keeper',
      banned: true,
    });
    expect(accountAfterDeactivation).toEqual(accountBefore);

    await administratorAgent
      .patch(`/api/personnel/${keeperId}/reactivate`)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          id: keeperId,
          role: 'keeper',
          active: true,
        });
      });

    await signIn(keeper);
    await expect(
      prisma.account.findFirstOrThrow({
        where: { userId: keeperId },
        select: { id: true, password: true },
      }),
    ).resolves.toEqual(accountBefore);
  });

  it('protects self, missing accounts, and existing lifecycle states', async () => {
    const administratorAgent = await signIn(administrator);

    await administratorAgent
      .patch(`/api/personnel/${administratorId}/deactivate`)
      .expect(409);
    await administratorAgent
      .patch('/api/personnel/missing-person/deactivate')
      .expect(404);
    await administratorAgent
      .patch('/api/personnel/missing-person/reactivate')
      .expect(404);
    await administratorAgent
      .patch(`/api/personnel/${keeperId}/reactivate`)
      .expect(409);

    await administratorAgent
      .patch(`/api/personnel/${keeperId}/deactivate`)
      .expect(200);
    await administratorAgent
      .patch(`/api/personnel/${keeperId}/deactivate`)
      .expect(409);
  });

  it('preserves an active administrator under concurrent deactivation', async () => {
    const secondResult = await auth.api.createUser({
      body: secondAdministrator,
    });
    const secondAdministratorId = secondResult.user.id;
    const firstAgent = await signIn(administrator);
    const secondAgent = await signIn(secondAdministrator);

    const [firstResponse, secondResponse] = await Promise.all([
      firstAgent.patch(`/api/personnel/${secondAdministratorId}/deactivate`),
      secondAgent.patch(`/api/personnel/${administratorId}/deactivate`),
    ]);

    const statuses = [firstResponse.status, secondResponse.status];
    expect(statuses.filter((status) => status === 200)).toHaveLength(1);
    expect(
      statuses.filter((status) => status === 401 || status === 409),
    ).toHaveLength(1);
    await expect(
      prisma.user.count({
        where: {
          role: 'admin',
          OR: [{ banned: false }, { banned: null }],
        },
      }),
    ).resolves.toBeGreaterThanOrEqual(1);
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [
            administrator.email,
            keeper.email,
            secondAdministrator.email,
            createdEmail,
            'invalid-role@example.com',
          ],
        },
      },
    });
    await app.close();
  });
});
