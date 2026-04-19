<script lang="ts">
  import { onMount } from "svelte";
  import { authClient } from "$lib/client/auth";
  import { initPowerSyncLocal, setupPowerSync } from "$lib/client/db";
  import {
    initTimeState,
    startClock,
    stopClock,
    timeState,
  } from "$lib/client/time-state.svelte";
  import Dock from "$lib/components/Dock.svelte";
  import TimeBanner from "$lib/components/TimeBanner.svelte";
  import TopBar from "$lib/components/TopBar.svelte";
  import ViewTransition from "$lib/components/ViewTransition.svelte";
  import { LAST_KNOWN_USER_ID_KEY } from "$lib/utils/last-known-user";

  const activeEntry = $derived(
    timeState.entries.find((entry) => entry.clockOutAt === null),
  );

  let { children } = $props();
  let dbReady = $state(false);

  $effect(() => {
    if (activeEntry) {
      return startClock();
    } else {
      return stopClock();
    }
  });

  onMount(() => {
    initTimeState();
    let alive = true;

    const tryConnect = async () => {
      if (!navigator.onLine) return;
      try {
        await setupPowerSync();
      } catch (err) {
        console.warn("PowerSync connect failed (non-fatal)", err);
      }
    };

    const onOnline = () => void tryConnect();
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") void tryConnect();
    };

    void (async () => {
      try {
        await initPowerSyncLocal();
        if (!alive) return;
        dbReady = true;
      } catch (err) {
        console.error("Local DB init failed", err);
        return;
      }

      void authClient
        .getSession()
        .then(({ data }) => {
          if (!alive) return;
          if (data?.user?.id) {
            localStorage.setItem(LAST_KNOWN_USER_ID_KEY, data.user.id);
          } else if (navigator.onLine) {
            localStorage.removeItem(LAST_KNOWN_USER_ID_KEY);
          }
        })
        .catch((err) => {
          console.warn("Session refresh failed (non-fatal)", err);
        });

      void tryConnect();
      window.addEventListener("online", onOnline);
      document.addEventListener("visibilitychange", onVisibilityChange);
    })();

    return () => {
      alive = false;
      window.removeEventListener("online", onOnline);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  });
</script>

<main
  class="h-dvh overflow-hidden flex flex-col pb-[calc(var(--dock-height)+env(safe-area-inset-bottom))]"
>
  <ViewTransition />
  <TopBar />

  {#if dbReady}
    {@render children()}
  {:else}
    <section class="flex flex-1 min-h-0 p-3 justify-center items-center">
      <span class="loading loading-spinner loading-xl"></span>
    </section>
  {/if}

  {#if activeEntry}
    <TimeBanner />
  {/if}
  <Dock />
</main>
