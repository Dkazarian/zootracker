# Phase 2: Authentication - Requirements

## Goal

Add private, session-based access to Zootracker. Personnel can sign in with an administrator-created account, remain signed in after a page reload, and sign out. Unauthenticated visitors cannot access application data.

This phase establishes the database and authentication foundation that later personnel and role features will extend.

## Scope

### Database and Prisma

- Connect the backend to the locally installed PostgreSQL server.
- Use Prisma to manage the application schema and database migrations.
- Use `zootracker` for local development and `zootracker_test` for automated integration tests.
- Store Better Auth users, credentials, accounts, and sessions in PostgreSQL through the Prisma adapter.
- Provide example environment configuration without committing credentials or secrets.

### Backend authentication

- Integrate Better Auth with NestJS using the community-maintained NestJS integration.
- Expose Better Auth endpoints under `/api/auth/*`.
- Support email-and-password sign-in and sign-out.
- Use database-backed sessions delivered through secure HTTP-only cookies.
- Disable public user registration.
- Protect API routes by default while allowing explicitly public routes.
- Keep `GET /api/health` publicly accessible.
- Add `GET /api/me` as a protected endpoint that returns the current user's safe public identity.
- Configure the Better Auth admin plugin so the first administrator can be established without exposing registration.

### Administrator bootstrap

- Provide an idempotent `npm run auth:bootstrap-admin` command.
- Read the initial administrator's name, email, and password from environment variables.
- Create the administrator through Better Auth rather than implementing password hashing directly.
- Do not create a duplicate when the command is run again for the same email.
- Do not print the administrator password or authentication secrets.

### Frontend authentication

- Add a public `/login` page with email and password fields.
- Display clear submitting and invalid-credentials states.
- Redirect a successfully authenticated user into the application.
- Restore the current session after a browser reload.
- Require authentication for application routes.
- Redirect unauthenticated visitors to `/login`.
- Allow an authenticated user to sign out and return to `/login`.

### Quality and documentation

- Add automated coverage for the critical authentication and route-protection behavior.
- Document local database creation, migration, administrator bootstrap, and sign-in steps.
- Preserve the repository's formatting, linting, type-checking, testing, build, and CI checks.

## Decisions

- Authentication uses Better Auth's email-and-password support with its Prisma adapter.
- The API owns the Better Auth configuration; the frontend is an authentication client.
- Authentication uses database-backed cookie sessions rather than browser-stored bearer tokens.
- API routes are authenticated by default and public access must be explicitly declared.
- Public registration remains disabled. Personnel account management belongs to Phase 3.
- The first administrator is created by a one-time environment-driven command, not by a public page or endpoint.
- Better Auth's admin plugin is introduced for the administrator record, but detailed product roles and permissions remain in Phase 3.
- The frontend uses React Router for public and protected routes and TanStack Query for server-session state.
- Local development continues without Docker.

## Context

- PostgreSQL is already installed locally through the Windows installer.
- The local developer is responsible for supplying valid PostgreSQL connection strings and creating the development and test databases.
- The Better Auth NestJS integration is community-maintained. Its compatibility with the selected NestJS and Better Auth versions must be demonstrated by automated tests.
- Browser requests must include credentials so the API can set and receive the session cookie.
- Local frontend and backend origins differ, so CORS and cookie behavior must be configured deliberately.
- Only non-sensitive user fields may be returned from `/api/me`.

## Out of Scope

- Public sign-up
- Password reset and account recovery
- Email verification and transactional email
- Multi-factor authentication
- Social or third-party login
- Personnel management screens
- Keeper permissions and detailed role enforcement
- Account deactivation
- Service-to-service authentication
- Production database provisioning and deployment

