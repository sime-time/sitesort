// Disables access to DOM typings like `HTMLElement` which are not available
// inside a service worker and instantiates the correct globals
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

// Ensures that the `$service-worker` import has proper type definitions
/// <reference types="@sveltejs/kit" />

// Only necessary if you have an import from `$env/static/public`
/// <reference types="../.svelte-kit/ambient.d.ts" />

import { build, files, version } from "$service-worker";

const self = globalThis.self as unknown as ServiceWorkerGlobalScope;

const CACHE = `cache-${version}`;
const APP_SHELL = "/";
const OFFLINE_FALLBACK = "/offline.html";
const ASSETS = [...build, ...files, APP_SHELL, OFFLINE_FALLBACK];

// Install service worker
self.addEventListener("install", (event) => {
  async function addFilesToCache() {
    const cache = await caches.open(CACHE);
    await cache.addAll(ASSETS);
    await self.skipWaiting();
  }

  event.waitUntil(addFilesToCache());
});

// Activate service worker
self.addEventListener("activate", (event) => {
  async function deleteOldCaches() {
    for (const key of await caches.keys()) {
      if (key !== CACHE) {
        await caches.delete(key);
      }
    }
    await self.clients.claim();
  }

  event.waitUntil(deleteOldCaches());
});

// Listen to fetch events
self.addEventListener("fetch", (event) => {
  // only handle GET requests for now
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  const isSameOrigin = url.origin === self.location.origin;

  async function respond() {
    const cache = await caches.open(CACHE);

    // Never try to cache third-party requests here
    if (!isSameOrigin) {
      return fetch(event.request);
    }

    // Precached assets: cache-first
    if (
      ASSETS.includes(url.pathname) ||
      url.pathname.startsWith("/_app/immutable/")
    ) {
      const precached = await cache.match(url.pathname);
      if (precached) return precached;
    }

    // Navigations: network-first, then app shell, then offline fallback
    if (event.request.mode === "navigate") {
      try {
        const response = await fetch(event.request);
        if (response instanceof Response && response.ok) {
          await cache.put(event.request, response.clone());
        }

        return response;
      } catch {
        const cachedNav = await cache.match(event.request);
        if (cachedNav) return cachedNav;

        const shell = await cache.match(APP_SHELL);
        if (shell) return shell;

        const offline = await cache.match(OFFLINE_FALLBACK);
        if (offline) return offline;

        return new Response("Offline", { status: 503 });
      }
    }

    // Other same-origin GET: network-first + runtime cache fallback
    try {
      const response = await fetch(event.request);
      if (response instanceof Response && response.ok) {
        await cache.put(event.request, response.clone());
      }

      return response;
    } catch {
      const cached = await cache.match(event.request);
      if (cached) return cached;

      return new Response("Not found", { status: 404 });
    }
  }

  event.respondWith(respond());
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
