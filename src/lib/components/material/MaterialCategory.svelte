<script lang="ts">
  import * as Accordion from "$lib/components/ui/accordion/index";
  import MaterialItem from "./MaterialItem.svelte";

  let { value, title }: { value: string; title: string } = $props();
</script>

<Accordion.Item {value}>
  <Accordion.Trigger>{title}</Accordion.Trigger>
  <Accordion.Content> <MaterialItem name="Cable" /> </Accordion.Content>
</Accordion.Item>
