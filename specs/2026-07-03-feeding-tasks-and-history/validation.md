# Phase 6: Feeding Tasks and History - Validation

Leave every item unchecked until the described behavior has been implemented
and the directly relevant check has passed.

## Validation checkpoints

- Run focused tests after each plan task group.
- Run affected-workspace linting and type-checking at task-group checkpoints.
- Run PostgreSQL-backed API tests after schema, transaction, or repository
  changes.
- Run the full repository validation suite before marking the phase complete.
- Do not rerun an unchanged successful focused check unless relevant code has
  changed.

## Schema and migration

- [x] A task stores its identifier, plan relation, scheduled due date, status,
  optional completion data, last modifier, and timestamps.
- [x] The task does not duplicate `animalId` or feeding-plan definition fields.
- [x] `feedingPlanId` and `scheduledDueDate` are unique together.
- [x] An active plan cannot have more than one non-completed task.
- [x] `FeedingPlan.nextDueDate` is removed and scheduling state is not
  duplicated.
- [x] Existing active plans receive one `AVAILABLE` task using their previous
  next-due value.
- [x] Completed tasks remain readable through archived plans, animals, and
  deactivated personnel.
- [x] The migration and Prisma Client generation succeed against an empty test
  database.

## Plan creation and archiving

- [x] Creating a feeding plan creates its first `AVAILABLE` task with the
  submitted initial date.
- [x] Plan and initial-task creation happen in one transaction.
- [x] Failed task creation leaves no feeding plan behind.
- [x] Plan responses and the interface derive `Next feeding` and due state from
  the current task.
- [x] Feeding-plan lists use the fixed repository order for active and archived
  plans.
- [x] The service delegates ordering to the repository.
- [x] Archiving a plan removes its current non-completed task.
- [x] Archiving a plan preserves its completed tasks and history.

## Completion transaction

- [x] A keeper can complete an available task for an active plan and animal.
- [x] An administrator can complete it through the same business workflow.
- [x] Completion does not require or create a claim.
- [x] `completedAt` defaults to the current time when omitted.
- [x] Valid backdated completion is accepted.
- [x] Future completion and dates before `scheduledDueDate` are rejected.
- [x] Notes are optional and accepted when present.
- [x] Client-supplied status and accountability fields are rejected.
- [x] Completion sets the authenticated user as completer and last modifier.
- [x] Completing the current task and creating its successor happen in one
  transaction.
- [x] Failure to complete leaves no successor; failure to create the successor
  leaves the current task available.
- [x] On-time completion schedules the successor from the completed task's date
  and plan recurrence.
- [x] Late completion advances repeatedly until the successor is after the
  completion time.
- [x] Due calculation uses the configured zoo timezone and plan period.
- [x] Repeated completion returns a useful conflict response.
- [x] Concurrent completion requests complete once and create one successor.

## History and corrections

- [x] Unauthenticated history requests return HTTP `401`.
- [x] Authenticated personnel can retrieve completed tasks for an animal.
- [x] History is ordered by `completedAt` descending.
- [x] History includes scheduled and completion dates, plan details, notes,
  completer, and last modifier.
- [x] Archived relations remain readable through authorized history flows.
- [x] Date-only API values use ISO `yyyy-mm-dd`, timestamps use ISO 8601, and
  user-facing calendar dates use `dd/mm/yyyy`.
- [x] Keepers and administrators can correct completion time and notes.
- [x] Corrections preserve plan, scheduled date, status, and original
  completer.
- [x] Corrections update the last modifier and modification timestamp.
- [x] Invalid corrected completion times are rejected.
- [x] Corrections do not change or replace the current available task.

## Undoing completion

- [x] Administrators can undo the latest completed task after confirmation.
- [x] Keepers cannot undo completion through the interface or direct API.
- [x] Undo is rejected when a later completed task exists.
- [x] Undo atomically removes the successor and restores the selected task to
  `AVAILABLE`.
- [x] Restoring clears completion-specific fields.
- [x] Failure during undo leaves both tasks unchanged.
- [x] The restored task can be completed again.

## Frontend and browser

- [x] Active plans show their current task's next-feeding date and due state.
- [x] An understandable completion action is available to keepers and
  administrators.
- [x] Completion supports current or valid backdated time and optional notes.
- [x] Successful completion refreshes the plan's current task and history
  without a full-page reload.
- [x] Empty, loading, validation, conflict, mutation, and general failure states
  are understandable.
- [x] History displays the required task, plan, completion, and accountability
  details.
- [x] Correction controls expose only supported fields.
- [x] Only administrators see the undo-completion control, and it requires
  confirmation.
- [x] No queue, availability filter, claim, release, expiration, or claimant
  controls are exposed.
- [ ] Core keeper and administrator workflows work with keyboard controls.
- [x] Core workflows fit a narrow mobile viewport without horizontal overflow.
- [x] Tested workflows produce no unexpected browser console warnings or
  errors.

