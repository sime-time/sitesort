<script lang="ts">
  import Icon from "@iconify/svelte";
  import saveAsIcon from "@iconify-icons/material-symbols/save-as";
  import { toast } from "svelte-sonner";
  import { updateJobMaterialNote } from "$lib/client/crud/update-material";
  import { jobMaterialUpdateSchema } from "$lib/client/schema";
  import { haptic } from "$lib/utils/haptic";

  type FormErrors = {
    note?: string;
  };

  const {
    jobMaterialId,
    materialName,
    materialNote,
    onSuccess,
  }: {
    jobMaterialId: string | null;
    materialName: string;
    materialNote: string | null;
    onSuccess?: () => void;
  } = $props();

  // svelte-ignore state_referenced_locally
  let note = $state<string | null>(materialNote);
  let errors = $state<FormErrors>({});

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    haptic.confirm();

    const parsed = jobMaterialUpdateSchema.safeParse({
      note: note,
    });

    if (!parsed.success) {
      errors = { note: "Invalid note input" };
      return;
    }
    errors = {};

    if (!jobMaterialId) return;

    try {
      await updateJobMaterialNote(jobMaterialId, parsed.data.note || "");
    } catch (err) {
      toast.error("Failed to update note");
      console.error("Error Updating Note", err);
      return;
    }

    // Reset form on success
    toast.success("Note saved");
    note = "";

    onSuccess?.(); // close modal from parent
  }
</script>

<form class="flex flex-col gap-3" onsubmit={handleSubmit}>
  <legend class="font-heading font-medium text-2xl uppercase">
    {materialName}
  </legend>

  <fieldset class="fieldset">
    <label
      class="label uppercase tracking-wide text-neutral font-medium text-sm"
      for="note"
    >
      Note
    </label>
    <textarea
      id="note"
      class="textarea textarea-lg w-full"
      bind:value={note}
    ></textarea>
    <p class="label text-error">{errors.note}</p>
  </fieldset>

  <div class="modal-action">
    <button
      type="submit"
      class="w-full uppercase font-heading tracking-widest btn btn-lg btn-primary"
    >
      <Icon icon={saveAsIcon} class="size-6" />
      <span class="text-base">Save</span>
    </button>
  </div>
</form>
