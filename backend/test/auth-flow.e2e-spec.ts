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

describeWithDatabase('Authentication flow (database e2e)', () => {
  const administrator = {
    name: 'Authentication Test Admin',
    email: 'auth-test-admin@example.com',
    password: 'auth-test-password-123',
  };
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication({
      bodyParser: false,
    });
    configureApp(app);
    await app.init();
  });

  beforeEach(async () => {
    await prisma.user.deleteMany({
      where: { email: administrator.email },
    });
    await auth.api.createUser({
      body: {
        ...administrator,
        role: 'admin',
      },
    });
  });

  it('rejects invalid credentials without creating a session', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/sign-in/email')
      .set('origin', 'http://localhost:5173')
      .send({
        email: administrator.email,
        password: 'not-the-password',
      })
      .expect(401);
  });

  it('rejects public email registration', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/sign-up/email')
      .set('origin', 'http://localhost:5173')
      .send({
        name: 'Uninvited User',
        email: 'uninvited@example.com',
        password: 'uninvited-password-123',
      });

    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  it('uses a cookie session for login, current user, and logout', async () => {
    const agent = request.agent(app.getHttpServer());

    const loginResponse = await agent
      .post('/api/auth/sign-in/email')
      .set('origin', 'http://localhost:5173')
      .send({
        email: administrator.email,
        password: administrator.password,
      })
      .expect(200);

    expect(loginResponse.headers['set-cookie']).toBeDefined();

    const currentUserResponse = await agent.get('/api/me').expect(200);
    const currentUser = currentUserResponse.body as {
      id: unknown;
      name: unknown;
      email: unknown;
      role: unknown;
    };
    expect(typeof currentUser.id).toBe('string');
    expect(currentUser).toEqual({
      id: currentUser.id,
      name: administrator.name,
      email: administrator.email,
      role: 'admin',
    });

    await agent
      .post('/api/auth/sign-out')
      .set('origin', 'http://localhost:5173')
      .send({})
      .expect(200);

    await agent.get('/api/me').expect(401);
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [administrator.email, 'uninvited@example.com'],
        },
      },
    });
    await app.close();
  });
});
