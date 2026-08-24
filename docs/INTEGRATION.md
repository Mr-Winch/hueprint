# Integration Guide

## Recommended Integration

1. Copy `src/color-harmony-picker` into your app, preferably under your existing component library.
2. Import `ColorHarmonyPicker` from the copied folder's `index.ts`.
3. Keep the component controlled through the `value` and `onChange` props.
4. Use `onGeneratedColorsChange` if the host editor needs live generated colors.
5. Use `savedPalette` with `onSavedPaletteChange` when the host editor should own Saved Swatches.
6. Use `savedPalettes` with `onSavedPalettesChange` when the host should own the reusable named-palette library.
7. Use `onAddToPalette` if the host editor also needs add-event hooks for analytics, toasts, or external palette stores.
8. Set `theme="light"` or `theme="dark"` to match the host application.
9. Choose the layout for the available panel width: `horizontal`, `vertical`, `verticalCompact`, or `horizontalCompact`.
10. Keep `showGeometryOverlay` enabled unless the host UI needs a simplified picker.
11. Pass `onApplyPalette` only when the host has a meaningful generic Apply action.

## Example

```tsx
"use client";

import { useState } from "react";
import { ColorHarmonyPicker, GeneratedColor, SavedPaletteCollection } from "@/components/color-harmony-picker";

export function EditorColorPanel() {
  const [activeColor, setActiveColor] = useState("#2F80ED");
  const [generated, setGenerated] = useState<GeneratedColor[]>([]);
  const [savedPalette, setSavedPalette] = useState<GeneratedColor[]>([]);
  const [savedPalettes, setSavedPalettes] = useState<SavedPaletteCollection[]>([]);

  return (
    <ColorHarmonyPicker
      value={activeColor}
      onChange={setActiveColor}
      onGeneratedColorsChange={setGenerated}
      savedPalette={savedPalette}
      onSavedPaletteChange={setSavedPalette}
      savedPalettes={savedPalettes}
      onSavedPalettesChange={setSavedPalettes}
      initialRule="analogous"
      initialSwatchCount={5}
      layout="vertical"
    />
  );
}
```

## Palette Persistence

HuePrint separates transient Saved Swatches from reusable named Saved Palettes. Pass `initialSavedPalette` to seed Saved Swatches once, or pass `savedPalette` and `onSavedPaletteChange` to control them. Use `initialSavedPalettes`, or the controlled `savedPalettes` and `onSavedPalettesChange` pair, for the named library. Either collection can be persisted in localStorage, IndexedDB, a project file, or a backend API.

`onSavedPaletteChange` is fired when the user adds the active color, adds all generated colors, removes a swatch, clears the palette, imports a palette file, or reorders saved swatches by drag and drop.

## Layouts

`horizontal` is the default wide layout. Use `vertical` for 300-450px editor panels, `verticalCompact` for a tighter tool panel, and `horizontalCompact` for a compact side-by-side presentation. Current Palette spans the component width in every layout; its detailed metadata table is intentionally omitted in both compact layouts.

## Palette Recipes

Palette recipes are anchor-relative OKLCH transform sets. Each recipe swatch is generated from the active color with `L = anchor.L + dL`, `C = anchor.C * multiplier`, and `H = anchor.H + dH`, then fitted into sRGB by reducing chroma before changing perceived lightness. This keeps recipes portable across anchors instead of baking fixed colors into the component.

Choosing a recipe updates the swatch count to that recipe's native transform count. The swatch slider can still be used for exploratory variants.

### Adding or removing palette recipes

Palette recipes are intentionally source-copy friendly. To add one, add an ID to `PaletteRecipe` in `src/color-harmony-picker/colorHarmony.types.ts`, add its display label to `paletteRecipeLabels`, add the ID to `paletteRecipeOrder`, and add its OKLCH transforms to `recipeDefinitions` in `src/color-harmony-picker/colorHarmony.recipes.ts`.

To remove one, delete the same ID from those places. Run `npm run sync:data` after changing the canonical Inkscape recipe metadata; the visual React chooser is generated from that source.

## Custom Harmony Rule

The custom rule is geometric and anchor-relative. It stores OKLCH transforms from the active anchor (`dL`, chroma multiplier, and `dH`) instead of fixed colors. If a custom harmony was built from a blue palette and the active color changes to red, the same angular, lightness, and chroma relationships are preserved around red.

The built-in `Use palette` action derives a custom rule from every saved palette color in order. Reordering the saved palette changes the custom polygon geometry and preserves each color as a relative transform.

## Import / Export Formats

HuePrint imports both GIMP Palette (`.gpl`) and JSON. GPL detection uses the `GIMP Palette` header rather than trusting only the filename. Rows are validated, duplicate colors are removed without changing order, and swatch labels are retained.

GPL is the production interchange format for Inkscape:

```text
GIMP Palette
Name: Brand System
Columns: 8
#
 47 128 237    Royal Blue
255 128   0    Signal Orange
```

HuePrint JSON retains component-specific metadata:

```json
{
  "version": 2,
  "source": "hueprint-react",
  "name": "Brand System",
  "exportedAt": "2026-07-03T00:00:00.000Z",
  "colors": [
    { "hex": "#2F80ED", "role": "anchor", "sourceRule": "analogous" }
  ]
}
```

The importer also accepts the older object shape and a plain array of hex strings. Host applications can call the exported `parsePaletteText`, `paletteToGpl`, and `paletteToJson` utilities without rendering the component.

## Color Names

The complete NTC list is bundled for offline matching. Community names are optional because Colornames.org does not expose browser CORS headers. Supply a same-origin resolver when the host has a server endpoint:

```tsx
<ColorHarmonyPicker
  value={activeColor}
  resolveCommunityColorName={async (hex) => {
    const response = await fetch(`/api/color-name?hex=${encodeURIComponent(hex)}`);
    if (!response.ok) throw new Error("Color naming unavailable");
    const payload = await response.json();
    return typeof payload.name === "string" ? payload.name : null;
  }}
/>
```

Returning `null` marks the color as unnamed and exposes its exact Colornames.org proposal link. Rejections show `No connection`; successful results are cached in the browser.

## Notes For Host Apps

- The component is client-side because it uses DOM APIs, canvas, clipboard, drag/drop, file import/export, and the optional EyeDropper API.
- In Next.js App Router, render it from a file marked with `"use client"`.
- The component has no runtime dependency beyond React.
