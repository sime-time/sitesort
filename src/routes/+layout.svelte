<script lang="ts">
  import faviconDark from "$lib/assets/favicon-dark.svg";
  import faviconLight from "$lib/assets/favicon-light.svg";
  import { dbg } from "$lib/utils/debug";
  import "@fontsource-variable/space-grotesk/wght.css";
  import "@fontsource-variable/work-sans/wght.css";
  import { onMount } from "svelte";
  import { Toaster } from "$lib/components/sonner";

  import "../app.css";

  let { children } = $props();

  async function detectSWUpdate() {
    const registration = await navigator.serviceWorker.ready;

    registration.addEventListener("updatefound", () => {
      const newSW = registration.installing;
      newSW?.addEventListener("statechange", () => {
        if (newSW.state === "installed") {
          if (confirm("New update available! Reload to update?")) {
            newSW.postMessage({ type: "SKIP_WAITING" });
            window.location.reload();
          }
        }
      });
    });
  }

  onMount(() => detectSWUpdate());
  onMount(() => {
    dbg("app", "mount", { href: location.href });
    window.addEventListener("pageshow", (e) =>
      dbg("app", "pageshow", {
        persisted: (e as PageTransitionEvent).persisted,
        href: location.href,
      }),
    );
    window.addEventListener("pagehide", (e) =>
      dbg("app", "pagehide", {
        persisted: (e as PageTransitionEvent).persisted,
        href: location.href,
      }),
    );
    window.addEventListener("offline", () => dbg("net", "offline"));
    window.addEventListener("online", () => dbg("net", "online"));
    window.addEventListener("error", (e) =>
      dbg("window", "error", {
        message: e.message,
        file: e.filename,
        line: e.lineno,
        col: e.colno,
      }),
    );
    window.addEventListener("unhandledrejection", (e) =>
      dbg("window", "unhandledrejection", { reason: String(e.reason) }),
    );
  });
</script>

<svelte:head>
  <link
    rel="icon"
    href={faviconLight}
    type="image/svg+xml"
    media="(prefers-color-scheme: light)"
  >
  <link
    rel="icon"
    href={faviconDark}
    type="image/svg+xml"
    media="(prefers-color-scheme: dark)"
  >
</svelte:head>

<Toaster />
<main class="w-full min-h-dvh flex justify-center">
  <div class="w-full max-w-120 min-h-dvh">{@render children()}</div>
</main>
