# Phase 4: Animal Registry - Validation

## Automated Validation

From the repository root, all of the following must succeed:

1. Clean dependency installation
2. Prisma client generation
3. Clean migration and seed of an empty test database
4. Formatting check
5. Frontend and backend linting
6. Frontend and backend type-checking
7. Frontend unit and component tests
8. Backend unit and PostgreSQL-backed integration tests
9. Frontend and backend production builds

## Data and API Validation

1. Seed a clean database and confirm the representative animals are present
   without duplicate seed records.
2. Request each animal endpoint without a session and confirm HTTP `401`.
3. Sign in as a keeper and list, search, and retrieve active animals.
4. Search by partial name and species with different letter casing.
5. Confirm archived animals are absent from keeper lists, searches, and direct
   profile requests.
6. As a keeper, attempt create, update, archive, and archived-animal requests
   and confirm HTTP `403`.
7. As an administrator, create an animal with required fields and another with
   all supported fields.
8. Attempt invalid required fields, sex values, and dates and confirm useful
   validation responses.
9. Update an animal and confirm its identifier and creation timestamp remain
   unchanged.
10. Archive an animal and confirm it leaves active results but remains stored
    and visible to an administrator.
11. Attempt to edit an archived animal and confirm the request is rejected.
12. Confirm no endpoint permanently deletes an animal.

## Frontend Validation

1. Sign in as a keeper and confirm animal navigation is available.
2. Browse active animals and open an animal profile.
3. Search by name and species and confirm the results update correctly.
4. Confirm useful loading, empty, no-results, not-found, and failure states.
5. Confirm every seeded species shows the correct representative illustration
   in its card and profile.
6. Confirm an unmatched species shows the neutral fallback illustration.
7. Confirm illustration alternative text describes the represented species and
   does not identify it as the individual animal.
8. Confirm keeper screens contain no create, edit, archive, or archived-animal
   controls.
9. Sign in as an administrator and create an animal.
10. Edit the new animal and confirm the updated values appear without a full
   page reload.
11. Archive the animal through a confirmation step and confirm it leaves the
   active directory.
12. Confirm the archived animal remains available in the administrator archive
   view and cannot be edited.
13. Complete the core browse and administration flows using keyboard controls.
14. Repeat the core flows at a narrow mobile viewport and confirm there is no
    horizontal overflow.
15. Confirm there are no unexpected browser console errors.

## Security and Data Check

1. Confirm backend role checks protect every animal administration endpoint.
2. Confirm hiding interface controls is not the only permission control.
3. Confirm request DTOs reject unexpected fields.
4. Confirm archived animals cannot be changed or erased through the animal API.
5. Confirm seed data contains no real personal information or secrets.
6. Confirm credentials, cookies, database URLs, and authentication secrets are
   absent from committed files and logs.

## Validation Results - 2026-06-29

- Reset the isolated `zootracker_test` database successfully, applied both
  migrations from empty, and ran the representative seed twice successfully.
- Prisma generation, formatting, linting, type-checking, root tests, production
  builds, and the non-generated diff check passed.
- Frontend coverage passed with 18 tests and backend unit coverage passed with
  25 tests.
- PostgreSQL-backed authentication, personnel, and animal-registry suites
  passed with 4, 3, and 4 tests respectively.
- Database coverage confirms role enforcement, active and archived visibility,
  case-insensitive search, validation, creation, updating, archiving, read-only
  archives, and the absence of a delete endpoint.
- Browser checks confirmed administrator sign-in, representative seeded
  animals, case-insensitive search, required-field feedback, animal creation,
  profile display, and editing on the desktop layout.
- Generated local illustrations cover every seeded species, and automated
  coverage confirms case-normalized selection, fallback behavior, and
  representative alternative text.
- Temporary browser-test records were removed after validation.
- A final browser pass for the in-page archive confirmation, keeper experience,
  narrow viewport, and browser console remains pending because the browser
  session became blocked by the native confirmation that was subsequently
  replaced.

## Merge Criteria

The phase can be merged when:

- All automated and manual validation checks pass.
- Authenticated personnel can browse, search, and view active animals.
- Administrators can create, update, archive, and review archived animals.
- Keepers cannot perform administration or access archived animals.
- Animal validation and archive rules are enforced by the API.
- Seed data is repeatable.
- Archived animal records are preserved and no permanent-delete path exists.
- Phase 5 feeding-history work remains deferred.
- `requirements.md`, `plan.md`, and `validation.md` agree with the
  implementation.
