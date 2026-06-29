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

describeWithDatabase('Animal registry (database e2e)', () => {
  const administrator = {
    name: 'Animal Test Admin',
    email: 'animal-test-admin@example.com',
    password: 'animal-admin-password-123',
    role: 'admin' as const,
  };
  const keeper = {
    name: 'Animal Test Keeper',
    email: 'animal-test-keeper@example.com',
    password: 'animal-keeper-password-123',
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
    await prisma.animal.deleteMany({
      where: { notes: { startsWith: 'animal-e2e:' } },
    });
    await prisma.user.deleteMany({
      where: { email: { in: [administrator.email, keeper.email] } },
    });
    await auth.api.createUser({ body: administrator });
    await auth.api.createUser({ body: keeper });

    const active = await prisma.animal.create({
      data: {
        name: 'E2E Luma',
        species: 'Greater Flamingo',
        sex: 'unknown',
        notes: 'animal-e2e:active',
      },
    });
    const archived = await prisma.animal.create({
      data: {
        name: 'E2E Bruno',
        species: 'Spectacled Bear',
        notes: 'animal-e2e:archived',
        archivedAt: new Date(),
      },
    });
    activeAnimalId = active.id;
    archivedAnimalId = archived.id;
  });

  it('requires authentication and administrator permission for mutations', async () => {
    const unauthenticated = request(app.getHttpServer());
    const keeperAgent = await signIn(keeper);

    await unauthenticated.get('/api/animals').expect(401);
    await unauthenticated.get(`/api/animals/${activeAnimalId}`).expect(401);
    await unauthenticated.post('/api/animals').send({}).expect(401);
    await unauthenticated.patch(`/api/animals/${activeAnimalId}`).expect(401);
    await unauthenticated
      .post(`/api/animals/${activeAnimalId}/archive`)
      .expect(401);

    await keeperAgent.post('/api/animals').send({}).expect(403);
    await keeperAgent.patch(`/api/animals/${activeAnimalId}`).expect(403);
    await keeperAgent
      .post(`/api/animals/${activeAnimalId}/archive`)
      .expect(403);
  });

  it('lets keepers browse and search active animals without archive access', async () => {
    const keeperAgent = await signIn(keeper);

    const list = await keeperAgent.get('/api/animals').expect(200);
    const listedAnimals = list.body as Array<{ id: string; name: string }>;
    expect(listedAnimals).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: activeAnimalId, name: 'E2E Luma' }),
      ]),
    );
    expect(listedAnimals).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: archivedAnimalId }),
      ]),
    );

    const search = await keeperAgent
      .get('/api/animals?search=fLaMiNgO')
      .expect(200);
    const searchResults = search.body as Array<{ id: string }>;
    expect(searchResults).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: activeAnimalId })]),
    );

    await keeperAgent.get(`/api/animals/${activeAnimalId}`).expect(200);
    await keeperAgent.get(`/api/animals/${archivedAnimalId}`).expect(404);
    await keeperAgent.get('/api/animals?status=archived').expect(403);
  });

  it('lets administrators create, update, archive, and review animals', async () => {
    const administratorAgent = await signIn(administrator);

    const createResponse = await administratorAgent
      .post('/api/animals')
      .send({
        name: '  E2E Nilo  ',
        species: ' Capybara ',
        sex: 'male',
        dateOfBirth: '2022-01-19',
        arrivalDate: '2023-06-03',
        currentLocation: ' Riverbank ',
        notes: 'animal-e2e:created',
      })
      .expect(201);
    const created = createResponse.body as {
      id: string;
      name: string;
      species: string;
      sex: string;
      currentLocation: string;
      archivedAt: string | null;
      createdAt: string;
    };
    expect(created).toMatchObject({
      name: 'E2E Nilo',
      species: 'Capybara',
      sex: 'male',
      currentLocation: 'Riverbank',
      archivedAt: null,
    });
    const createdId = created.id;
    const createdAt = created.createdAt;

    const updateResponse = await administratorAgent
      .patch(`/api/animals/${createdId}`)
      .send({ currentLocation: 'Wetlands' })
      .expect(200);
    expect(updateResponse.body).toMatchObject({
      id: createdId,
      createdAt,
      currentLocation: 'Wetlands',
    });

    await administratorAgent
      .post(`/api/animals/${createdId}/archive`)
      .expect(201)
      .expect((response) => {
        const body = response.body as { archivedAt: string };
        expect(typeof body.archivedAt).toBe('string');
      });
    await administratorAgent.get(`/api/animals/${createdId}`).expect(200);
    const activeList = await administratorAgent.get('/api/animals').expect(200);
    expect(activeList.body).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ id: createdId })]),
    );
    const archivedList = await administratorAgent
      .get('/api/animals?status=archived')
      .expect(200);
    expect(archivedList.body).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: createdId })]),
    );
    await administratorAgent
      .patch(`/api/animals/${createdId}`)
      .send({ name: 'Cannot change' })
      .expect(409);
  });

  it('rejects invalid and unexpected animal fields', async () => {
    const administratorAgent = await signIn(administrator);

    await administratorAgent
      .post('/api/animals')
      .send({ name: '', species: 'A', sex: 'other' })
      .expect(400);
    await administratorAgent
      .post('/api/animals')
      .send({
        name: 'Future',
        species: 'Test species',
        dateOfBirth: '2999-01-01',
      })
      .expect(400);
    await administratorAgent
      .post('/api/animals')
      .send({
        name: 'Wrong dates',
        species: 'Test species',
        dateOfBirth: '2025-01-02',
        arrivalDate: '2025-01-01',
      })
      .expect(400);
    await administratorAgent
      .post('/api/animals')
      .send({
        name: 'Unexpected',
        species: 'Test species',
        secret: 'not accepted',
      })
      .expect(400);
  });

  afterAll(async () => {
    await prisma.animal.deleteMany({
      where: { notes: { startsWith: 'animal-e2e:' } },
    });
    await prisma.user.deleteMany({
      where: { email: { in: [administrator.email, keeper.email] } },
    });
    await app.close();
  });
});
