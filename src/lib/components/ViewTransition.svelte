<script lang="ts">
  import { onNavigate } from "$app/navigation";

  onNavigate((navigation) => {
    if (!document.startViewTransition) return;

    // Default slide direction
    let direction: "forward" | "back" = "forward";

    // Popstate gives signed delta (back is negative, forward is positive)
    if (navigation.type === "popstate") {
      direction = navigation.delta < 0 ? "back" : "forward";
    }

    document.documentElement.dataset.navDirection = direction;

    return new Promise((resolve) => {
      document.startViewTransition(async () => {
        resolve();
        await navigation.complete;
      });
    });
  });
</script>

<style>
  @media (prefers-reduced-motion: no-preference) {
    :global(::view-transition-old(root)),
    :global(::view-transition-new(root)) {
      animation-duration: 300ms;
      animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
      will-change: transform;
    }
    /* forward: new page comes from right */
    :global(html[data-nav-direction="forward"]::view-transition-old(root)) {
      animation-name: slide-out-left;
    }
    :global(html[data-nav-direction="forward"]::view-transition-new(root)) {
      animation-name: slide-in-right;
    }
    /* back: new page comes from left */
    :global(html[data-nav-direction="back"]::view-transition-old(root)) {
      animation-name: slide-out-right;
    }
    :global(html[data-nav-direction="back"]::view-transition-new(root)) {
      animation-name: slide-in-left;
    }
  }

  @keyframes slide-in-right {
    from {
      transform: translateX(18%);
    }
    to {
      transform: translateX(0%);
    }
  }

  @keyframes slide-out-left {
    from {
      transform: translateX(0%);
    }
    to {
      transform: translateX(-18%);
    }
  }

  @keyframes slide-in-left {
    from {
      transform: translateX(-18%);
    }
    to {
      transform: translateX(0%);
    }
  }

  @keyframes slide-out-right {
    from {
      transform: translateX(0%);
    }
    to {
      transform: translateX(18%);
    }
  }
</style>
