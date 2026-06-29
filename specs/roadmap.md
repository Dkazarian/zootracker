# Roadmap

Phases are intentionally small. Each phase should be independently reviewable, testable, and leave the application in a working state.

Every phase receives its own `requirements.md`, `plan.md`, and `validation.md` before implementation begins. Testing is part of each phase rather than postponed until the end.

---

## Phase 1 - Hello Zootracker

- Create the `frontend/` React application and `backend/` NestJS application.
- Display a minimal Zootracker home page.
- Add a NestJS health endpoint and call it from the frontend.
- Configure formatting, linting, type-checking, and initial CI.

## Phase 2 - Authentication

- Connect Better Auth to PostgreSQL through Prisma.
- Validate the community-maintained NestJS integration.
- Support email-and-password sign-in and sign-out with cookie sessions.
- Protect the application and API from unauthenticated access.
- Seed the first administrator account; do not expose public registration.

## Phase 3 - Personnel and Roles

- Add the keeper and administrator roles.
- Allow administrators to create personnel accounts and view the personnel
  directory.
- Enforce role permissions in both the API and user interface.
- Show the signed-in user's identity and role.

## Phase 4 - Animal Registry

- Add the animal database model and seed representative animals.
- Allow all authenticated personnel to browse, search, and view active animals.
- Allow administrators to create, update, and archive animal profiles.
- Preserve archived animal history.

## Phase 5 - Feeding History

- Add feeding records linked to animals and keepers.
- Show an animal's feeding history in chronological order.
- Allow keepers to record and correct feedings.
- Preserve creation and last-modification accountability.

## Phase 6 - Weight History

- Add weight records linked to animals and keepers.
- Show an animal's chronological weight history.
- Allow keepers to record and correct measurements.
- Establish consistent units and validation rules.

## Phase 7 - Feeding Plans

- Allow keepers to create and maintain an animal's feeding plan.
- Define recurring feeding expectations.
- Assign feeding responsibility to a keeper.
- Produce upcoming, due, and overdue feeding occurrences.

## Phase 8 - My Feeding Work

- Give each keeper a personalized list of animals they should feed.
- Allow filtering by upcoming, due, overdue, and completed work.
- Record a feeding directly from the personalized list.
- Make the feeding record satisfy the related scheduled occurrence without a separate completion action.

## Phase 9 - Integration-Ready API

- Review the REST API as a stable interface for external clients.
- Complete OpenAPI documentation and consistent error responses.
- Add service-to-service authentication for authorized clients.
- Add idempotency support for feeding-record requests that may be retried.
- Verify that API and UI operations follow the same business rules.

**Core MVP milestone:** At this point Zootracker supports authenticated personnel, animal management, feeding plans, assigned feeding work, feeding and weight records, and external API access.

## Phase 10 - Trends and Operational Summaries

- Visualize weight changes over time for an animal.
- Summarize feeding activity over a selected period.
- Show operational counts such as due, overdue, and completed feedings.
- Add useful filters and CSV export where appropriate.
- Present observations without veterinary diagnosis or prediction.

## Phase 11 - Responsive and Accessible Experience

- Refine the visual design and shared component patterns.
- Support desktop and mobile layouts.
- Review semantic structure, keyboard navigation, focus behavior, forms, and charts.
- Add clear loading, empty, success, and error states.

## Phase 12 - Production Readiness

- Add structured logging, request identifiers, and health checks.
- Review authentication, authorization, validation, rate limiting, and secure configuration.
- Complete the highest-value end-to-end workflows.
- Document local setup, architecture, API usage, and operational decisions.
- Select hosting and deploy the frontend, backend, and PostgreSQL database.

---

## Later Possibilities

These are intentionally outside the current roadmap and require a future roadmap revision:

- WhatsApp or other messaging integrations
- Notifications and reminders
- Food inventory and purchasing
- Veterinary and medical records
- Hardware or sensor integrations
- Predictive health analysis
