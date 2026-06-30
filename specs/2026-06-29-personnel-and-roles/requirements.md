# Phase 3: Personnel and Roles - Requirements

## Goal

Give every signed-in person one clear application role and allow
administrators to create the personnel accounts that can access Zootracker.

This phase establishes the small authorization foundation that later
animal-care features will reuse.

## Scope

### Roles and authorization

- Support exactly two application roles: `keeper` and `admin`.
- Assign every newly created account one of those roles.
- Treat missing or unknown roles as unauthorized.
- Keep authentication required by default for the API.
- Make the API, not interface visibility, the authority for permissions.
- Restrict the personnel directory and account creation to administrators.
- Allow every authenticated user to access their own safe identity through
  `GET /api/me`.

### Personnel directory

- Represent personnel with the existing Better Auth user record instead of
  creating a second profile model.
- Allow an administrator to list personnel.
- Allow an administrator to create a person with a name, email, role, and
  initial password.
- Reject duplicate emails and invalid role values with clear, non-sensitive
  errors.
- Never expose password values, password hashes, sessions, or authentication
  internals in personnel responses or logs.

### Account lifecycle

- Allow an administrator to deactivate either a keeper or administrator
  account.
- Require confirmation before deactivating an account.
- Immediately revoke all sessions belonging to a deactivated account.
- Prevent deactivated accounts from signing in or accessing authenticated
  routes.
- Keep deactivated personnel in the directory with a clear inactive status.
- Preserve the stable user record and all historical attribution; deactivation
  must never delete a person or their related records.
- Do not allow an administrator to deactivate their own account.
- Do not allow the last active administrator to be deactivated.
- Allow an administrator to reactivate a deactivated keeper or administrator.
- Reactivation restores sign-in eligibility without recreating the account,
  changing its role, or resetting its password.
- Return useful conflict responses when an account is already in the requested
  state.

### User interface

- Show the signed-in user's name and role in the application header.
- Show personnel navigation and screens only to administrators.
- Provide an administrator page that lists each person's name, email, and role.
- Provide an accessible account-creation form.
- Show whether each account is active or inactive.
- Provide administrator controls to deactivate and reactivate eligible
  accounts.
- Hide or disable actions that would deactivate the signed-in administrator or
  the last active administrator.
- Show clear loading, empty, success, validation, and failure states.
- Show a forbidden experience without personnel data when a keeper directly
  requests an administrator route.

### Quality and documentation

- Add automated coverage for role enforcement, personnel listing, account
  creation, deactivation, reactivation, session revocation, and administrator
  safeguards.
- Document how administrator-created accounts receive their initial
  credentials.
- Preserve formatting, linting, type-checking, testing, build, database-test,
  and CI checks.

## Decisions

- Application code uses only `keeper` and `admin`; no custom permission editor
  or additional role hierarchy is introduced.
- Better Auth owns credentials and sessions. Zootracker owns valid roles and
  their product permissions.
- Personnel administration uses Zootracker REST endpoints rather than exposing
  generic Better Auth administration to the frontend.
- The existing Better Auth user record is sufficient for this phase.
- Administrators choose an initial password and communicate it outside
  Zootracker.
- Personnel profiles are read-only after creation in this phase.
- Deactivation changes account access without deleting or replacing the Better
  Auth user record.
- Better Auth's account administration fields represent active and inactive
  status; Zootracker does not introduce a second lifecycle model.
- Administrators may manage either application role but cannot deactivate
  themselves or the last active administrator.
- Reactivation is the inverse of deactivation and does not edit profile fields,
  roles, credentials, or historical records.
- The backend enforces every permission; conditional navigation is only a user
  experience improvement.
- The personnel directory is small enough that pagination and search are not
  required.

## Context

- Phase 2 configured Better Auth and created the first administrator.
- The project has not been released, so the initial authentication migration
  can define the two valid roles directly without a data-normalization
  migration.
- Better Auth stores internal administration fields that Zootracker does not
  need to expose as product features.
- Future care records can refer to the stable Better Auth user identifier.

## Out of Scope

- Editing personnel profiles or changing roles after creation
- Permanent account deletion
- Public registration or invitations
- Email delivery or verification
- Password reset, recovery, or forced first-login password changes
- Multi-factor authentication
- More than two roles or custom permissions
- Personnel audit history
- Bulk import or bulk actions
- Pagination, sorting controls, or personnel search
- Animal, feeding, weight, and feeding-plan behavior
