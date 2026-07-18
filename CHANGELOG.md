# Changelog

## 1.1.1 — 2026-07-17

- Replaced GTK's implicit menu-button behavior with explicit, reliable popover controls for Harmony and Palette recipe.
- Restored pointer selection in both chooser popovers.
- Released the lightness slider's keyboard focus when a drag ends so it does not remain selected.

## 1.1.0 — 2026-07-17

- Expanded the palette catalog from 33 to 53 entries with Vibrant, Harmony, Dark & Luminous, and Temperature categories.
- Added advanced recipe transforms for exact base preservation, absolute/relative lightness, chroma floors and absolutes, and absolute/relative hue.
- Preserved all legacy recipe outputs across seven regression seed colors.
- Reworked Randomize into seeded, category-aware temporary palette state with bounded variation, validation, safe fallback, and undo/redo restoration.
- Removed Manual Palette from the Inkscape recipe chooser while retaining the internal `none` state for compatibility.
- Fixed lightness slider dragging and retained the live active-color gradient.
- Replaced the picker glyph with a clearer SVG eyedropper.
- Rebuilt the screen picker as a position-stable frozen desktop overlay with a blue frame, mode notice, live color swatch, and HEX/RGB/HSL metadata tile.
- Kept Escape scoped to canceling the picker and returning to HuePrint.

## 1.0.0 — 2026-07-17

- Released the first complete HuePrint Inkscape extension with the interactive color donut, harmony geometry, recipe browser, metadata table, saved palettes, import/export, screen color picking, theme support, and click-to-run Windows installer.