<script lang="ts">
  import Icon from "@iconify/svelte";
  import {
    type CalendarDate,
    getLocalTimeZone,
    today,
  } from "@internationalized/date";
  import { toast } from "svelte-sonner";
  import { goto } from "$app/navigation";
  import {
    createJob,
    createJobSchema,
    mapCreateJobErrors,
  } from "$lib/client/crud/create-job";
  import type { PageProps } from "./$types";

  type FormErrors = {
    name?: string;
    date?: string;
    address?: string;
    completed?: boolean;
  };

  let { data }: PageProps = $props();

  let name = $state<string>("");
  let startDate = $state<CalendarDate>(today(getLocalTimeZone()));
  let endDate = $state<CalendarDate>(today(getLocalTimeZone()));
  let address = $state<string>("");
  let completed = $state<boolean>(false);
  let errors = $state<FormErrors>({});

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();

    const parsed = editJobSchema.safeParse({
      user_id: data.user_id,
      name: name,
      address: address,
      start_date: startDate.toDate(getLocalTimeZone()),
      end_date: endDate.toDate(getLocalTimeZone()),
      completed: completed,
    });

    if (!parsed.success) {
      errors = mapCreateJobErrors(parsed.error);
      return;
    }
    errors = {};

    try {
      await createJob({
        user_id: data.user_id,
        name: parsed.data.name,
        address: parsed.data.address,
        start_date: parsed.data.start_date,
      });
    } catch (error) {
      console.error("Create Job Error", error);
      toast.error("Failed to create new job");
      return;
    }

    // Reset job form on success
    toast.success("Job created");
    name = "";
    address = "";
    startDate = today(getLocalTimeZone());
    endDate = today(getLocalTimeZone());
    completed = false;
    goto("/");
  }
</script>

<form
  class="flex flex-col flex-1 min-h-0 w-full p-3 gap-3 overflow-y-auto pb-[calc(var(--dock-height)+env(safe-area-inset-bottom)+1rem)] no-scrollbar"
  onsubmit={handleSubmit}
>
  <legend class="font-heading font-medium text-2xl uppercase my-2">
    Edit Job
  </legend>

  <fieldset class="fieldset" data-invalid={errors.name ? "true" : undefined}>
    <label
      class="label uppercase tracking-wide text-neutral font-medium text-sm"
      for="job-name"
    >
      Job Name
    </label>
    <input
      type="text"
      id="job-name"
      class="input border w-full"
      bind:value={name}
      aria-invalid={!!errors.name}
    >
    <p class="label text-error">{errors.name}</p>
  </fieldset>

  <fieldset class="fieldset" data-invalid={errors.address ? "true" : undefined}>
    <label
      class="label uppercase tracking-wide text-neutral font-medium text-sm"
      for="job-address"
    >
      Address
    </label>
    <input
      type="text"
      id="job-address"
      class="input border w-full"
      bind:value={address}
      aria-invalid={!!errors.address}
    >
    <p class="label text-error">{errors.address}</p>
  </fieldset>

  <fieldset class="fieldset" data-invalid={errors.date ? "true" : undefined}>
    <label
      class="label uppercase tracking-wide text-neutral font-medium text-sm"
      for="start-date"
    >
      Start Date
    </label>
    <input
      type="date"
      id="start-date"
      class="input border w-full"
      bind:value={startDate}
      aria-invalid={!!errors.address}
    >
    <p class="label text-error">{errors.date}</p>
  </fieldset>

  <fieldset class="fieldset" data-invalid={errors.date ? "true" : undefined}>
    <label
      class="label uppercase tracking-wide text-neutral font-medium text-sm"
      for="end-date"
    >
      End Date
    </label>
    <input
      type="date"
      id="end-date"
      class="input border w-full"
      bind:value={endDate}
      aria-invalid={!!errors.address}
    >
    <p class="label text-error">{errors.date}</p>
  </fieldset>

  <fieldset class="fieldset">
    <label
      class="label uppercase tracking-wide text-neutral font-medium text-sm"
      for="task-completed"
    >
      Job Completed
    </label>

    <input
      id="task-completed"
      type="checkbox"
      bind:checked={completed}
      class="toggle toggle-xl border-error text-error bg-error/10 checked:toggle-success checked:border-success checked:text-success checked:bg-success/10"
    >
    <p class="label text-error">{errors.completed}</p>
  </fieldset>

  <button
    type="submit"
    class="btn-info w-full btn btn-xl uppercase font-heading tracking-widest"
  >
    <Icon icon="material-symbols:save" />
    <span class="text-base">Save Changes</span>
  </button>
  <button
    type="submit"
    class="btn-error w-full btn btn-xl uppercase font-heading tracking-widest"
  >
    <Icon icon="material-symbols:delete-outline" />
    <span class="text-base">Delete Job</span>
  </button>
</form>
