# Backlog

This file records accepted work that is intentionally deferred from the active
phase. An item must be moved into a phase specification before implementation.

## User experience and accessibility

- Move keyboard focus into the personnel deactivation confirmation when it
  opens, keep focus within the confirmation while it is active, support
  keyboard dismissal, and restore focus to the triggering control when it
  closes. Address this during Phase 12's keyboard-navigation and focus review.

## Refactor

- Analyze DB indexes.
- Reorganize paths

## Web
- Remove the cheesy headline from the dashboard
- When I press deactivate I have to scroll to see the confirmation.
- In the animal page show last feeding in the feeding plan card, and a button that opens a feeding history modal.
- Do not hide plan history.
- Allow keepers to see archived animals (do not allow archiving them)
- The browser url should read http://localhost:5173/admin/dashboard, it is the api that says "admin"
- Admin should be able to see the task pages
- Clicking in dashboard stuff should redirect (for instance, clicking on animal species should redirect to an animal search)
- I should be able to claim/release a task from the dashboard.
- I should be able to go to the task pages from the dashboard
- Time shouldn't have seconds
- Due should have another color or be a red pill next to the open/claimed one