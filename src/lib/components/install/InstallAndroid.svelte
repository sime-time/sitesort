<script lang="ts">
  let {
    canOneTapInstall = false,
    onInstall,
  }: {
    canOneTapInstall?: boolean;
    onInstall: () => void | Promise<void>;
  } = $props();
</script>

<section class="space-y-3">
  {#if canOneTapInstall}
    <button type="button" class="btn btn-primary w-full" onclick={onInstall}>
      Install SiteSort
    </button>
    <p class="text-sm leading-6 text-base-content/80">
      Tap Install once. SiteSort will be added to your home screen.
    </p>
  {:else}
    <p class="text-sm leading-6 text-base-content/80">
      If you do not see the install button yet, use your browser menu and tap
      <span class="font-semibold text-base-content">Install app</span>
      or
      <span class="font-semibold text-base-content">Add to Home screen</span>.
    </p>
  {/if}

  <div class="rounded-box border border-base-300 bg-base-100/70 p-3">
    <p class="font-semibold text-sm uppercase tracking-wide text-base-content">
      Android quick steps
    </p>
    <ol
      class="mt-2 list-decimal space-y-1 pl-5 text-sm leading-6 text-base-content/80"
    >
      <li>Open browser menu.</li>
      <li>Tap Install app or Add to Home screen.</li>
      <li>Tap Install or Add to finish.</li>
    </ol>
  </div>
</section>
