<script lang="ts">
  import Icon from "@iconify/svelte";

  let {
    label,
    icon,
    type = "button",
    onclick,
  }: {
    label: string;
    icon: string;
    type?: "button" | "submit";
    onclick?: () => void;
  } = $props();
</script>

<section
  class="fixed bg-white inset-x-0 bottom-0 z-50 flex justify-center p-3 pb-[calc(1rem+env(safe-area-inset-bottom))]"
>
  <div class="w-full max-w-120">
    <button
      {onclick}
      {type}
      class="w-full btn btn-primary btn-xl uppercase font-heading tracking-widest"
    >
      <Icon {icon} />
      <span class="text-base">{label}</span>
    </button>
  </div>
</section>
