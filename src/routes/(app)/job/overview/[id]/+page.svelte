<script lang="ts">
  import Icon from "@iconify/svelte";
  import descriptionIcon from "@iconify-icons/material-symbols/description";
  import factCheckIcon from "@iconify-icons/material-symbols/fact-check";
  import inventory2Icon from "@iconify-icons/material-symbols/inventory-2";
  import powerDrillIcon from "@iconify-icons/material-symbols/tools-power-drill-outline";
  import { toast } from "svelte-sonner";
  import { page } from "$app/state";
  import { getUserJob } from "$lib/client/crud/read-job";
  import {
    type JobMaterial,
    watchJobMaterials,
  } from "$lib/client/crud/read-material";
  import { watchJobTasks } from "$lib/client/crud/read-task";
  import type { SelectTask } from "$lib/client/schema";
  import {
    generateJobSheetPdf,
    type JobSheetInput,
  } from "$lib/utils/generate-job-sheet";
  import { haptic } from "$lib/utils/haptic";

  const jobId = $derived(page.params.id);

  let materials = $state<JobMaterial[]>([]);
  let tasks = $state<SelectTask[]>([]);
  let loading = $state(true);
  let jobName = $state("");
  let jobAddress = $state<string | null>(null);
  let jobContractor = $state<string | null>(null);
  let jobStartDate = $state<string>("");
  let jobEndDate = $state<string | null>(null);

  const usedMaterials = $derived.by(() =>
    materials.filter(
      (material) => Number(material.quantity) > 0 || material.note,
    ),
  );

  function isCompletedTask(task: SelectTask) {
    const completedValue = task.completed as unknown;
    return (
      completedValue === true || completedValue === 1 || completedValue === "1"
    );
  }

  const completedTasks = $derived.by(() =>
    tasks.filter((task) => isCompletedTask(task)),
  );

  function formatDate(dateString: string | null | undefined) {
    if (!dateString) return "-";
    const dateOnly = dateString.slice(0, 10);
    const [year, month, day] = dateOnly.split("-");
    if (!year || !month || !day) return "-";
    return `${Number(month)}/${Number(day)}/${year}`;
  }

  async function sharePdf() {
    haptic();
    loading = true;

    // Get all the input needed for the pdf
    const materialsInput = usedMaterials.map((m) => ({
      name: m.name,
      quantity: m.quantity ?? null,
      note: m.note ?? null,
    }));

    const tasksInput = completedTasks.map((t) => ({
      description: t.description,
      completed: t.completed,
    }));

    const jobInput: JobSheetInput = {
      name: jobName,
      contractor: jobContractor,
      address: jobAddress,
      materials: materialsInput,
      tasks: tasksInput,
    };

    try {
      const file = await generateJobSheetPdf(jobInput);
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: `Job: ${jobName}`, files: [file] });
        toast.info("PDF shared");
      } else {
        throw new Error("Cannot share pdf");
      }
    } catch (err) {
      console.error("Job Sheet Share Failed:", err);
      toast.error("PDF share canceled");
    } finally {
      loading = false;
    }
  }

  $effect(() => {
    if (!jobId) return;
    loading = true;

    const userId = page.data?.user_id as string | undefined;

    if (userId) {
      void (async () => {
        const job = await getUserJob(userId, jobId);
        if (!job) return;
        jobName = job.name;
        jobAddress = job.address;
        jobContractor = job.contractor;
        jobStartDate = job.start_date;
        jobEndDate = job.end_date;
      })();
    }

    const disposeTasks = watchJobTasks(
      jobId,
      (nextTasks) => {
        tasks = nextTasks;
        loading = false;
      },
      (error) => {
        console.error("Task watch failed", error);
        loading = false;
      },
    );

    const disposeMaterials = watchJobMaterials(
      jobId,
      (nextMaterials) => {
        materials = nextMaterials;
        loading = false;
      },
      (error) => {
        console.error("Material watch failed", error);
        loading = false;
      },
    );

    return () => {
      disposeTasks();
      disposeMaterials();
    };
  });
</script>

