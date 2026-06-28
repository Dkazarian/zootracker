# Phase 1: Hello Zootracker - Validation

## Automated Validation

From the repository root, all of the following must succeed:

1. Clean dependency installation
2. Formatting check
3. Frontend and backend linting
4. Frontend and backend type-checking
5. Frontend and backend tests
6. Frontend and backend production builds

The GitHub Actions workflow must run the same quality gates successfully.

## API Validation

With the backend running:

1. Request `GET /api/health`.
2. Confirm the response status is `200`.
3. Confirm the response is JSON.
4. Confirm the response contains `status: "ok"`.
5. Confirm the endpoint can be called from the local frontend without a CORS error.

## Frontend Validation

With both applications started through `npm run dev`:

1. Open the documented frontend URL.
2. Confirm the page clearly identifies Zootracker.
3. Confirm an API loading state is possible and does not appear as an error.
4. Confirm the page reports that the API is available after the health request succeeds.
5. Stop the backend and refresh or retry the request.
6. Confirm the page reports that the API is unavailable without crashing.
7. Confirm there are no unexpected browser console errors during the successful flow.

## Accessibility and Layout Check

1. Confirm the page uses a logical heading structure and semantic landmarks.
2. Confirm status is communicated with text, not color alone.
3. Confirm interactive elements can be reached and operated with a keyboard.
4. Confirm visible keyboard focus.
5. Confirm the page remains readable without horizontal scrolling at narrow mobile and normal desktop widths.

## Merge Criteria

The phase can be merged when:

- All automated and manual validation checks pass.
- CI is green.
- The frontend communicates with the backend through configurable environment settings.
- The repository contains no database, authentication, or product-domain implementation.
- Setup instructions work from a clean checkout.
- `requirements.md`, `plan.md`, and `validation.md` agree with the implementation.
