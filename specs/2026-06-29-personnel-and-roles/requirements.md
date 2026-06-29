# Phase 3: Personnel and Roles - Requirements

## Goal

Allow administrators to manage the people who can access Zootracker while
giving every signed-in user one clear application role. Keepers can use the
application but cannot manage personnel; administrators can create, update,
deactivate, and reactivate personnel accounts.

This phase establishes the authorization rules that later animal-care features
will reuse.

## Scope

### Roles and authorization

- Support exactly two application roles: `keeper` and `admin`.
- Assign every newly created account one of those roles.
- Treat missing or unknown roles as unauthorized rather than granting fallback
  access.
- Keep authentication required by default for the API.
- Make the API, not the user interface, the authority for role permissions.
- Restrict all personnel-management operations to administrators.
- Continue allowing every active authenticated user to access their own public
  identity through `GET /api/me`.

### Personnel lifecycle

- Represent personnel with the existing Better Auth user record; do not create
  a second source of truth for identity, role, or active status.
- Allow an administrator to list active and inactive personnel.
- Allow an administrator to create a person with a name, email, role, and
  initial password.
- Allow an administrator to update a person's name, email, and role.
- Allow an administrator to deactivate and reactivate an account.
- Revoke an account's existing sessions when it is deactivated.
- Prevent deactivated personnel from signing in or using an existing session.
- Preserve deactivated accounts and their identifiers for future historical
  records.
- Do not expose password values in API responses, application logs, or the
  personnel list.

### Administrative safety rules

- Prevent an administrator from deactivating their own account.
- Prevent an administrator from changing their own role from `admin`.
- Ensure the system always retains at least one active administrator.
- Reject duplicate email addresses and invalid role values with clear,
  non-sensitive errors.

### Personnel user interface

- Show the signed-in user's name and role in the application header.
- Show personnel navigation and screens only to administrators.
- Provide an administrator page that lists each person's name, email, role, and
  active status.
- Provide accessible forms for creating and editing personnel.
- Require explicit confirmation before deactivation.
- Provide clear loading, empty, success, validation, and failure states.
- Keep inactive personnel visually distinct and allow administrators to
  reactivate them.
- Ensure keepers who navigate directly to an administrator URL see an
  appropriate forbidden experience rather than personnel data.

### Quality and documentation

- Add automated coverage for role enforcement and the critical personnel
  lifecycle.
- Document how administrator-created accounts receive their initial
  credentials.
- Preserve the repository's formatting, linting, type-checking, testing, build,
  database-test, and CI checks.

## Decisions

- Application code uses the role names `keeper` and `admin`; no additional role
  hierarchy or custom permissions are introduced.
- Better Auth continues to own credentials and sessions. Zootracker owns which
  roles are valid and what each role may do.
- Personnel administration is exposed through Zootracker REST endpoints rather
  than giving the frontend direct access to generic Better Auth admin
  operations.
- The existing Better Auth user fields are sufficient for the current
  personnel profile. A separate personnel table would duplicate identity,
  role, and status without adding useful behavior in this phase.
- Administrators choose an initial password when creating an account and
  communicate it outside Zootracker.
- Deactivation is reversible and replaces permanent deletion.
- The backend enforces every permission. Conditional navigation is only a user
  experience improvement.
- Personnel lists are small enough that pagination and advanced search are not
  required in this phase.

## Context

- Phase 2 configured Better Auth's admin plugin and created the first
  administrator.
- The current Better Auth schema already stores a user's role and banned state.
  Phase 3 should reuse those fields while exposing only product-specific API
  contracts.
- Better Auth may use generic role defaults internally. Zootracker must
  configure account creation deliberately and must not silently treat a generic
  or missing role as `keeper`.
- Future feeding and weight records will refer to stable personnel identifiers,
  which is why deactivation must preserve the account.
- UI visibility is not an authorization boundary; direct API requests must
  receive the same permission checks.

## Out of Scope

- Public registration or invitations
- Email delivery or email verification
- Password reset, password recovery, or forced first-login password changes
- Multi-factor authentication
- More than two roles or custom permission editing
- Personnel deletion
- Personnel audit history
- Bulk import or bulk account actions
- Pagination, sorting controls, or advanced personnel search
- Animal, feeding, weight, and feeding-plan permissions beyond establishing the
  reusable role mechanism
