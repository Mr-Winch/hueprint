# Integration Guide

## Recommended Integration

1. Copy `src/color-harmony-picker` into your app, preferably under your existing component library.
2. Import `ColorHarmonyPicker` from the copied folder's `index.ts`.
3. Keep the component controlled through the `value` and `onChange` props.
4. Use `onGeneratedColorsChange` if the host editor needs live generated colors.
5. Use `onAddToPalette` if the host editor owns its own palette state.
6. Set `theme="dark"` when embedding in dark editor surfaces, otherwise omit it for light mode.
7. Choose the layout for the available panel width: `horizontal`, `vertical`, `verticalCompact`, or `horizontalCompact`.
8. Keep `showGeometryOverlay` enabled unless the host UI needs a simplified picker.
9. Use CSS variables on the wrapper or edit `ColorHarmonyPicker.module.css` to align spacing, color, wheel size, overlay thickness, swatch height, and dark/light surfaces with the host UI.

## Example

```tsx
"use client";

import { useState } from "react";
import { ColorHarmonyPicker, GeneratedColor } from "@/components/color-harmony-picker";

export function EditorColorPanel() {
  const [activeColor, setActiveColor] = useState("#2F80ED");
  const [generated, setGenerated] = useState<GeneratedColor[]>([]);

  return (
    <ColorHarmonyPicker
      value={activeColor}
      onChange={setActiveColor}
      onGeneratedColorsChange={setGenerated}
      onAddToPalette={(color) => {
        // Forward to the host app palette store here.
        console.log(color.hex);
      }}
      initialRule="analogous"
      initialSwatchCount={5}
      layout="vertical"
    />
  );
}
```

## Layouts

`horizontal` is the default wide layout. Use `vertical` for 300-450px editor panels when the HEX/RGB/CMYK/HSL metadata should sit beside the wheel. Use `verticalCompact` for the same panel range when the control needs to be tighter while keeping that side metadata. Use `horizontalCompact` when a side-by-side presentation is preferred; it wraps the controls under the wheel instead of overflowing when space gets tight.

## Palette Recipes

Palette recipes are anchor-relative OKLCH transform sets. Each recipe swatch is generated from the active color with `L = anchor.L + dL`, `C = anchor.C * multiplier`, and `H = anchor.H + dH`, then fitted into sRGB by reducing chroma before changing perceived lightness. This keeps recipes portable across anchors instead of baking fixed colors into the component.

Choosing a recipe updates the swatch count to that recipe's native transform count. The swatch slider can still be used for exploratory variants.

### Adding or removing palette recipes

Palette recipes are intentionally source-copy friendly. To add one, add an ID to `PaletteRecipe` in `src/color-harmony-picker/colorHarmony.types.ts`, add its display label to `paletteRecipeLabels`, add the ID to `paletteRecipeOrder`, and add its OKLCH transforms to `recipeDefinitions` in `src/color-harmony-picker/colorHarmony.recipes.ts`.

To remove one, delete the same ID from those places. The dropdown, native swatch count, generated colors, and geometry overlay are all driven by those definitions.

## Custom Harmony Rule

The custom rule is geometric and anchor-relative. It stores OKLCH transforms from the active anchor (`dL`, chroma multiplier, and `dH`) instead of fixed colors. If a custom harmony was built from a blue palette and the active color changes to red, the same angular, lightness, and chroma relationships are preserved around red.

The built-in `Use palette` action derives a custom rule from every saved palette color in order. Reordering the saved palette changes the custom polygon geometry and preserves each color as a relative transform.

## Import / Export Format

The exported file is JSON:

```json
{
  "version": 1,
  "source": "color-harmony-picker",
  "exportedAt": "2026-07-03T00:00:00.000Z",
  "colors": [
    { "hex": "#2F80ED", "role": "anchor", "sourceRule": "analogous" }
  ]
}
```

The importer also accepts a plain array of hex strings.

## Notes For Host Apps

- The component is client-side because it uses DOM APIs, canvas, clipboard, drag/drop, file import/export, and the optional EyeDropper API.
- In Next.js App Router, render it from a file marked with `"use client"`.
- The component has no runtime dependency beyond React.
