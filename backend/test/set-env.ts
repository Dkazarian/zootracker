import { resolve } from 'node:path';
import { config } from 'dotenv';

config({
  path: resolve(process.cwd(), '.env.test'),
  quiet: true,
});

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL ??=
  'postgresql://postgres:test@localhost:5432/zootracker_test?schema=public';
process.env.BETTER_AUTH_SECRET ??=
  'zootracker-test-secret-that-is-at-least-32-characters';
process.env.BETTER_AUTH_URL ??= 'http://localhost:3000';
process.env.FRONTEND_URL ??= 'http://localhost:5173';
process.env.ZOO_TIME_ZONE ??= 'America/Argentina/Buenos_Aires';
