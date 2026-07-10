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
- [ ] Test Swagger UI loads without errors in local dev

**Validation:**
- [ ] Swagger UI is accessible and renders without errors
- [ ] OpenAPI JSON is valid and retrievable
- [ ] API metadata is correct (title, version, description)

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
- [ ] Add @ApiOperation, @ApiResponse, @ApiParam, @ApiQuery decorators to all endpoints
- [ ] Document response DTOs with @ApiProperty decorators
- [x] Add validation rules to DTO properties (min/max, pattern, required)
- [x] Document 401 (unauthorized) and 403 (forbidden) responses where applicable
- [ ] Document 400 (validation failure) responses
- [x] Document 404 (not found) responses for resource endpoints
- [ ] Document 409 (conflict) responses where applicable
- [x] Mark public endpoints explicitly; all others are protected by default
- [x] Add @ApiBearerAuth() or @ApiCookieAuth() to protected endpoints
- [x] Add examples to complex request/response bodies where helpful

**Validation:**
- [ ] All endpoints appear in Swagger UI with correct method and path
- [ ] Request body schemas match actual DTOs
- [ ] Response schemas are accurate and include all fields
- [ ] Error responses (401, 403, 404, 400, 409) are documented
- [ ] Authentication method is clear on protected endpoints
- [ ] No incomplete or placeholder descriptions

---

### TG3: Authentication and Authorization Documentation

**Objective:** Ensure Swagger clearly communicates auth requirements and role-based access.

**Implementation Tasks:**
- Add global security scheme for cookie-based authentication
- Document that Better Auth handles session cookies
- Add role badges/descriptions to endpoints (keeper, administrator, public)
- Ensure no endpoint documentation implies public sign-up is available
- Add security requirement to all protected endpoints
- Add inline notes on dashboard endpoints regarding data aggregation

**Validation:**
- Authentication method is clearly stated in Swagger schemes
- Each protected endpoint lists required role(s)
- No public sign-up language appears in documentation
- Cookie-based auth is communicated to API consumers

---

### TG4: Update Entity Relationship Model

**Objective:** Update `specs/entity-relationship-model.md` to reflect the current schema through Phase 9.

**Entry Points:**
- `backend/prisma/schema.prisma` (source of truth for schema)
- `specs/entity-relationship-model.md` (file to update)

**Implementation Tasks:**
- Document Better Auth models (User, Session, Account, Verification)
- Add Animals model with relationships
- Add FeedingPlan model with creator and last-modifier relationships
- Add FeedingTask model with claimant, completer, and last-modifier relationships
- Add all relationship cardinalities (1:N, N:N, etc.)
- Add a note that dashboard data is read-only aggregation from existing tables
- Ensure ERD matches `backend/prisma/schema.prisma` exactly
- Add a note that Prisma schema is the source of truth for physical details

**Validation:**
- All implemented models are documented
- All relationships are correctly shown
- Cardinalities are accurate
- ERD is readable and well-organized
- Notes about dashboard and Prisma as source of truth are present

---

### TG5: API Reference and Integration Testing

**Objective:** Verify API documentation is complete, accurate, and usable.

**Implementation Tasks:**
- Generate full OpenAPI JSON and validate against OpenAPI 3.0 spec
- Test all documented endpoints in Swagger UI (at least one example per endpoint group)
- Verify example requests generate valid payloads
- Test error responses (401, 403, 404, 400, 409) are correctly documented
- Verify Swagger UI works in clean browser session (no auth interference)
- Confirm no broken links in documentation

**Validation:**
- OpenAPI document is valid and complete
- All endpoints documented in Phase 9 appear in Swagger
- Example requests and responses are accurate
- Error cases are properly documented
- Swagger UI is functional for local development

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
