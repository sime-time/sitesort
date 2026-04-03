<script lang="ts">
  import { onMount } from "svelte";
  import { setupPowerSync } from "$lib/sql/client/db";

  let { children } = $props();
  onMount(() => setupPowerSync());
</script>

{@render children()}
