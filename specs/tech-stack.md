# Tech Stack

Zootracker is a TypeScript full-stack application with a React single-page frontend, a NestJS REST API, and a PostgreSQL database.

## Core

| Layer | Choice | Rationale |
|---|---|---|
| Language | TypeScript | Shared language and strong type checking across frontend and backend |
| Runtime | Node.js LTS | Mature ecosystem and native fit for the selected frameworks |
| Repository | Single repository with `frontend/` and `backend/` | Keeps both applications together without coupling their deployment |
| Package manager | npm | Widely available and sufficient for this project |

## Frontend

| Concern | Choice | Rationale |
|---|---|---|
| UI library | React | Component-based UI with a broad ecosystem |
| Build tool | Vite | Fast development server and production build for a client-side React application |
| Routing | React Router | Client-side routing between authenticated application screens |
| Server state | TanStack Query | Fetching, caching, invalidation, and synchronization of API data |
| API client | Browser Fetch API | Avoids an additional HTTP-client dependency |
| Forms | React Hook Form | Structured form state and error handling with minimal re-rendering |
| Form validation | Zod | Type-friendly client-side validation |

The visual styling approach and component library are not yet selected. Accessibility and responsive behavior are requirements regardless of that choice.

## Backend

| Concern | Choice | Rationale |
|---|---|---|
| Framework | NestJS | Provides modules, dependency injection, guards, validation, and a consistent application structure |
| HTTP platform | Express adapter | NestJS default with broad middleware compatibility |
| API style | REST | Clear resource-oriented interface for the frontend and future external clients |
| API contract | OpenAPI via NestJS Swagger | Machine-readable API documentation and an interactive development reference |
| Request validation | NestJS DTOs with `class-validator` | Integrates directly with NestJS pipes and Swagger metadata |

The backend will use feature-oriented NestJS modules. Microservices mode, CQRS, and elaborate domain layers are not initial requirements.

## Authentication and Authorization

| Concern | Choice |
|---|---|
| Authentication library | Better Auth |
| Login method | Email and password |
| Session strategy | Cookie-based sessions |
| Registration | Public sign-up disabled; administrators create personnel accounts |
| Authorization | Two application roles: keeper and administrator |

Better Auth owns password hashing, sessions, and standard account flows. Zootracker owns its product-specific personnel profile and authorization rules.

The Better Auth NestJS integration is community-maintained. This dependency should be validated in an early implementation phase before the rest of the application relies on it.

## Data

| Concern | Choice | Rationale |
|---|---|---|
| Database | PostgreSQL | Relational integrity, transactions, and strong support for reporting and time-based queries |
| ORM | Prisma | Type-safe access, approachable schema definitions, migrations, and official Better Auth support |
| Schema migrations | Prisma Migrate | Version-controlled, repeatable database changes |
| Development database | Locally installed PostgreSQL | Simple local workflow without requiring containers |
| Configuration | Environment variables | Allows local and hosted databases to use the same application code |

Database constraints and transactions should enforce important invariants rather than relying only on application validation.

## Project Structure

The frontend uses a lightweight feature-based structure:

```text
frontend/src/
├── app/                  # Application shell, providers, and routing
├── features/             # Product features and route-level behavior
│   ├── home/
│   ├── auth/
│   ├── personnel/
│   ├── animals/
│   ├── feedings/
│   ├── weights/
│   └── feeding-plans/
├── shared/
│   ├── api/              # Shared API client and cross-feature endpoints
│   ├── components/
│   │   └── layout/       # Application-wide layout components
│   └── styles/           # Global styles and design tokens
├── test/                 # Shared frontend test setup
└── main.tsx              # Browser entry point
```

Each frontend feature owns its business-specific components, API calls, hooks, types, and tests. Subdirectories are added only when a feature has enough files to need them.

The backend follows NestJS feature modules:

```text
backend/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── src/
│   ├── common/           # Cross-cutting guards, decorators, and filters
│   ├── health/
│   ├── auth/
│   ├── personnel/
│   ├── animals/
│   ├── feedings/
│   ├── weights/
│   ├── feeding-plans/
│   ├── app.module.ts
│   ├── app.setup.ts
│   └── main.ts
└── test/                 # Cross-module and API end-to-end tests
```

Backend feature modules keep their controllers, services, DTOs, and unit tests together. Prisma schema files and migrations remain outside `src/`.

### Conventions

- React component files use PascalCase, such as `AnimalCard.tsx`.
- NestJS files use kebab-case with descriptive suffixes, such as `animals.controller.ts`.
- Unit and component tests are colocated with the code they test.
- Cross-application and API end-to-end tests live in the relevant `test/` directory.
- Business-specific code stays within its feature.
- `shared/` and `common/` contain only code used across multiple features.
- Generic dumping grounds such as `utils/` are avoided.
- Explicit filenames are preferred over ambiguous `index.tsx` barrel files.
- Frontend API types will eventually be generated from OpenAPI rather than maintained in a manually shared package.
- Empty directories are not created in advance; the structure grows with implemented features.

## Testing

| Scope | Choice |
|---|---|
| Frontend unit and component tests | Vitest and React Testing Library |
| Backend unit tests | Jest |
| Backend integration and API tests | Jest and Supertest |
| End-to-end browser tests | Playwright |

Tests should cover business rules and authorization boundaries, not merely implementation details.

## Quality and Delivery

- ESLint for static analysis
- Prettier for formatting
- GitHub Actions for linting, type-checking, testing, and production builds
- Structured backend logging and request identifiers
- Environment-based secrets and configuration

## Deferred Decisions

- Styling approach and component library
- Production hosting for the frontend, backend, and PostgreSQL
- Transactional email provider for password recovery
- Charting library for analytics
- Production monitoring and error-reporting provider
- Docker or other containerization

Docker is not required for local development. It may be introduced later without changing the application architecture.
