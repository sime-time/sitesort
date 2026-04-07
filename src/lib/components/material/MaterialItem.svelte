<script lang="ts">
  import Icon from "@iconify/svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import * as Card from "$lib/components/ui/card/index.js";

  let { name } = $props();
  let count = $state(0);
</script>

<Card.Root class="flex flex-row justify-between items-center">
  <Card.Header class="grow border-orange-500">
    <Card.Title>{name}</Card.Title>
  </Card.Header>
  <Card.Content>
    <div class="bg-secondary flex flex-row items-center p-1 gap-3">
      <Button size="icon-lg" variant="outline" onclick={() => count--}>
        <Icon icon="ic:sharp-minus" class="size-6 text-primary" />
      </Button>
      <div class="size-9 flex items-center justify-center">
        <p class="font-heading text-xl font-semibold">{count}</p>
      </div>
      <Button size="icon-lg" variant="outline" onclick={() => count++}>
        <Icon icon="ic:sharp-plus" class="size-6 text-primary" />
      </Button>
    </div>
  </Card.Content>
</Card.Root>
