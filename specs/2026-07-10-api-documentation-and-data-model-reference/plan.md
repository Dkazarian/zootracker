# Phase 10: API Documentation and Data Model Reference - Implementation Plan

## Overview

This phase adds Swagger/OpenAPI documentation and updates the entity relationship model to reflect the current implementation through Phase 9. All changes are documentation-focused with no new product workflows, permissions, or database tables.

## Task Groups

### TG1: NestJS Swagger Setup and Configuration

**Objective:** Install and configure Swagger/OpenAPI for the Zootracker backend.

**Entry Points:**
- `backend/package.json` (add @nestjs/swagger, swagger-ui-express)
- `backend/src/main.ts` (initialize Swagger in bootstrap)

**Implementation Tasks:**
- [x] Install @nestjs/swagger and swagger-ui-express dependencies
- [x] Create Swagger configuration (API title, description, version, tags)
- [x] Set up Swagger UI at `/api-docs` for local development
- [x] Expose OpenAPI JSON document at `/api-docs-json`
- [x] Configure Swagger to show authentication method (Cookie-based)
- [x] Test Swagger UI loads without errors in local dev

**Validation:**
- [x] Swagger UI is accessible and renders without errors
- [x] OpenAPI JSON is valid and retrievable
- [x] API metadata is correct (title, version, description)

---

### TG2: Annotate Endpoints and DTOs

**Objective:** Add Swagger decorators to all implemented endpoints and document request/response shapes.

**Entry Points:**
- `backend/src/health/health.controller.ts`
- `backend/src/auth/auth.controller.ts`
- `backend/src/users/users.controller.ts`
- `backend/src/animals/animals.controller.ts`
- `backend/src/feeding-plans/feeding-plans.controller.ts`
- `backend/src/feeding-tasks/feeding-tasks.controller.ts`
- `backend/src/dashboard/dashboard.controller.ts`
- All DTO files in `backend/src/**/*.dto.ts`

**Implementation Tasks:**
- [x] Add @ApiOperation, @ApiResponse, @ApiParam, @ApiQuery decorators to all endpoints
- [x] Document response DTOs with @ApiProperty decorators
- [x] Add validation rules to DTO properties (min/max, pattern, required)
- [x] Document 401 (unauthorized) and 403 (forbidden) responses where applicable
- [x] Document 400 (validation failure) responses
- [x] Document 404 (not found) responses for resource endpoints
- [x] Document 409 (conflict) responses where applicable
- [x] Mark public endpoints explicitly; all others are protected by default
- [x] Add @ApiBearerAuth() or @ApiCookieAuth() to protected endpoints
- [x] Add examples to complex request/response bodies where helpful

**Validation:**
- [x] All endpoints appear in Swagger UI with correct method and path
- [x] Request body schemas match actual DTOs
- [x] Response schemas are accurate and include all fields
- [x] Error responses (401, 403, 404, 400, 409) are documented
- [x] Authentication method is clear on protected endpoints
- [x] No incomplete or placeholder descriptions

---

### TG3: Authentication and Authorization Documentation

**Objective:** Ensure Swagger clearly communicates auth requirements and role-based access.

**Implementation Tasks:**
- [x] Add global security scheme for cookie-based authentication
- [x] Document that Better Auth handles session cookies
- [x] Add role badges/descriptions to endpoints (keeper, administrator, public)
- [x] Ensure no endpoint documentation implies public sign-up is available
- [x] Add security requirement to all protected endpoints
- [x] Add inline notes on dashboard endpoints regarding data aggregation

**Validation:**
- [x] Authentication method is clearly stated in Swagger schemes
- [x] Each protected endpoint lists required role(s)
- [x] No public sign-up language appears in documentation
- [x] Cookie-based auth is communicated to API consumers

---

### TG4: Update Entity Relationship Model

**Objective:** Update `specs/entity-relationship-model.md` to reflect the current schema through Phase 9.

**Entry Points:**
- `backend/prisma/schema.prisma` (source of truth for schema)
- `specs/entity-relationship-model.md` (file to update)

**Implementation Tasks:**
- [x] Document Better Auth models (User, Session, Account, Verification)
- [x] Add Animals model with relationships
- [x] Add FeedingPlan model with creator and last-modifier relationships
- [x] Add FeedingTask model with claimant, completer, and last-modifier relationships
- [x] Add all relationship cardinalities (1:N, N:N, etc.)
- [x] Add a note that dashboard data is read-only aggregation from existing tables
- [x] Ensure ERD matches `backend/prisma/schema.prisma` exactly
- [x] Add a note that Prisma schema is the source of truth for physical details

**Validation:**
- [x] All implemented models are documented
- [x] All relationships are correctly shown
- [x] Cardinalities are accurate
- [x] ERD is readable and well-organized
- [x] Notes about dashboard and Prisma as source of truth are present

---

### TG5: API Reference and Integration Testing

**Objective:** Verify API documentation is complete, accurate, and usable.

**Implementation Tasks:**
- [x] Generate full OpenAPI JSON and validate against OpenAPI 3.0 spec
- [x] Test all documented endpoints in Swagger UI (at least one example per endpoint group)
- [x] Verify example requests generate valid payloads
- [x] Test error responses (401, 403, 404, 400, 409) are correctly documented
- [x] Verify Swagger UI works in clean browser session (no auth interference)
- [x] Confirm no broken links in documentation

**Validation:**
- [x] OpenAPI document is valid and complete
- [x] All endpoints documented in Phase 9 appear in Swagger
- [x] Example requests and responses are accurate
- [x] Error cases are properly documented
- [x] Swagger UI is functional for local development

---

## Success Criteria

- NestJS Swagger is installed, configured, and running
- All implemented endpoints are documented with appropriate decorators
- Request/response DTOs are annotated and show in Swagger
- Authentication method (cookie-based) is clear in documentation
- Role-based access is documented on each endpoint
- All common error responses are documented (401, 403, 404, 400, 409)
- Entity relationship model is updated and matches Prisma schema
- OpenAPI JSON is valid and accessible
- Swagger UI is functional and displays no errors
- No new product workflows, permissions, or database tables are introduced
