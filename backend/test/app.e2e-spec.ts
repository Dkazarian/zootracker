import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import type { Request, RequestHandler } from 'express';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { configureApp } from './../src/app.setup';
import { AuthController } from './../src/auth/auth.controller';

describe('Health endpoint (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
  });

  it('GET /api/health', () => {
    return request(app.getHttpServer()).get('/api/health').expect(200).expect({
      status: 'ok',
      service: 'zootracker-api',
    });
  });

  it('rejects GET /api/me without a session', () => {
    return request(app.getHttpServer()).get('/api/me').expect(401);
  });

  afterEach(async () => {
    await app.close();
  });
});

describe('Current-user endpoint (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      controllers: [AuthController],
    }).compile();

    app = moduleFixture.createNestApplication();

    const attachSession: RequestHandler = (request, _response, next) => {
      (
        request as Request & {
          session: object;
        }
      ).session = {
        user: {
          id: 'user-1',
          name: 'Ada Keeper',
          email: 'ada@example.com',
          role: 'admin',
        },
        session: {
          id: 'session-1',
        },
      };
      next();
    };

    app.use(attachSession);
    configureApp(app);
    await app.init();
  });

  it('returns the authenticated user public identity', () => {
    return request(app.getHttpServer()).get('/api/me').expect(200).expect({
      id: 'user-1',
      name: 'Ada Keeper',
      email: 'ada@example.com',
      role: 'admin',
    });
  });

  afterEach(async () => {
    await app.close();
  });
});
