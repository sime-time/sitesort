<script lang="ts">
  import Icon from "@iconify/svelte";
  import { goto } from "$app/navigation";

  let { showBack = false }: { showBack?: boolean } = $props();

  function goBack() {
    // If there's a page to go back to, use browser history
    if (window.history.length > 1) {
      window.history.back();
      return;
    }
    // Fallback if user landed directly on this page
    goto("/");
  }
</script>

<header class="border-b p-6 h-18">
  {#if showBack}
    <div class="flex items-center justify-between text-2xl">
      <button type="button" class="flex items-center gap-3" onclick={goBack}>
        <Icon
          icon="material-symbols:arrow-left-alt"
          class="text-muted-foreground"
        />
      </button>

      <Icon icon="fa7-solid:helmet-safety" class="text-primary" />
    </div>
  {:else}
    <div class="flex items-center gap-3 text-primary text-2xl">
      <Icon icon="fa7-solid:helmet-safety" />
      <h1 class="font-heading font-semibold uppercase tracking-wide text-xl">
        SiteSort
      </h1>
    </div>
  {/if}
</header>
