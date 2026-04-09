<script lang="ts">
  import Icon from "@iconify/svelte";
  import { page } from "$app/state";
  import MaterialCategory from "$lib/components/material/MaterialCategory.svelte";
  import TopBar from "$lib/components/TopBar.svelte";
  import * as Accordion from "$lib/components/ui/accordion/index";
  import Button from "$lib/components/ui/button/button.svelte";
  import * as Tabs from "$lib/components/ui/tabs/index";
  import { getUserJob } from "$lib/sql/client/crud/job-read";
  import {
    type JobMaterial,
    listJobMaterials,
  } from "$lib/sql/client/crud/material-read";
  import type { SelectJob, SelectMaterial } from "$lib/sql/client/schema";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();

  const jobId = $derived(page.params.id);

  let job = $state<SelectJob | null>(null);
  let materials = $state<JobMaterial[]>([]);
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
      const [nextJob, nextMaterials] = await Promise.all([
        getUserJob(data.user_id, id),
        listJobMaterials(id),
      ]);

      job = nextJob ?? null;
      materials = nextMaterials;
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
      <div class="flex-1 min-h-0 overflow-y-auto overscroll-contain pb-20">
        <Accordion.Root type="multiple">
          {#each Array.from(materialsByCategory.entries()) as [ category, items ]}
            <MaterialCategory value={category} title={category} {items} />
          {/each}
        </Accordion.Root>
        <Button
          variant="secondary"
          size="xl"
          class="w-full border-2 border-secondary-foreground border-dashed py-7"
        >
          <Icon icon="material-symbols:add-circle" />
          Add Extra Material
        </Button>
      </div>
    </Tabs.Content>

    <Tabs.Content value="completed" class="flex flex-col min-h-0">
      <section class="w-full flex justify-between items-end my-4 shrink-0">
        <h2 class="font-heading font-medium text-2xl uppercase">Checklist</h2>
      </section>
      <div
        class="flex-1 min-h-0 overflow-y-auto overscroll-contain pb-20"
      ></div>
    </Tabs.Content>
  </Tabs.Root>
</div>
