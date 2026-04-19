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

// Create a unique cache name for this deploy so it knows there are updates
const CACHE = `cache-${version}`;
const ASSETS = [...build, ...files];

// Install service worker
self.addEventListener("install", (event) => {
  async function addFilesToCache() {
    const cache = await caches.open(CACHE);
    await cache.addAll(ASSETS);
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
  }

  event.waitUntil(deleteOldCaches());
});

// Listen to fetch events
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // only handle GET requests for now
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isHttp = url.protocol === "http:" || url.protocol === "https:";

  console.log("[sw] install", CACHE);
  console.log("[sw] activate", CACHE);
  console.log("[sw] fetch", { mode: request.mode, path: url.pathname });
  console.log("[sw] nav:fallback", {
    tried: ["request", "/", "/offline.html"],
    used: "...",
  });

  async function cacheFirst(): Promise<Response> {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(request);
    if (cached) return cached;

    const response = await fetch(request);
    if (isSameOrigin && isHttp && response.status === 200) {
      event.waitUntil(cache.put(request, response.clone()));
    }

    return response;
  }

  async function networkFirstWithCacheFallback(): Promise<Response> {
    const cache = await caches.open(CACHE);

    try {
      const res = await fetch(request);
      if (isSameOrigin && isHttp && res.status === 200) {
        event.waitUntil(cache.put(request, res.clone()));
      }

      return res;
    } catch {
      const cached = await cache.match(request);
      if (cached) return cached;

      throw new Error("Network failed and no cache match");
    }
  }

  async function handleNavigate(): Promise<Response> {
    const cache = await caches.open(CACHE);
    try {
      // Network-first for live content, no runtime HTML caching
      return await fetch(request);
    } catch {
      // 1) exact cached navigation URL
      const exact = await cache.match(request);
      if (exact) return exact;

      // 2) app shell fallback (preferred for offline-first app)
      const shell = await cache.match("/");
      if (shell) return shell;

      // 3) emergency static fallback
      const offline = await cache.match("/offline.html");
      if (offline) return offline;

      return new Response("Offline", { status: 503 });
    }
  }
  // 1) HTML navigations
  if (request.mode === "navigate") {
    event.respondWith(handleNavigate());
    return;
  }
  // 2) Precached build/static assets
  if (isSameOrigin && ASSETS.includes(url.pathname)) {
    event.respondWith(cacheFirst());
    return;
  }
  // 3) Other GETs
  if (isSameOrigin) {
    event.respondWith(networkFirstWithCacheFallback());
    return;
  }
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
