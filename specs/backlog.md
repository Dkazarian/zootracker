# Backlog

This file records accepted work that is intentionally deferred from the active
phase. An item must be moved into a phase specification before implementation.

## User experience and accessibility

- Move keyboard focus into the personnel deactivation confirmation when it
  opens, keep focus within the confirmation while it is active, support
  keyboard dismissal, and restore focus to the triggering control when it
  closes. Address this during Phase 12's keyboard-navigation and focus review.

## Technical debt

- Run `npm run format` across the repository to fix the 56 files currently
  reported by `npm run format:check`. Review and commit the result as a
  formatting-only change, then confirm `npm run format:check`, `npm run lint`,
  and `npm run typecheck` pass.
