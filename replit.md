# GymOS

GymOS is a mobile-first gym management app for owners and receptionists to run members, memberships, payments, attendance, trainers, reports, and gym activity from one place.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/gymos/app/` — Expo Router screens for the dashboard, members, payments, attendance, trainers, reports, and settings.
- `artifacts/gymos/context/GymContext.tsx` — persistent local app state and business actions.
- `artifacts/gymos/lib/gymos-data.ts` — domain types, seed records, status calculations, and formatting helpers.
- `artifacts/gymos/components/GymUI.tsx` — shared mobile UI primitives and design language.
- `artifacts/gymos/constants/colors.ts` — light and dark semantic color tokens.

## Architecture decisions

- The first mobile build uses AsyncStorage so the owner can work with persistent local records without requiring a backend connection.
- Payments are independent records and support completed/voided states; voiding preserves history and excludes revenue.
- Member deletion is represented as archiving so payment, attendance, and audit history remain intact.
- Attendance is source-tagged (`manual` or `biometric`) to leave a clean seam for future hardware integrations.

## Product

The app opens to a dashboard with live derived totals and alerts, then supports searchable members, detailed member history, full-payment receipts, manual attendance check-in/out, plans, trainers, reports, notifications, settings, and audit history. It ships with fictional demo data and persists changes locally.

## User preferences

The user requested a premium, modern, Android-oriented mobile experience using PKR / Rs. and an owner/receptionist authority model.

## Gotchas

The Expo app is the deployable artifact; the API server and mockup sandbox are sibling workspace services. Use the managed `artifacts/gymos: expo` workflow for the mobile preview.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
