# Frontend Guide

- Stack: React, TypeScript, Vite, React Router, TanStack Query.
- Product code lives under `frontend/src/features/`.
- Reusable frontend infrastructure lives under `frontend/src/shared/`.
- Start from the named route, component, hook, query, test, or feature folder.
- Follow direct imports before searching the whole frontend.
- Preserve cookie-based auth; do not introduce browser-stored bearer tokens.
- Keep feature-specific UI, hooks, route components, and tests in the relevant
  feature folder.
- Put reusable UI, API client helpers, query utilities, and routing helpers
  under `shared`.
- Avoid broad refactors, abstractions, dependencies, or shared components unless
  justified by the active spec.
- Run the narrowest relevant frontend test/check first.
- Follow the phase `validation.md` for manual and browser checks.