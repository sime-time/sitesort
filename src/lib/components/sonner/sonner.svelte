<script lang="ts">
  import Icon from "@iconify/svelte";
  import checkCircleIconData from "@iconify-icons/material-symbols/check-circle";
  import errorIconData from "@iconify-icons/material-symbols/error";
  import infoIconData from "@iconify-icons/material-symbols/info";
  import warningIconData from "@iconify-icons/material-symbols/warning";
  import {
    Toaster as Sonner,
    type ToasterProps as SonnerProps,
  } from "svelte-sonner";

  let { ...restProps }: SonnerProps = $props();
</script>

<Sonner
  position="top-center"
  theme="light"
  toastOptions={{
    class: "rounded-sm border border-base-300 bg-base-100 text-base-content shadow-none",
    descriptionClass: "text-base-content/70",
    classes: {
      toast: "alert min-h-14",
      title: "font-heading uppercase tracking-wide text-sm",
      description: "font-sans text-sm",
      icon: "text-base-content",
      success: "alert-success text-success border-success/30",
      error: "alert-error text-error-content border-error/30",
      warning: "alert-warning text-warning-content border-warning/30",
      info: "alert-info text-info-content border-info/30",
      loading: "bg-base-200 text-base-content border-base-300"
    }
  }}
  {...restProps}
>
  {#snippet loadingIcon()}
    <span class="loading loading-spinner loading-sm"></span>
  {/snippet}
  {#snippet successIcon()}
    <Icon icon={checkCircleIconData} class="size-4 text-success" />
  {/snippet}
  {#snippet errorIcon()}
    <Icon icon={errorIconData} class="size-4 text-error" />
  {/snippet}
  {#snippet infoIcon()}
    <Icon icon={infoIconData} class="size-4 text-info" />
  {/snippet}
  {#snippet warningIcon()}
    <Icon icon={warningIconData} class="size-4 text-warning" />
  {/snippet}
</Sonner>
