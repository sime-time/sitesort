<script lang="ts">
  import Icon from "@iconify/svelte";
  import { onMount, tick } from "svelte";
  import BottomButton from "$lib/components/BottomButton.svelte";
  import JobCard from "$lib/components/JobCard.svelte";
  import TopBar from "$lib/components/TopBar.svelte";
  import * as Tabs from "$lib/components/ui/tabs/index";
  import { watchUserJobs } from "$lib/client/crud/read-job";
  import type { SelectJob } from "$lib/client/schema";
  import {
    readPinnedJobId,
    writePinnedJobId,
  } from "$lib/utils/pinned-job.svelte";

  let { data } = $props();

  let jobs = $state<SelectJob[]>([]);
  let pinnedJobId = $state<string | null>(null);
  let activeJobsListEl = $state<HTMLDivElement | null>(null);

  const completedJobs = $derived(jobs.filter((job) => job.end_date !== null));
  const activeJobs = $derived.by(() => {
    const active = jobs.filter((job) => job.end_date === null);

    if (!pinnedJobId) return active;

    // keep original order, but move pinned one to top
    return [...active].sort((a, b) => {
      if (a.id === pinnedJobId) return -1;
      if (b.id === pinnedJobId) return 1;
      return 0;
    });
  });

  async function pinJob(id: string) {
    const wasPinned = pinnedJobId === id;
    const next = wasPinned ? null : id;
    pinnedJobId = next;
    writePinnedJobId(data.user_id, next);
    if (!wasPinned) {
      await tick();
      activeJobsListEl?.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  onMount(() => {
    pinnedJobId = readPinnedJobId(data.user_id);

    // Live query that updates job list whenever database changes
    const dispose = watchUserJobs(
      data.user_id,
      (nextJobs) => {
        jobs = nextJobs;
      },
      (error) => {
        console.error("jobs watch failed", error);
      },
    );
    return () => dispose();
  });

  // Revalidate pinned job when jobs list changes
  $effect(() => {
    if (!pinnedJobId) return;

    // Clear stale pinned if job no longer exists or is no longer active
    const pinnedJobIsCompleted = jobs.some(
      (job) => job.id === pinnedJobId && job.end_date !== null,
    );

    if (pinnedJobIsCompleted) {
      pinnedJobId = null;
      writePinnedJobId(data.user_id, null);
    }
  });
</script>

<div class="h-dvh overflow-hidden flex flex-col">
  <TopBar />

  <Tabs.Root value="in-progress" class="w-full flex-1 p-3 min-h-0">
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

    <Tabs.Content value="in-progress" class="flex flex-col min-h-0">
      <section class="w-full flex justify-between items-end my-4 shrink-0">
        <h2 class="font-heading font-medium text-2xl uppercase">Active Jobs</h2>
        <p class="font-semibold text-primary">{activeJobs.length} TOTAL</p>
      </section>
      <div
        bind:this={activeJobsListEl}
        class="flex-1 min-h-0 overflow-y-auto overscroll-contain pb-20"
      >
        {#each activeJobs as job (job.id)}
          <JobCard
            id={job.id}
            name={job.name}
            address={job.address}
            startDate={job.start_date}
            completed={false}
            pinned={job.id === pinnedJobId}
            onPin={() => pinJob(job.id)}
          />
        {/each}
      </div>
    </Tabs.Content>

    <Tabs.Content value="completed" class="flex flex-col min-h-0">
      <section class="w-full flex justify-between items-end my-4 shrink-0">
        <h2 class="font-heading font-medium text-2xl uppercase">
          Completed Jobs
        </h2>
        <p class="font-semibold text-primary">{completedJobs.length} TOTAL</p>
      </section>

      <div class="flex-1 min-h-0 overflow-y-auto overscroll-contain pb-20">
        {#each completedJobs as job (job.id)}
          <JobCard
            id={job.id}
            name={job.name}
            address={job.address}
            completed={true}
            startDate={job.start_date}
            endDate={job.end_date}
          />
        {/each}
      </div>
    </Tabs.Content>

    <BottomButton
      label="Create New Job"
      icon="material-symbols:add-rounded"
      href="/new-job"
    />
  </Tabs.Root>
</div>
