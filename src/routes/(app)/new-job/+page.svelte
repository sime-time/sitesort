<script lang="ts">
  import Icon from "@iconify/svelte";
  import {
    type CalendarDate,
    getLocalTimeZone,
    today,
  } from "@internationalized/date";
  import { toast } from "svelte-sonner";
  import { goto } from "$app/navigation";
  import BottomButton from "$lib/components/BottomButton.svelte";
  import TopBar from "$lib/components/TopBar.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import Calendar from "$lib/components/ui/calendar/calendar.svelte";
  import * as Field from "$lib/components/ui/field/index";
  import { Input } from "$lib/components/ui/input/index";
  import * as Popover from "$lib/components/ui/popover/index";
  import {
    createJob,
    createJobSchema,
    mapCreateJobErrors,
  } from "$lib/sql/client/crud/create-job";
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
  let calendarOpen = $state(false);

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

<TopBar showBack={true} />

<form class="flex flex-col w-full gap-1.5 p-3" onsubmit={handleSubmit}>
  <Field.Set>
    <legend class="font-heading font-medium text-2xl uppercase my-4">
      New Job
    </legend>
    <Field.Group>
      <Field.Field data-invalid={errors.name ? "true" : undefined}>
        <Field.Label for="job-name">Job Name</Field.Label>
        <Input
          type="text"
          name="name"
          id="job-name"
          bind:value={jobName}
          aria-invalid={!!errors.name}
          class="h-12"
        />
        <Field.Error>{errors.name}</Field.Error>
      </Field.Field>

      <Field.Field data-invalid={errors.date ? "true" : undefined}>
        <Field.Label for="job-date">Deployment Date</Field.Label>
        <Popover.Root bind:open={calendarOpen}>
          <Popover.Trigger id="job-date" aria-invalid={!!errors.date}>
            {#snippet child({ props })}
              <Button
                {...props}
                type="button"
                size="xl"
                variant="outline"
                class="w-full justify-between font-normal font-sans tracking-wide px-2.5 has-[>svg]:px-2.5"
              >
                {jobDate.toDate(getLocalTimeZone()).toLocaleDateString()}
                <Icon icon="material-symbols:calendar-today-rounded" />
              </Button>
            {/snippet}
          </Popover.Trigger>
          <Popover.Content class="w-auto overflow-hidden p-0" align="start">
            <Calendar
              type="single"
              bind:value={jobDate}
              captionLayout="dropdown"
              onValueChange={() => {
								calendarOpen = false;
							}}
              maxValue={today(getLocalTimeZone())}
            />
          </Popover.Content>
        </Popover.Root>
      </Field.Field>

      <Field.Field data-invalid={errors.address ? "true" : undefined}>
        <Field.Label for="job-address">Address</Field.Label>
        <Input
          type="text"
          name="address"
          id="job-address"
          bind:value={jobAddress}
          aria-invalid={!!errors.address}
          class="h-12"
        />
        <Field.Error>{errors.address}</Field.Error>
      </Field.Field>
    </Field.Group>
  </Field.Set>

  <BottomButton label="Create Job" icon="material-symbols:save" type="submit" />
</form>
