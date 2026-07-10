# Phase 9: Role-Aware Dashboards - Plan

## Summary

Replace generic signed-in home with role-aware dashboard views. Keep browser routes split by role and back them with separate read-only dashboard endpoints.

## Task Group 1: Keeper Dashboard API

- Add backend dashboard module.
- Expose `GET /dashboard` for keeper users.
- Build keeper summary from existing animal, feeding plan, and feeding task records.
- Enforce auth and keeper role checks on the endpoint.
- Cover keeper endpoint with backend tests.

Checkpoint validation:

- `npm.cmd test --workspace backend -- --runInBand dashboard`
- `npm.cmd run typecheck --workspace backend`

## Task Group 2: Admin Dashboard API

- Expose `GET /admin/dashboard` for administrator users.
- Build admin summary from existing animal, personnel, feeding plan, and feeding task records.
- Enforce auth and admin role checks on the endpoint.
- Cover admin endpoint with backend tests.

Checkpoint validation:

- `npm.cmd test --workspace backend -- --runInBand dashboard`
- `npm.cmd run typecheck --workspace backend`

## Task Group 3: Role-Specific Frontend Dashboards

- Add frontend dashboard API client and response parsing.
- Replace generic home page with keeper and admin dashboard views.
- Wire `/dashboard` to keeper dashboard and `/admin/dashboard` to admin dashboard.
- Keep authenticated shell and sign-out flow intact.
- Reuse existing data in focused summary panels.
- Cover new page behavior with frontend tests.

Checkpoint validation:

- `npm.cmd test --workspace frontend -- home`
- `npm.cmd run typecheck --workspace frontend`

## Task Group 4: Route Wiring And Final Validation

- Wire browser routes to their matching dashboard views.
- Verify keeper and admin sessions render correct content.
- Verify role switch changes dashboard content without breaking auth shell.
- Update `validation.md` with dated results after checks pass.

Final validation:

- `npm.cmd run format:check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd test`
- `npm.cmd build`

## Assumptions

- Existing records already cover needed counts and summaries.
- No new business rules. Only role-aware views over current data.
