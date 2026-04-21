<script lang="ts">
  import Icon from "@iconify/svelte";
  import saveIcon from "@iconify-icons/material-symbols/save";
  import { toast } from "svelte-sonner";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { getUserJob } from "$lib/client/crud/read-job";
  import {
    mapUpdateJobErrors,
    updateJob,
    updateJobSchema,
  } from "$lib/client/crud/update-job";
  import DeleteJob from "$lib/components/DeleteJob.svelte";
  import type { PageProps } from "./$types";

  type FormErrors = {
    name?: string;
    address?: string;
    completed?: string;
    start_date?: string;
    end_date?: string;
  };

  let { data }: PageProps = $props();

  const jobId = $derived(page.params.id);

  let name = $state<string>("");
  let startDate = $state<string>("");
  let endDate = $state<string>("");
  let address = $state<string>("");
  let completed = $state<boolean>(false);
  let errors = $state<FormErrors>({});

  function toDateInput(value?: string | null) {
    if (!value) return "";
    return value.slice(0, 10); // "YYYY-MM-DD"
  }

  $effect(() => {
    if (!jobId) return;

    const userId = page.data?.user_id as string | undefined;
    if (!userId) return;

    void (async () => {
      const job = await getUserJob(userId, jobId);
      name = job.name;
      address = job.address;
      completed = job.completed;
      startDate = toDateInput(job.start_date);
      endDate = toDateInput(job.end_date);
    })();
  });

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();

    if (startDate && endDate && startDate > endDate) {
      errors = {
        ...errors,
        end_date: "End date must be on or after start date",
      };
      return;
    }

    const parsed = updateJobSchema.safeParse({
      id: jobId,
      user_id: data.user_id,
      name: name,
      address: address,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
      completed: completed,
    });

    if (!parsed.success) {
      errors = mapUpdateJobErrors(parsed.error);
      return;
    }
    errors = {};

    try {
      await updateJob({
        id: parsed.data.id,
        name: parsed.data.name,
        address: parsed.data.address,
        completed: parsed.data.completed,
        start_date: parsed.data.start_date,
        end_date: parsed.data.end_date,
      });
    } catch (error) {
      console.error("Update Job Error", error);
      toast.error("Failed to edit job");
      return;
    }

    // Reset job form on success
    toast.success("Job changes saved");
    name = "";
    address = "";
    startDate = "";
    endDate = "";
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

  <fieldset
    class="fieldset"
    data-invalid={errors.start_date ? "true" : undefined}
  >
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
      aria-invalid={!!errors.start_date}
    >
    <p class="label text-error">{errors.start_date}</p>
  </fieldset>

  <fieldset
    class="fieldset"
    data-invalid={errors.end_date ? "true" : undefined}
  >
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
      aria-invalid={!!errors.end_date}
    >
    <p class="label text-error">{errors.end_date}</p>
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
    class="btn-success w-full btn btn-xl uppercase font-heading tracking-widest"
  >
    <Icon icon={saveIcon} />
    <span class="text-base">Save Changes</span>
  </button>
  <DeleteJob {jobId} />
</form>
