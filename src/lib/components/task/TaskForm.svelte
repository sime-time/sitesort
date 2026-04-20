<script lang="ts">
  import Icon from "@iconify/svelte";
  import addCircleOutlineIcon from "@iconify-icons/material-symbols/add-circle-outline";
  import { toast } from "svelte-sonner";
  import {
    createTask,
    createTaskSchema,
    mapCreateTaskErrors,
  } from "$lib/client/crud/create-task";

  const { jobId, onSuccess }: { jobId?: string; onSuccess?: () => void } =
    $props();

  type FormErrors = {
    description?: string;
    completed?: string;
  };

  let description = $state<string>("");
  let completed = $state<boolean>(false);
  let errors = $state<FormErrors>({});

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();

    const parsed = createTaskSchema.safeParse({
      job_id: jobId,
      description: description,
      completed: completed,
    });

    if (!parsed.success) {
      errors = mapCreateTaskErrors(parsed.error);
      return;
    }
    errors = {};

    try {
      await createTask({
        job_id: parsed.data.job_id,
        description: parsed.data.description,
        completed: parsed.data.completed,
      });
    } catch (err) {
      toast.error("Failed to create new task");
      console.error("Error Create Task", err);
      return;
    }

    // Reset form on success
    toast.success("New task created");
    description = "";
    completed = false;

    onSuccess?.(); // close modal from parent
  }
</script>

<form class="flex flex-col gap-3" onsubmit={handleSubmit}>
  <legend class="font-heading font-medium text-2xl uppercase">New Task</legend>
  <fieldset class="fieldset">
    <label
      class="label uppercase tracking-wide text-neutral font-medium text-sm"
      for="task-description"
    >
      Description
    </label>
    <input
      type="text"
      id="task-description"
      class="input border w-full"
      bind:value={description}
    >
    <p class="label text-error">{errors.description}</p>
  </fieldset>

  <fieldset class="fieldset">
    <label
      class="label uppercase tracking-wide text-neutral font-medium text-sm"
      for="task-completed"
    >
      Completed?
    </label>

    <input
      id="task-completed"
      type="checkbox"
      bind:checked={completed}
      class="toggle toggle-xl border-error text-error bg-error/10 checked:toggle-success checked:border-success checked:text-success checked:bg-success/10"
    >
    <p class="label text-error">{errors.completed}</p>
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
