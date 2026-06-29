# Phase 3: Personnel and Roles - Validation

## Automated Validation

From the repository root, all of the following must succeed:

1. Clean dependency installation
2. Prisma client generation
3. Clean migration of an empty test database
4. Formatting check
5. Frontend and backend linting
6. Frontend and backend type-checking
7. Frontend unit and component tests
8. Backend unit and PostgreSQL-backed integration tests
9. Frontend and backend production builds

## Role and API Validation

1. Request each personnel endpoint without a session and confirm HTTP `401`.
2. Sign in as a keeper, request each personnel endpoint, and confirm HTTP
   `403`.
3. Confirm the keeper can request `GET /api/me` and receives only safe identity
   fields and the `keeper` role.
4. Sign in as an administrator and confirm the personnel list contains only
   safe profile fields.
5. Create a keeper and an administrator and confirm each receives the selected
   role.
6. Attempt creation with a duplicate email, invalid role, and invalid fields
   and confirm useful non-sensitive errors.
7. Confirm generic Better Auth administration endpoints cannot bypass the
   Zootracker personnel API.

## Frontend Validation

1. Sign in as an administrator and confirm the header shows the user's name and
   administrator role.
2. Confirm administrator navigation includes personnel management.
3. Open the personnel page and confirm names, emails, and roles are clear.
4. Create a keeper and confirm the new person appears without a full reload.
5. Submit invalid and duplicate values and confirm useful feedback.
6. Sign in as a keeper and confirm the header shows the keeper role and
   personnel navigation is absent.
7. Navigate directly to `/personnel` as a keeper and confirm no personnel data
   is shown.
8. Complete the form with keyboard controls and understandable focus and error
   feedback.
9. Repeat the core directory and form flow at a narrow mobile viewport and
   confirm there is no horizontal overflow.
10. Confirm no unexpected browser console errors.

## Security and Data Check

1. Confirm backend role checks protect every personnel endpoint.
2. Confirm hiding interface elements is not the only permission control.
3. Confirm missing or unknown roles fail closed.
4. Confirm public sign-up remains disabled.
5. Confirm account creation and password hashing continue through Better Auth.
6. Confirm responses omit passwords, credentials, session tokens, and Better
   Auth administration internals.
7. Confirm credentials, cookies, database URLs, and authentication secrets are
   absent from committed files and logs.

## Validation Results - 2026-06-29

- Reset both local databases successfully from the single amended
  authentication migration and recreated the initial administrator.
- Prisma generation, formatting, linting, type-checking, the root test command,
  production builds, and `git diff --check` passed.
- Frontend coverage passed with 8 tests and backend unit coverage passed with 21
  tests.
- The PostgreSQL-backed authentication suite passed with 4 tests and the
  simplified personnel suite passed with 3 tests.
- Browser validation confirmed administrator identity and navigation,
  personnel listing and creation, keeper route protection, a 375-pixel layout
  without horizontal overflow, and no console errors.
- Automated coverage confirms personnel profiles expose no edit or deactivate
  controls.

## Merge Criteria

The phase can be merged when:

- All automated and manual validation checks pass.
- Every account used by the application has one valid role.
- Keepers cannot access personnel through the UI or direct API requests.
- Administrators can list and create personnel.
- The signed-in user's identity and role are visible.
- Public registration remains unavailable.
- Personnel editing and account lifecycle management remain out of scope.
- Phase 4 animal-registry work remains deferred.
- `requirements.md`, `plan.md`, and `validation.md` agree with the
  implementation.
