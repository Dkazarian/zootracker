# Phase 3: Personnel and Roles - Implementation Paths

## Specification paths

- `specs/2026-06-29-personnel-and-roles/`

## Task-group boundaries

| Task group | Initial paths |
|---|---|
| Personnel lifecycle API | `backend/src/personnel/`, `backend/src/auth/`, `backend/src/common/authorization/`, `backend/src/database/`, `backend/prisma/`, `backend/test/` |
| Personnel lifecycle interface | `frontend/src/features/personnel/`, `frontend/src/features/auth/`, `frontend/src/shared/api/`, `frontend/src/shared/auth/`, `frontend/src/app/` |
| Lifecycle tests, documentation, and validation | `backend/src/personnel/`, `backend/src/auth/`, `backend/test/`, `frontend/src/features/personnel/`, `frontend/src/features/auth/`, `frontend/src/shared/api/`, `frontend/src/shared/auth/`, `frontend/src/app/`, `specs/2026-06-29-personnel-and-roles/` |

Root documentation required by Task Group 9:

- `README.md`
- `CHANGELOG.md`

Use only the paths for the active task group. Imports, requirements, or test
failures that point outside these boundaries are evidence for a path-boundary
expansion.

## Path boundary changes

- `frontend/src/app/` was added to Task Groups 8 and 9 because the existing
  personnel styles and application-level personnel tests are colocated there.
- `README.md` and `CHANGELOG.md` were added because Task Group 9 explicitly
  requires personnel lifecycle documentation and a changelog update.
