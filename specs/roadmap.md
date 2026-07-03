# Roadmap

Phases are intentionally small. Each phase should be independently reviewable, testable, and leave the application in a working state.

Every phase receives its own `requirements.md`, `paths.md`, `plan.md`, and
`validation.md` before implementation begins. Testing is part of each phase
rather than postponed until the end.

---

## ✅ Phase 1 - Hello Zootracker

- Create the `frontend/` React application and `backend/` NestJS application.
- Display a minimal Zootracker home page.
- Add a NestJS health endpoint and call it from the frontend.
- Configure formatting, linting, type-checking, and initial CI.

## ✅ Phase 2 - Authentication

- Connect Better Auth to PostgreSQL through Prisma.
- Validate the community-maintained NestJS integration.
- Support email-and-password sign-in and sign-out with cookie sessions.
- Protect the application and API from unauthenticated access.
- Seed the first administrator account; do not expose public registration.

## ✅ Phase 3 - Personnel and Roles

- Add the keeper and administrator roles.
- Allow administrators to create personnel accounts and view the personnel
  directory.
- Allow administrators to deactivate and reactivate keeper or administrator
  accounts.
- Prevent self-deactivation and preserve at least one active administrator.
- Revoke sessions when an account is deactivated while preserving its
  historical records.
- Enforce role permissions in both the API and user interface.
- Show the signed-in user's identity and role.

## ✅ Phase 4 - Animal Registry

- Add the animal database model and seed representative animals.
- Allow all authenticated personnel to browse, search, and view active animals.
- Allow administrators to create, update, and archive animal profiles.
- Preserve archived animal history.

## ✅ Phase 5 - Feeding Plans

- Allow keepers and administrators to create and archive an animal's immutable
  feeding plans while preserving archived plan history.
- Define natural-language feeding instructions, a morning, afternoon, or
  evening period, and a repeat-every-N-days schedule.
- Track when each active plan is next due.
- Show upcoming and due feeding needs without assigning them to a particular
  keeper.

## Phase 6 - Feeding Sessions and History

- Add feeding sessions linked to the exact immutable feeding plan and scheduled
  occurrence they represent.
- Allow keepers and administrators to complete planned feedings without first
  requiring a claim.
- Store the completing keeper, completion time, optional notes, and
  last-modification accountability on the completed session.
- Show completed sessions as an animal's chronological feeding history.
- Advance the plan's next due date atomically when a session is completed.
- Establish the session lifecycle that Phase 7 will extend with temporary
  claims.

## Phase 7 - Shared Feeding Queue and Session Claims

- Let keepers request the next available feeding needs from a shared queue.
- Preview the next three needs without claiming all of them.
- Allow one keeper to claim a scheduled feeding occurrence atomically.
- Extend feeding sessions with claimed, released, and completed states.
- Treat a claimed session as effectively expired after the global claim timeout
  without requiring a stored expired state or background expiration job.
- Treat claims as coordination signals: warn when another keeper owns the
  active claim, but allow a different keeper to complete the feeding.
- Preserve released, expired, and completed sessions for operational review.

## Phase 8 - Role-Aware Dashboards

- Replace the generic signed-in home with a dashboard suited to the user's
  role.
- Give keepers a feeding board with due work, active claims, and recent
  completions.
- Give administrators a concise operational overview of animals, personnel,
  species, locations, and feeding activity.
- Keep dashboards as views over existing workflows rather than introducing new
  business rules.

## Phase 9 - Weight History

- Add weight records linked to animals and keepers.
- Show an animal's chronological weight history.
- Allow keepers to record and correct measurements.
- Establish consistent units and validation rules.

## Phase 10 - Integration-Ready API

- Review the REST API as a stable interface for external clients.
- Complete OpenAPI documentation and consistent error responses.
- Add service-to-service authentication for authorized clients.
- Add idempotency support for feeding-session completion requests that may be
  retried.
- Verify that API and UI operations follow the same business rules.

**Core MVP milestone:** At this point Zootracker supports authenticated
personnel, animal management, feeding history, feeding plans, shared feeding
work with temporary claims, role-aware dashboards, weight history, and external
API access.

## Phase 11 - Trends and Operational Summaries

- Visualize weight changes over time for an animal.
- Summarize feeding activity over a selected period.
- Show operational counts such as due and completed feedings, including how
  long work has been due.
- Add useful filters and CSV export where appropriate.
- Present observations without veterinary diagnosis or prediction.

## Phase 12 - Responsive and Accessible Experience

- Refine the visual design and shared component patterns.
- Support desktop and mobile layouts.
- Review semantic structure, keyboard navigation, focus behavior, forms, and charts.
- Complete focus management and keyboard dismissal for confirmation dialogs,
  including the personnel deactivation confirmation deferred from Phase 3.
- Add clear loading, empty, success, and error states.

## Phase 13 - Production Readiness

- Add structured logging, request identifiers, and health checks.
- Review authentication, authorization, validation, rate limiting, and secure configuration.
- Complete the highest-value end-to-end workflows.
- Document local setup, architecture, API usage, and operational decisions.
- Select hosting and deploy the frontend, backend, and PostgreSQL database.

---

## Later Possibilities

These are intentionally outside the current roadmap and require a future roadmap revision:

- WhatsApp or other messaging integrations
- Permanent assignment of feeding work to particular keepers
- Notifications and reminders
- Food inventory and purchasing
- Veterinary and medical records
- Hardware or sensor integrations
- Predictive health analysis
