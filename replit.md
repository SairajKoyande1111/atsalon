# Salon Billing Software

## Overview
A full-stack salon management and billing application built as a pnpm monorepo. Includes POS, customer management, service/product catalogs, appointment scheduling, staff management, memberships, expenses, and reporting.

## Architecture

### Monorepo Structure
- `artifacts/salon-billing/` — React 19 + Vite frontend
- `artifacts/api-server/` — Express.js 5 backend
- `lib/api-client-react/` — Auto-generated React Query hooks (via Orval)
- `lib/api-spec/` — OpenAPI spec (`openapi.yaml`) + Orval config
- `lib/api-zod/` — Auto-generated Zod schemas
- `lib/db/` — PostgreSQL schema (Drizzle ORM) — defined but backend uses MongoDB

### Tech Stack
- **Frontend**: React 19, Vite, Tailwind CSS v4, Radix UI, TanStack Query, Wouter, React Hook Form
- **Backend**: Express.js 5, TypeScript, tsx
- **Primary Database**: MongoDB (Mongoose) via `MONGODB_URI`
- **Secondary DB Schema**: PostgreSQL via Drizzle ORM (schema defined but API uses MongoDB)
- **API Layer**: OpenAPI contract-first with Orval code generation
- **Package Manager**: pnpm (workspace monorepo)

## Running the Application

### Development
```bash
bash start.sh
```
- Backend starts on **port 3000** (`PORT=3000`)
- Frontend starts on **port 5000** (`PORT=5000 BASE_PATH=/`)
- Vite proxies `/api` requests to `localhost:3000`

### Workflow
The "Start application" workflow runs `bash start.sh` and serves the web preview on port 5000.

## Environment Variables / Secrets Required
- `MONGODB_URI` — MongoDB connection string (set as secret)
- `DATABASE_URL` — PostgreSQL connection string (provisioned by Replit, used by Drizzle schema)

## Key Files
- `start.sh` — Startup script that launches both backend and frontend
- `artifacts/salon-billing/vite.config.ts` — Vite config with proxy to backend
- `artifacts/api-server/src/app.ts` — Express app entry point
- `lib/api-spec/openapi.yaml` — API specification (source of truth)
- `lib/db/src/schema/salon.ts` — PostgreSQL schema (Drizzle)

## Deployment
Configured for autoscale deployment:
- **Build**: `PORT=5000 BASE_PATH=/ pnpm --filter @workspace/salon-billing run build`
- **Run**: `PORT=3000 pnpm --filter @workspace/api-server run dev & PORT=5000 BASE_PATH=/ pnpm --filter @workspace/salon-billing run serve`
