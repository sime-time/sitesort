<script lang="ts">
  import Icon from "@iconify/svelte";
  import type {
    BetterAuthSession,
    BetterAuthUser,
  } from "@neondatabase/neon-js/auth/types";
  import { toast } from "svelte-sonner";
  import Button from "$lib/components/ui/button/button.svelte";
  import Spinner from "$lib/components/ui/spinner/spinner.svelte";
  import { authClient } from "$lib/sql/client/auth";

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
    <Spinner />
    <span>Loading...</span>
  {:else if session && user}
    <div>
      <h1
        class="text-2xl font-bold text-center mb-4 font-heading flex flex-col"
      >
        <span>Logged in as</span>
        <span class="text-primary">{user.email}</span>
      </h1>
      <div class="flex justify-between">
        <Button type="button" href="/" size="lg" variant="secondary"
          >Go to App</Button
        >
        <Button
          type="button"
          variant="destructiveSoft"
          size="lg"
          onclick={handleSignOut}
        >
          Sign Out
        </Button>
      </div>
    </div>
  {:else}
    <form onsubmit={handleGoogleSignIn}>
      <h1 class="text-2xl font-bold text-center mb-4 font-heading">
        Welcome to SiteSort
      </h1>
      <Button
        type="submit"
        variant="secondary"
        class="font-sans tracking-normal normal-case"
        size="xl"
      >
        <Icon icon="ri:google-fill" />
        Continue with Google
      </Button>
    </form>
  {/if}
</div>
