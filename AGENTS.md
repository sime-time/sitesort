# AGENTS.md

## Project Overview

SiteSort is a mobile-first web app for electricians that replaces paper sheets used on job sites.

Core workflows:
- Create a job
- Track materials with fast tap counters
- Check off job site tasks
- Mark jobs as complete/incomplete
- Clock in/out and edit time entries

Primary product goal:
- Field logging must be faster than paper with minimal typing and low-friction interactions.

## Current Stack

- Framework: SvelteKit (Svelte 5 runes)
- Styling: Tailwind CSS + shadcn-svelte style components
- Runtime/deploy target: Node server (`@sveltejs/adapter-node`)
- Local data + sync: `@powersync/web` + `@powersync/drizzle-driver` + `@journeyapps/wa-sqlite`
- Server DB access for upload handler: `drizzle-orm/node-postgres` + `pg`
- Auth client: `@neondatabase/neon-js/auth`

Key config:
- `src/routes/(app)/+layout.ts` uses `export const ssr = false`.
- `svelte.config.js` uses `@sveltejs/adapter-node`.
- `vite.config.ts` includes `vite-plugin-wasm`, excludes `@journeyapps/wa-sqlite` and `@powersync/web` from optimizeDeps, and sets `worker.format = "es"`.

## Architecture (Current Mental Model)

SiteSort is offline-first with a PowerSync-backed local DB.

Read/write model:
- UI reads and writes local tables through Drizzle wrapped over PowerSync (`src/lib/client/db.ts`).
- Time tracking reads/writes `time_entries` in local SQLite via Drizzle (`src/lib/client/crud/time-entries.ts`).
- Time UI state is hydrated from local DB in `src/lib/utils/time-state.svelte.ts`.
- Local writes are queued by PowerSync and uploaded asynchronously by connector `uploadData()` (`src/lib/client/connector.ts`).
- Uploads are best-effort and retryable; app UX should still work when offline.

Connection lifecycle:
- `initPowerSyncLocal()` initializes local DB once.
- `setupPowerSync()` is guarded with `initPromise` and `connectPromise` so repeated calls do not race or double-connect.
- App layout initializes local DB first, then hydrates time state locally via `initTimeState()`.
- App attempts remote connect when online, and retries on `online` and `visibilitychange` (`src/routes/(app)/+layout.svelte`).
- App render is gated on `dbReady && timeState.hydrated` to avoid first-paint time-state flicker.

Auth/offline behavior:
- `(app)` layout load path uses cached `LAST_KNOWN_USER_ID_KEY` for offline grace mode.
- If no cached user exists, app attempts live session and redirects to `/auth` if unavailable.
- Time CRUD user resolution checks live session first, then falls back to `LAST_KNOWN_USER_ID_KEY` (`src/lib/client/crud/time-entries.ts`).
- Cached user id is refreshed on successful session checks and removed only on explicit sign-out success (`src/routes/auth/+page.svelte`).

## PowerSync Upload Contract

Client connector behavior (`src/lib/client/connector.ts`):
- Calls `database.getNextCrudTransaction()` and processes one transaction at a time.
- Sends `POST /api/upload` with bearer token from Neon auth session.
- Payload shape sent by client: `{ crud: transaction.crud }`.
- Calls `transaction.complete()` on success.
- Also calls `transaction.complete()` for explicit fatal errors so queue does not stall forever.
- Throws on retryable failures so PowerSync retries later.

Fatal vs retryable handling:
- Fatal DB codes currently treated as discard-worthy:
  - Postgres class `23...` (integrity constraint violations)
  - `42501` (insufficient privilege / unauthorized operation)
- Retryable path:
  - Network issues
  - 5xx responses
  - unknown transient failures

## Upload API Semantics

Upload endpoint: `src/routes/api/upload/+server.ts`

Request requirements:
- `Authorization: Bearer <token>`
- JSON body matching:
  - `crud: Array<{ id, op, type, data? }>`
  - `op`: `PUT | PATCH | DELETE`
  - `type`: `jobs | tasks | materials | job_materials | time_entries`

Auth verification:
- Token is verified with `jose` using:
  - `NEON_AUTH_JWKS_URL`
  - `NEON_AUTH_ISSUER`
  - `NEON_AUTH_AUDIENCE`
- `payload.sub` is mapped to `user_id`.

Transaction behavior:
- Entire CRUD array is processed in a single Drizzle transaction.
- Dispatches by `entry.type` to specialized handlers in `src/lib/server/handlers`.

Response semantics important for connector behavior:
- `200 { ok: true }` => complete transaction.
- `200 { ok: false, errorCode: "42501" }` => non-retryable unauthorized; connector discards.
- `400 { ok: false, errorCode: "22023" }` for validation/shape issues.
- `500` for transient server failures; connector retries.

## Data Ownership and Guardrails

Current ownership enforcement:
- Jobs:
  - `PUT` requires payload `user_id` to equal token subject.
  - `PATCH` and `DELETE` are scoped by both `jobs.id` and `jobs.user_id`.
- Time entries:
  - `PUT` requires payload `user_id` to equal token subject.
  - `PATCH` and `DELETE` are scoped by both `time_entries.id` and `time_entries.user_id`.
  - `PATCH` rejects attempts to set `user_id`.
- `UnauthorizedUploadError` is normalized in `src/lib/utils/error-handling.ts` and surfaced as `errorCode: "42501"`.

Current limitation to keep in mind:
- Task/material/job-material handlers currently scope by row id only.
- They do not yet join back to `jobs.user_id` for explicit per-user ownership checks.

## Current Route/File Landmarks

- App shell and PowerSync startup: `src/routes/(app)/+layout.svelte`
- App auth/offline-grace load logic: `src/routes/(app)/+layout.ts`
- Time page (DB-backed clock/edit/delete flows): `src/routes/(app)/time/+page.svelte`
- Job create page (client-first submit): `src/routes/(app)/job/create/+page.svelte`
- Client DB + connect guards: `src/lib/client/db.ts`
- Time state + formatting helpers: `src/lib/utils/time-state.svelte.ts`
- Time CRUD helpers: `src/lib/client/crud/time-entries.ts`
- PowerSync connector + upload retry/fatal logic: `src/lib/client/connector.ts`
- Upload endpoint: `src/routes/api/upload/+server.ts`
- Upload schemas and transaction types: `src/lib/server/handlers/upload-schema.ts`
- Table-specific upload handlers: `src/lib/server/handlers/handle-*.ts`
- Time upload handler: `src/lib/server/handlers/handle-time-entry.ts`
- Shared server schema: `src/lib/server/schema.ts`
- Time-entry server migration: `src/lib/server/migrations/0006_zippy_timesheet.sql`

## Decisions to Preserve

- Keep core UX local-first; do not make network/server actions the critical path for field workflows.
- Keep upload handling idempotent and queue-safe (`transaction.complete()` rules are non-negotiable).
- Keep endpoint contract stable around `{ crud: [{ op, type, id, data? }] }`.
- Keep auth token verification on upload route strict (JWKS + issuer + audience).

## Known Technical Debt

- Add explicit ownership checks for non-`jobs` tables (`tasks`, `materials`, `job_materials`) using user-scoped joins.
- Add integration tests for upload retry/discard behavior to lock in queue semantics.
- Add migration snapshot metadata for latest migration (`src/lib/server/migrations/meta/0006_snapshot.json`) if using Drizzle snapshot workflow.
