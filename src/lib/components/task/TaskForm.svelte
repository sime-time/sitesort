<script lang="ts">
  import Icon from "@iconify/svelte";
  import addCircleOutlineIcon from "@iconify-icons/material-symbols/add-circle-outline";

  const { jobId } = $props();

  type FormErrors = {
    description?: string;
    completed?: boolean;
  };

  let description = $state<string>("");
  let completed = $state<boolean>(false);
  let errors = $state<FormErrors>({});
</script>

<form class="flex flex-col gap-3">
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
