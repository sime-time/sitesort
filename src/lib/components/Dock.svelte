<script lang="ts">
  import Icon from "@iconify/svelte";
  import addBoxOutlineIcon from "@iconify-icons/material-symbols/add-box-outline";
  import nestClockFarsightAnalogOutlineIcon from "@iconify-icons/material-symbols/nest-clock-farsight-analog-outline";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { haptic } from "$lib/utils/haptic";

  const ICON_CLASS = "size-6";

  const pathname = $derived(page.url.pathname);
  const active = $derived.by(() => {
    if (pathname.startsWith("/time")) {
      return "time";
    } else if (pathname.startsWith("/job/create")) {
      return "create";
    } else {
      return "jobs";
    }
  });

  function gotoHaptic(href: string) {
    goto(href);
    haptic.confirm();
  }
</script>

<footer class="dock dock-lg bg-white z-50">
  <button
    type="button"
    class={active === "jobs" ? "dock-active" : ""}
    onclick={() => gotoHaptic("/")}
  >
    {#if active === "jobs"}
      <span class="dock-marker" aria-hidden="true"></span>
    {/if}
    <Icon icon="mdi:hammer-screwdriver" class={ICON_CLASS} />
    <span class="dock-label font-semibold">Jobs</span>
  </button>

  <button
    type="button"
    class={active === "time" ? "dock-active" : ""}
    onclick={() => gotoHaptic("/time")}
  >
    {#if active === "time"}
      <span class="dock-marker" aria-hidden="true"></span>
    {/if}
    <Icon icon={nestClockFarsightAnalogOutlineIcon} class={ICON_CLASS} />
    <span class="dock-label font-semibold">Time</span>
  </button>

  <button
    type="button"
    class={active === "create" ? "dock-active" : ""}
    onclick={() => gotoHaptic("/job/create")}
  >
    {#if active === "create"}
      <span class="dock-marker" aria-hidden="true"></span>
    {/if}
    <Icon icon={addBoxOutlineIcon} class={ICON_CLASS} />
    <span class="dock-label font-semibold">Create</span>
  </button>
</footer>

<style>
  footer {
    view-transition-name: dock;
  }

  footer :global(.dock-active::after) {
    width: 0;
    background-color: transparent;
  }

  .dock-marker {
    position: absolute;
    bottom: 0.2rem;
    width: 2.5rem;
    height: 0.25rem;
    border-radius: 9999px;
    background-color: currentColor;
    view-transition-name: dock-active-marker;
  }

  :global(::view-transition-old(dock-active-marker)),
  :global(::view-transition-new(dock-active-marker)) {
    animation-duration: 240ms;
    animation-timing-function: cubic-bezier(0.2, 0.9, 0.2, 1);
  }
</style>
