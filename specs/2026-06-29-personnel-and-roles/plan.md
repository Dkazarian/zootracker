# Phase 3: Personnel and Roles - Implementation Plan

## Task Group 1 - Role model

1. ✅ Define shared backend role constants and a narrow `keeper | admin` type.
2. ✅ Configure Better Auth so created accounts receive an explicit valid role.
3. ✅ Add the role default and database constraint to the initial authentication
   migration.
4. ✅ Ensure `/api/me` returns a validated application role.
5. ✅ Test valid, missing, and unknown role values.

## Task Group 2 - Authorization foundation

1. ✅ Add a reusable NestJS role decorator and authorization guard.
2. ✅ Deny missing, unknown, or insufficient roles after authentication.
3. ✅ Return `401` for unauthenticated requests and `403` for authenticated users
   without permission.
4. ✅ Add focused guard and API authorization tests.
5. ✅ Document the role-enforcement pattern for later feature modules.

## Task Group 3 - Personnel API

1. ✅ Add a personnel NestJS module with controller, service, DTO, and safe
   response type.
2. ✅ Add an administrator-only endpoint to list personnel.
3. ✅ Add an administrator-only endpoint to create personnel through Better Auth.
4. ✅ Normalize email addresses and validate names, roles, and initial passwords.
5. ✅ Map duplicate emails and invalid input to useful API responses.
6. ✅ Return only safe personnel fields.
7. ✅ Deny browser access to generic Better Auth administration endpoints.

## Task Group 4 - Frontend identity and routing

1. ✅ Add a validated role to the frontend current-user model.
2. ✅ Display the signed-in user's name and role in the application header.
3. ✅ Add administrator-only personnel navigation and route handling.
4. ✅ Show a clear forbidden state for keepers who request `/personnel`.
5. ✅ Keep backend authorization authoritative.

## Task Group 5 - Personnel directory

1. ✅ Add a personnel API client and TanStack Query state.
2. ✅ Create an administrator directory with loading, empty, error, and populated
   states.
3. ✅ Add an accessible creation form for name, email, role, and initial password.
4. ✅ Refresh personnel data after successful creation.
5. ✅ Show useful validation, conflict, and success feedback.
6. ✅ Verify desktop and narrow mobile layouts.

## Task Group 6 - Tests, documentation, and validation

1. ✅ Add PostgreSQL-backed tests for listing, creation, validation, and
   authorization.
2. ✅ Add frontend tests for role display, navigation, route protection,
   directory states, and account creation.
3. ✅ Add an explicit personnel integration-test command.
4. ✅ Document roles, initial-password handling, and the authorization pattern.
5. ✅ Execute all automated validation commands.
6. ✅ Perform the API and browser checks in `validation.md`.
7. ✅ Confirm Phase 4 animal-registry behavior has not leaked into this phase.
8. ✅ Add checkmarks only after each step is complete and validated.
