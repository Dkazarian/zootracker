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

- [ ] A task stores its identifier, plan relation, scheduled due date, status,
  optional completion data, last modifier, and timestamps.
- [ ] The task does not duplicate `animalId` or feeding-plan definition fields.
- [ ] `feedingPlanId` and `scheduledDueDate` are unique together.
- [ ] An active plan cannot have more than one non-completed task.
- [ ] `FeedingPlan.nextDueDate` is removed and scheduling state is not
  duplicated.
- [ ] Existing active plans receive one `AVAILABLE` task using their previous
  next-due value.
- [ ] Completed tasks remain readable through archived plans, animals, and
  deactivated personnel.
- [ ] The migration and Prisma Client generation succeed against an empty test
  database.

## Plan creation and archiving

- [ ] Creating a feeding plan creates its first `AVAILABLE` task with the
  submitted initial date.
- [ ] Plan and initial-task creation happen in one transaction.
- [ ] Failed task creation leaves no feeding plan behind.
- [ ] Plan responses and the interface derive `Next feeding` and due state from
  the current task.
- [ ] Archiving a plan removes its current non-completed task.
- [ ] Archiving a plan preserves its completed tasks and history.

## Completion transaction

- [ ] A keeper can complete an available task for an active plan and animal.
- [ ] An administrator can complete it through the same business workflow.
- [ ] Completion does not require or create a claim.
- [ ] `completedAt` defaults to the current time when omitted.
- [ ] Valid backdated completion is accepted.
- [ ] Future completion and dates before `scheduledDueDate` are rejected.
- [ ] Notes are optional and accepted when present.
- [ ] Client-supplied status and accountability fields are rejected.
- [ ] Completion sets the authenticated user as completer and last modifier.
- [ ] Completing the current task and creating its successor happen in one
  transaction.
- [ ] Failure to complete leaves no successor; failure to create the successor
  leaves the current task available.
- [ ] On-time completion schedules the successor from the completed task's date
  and plan recurrence.
- [ ] Late completion advances repeatedly until the successor is after the
  completion time.
- [ ] Due calculation uses the configured zoo timezone and plan period.
- [ ] Repeated completion returns a useful conflict response.
- [ ] Concurrent completion requests complete once and create one successor.

## History and corrections

- [ ] Unauthenticated history requests return HTTP `401`.
- [ ] Authenticated personnel can retrieve completed tasks for an animal.
- [ ] History is ordered by `completedAt` descending.
- [ ] History includes scheduled and completion dates, plan details, notes,
  completer, and last modifier.
- [ ] Archived relations remain readable through authorized history flows.
- [ ] Date-only API values use ISO `yyyy-mm-dd`, timestamps use ISO 8601, and
  user-facing calendar dates use `dd/mm/yyyy`.
- [ ] Keepers and administrators can correct completion time and notes.
- [ ] Corrections preserve plan, scheduled date, status, and original
  completer.
- [ ] Corrections update the last modifier and modification timestamp.
- [ ] Invalid corrected completion times are rejected.
- [ ] Corrections do not change or replace the current available task.

## Undoing completion

- [ ] Administrators can undo the latest completed task after confirmation.
- [ ] Keepers cannot undo completion through the interface or direct API.
- [ ] Undo is rejected when a later completed task exists.
- [ ] Undo atomically removes the successor and restores the selected task to
  `AVAILABLE`.
- [ ] Restoring clears completion-specific fields.
- [ ] Failure during undo leaves both tasks unchanged.
- [ ] The restored task can be completed again.

## Frontend and browser

- [ ] Active plans show their current task's next-feeding date and due state.
- [ ] An understandable completion action is available to keepers and
  administrators.
- [ ] Completion supports current or valid backdated time and optional notes.
- [ ] Successful completion refreshes the plan's current task and history
  without a full-page reload.
- [ ] Empty, loading, validation, conflict, mutation, and general failure states
  are understandable.
- [ ] History displays the required task, plan, completion, and accountability
  details.
- [ ] Correction controls expose only supported fields.
- [ ] Only administrators see the undo-completion control, and it requires
  confirmation.
- [ ] No queue, availability filter, claim, release, expiration, or claimant
  controls are exposed.
- [ ] Core keeper and administrator workflows work with keyboard controls.
- [ ] Core workflows fit a narrow mobile viewport without horizontal overflow.
- [ ] Tested workflows produce no unexpected browser console warnings or
  errors.

## Security and data handling

- [ ] Every feeding-task route requires authentication.
- [ ] Backend authorization protects completion, correction, and undo
  independently of interface visibility.
- [ ] Request validation rejects unexpected fields.
- [ ] Responses and logs contain no credentials, cookies, secrets, session
  values, or full database connection strings.
- [ ] No environment or credential file is included in phase changes.

## Full repository validation

Run from the repository root:

- [ ] `npm run format:check`
- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm test`
- [ ] `npm run build`
- [ ] All PostgreSQL-backed integration and API suites
- [ ] Clean test-database migration and Prisma Client generation

## Merge criteria

- [ ] Every applicable validation item passes.
- [ ] Each active plan has one current task and each scheduled occurrence is
  unique.
- [ ] Plan creation, completion, archiving, and undo preserve task-chain
  consistency transactionally.
- [ ] Completed tasks provide history and required accountability.
- [ ] Duplicate and concurrent completion are prevented.
- [ ] Phase 7 queues, filters, and claims remain unimplemented.
- [ ] `requirements.md`, `paths.md`, `plan.md`, and `validation.md` agree with
  the implementation.

## Validation results

Record dated results here after validation is performed.
