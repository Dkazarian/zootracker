# Phase 3: Personnel and Roles - Implementation Plan

## Task Group 1 - Role model and account behavior

1. Define shared backend role constants and a narrow `keeper | admin` role type.
2. Configure Better Auth so administrator-created accounts receive an explicit
   valid role.
3. Add any required schema migration or data normalization for existing users.
4. Ensure `/api/me` returns a validated application role and active accounts
   remain compatible with existing sessions.
5. Add focused tests for valid, missing, and unknown role values.

## Task Group 2 - Reusable authorization foundation

1. Add a NestJS role requirement decorator and authorization guard.
2. Apply role checks after authentication and deny requests whose role is
   missing, unknown, or insufficient.
3. Return consistent HTTP `401` responses for unauthenticated requests and
   `403` responses for authenticated users without permission.
4. Add unit tests for keeper, administrator, inactive, and invalid-role cases.
5. Document the pattern that later feature modules should use for role
   enforcement.

## Task Group 3 - Personnel API

1. Add a personnel NestJS feature module with controller, service, DTOs, and
   response types.
2. Add an administrator-only endpoint to list active and inactive personnel.
3. Add an administrator-only endpoint to create personnel through Better Auth
   with a name, normalized email, role, and initial password.
4. Add an administrator-only endpoint to update a person's name, email, and
   role.
5. Add administrator-only endpoints to deactivate and reactivate personnel.
6. Revoke active sessions as part of deactivation.
7. Enforce self-protection and last-active-administrator invariants safely.
8. Map duplicate email, missing personnel, invalid input, and conflicting state
   to clear API responses.
9. Return only safe personnel fields and never return credential data.

## Task Group 4 - Frontend identity and role routing

1. Add a validated role to the frontend session/current-user model.
2. Display the signed-in user's name and role in the application header.
3. Add administrator-only navigation to personnel management.
4. Add an administrator route boundary for personnel pages.
5. Show a clear forbidden state when a keeper directly requests an
   administrator route.
6. Keep server authorization errors authoritative even when the interface has
   already hidden an action.

## Task Group 5 - Personnel management interface

1. Add a personnel API client and TanStack Query keys, queries, and mutations.
2. Create an administrator personnel page with loading, empty, error, active,
   and inactive states.
3. Add an accessible create form for name, email, role, and initial password.
4. Add an accessible edit form for name, email, and role.
5. Add explicit deactivation confirmation and a reactivation action.
6. Invalidate or update cached personnel data after successful mutations.
7. Show actionable validation and conflict feedback without exposing sensitive
   information.
8. Verify the page remains usable at desktop and narrow mobile widths.

## Task Group 6 - Automated integration coverage

1. Add PostgreSQL-backed API tests for personnel listing, creation, updating,
   deactivation, and reactivation.
2. Verify unauthenticated requests receive `401` and keeper requests receive
   `403` for every personnel-management operation.
3. Verify duplicate emails, invalid roles, self-demotion, self-deactivation,
   and last-active-administrator protection.
4. Verify deactivation invalidates existing sessions and blocks new sign-in.
5. Add frontend tests for role display, administrator navigation, route
   protection, personnel forms, and lifecycle actions.
6. Ensure database tests isolate their users and sessions from local
   development data.
7. Update CI and root scripts if a new explicit personnel integration-test
   command is needed.

## Task Group 7 - Documentation and phase validation

1. Document the personnel roles, administrator workflow, initial-password
   handling, and deactivation behavior.
2. Execute every automated validation command from the repository root.
3. Perform the API and browser checks in `validation.md`.
4. Confirm no password, cookie, secret, or database connection value is logged
   or committed.
5. Confirm animal-registry behavior from Phase 4 has not leaked into this
   phase.
6. Update this plan with checkmarks only after each step is completed and
   validated.

