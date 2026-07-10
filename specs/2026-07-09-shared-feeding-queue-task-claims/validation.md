# Phase 8: Shared Feeding Queue and Task Claims - Validation

## Backend validation

- [x] Feeding task schema stores optional claimant and claim time.
- [x] Existing available/completed task lifecycle still works.
- [x] Queue listing returns only open tasks from active animals and active feeding
  plans.
- [x] Queue listing supports availability filters: all, unclaimed, and claimed.
- [x] Queue listing supports due-state filters: all, due, and upcoming.
- [x] Queue listing applies deterministic priority ordering by due state,
  `scheduledDueAt`, and creation order.
- [x] Queue listing supports limiting results, including a next-three preview.
- [x] Claiming an unclaimed open task records claimant and claim time.
- [x] Claiming an already claimed task returns a conflict response.
- [x] Releasing the current user's claim clears claimant and claim time.
- [x] Releasing an unclaimed task returns a conflict response.
- [x] Releasing another user's claim is forbidden for keepers.
- [x] Releasing another user's claim is allowed for administrators.
- [x] Completing a task claimed by another user succeeds and preserves both claimant
  and completer in the response.
- [x] Completing a claimed task still atomically creates the next scheduled task.
- [x] Claim operations reject completed tasks and tasks from archived plans or
  archived animals.

## Frontend validation

- [x] The shared queue surface renders open feeding tasks.
- [x] The queue can show the next three tasks without claiming them.
- [x] Users can claim an unclaimed task from the queue.
- [x] Users can release their own claimed task from the queue.
- [x] Claimed tasks display claimant information.
- [x] Completing a task claimed by another user shows a warning before completion.
- [x] Completion after the warning still succeeds when confirmed.
- [x] Queue filters update the displayed tasks without changing completed-history
  behavior.

## Focused automated checks

Run backend checks after schema, repository, service, and controller work:

```powershell
npm.cmd run prisma:generate --workspace backend
npm.cmd run typecheck --workspace backend
npm.cmd test --workspace backend -- --runInBand feeding-tasks
npm.cmd run test:feeding-tasks:e2e --workspace backend
```

Run frontend checks after queue UI work:

```powershell
npm.cmd run typecheck --workspace frontend
npm.cmd test --workspace frontend -- feeding
```

Before marking the phase complete, run from the repository root:

```powershell
npm.cmd run format:check
npm.cmd run lint
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
```

## Browser checks

- [x] Open the app locally and confirm the login page loads without console errors.
- [ ] Sign in as a keeper.
- [ ] Confirm the shared feeding queue renders open tasks.
- [ ] Preview the next three tasks without claiming them.
- [ ] Claim one task and confirm claimant information appears.
- [ ] Release the claim and confirm the task returns to an unclaimed state.
- [ ] Claim as one user, complete as another authorized user, and confirm the UI
  warns before completion while the API preserves both claimant and completer.

## Validation results

- 2026-07-09:
  - `npm.cmd run prisma:generate --workspace backend` passed.
  - `npm.cmd run typecheck --workspace backend` passed.
  - `npm.cmd run typecheck --workspace frontend` passed.
  - `npm.cmd test --workspace backend -- --runInBand feeding-tasks` passed.
  - `npm.cmd test --workspace frontend -- SharedFeedingQueue FeedingPlansSection`
    passed.
  - `npm.cmd run test:feeding-tasks:e2e --workspace backend` passed after
    applying the new migration to the test database.
  - `npm.cmd run format:check` passed.
  - `npm.cmd run lint` passed.
  - `npm.cmd run typecheck` passed.
  - `npm.cmd test` passed.
  - `npm.cmd run build` passed.
  - Browser smoke reached `http://localhost:5173/login`; login page rendered
    and browser console had no errors. Authenticated queue flow still needs a
    signed-in browser session.
