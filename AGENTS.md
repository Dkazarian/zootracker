# Zootracker Agent Guide

## Source of truth

- Read `specs/mission.md`, `specs/tech-stack.md`, and `specs/roadmap.md` before planning product work.
- Each new roadmap phase receives a dated directory under `specs/` containing `requirements.md`, `scope.md`, `plan.md`, and `validation.md`.
- Agree on feature scope, decisions/context, and validation before writing a new feature specification.
- Agree on the specification before implementation.
- Add `✅` to a plan step only after that step is genuinely complete. Leave blocked or partially validated steps unchecked.
- Keep later roadmap concerns out of the current phase unless the specification is explicitly revised.

## Repository structure

- `frontend/`: React, TypeScript, Vite, React Router, TanStack Query.
- `backend/`: NestJS, TypeScript, Better Auth, Prisma, PostgreSQL.
- `specs/`: project constitution, roadmap, and feature specifications.
- Organize frontend product code by feature under `frontend/src/features/`.
- Put reusable frontend infrastructure under `frontend/src/shared/`.
- Organize backend product code in NestJS feature modules.
- Keep Prisma schema and migrations under `backend/prisma/`.
- Do not hand-edit files under `backend/src/generated/prisma/`.
- Colocate focused unit/component tests with their source. Keep backend HTTP integration tests under `backend/test/`.

## Context efficiency

- Treat `.codexignore` as the default exclusion list for repository discovery and broad scans.
- Do not inspect ignored dependencies, generated code, build outputs, or binary assets unless the active task specifically requires them.
- Before implementing a phase, create and agree on its `scope.md`.
- Use `scope.md` to define the initial context boundary: the active specification files, relevant frontend and backend feature folders, focused tests, and any required schema or shared infrastructure.
- Begin discovery and implementation inside that boundary. Expand it only when requirements, imports, test failures, or other concrete evidence indicate another area is involved.
- Record material scope expansions and their reason in `scope.md` so the context boundary remains reviewable.
- Ignored files may still be read explicitly when needed, such as lockfiles during dependency work or generated output while diagnosing generation problems.

## Development rules

- Use npm workspaces and run shared commands from the repository root.
- Preserve authentication as cookie-based sessions; do not introduce browser-stored bearer tokens.
- Backend routes are protected by default. Mark intentionally public routes explicitly.
- Public registration stays disabled. Personnel creation belongs to administrator workflows.
- Never commit `.env`, `.env.test`, credentials, session values, or database connection secrets.
- Do not log passwords, cookies, authentication secrets, or full connection strings.
- Local development does not require Docker.
- Avoid adding abstractions or dependencies that are not justified by the active feature specification.

## Required verification

Run these from the repository root:

```powershell
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
```

Authentication database tests additionally require the isolated `zootracker_test` database:

```powershell
npm run test:auth:e2e
```

- Follow the active feature's `validation.md` for manual and browser checks.
- Update plan checkmarks only after the corresponding implementation and proportionate validation succeed.
