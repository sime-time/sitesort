<script lang="ts">
  import { onMount } from "svelte";
  import { setupPowerSync } from "$lib/client/db";

  let { children } = $props();
  onMount(async () => await setupPowerSync());
</script>

{@render children()}
