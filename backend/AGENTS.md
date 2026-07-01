# Backend Guide

- Stack: NestJS, TypeScript, Better Auth, Prisma, PostgreSQL.
- Organize product code in NestJS feature modules.
- Keep Prisma schema and migrations under `backend/prisma/`.
- Do not hand-edit `backend/src/generated/prisma/`.
- Keep backend HTTP integration tests under `backend/test/`.
- Start from the named module, controller, service, DTO, guard, Prisma model,
  route, test, or feature folder.
- Follow direct imports before searching the whole backend.
- Preserve cookie-based sessions; do not introduce browser-stored bearer tokens.
- Routes are protected by default. Mark public routes explicitly.
- Public registration stays disabled; personnel creation belongs to admin flows.
- Never log passwords, cookies, auth secrets, session values, or full connection
  strings.
- Use migrations for schema changes.
- Run relevant PostgreSQL-backed integration tests when backend, auth, API, or
  database behavior changes.
- PostgreSQL-backed suites require the isolated `zootracker_test` database.