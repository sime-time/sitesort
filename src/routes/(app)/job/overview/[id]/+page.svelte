<script lang="ts">
  import Icon from "@iconify/svelte";
  import assignmentTurnedInIcon from "@iconify-icons/material-symbols/assignment-turned-in";
  import contentCopyIcon from "@iconify-icons/material-symbols/content-copy";
  import descriptionIcon from "@iconify-icons/material-symbols/description";
  import inventory2Icon from "@iconify-icons/material-symbols/inventory-2";
  import { toast } from "svelte-sonner";
  import { page } from "$app/state";
  import { getUserJob } from "$lib/client/crud/read-job";
  import {
    type JobMaterial,
    watchJobMaterials,
  } from "$lib/client/crud/read-material";
  import { watchJobTasks } from "$lib/client/crud/read-task";
  import type { SelectTask } from "$lib/client/schema";
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

  const hasOverviewData = $derived(
    usedMaterials.length > 0 || completedTasks.length > 0,
  );

  function formatDate(dateString: string | null | undefined) {
    if (!dateString) return "-";
    const dateOnly = dateString.slice(0, 10);
    const [year, month, day] = dateOnly.split("-");
    if (!year || !month || !day) return "-";
    return `${Number(month)}/${Number(day)}/${year}`;
  }

  const summaryText = $derived.by(() => {
    const lines = [
      `Job: ${jobName || "-"}`,
      `Address: ${jobAddress?.trim() || "-"}`,
      `Contractor: ${jobContractor?.trim() || "-"}`,
      `Start Date: ${formatDate(jobStartDate)}`,
      `End Date: ${formatDate(jobEndDate)}`,
      "--- Materials ---",
      ...usedMaterials.map((material) => {
        const note = material.note?.trim();
        return `- ${material.quantity}x ${material.name}${note ? ` (${note})` : ""}`;
      }),
      "--- Tasks ---",
      ...completedTasks.map((task) => `[x] ${task.description}`),
    ];

    return lines.join("\n");
  });

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(summaryText);
      haptic.confirm();
      toast.success("Summary copied");
    } catch (error) {
      console.error("Copy summary failed", error);
      toast.error("Unable to copy summary");
    }
  }

  function sharePdf() {
    haptic();
    toast.info("PDF export coming soon");
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

  <section class="card bg-base-200 border border-base-300">
    <div class="card-body p-3 gap-2">
      <div class="flex items-center justify-between gap-2">
        <h2
          class="font-heading uppercase tracking-wide text-sm text-neutral/80"
        >
          Job Summary
        </h2>
      </div>
      <div class="overflow-x-auto">
        <table class="table table-sm w-full">
          <tbody>
            <tr>
              <td class="text-neutral/70 w-24 sm:w-28 px-0">Job:</td>
              <td class="font-medium px-0 truncate">{jobName || "-"}</td>
              <td class="text-neutral/70 w-24 sm:w-28 px-0">Contractor:</td>
              <td class="font-medium px-0 truncate">
                {jobContractor?.trim() || "-"}
              </td>
            </tr>
            <tr>
              <td class="text-neutral/70 px-0">Start Date:</td>
              <td class="font-medium px-0">{formatDate(jobStartDate)}</td>
              <td class="text-neutral/70 px-0">End Date:</td>
              <td class="font-medium px-0">{formatDate(jobEndDate)}</td>
            </tr>
            <tr>
              <td class="text-neutral/70 px-0">Address:</td>
              <td class="font-medium px-0 truncate" colspan="3">
                {jobAddress?.trim() || "-"}
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
            <Icon icon={inventory2Icon} />
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
                  <th class="w-16">Qty</th>
                  <th>Material</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {#each usedMaterials as material (material.id)}
                  <tr>
                    <td class="font-semibold">{material.quantity}x</td>
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
            <Icon icon={assignmentTurnedInIcon} />
            Completed Tasks
          </h3>
          <span class="badge badge-success badge-sm"
            >{completedTasks.length}</span
          >
        </div>

        {#if completedTasks.length === 0}
          <p class="text-sm text-base-content/60">No completed tasks yet.</p>
        {:else}
          <ul class="space-y-1 text-sm leading-snug">
            {#each completedTasks as task (task.id)}
              <li class="flex items-start gap-2">
                <span class="text-success mt-px">[x]</span>
                <span>{task.description}</span>
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    </article>

    <article class="card bg-base-200 border border-base-300">
      <div class="card-body p-3 gap-2">
        <button
          type="button"
          class="btn btn-neutral btn-soft btn-lg uppercase font-heading tracking-widest w-full"
          onclick={copySummary}
          disabled={loading || !hasOverviewData}
        >
          <Icon icon={contentCopyIcon} />
          <span>Copy Text Summary</span>
        </button>

        <textarea
          class="textarea textarea-bordered w-full h-28 text-xs leading-snug"
          readonly
          value={summaryText}
        ></textarea>
      </div>
    </article>
  </section>
</div>
