<script lang="ts">
  import Icon from "@iconify/svelte";
  import type {
    BetterAuthSession,
    BetterAuthUser,
  } from "@neondatabase/neon-js/auth/types";
  import { toast } from "svelte-sonner";
  import { goto } from "$app/navigation";
  import { authClient } from "$lib/client/auth";

  let session = $state<BetterAuthSession | null>(null);
  let user = $state<BetterAuthUser | null>(null);
  let loading = $state(true);

  $effect(() => {
    authClient.getSession().then(({ data }) => {
      console.log(data);
      if (data?.session) {
        user = data.user;
        session = data.session;
      }
      loading = false;
    });
  });

  async function handleGoogleSignIn(e: SubmitEvent) {
    e.preventDefault();
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/auth",
      });
    } catch (error) {
      toast.error("Error signing in with Google");
      console.error("Google sign-in error:", error);
    }
  }

  async function handleSignOut() {
    await authClient.signOut();
    session = null;
    user = null;
  }
</script>

<div class="w-full h-100 flex items-center justify-center gap-1">
  {#if loading}
    <span class="loading loading-spinner loading-sm"></span>
    <span class="ml-2">Loading...</span>
  {:else if session && user}
    <div>
      <h1
        class="text-2xl font-bold text-center mb-4 font-heading flex flex-col"
      >
        <span>Logged in as</span>
        <span class="text-primary">{user.email}</span>
      </h1>
      <div class="flex justify-between">
        <button
          type="button"
          onclick={() => goto("/")}
          class="btn btn-lg btn-secondary font-heading font-medium uppercase tracking-wider"
        >
          Go to App
        </button>

        <button
          type="button"
          onclick={handleSignOut}
          class="btn btn-lg btn-error btn-soft font-heading font-medium uppercase tracking-wider"
        >
          Sign Out
        </button>
      </div>
    </div>
  {:else}
    <form onsubmit={handleGoogleSignIn}>
      <h1 class="text-2xl font-bold text-center mb-4 font-heading">
        Welcome to SiteSort
      </h1>
      <button
        type="submit"
        class="btn btn-lg btn-secondary font-sans font-medium normal-case tracking-normal"
      >
        <Icon icon="ri:google-fill" />
        Continue with Google
      </button>
    </form>
  {/if}
</div>
