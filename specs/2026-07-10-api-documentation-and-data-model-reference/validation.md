# Phase 10: API Documentation and Data Model Reference - Validation

## Swagger/OpenAPI validation

- Swagger UI loads locally at the chosen documentation route.
- OpenAPI JSON loads locally at the chosen JSON route.
- Product endpoints appear in the API reference for:
  - health and current user;
  - personnel;
  - animals;
  - feeding plans;
  - feeding tasks;
  - dashboards.
- Protected endpoints document cookie-session authentication.
- Role-specific endpoints document keeper/admin expectations.
- Request bodies, query parameters, and path parameters are understandable and
  match existing DTO validation.
- Response examples or response schemas are useful enough to understand the
  current API shape.
- Important error responses are documented for protected and mutating endpoints.
- Swagger documentation does not expose or imply public registration.

## ERD validation

- `specs/entity-relationship-model.md` reflects the current Prisma schema.
- The ERD includes feeding-task claim fields and claimant relationship.
- The ERD identifies dashboard data as derived from existing tables.
- The ERD does not document future weight-history tables as implemented.

## Focused automated checks

Run after Swagger setup and DTO annotations:

```powershell
npm.cmd run typecheck --workspace backend
npm.cmd test --workspace backend -- --runInBand dashboard feeding-tasks feeding-plans animals personnel auth
```

Run after documentation updates:

```powershell
npm.cmd run format:check
```

Before marking the phase complete, run from the repository root:

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
```

## Browser/manual checks

- Open Swagger UI locally and confirm it renders without browser console errors.
- Confirm OpenAPI JSON is valid JSON.
- In Swagger UI, inspect one protected endpoint from each product area and
  confirm its method, path, parameters, request body, response shape, and auth
  requirement are understandable.
- Confirm the normal Zootracker app still signs in and loads after Swagger is
  enabled.

## Validation results

- Not run yet.
