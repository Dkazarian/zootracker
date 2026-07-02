# Animal, Personnel, and Feeding Plan Backend Refactor - Validation

## Focused automated validation

Run from the repository root after each task group:

### Animals

```powershell
npm test --workspace backend -- --runInBand animals
npm run test:animals:e2e
```

### Personnel

```powershell
npm test --workspace backend -- --runInBand personnel
npm run test:personnel:e2e
```

### Feeding plans

```powershell
npm test --workspace backend -- --runInBand feeding-plans
npm run test:feeding-plans:e2e
```

The API suites require the isolated `zootracker_test` PostgreSQL database.

## Final automated validation

Run from the repository root:

```powershell
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
```

All commands must succeed before the refactor is complete.

## Architecture validation

1. ✅ Confirm each feature module registers its repository provider.
2. ✅ Confirm controllers contain only HTTP-boundary concerns and call services.
3. ✅ Confirm services contain business rules and workflow coordination but no
   direct Prisma queries.
4. ✅ Confirm repositories own Prisma selections, filters, ordering, reads,
   writes, and transactions without deciding authorization or throwing NestJS
   HTTP exceptions.
5. ✅ Confirm DTO classes remain the validated HTTP inputs.
6. ✅ Confirm service methods accept plain feature-owned `Input` types rather than
   depending on DTO classes.
7. ✅ Confirm repository operations accept clearly named `Data` or `Query` types.
8. ✅ Confirm mappers explicitly convert persistence records and application
   values without hiding database calls or business workflows.
9. ✅ Confirm API responses expose no Prisma-only fields, Better Auth internals,
   passwords, sessions, or credential data.
10. ✅ Confirm no generic base repository, mapper framework, or unjustified shared
    abstraction was introduced.

## Animal behavior validation

1. ✅ Confirm keepers can list and view active animals but cannot request archived
   animals.
2. ✅ Confirm administrators can list and view active, archived, or all animals.
3. ✅ Confirm search still matches name, species, and the currently supported
   location behavior, with the existing ordering.
4. ✅ Confirm create and update preserve nullable fields and do not replace omitted
   update fields.
5. ✅ Confirm future birth and arrival dates are rejected.
6. ✅ Confirm an arrival date earlier than the date of birth is rejected,
   including updates combined with stored values.
7. ✅ Confirm an empty update is rejected.
8. ✅ Confirm missing animals return the existing not-found response.
9. ✅ Confirm archived animals cannot be edited or archived twice.
10. ✅ Confirm archiving sets the archive timestamp without deleting the animal.

## Personnel behavior validation

1. ✅ Confirm only administrators can access personnel endpoints.
2. ✅ Confirm personnel remain ordered by name and email and responses contain
   only the approved safe fields.
3. ✅ Confirm account creation normalizes name and email, delegates credential
   creation to Better Auth, and returns the created safe personnel response.
4. ✅ Confirm duplicate emails produce the existing conflict response before or
   after a Better Auth creation failure without leaking internal details.
5. ✅ Confirm missing personnel return the existing not-found response.
6. ✅ Confirm an administrator cannot deactivate their own account.
7. ✅ Confirm the last active administrator cannot be deactivated, including
   concurrent lifecycle attempts protected by the advisory lock.
8. ✅ Confirm deactivation marks the account inactive, records the existing ban
   reason, revokes all sessions, and preserves the user.
9. ✅ Confirm reactivation clears the lifecycle fields without changing the
   account role, credentials, or history.
10. ✅ Confirm repeated deactivate or reactivate requests return the existing
    conflict responses.
11. ✅ Confirm an invalid stored role produces the existing safe internal error
    rather than an invalid API response.

## Feeding-plan behavior validation

1. ✅ Confirm authenticated keepers and administrators can list, create, update,
   and archive plans under the existing routes.
2. ✅ Confirm plans remain ordered by next-due date, period, and name and include
   creator and last-modifier summaries.
3. ✅ Confirm keepers cannot view plans for an archived animal while the existing
   administrator visibility remains unchanged.
4. ✅ Confirm plans cannot be created or changed for missing or archived animals.
5. ✅ Confirm missing, archived, or animal-mismatched plans produce the existing
   not-found or conflict responses.
6. ✅ Confirm create and update map only approved fields and preserve omitted
   update values.
7. ✅ Confirm an empty update is rejected.
8. ✅ Confirm invalid calendar dates produce the existing validation response.
9. ✅ Confirm date-only response formatting and upcoming/due calculations still
   use the configured zoo timezone.
10. ✅ Confirm creator attribution is preserved and last-modifier attribution is
    updated from the authenticated user.
11. ✅ Confirm archiving sets the archive timestamp without deleting the plan and
    archived plans leave active list results.

## Regression and scope check

1. ✅ Compare the OpenAPI-visible route methods, paths, request fields, response
   fields, and authorization metadata before and after the refactor.
2. ✅ Confirm the Prisma schema and migrations are unchanged.
3. ✅ Confirm generated Prisma files are unchanged.
4. ✅ Confirm frontend files and behavior are unchanged.
5. ✅ Confirm no package dependency or script changes were introduced.
6. ✅ Confirm feeding history and unrelated features are unchanged.
7. ✅ Confirm no secrets, credentials, cookies, session values, or connection
   strings appear in the diff or logs.

## Validation results

### Task Group 1 - Animals

Passed on 2026-07-01:

- `npm test --workspace backend -- --runInBand animals`
  - 2 suites passed
  - 21 tests passed
- `npm run test:animals:e2e`
  - 1 suite passed
  - 4 tests passed against PostgreSQL
- `npm run typecheck --workspace backend`
- `npm run lint --workspace backend`
- `git diff --check`

### Task Group 2 - Personnel

Passed on 2026-07-01:

- `npm test --workspace backend -- --runInBand personnel`
  - 2 suites passed
  - 11 tests passed
- `npm run test:personnel:e2e`
  - 1 suite passed
  - 6 tests passed against PostgreSQL

### Task Group 3 - Feeding plans

Passed on 2026-07-01:

- `npm test --workspace backend -- --runInBand feeding-plans`
  - 3 suites passed
  - 12 tests passed
- `npm run test:feeding-plans:e2e`
  - 1 suite passed
  - 5 tests passed against PostgreSQL

### Task Group 4 - Cross-feature verification

Passed on 2026-07-01:

- `npm run lint`
- `npm run typecheck`
- `npm run format:check`
- `npm test`
  - frontend: 3 suites and 27 tests passed
  - backend: 12 suites and 63 tests passed
  - generic backend API suite: 1 suite and 3 tests passed; database-gated
    suites were skipped by that generic command and had already passed through
    the three focused PostgreSQL commands above
- `npm run build`
- `npm run test:auth:e2e`
  - 1 suite passed
  - 4 tests passed against PostgreSQL
- `git diff --check`
- Architecture inspection found no direct Prisma or HTTP DTO dependencies in
  the three refactored services.

The repository-wide formatting baseline was normalized with `npm run format`.
All required checks pass.

## Merge criteria

The refactor is ready to merge when:

- all focused and final automated checks pass;
- animal, personnel, and feeding-plan API behavior remains compatible;
- each feature follows the approved controller, service, repository, mapper,
  and type boundaries;
- repository and service responsibilities are independently tested;
- no schema, migration, frontend, authentication-strategy, or product behavior
  changes are present; and
- `requirements.md`, `paths.md`, `plan.md`, and `validation.md` agree with the
  implementation.
