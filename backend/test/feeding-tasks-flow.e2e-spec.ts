import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';
import { auth } from '../src/auth/auth';
import { prisma } from '../src/database/prisma.service';

const describeWithDatabase =
  process.env.RUN_DATABASE_TESTS === 'true' ? describe : describe.skip;

describeWithDatabase('Feeding tasks (database e2e)', () => {
  const keeper = {
    name: 'Task Test Keeper',
    email: 'task-test-keeper@example.com',
    password: 'task-keeper-password-123',
    role: 'keeper' as const,
  };
  const administrator = {
    name: 'Task Test Admin',
    email: 'task-test-admin@example.com',
    password: 'task-admin-password-123',
    role: 'admin' as const,
  };
  let app: INestApplication<App>;
  let animalId: string;

  async function signIn(credentials: typeof keeper | typeof administrator) {
    const agent = request.agent(app.getHttpServer());
    await agent
      .post('/api/auth/sign-in/email')
      .set('origin', 'http://localhost:5173')
      .send({ email: credentials.email, password: credentials.password })
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
    await prisma.feedingTask.deleteMany({
      where: { feedingPlan: { animal: { notes: 'task-e2e' } } },
    });
    await prisma.feedingPlan.deleteMany({
      where: { animal: { notes: 'task-e2e' } },
    });
    await prisma.animal.deleteMany({ where: { notes: 'task-e2e' } });
    await prisma.user.deleteMany({
      where: { email: { in: [keeper.email, administrator.email] } },
    });
    await auth.api.createUser({ body: keeper });
    await auth.api.createUser({ body: administrator });
    const animal = await prisma.animal.create({
      data: { name: 'Task animal', species: 'Test species', notes: 'task-e2e' },
    });
    animalId = animal.id;
  });

  it('completes, lists, corrects, and lets an administrator undo a task', async () => {
    const keeperAgent = await signIn(keeper);
    const adminAgent = await signIn(administrator);
    const initialDueDate = new Date().toISOString().slice(0, 10);
    const plan = await keeperAgent
      .post(`/api/animals/${animalId}/feeding-plans`)
      .send({
        name: 'Morning feeding',
        instructions: 'Fruit and leaves',
        period: 'morning',
        repeatEveryDays: 1,
        initialDueDate,
      })
      .expect(201);
    const taskId = (plan.body as { currentTask: { id: string } }).currentTask
      .id;

    await request(app.getHttpServer())
      .post(`/api/feeding-tasks/${taskId}/completion`)
      .send({})
      .expect(401);

    const completed = await keeperAgent
      .post(`/api/feeding-tasks/${taskId}/completion`)
      .send({ notes: 'Ate everything' })
      .expect(201);
    expect(completed.body).toMatchObject({
      id: taskId,
      status: 'COMPLETED',
      notes: 'Ate everything',
      completedBy: { name: keeper.name },
    });

    await keeperAgent
      .post(`/api/feeding-tasks/${taskId}/completion`)
      .send({})
      .expect(409);

    const history = await keeperAgent
      .get(`/api/animals/${animalId}/feeding-tasks?status=completed`)
      .expect(200);
    expect(history.body).toEqual([
      expect.objectContaining({ id: taskId, scheduledDueDate: initialDueDate }),
    ]);

    const correctedAt = new Date(Date.now() - 60_000).toISOString();
    const corrected = await keeperAgent
      .patch(`/api/feeding-tasks/${taskId}/completion`)
      .send({ completedAt: correctedAt, notes: 'Left a little fruit' })
      .expect(200);
    expect(corrected.body).toMatchObject({
      completedBy: { name: keeper.name },
      lastModifiedBy: { name: keeper.name },
      notes: 'Left a little fruit',
    });

    await keeperAgent
      .delete(`/api/feeding-tasks/${taskId}/completion`)
      .expect(403);
    const restored = await adminAgent
      .delete(`/api/feeding-tasks/${taskId}/completion`)
      .expect(200);
    expect(restored.body).toMatchObject({
      id: taskId,
      status: 'AVAILABLE',
      completedBy: null,
      completedAt: null,
      notes: null,
    });
  });

  it('allows only one concurrent completion and creates one successor', async () => {
    const keeperAgent = await signIn(keeper);
    const initialDueDate = new Date().toISOString().slice(0, 10);
    const plan = await keeperAgent
      .post(`/api/animals/${animalId}/feeding-plans`)
      .send({
        name: 'Concurrent feeding',
        instructions: 'One measured portion',
        period: 'morning',
        repeatEveryDays: 1,
        initialDueDate,
      })
      .expect(201);
    const taskId = (plan.body as { currentTask: { id: string } }).currentTask
      .id;

    const responses = await Promise.all([
      keeperAgent.post(`/api/feeding-tasks/${taskId}/completion`).send({}),
      keeperAgent.post(`/api/feeding-tasks/${taskId}/completion`).send({}),
    ]);
    expect(responses.map((response) => response.status).sort()).toEqual([
      201, 409,
    ]);
    expect(
      await prisma.feedingTask.count({
        where: { feedingPlanId: (plan.body as { id: string }).id },
      }),
    ).toBe(2);
    expect(
      await prisma.feedingTask.count({
        where: {
          feedingPlanId: (plan.body as { id: string }).id,
          status: 'COMPLETED',
        },
      }),
    ).toBe(1);
  });

  afterAll(async () => {
    await prisma.feedingTask.deleteMany({
      where: { feedingPlan: { animal: { notes: 'task-e2e' } } },
    });
    await prisma.feedingPlan.deleteMany({
      where: { animal: { notes: 'task-e2e' } },
    });
    await prisma.animal.deleteMany({ where: { notes: 'task-e2e' } });
    await prisma.user.deleteMany({
      where: { email: { in: [keeper.email, administrator.email] } },
    });
    await app.close();
  });
});
