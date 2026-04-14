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
  };

  let { data }: PageProps = $props();

  let jobName = $state<string>("");
  let jobDate = $state<CalendarDate>(today(getLocalTimeZone()));
  let jobAddress = $state<string>("");
  let errors = $state<FormErrors>({});

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();

    const parsed = createJobSchema.safeParse({
      user_id: data.user_id,
      name: jobName,
      start_date: jobDate.toDate(getLocalTimeZone()),
      address: jobAddress,
    });

    if (!parsed.success) {
      errors = mapCreateJobErrors(parsed.error);
      return;
    }
    errors = {};

    console.log("Success", parsed.data);
    console.log("User ID", data.user_id);

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
    jobName = "";
    jobAddress = "";
    jobDate = today(getLocalTimeZone());
    goto("/");
  }
</script>

<form class="flex flex-col w-full p-3 gap-3" onsubmit={handleSubmit}>
  <legend class="font-heading font-medium text-2xl uppercase my-2">
    New Job
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
      bind:value={jobName}
      aria-invalid={!!errors.name}
    >
    <p class="label text-error">{errors.name}</p>
  </fieldset>

  <fieldset class="fieldset" data-invalid={errors.date ? "true" : undefined}>
    <label
      class="label uppercase tracking-wide text-neutral font-medium text-sm"
      for="job-date"
    >
      Deployment Date
    </label>
    <input
      type="date"
      id="job-date"
      class="input border w-full"
      bind:value={jobDate}
      aria-invalid={!!errors.address}
    >
    <p class="label text-error">{errors.date}</p>
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
      bind:value={jobAddress}
      aria-invalid={!!errors.address}
    >
    <p class="label text-error">{errors.address}</p>
  </fieldset>

  <button
    type="submit"
    class="btn-primary w-full btn btn-xl uppercase font-heading tracking-widest"
  >
    <Icon icon="material-symbols:add-box-outline" />
    <span class="text-base">Create Job</span>
  </button>
</form>
