<script lang="ts">
  import type {
    BetterAuthSession,
    BetterAuthUser,
  } from "@neondatabase/neon-js/auth/types";
  import { toast } from "svelte-sonner";
  import Button from "$lib/components/ui/button/button.svelte";
  import Input from "$lib/components/ui/input/input.svelte";
  import { authClient } from "$lib/sql/client/auth";

  let session = $state<BetterAuthSession | null>(null);
  let user = $state<BetterAuthUser | null>(null);
  let name = $state("");
  let email = $state("");
  let password = $state("");
  let isSignUp = $state(true);
  let loading = $state(true);

  $effect(() => {
    authClient.getSession().then((result) => {
      if (result.data?.session && result.data?.user) {
        session = result.data.session;
        user = result.data.user;
      }
      loading = false;
    });
  });

  async function handleGoogleSignIn() {
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: window.location.origin,
      });
    } catch (error) {
      toast.error("Error signing in with Google");
      console.error("Google sign-in error:", error);
    }
  }

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    const result = isSignUp
      ? await authClient.signUp.email({ name, email, password })
      : await authClient.signIn.email({ email, password });

    if (result.error) {
      alert(result.error.message);
      return;
    }

    const sessionResult = await authClient.getSession();
    if (sessionResult.data?.session && sessionResult.data?.user) {
      session = sessionResult.data.session;
      user = sessionResult.data.user;
    }
  }

  async function handleSignOut() {
    await authClient.signOut();
    session = null;
    user = null;
  }
</script>

{#if loading}
  <div>Loading...</div>
{:else if session && user}
  <div>
    <h1>Logged in as {user.email}</h1>
    <Button onclick={handleSignOut}>Sign Out</Button>
  </div>
{:else}
  <form onsubmit={handleSubmit}>
    <h1 class="text-2xl font-bold text-center">
      {isSignUp ? "Sign Up" : "Sign In"}
    </h1>
    <Input type="text" placeholder="Name" bind:value={name} />
    <Input type="email" placeholder="Email" bind:value={email} />
    <Input type="password" placeholder="Password" bind:value={password} />
    <Button type="submit">{isSignUp ? "Sign Up" : "Sign Out"}</Button>
    {#if isSignUp}
      <p>
        Already have an account?{' '}
        <button
          type="button"
          class="underline"
          onclick={(e) => {
            e.preventDefault();
            isSignUp = false;
          }}
        >
          Sign in
        </button>
      </p>
    {:else}
      <p>
        Don't have an account?{' '}
        <button
          type="button"
          class="underline"
          onclick={(e) => {
            e.preventDefault();
            isSignUp = true;
          }}
        >
          Sign up
        </button>
      </p>
    {/if}
  </form>
{/if}
