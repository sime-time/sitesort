<script lang="ts">
  import Icon from "@iconify/svelte";
  import addNotesIcon from "@iconify-icons/material-symbols/add-notes-outline";
  import editNoteIcon from "@iconify-icons/material-symbols/edit-note";
  import {
    type UpdateJobMaterial,
    updateJobMaterialCrossedOff,
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
    crossedOff,
    onOpenNote,
  }: {
    id: string;
    name: string;
    quantity: number;
    note: string | null;
    crossedOff: boolean | null;
    onOpenNote: (material: UpdateJobMaterial) => void;
  } = $props();

  // svelte-ignore state_referenced_locally
  let count = $state<number>(clampMin(quantity));
  // svelte-ignore state_referenced_locally
  let crossedOffLocal = $state<boolean>(crossedOff ?? false);
  let saving = $state<boolean>(false);

  // keep local state "count" aligned with parent watcher "quantity"
  $effect(() => {
    count = clampMin(quantity);
    crossedOffLocal = crossedOff ?? false;
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

  function handleFocus(event: FocusEvent) {
    const input = event.currentTarget as HTMLInputElement;
    if (count === 0 || input.value === "0") {
      input.select();
    }
  }
  async function updateQuantity(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    await commitQuantity(sanitizeWholeNumber(input.value));
  }

  async function toggleCrossedOff() {
    if (saving) return;
    const prev = crossedOffLocal;
    const next = !prev;
    crossedOffLocal = next;
    saving = true;
    try {
      await updateJobMaterialCrossedOff(id, crossedOffLocal);
    } catch (err) {
      console.error("Update crossed_off failed", err);
      crossedOffLocal = prev; // rollback
    } finally {
      saving = false;
    }
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
      onfocus={handleFocus}
      onblur={updateQuantity}
      step="1"
      min="0"
      class="font-heading text-xl font-semibold text-center no-spinner w-20 input input-accent bg-accent"
      disabled={saving || crossedOffLocal}
    >
  </td>
  <td>
    <button
      type="button"
      class={`card-title grow font-normal text-base ${crossedOffLocal ? "line-through" : ""}`}
      onclick={toggleCrossedOff}
    >
      {name}
    </button>
  </td>
  <td>
    <button
      type="button"
      class={`btn btn-square ${note ? "btn-info" : "btn-accent"}`}
      onclick={() => {haptic(); onOpenNote({id, name, note})}}
    >
      <Icon icon={note ? editNoteIcon : addNotesIcon} class="size-6" />
    </button>
  </td>
</tr>
