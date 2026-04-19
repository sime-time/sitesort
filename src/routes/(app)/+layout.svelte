<script lang="ts">
  import { onMount } from "svelte";
  import { invalidateAll } from "$app/navigation";
  import { pausePowerSync, setupPowerSync } from "$lib/client/db";
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

  const activeEntry = $derived(
    timeState.entries.find((entry) => entry.clockOutAt === null),
  );

  let { children, data } = $props();

  $effect(() => {
    if (activeEntry) {
      return startClock();
    } else {
      return stopClock();
    }
  });

  async function startSyncIfAllowed() {
    if (
      data.authState === "authenticated" &&
      data.user_id &&
      navigator.onLine
    ) {
      await setupPowerSync();
    }
  }

  onMount(() => {
    initTimeState();
    void startSyncIfAllowed();

    const onOffline = () => {
      void pausePowerSync();
    };

    const onOnline = async () => {
      await invalidateAll(); // rerun +layout.ts, refresh authState/user_id
      await startSyncIfAllowed();
    };

    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);
    return () => {
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onOnline);
    };
  });
</script>

<main class="h-dvh overflow-hidden flex flex-col pb-[calc(var(--dock-height))]">
  <ViewTransition />
  <TopBar />
  {@render children()}
  {#if activeEntry}
    <TimeBanner />
  {/if}
  <Dock />
</main>
