<script lang="ts">
  import { onMount } from "svelte";
  import { setupPowerSync } from "$lib/client/db";
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

  onMount(async () => {
    if (data.authState === "authenticated" && data.user_id) {
      await setupPowerSync();
    }
    initTimeState();
  });

  $effect(() => {
    if (activeEntry) {
      return startClock();
    } else {
      return stopClock();
    }
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