<div
  class="flex flex-col flex-1 min-h-0 p-3 gap-3 overflow-y-auto overscroll-contain pb-[calc(var(--dock-height)+env(safe-area-inset-bottom)+0.75rem)] no-scrollbar"
>
  <button
    type="button"
    class="btn btn-xl btn-primary uppercase font-heading tracking-widest w-full"
    onclick={sharePdf}
  >
    <Icon icon={descriptionIcon} class="text-xl" />
    <span>Share PDF</span>
  </button>

  <section class="card border border-base-300">
    <div class="card-body p-3 gap-2">
      <div class="flex items-center justify-between gap-2">
        <h2
          class="font-heading uppercase tracking-wide text-sm text-neutral/80 flex items-center gap-1.5"
        >
          <Icon icon={powerDrillIcon} class="size-5" />
          Job Summary
        </h2>
      </div>
      <div class="overflow-x-auto">
        <table class="table table-sm w-full">
          <tbody>
            <tr>
              <td class="px-0">
                <span class="text-neutral/70">Job:</span>
                <span class="font-medium truncate">{jobName || "-"}</span>
              </td>
              <td class="px-0">
                <span class="text-neutral/70">Contractor:</span>
                <span class="font-medium truncate">
                  {jobContractor?.trim() || "-"}
                </span>
              </td>
            </tr>
            <tr>
              <td class="px-0">
                <span class="text-neutral/70">Start Date:</span>
                <span class="font-medium truncate">
                  {formatDate(jobStartDate)}
                </span>
              </td>
              <td class="px-0">
                <span class="text-neutral/70">End Date:</span>
                <span class="font-medium truncate">
                  {formatDate(jobEndDate)}
                </span>
              </td>
            </tr>
            <tr>
              <td class="px-0" colspan="2">
                <span class="text-neutral/70">Address:</span>
                <span class="font-medium truncate">
                  {jobAddress?.trim() || "-"}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>

  <section class="space-y-3">
    <article class="card bg-base-100 border border-base-300">
      <div class="card-body p-3 gap-2">
        <div class="flex items-center justify-between">
          <h3
            class="font-heading uppercase tracking-wide text-sm text-primary flex items-center gap-1.5"
          >
            <Icon icon={inventory2Icon} class="size-5" />
            Materials Used
          </h3>
          <span class="badge badge-primary badge-sm"
            >{usedMaterials.length}</span
          >
        </div>

        {#if usedMaterials.length === 0}
          <p class="text-sm text-base-content/60">
            No materials with quantity above zero.
          </p>
        {:else}
          <div class="overflow-x-auto">
            <table class="table table-sm">
              <thead>
                <tr>
                  <th class="w-1 whitespace-nowrap pr-1">Qty</th>
                  <th>Material</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {#each usedMaterials as material (material.id)}
                  <tr>
                    <td class="font-semibold whitespace-nowrap pr-1">
                      {material.quantity}x
                    </td>
                    <td class="font-medium">{material.name}</td>
                    <td class="text-xs leading-snug text-base-content/75">
                      {material.note?.trim() || "-"}
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/if}
      </div>
    </article>

    <article class="card bg-base-100 border border-base-300">
      <div class="card-body p-3 gap-2">
        <div class="flex items-center justify-between">
          <h3
            class="font-heading uppercase tracking-wide text-sm text-success flex items-center gap-1.5"
          >
            <Icon icon={factCheckIcon} class="size-5" />
            Completed Tasks
          </h3>
          <span class="badge badge-success badge-sm"
            >{completedTasks.length}</span
          >
        </div>

        {#if completedTasks.length === 0}
          <p class="text-sm text-base-content/60">No completed tasks yet.</p>
        {:else}
          <div class="overflow-x-auto">
            <table class="table table-sm w-full">
              <tbody>
                {#each completedTasks as task (task.id)}
                  <tr class="flex items-start gap-2">
                    <td
                      class="whitespace-nowrap pr-1 pl-0 border-0 text-success"
                    >
                      [x]
                    </td>
                    <td class="px-0">{task.description}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/if}
      </div>
    </article>
  </section>
</div>
