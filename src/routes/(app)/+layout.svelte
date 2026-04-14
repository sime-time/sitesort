<script lang="ts">
  import { onMount } from "svelte";
  import { setupPowerSync } from "$lib/client/db";
  import Dock from "$lib/components/Dock.svelte";

  let { children } = $props();
  onMount(async () => await setupPowerSync());
</script>

{@render children()}
<Dock active="jobs" />
