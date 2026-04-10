<script lang="ts">
  import Icon from "@iconify/svelte";
  import { page } from "$app/state";
  import MaterialCategory from "$lib/components/material/MaterialCategory.svelte";
  import TopBar from "$lib/components/TopBar.svelte";
  import TaskItem from "$lib/components/task/TaskItem.svelte";
  import * as Accordion from "$lib/components/ui/accordion/index";
  import Button from "$lib/components/ui/button/button.svelte";
  import * as Tabs from "$lib/components/ui/tabs/index";
  import { getUserJob } from "$lib/sql/client/crud/job-read";
  import {
    type JobMaterial,
    listJobMaterials,
  } from "$lib/sql/client/crud/material-read";
  import { listJobTasks } from "$lib/sql/client/crud/task-read";
  import type { SelectJob, SelectTask } from "$lib/sql/client/schema";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();

  const jobId = $derived(page.params.id);

  let job = $state<SelectJob | null>(null);
  let materials = $state<JobMaterial[]>([]);
  let tasks = $state<SelectTask[]>([]);
  let loading = $state(true);

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
  <Tabs.Root value="in-progress" class="w-full flex-1 p-3 min-h-0">
    <Tabs.List class="w-full">
      <Tabs.Trigger value="in-progress">
        <Icon icon="material-symbols:service-toolbox" />
        <span>Materials</span>
      </Tabs.Trigger>
      <Tabs.Trigger value="completed">
        <Icon icon="material-symbols:checklist" />
        <span>Checklist</span>
      </Tabs.Trigger>
    </Tabs.List>

    <Tabs.Content value="in-progress" class="flex flex-col min-h-0">
      <section
        class="flex-1 min-h-0 overflow-y-auto overscroll-contain pb-20 no-scrollbar"
      >
        <Accordion.Root type="multiple">
          {#each Array.from(materialsByCategory.entries()) as [ category, items ]}
            <MaterialCategory value={category} title={category} {items} />
          {/each}
        </Accordion.Root>
        <Button
          variant="secondary"
          size="xl"
          class="w-full border-2 border-secondary-foreground border-dashed py-7 mt-5"
        >
          <Icon icon="material-symbols:add-circle" />
          Add Extra Material
        </Button>
      </section>
    </Tabs.Content>

    <Tabs.Content value="completed" class="flex flex-col min-h-0">
      <section
        class="flex-1 min-h-0 overflow-y-auto overscroll-contain pb-20 no-scrollbar"
      >
        {#each tasks as task}
          <TaskItem completed={task.completed} description={task.description} />
        {/each}
        <TaskItem completed={true} description="Test all receptacles" />
        <TaskItem
          completed={false}
          description="Test all GFCI's and protected receptacles"
        />
        <TaskItem completed={false} description="Test all switches" />
        <TaskItem completed={false} description="Test smoke detectors" />
        <TaskItem
          completed={false}
          description="Verify all circuits are turned on"
        />
        <Button
          variant="secondary"
          size="xl"
          class="w-full border-2 border-secondary-foreground border-dashed py-7 mt-5"
        >
          <Icon icon="material-symbols:add-circle" />
          Add New Task
        </Button>
      </section>
    </Tabs.Content>
  </Tabs.Root>
</div>
