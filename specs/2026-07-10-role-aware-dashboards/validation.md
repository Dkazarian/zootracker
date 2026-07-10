# Phase 9: Role-Aware Dashboards - Validation

## Frontend checks

- `npm.cmd run typecheck --workspace frontend`
- `npm.cmd test --workspace frontend -- home`
- `npm.cmd test --workspace frontend -- animals personnel feeding`

## Browser checks

- Sign in as a keeper and confirm `/dashboard` shows a keeper dashboard with
  due work, active claims, and recent completions.
- Sign in as an administrator and confirm `/admin/dashboard` shows an
  administrator overview with animals, personnel, and feeding summaries.
- Confirm the dashboard content changes by role without breaking sign-out or
  the authenticated shell.
- Confirm keeper and admin pages call different read-only API endpoints.
- Confirm the browser console stays clean while loading each dashboard.

## Validation results

- `npm.cmd run typecheck --workspace frontend` passed.
- `npm.cmd run typecheck --workspace backend` passed.
- `npm.cmd test --workspace frontend -- App.test.tsx` passed.
- `npm.cmd test --workspace backend -- --runInBand dashboard` passed.
- `npm.cmd run lint` passed.
- `npm.cmd run format:check` passed.
- `npm.cmd run build` passed with `DATABASE_URL=postgresql://postgres:test@localhost:5432/zootracker_test?schema=public` set in shell.
- 2026-07-10 browser smoke passed against local built frontend and backend:
  - keeper sign-in redirected to `/dashboard`;
  - keeper dashboard showed due work, active claims, and recent completions;
  - administrator sign-in redirected to `/admin/dashboard`;
  - administrator dashboard showed animal, personnel, species, location, and
    feeding summaries;
  - sign-out and authenticated shell remained functional;
  - browser console showed no errors on keeper or administrator dashboards;
  - endpoint smoke confirmed keeper `GET /api/dashboard` returns `200`, keeper
    `GET /api/admin/dashboard` returns `403`, and administrator
    `GET /api/admin/dashboard` returns `200`.
