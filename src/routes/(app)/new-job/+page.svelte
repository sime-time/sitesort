<script lang="ts">
  import Icon from "@iconify/svelte";
  import {
    type CalendarDate,
    getLocalTimeZone,
    today,
  } from "@internationalized/date";
  import { toast } from "svelte-sonner";
  import BottomButton from "$lib/components/BottomButton.svelte";
  import TopBar from "$lib/components/TopBar.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import Calendar from "$lib/components/ui/calendar/calendar.svelte";
  import * as Field from "$lib/components/ui/field/index";
  import { Input } from "$lib/components/ui/input/index";
  import * as Popover from "$lib/components/ui/popover/index";
  import { mapNewJobErrors, newJobSchema } from "$lib/schemas/valid-job";

  type FormErrors = {
    name?: string;
    date?: string;
    address?: string;
  };

  let calendarOpen = $state(false);

  let jobName = $state<string>("");
  let jobDate = $state<CalendarDate>(today(getLocalTimeZone()));
  let jobAddress = $state<string>("");
  let errors = $state<FormErrors>({});

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();

    const parsed = newJobSchema.safeParse({
      name: jobName,
      date: jobDate.toDate(getLocalTimeZone()),
      address: jobAddress,
    });

    if (!parsed.success) {
      errors = mapNewJobErrors(parsed.error);
      return;
    }

    errors = {};
    console.log("Success", parsed.data);
    // insert into database
    await db.insert()
    toast.success("Job created");
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
