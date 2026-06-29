# Zootracker

Zootracker is an internal animal-care application built with a React frontend and a NestJS API.

## Requirements

- Node.js 24
- npm 11
- PostgreSQL running locally
- The PostgreSQL command-line tools, or an equivalent database administration tool

## Install

```powershell
npm install
```

## Configure PostgreSQL

Create the development and test databases. These commands prompt for the password selected during the Windows PostgreSQL installation:

```powershell
createdb -U postgres zootracker
createdb -U postgres zootracker_test
```

If `createdb` is not on `PATH`, run it from PostgreSQL's `bin` directory or create the databases with SQL Shell (`psql`) or pgAdmin.

Copy the backend environment example and replace its placeholders:

```powershell
Copy-Item backend/.env.example backend/.env
```

Set `DATABASE_URL` to the `zootracker` database and set a private `BETTER_AUTH_SECRET` containing at least 32 characters. The real `.env` file is ignored by Git.

Generate Prisma Client and apply committed migrations:

```powershell
npm run prisma:generate
npm run prisma:migrate:deploy
```

For schema changes during development, use `npm run prisma:migrate -- --name descriptive-name`.

Create the initial administrator after applying the migration:

```powershell
npm run auth:bootstrap-admin
```

The command reads `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` from `backend/.env`. It creates the administrator once and is safe to rerun with the same email. After successful creation, replace or remove `ADMIN_PASSWORD` from your local environment; rerunning the command never resets an existing password. Do not commit real credentials.

## Run locally

Start the frontend and backend together:

```powershell
npm run dev
```

- Frontend: `http://localhost:5173`
- API health endpoint: `http://localhost:3000/api/health`
- Better Auth API: `http://localhost:3000/api/auth`
- Protected current-user endpoint: `http://localhost:3000/api/me`

Copy `frontend/.env.example` to `frontend/.env.local` only when the API URL differs from the default.

Open `http://localhost:5173/login` and sign in with the bootstrapped administrator. `GET /api/health` is public; application pages and other API routes require a valid cookie session. Public registration is disabled.

## Personnel and roles

Zootracker has exactly two application roles:

- **Keeper** accounts can sign in and use animal-care features, but cannot
  access personnel administration.
- **Administrator** accounts can manage personnel in addition to using the
  application.

An administrator can open `http://localhost:5173/personnel` to view the
directory and create accounts. Creating an account requires an initial password
of at least 12 characters. Share that password with the person through a channel
outside Zootracker; it is never returned by the API or shown in the personnel
list. Profile editing and account lifecycle management are intentionally
outside this phase.

The backend is the authorization boundary. Personnel endpoints use the
`@ApplicationRoles('admin')` metadata in
`backend/src/common/authorization/`, enforced by a global NestJS guard after
authentication. Later feature modules should use the same decorator for
role-specific API operations. Hiding a navigation item in React is never a
substitute for the backend check.

## Authentication tests

Normal `npm test` runs unit, component, route-protection, and non-database endpoint tests.

For the complete sign-in/session/sign-out flow, create an isolated test environment:

```powershell
Copy-Item backend/.env.test.example backend/.env.test
```

Edit `backend/.env.test` so `DATABASE_URL` points only to `zootracker_test`. Then apply the migration to that database and run the database-backed suite:

```powershell
$env:DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/zootracker_test?schema=public"
npm run prisma:migrate:deploy
npm run test:auth:e2e
npm run test:personnel:e2e
Remove-Item Env:DATABASE_URL
```

The database-backed suites delete only their own fixed test accounts. GitHub
Actions provisions an isolated PostgreSQL service and runs them automatically.

## Verify

```powershell
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
```

## Specifications

Project context and feature specifications live under [`specs/`](specs/).
