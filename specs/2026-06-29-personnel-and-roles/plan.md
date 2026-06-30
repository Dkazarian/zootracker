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

## Amendment - Account lifecycle (2026-06-30)

The following task groups extend the completed Phase 3 scope. Existing
checkmarks describe the original implementation and remain unchanged.

## Task Group 7 - Personnel lifecycle API

1. Expose a safe active or inactive status in personnel responses.
2. Add administrator-only endpoints to deactivate and reactivate personnel.
3. Use Better Auth account state and session handling rather than introducing a
   second lifecycle model.
4. Revoke every existing session when an account is deactivated.
5. Prevent the signed-in administrator from deactivating their own account.
6. Prevent the last active administrator from being deactivated, including
   concurrent requests.
7. Preserve user identifiers, roles, credentials, and related historical
   records through both lifecycle operations.
8. Return useful not-found and already-active or already-inactive conflict
   responses.

## Task Group 8 - Personnel lifecycle interface

1. Add active and inactive status to the personnel API schema and directory.
2. Add administrator controls to deactivate eligible active accounts.
3. Require accessible in-page confirmation before deactivation.
4. Add administrator controls to reactivate inactive accounts.
5. Prevent self-deactivation and last-administrator actions from being offered
   as valid controls.
6. Refresh personnel and session-related query state after successful
   mutations.
7. Show useful pending, success, conflict, and failure feedback.
8. Verify keyboard use and desktop and narrow mobile layouts.

## Task Group 9 - Lifecycle tests, documentation, and validation

1. Add backend unit and PostgreSQL-backed tests for deactivation, reactivation,
   session revocation, role coverage, self-protection, and last-administrator
   protection.
2. Add frontend tests for status display, confirmation, actions, safeguards,
   and mutation feedback.
3. Update personnel documentation and `CHANGELOG.md`.
4. Execute all automated validation commands.
5. Perform the amended API and browser checks in `validation.md`.
6. Confirm profile editing, role changes, and permanent deletion remain out of
   scope.
7. Add `✅` only after each amendment step is complete and proportionately
   validated.
