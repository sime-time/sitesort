<script lang="ts">
  import Icon from "@iconify/svelte";
  import { page } from "$app/state";
  import MaterialCategory from "$lib/components/material/MaterialCategory.svelte";
  import TopBar from "$lib/components/TopBar.svelte";
  import * as Accordion from "$lib/components/ui/accordion/index";
  import Button from "$lib/components/ui/button/button.svelte";
  import * as Tabs from "$lib/components/ui/tabs/index";

  const currentJobName = $derived(
    page.url.searchParams.get("job-name") ?? "Job",
  );
</script>

<div class="h-dvh overflow-hidden flex flex-col">
  <TopBar title={currentJobName} showBack={true} />
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
          <MaterialCategory value="cables" title="Cable & Wire" />
          <MaterialCategory value="conduits" title="Conduits & Fittings" />
        </Accordion.Root>
        <Button
          variant="secondary"
          size="xl"
          class="w-full border-2 border-secondary-foreground border-dashed"
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
