# Animal and Personnel Service Refactor

**Status:** Proposed

## Context

The animal and personnel services currently coordinate business rules and
access Prisma directly. Refactor them to make responsibilities easier to read,
test, and extend without changing application behavior.

This is a technical refactor, not a product feature or roadmap phase.

## Goals

- Keep feature services focused on application workflow and business
  decisions.
- Extract pure, independently testable business rules where that improves
  clarity.
- Centralize repeated feature-specific persistence operations when they have a
  meaningful shared interface.
- Preserve all existing API contracts, authorization rules, validation
  behavior, and database behavior.
- Make the upcoming personnel lifecycle amendment easier to implement without
  coupling that behavior to unrelated queries.

## Proposed Responsibilities

### Feature services

- Coordinate application workflows.
- Enforce authorization and business decisions.
- Translate repository results into application outcomes.
- Raise useful application-level errors.

### Repositories

- Encapsulate Prisma queries and persistence operations for one feature.
- Return domain data without deciding business policy.
- Avoid HTTP exceptions, authorization rules, and input validation.
- Remain feature-specific rather than introducing a generic base repository.

Possible files:

- `backend/src/animals/animals.repository.ts`
- `backend/src/personnel/personnel.repository.ts`

### Rules

- Hold pure business rules that do not require database access.
- Use explicit names rather than a generic `helpers.ts` dumping ground.

Possible files:

- `backend/src/animals/animal-rules.ts`
- `backend/src/personnel/personnel-rules.ts`

DTO shape and syntax validation should remain in NestJS DTOs. Rules that depend
on current database state, such as protecting the last active administrator,
should remain coordinated by the service and transaction rather than being
hidden in a generic helper.

## Constraints

- Do not change routes, request or response shapes, status codes, or visible
  behavior.
- Do not change the Prisma schema or add migrations.
- Do not add dependencies or generic abstraction layers.
- Do not weaken backend authorization or cookie-based authentication.
- Do not mix the refactor with implementation of personnel deactivation and
  reactivation unless the active specification is explicitly revised.
- Keep Prisma-generated files generated; never edit them by hand.

## Suggested Work Sequence

1. Extract and test pure animal rules.
2. Introduce an animal repository only for concrete repeated persistence
   operations.
3. Refactor the animal service to orchestrate those collaborators.
4. Extract and test pure personnel rules.
5. Introduce a personnel repository for safe personnel queries.
6. Keep Better Auth account operations behind an explicitly named
   feature-level collaborator rather than pretending they are Prisma
   repository operations.
7. Refactor the personnel service without changing behavior.
8. Run the complete validation suite after each feature refactor.

Animal and personnel work should be separate commits so each change is easy to
review and revert.

## Validation

From the repository root, all existing checks must continue to pass:

```powershell
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
npm run test:auth:e2e
npm run test:personnel:e2e
npm run test:animals:e2e
npm run test:feeding-plans:e2e
```

Additional focused tests should demonstrate that extracted pure rules and
repositories preserve the existing behavior.

### Test coverage by responsibility

- Add focused unit tests for every extracted pure rule, including valid values
  and important boundary or failure cases.
- Add unit tests for each new service workflow and its meaningful success,
  not-found, conflict, and authorization outcomes.
- Test repository methods against the isolated PostgreSQL test database so the
  tests verify real Prisma queries, filtering, ordering, and persistence.
- Do not add brittle unit tests that only assert a one-line repository wrapper
  called an identical mocked Prisma method.
- A trivial forwarding method may be covered through its service or integration
  test when a dedicated unit test would add no behavioral confidence.

## Review Checklist

- Does every new abstraction have a concrete responsibility?
- Is Prisma hidden only where doing so removes meaningful repetition?
- Are business rules still visible and testable?
- Are DTO validation, business validation, and persistence clearly separated?
- Does each new rule and service workflow have focused automated coverage?
- Are repository queries validated against PostgreSQL rather than only mocked?
- Did line count or indirection grow without improving readability?
- Are all API and authorization behaviors unchanged?

## Changelog

Add a short `CHANGELOG.md` entry only after the refactor is completed and
validated.
