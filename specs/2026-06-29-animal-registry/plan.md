# Phase 4: Animal Registry - Implementation Plan

## Task Group 1 - Animal data model

1. ✅ Add the Prisma animal model and constrained sex values.
2. ✅ Create and apply the animal-registry database migration.
3. ✅ Generate the Prisma client.
4. ✅ Add a repeatable development seed with representative animals.
5. ✅ Verify a clean database can be migrated and seeded.

## Task Group 2 - Animal read API

1. ✅ Add an animal NestJS module with controller, service, DTOs, and response
   types.
2. ✅ Add an authenticated endpoint to list active animals.
3. ✅ Add case-insensitive name and species search.
4. ✅ Add an authenticated endpoint to retrieve one active animal.
5. ✅ Allow administrators to request archived animals without exposing them to
   keepers.
6. ✅ Return useful not-found and validation responses without leaking internals.

## Task Group 3 - Animal administration API

1. ✅ Add administrator-only animal creation.
2. ✅ Validate required text, allowed sex values, optional fields, and date rules.
3. ✅ Add administrator-only animal updates.
4. ✅ Add administrator-only animal archiving.
5. ✅ Prevent edits to archived animals.
6. ✅ Verify keepers cannot create, update, archive, or access archived animals.

## Task Group 4 - Animal directory and profile

1. ✅ Add the frontend animal API client, types, and TanStack Query state.
2. ✅ Add authenticated animal navigation and routes.
3. ✅ Build the active-animal directory with search.
4. ✅ Build the animal profile page.
5. ✅ Handle loading, empty, no-results, not-found, and failure states.
6. Verify keyboard use and desktop and narrow mobile layouts.
7. ✅ Add consistent local illustrations for the seeded species and a neutral
   fallback.
8. ✅ Show the representative species illustration in animal cards and profiles
   without changing the animal data model.

## Task Group 5 - Animal administration interface

1. ✅ Show animal administration controls only to administrators.
2. ✅ Build an accessible create form.
3. ✅ Build an accessible edit form.
4. ✅ Add archive confirmation and useful success or failure feedback.
5. ✅ Refresh affected query data after successful mutations.
6. ✅ Verify archived animals disappear from active views and remain available in
   the administrator archive view.

## Task Group 6 - Tests, documentation, and validation

1. ✅ Add backend unit and PostgreSQL-backed integration tests for animal rules,
   search, permissions, mutations, and archiving.
2. ✅ Add frontend tests for directory states, search, profiles, role-specific
   controls, forms, and archiving.
3. ✅ Add an explicit animal integration-test command if the existing database
   test command is not suitable.
4. ✅ Document the animal model, seed workflow, and archive behavior.
5. ✅ Execute all automated validation commands.
6. Perform the API and browser checks in `validation.md`.
7. ✅ Confirm Phase 5 feeding-history behavior has not leaked into this phase.
8. ✅ Add checkmarks only after each step is complete and validated.
