# Phase 5: Feeding Plans - Validation

The original results below remain the record of the first Phase 5 delivery.
The 2026-07-01 amendment validation at the end must pass before immutable plan
versions are considered complete.

## Automated Validation

From the repository root, all of the following must succeed:

1. Clean dependency installation
2. Prisma client generation
3. Clean migration of an empty test database
4. Formatting check
5. Frontend and backend linting
6. Frontend and backend type-checking
7. Frontend unit and component tests
8. Backend unit and PostgreSQL-backed integration tests
9. Frontend and backend production builds

## Data and API Validation

1. Request feeding-plan endpoints without a session and confirm HTTP `401`.
2. Sign in as a keeper and create two plans for one active animal.
3. Confirm the API derives creator and last modifier from the session and
   rejects supplied accountability fields.
4. Retrieve the animal's plans and confirm all required details are present.
5. Confirm plans are ordered by next-due date and then morning, afternoon, and
   evening period.
6. Confirm each period becomes due at its application-wide start time in the
   configured zoo timezone.
7. Confirm a plan is upcoming before its date-and-period boundary and remains
   due after that boundary, including on later dates.
8. Attempt missing or blank names and instructions, invalid periods, zero,
   negative, or fractional recurrence days, invalid dates, and unexpected
   fields and confirm useful responses.
9. Attempt to create a plan for an archived or missing animal and confirm the
   request is rejected.
10. Archive a plan, create an independent new plan, and confirm no relationship
    is stored or inferred between them.
11. Archive a plan and confirm it leaves active results but remains stored.
12. Attempt to edit an archived plan and confirm the request is rejected.
13. As an administrator, create and archive a plan and confirm
    accountability uses the administrator's identity.
14. Archive an animal with plans and confirm its plans remain stored.
15. Confirm no endpoint permanently deletes a feeding plan.

## Frontend Validation

1. Sign in as a keeper and open an active animal profile.
2. Confirm an animal without plans has a useful empty state.
3. Create a natural-language plan such as `3 bananas and an apple` and confirm
   it appears without a full page reload.
4. Create a second routine for the same animal and confirm both appear.
5. Confirm plan name, instructions, period, recurrence, next-due date, and
   status are displayed.
6. Archive a plan, create a new plan, and confirm the new active plan and old
   archived plan appear in their respective sections.
7. Trigger required-field, period, recurrence, and date validation and confirm
   the messages are understandable.
8. Archive a plan through a confirmation step and confirm it leaves active
   results.
9. Sign in as an administrator and confirm plans and their create and
   archive controls are available.
10. Complete the core plan flows using keyboard controls.
11. Repeat the core flows at a narrow mobile viewport and confirm there is no
    horizontal overflow.
12. Confirm there are no unexpected browser console errors.

## Security and Data Check

1. Confirm backend authorization protects every feeding-plan mutation.
2. Confirm hidden interface controls are not the only permission control.
3. Confirm request DTOs reject accountability and other unexpected fields.
4. Confirm feeding plans cannot be erased through the API.
5. Confirm archived relations do not remove feeding plans.
6. Confirm credentials, cookies, database URLs, and authentication secrets are
   absent from committed files and logs.

## Validation Results - 2026-06-30

- Reset the isolated `zootracker_test` database and applied all three migrations
  from empty successfully.
- Applied the feeding-plans migration to the local development database and
  regenerated Prisma Client.
- Formatting, linting, frontend and backend type-checking, root tests, and both
  production builds passed.
- Frontend coverage passed with 25 tests and backend unit coverage passed with
  33 tests.
- PostgreSQL-backed authentication, personnel, and animal-registry suites
  passed with 4, 3, and 4 tests respectively. The revised feeding-plan suite
  passes with 5 tests.
- Feeding-plan database coverage confirms authentication, keeper and
  administrator mutations, validation, date and period ordering,
  accountability, archiving, read-only archives, relation preservation, and
  the absence of a delete endpoint.
- Browser checks confirmed the empty state, keeper creation and editing,
  natural-language instructions, recurrence and due display, and archive
  confirmation and removal.
- The animal profile had no horizontal overflow at a 375-pixel viewport, and
  the tested flows produced no unexpected browser console errors.
- The final browser pass confirmed administrator create, update, and archive
  mutations, accessible native form controls and action buttons for keyboard
  operation, correct accountability, removal from active results, and no
  unexpected browser console errors.
- Temporary browser-test plans and personnel accounts were removed after
  validation.
- No feeding record, assignment, occurrence, queue, or claim model was added.

These results describe the original in-place update implementation. The
amendment below supersedes that behavior and was validated on 2026-07-01.

## Amendment Validation - Immutable feeding plans

1. ✅ Confirm no feeding-plan self-relation or replacement-chain field exists.
2. ✅ Confirm keepers and administrators can create and archive plans as separate
   operations.
3. ✅ Confirm archived plans remain associated with their animal and visible in
   plan history.
