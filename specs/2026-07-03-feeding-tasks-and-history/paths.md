# Phase 6: Feeding Tasks and History - Implementation Paths

Use only the paths for the active task group. Follow a direct import outside a
listed path only when needed to understand an existing contract.

## Specification paths

- `specs/2026-07-03-feeding-tasks-and-history/`
- `specs/2026-06-30-feeding-plans/`
- `specs/entity-relationship-model.md`
- `specs/roadmap.md`
- `CHANGELOG.md`

## Task-group boundaries

| Task group | Editable paths | Supporting read-only context |
|---|---|---|
| 1. Feeding-task schema and migration | `backend/prisma/schema.prisma`, `backend/prisma/migrations/<new-feeding-task-migration>/`, `backend/prisma/seed.ts`, `backend/src/feeding-tasks/` | `backend/prisma/migrations/20260630180000_feeding_plans/`, `backend/src/database/prisma.service.ts`, `backend/src/generated/prisma/` |
| 2. Feeding-plan creation, listing, and archiving | `backend/src/feeding-plans/`, `backend/test/feeding-plans-flow.e2e-spec.ts`, `frontend/src/features/feeding-plans/` | `backend/src/config/environment.ts`, `backend/src/database/prisma.service.ts`, `backend/src/generated/prisma/`, `backend/src/animals/` |
| 3. Feeding-task completion and history API | `backend/src/feeding-tasks/`, `backend/src/app.module.ts`, `backend/test/feeding-tasks-flow.e2e-spec.ts`, `backend/package.json`, `package.json` | `backend/src/feeding-plans/`, `backend/src/config/environment.ts`, `backend/src/common/authorization/`, `backend/src/database/`, `backend/src/generated/prisma/`, `backend/test/jest-e2e.json` |
| 4. Animal-profile task and history interface | `frontend/src/features/feeding-tasks/`, `frontend/src/features/feeding-plans/`, `frontend/src/features/animals/AnimalDetailPage.tsx`, `frontend/src/app/App.css`, `frontend/src/shared/styles/global.css` | `frontend/src/shared/api/http.ts`, `frontend/src/shared/auth/`, `frontend/src/shared/date/`, `frontend/src/app/App.test.tsx` |
| 5. Documentation and final validation | `README.md`, `CHANGELOG.md`, `specs/roadmap.md`, `specs/entity-relationship-model.md`, `specs/2026-06-30-feeding-plans/`, `specs/2026-07-03-feeding-tasks-and-history/` | `AGENTS.md`, `backend/AGENTS.md`, `frontend/AGENTS.md`, `specs/AGENTS.md`, `package.json`, `backend/package.json`, `frontend/package.json` |

## Expected new feature files

The exact set may change within the approved feature folders, but the expected
new files are:

### Backend

- `backend/src/feeding-tasks/dto/complete-feeding-task.dto.ts`
- `backend/src/feeding-tasks/dto/update-feeding-task-completion.dto.ts`
- `backend/src/feeding-tasks/dto/list-feeding-tasks-query.dto.ts`
- `backend/src/feeding-tasks/feeding-task.mappers.ts`
- `backend/src/feeding-tasks/feeding-task.types.ts`
- `backend/src/feeding-tasks/feeding-task-schedule.ts`
- `backend/src/feeding-tasks/feeding-task-schedule.spec.ts`
- `backend/src/feeding-tasks/feeding-tasks.controller.ts`
- `backend/src/feeding-tasks/feeding-tasks.module.ts`
- `backend/src/feeding-tasks/feeding-tasks.repository.ts`
- `backend/src/feeding-tasks/feeding-tasks.repository.spec.ts`
- `backend/src/feeding-tasks/feeding-tasks.service.ts`
- `backend/src/feeding-tasks/feeding-tasks.service.spec.ts`
- `backend/test/feeding-tasks-flow.e2e-spec.ts`

### Frontend

- `frontend/src/features/feeding-tasks/feeding-task-api.ts`
- `frontend/src/features/feeding-tasks/feeding-task-format.ts`
- `frontend/src/features/feeding-tasks/FeedingTaskCompletionForm.tsx`
- `frontend/src/features/feeding-tasks/FeedingHistorySection.tsx`
- Colocated feeding-task component and helper tests

## Excluded paths

- `node_modules/`
- `frontend/dist/`
- `backend/dist/`
- `coverage/`
- `backend/src/generated/`
- Existing migration directories other than the explicitly listed read-only
  feeding-plan migration
- `.env`, `.env.test`, credentials, and local database files
- `frontend/public/` and species illustration assets
- Unrelated product features such as authentication, personnel, weights, and
  dashboards

## Path expansion rule

Imports, failing tests, or missing required coverage may justify an expansion.
Update this file and obtain approval before editing an unlisted shared feature,
authentication or authorization infrastructure, database infrastructure,
generated code, unrelated API test, or any path outside the editable
boundaries above.

## Path boundary changes

None recorded.
