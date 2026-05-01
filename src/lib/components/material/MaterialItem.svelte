<script lang="ts">
  import Icon from "@iconify/svelte";
  import addNotesIcon from "@iconify-icons/material-symbols/add-notes-outline";
  import editNoteIcon from "@iconify-icons/material-symbols/edit-note";
  import {
    type UpdateJobMaterial,
    updateJobMaterialQuantity,
  } from "$lib/client/crud/update-material";
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
    note,
    onOpenNote,
  }: {
    id: string;
    name: string;
    quantity: number;
    note: string | null;
    onOpenNote: (material: UpdateJobMaterial) => void;
  } = $props();

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
</script>

<tr>
  <td>
    <input
      value={count}
      type="number"
      inputmode="numeric"
      oninput={handleInput}
      onkeydown={handleKeydown}
      onblur={updateQuantity}
      step="1"
      min="0"
      class="font-heading text-xl font-semibold text-center no-spinner w-20 input input-accent bg-accent"
      disabled={saving}
    >
  </td>
  <td>
    <div class="card-title grow font-normal text-base">{name}</div>
  </td>
  <td>
    <button
      type="button"
      class={`btn btn-square ${note ? "btn-info" : "btn-accent"}`}
      onclick={() => onOpenNote({id, name, note})}
    >
      <Icon icon={note ? editNoteIcon : addNotesIcon} class="size-6" />
    </button>
  </td>
</tr>
