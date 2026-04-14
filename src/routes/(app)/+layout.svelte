<script lang="ts">
  import { onMount } from "svelte";
  import { setupPowerSync } from "$lib/client/db";
  import Dock from "$lib/components/Dock.svelte";
  import TopBar from "$lib/components/TopBar.svelte";

  let { children } = $props();
  onMount(async () => await setupPowerSync());
</script>

<main class="h-dvh overflow-hidden flex flex-col">
  <TopBar showBack={true} />
  {@render children()}
  <Dock />
</main>
