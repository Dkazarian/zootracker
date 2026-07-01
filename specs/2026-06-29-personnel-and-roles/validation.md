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

## Account Lifecycle Amendment Validation

### API and data

1. As an administrator, deactivate an active keeper and confirm the response
   reports the account as inactive.
2. Confirm every existing session for the deactivated keeper is revoked.
3. Confirm the deactivated keeper cannot sign in or use a previously issued
   session.
4. Confirm the keeper's identifier, role, credentials, and related historical
   records remain stored.
5. Reactivate the keeper and confirm the same credentials can sign in again.
6. Deactivate and reactivate an administrator while another active
   administrator remains.
7. Attempt to deactivate the signed-in administrator and confirm the request is
   rejected.
8. Attempt to deactivate the last active administrator and confirm the request
   is rejected.
9. Send concurrent requests that could remove all active administrators and
   confirm at least one active administrator remains.
10. Attempt to deactivate an inactive account, reactivate an active account,
    and manage a missing account and confirm useful conflict or not-found
    responses.
11. Attempt every lifecycle endpoint without authentication and as a keeper and
    confirm `401` and `403` respectively.
12. Confirm no lifecycle endpoint deletes users or changes their roles,
    profiles, or passwords.

### Frontend

1. Confirm the personnel directory clearly distinguishes active and inactive
   accounts of both roles.
2. Deactivate an eligible keeper through an in-page confirmation step and
   confirm its status and available action update without a full reload.
3. Reactivate the keeper and confirm the directory returns to its active state.
4. Deactivate and reactivate an eligible administrator.
5. Confirm the signed-in administrator cannot initiate self-deactivation.
6. Confirm the last active administrator cannot be offered as an eligible
   deactivation target.
7. Confirm useful pending, success, conflict, and failure feedback.
8. Confirm lifecycle actions use labeled native controls. Full confirmation
   focus management and keyboard dismissal are deferred to Phase 12.
9. Repeat the lifecycle flow at a narrow mobile viewport without horizontal
   overflow.
10. Confirm there are no unexpected browser console errors.

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
8. Confirm deactivation revokes existing sessions rather than only hiding
   interface access.
9. Confirm self-deactivation and last-active-administrator protection are
   enforced by the API.
10. Confirm deactivation and reactivation preserve historical attribution.

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
- At original Phase 3 validation, automated coverage confirmed personnel
  profiles exposed no edit or deactivate controls. The 2026-06-30 amendment
  intentionally supersedes the deactivation portion of that result.

## Amendment Validation Results

Validation was rerun on 2026-07-01 against the current lifecycle
implementation.

- The focused PostgreSQL-backed personnel suite passed all 6 tests, including
  deactivation, reactivation, session revocation, self-protection,
  last-administrator protection, and concurrent-request coverage.
- Root `lint`, `typecheck`, `test`, and `build` passed. The root test command
  passed 27 frontend tests, 39 backend unit tests, and 3 enabled general
  end-to-end tests.
- `git diff --check` passed.
- `npm run format:check` reported existing drift across 54 files. The baseline
  cleanup is tracked in `specs/backlog.md`; `git diff --check` passed for the
  Phase 3 work.
- Browser validation against the freshly built backend confirmed
  administrator identity and navigation, active and inactive status, the
  deactivation warning, successful keeper deactivation and reactivation,
  self-deactivation protection, success feedback, and query refresh without a
  full reload.
- At a 375-pixel viewport, the personnel page had no horizontal overflow and
  retained its lifecycle controls. No warning or error was logged by the
  browser for the validated `localhost` flow.
- The browser pass found that opening the deactivation confirmation leaves
  focus on the background `Deactivate` button. Focus containment, keyboard
  dismissal, and focus restoration are deferred to Phase 12 and recorded in
  `specs/backlog.md`.
- Phase 3 is validated against its revised requirements. All amendment plan
  steps are complete.

## Merge Criteria

The phase can be merged when:

- All checks required by the revised Phase 3 scope pass. The repository
  formatting baseline and dialog focus work are explicit backlog items and are
  not Phase 3 merge criteria.
- Every account used by the application has one valid role.
- Keepers cannot access personnel through the UI or direct API requests.
- Administrators can list, create, deactivate, and reactivate personnel of
  either role.
- Existing sessions are revoked when an account is deactivated.
- Administrators cannot deactivate themselves or the last active
  administrator.
- Deactivation and reactivation preserve accounts and historical attribution.
- The signed-in user's identity and role are visible.
- Public registration remains unavailable.
- Personnel profile editing, role changes, and permanent deletion remain out of
  scope.
- Phase 4 animal-registry work remains deferred.
- `requirements.md`, `plan.md`, and `validation.md` agree with the
  implementation.
