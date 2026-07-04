# Integration Guide

## Recommended Integration

1. Copy `src/color-harmony-picker` into your app, preferably under your existing component library.
2. Import `ColorHarmonyPicker` from the copied folder's `index.ts`.
3. Keep the component controlled through the `value` and `onChange` props.
4. Use `onGeneratedColorsChange` if the host editor needs live generated colors.
5. Use `onAddToPalette` if the host editor owns its own palette state.
6. Set `theme="dark"` when embedding in dark editor surfaces, otherwise omit it for light mode.
7. Keep `showGeometryOverlay` enabled unless the host UI needs a simplified picker.

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
    />
  );
}
```

## Custom Harmony Rule

The custom rule is geometric. It stores hue offsets from the active anchor hue. If a custom harmony was built from a blue palette and the active color changes to red, the same angular relationships are preserved around red.

The built-in `Use palette` action derives a custom rule from the saved palette order. Reordering the saved palette changes the custom polygon geometry.

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