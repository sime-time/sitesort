<script lang="ts">
  import { toggleTask } from "$lib/client/crud/update-task";
  import { haptic } from "$lib/utils/haptic";

  const {
    id,
    description,
    completed,
  }: {
    id: string;
    description: string;
    completed: boolean;
  } = $props();

  // svelte-ignore state_referenced_locally
  let localCompleted = $state<boolean>(completed);
  let saving = $state(false);

  // keep local state aligned with parent watcher
  $effect(() => {
    localCompleted = completed;
  });

  async function handleToggle(event: Event) {
    haptic.confirm();
    const input = event.currentTarget as HTMLInputElement;
    const nextCompleted = input.checked;

    localCompleted = nextCompleted;
    saving = true;

    try {
      await toggleTask(id, nextCompleted);
    } catch (err) {
      console.error("Toggle task failed", err);
      localCompleted = !nextCompleted; // rollback on failure
    } finally {
      saving = false;
    }
  }
</script>

<div class="bg-white border-b border-accent p-4">
  <label class="w-full flex items-center gap-3">
    <input
      onchange={handleToggle}
      type="checkbox"
      checked={localCompleted}
      disabled={saving}
      class="checkbox checkbox-xl checkbox-primary border border-primary size-10"
    >
    <span class="font-medium text-base">{description}</span>
  </label>
</div>
