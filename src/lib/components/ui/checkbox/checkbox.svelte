<script lang="ts" module>
  import { tv, type VariantProps } from "tailwind-variants";

  export const checkboxVariants = tv({
    base: "border-input dark:bg-input/30 data-checked:bg-primary data-checked:text-primary-foreground dark:data-checked:bg-primary data-checked:border-primary aria-invalid:aria-checked:border-primary aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 flex items-center justify-center rounded-lg border-2 transition-colors group-has-disabled/field:opacity-50 focus-visible:ring-3 aria-invalid:ring-3 peer relative shrink-0 outline-none after:absolute after:-inset-x-3 after:-inset-y-2 disabled:cursor-not-allowed disabled:opacity-50",
    variants: {
      size: {
        default: "size-4",
        xl: "size-9",
      },
    },
    defaultVariants: {
      size: "default",
    },
  });

  export const checkboxIndicatorVariants = tv({
    base: "grid place-content-center text-current transition-none",
    variants: {
      size: {
        default: "[&>svg]:size-3.5",
        xl: "[&>svg]:size-5",
      },
    },
    defaultVariants: {
      size: "default",
    },
  });

  export type CheckboxSize = VariantProps<typeof checkboxVariants>["size"];
</script>

<script lang="ts">
  import CheckIcon from "@lucide/svelte/icons/check";
  import MinusIcon from "@lucide/svelte/icons/minus";
  import { Checkbox as CheckboxPrimitive } from "bits-ui";
  import { cn, type WithoutChildrenOrChild } from "$lib/utils/shadcn.js";

  let {
    ref = $bindable(null),
    checked = $bindable(false),
    indeterminate = $bindable(false),
    size = "default",
    class: className,
    ...restProps
  }: WithoutChildrenOrChild<CheckboxPrimitive.RootProps> & {
    size?: CheckboxSize;
  } = $props();
</script>

<CheckboxPrimitive.Root
  bind:ref
  data-slot="checkbox"
  class={cn(checkboxVariants({ size }), className)}
  bind:checked
  bind:indeterminate
  {...restProps}
>
  {#snippet children({ checked, indeterminate })}
    <div
      data-slot="checkbox-indicator"
      class={checkboxIndicatorVariants({ size })}
    >
      {#if checked}
        <CheckIcon />
      {:else if indeterminate}
        <MinusIcon />
      {/if}
    </div>
  {/snippet}
</CheckboxPrimitive.Root>
