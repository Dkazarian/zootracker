# Animal, Personnel, and Feeding Plan Backend Refactor - Requirements

## Goal

Refactor the animal, personnel, and feeding-plan backend features to use
consistent controller, service, repository, type, and mapper boundaries.

The refactor must make persistence concerns easier to identify and test without
changing the existing API or product behavior.

## Scope

### Shared feature structure

- Keep NestJS controllers responsible for HTTP concerns:
  - receiving route parameters, validated request DTOs, and session data;
  - enforcing route-level authorization metadata; and
  - passing framework-independent values to the service.
- Keep services responsible for business rules, workflow coordination, and
  translating repository outcomes into application errors.
- Introduce one repository per feature to contain its Prisma reads, writes,
  selections, ordering, and transactions.
- Introduce feature mappers for explicit conversions between:
  - validated request inputs and persistence data;
  - persistence records and API responses; and
  - collections of persistence records and response collections where useful.
- Register each repository as a provider in its NestJS feature module.
- Keep feature-specific types inside the feature that owns them.

### Type boundaries and naming

- Keep classes with the `Dto` suffix at the HTTP boundary for NestJS
  validation and transformation.
- Use `Input` suffixes for values accepted by service methods.
- Use `Data` suffixes for values supplied to repository create or update
  operations.
- Use `Query` suffixes for repository lookup and list criteria.
- Use `Response` suffixes for the safe values returned by the application API.
- Do not make services depend on DTO classes when a plain business input type
  expresses the required contract.
- Do not expose Prisma models, Better Auth internals, passwords, sessions, or
  persistence-only fields in API response types.

### Animals

- Add an animal repository that owns animal database access, including:
  - directory filtering, searching, and ordering;
  - loading active or archived animals according to the requested visibility;
  - creating and updating animal records; and
  - archiving animals without deleting them.
- Keep the animal service responsible for:
  - enforcing archived-animal visibility by role;
  - rejecting empty updates;
  - validating birth and arrival date relationships;
  - rejecting changes to archived animals;
  - rejecting repeated archive operations; and
  - translating missing or conflicting records into the existing application
    errors.
- Add animal input, data, and query types that separate service contracts from
  Prisma operation shapes.
- Add animal mappers that convert create and update inputs into persistence
  data and persistence records into `AnimalResponse` values.
- Preserve the current animal routes, authorization, response shapes, search
  behavior, directory ordering, validation, visibility, and archive behavior.

### Personnel

- Add a personnel repository that owns personnel database access, including:
  - safe personnel selection and directory ordering;
  - lookup by identifier or normalized email;
  - active-administrator counting;
  - account lifecycle updates;
  - session deletion during deactivation; and
  - the transaction and lifecycle lock used to protect administrator
    invariants.
- Keep the personnel service responsible for:
  - normalizing and coordinating account creation through Better Auth;
  - rejecting duplicate email addresses with the existing safe conflict
    response;
  - preventing self-deactivation;
  - preventing deactivation of the last active administrator;
  - rejecting invalid lifecycle transitions; and
  - translating missing or invalid records into the existing application
    errors.
- Add personnel input and persistence types where they clarify the boundary
  between the controller, service, Better Auth, and repository.
- Add personnel mappers that produce safe `PersonnelResponse` values and
  validate that stored roles are valid Zootracker roles.
- Preserve the current personnel routes, authorization, response shapes,
  ordering, lifecycle locking, and session-revocation behavior.

### Feeding plans

- Add a feeding-plan repository that owns feeding-plan and supporting animal
  database access, including:
  - listing active plans with their creator and last modifier;
  - loading animals for visibility and active-state checks;
  - loading a plan with the animal state required for mutation checks;
  - creating, updating, and archiving plans; and
  - the existing list ordering and relation selections.
- Keep the feeding-plan service responsible for:
  - animal and plan visibility or mutability rules;
  - rejecting empty updates;
  - parsing and validating calendar dates;
  - calculating current feeding-plan timing and status;
  - setting audit identifiers supplied by the authenticated user; and
  - translating missing or conflicting records into the existing application
    errors.
- Add feeding-plan input, data, query, and internal record types where needed
  to separate business values from Prisma operation shapes.
- Add feeding-plan mappers that convert create and update inputs into
  persistence data and persistence records into `FeedingPlanResponse` values.
- Preserve the current feeding-plan routes, authorization, response shapes,
  ordering, date-only representation, configured zoo-timezone calculations,
  audit attribution, and archive behavior.

### Behavior preservation and tests

- Preserve all requirements already approved for animals, personnel, and
  feeding plans.
- Preserve existing HTTP status codes and user-facing error messages unless an
  existing test demonstrates that a correction is necessary.
- Update service unit tests to mock repositories rather than Prisma directly.
- Add focused repository tests for persistence behavior that is no longer
  exercised by service unit tests, especially animal filtering and ordering,
  personnel lifecycle transactions, and feeding-plan selections and ordering.
- Keep existing API and PostgreSQL-backed integration tests passing.
- Keep formatting, linting, type-checking, tests, and builds passing.

## Decisions

- This is an internal refactor, not a new roadmap product phase.
- The three features use the same naming and dependency direction where their
  responsibilities are equivalent.
- Repositories isolate Prisma persistence. They do not decide business
  permissions or translate failures into HTTP exceptions.
- Better Auth remains responsible for creating credential-bearing user
  accounts. The personnel service coordinates that operation with repository
  lookups because account creation is an application workflow, not a direct
  Prisma insert.
- Existing DTO validation remains unchanged unless moving a conversion requires
  an equivalent plain input type.
- Mappers remain feature-specific; no generic mapper or base repository
  abstraction is introduced.

## Context

- Before this refactor, animal, personnel, and feeding-plan services combine
  business rules, response mapping, and direct Prisma access.
- The intended structure gives each feature its own repository, mappers, and
  input, data, query, response, and internal record types where applicable.
- Personnel lifecycle operations require a PostgreSQL transaction and advisory
  lock to preserve at least one active administrator.
- Feeding-plan responses combine stored data with derived timing values in the
  configured zoo timezone.

## Out of Scope

- Changes to routes, request payloads, response payloads, permissions, or
  product behavior
- Frontend changes
- Prisma schema changes or migrations
- Changes to authentication or session strategy
- New personnel profile editing or role-changing features
- New feeding-plan scheduling rules
- Refactoring feeding history or other backend features
- A shared generic repository, mapper framework, or domain-layer framework
