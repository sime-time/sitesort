<script lang="ts">
  import { updateJobMaterialQuantity } from "$lib/client/crud/update-material";
  import { haptic } from "$lib/utils/haptic";
  import {
    blockInvalidKeys,
    clampMin,
    sanitizeWholeNumber,
  } from "$lib/utils/sanitize-numeric-input";

  let {
    id,
    name,
    quantity = 0,
  }: { id: string; name: string; quantity: number } = $props();

  // svelte-ignore state_referenced_locally
  let count = $state<number>(clampMin(quantity));
  let saving = $state<boolean>(false);

  // keep local state "count" aligned with parent watcher "quantity"
  $effect(() => {
    count = clampMin(quantity);
  });

  async function commitQuantity(nextRaw: number) {
    if (saving) return;

    const next = clampMin(Math.trunc(nextRaw));
    if (next === quantity) return;

    count = next;
    saving = true;

    try {
      await updateJobMaterialQuantity(id, next);
    } catch (err) {
      console.error("Update quantity failed", err);
      count = quantity; // rollback to watcher value
    } finally {
      saving = false;
    }
  }

  function handleInput(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    count = clampMin(sanitizeWholeNumber(input.value));
    input.value = String(count);
  }

  function handleKeydown(event: KeyboardEvent) {
    blockInvalidKeys(event);

    if (event.key === "Enter") {
      event.preventDefault();
      (event.currentTarget as HTMLInputElement).blur();
    }
  }

  async function updateQuantity(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    await commitQuantity(sanitizeWholeNumber(input.value));
  }

  async function incrementQuantity() {
    haptic();
    await commitQuantity(count + 1);
  }

  async function decrementQuantity() {
    haptic();
    await commitQuantity(count - 1);
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
      onclick={decrementQuantity}
      disabled={saving}
    >
      {@render MinusIcon()}
    </button>

    <div class="size-9 flex items-center justify-center">
      <input
        value={count}
        type="number"
        inputmode="numeric"
        oninput={handleInput}
        onkeydown={handleKeydown}
        onblur={updateQuantity}
        step="1"
        min="0"
        class="font-heading text-xl font-semibold w-13 text-center no-spinner"
        disabled={saving}
      >
    </div>

    <button
      type="button"
      class="btn btn-square btn-lg bg-base-100 border"
      onclick={incrementQuantity}
      disabled={saving}
    >
      {@render PlusIcon()}
    </button>
  </div>
</div>
