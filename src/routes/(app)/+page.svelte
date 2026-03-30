<script lang="ts">
  import Icon from "@iconify/svelte";
  import BottomButton from "$lib/components/BottomButton.svelte";
  import JobCard from "$lib/components/JobCard.svelte";
  import TopBar from "$lib/components/TopBar.svelte";
  import * as Tabs from "$lib/components/ui/tabs/index";
</script>

<TopBar />

<Tabs.Root value="in-progress" class="w-full p-3">
  <Tabs.List class="w-full">
    <Tabs.Trigger value="in-progress">
      <Icon icon="material-symbols:pending" />
      <span>In Progress</span>
    </Tabs.Trigger>
    <Tabs.Trigger value="completed">
      <Icon icon="material-symbols:check-circle" />
      <span>Completed</span>
    </Tabs.Trigger>
  </Tabs.List>

  <Tabs.Content value="in-progress">
    <section class="w-full flex justify-between items-end my-4">
      <h2 class="font-heading font-medium text-2xl uppercase">Active Jobs</h2>
      <p class="font-semibold text-primary">4 TOTAL</p>
    </section>
    <JobCard priority={true} />
  </Tabs.Content>

  <Tabs.Content value="completed">
    <section class="w-full flex justify-between items-end my-4">
      <h2 class="font-heading font-medium text-2xl uppercase">
        Completed Jobs
      </h2>
      <p class="font-semibold text-primary">0 TOTAL</p>
    </section>
  </Tabs.Content>

  <BottomButton
    label="Create New Job"
    icon="material-symbols:add-rounded"
    href="/new-job"
  />
</Tabs.Root>
