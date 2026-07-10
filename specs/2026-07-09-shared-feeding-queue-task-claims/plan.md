# Phase 8: Shared Feeding Queue and Task Claims - Plan

## Task Group 1 - Claim schema and backend contracts

- [x] Update Prisma schema:
  - add optional claimant relation on `FeedingTask`;
  - add optional `claimedAt`;
  - keep `AVAILABLE` and `COMPLETED` statuses unchanged.
- [x] Add migration and regenerate Prisma client.
- [x] Update backend feeding-task record and response types to expose claim
  fields.
- [x] Update frontend feeding-task API schema/type to parse claim fields.
- [x] Keep existing completed-history and completion contracts backward
  compatible apart from the additional nullable claim fields.

Checkpoint validation:

```powershell
npm.cmd run prisma:generate --workspace backend
npm.cmd run typecheck --workspace backend
npm.cmd run typecheck --workspace frontend
```

## Task Group 2 - Shared queue API

- [x] Add queue query DTO for:
  - availability: all, unclaimed, claimed;
  - due state: all, due, upcoming;
  - limit, including next-three preview.
- [x] Add repository query for open tasks from active animals and active feeding
  plans.
- [x] Apply deterministic ordering:
  - due tasks before upcoming tasks;
  - earlier `scheduledDueAt` first;
  - stable creation order when schedule times match.
- [x] Add service method for shared queue listing.
- [x] Add protected API endpoint for shared queue.
- [x] Cover queue filters, limit, active-only rules, and ordering with backend
  tests.

Checkpoint validation:

```powershell
npm.cmd test --workspace backend -- --runInBand feeding-tasks
npm.cmd run typecheck --workspace backend
```

## Task Group 3 - Claim and release workflow

- [x] Add backend claim operation:
  - only open available tasks can be claimed;
  - claimed task conflict returns useful response;
  - archived animal or archived plan rejects claim.
- [x] Add backend release operation:
  - own claim release allowed for keepers and administrators;
  - administrator can release any claim;
  - keeper cannot release another user's claim;
  - unclaimed task release returns conflict.
- [x] Preserve claim fields when completing a task.
- [x] Allow completing a task claimed by another user.
- [x] Ensure completion still atomically creates the next scheduled task.
- [x] Add API endpoints for claim and release.
- [x] Cover claim, release, permission, and completion-with-claim behavior with
  backend unit and e2e tests.

Checkpoint validation:

```powershell
npm.cmd test --workspace backend -- --runInBand feeding-tasks
npm.cmd run test:feeding-tasks:e2e --workspace backend
npm.cmd run typecheck --workspace backend
```

## Task Group 4 - Frontend shared queue

- [x] Add frontend API functions and query keys for:
  - shared queue listing;
  - claim task;
  - release claim.
- [x] Add shared feeding queue surface.
- [x] Show next three open tasks without claiming them.
- [x] Show task due/upcoming state, schedule, animal/plan context, and claimant
  information.
- [x] Add claim and release actions with loading and error states.
- [x] Add queue filters for availability and due state.
- [x] Keep animal-specific completed history unchanged.
- [x] Add frontend tests for rendering, filters, claim, release, and API
  invalidation.

Checkpoint validation:

```powershell
npm.cmd test --workspace frontend -- feeding
npm.cmd run typecheck --workspace frontend
```

## Task Group 5 - Cross-user completion warning and final validation

- [x] Warn before completing a task claimed by another user.
- [x] Allow completion after confirmation.
- [x] Show claimant and completer after completion where the task appears in
  history.
- [x] Run database-backed feeding task e2e tests.
- [x] Skipped browser smoke/manual checks from `validation.md` at request.
- [x] Update `validation.md` with dated results.
- [x] Mark roadmap Phase 8 complete.

Final validation:

```powershell
npm.cmd run format:check
npm.cmd run lint
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
```
