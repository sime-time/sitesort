# SiteSort

SiteSort is a simple mobile web app for electricians that replaces paper sheets used on job sites.

It lets crews:
- Create a job
- Quickly track materials used with tap-based counters
- Check off rough-in tasks
- Mark jobs as `in_progress` or `completed`

The product goal is to make material and job logging faster than paper with minimal typing and a low-friction mobile interface.

## Tech Stack

- SvelteKit (Svelte 5 runes)
- Tailwind + shadcn-svelte style UI components
- Zod + sveltekit-superforms for validation
- Static SPA build (`@sveltejs/adapter-static`) with fallback routing

## Architecture Direction

SiteSort is being built as an offline-first app.

- Core mutations should happen on the client first.
- Local persistence is Phase 1 (IndexedDB), with a repository abstraction.
- PowerSync integration is planned after local model stability.
- Backend sync/auth service remains a separate deployable service.

## Getting Started

Install dependencies:

```sh
npm install
```

Run the app locally:

```sh
npm run dev
```

Type-check and validate project setup:

```sh
npm run check
```

Create a production build:

```sh
npm run build
```

Preview production output:

```sh
npm run preview
```

## Deployment Notes

- Frontend is configured as a static SPA with fallback to `index.html`.
- Do not manually add `src/index.html`; fallback is generated at build time.
- Keep backend signing keys and sync secrets out of this frontend repository.

## Current Focus

Phase 1 objective is fully offline local create/list behavior before PowerSync sync wiring.

See `AGENTS.md` for project context, architectural constraints, and implementation tickets.
