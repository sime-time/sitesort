<script lang="ts">
  import { onMount } from "svelte";
  import { setupPowerSync } from "$lib/client/db";
  import { timeState } from "$lib/client/time-state.svelte";
  import Dock from "$lib/components/Dock.svelte";
  import TimeBanner from "$lib/components/TimeBanner.svelte";
  import TopBar from "$lib/components/TopBar.svelte";

  const activeEntry = $derived(
    timeState.entries.find((entry) => entry.clockOutAt === null),
  );

  let { children } = $props();
  onMount(async () => await setupPowerSync());
</script>

<main
  class="h-dvh overflow-hidden flex flex-col pb-[calc(var(--dock-height)+env(safe-area-inset-bottom))]"
  style="--dock-height: 3.8rem"
>
  <TopBar />
  {@render children()}
  {#if activeEntry}
    <TimeBanner />
  {/if}
  <Dock />
</main>
