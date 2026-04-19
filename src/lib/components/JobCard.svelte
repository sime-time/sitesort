<script lang="ts">
  import Icon from "@iconify/svelte";
  import { toast } from "svelte-sonner";
  import { goto } from "$app/navigation";

  let {
    id,
    name,
    address,
    completed,
    startDate,
    endDate,
  }: {
    id: string;
    name: string;
    address: string;
    completed: boolean;
    startDate: string;
    endDate?: string | null;
  } = $props();

  function openJob() {
    goto(`/job/${id}`);
  }

  function openMap(e: Event) {
    e.stopPropagation();

    const query = encodeURIComponent(address?.trim() ?? "");
    if (!query) {
      toast.error("No address found");
      return;
    }

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    // Cross-platform URL (opens Google Maps app on many phones if installed)
    const url = isIOS
      ? `https://maps.apple.com/?q=${query}`
      : `https://www.google.com/maps/search/?api=1&query=${query}`;

    // User-gesture click => allowed to open
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function formatDisplayDate(dateString?: string | null) {
    if (!dateString) return "";

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;

    const parts = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }).formatToParts(date);

    const weekday = parts.find((part) => part.type === "weekday")?.value;
    const month = parts.find((part) => part.type === "month")?.value;
    const day = parts.find((part) => part.type === "day")?.value;
    const year = parts.find((part) => part.type === "year")?.value;

    if (!weekday || !month || !day || !year) return dateString;

    return `${weekday}: ${month} ${day}, ${year}`;
  }
</script>

<div
  role="button"
  tabindex="0"
  class="card bg-white border-b border-b-accent"
  onclick={openJob}
  onkeydown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openJob();
    }
  }}
>
  <div class="card-body relative p-4">
    <h3 class="card-title font-medium text-lg">{name}</h3>

    <div class="flex gap-1 items-center">
      {#if completed && endDate}
        <Icon icon="material-symbols:calendar-check" />
        <span>Completed {formatDisplayDate(endDate)}</span>
      {:else}
        <Icon icon="material-symbols:date-range" />
        <span>Started {formatDisplayDate(startDate)}</span>
      {/if}
    </div>

    <button
      type="button"
      class="btn btn-soft btn-info btn-xs w-fit"
      onclick={(e) => openMap(e)}
    >
      <Icon icon="material-symbols:moved-location" class="size-4" />
      <span class="font-heading uppercase tracking-widest">{address}</span>
    </button>

    <div class="card-actions flex justify-end items-center gap-1 text-primary">
      <span class="uppercase tracking-widest font-medium text-xs">
        {completed ? "Edit" : "Continue"}
      </span>
      <Icon icon="material-symbols:chevron-right" />
    </div>
  </div>
</div>
