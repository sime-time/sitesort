<script lang="ts">
  import Icon from "@iconify/svelte";
  import addBoxOutlineIcon from "@iconify-icons/material-symbols/add-box-outline";
  import iosShareIcon from "@iconify-icons/material-symbols/ios-share";
</script>

<section class="space-y-3">
  <div class="alert alert-info">
    <span class="text-sm"
      >On iPhone, this is manual. Follow these 3 quick taps.</span
    >
  </div>

  <div class="space-y-2">
    <div class="rounded-box border border-base-300 bg-base-100/70 p-3">
      <div class="flex items-start gap-3">
        <div class="avatar placeholder mt-0.5">
          <div
            class="w-10 rounded-full border border-base-300 bg-base-200 text-base-content"
          >
            <svg
              viewBox="0 0 24 24"
              class="size-5"
              role="img"
              aria-label="Safari menu button"
              fill="currentColor"
            >
              <circle cx="6" cy="12" r="1.8"></circle>
              <circle cx="12" cy="12" r="1.8"></circle>
              <circle cx="18" cy="12" r="1.8"></circle>
            </svg>
          </div>
        </div>
        <div class="space-y-1">
          <p class="font-semibold text-base-content">1. Open Safari menu</p>
          <p class="text-sm leading-6 text-base-content/80">
            Tap the 3-dot button in the bottom-right corner.
          </p>
        </div>
      </div>
    </div>

    <div class="rounded-box border border-base-300 bg-base-100/70 p-3">
      <div class="flex items-start gap-3">
        <div class="avatar placeholder mt-0.5">
          <div
            class="w-10 rounded-full border border-base-300 bg-base-200 text-base-content"
          >
            <Icon icon={iosShareIcon} class="size-5" />
          </div>
        </div>
        <div class="space-y-1">
          <p class="font-semibold text-base-content">2. Tap Share</p>
          <p class="text-sm leading-6 text-base-content/80">
            In that menu, tap the Share button.
          </p>
        </div>
      </div>
    </div>

    <div class="rounded-box border border-base-300 bg-base-100/70 p-3">
      <div class="flex items-start gap-3">
        <div class="avatar placeholder mt-0.5">
          <div
            class="w-10 rounded-full border border-base-300 bg-base-200 text-base-content"
          >
            <Icon icon={addBoxOutlineIcon} class="size-5" />
          </div>
        </div>
        <div class="space-y-1">
          <p class="font-semibold text-base-content">3. Add to Home Screen</p>
          <p class="text-sm leading-6 text-base-content/80">
            Scroll down and tap Add to Home Screen, then tap Add.
          </p>
        </div>
      </div>
    </div>
  </div>
</section>
