<script lang="ts">
  import Icon from "@iconify/svelte";
  import deleteOutlineIcon from "@iconify-icons/material-symbols/delete-outline";
  import { toast } from "svelte-sonner";
  import { goto } from "$app/navigation";
  import { deleteJob } from "$lib/client/crud/delete-job";
  import { haptic } from "$lib/utils/haptic";

  let { jobId }: { jobId?: string } = $props();

  let modal: HTMLDialogElement | undefined;

  let deleting = $state(false);

  function openModal() {
    modal?.showModal();
  }

  async function handleDelete() {
    haptic.error();
    try {
      if (!jobId) throw new Error("Job Id not found");
      await deleteJob(jobId);
    } catch (err) {
      toast.error("Failed to delete job");
    }
    toast.success("Job deleted");
    goto("/");
  }
</script>

<button
  type="button"
  class="btn-error w-full btn btn-xl uppercase font-heading tracking-widest"
  onclick={openModal}
>
  <Icon icon={deleteOutlineIcon} />
  <span class="text-base">Delete Job</span>
</button>

<!-- Modal -->
<dialog bind:this={modal} class="modal modal-middle">
  <div class="modal-box">
    <div class=" flex flex-col gap-2">
      <h1 class="font-heading font-semibold uppercase tracking-widest">
        Are you sure?
      </h1>
      <p>
        Deleting this job will also remove all associated materials and tasks.
      </p>
    </div>

    <div class="modal-action justify-between">
      <form method="dialog">
        <button type="submit" class="btn">Cancel</button>
      </form>

      <button
        type="button"
        class="btn btn-error btn-soft"
        onclick={handleDelete}
        disabled={deleting}
      >
        <Icon icon={deleteOutlineIcon} class="size-5" />
        Delete
      </button>
    </div>
  </div>

  <form method="dialog" class="modal-backdrop">
    <button type="submit">close</button>
  </form>
</dialog>
