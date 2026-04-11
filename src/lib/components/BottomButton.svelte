<script lang="ts">
  import Icon from "@iconify/svelte";
  import Button from "$lib/components/ui/button/button.svelte";

  let {
    label,
    icon,
    href,
    dotted = false,
    type = "button",
    onclick,
  }: {
    label: string;
    icon: string;
    href?: string;
    dotted?: boolean;
    type?: "button" | "submit";
    onclick?: () => void;
  } = $props();
</script>

<section
  class="fixed bg-card inset-x-0 bottom-0 z-50 flex justify-center p-3 pb-[calc(1rem+env(safe-area-inset-bottom))]"
>
  <div class="w-full max-w-120">
    <Button
      {href}
      {onclick}
      {type}
      size="xl"
      variant={dotted ? "secondary" : "default"}
      class={dotted ? "w-full border-2 border-secondary-foreground border-dashed" : "w-full"}
    >
      <Icon {icon} />
      <span class="text-base">{label}</span>
    </Button>
  </div>
</section>
