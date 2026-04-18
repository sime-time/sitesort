<script lang="ts">
  import Icon from "@iconify/svelte";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";

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
</script>

<footer class="dock dock-lg bg-white">
  <button
    type="button"
    class={active === "jobs" ? "dock-active" : ""}
    onclick={() => goto("/")}
  >
    {#if active === "jobs"}
      <span class="dock-marker" aria-hidden="true"></span>
    {/if}
    <Icon icon="mdi:hammer-screwdriver" />
    <span class="dock-label">Jobs</span>
  </button>

  <button
    type="button"
    class={active === "time" ? "dock-active" : ""}
    onclick={() => goto("/time")}
  >
    {#if active === "time"}
      <span class="dock-marker" aria-hidden="true"></span>
    {/if}
    <Icon icon="material-symbols:nest-clock-farsight-analog-outline" />
    <span class="dock-label">Time</span>
  </button>

  <button
    type="button"
    class={active === "create" ? "dock-active" : ""}
    onclick={() => goto("/job/create")}
  >
    {#if active === "create"}
      <span class="dock-marker" aria-hidden="true"></span>
    {/if}
    <Icon icon="material-symbols:add-box-outline" />
    <span class="dock-label">Create</span>
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
