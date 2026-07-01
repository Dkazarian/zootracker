# Zootracker Agent Guide

## Project

- `frontend/`: React, TypeScript, Vite, React Router, TanStack Query.
- `backend/`: NestJS, TypeScript, Better Auth, Prisma, PostgreSQL.
- `specs/`: mission, tech stack, roadmap, and phase specifications.
- Area-specific rules live in nested files:
  - `specs/AGENTS.md`
  - `frontend/AGENTS.md`
  - `backend/AGENTS.md`

## Planning source of truth

- Product planning means creating or revising a phase's `requirements.md`,
  `scope.md`, `plan.md`, or `validation.md`.
- `requirements.md` defines approved feature behavior.
- `scope.md` defines approved implementation boundaries: paths Codex may inspect
  or edit for each task group.
- Before product planning, read `specs/mission.md`, `specs/tech-stack.md`, and
  `specs/roadmap.md`.
- Obtain explicit user approval before drafting a feature specification and
  again before implementation. Do not treat silence as approval.
- If source documents conflict, identify the conflict and ask the user.
- The first roadmap phase without `✅` is the active phase.
- Mark plan steps, task groups, and phases complete only after their required
  implementation and validation succeed.

## Context discipline

- Treat `.codexignore` as the default exclusion list for discovery and broad
  scans.
- Do not inspect ignored dependencies, generated code, build outputs, coverage,
  snapshots, or binary assets unless directly relevant.
- Before implementation, create a minimal context map: goal, likely paths,
  likely tests, and exclusions.
- Start from the narrowest concrete entry point: named file, symbol, route,
  test, feature folder, or import chain.
- Escalate discovery gradually: symbol/file → dependencies → feature folder →
  workspace → repository.
- Do not repeat broad searches for the same concept; summarize findings and
  reuse them.
- Use approved `scope.md` boundaries for roadmap phase implementation. Expand
  only with concrete evidence from requirements, imports, tests, or failures.
- Ask for user approval when discovery changes feature behavior, architecture,
  validation obligations, or roadmap commitments.
- Focused code questions, reviews, and maintenance do not require reading
  product-planning documents or creating `scope.md`.

## Development rules

- Run npm commands from the repository root.
- Use workspace-scoped commands for focused work and root scripts for
  repository-wide verification.
- Preserve cookie-based authentication; do not introduce browser-stored bearer
  tokens.
- Backend routes are protected by default. Mark public routes explicitly.
- Public registration stays disabled; personnel creation belongs to admin flows.
- Never commit `.env`, `.env.test`, credentials, session values, or database
  connection secrets.
- Do not log passwords, cookies, auth secrets, or full connection strings.
- Avoid abstractions or dependencies not justified by the active spec.

## Verification

- Run focused checks while implementing.
- Do not rerun the same successful focused check unless relevant code changed.
- At task-group checkpoints, run broader checks relevant to affected workspaces.
- At each task-group checkpoint, run the checks assigned to that task group in
  the active phase's `validation.md`.
- Before marking a phase complete, run:

```powershell
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
```
