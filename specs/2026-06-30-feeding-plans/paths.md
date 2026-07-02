# Phase 5: Feeding Plans - Implementation Paths

## Specification paths

- `specs/2026-06-30-feeding-plans/`

## Task-group boundaries

| Task group | Initial paths |
|---|---|
| Feeding-plan data model | `backend/prisma/`, `backend/src/feeding-plans/` |
| Feeding-plan API | `backend/src/feeding-plans/`, `backend/src/animals/`, `backend/src/common/authorization/`, `backend/test/` |
| Animal feeding-plan interface | `frontend/src/features/feeding-plans/`, `frontend/src/features/animals/`, `frontend/src/shared/` |
| Tests, documentation, and validation | `backend/src/feeding-plans/`, `backend/test/`, `frontend/src/features/feeding-plans/`, `frontend/src/features/animals/`, `specs/2026-06-30-feeding-plans/` |
| Immutable-plan amendment | `backend/src/feeding-plans/`, `backend/test/`, `frontend/src/features/feeding-plans/`, `frontend/src/features/animals/`, `specs/2026-06-30-feeding-plans/`, `CHANGELOG.md` |

Use the paths for the active task group rather than loading every path in this
file. Files imported from another folder or failures that point outside these
boundaries are evidence for a path-boundary expansion.

## Path boundary changes

- The 2026-07-01 immutable-plan amendment added the feeding-plan API, animal
  interface, focused test, specification, and changelog paths listed in the
  amendment task-group row.
