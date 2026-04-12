# Design System Specification: The Industrial Authority
 
## 1. Overview & Creative North Star
**Creative North Star: "The Digital Tool-Belt"**
 
This design system rejects the "app-as-entertainment" philosophy. It is a high-performance utility designed for high-glare construction sites and low-light electrical rooms. We move beyond standard mobile UI by adopting **Industrial Functionalism**—a style where every pixel must justify its existence. 
 
To break the "template" look, we utilize **Intentional Asymmetry** and **Tonal Depth**. Instead of centering everything, we use strong left-aligned anchors to mimic the look of technical schematics. We replace decorative fluff with high-contrast information density, ensuring that the interface feels as rugged and reliable as a piece of DeWalt or Fluke equipment.
 
---
 
## 2. Colors: The Utility Palette
Our palette is rooted in construction-site neutrals with a high-visibility "Safety Primary" for critical actions.
 
### The "No-Line" Rule
Traditional 1px borders are prohibited for sectioning. They create visual noise. Instead, define boundaries through **Background Color Shifts**. 
*   **Example:** A `surface-container-low` (#e6f6ff) task card should sit on a `surface` (#f3faff) background. The subtle shift in hex value provides a cleaner, more premium separation than a black line.
 
### Surface Hierarchy & Nesting
Treat the UI as a physical stack of materials.
- **Base Layer:** `surface` (#f3faff)
- **Secondary Work Area:** `surface-container-low` (#e6f6ff)
- **Active Focused Elements:** `surface-container-highest` (#cfe6f2)
 
### The "Glass & Gradient" Rule
To avoid a "flat" or "cheap" feel, use a subtle **Vertical Gradient** on primary actions:
- **Primary CTA:** Transition from `primary` (#9a4600) at the top to `primary_container` (#f47a1f) at the bottom. This mimics the light-catch on a physical button.
- **Glassmorphism:** For floating "Quick Action" buttons or overlays, use `surface_container_lowest` (#ffffff) at 85% opacity with a `20px` backdrop-blur. This ensures the tool feels integrated into the environment.
 
---
 
## 3. Typography: Authoritative Clarity
We utilize a dual-font system to balance technical precision with legibility.
 
*   **Display & Headlines (Space Grotesk):** A high-character, tabular-style sans-serif. Used for "Display-LG" through "Headline-SM". It feels engineered and intentional. Bold weights are the default for site headers to ensure readability under sunlight.
*   **Body & Labels (Work Sans):** A highly legible, workhorse typeface. Used for "Title-LG" down to "Label-SM". 
*   **Brand Identity through Type:** The massive scale jump between `display-lg` (3.5rem) and `body-md` (0.875rem) creates an editorial, "Blueprints" aesthetic that signals professional authority.
 
---
 
## 4. Elevation & Depth: Tonal Layering
We do not use drop shadows to indicate "elevation." We use **Luminance**.
 
*   **The Layering Principle:** Depth is achieved by "stacking." A `surface-container-lowest` card (#ffffff) placed on a `surface-dim` (#c7dde9) background provides a natural, high-contrast lift without the muddiness of a shadow.
*   **Ambient Shadows:** If a floating state (like a Modal) is required, use an extra-diffused shadow: `offset: 0, 12; blur: 40; color: rgba(7, 30, 39, 0.08)`. This uses the `on_surface` color for the shadow tint, creating a natural atmospheric effect.
*   **The "Ghost Border" Fallback:** If a container requires a stroke for accessibility, use `outline_variant` (#dec1b1) at **15% opacity**. High-contrast solid borders are strictly forbidden as they clutter the "tool-like" interface.
 
---
 
## 5. Components: Ruggedized Primitives
 
### Glove-Friendly Buttons
*   **Primary:** Full-width, `spacing-5` (1.7rem) vertical padding. Uses the `primary` to `primary_container` gradient. 
*   **Tertiary:** No background. Use `title-md` weight in `primary` (#9a4600) with an icon.
*   **Sizing:** All tap targets must be a minimum of `12` (4rem) in height to accommodate work gloves.
 
### Industrial Cards & Lists
*   **No Dividers:** Forbid the use of `px` lines. Use `spacing-3` (1rem) of white space or a shift to `surface-container-high` (#d5ecf8) to separate list items.
*   **Data Density:** Use `label-md` for metadata (e.g., "PO #8829") in `on_surface_variant` (#574237) to keep the primary `title-md` clear.
 
### The "Status Block" (Custom Component)
Instead of small icons, use large, color-flooded blocks at the top of cards.
*   **Alert State:** `error_container` (#ffdad6) background with `on_error_container` text.
*   **Neutral State:** `secondary_container` (#d7e4ec).
 
### Input Fields
*   **Style:** Filled, not outlined. Use `surface-container-highest` (#cfe6f2) as the field background.
*   **Active State:** A `2px` bottom-bar in `primary` (#9a4600). No full-box outlines.
 
---
 
## 6. Do's and Don'ts
 
### Do
*   **DO** use `display-md` for critical numbers (e.g., Voltage, Square Footage). Numbers are the most important data point on a job site.
*   **DO** use `roundedness-sm` (0.125rem) for a sharp, machined look on buttons. Avoid high-radius "pill" shapes which feel too "consumer/social."
*   **DO** maximize contrast. Ensure all text on `surface` containers meets a minimum 7:1 contrast ratio.
 
### Don't
*   **DON'T** use icons without labels. In a high-stress environment, "Hamburger" menus and "Pencil" icons can be ambiguous. Always pair with `label-md`.
*   **DON'T** use transitions longer than 150ms. The UI should feel "snappy" and mechanical, not "fluid" and "dreamy."
*   **DON'T** use 1px dividers. If you feel the need for a line, use a `spacing-px` gap to let the background color show through instead.
