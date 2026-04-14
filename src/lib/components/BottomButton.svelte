<script lang="ts">
  import Icon from "@iconify/svelte";

  let {
    label,
    icon,
    type = "button",
    extra = false,
    onclick,
  }: {
    label: string;
    icon: string;
    type?: "button" | "submit";
    extra?: boolean;
    onclick?: () => void;
  } = $props();
</script>

<section class="dock bg-white">
  <div class="w-full max-w-120">
    <button
      {onclick}
      {type}
      class={`w-full btn btn-xl uppercase font-heading tracking-widest ${extra ? "bg-secondary btn-outline border-2 border-dashed" : "btn-primary"}`}
    >
      <Icon {icon} />
      <span class="text-base">{label}</span>
    </button>
  </div>
</section>
