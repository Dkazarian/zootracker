# Phase 7: Feeding Timestamp Schedule Refactor - Plan

## ✅ Task Group 1 - Schema and migration

- [x] Update Prisma schema:
   - replace `FeedingTask.scheduledDueDate` with
     `scheduledDueAt DateTime @db.Timestamptz(3)`;
   - remove `FeedingPlan.period`;
   - keep `FeedingPlan.repeatEveryDays`.
- [x] Add a migration that converts existing task schedule dates plus plan period
   into `scheduledDueAt` using the configured zoo timezone assumption.
- [x] Drop obsolete date/period schedule indexes and add non-unique lookup/order
   indexes for `scheduledDueAt`.
- [x] Regenerate Prisma client.
- [x] Update schema/repository tests that assert selected fields, ordering, or
   persistence contracts.
- [x] Run focused backend typecheck and feeding-plan/feeding-task tests.

Checkpoint validation:

```powershell
npm.cmd run prisma:generate --workspace backend
npm.cmd run typecheck --workspace backend
powershell -ExecutionPolicy Bypass -File scripts/run-check.ps1 npm.cmd test --workspace backend -- --runInBand feeding-plans feeding-tasks
```

## ✅ Task Group 2 - Backend API and schedule behavior

- [x] Update feeding-plan create DTO/input from `initialDueDate` plus `period` to
   `initialDueAt`.
- [x] Update feeding-plan service, repository, mapper, and response types to use
   `scheduledDueAt`.
- [x] Update feeding-task service, repository, mapper, and response types to use
   `scheduledDueAt`.
- [x] Derive due/upcoming status directly from `scheduledDueAt` and current time.
- [x] Update completion validation to compare completion time against the scheduled
   due instant.
- [x] Update successor creation to preserve the same local wall-clock time while
   advancing by `repeatEveryDays`.
- [x] Confirm completion correction and administrator undo behavior still work
   with timestamp fields.
- [x] Run focused backend tests and database-backed feeding e2e tests.

Checkpoint validation:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/run-check.ps1 npm.cmd test --workspace backend -- --runInBand feeding-plans feeding-tasks
npm.cmd run test:feeding-plans:e2e --workspace backend
npm.cmd run test:feeding-tasks:e2e --workspace backend
```

## ✅ Task Group 3 - Frontend API and display adapter

- [x] Update frontend feeding-plan API schema/input to send `initialDueAt` and
   parse schedule timestamps as dates.
- [x] Keep the existing friendly form controls for date and morning/afternoon/
   evening selection.
- [x] Convert the form's date plus friendly option into `initialDueAt` before
   calling the API.
- [x] Update frontend feeding-task API schema to parse `scheduledDueAt`.
- [x] Update feeding-plan and feeding-history display code to format timestamps as
   user-facing `dd/mm/yyyy` dates.
- [x] Derive any displayed time or period hint from the timestamp rather than a
   stored backend period.
- [x] Update focused frontend tests for conversion, API payloads, and display.
- [x] Run focused frontend tests and typecheck.

Checkpoint validation:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/run-check.ps1 npm.cmd test --workspace frontend -- feeding
npm.cmd run typecheck --workspace frontend
```

## ✅ Task Group 4 - Documentation and final validation

- [x] Update the active phase `validation.md` with dated results from completed
   checks.
- [x] Update the entity relationship documentation if it still references
   `scheduledDueDate` or persisted feeding periods for plans/tasks.
- [x] Confirm no unrelated phase folders were edited.
- [x] Confirm no package dependency changes were introduced.
- [x] Run final repository validation.
- [x] Mark plan and validation items complete only after the corresponding checks
   pass.

Final validation:

```powershell
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
```

## ✅ Refactor checkpoint - Frontend component organization

- [x] Extract feeding-plan card, summary, active-list, archived-history,
  archive-confirmation, new-plan, and task-completion panels from
  `FeedingPlansSection`.
- [x] Move feeding-plan presentational components under
  `frontend/src/features/feeding-plans/components/`.
- [x] Extract animal archive confirmation and profile details from
  `AnimalDetailPage`.
- [x] Move animal presentational components under
  `frontend/src/features/animals/components/`.
- [x] Move feeding-plan management permission logic into a helper and pass
  boolean capabilities into `FeedingPlansSection` instead of role/archive state.
- [x] Keep this as an intermediate refactor checkpoint; further component
  cleanup may continue in later commits.
