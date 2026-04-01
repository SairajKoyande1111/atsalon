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

### Tech Stack
- **Frontend**: React 19, Vite, Tailwind CSS v4, Radix UI, TanStack Query, Wouter, React Hook Form
- **Backend**: Express.js 5, TypeScript, tsx
- **Database**: MongoDB (Mongoose) via `MONGODB_URI` secret
- **API Layer**: OpenAPI contract-first with Orval code generation
- **Package Manager**: pnpm (workspace monorepo)

## Running the Application

### Development
```bash
bash start.sh
```
- Single unified server on **port 5000** only
- Express handles `/api/*` routes (MongoDB via Mongoose)
- Vite runs as Express middleware — serves frontend with full HMR
- No inter-process coordination needed; no port conflicts possible

### Workflow
The "Start application" workflow runs `bash start.sh` and serves the web preview on port 5000.

## Environment Variables / Secrets Required
- `MONGODB_URI` — MongoDB connection string (set as Replit secret)

## Key Files
- `start.sh` — Startup script
- `artifacts/salon-billing/vite.config.ts` — Vite config
- `artifacts/api-server/src/app.ts` — Express app entry point
- `artifacts/api-server/src/db/mongodb.ts` — MongoDB connection
- `lib/api-spec/openapi.yaml` — API specification (source of truth)

## Deployment
Configured for autoscale deployment:
- **Build**: `PORT=5000 BASE_PATH=/ pnpm --filter @workspace/salon-billing run build`
- **Run**: `PORT=5000 BASE_PATH=/ pnpm --filter @workspace/api-server run dev`
