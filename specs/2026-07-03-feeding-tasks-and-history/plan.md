# Phase 6: Feeding Tasks and History - Implementation Plan

Follow the task groups in order. Add a checkmark only after the step is
implemented and its directly relevant checkpoint passes.

## Task Group 1 - Feeding-task schema and migration

1. [x] Add `FeedingTaskStatus` with the Phase 6 states `AVAILABLE` and
   `COMPLETED`.
2. [x] Add the Prisma `FeedingTask` model with:
   - generated identifier;
   - feeding-plan relation;
   - date-only `scheduledDueDate`;
   - status;
   - nullable completer, completion time, and notes;
   - last-modifier relation; and
   - creation and update timestamps.
3. [x] Add the inverse feeding-task relations to `FeedingPlan` and `User`.
4. [x] Add the unique constraint on `(feedingPlanId, scheduledDueDate)` and
   indexes for current-task and completed-history queries.
5. [x] Create a migration that:
   - creates the task enum, table, constraints, and indexes;
   - inserts one `AVAILABLE` task for every active feeding plan using its
     existing `nextDueDate`; and
   - removes `FeedingPlan.nextDueDate` and its obsolete indexes only after the
     backfill.
6. [x] Confirm the existing seed creates no feeding plans and needs no
   task-specific change.
7. [x] Regenerate Prisma Client without editing generated files manually.
8. [ ] Add focused persistence coverage for the unique occurrence key,
   required relations, active-plan backfill, and preservation through archived
   relations.

### Task Group 1 checkpoint

- [x] Prisma Client generation succeeds.
- [x] The migration applies from an empty isolated test database.
- [ ] Backend type-checking and focused persistence tests pass.

## Task Group 2 - Adapt feeding-plan creation, listing, and archiving

1. [x] Replace the feeding-plan creation request's `nextDueDate` with an
   `initialDueDate` field used only to create the first task.
2. [x] Create the plan and its first `AVAILABLE` task in one repository
   transaction.
3. [x] Return `currentTask` on active plan responses with its identifier,
   scheduled due date, and status; return `null` for archived plans.
4. [x] Derive each active plan's upcoming/due status and minutes past due from
   `currentTask.scheduledDueDate`, the plan period, current time, and configured
   zoo timezone.
5. [x] Order active plans by the current task's scheduled date, then period and
   plan name.
6. [x] Archive a plan and remove its current non-completed task atomically while
   retaining completed tasks.
7. [x] Update feeding-plan DTOs, records, mappers, repository methods, service
   tests, repository tests, and PostgreSQL API coverage for the new aggregate.
8. [x] Update the feeding-plan seed and frontend contract fixtures from
   `nextDueDate` to `initialDueDate` and `currentTask`.

### Task Group 2 checkpoint

- [x] Focused feeding-plan backend tests pass.
- [x] The PostgreSQL feeding-plan API suite passes.
- [x] Backend linting and type-checking pass.

## Task Group 3 - Feeding-task completion and history API

1. [x] Add a feature-oriented `backend/src/feeding-tasks/` NestJS module with
   controller, service, repository, DTOs, mappers, and response types.
2. [x] Add authenticated task routes:
   - `POST /feeding-tasks/:taskId/completion` to complete an available task;
   - `PATCH /feeding-tasks/:taskId/completion` to correct completion time or
     notes;
   - `DELETE /feeding-tasks/:taskId/completion` for administrator-only undo;
     and
   - `GET /animals/:animalId/feeding-tasks?status=completed` for history.
3. [x] Validate completion and correction DTOs with server-controlled status
   and accountability fields excluded.
4. [x] Add a schedule helper that creates the successor date from the completed
   task's date and plan recurrence, advancing repeatedly when completion is
   late and applying the configured period and zoo timezone.
5. [x] Complete a task with a conditional state transition and create its
   successor in one transaction.
6. [x] Return conflict responses for an already completed task and ensure
   concurrent requests produce one completion and one successor.
7. [x] Return completed history in reverse completion order with plan details,
   completer, last modifier, and archived-reference visibility.
8. [x] Correct only completion time and notes, preserve the original completer
   and occurrence identity, update the last modifier, and leave the successor
   unchanged.
9. [x] Implement administrator undo as one transaction that verifies the task
   is the latest completion, deletes its successor, restores it to `AVAILABLE`,
   and clears completion-specific fields.
10. [x] Register the module in `AppModule` and add a focused
    `test:feeding-tasks:e2e` workspace/root script.
11. [ ] Add unit, repository, and PostgreSQL API tests for authorization,
    validation, not-found behavior, archived relations, duplicate and
    concurrent completion, rollback, corrections, history, and undo.

### Task Group 3 checkpoint

- [ ] Focused feeding-task unit and repository tests pass.
- [x] The PostgreSQL feeding-task API suite passes against the isolated test
  database.
- [x] Backend linting, type-checking, and build pass.

## Task Group 4 - Animal-profile task and history interface

1. [x] Add `frontend/src/features/feeding-tasks/` with API schemas, types,
   operations, query keys, formatting helpers, components, and tests.
2. [x] Update feeding-plan creation to send `initialDueDate`.
3. [x] Update active plan cards to read the `currentTask`, continue labeling
   its date `Next feeding`, and expose a completion action using its task ID.
4. [x] Add a completion form with current date/time default, valid backdating,
   optional notes, understandable validation, and ISO timestamp requests.
5. [x] Invalidate active-plan and completed-history queries after completion so
   the successor and history appear without a full-page reload.
6. [x] Add an animal feeding-history section with lazy or explicit loading,
   reverse chronological results, required plan and accountability details,
   and useful loading, empty, and error states.
7. [x] Add correction controls for keepers and administrators that expose only
   completion time and notes.
8. [x] Add administrator-only undo controls with confirmation and refresh both
   the restored current task and history.
9. [x] Remove the scheduled-date display from archived plan cards because an
   archived plan has no current task.
10. [ ] Add component tests for plan creation, current-task display, completion,
    successor refresh, history, correction, undo permissions, date conversion,
    and failure states.
11. [x] Confirm no queue, filter, claim, release, expiration, or claimant
    controls are introduced.

### Task Group 4 checkpoint

- [x] Focused feeding-plan and feeding-task frontend tests pass.
- [x] Frontend linting, type-checking, and build pass.
- [ ] The required keeper and administrator browser flows in `validation.md`
  pass without unexpected console errors.

## Task Group 5 - Documentation and final validation

1. [x] Update API and local testing documentation for task creation,
   completion, correction, history, and undo.
2. [x] Confirm the Prisma schema, ERD, roadmap, Phase 5 amendment, Phase 6
   requirements, and implementation use the same task terminology and
   lifecycle.
3. [ ] Mark the Phase 5 initial-task amendment checks only after the migration
   and plan workflow are validated.
4. [ ] Run every remaining automated, PostgreSQL-backed, manual, accessibility,
   and browser check in `validation.md`.
5. [x] Record dated validation results with exact commands and outcomes.
6. [ ] Mark Phase 6 complete in the roadmap only after every required
   validation and merge criterion passes.

### Final checkpoint

- [x] `npm run format:check`
- [x] `npm run lint`
- [x] `npm run typecheck`
- [x] `npm test`
- [x] `npm run build`
- [x] Clean isolated-database migration and Prisma Client generation
- [ ] All Phase 6 validation and merge criteria
