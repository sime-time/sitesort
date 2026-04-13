<script lang="ts">
  import Icon from "@iconify/svelte";
  import { page } from "$app/state";
  import { getUserJob } from "$lib/client/crud/read-job";
  import {
    type JobMaterial,
    listJobMaterials,
  } from "$lib/client/crud/read-material";
  import { listJobTasks } from "$lib/client/crud/read-task";
  import type { SelectJob, SelectTask } from "$lib/client/schema";
  import BottomButton from "$lib/components/BottomButton.svelte";
  import MaterialCategory from "$lib/components/material/MaterialCategory.svelte";
  import TopBar from "$lib/components/TopBar.svelte";
  import TaskItem from "$lib/components/task/TaskItem.svelte";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();

  const jobId = $derived(page.params.id);

  let job = $state<SelectJob | null>(null);
  let materials = $state<JobMaterial[]>([]);
  let tasks = $state<SelectTask[]>([]);
  let loading = $state(true);
  let activeTab = $state<"materials" | "checklist">("materials");

  const materialsByCategory = $derived.by(() => {
    const groups = new Map<string, JobMaterial[]>();

    for (const material of materials) {
      const list = groups.get(material.category);

      if (list) {
        list.push(material);
      } else {
        groups.set(material.category, [material]);
      }
    }

    return groups;
  });

  async function loadJobDetails(id: string) {
    loading = true;

    try {
      const [nextJob, nextMaterials, nextTasks] = await Promise.all([
        getUserJob(data.user_id, id),
        listJobMaterials(id),
        listJobTasks(id),
      ]);

      job = nextJob ?? null;
      materials = nextMaterials;
      tasks = nextTasks;
    } catch (err) {
      console.error("Failed loading job page data", err);
    } finally {
      loading = false;
    }
  }

  $effect(() => {
    if (!jobId) return;
    void loadJobDetails(jobId);
  });
</script>

<div class="h-dvh overflow-hidden flex flex-col">
  <TopBar title={job?.name} showBack={true} />

  <div class="min-h-0 p-3 flex flex-col flex-1 ">
    <!-- Tabs Header -->
    <div
      role="tablist"
      class="tabs tabs-box tabs-sm w-full shrink-0 font-medium text-base"
    >
      <button
        role="tab"
        type="button"
        class={`tab flex-1 gap-1.5 ${
				activeTab === "materials"
					? "tab-active text-primary"
					: "text-base-content/60"
				}`}
        onclick={() => (activeTab = "materials")}
      >
        <Icon icon="material-symbols:service-toolbox" class="text-base" />
        <span>Materials</span>
      </button>

      <button
        role="tab"
        type="button"
        class={`tab flex-1 gap-1.5 ${
				activeTab === "checklist"
					? "tab-active text-primary"
					: "text-base-content/60"
				}`}
        onclick={() => (activeTab = "checklist")}
      >
        <Icon icon="material-symbols:checklist" class="text-base" />
        <span>Checklist</span>
      </button>
    </div>

    <!-- Tab Content -->
    <div class="tab-content flex flex-col min-h-0 bg-base-100">
      <section
        class="flex-1 min-h-0 overflow-y-auto overscroll-contain pt-3 pb-20 no-scrollbar"
      >
        {#if activeTab === "materials"}
          {#each Array.from(materialsByCategory.entries()) as [ category, items ]}
            <MaterialCategory title={category} {items} />
          {/each}
        {:else}
          {#each tasks as task}
            <TaskItem
              id={task.id}
              completed={task.completed}
              description={task.description}
            />
          {/each}
        {/if}
      </section>

      <BottomButton
        label={activeTab === "materials" ? "Add Extra Material" : "Add New Task"}
        icon="material-symbols:add-circle"
        extra={true}
      />
    </div>
  </div>
</div>
