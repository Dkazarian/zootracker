# Phase 5: Feeding Plans - Requirements

## Goal

Give zoo staff a clear, repeatable description of what each animal should be
fed and when its first scheduled feeding should occur.

This phase defines feeding work. Recording completed feedings and claiming work
belong to later phases.

## Scope

### Feeding plans

- Store each feeding plan with:
  - a system-generated identifier;
  - the animal the plan belongs to;
  - a required short name, such as `Morning feeding`;
  - required natural-language feeding instructions, such as
    `3 bananas and an apple`;
  - a required feeding period of `morning`, `afternoon`, or `evening`;
  - a required positive whole number of days between feedings;
  - creation and last-update timestamps;
  - the personnel who created and last modified it; and
  - an optional archive timestamp.
- Allow an animal to have multiple active plans for different feeding routines.
- Require the animal to be active when a plan is created.
- Preserve plans when an animal or personnel account is archived.
- Treat the animal, name, instructions, period, and recurrence as an immutable
  plan definition after creation.
- Accept an initial scheduled date when creating a plan and use it to create
  the plan's first available feeding task.
- Create the plan and its first task atomically.
- Keep scheduled dates on feeding tasks rather than duplicating mutable
  `nextDueDate` state on the feeding plan.
- Do not expose a general feeding-plan `PATCH` endpoint.
- Do not allow personnel to reschedule a task through the feeding-plan API.

### Feeding needs and plan history

- Allow authenticated personnel to view all feeding plans associated with an
  animal they are allowed to view.
- Present active plans with their current non-completed task as the animal's
  current feeding work.
- Present archived plans separately as plan history only when personnel request
  to see them.
- Do not fetch archived plan history with the animal's active plans; load it
  when the history section is expanded.
- Use `GET /animals/:animalId/feeding-plans` for active plans by default and
  `GET /animals/:animalId/feeding-plans?status=archived` for archived plans.
- Keep active feeding plans in a fixed catalog order by name, then creation
  date newest first. Due-date ordering belongs to feeding tasks, not feeding
  plan definitions.
- Keep archived plans in a fixed history order: archived date, then creation
  date, newest first.
- Do not add pagination to per-animal feeding-plan lists yet; introduce it
  later if a larger global collection, queue, or history endpoint needs it.
- Use application-wide period start times in the zoo's configured timezone:
  - morning begins at 06:00;
  - afternoon begins at 12:00; and
  - evening begins at 18:00.
- Combine the current task's scheduled due date and the plan's period start to
  determine when the task becomes due.
- Classify an active plan as upcoming before that point and due when that point
  has arrived or passed.
- Show how long a plan has been due instead of introducing a separate overdue
  threshold.
- Show the plan name, instructions, period, recurrence, current task's scheduled
  date, and derived due status.
- Label the current task's scheduled date as `Next feeding` in the interface.
- Default a new plan's initial task date to tomorrow.
- Display and enter feeding dates as `dd/mm/yyyy` while preserving ISO
  `yyyy-mm-dd` values in API requests.
- Do not classify archived plans as upcoming or due.
- Provide clear loading, empty, and failure states.

### Plan administration

- Allow keepers and administrators to create plans for active animals.
- Archive an active plan and create a new independent plan when its name,
  instructions, period, or recurrence must change.
- Remove the existing in-place update operation and its request contract.
- Allow authenticated personnel who can view the animal to inspect archived
  plans.
- Do not create a replacement relation or version chain between plans.
- Allow keepers and administrators to archive a plan that is no longer used.
- Require confirmation before archiving a plan.
- Do not allow archived plans to be edited.
- Keep archived plans readable even though they cannot be edited or returned as
  active feeding work.
- Do not permanently delete plans.
- Enforce all permissions and validation in the API.

### Quality and documentation

- Add automated coverage for plan validation, status, permissions, creation,
  immutability, archiving, history, and preservation.
- Document the plan fields, recurrence representation, and archive behavior.
- Preserve formatting, linting, type-checking, testing, build, database-test,
  and CI checks.

## Decisions

- Feeding instructions are natural language. Mixed meals are not forced into a
  single amount and unit.
- Optional notes about what happened during a feeding belong to its completed
  feeding task, not the plan.
- Multiple active plans may belong to one animal because different feeding
  routines can have different instructions and timing.
- A plan repeats every positive whole number of calendar days. Hourly,
  weekly-day, and custom calendar schedules are not required.
- A plan stores its immutable definition. Its scheduled occurrences are
  represented by feeding tasks.
- All due calculations use one configured zoo timezone rather than each user's
  browser timezone.
- A plan is not assigned permanently to a keeper. Later phases will expose due
  plans through a shared queue.
- Every feeding task references its exact immutable plan, so instructions and
  period do not need to be copied into the task.
- `feedingPlanId` plus `scheduledDueDate` uniquely identifies a scheduled
  occurrence.
- Completing a task creates its successor from the previous scheduled date and
  recurrence interval, avoiding schedule drift when completion is late.
- An active plan has one current non-completed task. The task is the source of
  truth for its next scheduled feeding.
- Feeding-plan ordering is fixed and performed by Prisma/PostgreSQL through
  the repository, so the service maps records to responses without owning list
  ordering.
- Archiving is used instead of deletion so future feeding history can continue
  to reference the plan.
- Archived and newly created plans remain independent records; the system does
  not infer or store a replacement relationship between them.
- The API remains the authority for permissions and validation.

## Context

- Phase 4 established stable animal identifiers, active and archived animal
  visibility, and animal profile pages.
- Phase 6 will introduce feeding tasks, migrate each active plan's existing
  next-due value into its first task, and make completed tasks the feeding
  history.
- Phase 7 will let keepers request and claim open tasks from a shared queue.
- Future API clients, including a possible WhatsApp service, must use the same
  plan and queue rules as the web interface.

## Out of Scope

- Completing tasks and feeding history
- Notes about a particular completed feeding
- Creating successor tasks after completion
- Manual task rescheduling
- General or partial in-place feeding-plan updates
- Exact per-plan feeding times
- Hourly, selected-weekday, and custom calendar schedules
- Permanent assignments to keepers
- Shared queues and advisory task claims
- Notifications and reminders
- Food inventory, recipes, nutrition, and purchasing
- Ad-hoc feedings without a plan
- Feeding analytics, exports, and dashboards
- Service-to-service authentication
