
## `specs/AGENTS.md`

```md
# Specs Guide

- Product planning requires reading `specs/mission.md`,
  `specs/tech-stack.md`, and `specs/roadmap.md`.
- Each new roadmap phase gets a dated directory with:
  - `requirements.md`
  - `scope.md`
  - `plan.md`
  - `validation.md`
- `requirements.md` defines approved feature behavior and exclusions.
- `scope.md` defines approved implementation paths by task group.
- `plan.md` defines independently implementable, directly verifiable steps.
- `validation.md` defines required automated, manual, and browser checks.
- Obtain explicit user approval before drafting a feature specification and
  again before implementation.
- Do not treat silence as approval.
- If specs conflict, identify the conflict and ask the user.
- Keep later roadmap concerns out of the current phase unless specs are revised
  and approved.
- Mark roadmap phases with `✅` only after every task group and final validation
  pass.
- Mark plan steps with `✅` only after implementation and directly relevant
  focused validation pass.
- Leave blocked, partial, or unvalidated work unchecked.
- `scope.md` should use the deepest practical folder paths.
- Update `scope.md` only for material boundary expansions into feature, shared,
  schema, or test folders not already covered.
- Ask for approval when an expansion changes behavior, architecture, validation,
  or roadmap commitments.