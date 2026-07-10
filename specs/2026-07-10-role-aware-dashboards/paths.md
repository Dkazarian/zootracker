# Phase 9: Role-Aware Dashboards - Paths

## Backend

Create:

- `backend/src/dashboard/dashboard.module.ts`
- `backend/src/dashboard/dashboard.controller.ts`
- `backend/src/dashboard/dashboard.service.ts`
- `backend/src/dashboard/dashboard.types.ts`
- `backend/src/dashboard/dto/keeper-dashboard-response.dto.ts`
- `backend/src/dashboard/dto/admin-dashboard-response.dto.ts`
- `backend/src/dashboard/dashboard.controller.spec.ts`
- `backend/src/dashboard/dashboard.service.spec.ts`

Modify:

- `backend/src/app.module.ts`
- `backend/src/common/authorization/application-roles.guard.ts` if dashboard route
  permissions need new role combinations
- `backend/src/common/authorization/application-roles.decorator.ts` if a new
  role helper is needed

## Frontend

Create:

- `frontend/src/features/dashboard/dashboard-api.ts`
- `frontend/src/features/dashboard/keeper/KeeperDashboardPage.tsx`
- `frontend/src/features/dashboard/keeper/components/KeeperDueWorkPanel.tsx`
- `frontend/src/features/dashboard/keeper/components/KeeperActiveClaimsPanel.tsx`
- `frontend/src/features/dashboard/keeper/components/KeeperRecentCompletionsPanel.tsx`
- `frontend/src/features/dashboard/admin/AdminDashboardPage.tsx`
- `frontend/src/features/dashboard/admin/components/AdminAnimalSummaryPanel.tsx`
- `frontend/src/features/dashboard/admin/components/AdminPersonnelSummaryPanel.tsx`
- `frontend/src/features/dashboard/admin/components/AdminSpeciesLocationPanel.tsx`
- `frontend/src/features/dashboard/admin/components/AdminFeedingActivityPanel.tsx`
- `frontend/src/features/dashboard/dashboard-api.test.ts`
- `frontend/src/features/dashboard/KeeperDashboardPage.test.tsx`
- `frontend/src/features/dashboard/AdminDashboardPage.test.tsx`

Modify:

- `frontend/src/app/App.tsx`
- `frontend/src/app/App.test.tsx`
- `frontend/src/features/home/HomePage.tsx` if it becomes a redirect or wrapper
- `frontend/src/features/auth/AdminRoute.tsx` if route layout needs reuse
- `frontend/src/features/auth/AuthenticatedLayout.tsx` if dashboard routes need
  shared shell changes
- `frontend/src/shared/api/current-user.ts` only if the dashboard needs extra
  session shape

## Notes

- Keep dashboard pages in their own `features/dashboard/` folder instead of
  mixing them into `features/home/`.
- Keep backend summary logic behind one `dashboard` module so route handlers stay
  small.
- If the implementation needs fewer files, prefer collapsing only within the
  same feature folder, not across pages.
