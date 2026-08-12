# Color Harmony Picker

A reusable React + TypeScript studio for creating, discovering, and managing palettes from an active color.

Live demo: https://mr-winch.github.io/hueprint/

It includes a donut-style color wheel with radial lightness, visible harmony geometry, generated swatches, tints/shades/tones, OKLCH palette recipes, custom harmony rules based on angular offsets, palette import/export, and draggable saved palette ordering.

## Features

- React + TypeScript component: `<ColorHarmonyPicker />`
- Donut wheel with hue by angle and lightness by radius
- Harmony rules: monochromatic, analogous, complementary, split complementary, triadic, square, rectangle/tetradic, polygon/equidistant, tint, shade, tone, custom
- 70 curated palette recipes generated from direct and adaptive OKLCH transforms, including background-and-pop, daring chromatic, semantic, tonal, interface, and harmony-driven collections
- SVG harmony geometry overlay
- Generated swatch band with active marker
- Active color HEX, RGB, CMYK, and HSL info
- Dual-source swatch naming in the Inkscape edition: offline NTC names plus cached background lookups from Colornames.org
- Native browser eyedropper support where available
- Palette-management workflow with Current Palette, Saved Swatches, reusable Saved Palettes, and GPL delivery to Inkscape
- Custom harmony rules store OKLCH transforms from the anchor color, not fixed colors
- Four layout modes for wide surfaces and narrow editor panels

## Palette creation and management

HuePrint treats palette work as a continuous process rather than a one-time generation step. Explore harmonies and curated recipes in Current Palette, collect useful colors in Saved Swatches, refine their order and membership, preserve complete systems as reusable Saved Palettes, and export GPL files for Inkscape. This supports discovery, comparison, organization, reuse, and production delivery in the same tool.

## Install By Source Copy

Copy this folder into your React or Next.js project:

```text
src/color-harmony-picker
```

Then import it:

```tsx
"use client";

import { useState } from "react";
import { ColorHarmonyPicker } from "./color-harmony-picker";

export function PaletteTool() {
  const [color, setColor] = useState("#2F80ED");

  return (
    <ColorHarmonyPicker
      value={color}
      onChange={setColor}
      initialRule="analogous"
      initialSwatchCount={5}
    />
  );
}
```

The component uses CSS Modules. If your project does not already support `*.module.css`, add support before importing the component.

## Props

```ts
export interface ColorHarmonyPickerProps {
  value: string;
  onChange?: (color: string) => void;
  onGeneratedColorsChange?: (colors: GeneratedColor[]) => void;
  onAddToPalette?: (color: GeneratedColor) => void;
  savedPalette?: SavedPaletteInput[];
  initialSavedPalette?: SavedPaletteInput[];
  onSavedPaletteChange?: (colors: GeneratedColor[]) => void;
  initialRule?: HarmonyRule;
  initialSwatchCount?: number;
  minSwatches?: number;
  maxSwatches?: number;
  showGeometryOverlay?: boolean;
  theme?: "light" | "dark";
  layout?: "horizontal" | "vertical" | "verticalCompact" | "horizontalCompact";
  className?: string;
}
```

## Styling

The component supports `theme="light"` and `theme="dark"`. It is intentionally self-contained and uses `ColorHarmonyPicker.module.css`. You can theme it by overriding or editing CSS variables such as `--wheel-size`, `--wheel-thickness`, `--marker-size`, `--overlay-opacity`, `--overlay-stroke-width`, `--swatch-band-height`, `--surface`, `--border`, `--text`, `--muted`, `--accent`, `--control-bg`, and `--strong`.

Use `layout="horizontal"` for the standard wide layout, `layout="vertical"` for narrow panels with wheel metadata beside the donut, `layout="verticalCompact"` for tighter narrow panels with the same side metadata, and `layout="horizontalCompact"` for a compact side-by-side layout that wraps cleanly in tighter containers.

## Palette Persistence

Use `initialSavedPalette={['#2F80ED', '#40E1F1']}` to seed Hueprint's internal saved palette. Use `savedPalette` with `onSavedPaletteChange` when the host app should own persistence in localStorage, a backend, or an editor store. `savedPalette` accepts hex strings or full `GeneratedColor` objects.

```tsx
const [savedPalette, setSavedPalette] = useState<GeneratedColor[]>([]);

<ColorHarmonyPicker
  value={color}
  onChange={setColor}
  savedPalette={savedPalette}
  onSavedPaletteChange={setSavedPalette}
/>
```

## Browser Notes

The eyedropper button uses the Chromium `EyeDropper` API when available. Unsupported browsers will show the button disabled.

## Development

```bash
npm install
npm run typecheck
npm test
npm run build:demo
```

## License

MIT


