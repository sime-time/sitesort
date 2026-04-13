<script lang="ts">
  import Icon from "@iconify/svelte";
  import { goto } from "$app/navigation";

  let { showBack = false, title }: { showBack?: boolean; title?: string } =
    $props();

  function goBack() {
    // Fallback if user landed directly on this page
    goto("/");
  }

  function signOut() {
    goto("/auth");
  }
</script>

<header class="p-6 h-18 border-b border-b-accent">
  {#if showBack}
    <div class="flex items-center justify-between text-2xl">
      <button type="button" class="flex items-center gap-3" onclick={goBack}>
        <Icon
          icon="material-symbols:arrow-left-alt"
          class="text-muted-foreground"
        />
        <h1 class="text-lg font-medium">{title}</h1>
      </button>

      <Icon icon="fa7-solid:helmet-safety" class="text-primary" />
    </div>
  {:else}
    <div class="flex justify-between text-primary text-2xl">
      <div class="flex items-center gap-3">
        <Icon icon="fa7-solid:helmet-safety" />
        <h1 class="font-heading font-semibold uppercase tracking-wide text-xl">
          SiteSort
        </h1>
      </div>
      <button
        type="button"
        class="font-sans tracking-normal btn btn-soft btn-error btn-xs uppercase"
        onclick={signOut}
      >
        <Icon icon="material-symbols:logout-sharp" class="size-4" />
        Sign Out
      </button>
    </div>
  {/if}
</header>
