# Phase 3: Personnel and Roles - Context Scope

## Status

The original Phase 3 implementation is complete. The account-lifecycle
amendment in Task Groups 7-9 is planned but not yet implemented or validated.

## Phase-wide context

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
failures that point outside these boundaries are evidence for a scope
expansion.

## Out of scope

- Editing personnel profiles or changing roles
- Permanent account deletion
- Public registration, invitations, and password recovery
- Additional roles or custom permissions
- Personnel audit history and bulk operations
- Animal, feeding-plan, feeding-history, queue, weight, and analytics behavior

## Scope expansions

- `frontend/src/app/` was added to Task Groups 8 and 9 because the existing
  personnel styles and application-level personnel tests are colocated there.
- `README.md` and `CHANGELOG.md` were added because Task Group 9 explicitly
  requires personnel lifecycle documentation and a changelog update. Listing
  the root files avoids expanding the context boundary to the entire repository.
