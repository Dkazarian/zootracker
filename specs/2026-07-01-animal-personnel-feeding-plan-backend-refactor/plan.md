# Animal, Personnel, and Feeding Plan Backend Refactor - Implementation Plan

## Execution rules

- Implement only one task group at a time.
- Read the task group's paths from `scope.md` and avoid broad repository scans.
- Preserve existing public behavior and error messages.
- Do not discard or regenerate already-correct uncommitted work. Review it
  incrementally against the requirements and repair only what is missing or
  incorrect.
- Do not rewrite code merely for stylistic consistency.
- Run the task group's focused checks from `validation.md` when its code and
  tests are complete.
- Continue to the next task group after reporting its changes and required
  validation results.
- Mark a step with `✅` only after its implementation and directly relevant
  validation succeed.

## Testing strategy

- Service unit tests mock the feature repository and verify business decisions,
  workflow coordination, mappings, and application errors.
- Repository unit tests mock `PrismaService` and verify selections, filters,
  ordering, writes, and transaction delegation.
- PostgreSQL-backed feature API tests verify real persistence behavior,
  transaction behavior, advisory-lock safeguards, and unchanged HTTP
  contracts.
- Do not duplicate the same implementation detail across service, repository,
  and API tests when a lower-level test already provides sufficient coverage.

## Task Group 1 - Animal boundaries

1. ✅ Review the existing uncommitted animal changes against `requirements.md`
   and restore any behavior lost during the refactor without replacing
   already-correct changes.
2. ✅ Define feature-owned animal `Input`, `Data`, `Query`, internal record, and
   `Response` types needed by the controller, service, repository, and mappers.
3. ✅ Move animal filtering, ordering, reads, creates, updates, and archive writes
   into `AnimalsRepository`.
4. ✅ Add explicit mappings from create and update inputs to persistence data and
   from animal records to safe responses.
5. ✅ Keep role checks, empty-update checks, date validation, archive rules, and
   application exceptions in `AnimalsService`.
6. ✅ Register the repository in `AnimalsModule` and preserve every animal HTTP
   contract.
7. ✅ Update animal service tests to mock the repository and cover all preserved
   business rules.
8. ✅ Add focused repository tests for active and archived visibility, search,
   ordering, writes, and selections.
9. ✅ Run the focused animal unit and PostgreSQL-backed API checks.

## Task Group 2 - Personnel boundaries

1. ✅ Define feature-owned personnel `Input`, `Data`, `Query`, internal record,
   and `Response` types where each boundary needs them.
2. ✅ Move safe selections, ordered reads, email and identifier lookups, lifecycle
   writes, session deletion, active-administrator counts, transactions, and the
   advisory lock into `PersonnelRepository`.
3. ✅ Expose a feature-owned lifecycle transaction callback from the repository.
   The callback receives transaction-scoped personnel repository operations,
   not a Prisma transaction client. `PersonnelService` uses those operations to
   decide self-deactivation, last-administrator, and state-transition rules
   while all Prisma calls and the advisory lock remain inside the repository.
4. ✅ Add explicit mappings from personnel records to safe responses, including
   stored-role validation.
5. ✅ Keep Better Auth account creation, normalization, workflow coordination,
   business rules, and application exceptions in `PersonnelService`.
6. ✅ Register the repository in `PersonnelModule` and preserve every personnel
   HTTP contract.
7. ✅ Update personnel service tests to mock the repository and cover creation,
   duplicate handling, lifecycle rules, invalid roles, and error translation.
8. ✅ Add focused repository tests for safe selection, ordering, lifecycle
   transactions, advisory locking, session revocation, and state writes.
9. ✅ Run the focused personnel unit and PostgreSQL-backed API checks.

## Task Group 3 - Feeding-plan boundaries

1. ✅ Define feature-owned feeding-plan `Input`, `Data`, `Query`, internal record,
   and `Response` types needed by each boundary.
2. ✅ Move animal-state reads, plan reads, relation selections, ordered lists,
   creates, updates, and archive writes into `FeedingPlansRepository`.
3. ✅ Add explicit mappings from create and update inputs to persistence data and
   from plan records plus already-calculated timing values to responses.
4. ✅ Keep visibility and mutability rules, empty-update checks, date parsing,
   timezone-aware status calculations, audit coordination, and application
   exceptions in `FeedingPlansService`. The service calls
   `getFeedingPlanTiming`; the mapper only assembles its result into the
   response.
5. ✅ Register the repository in `FeedingPlansModule` and preserve every
   feeding-plan HTTP contract.
6. ✅ Update feeding-plan service tests to mock the repository and cover all
   preserved business and scheduling rules.
7. ✅ Add focused repository tests for relation selections, active filtering,
   ordering, supporting animal reads, and plan writes.
8. ✅ Run the focused feeding-plan unit and PostgreSQL-backed API checks.

## Task Group 4 - Cross-feature verification

1. ✅ Confirm controllers depend only on services and continue to accept the
   existing validated DTOs.
2. ✅ Confirm services contain no direct Prisma queries and repositories contain
   no authorization decisions or NestJS HTTP exceptions.
3. ✅ Confirm DTO, `Input`, `Data`, `Query`, internal record, and `Response` names
   consistently describe their boundaries.
4. ✅ Run backend formatting, linting, type-checking, unit tests, API integration
   tests, and the production build.
5. ✅ Run the repository-wide final validation required by `AGENTS.md`.
6. ✅ Review the final diff for accidental API, schema, migration, generated-code,
   frontend, dependency, and unrelated changes.
7. ✅ Record validation results in `validation.md`.
8. ✅ Add `✅` only to steps that are implemented and directly validated.

## Completion rule

No task group is complete merely because files exist. Its relevant focused
tests must pass, behavior must remain compatible with the approved feature
requirements, and any necessary scope expansion must be documented and
approved.
