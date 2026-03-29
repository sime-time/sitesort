<script lang="ts">
  import Icon from "@iconify/svelte";
  import Button from "$lib/components/ui/button/button.svelte";

  let {
    label,
    icon,
    href,
    type = "button",
    onclick,
  }: {
    label: string;
    icon: string;
    href?: string;
    type?: "button" | "submit";
    onclick?: () => void;
  } = $props();
</script>

<section
  class="fixed bg-card inset-x-0 bottom-0 z-50 flex justify-center p-3 pb-[calc(1rem+env(safe-area-inset-bottom))]"
>
  <div class="w-full max-w-120">
    <Button {href} {onclick} {type} size="xl" class="w-full">
      <Icon {icon} />
      <span>{label}</span>
    </Button>
  </div>
</section>
