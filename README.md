# Color Harmony Picker

A reusable React + TypeScript color harmony control for generating and curating palettes from an active color.

Live demo: https://mr-winch.github.io/hueprint/

It includes a donut-style color wheel with radial lightness, visible harmony geometry, generated swatches, tints/shades/tones, OKLCH palette recipes, custom harmony rules based on angular offsets, palette import/export, and draggable saved palette ordering.

## Features

- React + TypeScript component: `<ColorHarmonyPicker />`
- Donut wheel with hue by angle and lightness by radius
- Harmony rules: monochromatic, analogous, complementary, split complementary, triadic, square, rectangle/tetradic, polygon/equidistant, tint, shade, tone, custom
- Palette recipes generated from direct OKLCH anchor transforms, including Warm Spectrum, Signature Accent, Interface Kit, Pastel Bloom, Night Mode, Trust Signal, and more
- SVG harmony geometry overlay
- Generated swatch band with active marker
- Active color HEX, RGB, CMYK, and HSL info
- Native browser eyedropper support where available
- Saved palette with select, remove, clear, drag reorder, import, and export
- Custom harmony rules store OKLCH transforms from the anchor color, not fixed colors
- Four layout modes for wide surfaces and narrow editor panels

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


