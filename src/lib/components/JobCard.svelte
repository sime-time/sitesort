<script lang="ts">
  import Icon from "@iconify/svelte";
  import { toast } from "svelte-sonner";
  import Button from "$lib/components/ui/button/button.svelte";
  import * as Card from "$lib/components/ui/card/index";

  let {
    name,
    startDate,
    address,
    completed,
    pinned,
    onPin,
  }: {
    name: string;
    startDate: string;
    address: string;
    completed: boolean;
    pinned?: boolean;
    onPin?: () => void;
  } = $props();
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
      <Icon icon="material-symbols:date-range-rounded" />
      <span>Started {startDate}</span>
    </Card.Description>
  </Card.Header>
  <Card.Content>
    <Button
      variant="ghost"
      size="xs"
      onclick={(e) => {
				e.stopPropagation(); 
				toast.success("Address Copied");
			}}
    >
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
