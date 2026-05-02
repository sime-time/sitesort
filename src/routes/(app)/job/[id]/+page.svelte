<script lang="ts">
  import Icon from "@iconify/svelte";
  import addCircleOutlineIcon from "@iconify-icons/material-symbols/add-circle-outline";
  import checkCircleOutlineIcon from "@iconify-icons/material-symbols/check-circle-outline";
  import checklistIcon from "@iconify-icons/material-symbols/checklist";
  import closeIcon from "@iconify-icons/material-symbols/close";
  import serviceToolboxIcon from "@iconify-icons/material-symbols/service-toolbox";
  import { toast } from "svelte-sonner";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { listCategories } from "$lib/client/crud/read-category";
  import { getUserJob } from "$lib/client/crud/read-job";
  import {
    type JobMaterial,
    watchJobMaterials,
  } from "$lib/client/crud/read-material";
  import { watchJobTasks } from "$lib/client/crud/read-task";
  import { setJobCompleted } from "$lib/client/crud/update-job";
  import type { SelectCategory, SelectTask } from "$lib/client/schema";
  import MaterialCategory from "$lib/components/material/MaterialCategory.svelte";
  import MaterialForm from "$lib/components/material/MaterialForm.svelte";
  import MaterialNoteForm from "$lib/components/material/MaterialNoteForm.svelte";
  import TaskForm from "$lib/components/task/TaskForm.svelte";
  import TaskItem from "$lib/components/task/TaskItem.svelte";
  import { haptic } from "$lib/utils/haptic";

  const jobId = $derived(page.params.id);

  let materials = $state<JobMaterial[]>([]);
  let tasks = $state<SelectTask[]>([]);
  let categories = $state<SelectCategory[]>([]);
  let loading = $state(true);
  let activeTab = $state<"materials" | "checklist">("materials");
  let isJobCompleted = $state<boolean>(false);

  let addModal: HTMLDialogElement | undefined;
  let noteModal: HTMLDialogElement | undefined;
  let selectedJobMaterialId = $state<string | null>(null);
  let selectedMaterialName = $state<string>("");
  let selectedMaterialNote = $state<string>("");

  function openModalForm() {
    addModal?.showModal();
  }

  function closeModalForm() {
    addModal?.close();
  }

  function openNoteModal(material: {
    id: string;
    name: string;
    note: string | null;
  }) {
    selectedJobMaterialId = material.id;
    selectedMaterialName = material.name;
    selectedMaterialNote = material.note || "";
    noteModal?.showModal();
  }

  function closeNoteModal() {
    selectedJobMaterialId = null;
    selectedMaterialName = "";
    selectedMaterialNote = "";
    noteModal?.close();
  }

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

  async function completeJob() {
    if (!jobId) return;
    haptic.confirm();
    await setJobCompleted(jobId, true);
    toast.success("Job completed");
    goto("/");
  }

  $effect(() => {
    if (!jobId) return;
    loading = true;

    const userId = page.data?.user_id as string | undefined;

    if (userId) {
      void (async () => {
        const job = await getUserJob(userId, jobId);
        isJobCompleted = job?.completed;
      })();
    }

    void listCategories()
      .then((next) => {
        categories = next;
      })
      .catch((err) => {
        console.error("Category load failed", err);
      })
      .finally(() => (loading = false));

    const disposeTasks = watchJobTasks(
      jobId,
      (nextTasks) => {
        tasks = nextTasks;
      },
      (error) => {
        console.error("Task watch failed", error);
      },
    );

    const disposeMaterials = watchJobMaterials(
      jobId,
      (nextMaterials) => {
        materials = nextMaterials;
      },

      (error) => {
        console.error("Material watch failed", error);
      },
    );
    return () => {
      disposeTasks();
      disposeMaterials();
    };
  });
</script>

<div class="min-h-0 p-3 flex flex-col flex-1 ">
  <!-- Tab Selector -->
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
      onclick={() => {haptic(); activeTab = "materials"}}
    >
      <Icon icon={serviceToolboxIcon} class="text-base" />
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
      onclick={() => {haptic(); activeTab = "checklist"}}
    >
      <Icon icon={checklistIcon} class="text-base" />
      <span>Checklist</span>
    </button>
  </div>

  <!-- Tab Content List -->
  <div class="tab-content flex flex-col min-h-0 bg-base-100">
    <section
      class="flex-1 min-h-0 overflow-y-auto overscroll-contain pt-3 pb-20 no-scrollbar"
    >
      {#if activeTab === "materials"}
        <div class="overflow-x-auto">
          <table class="table table-zebra">
            <thead>
              <tr>
                <th>Quantity</th>
                <th>Name</th>
                <th>Notes</th>
              </tr>
            </thead>
            {#each Array.from(materialsByCategory.entries()) as [ category, items ]}
              <MaterialCategory
                title={category}
                {items}
                onOpenNote={openNoteModal}
              />
            {/each}
          </table>
        </div>
      {:else}
        {#each tasks as task}
          <TaskItem
            id={task.id}
            completed={task.completed}
            description={task.description}
          />
        {/each}
      {/if}

      <!-- Open Modal Trigger -->
      <button
        type="button"
        class="mt-6 w-full uppercase font-heading tracking-widest btn btn-xl btn-neutral btn-soft border-2 border-neutral border-dashed"
        onclick={openModalForm}
      >
        <Icon icon={addCircleOutlineIcon} />
        <span class="text-base">
          {activeTab === "materials" ? "New Material" : "New Task"}
        </span>
      </button>

      <!-- Complete Job Button -->
      {#if activeTab === "checklist" && !isJobCompleted}
        <button
          type="button"
          class="mt-6 w-full uppercase font-heading tracking-widest btn btn-xl btn-success border border-success btn-soft"
          onclick={completeJob}
        >
          <Icon icon={checkCircleOutlineIcon} />
          <span class="text-base"> Complete Job </span>
        </button>
      {/if}

      <!-- Modal -->
      <dialog bind:this={addModal} class="modal modal-bottom sm:modal-middle">
        <div class="modal-box">
          <!-- Close Modal Button -->
          <form method="dialog">
            <button
              type="submit"
              class="btn btn-sm btn-circle btn-neutral btn-soft absolute right-2 top-2"
            >
              <Icon icon={closeIcon} class="size-6" />
            </button>
          </form>

          <!-- Modal Form -->
          {#if activeTab === "materials"}
            <MaterialForm {jobId} {categories} onSuccess={closeModalForm} />
          {:else}
            <TaskForm {jobId} onSuccess={closeModalForm} />
          {/if}
        </div>
      </dialog>

      <!-- Note Modal -->
      <dialog
        bind:this={noteModal}
        class="modal modal-bottom sm:modal-middle"
        onclose={closeNoteModal}
      >
        <div class="modal-box">
          <!-- Close Note Modal Button -->
          <form method="dialog">
            <button
              type="submit"
              class="btn btn-sm btn-circle btn-neutral btn-soft absolute right-2 top-2"
            >
              <Icon icon={closeIcon} class="size-6" />
            </button>
          </form>

          <!-- Note Modal Form -->
          {#if activeTab === "materials" && selectedJobMaterialId !== null}
            <MaterialNoteForm
              jobMaterialId={selectedJobMaterialId}
              materialName={selectedMaterialName}
              materialNote={selectedMaterialNote}
              onSuccess={closeNoteModal}
            />
          {/if}
        </div>
      </dialog>
    </section>
  </div>
</div>
