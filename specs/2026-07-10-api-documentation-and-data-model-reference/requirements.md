# Phase 10: API Documentation and Data Model Reference - Requirements

## Purpose

Make Zootracker easier to understand, review, and integrate with by adding a
developer-facing API reference and bringing the data model documentation up to
date.

This phase is documentation-focused. It should not add new product workflows,
new permissions, new database tables, or new user-facing dashboard behavior.

## Swagger/OpenAPI API reference

- Add NestJS Swagger/OpenAPI support for the implemented product REST API.
- Expose:
  - an interactive Swagger UI for local development;
  - a machine-readable OpenAPI JSON document.
- The API reference must describe the implemented Zootracker product endpoints,
  including:
  - health and current-user endpoints;
  - personnel endpoints;
  - animal endpoints;
  - feeding plan endpoints;
  - feeding task queue, claim, completion, correction, and undo endpoints;
  - role-aware dashboard endpoints.
- Better Auth's internal auth endpoints do not need full endpoint-by-endpoint
  Swagger coverage in this phase, but the documentation must explain that the
  product API uses Better Auth cookie sessions.

## Authentication and authorization documentation

- Swagger must communicate that protected product endpoints use cookie-based
  authentication.
- Endpoint documentation must identify the intended application roles:
  - keeper;
  - administrator;
  - public only where explicitly public.
- Swagger documentation must not imply public sign-up exists.
- The documentation route may be available in local development, but exposing it
  must not make protected API operations bypass authentication or authorization.

## Request and response contracts

- Existing request DTOs should be annotated enough for Swagger to show useful
  request bodies, query parameters, path parameters, validation constraints, and
  examples where helpful.
- Existing response shapes should be represented with explicit documentation
  types instead of relying on unclear inferred structures.
- Common error responses should be documented where they are important for
  consumers:
  - unauthorized;
  - forbidden;
  - not found;
  - validation failure;
  - conflict.
- Runtime behavior and validation rules remain the source of truth. Swagger
  annotations must describe existing behavior, not loosen it.

## Entity relationship model

- Update `specs/entity-relationship-model.md` so it reflects the implemented
  schema through Phase 9.
- The ERD must include:
  - Better Auth user/session/account/verification models;
  - animals;
  - feeding plans;
  - feeding tasks;
  - task claimant, completer, and last-modifier relationships;
  - feeding plan creator and last-modifier relationships.
- The ERD should mention that dashboard data is read from existing tables and
  introduces no new persistence model.
- `backend/prisma/schema.prisma` remains the source of truth for physical
  schema details.

## Documentation boundaries

- Keep README/API usage notes concise and local-development oriented.
- Do not generate frontend API clients from OpenAPI in this phase.
- Do not add service-to-service authentication, idempotency keys, or external
  client credentials in this phase.
- Do not add weight-history documentation beyond preserving its future roadmap
  position.
