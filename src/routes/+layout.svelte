<script lang="ts">
  import favicon from "$lib/assets/favicon.svg";
  import "@fontsource-variable/space-grotesk/wght.css";
  import "@fontsource-variable/work-sans/wght.css";
  import { Toaster } from "$lib/components/ui/sonner/index";

  import "../app.css";

  let { children } = $props();
</script>

<svelte:head> <link rel="icon" href={favicon}> </svelte:head>

<Toaster />
<main class="w-full min-h-dvh flex justify-center">
  <div class="w-full max-w-120 min-h-dvh">{@render children()}</div>
</main>
