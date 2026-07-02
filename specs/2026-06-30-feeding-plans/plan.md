# Phase 5: Feeding Plans - Implementation Plan

The checked task groups below record the original Phase 5 delivery. The
2026-07-01 amendment at the end supersedes in-place definition editing without
rewriting that implementation history.

## Task Group 1 - Feeding-plan data model

1. ✅ Add the Prisma feeding-plan model and its animal and personnel relations.
2. ✅ Add constrained morning, afternoon, and evening period values.
3. ✅ Store recurrence as a positive whole number of days and next due as a
   date-only value.
4. ✅ Define the application-wide period starts and configured zoo timezone used
   for due calculations.
5. ✅ Add indexes needed to retrieve an animal's plans and order active plans by
   next-due time.
6. ✅ Create and apply the feeding-plans database migration.
7. ✅ Generate the Prisma client.
8. ✅ Verify a clean test database can be migrated.

## Task Group 2 - Feeding-plan API

1. ✅ Add a NestJS feeding-plans module with controller, service, DTOs, and
   response types.
2. ✅ Add an authenticated endpoint to list an animal's active feeding plans.
3. ✅ Include derived upcoming or due status and timing in plan responses.
4. ✅ Allow keepers and administrators to create plans using the authenticated
   person as creator.
5. ✅ Validate active-animal status, name, instructions, period, recurrence,
   next-due date, and unexpected fields.
6. ✅ Allow keepers and administrators to update plans while preserving
   creation accountability.
7. ✅ Allow keepers and administrators to archive plans and prevent edits to
   archived plans.
8. ✅ Return useful authorization, not-found, conflict, and validation responses.
9. ✅ Confirm no feeding-plan deletion endpoint exists.

## Task Group 3 - Animal feeding-plan interface

1. ✅ Add frontend feeding-plan API types, client operations, and TanStack Query
   state.
2. ✅ Add a feeding-plans section to the animal profile.
3. ✅ Show plan instructions, period, recurrence, next-due date, and status.
4. ✅ Provide loading, empty, and failure states.
5. ✅ Add an accessible plan-creation form for keepers and administrators.
6. ✅ Add accessible update and archive flows for keepers and administrators.
7. ✅ Refresh affected plan data after successful mutations.
8. ✅ Verify complete keyboard use; desktop and narrow mobile layouts are
   validated.

## Task Group 4 - Tests, documentation, and validation

1. ✅ Add backend unit tests for periods, recurrence, timezone-aware status,
   validation, and service behavior.
2. ✅ Add PostgreSQL-backed API tests for permissions, creation, updating,
   archiving, ordering, and preservation.
3. ✅ Add frontend tests for plan states, details, forms, status, archiving, and
   role-specific controls.
4. ✅ Add an explicit feeding-plan integration-test command.
5. ✅ Document feeding periods, recurrence, timezone behavior, and the local test
   workflow.
6. ✅ Execute all automated validation commands.
7. ✅ Perform the remaining keyboard-only browser check in `validation.md`; API
   and other browser checks are validated.
8. ✅ Confirm feeding records, assignments, and claims have not leaked into this
   phase.
9. ✅ Add `✅` only to steps that are complete and proportionately validated.

## Amendment - Immutable feeding plans (2026-07-01)

1. ✅ Keep animal, name, instructions, period, and recurrence immutable after
   creation while retaining `nextDueDate` as mutable operational state.
2. ✅ Remove the general feeding-plan `PATCH` endpoint, update DTO, in-place
   service and repository workflow, frontend API consumer, edit form, and
   obsolete update tests.
3. ✅ Do not add a replacement endpoint, replacement relation, or version chain.
4. ✅ Do not add a manual reschedule endpoint; leave `nextDueDate` advancement to
   the later feeding-completion workflow.
5. ✅ Preserve archive behavior and keep creation as a separate operation.
6. ✅ Remove frontend edit actions, keep active plans prominent, and add a
   collapsible plan-history section that fetches archived plans only when
   requested.
7. ✅ Filter the feeding-plan collection with `status=archived` instead of adding
   a separate history endpoint.
8. ✅ Update backend unit, repository, PostgreSQL API, and frontend component
   coverage for immutable definitions and archived-plan history.
9. ✅ Make archived plans readable through plan history, keep them available
   for future feeding-record relations, and introduce no deletion path.
10. ✅ Run the amendment validation in `validation.md` and add `✅` only after each
   step is implemented and directly validated.
