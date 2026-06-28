# Phase 2: Authentication - Implementation Plan

## Task Group 1 - PostgreSQL and Prisma foundation

1. ✅ Add Prisma and its PostgreSQL runtime dependencies to the backend.
2. ✅ Configure Prisma using the documented backend folder structure.
3. ✅ Add example development and test database connection settings.
4. ✅ Configure the Better Auth Prisma adapter and generate the required authentication schema.
5. ✅ Create the initial authentication migration.
6. Apply the initial migration to the local `zootracker` database.
7. ✅ Add root scripts for Prisma generation and migration tasks.
8. ✅ Document how to create the `zootracker` and `zootracker_test` databases on the existing local PostgreSQL installation.

## Task Group 2 - Better Auth and NestJS integration

1. ✅ Install Better Auth and the community NestJS integration.
2. ✅ Configure the NestJS application as required by the integration, including request body handling.
3. ✅ Configure email-and-password authentication, database sessions, trusted origins, and the admin plugin.
4. ✅ Mount the authentication endpoints at `/api/auth/*`.
5. ✅ Disable public sign-up in the server configuration.
6. ✅ Configure CORS and credentials for the local frontend origin.
7. ✅ Make authentication the default for API routes and explicitly mark `GET /api/health` as public.

## Task Group 3 - Current-user API

1. ✅ Add a protected `GET /api/me` endpoint in an authentication feature module.
2. ✅ Read the authenticated session through the NestJS integration.
3. ✅ Return only the current user's identifier, name, email, and role.
4. ✅ Add integration tests for public health access, rejected unauthenticated access, and authenticated current-user access.

## Task Group 4 - First-administrator bootstrap

1. ✅ Add a backend script that reads the administrator name, email, and password from environment variables.
2. ✅ Use the configured Better Auth server API to create the account and establish its administrator role.
3. ✅ Make the command safe to rerun when the administrator already exists.
4. ✅ Return clear success, already-present, configuration-error, and database-error outcomes without exposing secrets.
5. ✅ Expose the script as the root `npm run auth:bootstrap-admin` command.
6. ✅ Add focused automated coverage for creation and idempotency.

## Task Group 5 - Frontend authentication client

1. ✅ Add React Router and define public and authenticated application routes.
2. ✅ Add a shared Better Auth client configured for the backend URL and cookie credentials.
3. ✅ Add a session query that represents loading, authenticated, and unauthenticated states.
4. ✅ Create a login page with accessible email and password fields and useful pending and error feedback.
5. ✅ Redirect successful sign-in to the application and preserve authentication after reload.
6. ✅ Protect the application shell from unauthenticated access without flashing private content.
7. ✅ Add a sign-out action and return the user to `/login` after the session ends.

## Task Group 6 - Automated tests and local workflow

1. ✅ Add backend integration-test setup using `zootracker_test` with isolated authentication data.
2. ✅ Test valid login, invalid login, disabled sign-up, session use, sign-out, and protected routes.
3. ✅ Add frontend tests for route protection, login validation and errors, successful authentication, session restoration, and sign-out.
4. ✅ Keep test credentials and secrets separate from development settings.
5. ✅ Ensure root formatting, linting, type-checking, test, and build commands cover all new code.
6. ✅ Update CI to provision PostgreSQL and apply the test schema before authentication integration tests.

## Task Group 7 - Documentation and phase validation

1. ✅ Update the README with PostgreSQL prerequisites, environment setup, database creation, migration, bootstrap, and sign-in instructions.
2. ✅ Explain how to rotate or replace bootstrap environment values without committing them.
3. Execute every automated validation command from the repository root.
4. Perform the API and browser checks in `validation.md`.
5. ✅ Confirm deferred Phase 3 personnel and permission behavior has not leaked into this phase.
6. Record any accepted deviation in the feature specification before merge.
