<script lang="ts">
  import type { JobMaterial } from "$lib/client/crud/read-material";
  import type { UpdateJobMaterial } from "$lib/client/crud/update-material";
  import MaterialItem from "./MaterialItem.svelte";

  let {
    title,
    items,
    onOpenNote,
  }: {
    title: string;
    items: JobMaterial[];
    onOpenNote: (material: UpdateJobMaterial) => void;
  } = $props();
</script>

<tbody>
  <tr>
    <th
      colspan="3"
      class="font-heading uppercase tracking-wide text-xs text-base-content/70"
    >
      {title}
    </th>
  </tr>
  {#each items as item (item.id)}
    <MaterialItem
      id={item.id}
      name={item.name}
      quantity={item.quantity}
      note={item.note}
      crossedOff={item.crossed_off}
      onOpenNote={() => onOpenNote({ id: item.id, name: item.name, note: item.note})}
    />
  {/each}
</tbody>
