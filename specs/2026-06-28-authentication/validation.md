# Phase 2: Authentication - Validation

## Automated Validation

From the repository root, all of the following must succeed:

1. Clean dependency installation
2. Prisma client generation
3. Clean migration of an empty test database
4. Formatting check
5. Frontend and backend linting
6. Frontend and backend type-checking
7. Frontend unit and component tests
8. Backend unit and integration tests
9. Frontend and backend production builds

GitHub Actions must provision PostgreSQL and run the same relevant quality gates successfully.

## Database and Bootstrap Validation

Using the documented local setup:

1. Create empty `zootracker` and `zootracker_test` databases.
2. Apply the migrations to `zootracker` from a clean state.
3. Confirm the expected Better Auth tables exist.
4. Supply valid administrator bootstrap environment values.
5. Run `npm run auth:bootstrap-admin` and confirm one administrator is created.
6. Run the command again and confirm it exits safely without creating a duplicate.
7. Confirm no password or authentication secret is printed or committed.
8. Confirm missing or invalid bootstrap configuration produces an actionable failure.

## API Authentication Validation

With the backend and database running:

1. Request `GET /api/health` without a session and confirm HTTP `200`.
2. Request `GET /api/me` without a session and confirm HTTP `401`.
3. Sign in with invalid credentials and confirm authentication is rejected without revealing whether an email exists.
4. Attempt public sign-up through the Better Auth API and confirm it is rejected.
5. Sign in with the bootstrapped administrator and confirm a session cookie is set.
6. Request `GET /api/me` with the session and confirm it returns only the expected public identity fields.
7. Sign out and confirm the prior session can no longer access `GET /api/me`.
8. Confirm requests from an untrusted origin do not receive authenticated cross-origin access.

## Frontend Validation

With both applications started through `npm run dev`:

1. Open a protected application URL without a session and confirm redirect to `/login`.
2. Confirm the login page has labeled email and password controls and can be operated by keyboard.
3. Submit invalid credentials and confirm a useful error appears without losing the entered email.
4. Sign in with the bootstrapped administrator and confirm redirect into the application.
5. Refresh the browser and confirm the authenticated session is restored.
6. Confirm private application content is not briefly displayed while session state is loading.
7. Sign out and confirm redirect to `/login`.
8. Use the browser Back action and confirm private content remains inaccessible.
9. Confirm there are no unexpected console errors during the complete flow.

## Security and Configuration Check

1. Confirm public sign-up is disabled in server configuration, not only hidden in the frontend.
2. Confirm session cookies are HTTP-only and use appropriate local-development same-site and secure settings.
3. Confirm frontend requests use cookie credentials without copying sessions into local storage.
4. Confirm API routes are protected by default and public routes are explicitly marked.
5. Confirm committed environment examples contain placeholders only.
6. Confirm database credentials, administrator credentials, and authentication secrets are ignored by Git.
7. Confirm error responses and logs do not expose passwords, cookies, connection strings, or stack traces intended only for development.

## Known Upstream Dependency Limitations

- The community NestJS integration is ESM-only. Jest therefore runs backend tests with Node's VM modules support and currently prints Node's experimental-feature warning.
- `npm audit --omit=dev` reports high-severity denial-of-service advisories in Multer 2.1.1, inherited through NestJS's Express platform adapter. No upstream fix is currently available. Zootracker exposes no file-upload or multipart endpoint in this phase, so the vulnerable parser is not reachable through an application route.
- The audit also reports a moderate `@hono/node-server` advisory inherited through Prisma's development tooling. npm's proposed forced remediation downgrades Prisma from 7 to 6, which is a breaking and inappropriate automated change. Continue monitoring upstream releases.

## Merge Criteria

The phase can be merged when:

- All automated and manual validation checks pass.
- CI is green with a PostgreSQL-backed authentication test flow.
- A clean local database can be migrated using the documented commands.
- The bootstrap command creates exactly one administrator and is safe to rerun.
- Public registration is unavailable.
- Unauthenticated users cannot access protected frontend routes or API endpoints.
- Sign-in, session restoration, current-user access, and sign-out work through the browser.
- `GET /api/health` remains public.
- Personnel administration and detailed role permissions remain deferred to Phase 3.
- `requirements.md`, `plan.md`, and `validation.md` agree with the implementation.