4. ✅ Confirm the collection returns active plans by default, archived plans with
   `status=archived`, and rejects unknown status values.
5. ✅ Confirm `nextDueDate` remains mutable operational state and can later advance
   without creating a new plan.
6. ✅ Confirm the former general feeding-plan `PATCH` route is no longer
   registered and no update DTO or in-place update workflow remains.
7. ✅ Confirm no replacement or manual reschedule endpoint exists and personnel
   cannot directly change `nextDueDate`.
8. ✅ Confirm the interface offers create and archive actions without edit or
   replacement actions, initially fetches only active plans, and fetches
   archived history when the collapsible history section is opened.
9. ✅ Confirm archived plans remain visible in plan history, cannot be edited
    or deleted, and are available for future feeding-record relations.
10. ✅ Run formatting, linting, type-checking, unit tests, PostgreSQL API tests,
    browser checks, and production builds.

## Amendment Validation Results - 2026-07-01

- Formatting, linting, frontend and backend type-checking, root tests, and both
  production builds passed.
- Frontend coverage passed with 28 tests and backend unit coverage passed with
  66 tests.
- The focused feeding-plan component suite passed with 8 tests, and the focused
  backend feeding-plan suites passed with 13 tests.
- PostgreSQL-backed authentication, personnel, animal-registry, and
  feeding-plan suites passed with 4, 6, 4, and 5 tests respectively.
- Feeding-plan API coverage confirms active-by-default filtering,
  `status=archived`, invalid-status rejection, separate create and archive
  operations, archived history, immutable definitions, and the absence of
  update, replacement, reschedule, and deletion routes.
- Component coverage confirms archived plans are not fetched until the
  disclosure is opened, the disclosure can be collapsed, and no edit or
  replacement control is presented.
- The final browser pass confirmed active plans load without archived history,
  archived history loads and collapses on request, creation and archive
  confirmation work, archived plans remain readable without mutation controls,
  and no edit or replacement controls are exposed.
- Native form fields and buttons were focusable, the 375-pixel viewport had no
  horizontal overflow, and the tested flow produced no browser console warnings
  or errors.
- The temporary browser-validation plan was removed directly from the local
  development database after validation.

## Date Presentation Amendment Results - 2026-07-02

- ✅ Shared helper tests confirm strict `dd/mm/yyyy` parsing, ISO conversion,
  leap-year validation, invalid-date rejection, and tomorrow calculation.
- ✅ Animal component tests confirm profile dates and edit inputs use
  `dd/mm/yyyy` while create and update requests retain ISO date-only values.
- ✅ Feeding-plan component tests confirm the `Next feeding` label, tomorrow
  default, `dd/mm/yyyy` display, invalid-date feedback, and ISO request value.
- ✅ Formatting, linting, frontend and backend type-checking, all 32 frontend
  tests, all 66 backend unit tests, generic API tests, and both production
  builds passed.
- ✅ Browser validation confirmed `12/05/2004` and `20/03/2018` on the animal
  profile and edit form, `Next feeding` with tomorrow as `03/07/2026`, existing
  feeding dates in `dd/mm/yyyy`, and no console warnings or errors.

## Amendment Validation - Initial feeding task

- [ ] Creating a feeding plan creates one `AVAILABLE` task with the submitted
  initial scheduled date in the same transaction.
- [ ] A failed first-task creation leaves no feeding plan behind.
- [ ] Each existing active plan receives one available task from its previous
  `nextDueDate` during migration.
- [ ] `FeedingPlan.nextDueDate` is removed after migration and scheduling state
  is not duplicated.
- [ ] Active plan responses and the interface derive `Next feeding` and due
  status from the current task.
- [ ] Archiving a plan removes its current non-completed task while preserving
  completed task history.
- [ ] Plan immutability, archived history, date formatting, permissions, and
  existing creation behavior remain valid.
- [ ] Focused feeding-plan and feeding-task tests, PostgreSQL API tests, and the
  full repository validation suite pass.

## Merge Criteria

The phase can be merged when:

- All automated and manual validation checks pass.
- Keepers and administrators can create and archive plans for active
  animals.
- Authorized personnel can view an animal's active feeding plans and status.
- Authorized personnel can inspect every archived plan associated
  with an animal through a separate history view.
- Multiple feeding routines can coexist for one animal.
- Plan validation and permissions are enforced by the API.
- Creator and last-modifier accountability is preserved.
- Plans survive related archival and cannot be deleted.
- Plan definitions remain immutable while the current feeding task owns the
  next scheduled date.
- No general plan-update, replacement, or manual-reschedule endpoint exists;
  task completion is the only workflow that creates the next scheduled task.
- Authorized personnel can inspect archived plan versions without treating them
  as active feeding work.
- Task completion and history belong to Phase 6; queues and claims remain
  deferred to Phase 7.
- `requirements.md`, `plan.md`, and `validation.md` agree with the
  implementation.
