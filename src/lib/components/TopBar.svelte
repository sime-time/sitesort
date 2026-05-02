<script lang="ts">
  import Icon from "@iconify/svelte";
  import arrowLeftAltIcon from "@iconify-icons/material-symbols/arrow-left-alt";
  import exitToAppIcon from "@iconify-icons/material-symbols/exit-to-app";
  import logoutSharpIcon from "@iconify-icons/material-symbols/logout-sharp";
  import refreshIcon from "@iconify-icons/material-symbols/refresh";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { getUserJob } from "$lib/client/crud/read-job";
  import { haptic } from "$lib/utils/haptic";

  let jobTitle = $state<string>("");

  const pathname = $derived(page.url.pathname);
  const jobId = $derived(page.params.id);
  const isJobDetail = $derived(pathname.startsWith("/job/") && !!jobId);

  const title = $derived(isJobDetail ? jobTitle || "Loading..." : "");

  $effect(() => {
    if (!isJobDetail || !jobId) return;

    const userId = page.data?.user_id as string | undefined;

    if (!userId) return;

    void (async () => {
      const job = await getUserJob(userId, jobId);
      jobTitle = job?.name ?? "";
    })();
  });

  function goBack() {
    haptic.confirm();
    if (history.length > 1) history.back();
    else goto("/");
  }

  function signOut() {
    haptic.error();
    goto("/auth");
  }

  function editJob() {
    haptic.confirm();
    goto(`/job/edit/${jobId}`);
  }

  function shareJob() {
    haptic.confirm();
    goto(`/job/overview/${jobId}`);
  }
</script>

<header class="p-6 h-18 border-b border-b-accent">
  {#if isJobDetail}
    <div class="flex items-center justify-between text-2xl">
      <button
        type="button"
        class="flex flex-1 items-center gap-2 min-w-0"
        onclick={goBack}
      >
        <Icon icon={arrowLeftAltIcon} class="text-muted-foreground flex-none" />
        <h1 class="text-lg font-medium truncate">{title}</h1>
      </button>

      <div class="flex items-center justify-between gap-4">
        <button
          type="button"
          class="btn btn-primary btn-outline btn-sm font-heading tracking-wider uppercase"
          onclick={shareJob}
        >
          Share
        </button>

        <button
          type="button"
          class="btn btn-sm btn-info btn-outline font-heading tracking-wider uppercase"
          onclick={editJob}
        >
          Edit job
        </button>
      </div>
    </div>
  {:else}
    <div class="flex justify-between text-primary text-2xl">
      <div class="flex items-center gap-3">
        <Icon icon="fa7-solid:helmet-safety" />
        <h1 class="font-heading font-semibold uppercase tracking-wide text-xl">
          SiteSort
        </h1>
      </div>
      <div class="flex items-center justify-between gap-4">
        <button
          type="button"
          class="btn btn-ghost btn-neutral btn-square btn-sm"
          onclick={() => window.location.reload()}
        >
          <Icon icon={refreshIcon} class="size-6" />
        </button>

        <button
          type="button"
          class="btn btn-ghost btn-error btn-square btn-sm"
          onclick={signOut}
        >
          <Icon icon={exitToAppIcon} class="size-6" />
        </button>
      </div>
    </div>
  {/if}
</header>

<style>
  header {
    view-transition-name: top-bar;
  }
</style>
