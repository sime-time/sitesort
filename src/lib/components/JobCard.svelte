<script lang="ts">
  import Icon from "@iconify/svelte";
  import { toast } from "svelte-sonner";
  import Badge from "$lib/components/ui/badge/badge.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import * as Card from "$lib/components/ui/card/index";
</script>

<Card.Root
  class="border-l-primary border-l-4"
  onclick={() => console.log("Card clicked")}
>
  <Card.Header class="relative">
    <Badge
      variant="destructive"
      class="absolute right-4 top-0 uppercase text-xs z-10"
      onclick={(e) => {
				e.stopPropagation();
				console.log("Badge clicked");
			}}
      >Priority</Badge
    >
    <Card.Title>Shenoy Job</Card.Title>
    <Card.Description class="flex gap-1 items-center">
      <Icon icon="material-symbols:date-range-rounded" />
      <span> Started Oct 12, 2025</span>
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
      <Icon icon="material-symbols:content-copy-outline" />
      <span>7237 Bradford Woods Way</span>
    </Button>
    <div class="flex justify-end items-center gap-1 text-primary">
      <p class="uppercase tracking-widest font-medium text-xs">Continue</p>
      <Icon icon="material-symbols:chevron-right" />
    </div>
  </Card.Content>
</Card.Root>
