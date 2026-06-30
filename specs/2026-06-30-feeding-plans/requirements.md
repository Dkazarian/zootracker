# Phase 5: Feeding Plans - Requirements

## Goal

Give zoo staff a clear, repeatable description of what each animal should be
fed and when that feeding is next due.

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
  - the calendar date the plan is next due;
  - creation and last-update timestamps;
  - the personnel who created and last modified it; and
  - an optional archive timestamp.
- Allow an animal to have multiple active plans for different feeding routines.
- Require the animal to be active when a plan is created.
- Preserve plans when an animal or personnel account is archived.

### Feeding needs

- Allow authenticated personnel to view active feeding plans for an animal they
  are allowed to view.
- Use application-wide period start times in the zoo's configured timezone:
  - morning begins at 06:00;
  - afternoon begins at 12:00; and
  - evening begins at 18:00.
- Combine the plan's next-due date and period start to determine when it becomes
  due.
- Classify an active plan as upcoming before that point and due when that point
  has arrived or passed.
- Show how long a plan has been due instead of introducing a separate overdue
  threshold.
- Show the plan name, instructions, period, recurrence, next-due date, and
  current
  status.
- Provide clear loading, empty, and failure states.

### Plan administration

- Allow keepers and administrators to create and update plans for active
  animals.
- Allow keepers and administrators to archive a plan that is no longer used.
- Require confirmation before archiving a plan.
- Do not allow archived plans to be edited.
- Do not permanently delete plans.
- Enforce all permissions and validation in the API.

### Quality and documentation

- Add automated coverage for plan validation, status, permissions, creation,
  updating, archiving, and preservation.
- Document the plan fields, recurrence representation, and archive behavior.
- Preserve formatting, linting, type-checking, testing, build, database-test,
  and CI checks.

## Decisions

- Feeding instructions are natural language. Mixed meals are not forced into a
  single amount and unit.
- Optional notes about what happened during a feeding belong to the future
  feeding record, not the plan.
- Multiple active plans may belong to one animal because different feeding
  routines can have different instructions and timing.
- A plan repeats every positive whole number of calendar days. Hourly,
  weekly-day, and custom calendar schedules are not required.
- A plan stores a feeding period and next-due date. It does not generate
  separate occurrence records.
- All due calculations use one configured zoo timezone rather than each user's
  browser timezone.
- A plan is not assigned permanently to a keeper. Later phases will expose due
  plans through a shared queue.
- When feeding history is introduced, every feeding record must reference a
  plan. Ad-hoc feedings without a plan are not supported.
- Completing a planned feeding will later copy the plan instructions into the
  feeding record. This will preserve historical meaning if the plan changes.
- Completing a planned feeding will later advance the next-due date from the
  previous scheduled date by the recurrence interval, avoiding schedule drift
  when a feeding is recorded late.
- Archiving is used instead of deletion so future feeding history can continue
  to reference the plan.
- The API remains the authority for permissions and validation.

## Context

- Phase 4 established stable animal identifiers, active and archived animal
  visibility, and animal profile pages.
- Phase 6 will record completed feedings from these plans and advance their
  next-due times.
- Phase 7 will let keepers request and temporarily claim due plans from a shared
  queue.
- Future API clients, including a possible WhatsApp service, must use the same
  plan and queue rules as the web interface.

## Out of Scope

- Feeding records and feeding history
- Notes about a particular completed feeding
- Advancing a plan by recording a feeding
- Feeding occurrences
- Exact per-plan feeding times
- Hourly, selected-weekday, and custom calendar schedules
- Permanent assignments to keepers
- Shared queues, temporary claims, and claim expiration
- Notifications and reminders
- Food inventory, recipes, nutrition, and purchasing
- Ad-hoc feedings without a plan
- Feeding analytics, exports, and dashboards
- Service-to-service authentication
