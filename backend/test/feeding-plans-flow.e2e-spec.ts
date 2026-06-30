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

describeWithDatabase('Feeding plans (database e2e)', () => {
  const administrator = {
    name: 'Plan Test Admin',
    email: 'plan-test-admin@example.com',
    password: 'plan-admin-password-123',
    role: 'admin' as const,
  };
  const keeper = {
    name: 'Plan Test Keeper',
    email: 'plan-test-keeper@example.com',
    password: 'plan-keeper-password-123',
    role: 'keeper' as const,
  };
  const secondKeeper = {
    name: 'Plan Test Second Keeper',
    email: 'plan-test-second-keeper@example.com',
    password: 'plan-second-keeper-password-123',
    role: 'keeper' as const,
  };
  let app: INestApplication<App>;
  let activeAnimalId: string;
  let archivedAnimalId: string;

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
    await prisma.feedingPlan.deleteMany({
      where: { animal: { notes: { startsWith: 'plan-e2e:' } } },
    });
    await prisma.animal.deleteMany({
      where: { notes: { startsWith: 'plan-e2e:' } },
    });
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [administrator.email, keeper.email, secondKeeper.email],
        },
      },
    });
    await auth.api.createUser({ body: administrator });
    await auth.api.createUser({ body: keeper });
    await auth.api.createUser({ body: secondKeeper });

    const active = await prisma.animal.create({
      data: {
        name: 'E2E Amara',
        species: 'African elephant',
        notes: 'plan-e2e:active',
      },
    });
    const archived = await prisma.animal.create({
      data: {
        name: 'E2E Former Resident',
        species: 'Test species',
        notes: 'plan-e2e:archived',
        archivedAt: new Date(),
      },
    });
    activeAnimalId = active.id;
    archivedAnimalId = archived.id;
  });

  it('requires authentication for every feeding-plan operation', async () => {
    const unauthenticated = request(app.getHttpServer());
    const basePath = `/api/animals/${activeAnimalId}/feeding-plans`;

    await unauthenticated.get(basePath).expect(401);
    await unauthenticated.post(basePath).send({}).expect(401);
    await unauthenticated.patch(`${basePath}/missing`).send({}).expect(401);
    await unauthenticated.post(`${basePath}/missing/archive`).expect(401);
  });

  it('creates, orders, updates, and archives plans with accountability', async () => {
    const keeperAgent = await signIn(keeper);
    const secondKeeperAgent = await signIn(secondKeeper);
    const basePath = `/api/animals/${activeAnimalId}/feeding-plans`;

    const eveningResponse = await keeperAgent
      .post(basePath)
      .send({
        name: ' Evening meal ',
        instructions: ' Hay and leafy greens ',
        period: 'evening',
        repeatEveryDays: 1,
        nextDueDate: '2030-07-01',
      })
      .expect(201);
    const morningResponse = await keeperAgent
      .post(basePath)
      .send({
        name: 'Morning fruit',
        instructions: '3 bananas and an apple',
        period: 'morning',
        repeatEveryDays: 2,
        nextDueDate: '2030-07-01',
      })
      .expect(201);
    const evening = eveningResponse.body as {
      id: string;
      name: string;
      instructions: string;
      createdAt: string;
      createdBy: { id: string; name: string };
    };
    const morning = morningResponse.body as { id: string };
    expect(evening).toMatchObject({
      name: 'Evening meal',
      instructions: 'Hay and leafy greens',
      createdBy: { name: keeper.name },
    });

    const list = await keeperAgent.get(basePath).expect(200);
    const plans = list.body as Array<{ id: string; status: string }>;
    expect(plans.map((plan) => plan.id)).toEqual([morning.id, evening.id]);
    expect(plans.every((plan) => plan.status === 'upcoming')).toBe(true);

    const update = await secondKeeperAgent
      .patch(`${basePath}/${evening.id}`)
      .send({
        instructions: 'Hay, leafy greens, and branches',
        repeatEveryDays: 2,
      })
      .expect(200);
    expect(update.body).toMatchObject({
      id: evening.id,
      createdAt: evening.createdAt,
      createdBy: { name: keeper.name },
      lastModifiedBy: { name: secondKeeper.name },
      repeatEveryDays: 2,
    });

    await secondKeeperAgent
      .post(`${basePath}/${evening.id}/archive`)
      .expect(201);
    const afterArchive = await keeperAgent.get(basePath).expect(200);
    expect(afterArchive.body).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: evening.id })]),
    );
    await keeperAgent
      .patch(`${basePath}/${evening.id}`)
      .send({ name: 'Cannot change' })
      .expect(409);
    await keeperAgent.delete(`${basePath}/${morning.id}`).expect(404);
  });

  it('lets administrators create, update, and archive plans', async () => {
    const administratorAgent = await signIn(administrator);
    const basePath = `/api/animals/${activeAnimalId}/feeding-plans`;

    const create = await administratorAgent
      .post(basePath)
      .send({
        name: 'Administrator plan',
        instructions: 'Browse and fresh fruit',
        period: 'afternoon',
        repeatEveryDays: 1,
        nextDueDate: '2030-07-01',
      })
      .expect(201);
    const created = create.body as { id: string };
    expect(create.body).toMatchObject({
      createdBy: { name: administrator.name },
      lastModifiedBy: { name: administrator.name },
    });

    await administratorAgent
      .patch(`${basePath}/${created.id}`)
      .send({ instructions: 'Browse, fresh fruit, and water' })
      .expect(200)
      .expect((response) => {
        expect(response.body).toMatchObject({
          id: created.id,
          instructions: 'Browse, fresh fruit, and water',
          lastModifiedBy: { name: administrator.name },
        });
      });

    await administratorAgent
      .post(`${basePath}/${created.id}/archive`)
      .expect(201)
      .expect((response) => {
        expect(
          typeof (response.body as { archivedAt: string }).archivedAt,
        ).toBe('string');
      });
  });

  it('rejects invalid plans, unexpected accountability, and archived animals', async () => {
    const keeperAgent = await signIn(keeper);
    const basePath = `/api/animals/${activeAnimalId}/feeding-plans`;
    const validPlan = {
      name: 'Morning fruit',
      instructions: '3 bananas and an apple',
      period: 'morning',
      repeatEveryDays: 1,
      nextDueDate: '2030-07-01',
    };

    await keeperAgent
      .post(basePath)
      .send({ ...validPlan, name: '', instructions: ' ' })
      .expect(400);
    await keeperAgent
      .post(basePath)
      .send({ ...validPlan, period: 'night' })
      .expect(400);
    await keeperAgent
      .post(basePath)
      .send({ ...validPlan, repeatEveryDays: 0 })
      .expect(400);
    await keeperAgent
      .post(basePath)
      .send({ ...validPlan, repeatEveryDays: 1.5 })
      .expect(400);
    await keeperAgent
      .post(basePath)
      .send({ ...validPlan, nextDueDate: '2030-02-30' })
      .expect(400);
    await keeperAgent
      .post(basePath)
      .send({ ...validPlan, createdById: 'forged-user' })
      .expect(400);
    await keeperAgent
      .post(`/api/animals/${archivedAnimalId}/feeding-plans`)
      .send(validPlan)
      .expect(409);
  });

  it('preserves plans after their animal is archived', async () => {
    const keeperAgent = await signIn(keeper);
    const administratorAgent = await signIn(administrator);
    const basePath = `/api/animals/${activeAnimalId}/feeding-plans`;
    const create = await keeperAgent
      .post(basePath)
      .send({
        name: 'Morning fruit',
        instructions: '3 bananas and an apple',
        period: 'morning',
        repeatEveryDays: 1,
        nextDueDate: '2030-07-01',
      })
      .expect(201);

    await prisma.animal.update({
      where: { id: activeAnimalId },
      data: { archivedAt: new Date() },
    });

    await keeperAgent.get(basePath).expect(404);
    const administratorList = await administratorAgent
      .get(basePath)
      .expect(200);
    expect(administratorList.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: (create.body as { id: string }).id }),
      ]),
    );
    await keeperAgent
      .patch(`${basePath}/${(create.body as { id: string }).id}`)
      .send({ name: 'Cannot change' })
      .expect(409);
  });

  afterAll(async () => {
    await prisma.feedingPlan.deleteMany({
      where: { animal: { notes: { startsWith: 'plan-e2e:' } } },
    });
    await prisma.animal.deleteMany({
      where: { notes: { startsWith: 'plan-e2e:' } },
    });
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [administrator.email, keeper.email, secondKeeper.email],
        },
      },
    });
    await app.close();
  });
});
