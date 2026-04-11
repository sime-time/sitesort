<script lang="ts">
  import * as Card from "$lib/components/ui/card/index.js";
  import Checkbox from "$lib/components/ui/checkbox/checkbox.svelte";

  const {
    id,
    description,
    completed,
  }: {
    id: string;
    description: string;
    completed: boolean;
  } = $props();
</script>

<Card.Root class="flex flex-row justify-between items-center">
  <Card.Header>
    <Checkbox id="task" size="xl" checked={completed} />
  </Card.Header>
  <Card.Content class="grow">
    <Card.Title class="text-base">{description}</Card.Title>
  </Card.Content>
</Card.Root>
