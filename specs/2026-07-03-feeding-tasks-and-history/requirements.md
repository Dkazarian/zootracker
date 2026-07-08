# Phase 6: Feeding Tasks and History - Requirements

## Goal

Represent every scheduled feeding as one completable task, let zoo personnel
confirm the work, and use completed tasks as the animal's feeding history.

Claims are not required for completion. Phase 7 will add lightweight advisory
claims to the same task rather than introducing a separate claim model.

## Scope

### Feeding tasks

- Store each feeding task with:
  - a system-generated identifier;
  - the exact immutable feeding plan that scheduled it;
  - its scheduled due date;
  - an `AVAILABLE` or `COMPLETED` status;
  - the personnel who completed it, when completed;
  - the completion date and time, when completed;
  - optional notes about the completed feeding;
  - the personnel who last modified it; and
  - creation and last-update timestamps.
- Derive the animal through the feeding plan rather than duplicating
  `animalId` on the task.
- Reference the immutable plan instead of copying its name, instructions,
  period, or recurrence into the task.
- Require `(feedingPlanId, scheduledDueDate)` to be unique.
- Require each active feeding plan to have exactly one non-completed task.
- Preserve completed tasks when referenced animals, plans, or personnel are
  archived or deactivated.

### Initial task and scheduling ownership

- Accept an initial scheduled date as part of feeding-plan creation.
- Create the feeding plan and its first `AVAILABLE` task atomically.
- Do not store `nextDueDate` on the feeding plan. The current non-completed
  task's `scheduledDueDate` is the source of truth for the next feeding.
- Migrate each existing active plan's current `nextDueDate` into one available
  task before removing the plan field.
- Derive the plan API and interface's `Next feeding` value and due status from
  the current task.
- Keep feeding-plan ordering fixed by plan name through the repository rather
  than sorting response objects in the service. Due-date ordering belongs to
  feeding tasks, not feeding plan definitions.
- When an active plan is archived, remove its current non-completed task while
  preserving all completed tasks linked to that plan.

### Completing a task

- Allow keepers and administrators to complete an available task belonging to
  an active feeding plan and active animal.
- Do not require a claim before completion in this phase.
- Complete the task only when personnel explicitly confirm that the feeding
  was performed.
- Default `completedAt` to the current time.
- Allow personnel to backdate `completedAt` when entering a feeding after it
  happened.
- Reject completion times in the future or on a calendar date before the
  task's scheduled due date.
- Allow optional free-text notes, such as food refusal or another observation.
  Otherwise, assume the feeding followed the plan's instructions.
- Set the task to `COMPLETED`, record the authenticated completer, and create
  the plan's next `AVAILABLE` task atomically.
- Calculate the successor from the completed task's scheduled date and the
  plan's recurrence.
- When completion is late, advance repeatedly until the successor falls after
  the completion time so the schedule does not drift.
- Return a useful conflict response when the task is already completed.
- Handle concurrent completion attempts so the task completes once and only
  one successor is created.

### Feeding history

- Allow authenticated personnel to view an animal's completed feeding tasks.
- Show completed tasks in reverse chronological order by completion time.
- Show the completion time, scheduled due date, plan name, plan instructions,
  feeding period, notes, completing personnel, and last modifier.
- Keep history readable when its animal, feeding plan, or personnel account is
  archived or deactivated.
- Display user-facing calendar dates as `dd/mm/yyyy`.
- Continue to use ISO `yyyy-mm-dd` for API date-only values and ISO 8601
  timestamps for date-and-time values.
- Provide clear loading, empty, and failure states.

### Correcting a completed task

- Allow keepers and administrators to correct a completed task's completion
  time and notes.
- Keep its feeding plan, scheduled due date, status, and original completing
  personnel immutable.
- Record the correcting personnel as the last modifier and update the
  last-update timestamp.
- Apply the same completion-time validation used when the task is completed.
- Do not recalculate or replace the current available task when historical
  details are corrected.

### Undoing an incorrect completion

- Allow administrators to remove the latest completion for a feeding plan.
- Require confirmation before undoing completion.
- Reject the operation when a later completed task exists.
- In one transaction:
  - remove the successor available task;
  - return the selected task to `AVAILABLE`; and
  - clear its completer, completion time, completion notes, and completion
    modification data.
- Make the restored task available to complete again.

### Authorization and integrity

- Require authentication for every feeding-task operation.
- Enforce permissions, allowed state transitions, validation, uniqueness, and
  transaction boundaries in the API rather than relying on the interface.
- Return useful not-found responses for missing animals, plans, tasks, or
  personnel references.
- Do not expose claim fields or claim actions before Phase 7.

### Quality and documentation

- Add automated coverage for task validation, plan creation, migration,
  permissions, duplicate and concurrent completion prevention, corrections,
  undo behavior, history ordering, archived-reference visibility, and atomic
  successor creation.
- Document task fields, status transitions, and completion transaction.
- Preserve formatting, linting, type-checking, testing, build, database-test,
  and CI checks.

## Decisions

- One `FeedingTask` represents one scheduled occurrence. A completed task is
  the feeding-history entry, so there is no separate `FeedingRecord` model.
- The task's generated identifier remains its primary key. The plan and
  scheduled date form an additional unique business key.
- Scheduling state belongs to tasks. Removing `FeedingPlan.nextDueDate` avoids
  synchronizing the same date in two places.
- Phase 6 uses `AVAILABLE` and `COMPLETED`. Phase 7 will add `CLAIMED` and
  nullable claimant fields to the same row.
- Feeding-plan lists use simple repository ordering because they are plan
  definitions. Feeding-task lists and future queues own due-date ordering.
  Pagination is intentionally not introduced for per-animal plan lists in this
  phase.
- Phase 7 will not introduce expiration or claim-attempt history. Releasing a
  claim will return the task to `AVAILABLE` and clear its claim fields.
- A future claimed task may be completed by another keeper after a warning.
  Separate claimant and completer fields will show whether that happened and
  how long the task took after being claimed.
- Due state is derived from the task's scheduled date, the plan's period, the
  configured zoo timezone, and the current time. It is not another stored task
  status.
- Original completer and last-modifier fields provide accountability without a
  complete edit-event audit log.
- Undoing the latest completion restores the existing task instead of leaving
  a gap in the schedule or creating a duplicate occurrence.
- The API is the authority for task state transitions, including clients added
  in later phases.

## Context

- Phase 5 introduced immutable feeding plans, recurrence, period-based due
  calculation, and an initial next-feeding date.
- This phase migrates that initial date into the first task and removes mutable
  schedule state from the plan.
- Phase 7 will add the shared queue, availability filters, and advisory claims
  to open tasks.
- Phase 8 dashboards will prioritize due and upcoming tasks without adding new
  scheduling rules.
- Phase 10 may add idempotency keys for external clients that retry completion
  requests; this phase still prevents duplicate completion of one task.

## Out of Scope

- Shared feeding queues and next-three previews
- Advisory claims, claim release, and claimant fields
- Claim expiration and claim-attempt history
- Dashboard filtering and prioritization
- Ad-hoc feeding tasks without a feeding plan
- Editing feeding-plan definitions or manually rescheduling tasks
- A complete event-by-event audit log
- Photos, attachments, structured food quantities, and inventory
- Notifications, reminders, analytics, dashboards, and exports
- Service-to-service authentication and request idempotency keys
