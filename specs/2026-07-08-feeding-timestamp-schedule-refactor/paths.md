# Phase 7: Feeding Timestamp Schedule Refactor - Paths

## Editable paths

- `backend/prisma/schema.prisma`
- `backend/prisma/migrations/`
- `backend/src/animals/`
- `backend/src/feeding-plans/`
- `backend/src/feeding-tasks/`
- `backend/test/feeding-plans-flow.e2e-spec.ts`
- `backend/test/feeding-tasks-flow.e2e-spec.ts`
- `frontend/src/features/feeding-plans/`
- `frontend/src/features/feeding-tasks/`
- `frontend/src/features/animals/AnimalDetailPage.tsx`
- `frontend/src/features/animals/components/`
- `frontend/src/shared/date/`
- `specs/2026-07-08-feeding-timestamp-schedule-refactor/`
- `specs/entity-relationship-model.md`

## Supporting read-only paths

- `AGENTS.md`
- `backend/AGENTS.md`
- `frontend/AGENTS.md`
- `specs/AGENTS.md`
- `backend/src/config/`
- `backend/src/database/`
- `backend/src/generated/prisma/`
- `backend/package.json`
- `frontend/package.json`
- `package.json`
- `scripts/run-check.ps1`

## Excluded paths

- `node_modules/`
- `backend/src/generated/prisma/`
- `backend/dist/`
- `frontend/dist/`
- `coverage/`
- `.tmp/`
- Other phase spec folders under `specs/`, unless the user explicitly approves
  a cross-phase amendment.

## Path-boundary expansions

- 2026-07-09: Added `frontend/src/features/animals/AnimalDetailPage.tsx` and
  `frontend/src/features/animals/components/` for component extraction around
  animal archive confirmation and animal profile details.
- 2026-07-09: Added `backend/src/animals/` for the animal service/repository
  boundary refactor needed by feeding-plan and feeding-task services.
