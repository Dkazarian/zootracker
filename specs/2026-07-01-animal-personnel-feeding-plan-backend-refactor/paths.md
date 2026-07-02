# Animal, Personnel, and Feeding Plan Backend Refactor - Implementation Paths

## Specification paths

- `specs/2026-07-01-animal-personnel-feeding-plan-backend-refactor/`
- `specs/2026-06-29-animal-registry/requirements.md`
- `specs/2026-06-29-personnel-and-roles/requirements.md`
- `specs/2026-06-30-feeding-plans/requirements.md`

## Task-group boundaries

| Task group | Editable paths | Supporting read-only context |
|---|---|---|
| Animal boundaries | `backend/src/animals/` | `backend/src/database/prisma.service.ts`, `backend/src/generated/prisma/`, `backend/test/animals-flow.e2e-spec.ts` |
| Personnel boundaries | `backend/src/personnel/` | `backend/src/auth/auth.ts`, `backend/src/common/authorization/`, `backend/src/database/prisma.service.ts`, `backend/src/generated/prisma/`, `backend/test/personnel-flow.e2e-spec.ts` |
| Feeding-plan boundaries | `backend/src/feeding-plans/` | `backend/src/config/environment.ts`, `backend/src/common/authorization/`, `backend/src/database/prisma.service.ts`, `backend/src/generated/prisma/`, `backend/test/feeding-plans-flow.e2e-spec.ts` |
| Cross-feature validation and documentation | `specs/2026-07-01-animal-personnel-feeding-plan-backend-refactor/` | `package.json`, `backend/package.json`, the three feature folders, and the three feature API test files |

Use only the paths for the active task group. Follow a direct import outside a
listed path only when it is needed to understand an existing contract.

## Expected files

The exact set may change during implementation, but the expected feature-local
work is:

### Animals

- `backend/src/animals/animals.repository.ts`
- `backend/src/animals/animal.mappers.ts`
- `backend/src/animals/animal.types.ts`
- `backend/src/animals/animals.service.ts`
- `backend/src/animals/animals.service.spec.ts`
- `backend/src/animals/animals.repository.spec.ts`
- `backend/src/animals/animals.module.ts`

### Personnel

- `backend/src/personnel/personnel.repository.ts`
- `backend/src/personnel/personnel.mappers.ts`
- `backend/src/personnel/personnel.types.ts`
- `backend/src/personnel/personnel.service.ts`
- `backend/src/personnel/personnel.service.spec.ts`
- `backend/src/personnel/personnel.repository.spec.ts`
- `backend/src/personnel/personnel.module.ts`

### Feeding plans

- `backend/src/feeding-plans/feeding-plans.repository.ts`
- `backend/src/feeding-plans/feeding-plan.mappers.ts`
- `backend/src/feeding-plans/feeding-plan.types.ts`
- `backend/src/feeding-plans/feeding-plans.service.ts`
- `backend/src/feeding-plans/feeding-plans.service.spec.ts`
- `backend/src/feeding-plans/feeding-plans.repository.spec.ts`
- `backend/src/feeding-plans/feeding-plans.module.ts`

## Excluded paths

- `frontend/`
- `backend/prisma/schema.prisma`
- `backend/prisma/migrations/`
- `backend/src/generated/`

## Path expansion rule

Imports, failing tests, or missing coverage may justify a proposed expansion.
Update this file and obtain approval before editing a shared feature, schema,
migration, API integration test, package script, or any path outside the
editable boundaries above.

## Path boundary changes

None recorded.
