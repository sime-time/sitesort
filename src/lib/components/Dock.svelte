<script lang="ts">
  import Icon from "@iconify/svelte";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";

  const pathname = $derived(page.url.pathname);
  const active = $derived.by(() => {
    if (pathname.startsWith("/time")) {
      return "time";
    } else if (pathname.startsWith("/create-job")) {
      return "create";
    } else {
      return "jobs";
    }
  });
</script>

<div class="dock bg-white">
  <button
    type="button"
    class={active === "jobs" ? "dock-active" : ""}
    onclick={() => goto("/")}
  >
    <Icon icon="mdi:hammer-screwdriver" />
    <span class="dock-label">Jobs</span>
  </button>

  <button
    type="button"
    class={active === "time" ? "dock-active" : ""}
    onclick={() => goto("/time")}
  >
    <Icon icon="material-symbols:nest-clock-farsight-analog-outline" />
    <span class="dock-label">Time</span>
  </button>

  <button
    type="button"
    class={active === "create" ? "dock-active" : ""}
    onclick={() => goto("/create-job")}
  >
    <Icon icon="material-symbols:add-box-outline" />
    <span class="dock-label">Create</span>
  </button>
</div>
