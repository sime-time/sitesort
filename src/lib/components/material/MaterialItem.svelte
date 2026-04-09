<script lang="ts">
  import Icon from "@iconify/svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import * as Card from "$lib/components/ui/card/index.js";

  let { name, quantity = 0 }: { name: string; quantity: number } = $props();

  // svelte-ignore state_referenced_locally
  let count = $state<number>(clampMin(quantity));

  function clampMin(n: number) {
    return Math.max(0, n);
  }

  function sanitizeWholeNumber(value: string) {
    const digitsOnly = value.replace(/\D/g, "");
    return digitsOnly === "" ? 0 : Number(digitsOnly);
  }
  function handleInput(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    count = clampMin(sanitizeWholeNumber(input.value));
    input.value = String(count);
  }
  function blockInvalidKeys(event: KeyboardEvent) {
    if (["e", "E", "+", "-", "."].includes(event.key)) {
      event.preventDefault();
    }
  }
</script>

<Card.Root class="flex flex-row justify-between items-center">
  <Card.Header class="grow border-orange-500">
    <Card.Title>{name}</Card.Title>
  </Card.Header>
  <Card.Content>
    <div class="bg-accent flex flex-row items-center p-1 gap-3">
      <Button
        size="icon-lg"
        variant="outline"
        onclick={() => count = clampMin(count - 1)}
      >
        <Icon icon="ic:sharp-minus" class="size-6 text-primary" />
      </Button>
      <div class="size-9 flex items-center justify-center">
        <input
          value={count}
          type="number"
          inputmode="numeric"
          oninput={handleInput}
          onkeydown={blockInvalidKeys}
          step="1"
          min="0"
          class="font-heading text-xl font-semibold w-14 text-center no-spinner"
        >
      </div>
      <Button
        size="icon-lg"
        variant="outline"
        onclick={() => count = clampMin(count + 1)}
      >
        <Icon icon="ic:sharp-plus" class="size-6 text-primary" />
      </Button>
    </div>
  </Card.Content>
</Card.Root>
