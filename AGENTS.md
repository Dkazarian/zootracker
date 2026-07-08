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

- Use the `sdd-planning` skill for roadmap phase planning, feature
  specifications, amendments, and creation or revision of `requirements.md`,
  `paths.md`, `plan.md`, or `validation.md`. The versioned source lives at
  `skills/sdd-planning/`.
- Before product planning, read the skill and follow its file-order and approval
  gates.
- If source documents conflict, identify the conflict and ask the user.
- Mark plan steps, task groups, and phases complete only after their required
  implementation and validation succeed.

## Context discipline

- Treat `.codexignore` as the default exclusion list for discovery and broad
  scans.
- Do not inspect ignored dependencies, generated code, build outputs, coverage,
  snapshots, or binary assets unless directly relevant.
- For SDD phase implementation, use the approved phase `paths.md` as the
  starting context boundary.
- Start from the narrowest concrete entry point: named file, symbol, route,
  test, feature folder, or import chain.
- Escalate discovery gradually: symbol/file → dependencies → feature folder →
  workspace → repository.
- Do not repeat broad searches for the same concept; summarize findings and
  reuse them.
- Do not reread unchanged planning documents in the same turn after their
  relevant decisions have been summarized.
- Ask for user approval when discovery changes feature behavior, architecture,
  validation obligations, or roadmap commitments.
- Focused code questions, reviews, and maintenance do not require reading
  product-planning documents or creating `paths.md`.

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
- For noisy checks, prefer
  `powershell -ExecutionPolicy Bypass -File scripts/run-check.ps1 <command>`
  so full logs stay in `.tmp/check-logs/` and only summaries enter context.
- Treat browser/UI validation as a final confidence check, not the default loop:
  prefer component/API tests during implementation, then use targeted browser
  checks for real routing, auth/session, responsive layout, keyboard/focus, and
  console errors.
- During browser/UI validation, prefer targeted DOM assertions over full
  snapshots or screenshots; collect only URL, specific text/control presence,
  overflow status, console error counts, or similarly small signals unless a
  visual defect requires more.
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
