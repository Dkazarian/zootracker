---
name: sdd-planning
description: Create or revise Spec Driven Development planning artifacts. Use when the user asks to plan a roadmap phase, create or update requirements.md, validation.md, plan.md, paths.md, prepare branch/spec folders for a phase, revise existing phase specs, move scope to backlog/roadmap, or decide how a change fits into an SDD process.
---

# SDD Planning

Use this skill for Spec Driven Development planning/specification work, not ordinary code edits.

## Required source documents

Before product planning, read the project's stable planning source documents. Common examples are:

- mission or product goal document;
- tech stack or architecture document;
- roadmap or phase list;
- the active or affected phase spec directory, when one exists.

For phase-specific work, treat the active or affected phase spec directory as
the default spec scope. Do not inspect or edit other phase directories unless
the user explicitly asks, stable planning documents require a cross-phase
change, or an approved amendment targets another phase.

If these documents conflict, stop and ask the user to resolve the conflict.
After reading stable source documents, summarize the relevant decisions and
reuse that summary during the turn instead of rereading unchanged files.

## Approval gates

- Get explicit user approval before drafting a new feature specification.
- Draft `requirements.md` and `validation.md` first, then wait for explicit
  user approval before creating `plan.md`.
- Draft `plan.md` next, then wait for explicit user approval before creating
  `paths.md`.
- Get explicit user approval again before implementation.
- Do not treat silence, "seems ok", or unrelated discussion as approval unless
  the user clearly says to proceed.

## Phase folder workflow

For a new roadmap phase:

1. Find the next uncompleted roadmap phase or confirm the phase with the user.
2. Create or use a branch named for the phase when the project uses
   branch-per-phase work.
3. Create `specs/YYYY-MM-DD-feature-name/` or the project's equivalent spec
   folder.
4. Create `requirements.md` and `validation.md`.
5. Ask the user to approve or revise them.
6. After approval, create `plan.md`.
7. Ask the user to approve or revise the plan.
8. After approval, create `paths.md` as a compact path list.

Use dated folders for feature work when the project follows dated specs. Use an
amendment section in the affected phase when revising behavior from an already
planned or implemented phase.

## File responsibilities

### `requirements.md`

Define approved product behavior:

- users, roles, and permissions;
- data captured and exposed;
- API and UI behavior;
- constraints, exclusions, and deferred work;
- important design decisions.

Keep implementation sequencing out of this file unless it changes behavior.

### `validation.md`

Define how success is proven.

- Include focused tests by task group.
- Include affected lint/typecheck/build checks.
- Include database-backed checks after schema, transaction, or repository
  changes.
- Include manual/browser/accessibility checks only when the feature needs them.
- Keep browser checks compact and targeted: specify the smallest real-user
  workflow, the route or page, and the exact signal to inspect. Prefer URL,
  specific text/control presence, overflow status, keyboard/focus outcome, and
  console error counts over screenshots or full DOM snapshots.
- Treat browser checks as final confidence validation after component/API tests
  cover the main behavior, unless the feature is primarily visual or
  browser-specific.
- Record exact dated validation results after checks run, but keep entries
  compact: command, outcome, and only the important blocker or note.

### `plan.md`

Define numbered task groups with directly verifiable steps.

- Keep each group independently reviewable.
- Add checkpoint checks after each group.
- Mark steps checked only after implementation and relevant validation pass.
- Prefer small steps that another run can execute without rereading the entire
  repo.

### `paths.md`

Define implementation boundaries only:

- editable paths;
- supporting read-only paths;
- excluded paths;
- any approved path-boundary expansions.

Do not put product behavior, status, decisions, or scope in `paths.md`.
Keep it as a short list, not a task-group table, unless the user explicitly
asks for task-group boundaries.
Treat `paths.md` as the phase's context contract: implementation should start
inside those paths and expand only when imports, tests, errors, or approved
requirements make expansion necessary.

## Change management

When new work appears outside the current phase:

- If it changes current behavior, amend the current or affected phase specs and
  mention the amendment in project changelog/roadmap when appropriate.
- If it is valuable but not now, move it to the roadmap or backlog according to
  user direction.
- If it changes architecture, validation obligations, or roadmap commitments,
  ask for approval before updating specs.

## Completion rules

- Mark roadmap phases complete only after all applicable plan and validation
  items pass.
- Leave partial, blocked, or unverified work unchecked.
- Keep specs honest: document blocked browser/manual checks instead of checking
  them prematurely.
