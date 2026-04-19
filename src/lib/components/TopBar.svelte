<script lang="ts">
  import Icon from "@iconify/svelte";
  import arrowLeftAltIcon from "@iconify-icons/material-symbols/arrow-left-alt";
  import logoutSharpIcon from "@iconify-icons/material-symbols/logout-sharp";
  import settingsIcon from "@iconify-icons/material-symbols/settings";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { getUserJob } from "$lib/client/crud/read-job";

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
    if (history.length > 1) history.back();
    else goto("/");
  }

  function signOut() {
    goto("/auth");
  }

  function editJob() {
    goto(`/job/edit/${jobId}`);
  }
</script>

<header class="p-6 h-18 border-b border-b-accent">
  {#if isJobDetail}
    <div class="flex items-center justify-between text-2xl">
      <button type="button" class="flex items-center gap-3" onclick={goBack}>
        <Icon icon={arrowLeftAltIcon} class="text-muted-foreground" />
        <h1 class="text-lg font-medium">{title}</h1>
      </button>

      <button
        type="button"
        class="btn btn-sm btn-circle btn-ghost"
        onclick={editJob}
      >
        <Icon icon={settingsIcon} class="size-6" />
      </button>
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
        <Icon icon={logoutSharpIcon} class="size-4" />
        Sign Out
      </button>
    </div>
  {/if}
</header>

<style>
  header {
    view-transition-name: top-bar;
  }
</style>
