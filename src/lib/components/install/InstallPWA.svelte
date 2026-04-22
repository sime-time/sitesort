<script lang="ts">
  import { onMount } from "svelte";
  import InstallAndroid from "$lib/components/install/InstallAndroid.svelte";
  import InstalliOS from "$lib/components/install/InstalliOS.svelte";

  type Platform = "ios" | "android" | "mobile" | "desktop";

  type DeferredInstallPrompt = Event & {
    prompt: () => Promise<{ outcome: "accepted" | "dismissed" }>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
  };

  const DISMISS_KEY = "sitesort.pwa.install.dismissedAt";
  const NEVER_SHOW_KEY = "sitesort.pwa.install.neverShow";
  const REMIND_AFTER_MS = 3 * 24 * 60 * 60 * 1000;

  let platform = $state<Platform>("desktop");
  let isInstalled = $state(false);
  let showModal = $state(true);
  let canOneTapInstall = $state(false);
  let disabled = $state(true);

  let deferredPrompt = $state<DeferredInstallPrompt | null>(null);

  const isMobile = $derived(platform !== "desktop");
  const isIos = $derived(platform === "ios");
  const isAndroid = $derived(platform === "android");

  function detectPlatform(): Platform {
    const ua = navigator.userAgent.toLowerCase();
    const touchMac =
      ua.includes("macintosh") && (navigator.maxTouchPoints ?? 0) > 1;
    const ios = /iphone|ipad|ipod/.test(ua) || touchMac;
    if (ios) return "ios";
    if (/android/.test(ua)) return "android";
    if (/mobile|mobi/.test(ua)) return "mobile";
    return "desktop";
  }

  function detectInstalled(): boolean {
    const iosStandalone = Boolean(
      (navigator as Navigator & { standalone?: boolean }).standalone,
    );

    const mediaStandalone = window.matchMedia(
      "(display-mode: standalone)",
    ).matches;

    return iosStandalone || mediaStandalone;
  }

  function shouldSuppressModal(): boolean {
    const neverShow = localStorage.getItem(NEVER_SHOW_KEY) === "1";
    if (neverShow) return true;

    const lastDismissedAt = Number(localStorage.getItem(DISMISS_KEY) ?? "0");
    if (!Number.isFinite(lastDismissedAt) || lastDismissedAt <= 0) return false;

    return Date.now() - lastDismissedAt < REMIND_AFTER_MS;
  }

  function openModal() {
    showModal = true;
  }

  function closeModal() {
    showModal = false;
  }

  function remindLater() {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    closeModal();
  }

  function neverShowAgain() {
    localStorage.setItem(NEVER_SHOW_KEY, "1");
    closeModal();
  }

  async function triggerInstall() {
    if (!deferredPrompt) return;

    const prompt = deferredPrompt;
    deferredPrompt = null;
    canOneTapInstall = false;

    try {
      await prompt.prompt();
      const result = await prompt.userChoice;
      if (result.outcome === "accepted") {
        closeModal();
      } else {
        remindLater();
      }
    } catch {
      remindLater();
    }
  }

  onMount(() => {
    isInstalled = detectInstalled();
    if (isInstalled) {
      disabled = true;
      showModal = false;
      return;
    }
    disabled = false;
    platform = detectPlatform();

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      deferredPrompt = event as DeferredInstallPrompt;
      canOneTapInstall = true;
    };

    const onInstalled = () => {
      isInstalled = true;
      closeModal();
      localStorage.setItem(NEVER_SHOW_KEY, "1");
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);

    if (isMobile && !isInstalled && !shouldSuppressModal()) {
      setTimeout(openModal, 500);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  });
</script>

{#if !disabled && showModal}
  <div class="modal modal-open modal-middle">
    <div class="modal-box max-w-md border border-base-300">
      <div class="space-y-2">
        <h2
          class="font-heading font-semibold text-2xl uppercase tracking-wider text-base-content"
        >
          Install SiteSort
        </h2>
        <p class="text-base text-base-content/80">
          Add SiteSort to your home screen so it opens like a normal app.
        </p>
      </div>

      <div class="mt-4 rounded-box border border-base-300 bg-base-200/40 p-3">
        {#if isIos}
          <InstalliOS />
        {:else if isAndroid}
          <InstallAndroid {canOneTapInstall} onInstall={triggerInstall} />
        {:else}
          <p class="text-sm leading-6 text-base-content/80">
            Mobile phone platform not detected
          </p>
        {/if}
      </div>

      <div class="mt-5 flex items-center justify-end gap-2">
        <button
          type="button"
          class="btn btn-error btn-ghost"
          onclick={neverShowAgain}
        >
          Don't remind me
        </button>
        <button
          type="button"
          class="btn btn-error btn-soft"
          onclick={remindLater}
        >
          Not now
        </button>
      </div>
    </div>

    <button
      type="button"
      class="modal-backdrop"
      aria-label="Close install modal"
      onclick={remindLater}
    ></button>
  </div>
{/if}
