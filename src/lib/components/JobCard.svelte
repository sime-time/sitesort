<script lang="ts">
  import Icon from "@iconify/svelte";
  import { toast } from "svelte-sonner";
  import Button from "$lib/components/ui/button/button.svelte";
  import * as Card from "$lib/components/ui/card/index";

  let {
    name,
    address,
    completed,
    startDate,
    endDate,
    pinned,
    onPin,
  }: {
    name: string;
    address: string;
    completed: boolean;
    startDate: string;
    endDate?: string | null;
    pinned?: boolean;
    onPin?: () => void;
  } = $props();

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
</script>

<Card.Root
  class={pinned ? `border-l-primary border-l-3` : ""}
  onclick={() => console.log("Card clicked")}
>
  <Card.Header class="relative">
    {#if !completed}
      <Button
        variant="outline"
        size="icon-sm"
        class="absolute right-4 top-0 uppercase text-xs z-10"
        onclick={(e) => {
					e.stopPropagation();
					onPin?.();
				}}
      >
        <Icon
          icon={pinned ? "ph:push-pin-bold" : "ph:push-pin-slash-bold"}
          class="text-muted-foreground"
        />
      </Button>
    {/if}
    <Card.Title>{name}</Card.Title>
    <Card.Description class="flex gap-1 items-center">
      {#if completed && endDate}
        <Icon icon="material-symbols:calendar-check" />
        <span>Completed {endDate}</span>
      {:else}
        <Icon icon="material-symbols:date-range" />
        <span>Started {startDate}</span>
      {/if}
    </Card.Description>
  </Card.Header>
  <Card.Content>
    <Button variant="ghost" size="xs" onclick={(e) => openMap(e)}>
      <Icon icon="material-symbols:moved-location" />
      <span>{address}</span>
    </Button>
    <div class="flex justify-end items-center gap-1 text-primary">
      <p class="uppercase tracking-widest font-medium text-xs">
        {completed ? "Edit" : "Continue"}
      </p>
      <Icon icon="material-symbols:chevron-right" />
    </div>
  </Card.Content>
</Card.Root>
