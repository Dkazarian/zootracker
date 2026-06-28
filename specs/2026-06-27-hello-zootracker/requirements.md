# Phase 1: Hello Zootracker - Requirements

## Goal

Establish a working full-stack development path for Zootracker. A developer can start both applications from the repository root, open the frontend, and see that it has successfully communicated with the backend.

This phase proves the selected React/Vite and NestJS stack before product features are added.

## Scope

### Repository structure

- Create a React and TypeScript application in `frontend/`.
- Create a NestJS and TypeScript application in `backend/`.
- Provide root npm scripts for common development and verification commands.
- A single root command starts both development servers.

### Backend

- Expose `GET /api/health`.
- Return HTTP `200` with a small JSON response identifying the API as available.
- Allow the local frontend development origin to call the API.
- Include an automated test for the health endpoint.

### Frontend

- Display a minimal Zootracker home page using plain CSS.
- Briefly identify Zootracker as an animal-care application.
- Request the health endpoint through TanStack Query and the browser Fetch API.
- Display distinct loading, available, and unavailable API states.
- Read the API base URL from frontend environment configuration.
- Include an automated component test for the home page's essential content.

### Quality and delivery

- Configure linting, formatting, type-checking, tests, and production builds.
- Expose root npm scripts that run these checks across both applications.
- Add a GitHub Actions workflow that installs dependencies and runs the required checks.
- Document the commands needed to install, run, and verify Phase 1.

## Decisions

- The repository contains separate `frontend/` and `backend/` applications managed from the root with npm.
- The root development command is `npm run dev`.
- The backend uses NestJS with its default Express adapter and the global `/api` prefix.
- The health response is JSON and contains at least `status: "ok"`.
- The frontend uses plain CSS in this phase; selecting a long-term styling system remains deferred.
- Phase 1 uses no database, ORM, authentication, Docker, or domain data.
- Local development ports may use framework defaults, provided they are documented and configurable.

## Context

- The frontend and API are separate applications so they can later be deployed independently.
- The health request establishes the same frontend-to-API boundary future Zootracker features will use.
- The page should be intentionally minimal. Its purpose is to validate the stack, not establish the final product design.
- Accessibility remains relevant even at this stage: the page uses semantic markup and communicates API status as text rather than by color alone.

## Out of Scope

- PostgreSQL and Prisma
- Better Auth, sessions, and roles
- Personnel and animal records
- Feeding and weight features
- OpenAPI documentation beyond the health endpoint
- A component library or final visual design
- Production hosting and containerization
