<script lang="ts">
  import Icon from "@iconify/svelte";
  import addCircleOutlineIcon from "@iconify-icons/material-symbols/add-circle-outline";
  import type { SelectCategory } from "$lib/client/schema";
  import {
    blockInvalidKeys,
    clampMin,
    sanitizeWholeNumber,
  } from "$lib/utils/sanitize-numeric-input";

  type FormErrors = {
    name?: string;
    quantity?: number;
    category?: string;
  };

  const {
    jobId,
    categories,
  }: { jobId?: string; categories: SelectCategory[] } = $props();

  let materialName = $state<string>("");
  let quantity = $state<number>(0);
  let categoryId = $state<string>("");
  let errors = $state<FormErrors>({});

  function handleInput(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    quantity = clampMin(sanitizeWholeNumber(input.value));
    input.value = String(quantity);
  }
</script>

<form class="flex flex-col gap-3">
  <legend class="font-heading font-medium text-2xl uppercase">
    New Material
  </legend>

  <fieldset class="fieldset">
    <label
      class="label uppercase tracking-wide text-neutral font-medium text-sm"
      for="material-name"
    >
      Name
    </label>
    <input
      type="text"
      id="material-name"
      class="input border w-full"
      bind:value={materialName}
    >
    <p class="label text-error">{errors.name}</p>
  </fieldset>

  <fieldset class="fieldset">
    <label
      class="label uppercase tracking-wide text-neutral font-medium text-sm"
      for="quantity"
    >
      Quantity
    </label>
    <input
      value={quantity}
      id="quantity"
      type="number"
      inputmode="numeric"
      oninput={handleInput}
      onkeydown={blockInvalidKeys}
      step="1"
      min="0"
      class="input border w-full no-spinner"
    >
    <p class="label text-error">{errors.quantity}</p>
  </fieldset>

  <fieldset class="fieldset">
    <label
      class="label uppercase tracking-wide text-neutral font-medium text-sm"
      for="category"
    >
      Category
    </label>
    <select class="select w-full">
      <option disabled selected>Type of material</option>
      {#each categories as category}
        <option value={category.id}>{category.name}</option>
      {/each}
    </select>
    <p class="label text-error">{errors.category}</p>
  </fieldset>

  <div class="modal-action">
    <button
      type="submit"
      class="mt-6 w-full uppercase font-heading tracking-widest btn btn-lg btn-primary"
    >
      <Icon icon={addCircleOutlineIcon} class="size-6" />
      <span class="text-base"> Add to Job </span>
    </button>
  </div>
</form>
