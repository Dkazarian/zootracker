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

GitHub Actions must provision PostgreSQL and run the same relevant quality gates
successfully.

## Role and API Validation

With the backend and isolated test database running:

1. Request each personnel endpoint without a session and confirm HTTP `401`.
2. Sign in as a keeper, request each personnel endpoint, and confirm HTTP `403`.
3. Confirm the keeper can still request `GET /api/me` and receives only their
   safe identity and `keeper` role.
4. Sign in as an administrator and confirm the personnel list returns only safe
   profile fields.
5. Create a keeper and an administrator and confirm each receives exactly the
   selected role.
6. Attempt creation with a duplicate email, an invalid role, and invalid fields
   and confirm useful non-sensitive errors.
7. Update a person's name, email, and role and confirm the changes are returned
   by subsequent reads and sessions as appropriate.
8. Attempt to assign a missing or unknown role and confirm the request is
   rejected.

## Lifecycle and Safety Validation

1. Deactivate a keeper and confirm the account remains in the personnel list as
   inactive.
2. Confirm deactivation revokes the keeper's existing sessions.
3. Confirm the deactivated keeper cannot sign in again.
4. Reactivate the keeper and confirm sign-in is available again with the same
   identity and role.
5. Attempt to deactivate the currently signed-in administrator and confirm the
   action is rejected.
6. Attempt to change the currently signed-in administrator to keeper and
   confirm the action is rejected.
7. Attempt any operation that would leave no active administrator and confirm
   it is rejected.
8. Confirm no lifecycle operation permanently deletes personnel or exposes
   credential data.

## Frontend Validation

With both applications started through `npm run dev`:

1. Sign in as an administrator and confirm the header shows the user's name and
   administrator role.
2. Confirm administrator navigation includes personnel management.
3. Open the personnel page and confirm active and inactive accounts are clearly
   identified.
4. Create a keeper through the form and confirm the new person appears without
   a full page reload.
5. Submit invalid and duplicate values and confirm useful field or form
   feedback.
6. Edit the keeper's name, email, and role and confirm the displayed data
   updates.
7. Start deactivation, cancel the confirmation, and confirm no change occurs.
8. Confirm deactivation, then reactivate the account and confirm both states are
   reflected.
9. Sign in as a keeper and confirm the header shows the keeper role and
   personnel navigation is absent.
10. Navigate directly to the personnel URL as the keeper and confirm no
    personnel data is displayed.
11. Refresh protected routes and confirm session and role behavior persists
    without flashing administrator content.
12. Complete the flows using keyboard controls and confirm focus and error
    feedback remain understandable.
13. Repeat the core list and form flows at a narrow mobile viewport and confirm
    there is no horizontal overflow.
14. Confirm there are no unexpected browser console errors during the complete
    flow.

## Security and Data Check

1. Confirm role checks are enforced by backend guards on every personnel
   endpoint.
2. Confirm hiding administrator interface elements is not the only permission
   control.
3. Confirm missing or unknown roles fail closed.
4. Confirm public sign-up remains disabled.
5. Confirm account creation and password handling continue through Better Auth;
   Zootracker does not implement password hashing.
6. Confirm list, create, and update responses omit password hashes, account
   credentials, session tokens, ban internals, and other private fields.
7. Confirm deactivation revokes sessions and is not implemented only as a
   frontend status.
8. Confirm database credentials, initial passwords, cookies, and authentication
   secrets are absent from committed files and logs.

## Merge Criteria

The phase can be merged when:

- All automated and manual validation checks pass.
- CI is green with PostgreSQL-backed personnel authorization tests.
- Every account used by the application has exactly one valid role.
- Keepers cannot read or mutate personnel through either the UI or direct API
  requests.
- Administrators can list, create, update, deactivate, and reactivate
  personnel.
- Deactivation blocks new sign-in and invalidates existing sessions without
  deleting the account.
- Self-protection and last-active-administrator safeguards work.
- The signed-in user's identity and role are visible in the application.
- Public registration remains unavailable.
- Phase 4 animal-registry work remains deferred.
- `requirements.md`, `plan.md`, and `validation.md` agree with the
  implementation.
