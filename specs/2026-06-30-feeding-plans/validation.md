# Phase 5: Feeding Plans - Validation

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
10. Update a plan and confirm its creator and creation time remain unchanged
   while its last modifier and update time change.
11. Archive a plan and confirm it leaves active results but remains stored.
12. Attempt to edit an archived plan and confirm the request is rejected.
13. As an administrator, create, update, and archive a plan and confirm
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
6. Update a plan and confirm the new values and modifier accountability appear.
7. Trigger required-field, period, recurrence, and date validation and confirm
   the messages are understandable.
8. Archive a plan through a confirmation step and confirm it leaves active
   results.
9. Sign in as an administrator and confirm plans and their create, update, and
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
- A final browser pass through administrator mutations and a keyboard-only
  create, update, and archive flow remains pending; both roles have automated
  component and API coverage.
- Temporary browser-test plans and personnel accounts were removed after
  validation.
- No feeding record, assignment, occurrence, queue, or claim model was added.

## Merge Criteria

The phase can be merged when:

- All automated and manual validation checks pass.
- Keepers and administrators can create, update, and archive plans for active
  animals.
- Authorized personnel can view an animal's active feeding plans and status.
- Multiple feeding routines can coexist for one animal.
- Plan validation and permissions are enforced by the API.
- Creator and last-modifier accountability is preserved.
- Plans survive related archival and cannot be deleted.
- Feeding records, assignments, queues, and claims remain deferred.
- `requirements.md`, `plan.md`, and `validation.md` agree with the
  implementation.
