# Phase 1: Hello Zootracker - Implementation Plan

## Task Group 1 - Repository and application scaffolds

1. Create the root npm configuration and scripts.
2. Scaffold the React/TypeScript frontend with Vite in `frontend/`.
3. Scaffold the NestJS backend in `backend/`.
4. Confirm both applications can be installed and built from the repository root.
5. Add repository-level formatting and ignore rules without duplicating generated configuration unnecessarily.

## Task Group 2 - Backend health endpoint

1. Configure the NestJS application with the `/api` global prefix.
2. Configure local CORS for the frontend development origin.
3. Add a health controller that serves `GET /api/health`.
4. Return a small, stable JSON response with `status: "ok"`.
5. Add a Supertest-based test covering status code and response body.

## Task Group 3 - Frontend home page

1. Replace the generated Vite demonstration content with a minimal Zootracker page.
2. Configure TanStack Query at the application root.
3. Add a small API function that calls the configured health endpoint with `fetch`.
4. Render loading, available, and unavailable states.
5. Add minimal plain CSS with semantic structure, readable typography, visible focus behavior, and a responsive layout.
6. Add a React Testing Library test for the page's essential identity and status behavior.

## Task Group 4 - Shared development workflow

1. Add the root `npm run dev` command to run frontend and backend development servers together.
2. Add root commands for linting, formatting checks, type-checking, tests, and production builds.
3. Ensure a failure in either application causes the corresponding root verification command to fail.
4. Add example environment configuration without committing secrets.

## Task Group 5 - Continuous integration and documentation

1. Add a GitHub Actions workflow using Node.js LTS and clean dependency installation.
2. Run formatting, linting, type-checking, tests, and builds in CI.
3. Add concise local setup and verification instructions to the project README.
4. Verify that documentation matches the actual commands.

## Task Group 6 - Phase validation

1. Execute every automated validation command from the repository root.
2. Perform the manual browser and API checks from `validation.md`.
3. Remove unused scaffold assets and generated demonstration code.
4. Confirm Phase 2 concerns have not leaked into this phase.
5. Record any accepted deviations in the feature specification before merge.
