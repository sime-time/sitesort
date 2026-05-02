<script lang="ts">
  import Icon from "@iconify/svelte";

  let {
    icon,
    title,
    description,
  }: {
    // biome-ignore lint/suspicious/noExplicitAny: string or icon object
    icon: any;
    title: string;
    description: string;
  } = $props();
</script>

<div class="card bg-base-100 border-2 border-dashed border-accent">
  <div class="card-body items-center text-center py-8">
    <Icon {icon} class="size-10 text-base-content/50" />
    <p class="font-medium text-base">{title}</p>
    <p class="text-sm text-base-content/70">{description}</p>
  </div>
</div>
