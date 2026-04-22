<script lang="ts">
  import faviconDark from "$lib/assets/favicon-dark.svg";
  import faviconLight from "$lib/assets/favicon-light.svg";
  import "@fontsource-variable/space-grotesk/wght.css";
  import "@fontsource-variable/work-sans/wght.css";
  import { onMount } from "svelte";
  import InstallPWA from "$lib/components/install/InstallPWA.svelte";
  import { Toaster } from "$lib/components/sonner";

  import "../app.css";

  let { children } = $props();

  async function detectSWUpdate() {
    if (!("serviceWorker" in navigator)) return;

    const registration = await navigator.serviceWorker.ready;

    const promptAndActivate = (waitingWorker: ServiceWorker) => {
      if (!confirm("New update available! Reload to update?")) return;

      let reloaded = false;

      const onControllerChange = () => {
        if (reloaded) return;
        reloaded = true;
        window.location.reload();
      };

      navigator.serviceWorker.addEventListener(
        "controllerchange",
        onControllerChange,
        { once: true },
      );

      waitingWorker.postMessage({ type: "SKIP_WAITING" });
    };

    const maybePromptForWaiting = () => {
      if (registration.waiting) {
        promptAndActivate(registration.waiting);
      }
    };

    // Case 1: update already downloaded before this page loaded
    maybePromptForWaiting();

    // Case 2: update found while this page is open
    registration.addEventListener("updatefound", () => {
      const newSW = registration.installing;
      if (!newSW) return;
      newSW.addEventListener("statechange", () => {
        if (newSW.state === "installed" && registration.waiting) {
          promptAndActivate(registration.waiting);
        }
      });
    });
  }

  onMount(() => detectSWUpdate());
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
  <InstallPWA />
  <div class="w-full max-w-120 min-h-dvh">{@render children()}</div>
</main>
