# Phase 5: Feeding Plans - Context Scope

## Status

Phase 5 is active. Implementation and most validation are complete, but the
remaining changes and final validation must pass before the roadmap phase
receives `✅`.

## Phase-wide context

- `specs/2026-06-30-feeding-plans/`

## Task-group boundaries

| Task group | Initial paths |
|---|---|
| Feeding-plan data model | `backend/prisma/`, `backend/src/feeding-plans/` |
| Feeding-plan API | `backend/src/feeding-plans/`, `backend/src/animals/`, `backend/src/common/authorization/`, `backend/test/` |
| Animal feeding-plan interface | `frontend/src/features/feeding-plans/`, `frontend/src/features/animals/`, `frontend/src/shared/` |
| Tests, documentation, and validation | `backend/src/feeding-plans/`, `backend/test/`, `frontend/src/features/feeding-plans/`, `frontend/src/features/animals/`, `specs/2026-06-30-feeding-plans/` |

Use the paths for the active task group rather than loading every path in this
file. Files imported from another folder or failures that point outside these
boundaries are evidence for a scope expansion.

## Out of scope

- Feeding records and feeding history
- Feeding assignments, queues, claims, and claim expiration
- Weight history and analytics
- Notifications, inventory, and veterinary records
- Service-to-service authentication

## Scope expansions

None recorded.
