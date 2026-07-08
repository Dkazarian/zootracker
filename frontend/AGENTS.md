# Frontend Guide

- Stack: React, TypeScript, Vite, React Router, TanStack Query.
- Product code lives under `frontend/src/features/`.
- Reusable frontend infrastructure lives under `frontend/src/shared/`.
- Start from the named route, component, hook, query, test, or feature folder.
- Follow direct imports before searching the whole frontend.
- Keep feature-specific UI, hooks, route components, and tests in the relevant
  feature folder.
- Put reusable UI, API client helpers, query utilities, and routing helpers
  under `shared`.
- Avoid broad frontend refactors or shared components unless justified by the
  active spec.
- Run the narrowest relevant frontend test/check first.
- Prefer component tests for frontend behavior during implementation; reserve
  browser checks for final real-page validation requested by the phase
  `validation.md`.
