<script lang="ts">
  const {
    id,
    description,
    completed,
  }: {
    id: string;
    description: string;
    completed: boolean;
  } = $props();
</script>

<div class="bg-white border-b border-accent p-4">
  <label class="w-full flex items-center gap-3">
    <input
      type="checkbox"
      checked={completed}
      class="checkbox checkbox-xl checkbox-primary border border-primary size-10"
    >
    <span class="font-medium text-base">{description}</span>
  </label>
</div>
