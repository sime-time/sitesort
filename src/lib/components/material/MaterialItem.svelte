<script lang="ts">
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

{#snippet MinusIcon()}
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    class="size-6 text-primary"
    fill="none"
    stroke="currentColor"
    stroke-width="2.5"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M5 12h14" />
  </svg>
{/snippet}

{#snippet PlusIcon()}
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    class="size-6 text-primary"
    fill="none"
    stroke="currentColor"
    stroke-width="2.5"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <path d="M12 5v14M5 12h14" />
  </svg>
{/snippet}

<div class="card flex flex-row justify-between items-center">
  <div class="card-title grow font-normal text-base">{name}</div>
  <div class="bg-accent flex flex-row items-center p-1 gap-3 rounded-sm">
    <button
      type="button"
      class="btn btn-square btn-lg bg-base-100 border"
      onclick={() => count = clampMin(count - 1)}
    >
      {@render MinusIcon()}
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
      {@render PlusIcon()}
    </button>
  </div>
</div>
