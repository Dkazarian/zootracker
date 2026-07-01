# Backlog

This file records accepted work that is intentionally deferred from the active
phase. An item must be moved into a phase specification before implementation.

## User experience and accessibility

- Move keyboard focus into the personnel deactivation confirmation when it
  opens, keep focus within the confirmation while it is active, support
  keyboard dismissal, and restore focus to the triggering control when it
  closes. Address this during Phase 12's keyboard-navigation and focus review.

## Technical debt

- Establish a clean repository-wide Prettier baseline. `npm run format:check`
  currently reports existing drift across 54 files. Handle this as a dedicated
  formatting-only change so functional phase diffs remain reviewable.
