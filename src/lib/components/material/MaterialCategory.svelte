<script lang="ts">
  import type { JobMaterial } from "$lib/client/crud/read-material";
  import MaterialItem from "./MaterialItem.svelte";

  let {
    title,
    items,
  }: {
    title: string;
    items: JobMaterial[];
  } = $props();
</script>

<div class="collapse collapse-arrow bg-base-100 border-b border-base-300">
  <input type="checkbox" name="material-accordion" checked={false}>
  <div
    class="collapse-title font-semibold font-heading uppercase tracking-wider text-lg"
  >
    {title}
  </div>
  <div class="collapse-content flex flex-col gap-1">
    {#each items as item (item.id)}
      <MaterialItem name={item.name} quantity={item.quantity} />
    {/each}
  </div>
</div>
