# Zootracker

Zootracker is an internal animal-care application built with a React frontend and a NestJS API.

## Requirements

- Node.js 24
- npm 11

Phase 1 does not require PostgreSQL.

## Install

```powershell
npm install
```

## Run locally

Start the frontend and backend together:

```powershell
npm run dev
```

- Frontend: `http://localhost:5173`
- API health endpoint: `http://localhost:3000/api/health`

Copy `frontend/.env.example` to `frontend/.env.local` only when the API URL differs from the default.

## Verify

```powershell
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
```

## Specifications

Project context and feature specifications live under [`specs/`](specs/).
