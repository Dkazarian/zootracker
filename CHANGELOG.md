# Changelog

## 2026-07-03

- Redesign scheduled feeding work as one persistent `FeedingTask` per plan and
  due date. Plan creation creates the first available task, completion creates
  the next task, and completed tasks form feeding history.
- Simplify claims to an advisory `AVAILABLE` or `CLAIMED` state on the current
  task. Remove claim expiration and claim-attempt history from the roadmap.

## 2026-07-02

- Standardize user-facing dates as `dd/mm/yyyy`, rename the feeding-plan date
  label to `Next feeding`, and default new feeding plans to tomorrow.

## 2026-07-01

- Finalize personnel deactivation and reactivation with direct account-state
  updates, session revocation, and administrator safeguards.
- Amend feeding-plan maintenance so definitions are immutable: personnel
  archive an old plan and create a new independent plan when care instructions
  change. Remove in-place updates and exclude manual rescheduling.

## 2026-06-30

- Implement Phase 5 feeding plans with recurring periods, due-status tracking,
  and keeper and administrator management.
- Add safe personnel deactivation and reactivation with session revocation,
  preserved account history, and administrator safeguards.

## 2026-06-29

- Complete cookie-based authentication with Better Auth and PostgreSQL.
- Implement Phase 3 personnel creation, the keeper and administrator roles,
  and role-based authorization.
- Implement the animal registry with representative data, search,
  administrator management, archiving, and species illustrations.

## 2026-06-28

- Establish the frontend and backend project structure and npm workspace
  commands.
- Add Prisma and the initial authentication specification.

## 2026-06-27

- Define the Zootracker mission, technology stack, and roadmap.
- Implement Phase 1 with the React frontend, NestJS backend, health endpoint,
  formatting, linting, type-checking, testing, and CI foundations.
