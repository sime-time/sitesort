<script lang="ts">
  import Icon from "@iconify/svelte";
  import { onMount } from "svelte";
  import { watchUserJobs } from "$lib/client/crud/read-job";
  import type { SelectJob } from "$lib/client/schema";
  import JobCard from "$lib/components/JobCard.svelte";
  import TopBar from "$lib/components/TopBar.svelte";

  let { data } = $props();

  let jobs = $state<SelectJob[]>([]);
  let activeJobsListEl = $state<HTMLDivElement | null>(null);
  let activeTab = $state<"in-progress" | "completed">("in-progress");

  const completedJobs = $derived(jobs.filter((job) => job.end_date !== null));
  const activeJobs = $derived(jobs.filter((job) => job.end_date === null));

  onMount(() => {
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
</script>

<div class="flex-1 min-h-0 p-3 flex flex-col">
  <!-- Tabs Header -->
  <div
    role="tablist"
    class="tabs tabs-box tabs-sm w-full shrink-0 font-medium text-base"
  >
    <button
      role="tab"
      type="button"
      class={`tab flex-1 gap-1.5 ${
				activeTab === "in-progress"
					? "tab-active text-primary"
					: "text-base-content/60"
				}`}
      onclick={() => (activeTab = "in-progress")}
    >
      <Icon icon="material-symbols:pending" class="text-base" />
      <span>In Progress</span>
    </button>

    <button
      role="tab"
      type="button"
      class={`tab flex-1 gap-1.5 ${
				activeTab === "completed"
					? "tab-active text-primary"
					: "text-base-content/60"
				}`}
      onclick={() => (activeTab = "completed")}
    >
      <Icon icon="material-symbols:check-circle" class="text-base" />
      <span>Completed</span>
    </button>
  </div>

  <!-- Tab Content -->
  <div class="tab-content flex flex-col min-h-0 bg-base-100">
    {#if activeTab === "in-progress"}
      <section class="w-full flex justify-between items-end my-4 shrink-0">
        <h2 class="font-heading font-medium text-2xl uppercase">Active Jobs</h2>
        <p class="font-semibold text-primary">{activeJobs.length} TOTAL</p>
      </section>

      <div
        bind:this={activeJobsListEl}
        class="flex-1 min-h-0 overflow-y-auto overscroll-contain pb-12 no-scrollbar"
      >
        {#each activeJobs as job (job.id)}
          <JobCard
            id={job.id}
            name={job.name}
            address={job.address}
            startDate={job.start_date}
            completed={false}
          />
        {/each}
      </div>
    {:else}
      <section class="w-full flex justify-between items-end my-4 shrink-0">
        <h2 class="font-heading font-medium text-2xl uppercase">
          Completed Jobs
        </h2>
        <p class="font-semibold text-primary">{completedJobs.length} TOTAL</p>
      </section>

      <div
        class="flex-1 min-h-0 overflow-y-auto overscroll-contain pb-12 no-scrollbar"
      >
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
    {/if}
  </div>
</div>
