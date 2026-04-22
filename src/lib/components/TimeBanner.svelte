<script lang="ts">
  import Icon from "@iconify/svelte";
  import timerOutlineIcon from "@iconify-icons/material-symbols/timer-outline";
  import {
    formatDuration,
    formatTimeLabel,
    timeState,
  } from "$lib/utils/time-state.svelte";

  const activeEntry = $derived(
    timeState.entries.find((entry) => entry.clockOutAt === null),
  );
  const activeElapsed = $derived(
    activeEntry
      ? formatDuration(
          timeState.nowMs - new Date(activeEntry.clockInAt).getTime(),
        )
      : "",
  );
  const activeStartTime = $derived(
    activeEntry ? formatTimeLabel(activeEntry.clockInAt) : "",
  );
</script>

<div
  id="time-banner"
  class="fixed inset-x-0 z-40 bottom-[calc(var(--dock-height)+env(safe-area-inset-bottom))]"
>
  <div class="alert alert-info">
    <Icon icon={timerOutlineIcon} class="size-5" />
    <div class="flex flex-col">
      <span class="font-semibold">{activeElapsed}</span>
      <span class="text-sm">Since {activeStartTime}</span>
    </div>
  </div>
</div>

<style>
  #time-banner {
    view-transition-name: time-banner;
  }
</style>
