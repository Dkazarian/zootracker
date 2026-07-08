# Backend Guide

- Stack: NestJS, TypeScript, Better Auth, Prisma, PostgreSQL.
- Organize product code in NestJS feature modules.
- Keep Prisma schema and migrations under `backend/prisma/`.
- Do not hand-edit `backend/src/generated/prisma/`.
- Keep backend HTTP integration tests under `backend/test/`.
- Start from the named module, controller, service, DTO, guard, Prisma model,
  route, test, or feature folder.
- Follow direct imports before searching the whole backend.
- Use migrations for schema changes.
- Run relevant PostgreSQL-backed integration tests when backend, auth, API, or
  database behavior changes.
- PostgreSQL-backed suites require the isolated `zootracker_test` database.
