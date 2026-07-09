# Phase 7: Feeding Timestamp Schedule Refactor - Validation

## Schema and migration validation

- [x] Prisma schema stores `FeedingTask.scheduledDueAt` as
  `DateTime @db.Timestamptz(3)`.
- [x] `FeedingTask.scheduledDueDate` no longer exists after the migration.
- [x] `FeedingPlan.period` no longer exists after the migration.
- [x] No feeding plan or feeding task table stores timezone or period.
- [x] Existing task rows migrate from date-plus-period schedule state to
  `scheduledDueAt`.
- [x] Prisma client generation succeeds.

## Backend API validation

- [x] Feeding-plan creation accepts `initialDueAt`.
- [x] Feeding-plan creation rejects `period`, `nextDueDate`, and
  `initialDueDate`.
- [x] Feeding-plan creation creates the first task with `scheduledDueAt`.
- [x] Feeding-plan responses expose current task `scheduledDueAt`.
- [x] Feeding-plan responses do not expose `period` or `scheduledDueDate`.
- [x] Feeding-task responses expose `scheduledDueAt`.
- [x] Feeding-task responses do not expose `scheduledDueDate` or plan `period`.
- [x] Due/upcoming status uses `scheduledDueAt` and current time.
- [x] Completion validation rejects future completion times and completion
  times before `scheduledDueAt`.
- [x] Successor task creation preserves the same local wall-clock time while
  advancing by `repeatEveryDays`.
- [x] Completion correction and administrator undo behavior remain unchanged
  apart from timestamp field names.
- [x] Authorization, not-found, conflict, and validation responses remain
  useful.

## Frontend validation

- [x] The feeding-plan form still presents a friendly date field and
  morning/afternoon/evening-style selector.
- [x] Frontend create-plan API functions send `initialDueAt`, not `period`,
  `nextDueDate`, or `initialDueDate`.
- [x] Frontend API schemas parse feeding schedule timestamps as dates.
- [x] Feeding-plan and feeding-history displays format user-facing dates as
  `dd/mm/yyyy`.
- [x] Any displayed time or period hint is derived from the timestamp.
- [x] Component tests cover timestamp conversion and display behavior.

## Frontend refactor checkpoint validation

- [x] `FeedingPlansSection` receives boolean capabilities instead of raw
  current-user role and animal archive state.
- [x] Feeding-plan presentational components live under
  `frontend/src/features/feeding-plans/components/`.
- [x] Animal detail presentational components live under
  `frontend/src/features/animals/components/`.
- [x] Animal detail and feeding plan sections keep mutation/query ownership in
  their page/section containers.
- [x] The refactor is intentionally not final; further component cleanup can
  continue in follow-up commits.

## Backend service-boundary refactor checkpoint validation

- [x] Feeding-plan and feeding-task repositories no longer call `prisma.animal`.
- [x] `AnimalsRepository.getAnimalById` fetches by id without role visibility
  options.
- [x] Feeding services depend on `AnimalsService` for animal existence/state
  checks.
- [x] `AnimalsService` does not contain role or permission-specific visibility
  decisions.
- [x] Animal service method names distinguish public response reads from
  internal record reads.

## Scheduled task creation ownership validation

- [x] `FeedingPlansRepository.create` no longer nests `feedingTasks.create`.
- [x] `FeedingPlansService.create` asks `FeedingTasksService` to create the
  first scheduled task.
- [x] `FeedingTasksService.complete` uses the same scheduled-task creation path
  for successor tasks.
- [x] Plan creation plus first task creation remains transaction-bound.
- [x] Task completion plus successor task creation remains transaction-bound.

## Focused automated checks

Run focused checks after implementation task groups:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/run-check.ps1 npm.cmd test --workspace backend -- --runInBand feeding-plans feeding-tasks
powershell -ExecutionPolicy Bypass -File scripts/run-check.ps1 npm.cmd test --workspace frontend -- feeding
npm.cmd run typecheck --workspace backend
npm.cmd run typecheck --workspace frontend
```

Run database-backed checks after schema and transaction work:

```powershell
npm.cmd run test:feeding-plans:e2e --workspace backend
npm.cmd run test:feeding-tasks:e2e --workspace backend
```

Before marking the phase complete, run from the repository root:

```powershell
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
```

## Validation results

- 2026-07-08: `npm.cmd run prisma:generate --workspace backend` passed.
- 2026-07-08: focused backend feeding plan/task unit tests passed
  (6 suites, 25 tests).
- 2026-07-08: focused frontend tests passed
  (`FeedingPlansSection.test.tsx`, `date-format.test.ts`; 16 tests).
- 2026-07-08: `npm.cmd run test:feeding-plans:e2e` passed
  (5 database-backed tests).
- 2026-07-08: `npm.cmd run test:feeding-tasks:e2e` passed
  (2 database-backed tests).
- 2026-07-08: `npm.cmd run format:check` passed.
- 2026-07-08: `npm.cmd run lint` passed.
- 2026-07-08: `npm.cmd run typecheck` passed.
- 2026-07-08: `npm.cmd test` passed
  (frontend 5 files/37 tests, backend 15 suites/78 tests, backend e2e skipped
  database-gated suites except default e2e).
- 2026-07-08: `npm.cmd run build` passed.
- 2026-07-09: `npm.cmd run typecheck --workspace frontend` passed after the
  frontend component extraction and capability-prop refactor. Full test suite
  was intentionally not rerun before this checkpoint commit.
- 2026-07-09: `npm.cmd test --workspace backend -- --runInBand animals feeding-plans feeding-tasks`
  passed after the backend service-boundary refactor (8 suites, 45 tests).
- 2026-07-09: `npm.cmd run format:check` passed.
- 2026-07-09: `npm.cmd run lint` passed.
- 2026-07-09: `npm.cmd run typecheck` passed.
- 2026-07-09: `npm.cmd test` passed
  (frontend 5 files/37 tests, backend 15 suites/77 tests, backend e2e default
  suite passed with database-gated suites skipped).
- 2026-07-09: `npm.cmd run build` passed.
- 2026-07-09: `npm.cmd test --workspace backend -- --runInBand feeding-plans feeding-tasks`
  passed after moving scheduled task creation ownership to `FeedingTasksService`
  (6 suites, 28 tests).
- 2026-07-09: `npm.cmd run typecheck --workspace backend` passed after moving
  scheduled task creation ownership to `FeedingTasksService`.
- 2026-07-09: `npm.cmd run lint --workspace backend` passed after moving
  scheduled task creation ownership to `FeedingTasksService`.
- 2026-07-09: `npm.cmd run format:check` passed after moving scheduled task
  creation ownership to `FeedingTasksService`.
- 2026-07-09: Final validation after scheduled task ownership refactor passed:
  `npm.cmd run format:check`, `npm.cmd run lint`, `npm.cmd run typecheck`,
  `npm.cmd test`, and `npm.cmd run build`.
- 2026-07-09: Database-backed feeding checks passed:
  `npm.cmd run test:feeding-plans:e2e` (5 tests) and
  `npm.cmd run test:feeding-tasks:e2e` (2 tests).
- 2026-07-09: Browser smoke passed against local dev server at
  `http://localhost:5173`; app redirected to `/login`, rendered the Zootracker
  sign-in screen, and reported no browser console errors.
