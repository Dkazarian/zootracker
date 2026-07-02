# Phase 4: Animal Registry - Requirements

## Goal

Give authenticated personnel a reliable directory of the zoo's animals and
give administrators the minimum tools needed to maintain it.

This phase establishes the animal identity that feeding plans, feeding records,
and weight records will reference in later phases.

## Scope

### Animal profiles

- Store one profile for each animal with:
  - a system-generated identifier;
  - a required name;
  - a required species;
  - an optional sex with one of `female`, `male`, or `unknown`;
  - an optional date of birth;
  - an optional arrival date;
  - an optional current location;
  - optional general notes;
  - creation and last-update timestamps; and
  - an optional archive timestamp.
- Do not require animal names to be unique.
- Treat species and current location as plain text in this phase.
- Reject future birth and arrival dates.
- When both dates are known, reject an arrival date earlier than the date of
  birth.
- Display and enter animal profile dates as `dd/mm/yyyy` while preserving ISO
  date-only values in API requests.

### Animal directory

- Allow every authenticated person to browse active animals.
- Allow every authenticated person to search active animals by name or
  species.
- Allow every authenticated person to view an active animal's profile.
- Exclude archived animals from the default directory and search results.
- Allow administrators to browse and view archived animals.
- Show a generic local illustration for supported species in directory cards
  and animal profiles.
- Show a neutral fallback illustration when a species has no matching asset.
- Treat illustrations as representative of the species, not as photos of the
  individual animal.
- Provide clear loading, empty, no-results, and failure states.

### Animal administration

- Allow administrators to create animal profiles.
- Allow administrators to update animal profile fields.
- Allow administrators to archive animals.
- Require confirmation before archiving an animal.
- Preserve archived animals and their stable identifiers; do not delete their
  records.
- Do not allow archived profiles to be edited in this phase.
- Enforce all administration permissions in the API.

### Representative data

- Provide a repeatable development seed with a small set of representative
  animals across multiple species.
- Keep seed data fictional and suitable for local development.

### Quality and documentation

- Add automated coverage for animal validation, searching, authorization,
  creation, updating, and archiving.
- Document the animal fields and archive behavior.
- Preserve formatting, linting, type-checking, testing, build, database-test,
  and CI checks.

## Decisions

- An animal is a dedicated database model with a stable generated identifier.
- Animal names are display labels and are not unique identifiers.
- Species is free text rather than a separate taxonomy model.
- Current location is free text rather than an enclosure model or location
  history.
- Missing dates remain `null`; the application does not invent estimated
  dates.
- Archiving records when an animal leaves the active registry without erasing
  its history.
- Archived animals are available to administrators but hidden from keepers in
  this phase.
- There is no restore or permanent-delete operation in this phase.
- List and search results are small enough that pagination is not required.
- Species illustrations are bundled frontend assets selected from normalized
  species text; they do not add animal fields or external image requests.
- The API remains the authority for role permissions; hidden controls are only
  a user experience improvement.

## Context

- Phase 3 established the `keeper` and `admin` roles and reusable backend role
  enforcement.
- Later feeding, weight, and feeding-plan records need a stable animal
  identifier.
- The project has not been released, so the animal model can be introduced with
  a new migration without compatibility work for existing animal data.

## Out of Scope

- Feeding records, weight records, and feeding plans
- Medical, veterinary, or health records
- Species taxonomy and scientific classification
- Enclosure management and location history
- Animal-specific photos, uploads, and file storage
- Relationships between animals
- Bulk import and bulk actions
- Public animal pages
- Pagination and advanced filtering
- Restoring or permanently deleting archived animals
- Audit history beyond creation, update, and archive timestamps
