# Claude Code Implementation Instructions

Use the public Color Harmony Picker as a reusable React component, not as a project-specific FED component.

## Task

Integrate the component from this repository into the image editor UI:

```text
https://github.com/Mr-Winch/hueprint
```

## Steps

1. Pull or download the repository.
2. Copy `src/color-harmony-picker` into the host app's component library, for example:

```text
src/components/color-harmony-picker
```

3. Import it through its public barrel:

```tsx
import { ColorHarmonyPicker } from "@/components/color-harmony-picker";
```

4. Render it as a controlled component:

```tsx
<ColorHarmonyPicker
  value={activeColor}
  onChange={setActiveColor}
  onGeneratedColorsChange={setGeneratedColors}
  onAddToPalette={addColorToPalette}
  initialRule="analogous"
  initialSwatchCount={5}
/>
```

5. Keep the component client-side. In Next.js App Router, the wrapper file must include:

```tsx
"use client";
```

## Integration Contract

- `value` is the active HEX color.
- `onChange` receives the active HEX color after wheel, swatch, input, slider, or eyedropper changes.
- `onGeneratedColorsChange` receives the currently generated harmony/tonal colors.
- `onAddToPalette` fires when the user adds a generated color to the saved palette.
- The saved palette UI is included internally, but the host app may also mirror additions through `onAddToPalette`.
- Custom harmony rules are angular offset rules from the active hue, not fixed color lists.

## Do Not Change Unless Needed

- Do not replace the wheel math with generic N-point spacing for every rule.
- Keep harmony, polygon/equidistant, tonal, and custom generators separate.
- Keep the radial lightness wheel and overlay geometry aligned.
- Keep palette JSON import/export generic, with `source: "color-harmony-picker"`.