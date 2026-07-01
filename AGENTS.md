# Zootracker Agent Guide

## Source of truth

- Product planning means creating or revising a phase's `requirements.md`,
  `scope.md`, `plan.md`, or `validation.md`.
- Before product planning, read `specs/mission.md`, `specs/tech-stack.md`, and
  `specs/roadmap.md`.
- Each new roadmap phase receives a dated directory under `specs/` containing
  `requirements.md`, `scope.md`, `plan.md`, and `validation.md`.
- Obtain explicit user approval for feature scope, decisions/context, and
  validation before drafting a new feature specification.
- Obtain explicit user approval for the completed specification before
  implementation. Do not treat silence as approval.
- If source documents conflict, identify the conflict and ask the user instead
  of choosing a source silently.
- Mark completed phase headings in `specs/roadmap.md` with `✅`. The first phase
  without `✅` is the active phase.
- Add `✅` to a plan step only after its implementation and directly relevant
  focused validation succeed. A checkmark does not mean the task-group or
  phase checkpoint has passed.
- Leave blocked, partially implemented, or directly unvalidated plan steps
  unchecked.
- Keep later roadmap concerns out of the current phase unless the specification
  is explicitly revised and approved by the user.

## Repository structure

- `frontend/`: React, TypeScript, Vite, React Router, TanStack Query.
- `backend/`: NestJS, TypeScript, Better Auth, Prisma, PostgreSQL.
- `specs/`: project constitution, roadmap, and feature specifications.
- Organize frontend product code by feature under `frontend/src/features/`.
- Put reusable frontend infrastructure under `frontend/src/shared/`.
- Organize backend product code in NestJS feature modules.
- Keep Prisma schema and migrations under `backend/prisma/`.
- Do not hand-edit files under `backend/src/generated/prisma/`.
- Colocate focused unit/component tests with their source. Keep backend HTTP
  integration tests under `backend/test/`.

## Context efficiency

- Treat `.codexignore` as the default exclusion list for repository discovery
  and broad scans.
- Do not inspect ignored dependencies, generated code, build outputs, or binary
  assets unless the active task specifically requires them.
- Before implementing the active or a future phase, create and obtain explicit
  user approval for its `scope.md`.
- Do not backfill `scope.md` for completed phases unless substantial new work
  reopens that phase.
- Define the initial context boundary in `scope.md` using the deepest practical
  folder paths, grouped by task group. Include specification, feature, test,
  schema, and shared-infrastructure folders only where relevant.
- Begin discovery and implementation inside the task group's boundary. Expand
  it only when requirements, imports, test failures, or other concrete evidence
  indicate another area is involved.
- A material scope expansion enters a feature, shared-infrastructure, schema, or
  test folder not already covered by the task-group paths. Record the added
  folder and reason in `scope.md`; individual files beneath an existing path do
  not require an update.
- Code questions, reviews, and focused maintenance do not require reading the
  product-planning documents or creating `scope.md`. Start with the named
  symbol or folder, then inspect direct callers, dependencies, and focused tests
  as evidence requires.
- Ignored files may still be read explicitly when needed, such as lockfiles
  during dependency work or generated output while diagnosing generation
  problems.

## Development rules

- Run npm commands from the repository root. Use workspace-scoped commands
  during focused work and root scripts for repository-wide verification.
- Preserve authentication as cookie-based sessions; do not introduce
  browser-stored bearer tokens.
- Backend routes are protected by default. Mark intentionally public routes
  explicitly.
- Public registration stays disabled. Personnel creation belongs to
  administrator workflows.
- Never commit `.env`, `.env.test`, credentials, session values, or database
  connection secrets.
- Do not log passwords, cookies, authentication secrets, or full connection
  strings.
- Avoid adding abstractions or dependencies that are not justified by the
  active feature specification.

## Verification cadence

- While implementing a task, run the focused checks needed to develop and
  validate its changed behavior.
- Do not repeatedly rerun the same successful focused check within a task
  unless relevant code changes. This never replaces task-group or phase
  checkpoints.
- At the end of each task group, run the broader checks relevant to the
  affected workspaces and the task group's requirements. Include relevant
  PostgreSQL-backed integration suites when the group changes backend,
  authentication, authorization, API, or database behavior.
- After the final task group and before marking a phase complete, run the full
  repository verification suite from the repository root:

```powershell
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
```

- When a phase changes backend, authentication, authorization, API, or database
  behavior, its final checkpoint also runs all PostgreSQL-backed integration
  suites:

```powershell
npm run test:auth:e2e
npm run test:personnel:e2e
npm run test:animals:e2e
npm run test:feeding-plans:e2e
```

- PostgreSQL-backed suites require the isolated `zootracker_test` database.
- Follow the active phase's `validation.md` for applicable manual and browser
  checks. Run focused manual checks at the relevant task-group checkpoint and
  complete the required set before marking the phase complete.
- A task group is complete only after its checkpoint succeeds. A phase receives
  `✅` only after every task group and the final phase checkpoint succeed.
