<script lang="ts">
  import * as Accordion from "$lib/components/ui/accordion/index";
  import type { JobMaterial } from "$lib/sql/client/crud/material-read";
  import MaterialItem from "./MaterialItem.svelte";

  let {
    value,
    title,
    items,
  }: {
    value: string;
    title: string;
    items: JobMaterial[];
  } = $props();
</script>

<Accordion.Item {value}>
  <Accordion.Trigger>{title}</Accordion.Trigger>
  <Accordion.Content>
    {#each items as item}
      <MaterialItem name={item.name} quantity={item.quantity} />
    {/each}
  </Accordion.Content>
</Accordion.Item>
