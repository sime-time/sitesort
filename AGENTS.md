# AGENTS.md

## Project Overview

SiteSort is a mobile-first web app for electricians that replaces paper sheets used on job sites.

Core user workflows:
- Create a job
- Track materials with fast tap-based counters
- Check off rough-in tasks
- Mark job status (`in_progress` / `completed`)

Primary product goal:
- Make field logging faster than paper with minimal typing and low-friction UI.

## Current Stack

- Framework: SvelteKit (Svelte 5 runes)
- Styling/UI: Tailwind + shadcn-svelte style components
- Validation: Zod + `sveltekit-superforms`
- Runtime/deploy target: Node server (`@sveltejs/adapter-node`)
- Client data layer: PowerSync Web SDK + Drizzle driver + wa-sqlite

Key config choices:
- `src/routes/(app)/+layout.ts` sets `export const ssr = false;` for app dashboard routes
- SSR is still available for non-`(app)` routes and server endpoints
- `svelte.config.js` uses `@sveltejs/adapter-node`
- `vite.config.ts` includes `vite-plugin-wasm` (+ top-level await plugin) and excludes `@journeyapps/wa-sqlite` / `@powersync/web` from optimizeDeps

## Architectural Direction

The app is planned as offline-first.

Target model:
- Client-first writes to local database on device
- Sync later to backend/Postgres via PowerSync
- UI should not depend on always-on network

Implications:
- Do not make server actions the primary mutation path for core user flows
- Prefer client-side validation + local repository writes
- Keep sync metadata in records from day one (`syncStatus`, timestamps, retry/error fields)

## Backend and Service Boundaries

Recommended service split:
1. Frontend app (`sitesort`) served by SvelteKit Node runtime
2. Dedicated backend for PowerSync auth/sync endpoints
3. Postgres as system-of-record backend store

PowerSync-style backend endpoints (external service):
- `GET /api/auth/token`
- `POST /api/auth/token`
- `GET /api/auth/keys`
- `PUT /api/data`
- `PATCH /api/data`
- `DELETE /api/data`

Notes:
- Keep frontend and backend as separate deployable services (can still share a monorepo).
- Framework choice for backend (Express vs Hono) is less important than stable endpoint contracts and security.
- In local/dev, uploads currently go through `src/routes/api/upload/+server.ts`.

## Forms and Validation

Known schema location:
- `src/lib/schemas/valid-job.ts`

Current new-job route:
- `src/routes/(app)/new-job/+page.svelte`

Guidance for job creation flow:
- Validate with shared Zod schema on client
- Submit to local data repository (Phase 1)
- Avoid relying on network/server action for core create path

Schema modeling guidance:
- Use `z.infer<typeof schema>` for data types
- If transporting dates as JSON strings, use `z.coerce.date()` on parse boundaries

## Offline-First Phase Plan (Phase 1)

Phase 1 objective:
- Fully offline local create/list behavior before PowerSync integration.

Phase 1 implementation principles:
- Add repository abstraction for jobs (UI depends on interface, not storage impl)
- Use local persistence adapter (IndexedDB now, PowerSync SQLite later)
- Generate client UUIDs
- Store sync state on each record (`pending`, later `synced` / `error`)
- Add basic offline UX indicators and status labels

## Product and UX Constraints

Design intent:
- Mobile-first and touch-efficient
- Minimize text entry
- Optimize for fast in-field interactions

Interaction priorities:
- Large tap targets
- Fast incremental actions (counters, checklists)
- Clear job state and progress visibility
- Avoid complex multi-step forms where possible

## Deployment Notes

Frontend:
- Adapter is `@sveltejs/adapter-node` (server runtime)
- App dashboard remains SPA-like by disabling SSR in `src/routes/(app)/+layout.ts`
- Keep WASM-capable Vite config for PowerSync/wa-sqlite support

Backend:
- Should be owned in your own repo/fork (not long-term pinned to demo source)
- Keep auth signing keys and secrets out of frontend and static builds

## Important Repo Context

- This repo currently includes only a small set of routes/components.
- Active upload endpoint exists at `src/routes/api/upload/+server.ts` for PowerSync CRUD upload handling.
- Client writes are local-first via PowerSync local DB, then uploaded through connector `uploadData()`.
- New-job form is client-handled in `src/routes/(app)/new-job/+page.svelte`.

## Decisions to Preserve

- Prioritize offline-first behavior over classic server form actions.
- Keep shared schema definitions under `$lib/schemas`.
- Keep architecture simple and incremental: local-first now, sync layer after local model stabilizes.

## Phase 1 Tickets

Ticket 1 - Define job domain model and schema boundaries
- Confirm `newJobSchema` shape for create input and add a stored record type using `z.infer`.
- Add sync metadata fields for local records (`syncStatus`, `syncError`, `createdAt`, `updatedAt`).
- Acceptance: shared types exist and are consumed by UI/repository code.

Ticket 2 - Create jobs repository abstraction
- Add a jobs repository interface in `$lib` with methods for create/list/get.
- Ensure route components call the repository, not storage APIs directly.
- Acceptance: UI compiles while depending only on repository methods.

Ticket 3 - Implement IndexedDB local adapter
- Create IndexedDB-backed implementation for the jobs repository.
- Persist job records locally with client UUIDs and `syncStatus: "pending"`.
- Acceptance: jobs persist across refresh while offline.

Ticket 4 - Convert new job submit flow to local-first
- Update `src/routes/new-job/+page.svelte` to handle submit on client.
- Validate with shared Zod schema before local write.
- Remove dependence on server form actions for core create path.
- Acceptance: creating a job succeeds with no network.

Ticket 5 - Add offline and sync status UX
- Show offline/online indicator in app shell or relevant pages.
- Show per-job sync status labels in job list views.
- Acceptance: user can tell if data is pending sync.

Ticket 6 - Add local persistence smoke tests
- Add tests or scripted checks for create/list persistence behavior.
- Include manual QA steps for browser offline mode and refresh.
- Acceptance: checklist verifies Phase 1 behavior repeatedly.

Ticket 7 - Prepare PowerSync integration seam
- Document the mapping between local record shape and future PowerSync tables.
- Add no-op or stub sync service boundary used by repository.
- Acceptance: PowerSync adapter can be introduced without changing route-level form code.