## Security and data handling

- [x] Every feeding-task route requires authentication.
- [x] Backend authorization protects completion, correction, and undo
  independently of interface visibility.
- [x] Request validation rejects unexpected fields.
- [x] Responses and logs contain no credentials, cookies, secrets, session
  values, or full database connection strings.
- [x] No environment or credential file is included in phase changes.

## Full repository validation

Run from the repository root:

- [x] `npm run format:check`
- [x] `npm run lint`
- [x] `npm run typecheck`
- [x] `npm test`
- [x] `npm run build`
- [x] All PostgreSQL-backed integration and API suites
- [x] Clean test-database migration and Prisma Client generation

## Merge criteria

- [ ] Every applicable validation item passes.
- [x] Each active plan has one current task and each scheduled occurrence is
  unique.
- [x] Plan creation, completion, archiving, and undo preserve task-chain
  consistency transactionally.
- [x] Completed tasks provide history and required accountability.
- [x] Duplicate and concurrent completion are prevented.
- [x] Phase 7 queues, filters, and claims remain unimplemented.
- [x] `requirements.md`, `paths.md`, `plan.md`, and `validation.md` agree with
  the implementation.

## Validation results

### 2026-07-03 automated results

- [x] Prisma Client generation succeeded and all four migrations applied from
  empty against the isolated `zootracker_test` database.
- [x] Root formatting, linting, frontend and backend type-checking, all unit and
  component tests, generic E2E tests, and both production builds passed.
- [x] Frontend coverage passed with 33 tests across 5 files.
- [x] Backend unit coverage passed with 69 tests across 13 suites.
- [x] PostgreSQL-backed authentication, personnel, animal, feeding-plan, and
  feeding-task suites passed with 4, 6, 4, 5, and 2 tests respectively.
- [x] Feeding-task database coverage confirmed authentication, keeper
  completion, duplicate and concurrent completion protection, one successor,
  history, correction, administrator-only undo, and restoration.
- [ ] Browser validation remains pending because background localhost servers
  could not remain running in this execution environment.

### 2026-07-07 automated follow-up

- [x] Added focused feeding-task service tests for not-found history,
  completion accountability, archived/repeated/invalid completion rejection,
  correction, and undo outcome mapping.
- [x] Added focused feeding-task repository tests for completed-history
  ordering, conditional completion, successor creation, rollback before
  successor creation, and undo restoration.
- [x] Expanded feeding-plan component coverage for current-task completion,
  query refresh after completion, completed history, correction, keeper/admin
  undo visibility, and undo mutation errors.
- [x] `npm.cmd test --workspace backend -- feeding-tasks` passed with 12
  focused tests across 3 suites.
- [x] `npm.cmd test --workspace frontend -- FeedingPlansSection --run` passed
  with 11 focused component tests.
- [x] `npm.cmd run format:check`, `npm.cmd run lint`, `npm.cmd run typecheck`,
  `npm.cmd test`, and `npm.cmd run build` passed.
- [x] `npm.cmd run test:feeding-plans:e2e` and
  `npm.cmd run test:feeding-tasks:e2e` passed against PostgreSQL.
- [x] Follow-up feeding-plan ordering validation passed: `npm.cmd test --workspace
  backend -- feeding-plans`, `npm.cmd run typecheck`, and
  `npm.cmd run test:feeding-plans:e2e` confirmed fixed active-plan ordering
  by name, service-to-repository ordering delegation, and repository ordering.
- [x] Browser validation succeeded after keeping Vite alive with an open stdin
  stream and using `http://localhost:5173` to match the backend CORS origin.
  The browser pass confirmed administrator sign-in, administrator plan
  creation, administrator completion, history visibility, administrator-only
  undo visibility, keeper sign-in, keeper plan creation, keeper completion,
  keeper history visibility, and absence of keeper undo controls.
- [x] Narrow mobile viewport validation passed at `390x844`: the animal detail
  and feeding-plan/history workflows reported no horizontal overflow.
- [x] Console validation for the successful `localhost` browser workflows
  reported no relevant warning or error entries. Earlier `127.0.0.1` CORS
  attempts produced expected fetch errors and were excluded from the successful
  pass.
- [ ] Keyboard traversal remains pending: browser automation could not move
  focus with Tab in this environment, so a manual keyboard pass is still needed
  before checking the keyboard-control item and final merge criterion.
- [x] Root validation passed after the browser work: `npm.cmd run
  format:check`, `npm.cmd run lint`, `npm.cmd run typecheck`, `npm.cmd test`,
  and `npm.cmd run build`.
- [x] PostgreSQL-backed suites passed after the browser work:
  `npm.cmd run test:auth:e2e`, `npm.cmd run test:personnel:e2e`,
  `npm.cmd run test:animals:e2e`, `npm.cmd run test:feeding-plans:e2e`, and
  `npm.cmd run test:feeding-tasks:e2e`.
