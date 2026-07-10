# Phase 9: Role-Aware Dashboards - Requirements

## Summary

Replace the generic signed-in home with role-specific dashboards and matching
read-only API endpoints.

## Required Behavior

- Keep signed-in dashboard routes as the landing pages for each role.
- Use `/dashboard` for keeper users and `/admin/dashboard` for administrators.
- Show keepers a feeding-focused dashboard with:
  - due work;
  - active claims;
  - recent completions.
- Show administrators an operational dashboard with:
  - animal counts and status;
  - personnel counts and status;
  - species and location visibility;
  - feeding activity summaries.
- Reuse existing records, APIs, and authorization rules.
- Treat dashboards as views over current workflows, not new business rules.
- Keep claim, completion, animal, and personnel actions in their existing
  feature flows.
- Preserve the existing authenticated shell, loading state, and sign-out flow.
- Keep browser routes and backend endpoints aligned by role, but separate.

## Constraints

- Do not introduce permanent claim ownership or any new task-assignment rule.
- Do not add new dashboard-specific backend behavior unless current APIs are
  insufficient for the required view.
- Keep keeper and administrator experiences distinct, but based on the same
  authenticated session and role data already in the app.
- Use separate read-only endpoints for keeper and administrator summaries.

## Assumptions

- Existing feeding-task, feeding-plan, animal, and personnel data are enough to
  build both dashboards without new business entities.
- If a summary needs a new read-only endpoint, it should expose existing data
  only and not change workflow rules.
