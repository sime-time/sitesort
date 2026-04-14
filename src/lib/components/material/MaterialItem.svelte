<script lang="ts">
  import Icon from "@iconify/svelte";
  import {
    blockInvalidKeys,
    clampMin,
    sanitizeWholeNumber,
  } from "$lib/utils/sanitize-numeric-input";

  let { name, quantity = 0 }: { name: string; quantity: number } = $props();

  // svelte-ignore state_referenced_locally
  let count = $state<number>(clampMin(quantity));

  function handleInput(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    count = clampMin(sanitizeWholeNumber(input.value));
    input.value = String(count);
  }
</script>

<div class="card flex flex-row justify-between items-center">
  <div class="card-title grow font-normal text-base">{name}</div>
  <div class="bg-accent flex flex-row items-center p-1 gap-3 rounded-sm">
    <button
      type="button"
      class="btn btn-square btn-lg bg-base-100 border"
      onclick={() => count = clampMin(count - 1)}
    >
      <Icon icon="ic:sharp-minus" class="size-6 text-primary" />
    </button>

    <div class="size-9 flex items-center justify-center">
      <input
        value={count}
        type="number"
        inputmode="numeric"
        oninput={handleInput}
        onkeydown={blockInvalidKeys}
        step="1"
        min="0"
        class="font-heading text-xl font-semibold w-13 text-center no-spinner"
      >
    </div>

    <button
      type="button"
      class="btn btn-square btn-lg bg-base-100 border"
      onclick={() => count = clampMin(count + 1)}
    >
      <Icon icon="ic:sharp-plus" class="size-6 text-primary" />
    </button>
  </div>
</div>
