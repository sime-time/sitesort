<script lang="ts">
  import Icon from "@iconify/svelte";
  import addCircleOutlineIcon from "@iconify-icons/material-symbols/add-circle-outline";
  import { toast } from "svelte-sonner";
  import {
    createJobMaterial,
    createJobMaterialSchema,
    mapCreateJobMaterialErrors,
  } from "$lib/client/crud/create-material";
  import type { SelectCategory } from "$lib/client/schema";
  import {
    blockInvalidKeys,
    clampMin,
    sanitizeWholeNumber,
  } from "$lib/utils/sanitize-numeric-input";

  type FormErrors = {
    name?: string;
    quantity?: string;
    category?: string;
  };

  const {
    jobId,
    categories,
    onSuccess,
  }: {
    jobId?: string;
    categories: SelectCategory[];
    onSuccess?: () => void;
  } = $props();

  let materialName = $state<string>("");
  let quantity = $state<number>(0);
  let categoryId = $state<string>("");
  let errors = $state<FormErrors>({});

  function handleInput(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    quantity = clampMin(sanitizeWholeNumber(input.value));
    input.value = String(quantity);
  }

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();

    const parsed = createJobMaterialSchema.safeParse({
      job_id: jobId,
      name: materialName,
      quantity,
      category_id: categoryId,
    });

    if (!parsed.success) {
      errors = mapCreateJobMaterialErrors(parsed.error);
      return;
    }
    errors = {};

    try {
      await createJobMaterial({
        job_id: parsed.data.job_id,
        name: parsed.data.name,
        quantity: parsed.data.quantity,
        category_id: parsed.data.category_id,
      });
    } catch (err) {
      toast.error("Failed to create new material");
      console.error("Error Create Job Material", err);
      return;
    }

    // Reset form on success
    toast.success("New material created");
    materialName = "";
    quantity = 0;
    categoryId = "";

    onSuccess?.(); // close modal from parent
  }
</script>

<form class="flex flex-col gap-3" onsubmit={handleSubmit}>
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
    <select class="select w-full" bind:value={categoryId}>
      <option value="" disabled selected>Type of material</option>
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
