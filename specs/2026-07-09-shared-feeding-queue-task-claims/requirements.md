# Phase 8: Shared Feeding Queue and Task Claims - Requirements

## Goal

Keepers and administrators need a shared view of open feeding work so they can
coordinate without permanent assignments. A keeper should be able to preview the
next feeding needs, claim one task as an advisory "I'll do this" signal, return
that task to the shared queue, and still complete a task even if someone else
claimed it.

## Users and permissions

- Keepers and administrators can view open feeding tasks.
- Keepers and administrators can claim available feeding tasks.
- The keeper or administrator who claimed a task can release their own claim.
- Administrators can release any claim.
- Keepers and administrators can complete a claimed task, even when another user
  claimed it.
- Existing completion permissions remain unchanged.

## Feeding task data

- Feeding tasks keep the existing `AVAILABLE` and `COMPLETED` statuses.
- Claims are stored as advisory metadata on an available task, not as a new task
  status.
- A task claim stores:
  - the claiming user;
  - the time the task was claimed.
- Completed tasks preserve:
  - who claimed the task, when a claim existed;
  - who completed the task;
  - the completion time;
  - optional completion notes;
  - last modification accountability.
- The system does not implement automatic claim expiration in this phase.

## Shared feeding queue

- The API exposes open feeding tasks for the shared queue.
- The queue includes tasks that are not completed and whose feeding plan and
  animal are active.
- The queue supports filtering by:
  - availability: all open tasks, unclaimed tasks, or claimed tasks;
  - due state: all open tasks, due tasks, or upcoming tasks.
- The default queue order prioritizes work by:
  - due tasks before upcoming tasks;
  - earlier `scheduledDueAt` before later `scheduledDueAt`;
  - stable creation order when schedule times match.
- A request can limit the number of returned tasks so the UI can preview the
  next three needs without claiming them.

## Claim workflow

- Claiming an open task records the current user and current time.
- Claiming an already claimed task returns a conflict response with useful
  information for the caller.
- Releasing a claim clears the claimant and claim time.
- Releasing an unclaimed task returns a conflict response.
- Releasing another user's claim is forbidden for keepers and allowed for
  administrators.
- Completing a task claimed by another user succeeds but the response preserves
  both claimant and completer so the UI can warn before completion and show what
  happened afterward.

## API behavior

- Existing completed-history endpoints remain available.
- The shared queue is separate from animal-specific completed history.
- Feeding task responses expose claim fields when present.
- Claim and release operations return the updated feeding task.
- Error responses should remain useful for not-found, archived plan/animal,
  already completed, already claimed, unclaimed, and forbidden release cases.

## Frontend behavior

- Add a shared feeding queue surface that can display the next open tasks.
- The UI can preview the next three open needs without claiming them.
- Users can claim and release a task from the queue.
- The UI shows when a task is claimed and by whom.
- If a user starts completing a task claimed by someone else, the UI warns but
  still allows completion after confirmation.
- Dashboard-specific prioritization and layout belong to Phase 9; this phase
  only provides the queue behavior needed by future dashboards.

## Deferred work

- No permanent feeding assignments.
- No automatic claim expiration.
- No notifications or reminders.
- No WhatsApp or external-client workflow changes.
- No Phase 9 role-specific dashboard redesign.
