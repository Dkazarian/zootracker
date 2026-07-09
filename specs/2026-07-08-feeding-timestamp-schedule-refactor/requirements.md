# Phase 7: Feeding Timestamp Schedule Refactor - Requirements

## Goal

Refactor the already-implemented feeding plan and feeding task schedule model
so due timing is stored and exchanged as exact timestamps instead of combining
date-only values with persisted feeding periods.

This phase follows the merged Feeding Tasks and History phase. It does not add
claims, dashboards, new task states, or a new feeding workflow.

## Scope

### Timestamp schedule storage

- Store feeding task due instants as PostgreSQL `timestamptz` values through
  Prisma `DateTime @db.Timestamptz(3)`.
- Replace `FeedingTask.scheduledDueDate` with `FeedingTask.scheduledDueAt`.
- Remove persisted `FeedingPlan.period`.
- Do not add a stored timezone field to feeding plans or feeding tasks.
- Keep `FeedingPlan.repeatEveryDays` as the recurrence interval.
- Keep the current task as the source of truth for the next scheduled feeding.
- Preserve completed tasks and archived feeding plans during the migration.

### API contract

- Change feeding-plan creation so the API receives an ISO 8601 timestamp field:
  `initialDueAt`.
- The feeding-plan creation API must not receive `period`,
  `initialDueDate`, or `nextDueDate`.
- Feeding-plan responses expose the current task's `scheduledDueAt`.
- Feeding-plan responses do not expose `period` or `scheduledDueDate`.
- Feeding-task responses expose `scheduledDueAt`.
- Feeding-task responses do not expose `scheduledDueDate` or plan `period`.
- Due/upcoming status is derived from `scheduledDueAt` and the current time.
- Completion validation rejects future completion times and completion times
  before the task's scheduled due instant.
- Successor tasks preserve the same local wall-clock time represented by the
  completed task's `scheduledDueAt` while advancing by `repeatEveryDays`.

### Frontend adapter behavior

- Keep the feeding-plan creation form visually similar to the existing form:
  - users still choose a calendar date;
  - users still choose a friendly morning, afternoon, or evening option.
- Treat morning/afternoon/evening as frontend-only input convenience.
- Convert the selected date and friendly option into `initialDueAt` before
  calling the API.
- Do not send `period`, `initialDueDate`, or `nextDueDate` to the API.
- Parse API schedule timestamps as dates in frontend API functions.
- Display user-facing feeding dates as `dd/mm/yyyy`.
- Where the UI needs a time or period hint, derive it from the timestamp
  instead of reading a stored period.
- Keep date-only API conventions for unrelated animal/profile fields.

### Data migration

- Migrate existing task rows from `scheduledDueDate` plus feeding plan `period`
  into `scheduledDueAt`.
- Use the configured zoo timezone assumption during migration conversion, but
  do not store that timezone in the database.
- Drop obsolete schedule indexes and recreate non-unique indexes for
  `scheduledDueAt` where useful for lookup and ordering.
- Because the product is still pre-release, local development data may be reset
  when validating the migration, but the committed migration should work from a
  clean migrated database.

## Decisions

- `timestamptz` is the source of truth for feeding schedule instants.
- Morning/afternoon/evening are UI conveniences, not persisted backend fields.
- Feeding tasks remain the schedule records; feeding plans keep recurrence and
  instructions, but no longer store a period.
- API clients, including the frontend and future external clients, send exact
  timestamps for schedule instants.

## Out of Scope

- Adding advisory claims or claimant fields
- New feeding task states
- Dashboard prioritization
- Permanent assignments to keepers
- Manual rescheduling endpoints
- Editing feeding-plan definitions in place
- Per-plan timezone storage
- A separate feeding-record model
- Food inventory, notifications, analytics, exports, photos, or attachments
