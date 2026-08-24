# Changelog

## 1.6.0 — 2026-08-23

- Brought the React edition up to the Current Palette, Saved Swatches, and reusable Saved Palettes workflow introduced in the Inkscape extension.
- Added Inkscape-compatible GIMP Palette (GPL) import and export while retaining HuePrint JSON import/export and legacy JSON-array compatibility.
- Preserved GPL swatch labels, input order, safe deduplication, palette names, and configurable GPL column counts.
- Replaced the React harmony and recipe dropdowns with visual, responsive chooser cards containing live previews and descriptions synchronized from the extension.
- Exposed category-aware recipe randomization in the React interface and identified randomized palettes in the chooser.
- Added named Saved Palettes with previews, loading, overwriting by name, deletion, controlled/uncontrolled state, and demo persistence.
- Added a responsive Current Palette metadata table for HEX, NTC names, optional Colornames.org names, RGB, CMYK, HSL, and OKLCH.
- Added the complete offline NTC library to React through generated TypeScript data synchronized from the attributed extension source.
- Added an optional asynchronous community-name resolver with browser caching, loading/offline/unnamed states, and exact Colornames.org proposal links.
- Raised React harmony and tonal palettes to sixteen swatches while keeping recipe and fixed-harmony limits aligned with their formulas.
- Added a generic `onApplyPalette` integration callback, slimmer labeled Saved Swatches, and responsive full-width palette sections.
- Refined both compact layouts: their three visual choosers remain on one row, metadata is omitted, and opaque chooser panels stay above the palette content.
- Made Escape close Harmony, Palette Recipes, or Saved Palettes without changing the current selection and return keyboard focus to its chooser.
- Decoupled the React package version from the Inkscape package version so React releases cannot accidentally relabel extension ZIPs.
- Added GPL, JSON, NTC, and sixteen-swatch regression coverage and visually verified wide, compact, light, and dark layouts.

## 1.5.0 — 2026-08-12

- Added human-readable color names beneath HEX metadata for every Current Palette color.
- Added identified, italic NTC Library and Colornames.org name lines to Current Palette and Saved Swatch tooltips.
- Bundled the official NTC name list for completely offline matching and credited its creator, Chirag Mehta, in the HuePrint header.
- Added non-blocking Colornames.org lookups with persistent successful-result caching, obsolete-request cancellation, and an explicit “No connection” state when the service cannot be reached.
- Routed Colornames.org requests through Windows’ native WinINet certificate store when running inside Inkscape, fixing TLS validation failures without disabling certificate verification.
- Turned unnamed Colornames.org metadata into a compact “Name this color” link that opens the exact community proposal page for that HEX value.
- Added a best-effort HuePrint AppUserModelID, GLib application name, window role, and window-level shell identity for Windows.
- Known limitation: some Windows/Inkscape configurations still label the running extension as Python in the taskbar because Inkscape launches it through its bundled Python interpreter.
- Standardized every distributable ZIP on versioned filenames and included both one-click install and uninstall tools in every package.
- Added a packaging script that reads the canonical project version, refuses unversioned releases, and builds the Inkscape, Windows, and Gallery packages consistently.
- Documented the external naming sources, licenses, connectivity behavior, and attribution notices.

## 1.4.5 — 2026-07-31

- Made loaded Saved Palettes behave as reusable geometry templates instead of falling back to Analogous when the active color changes.
- Preserved every relative hue angle, lightness offset, saturation relationship, and swatch count while moving the active color on the wheel.
- Applied the same geometry-preserving behavior to HEX entry, the lightness slider, screen picking, and colors chosen from Saved Swatches.
- Kept Current Palette swatch selection non-destructive: choosing an existing swatch changes the active anchor without deforming the palette.
- Stored a fixed source template during dragging to prevent cumulative color-rounding drift, and added functional geometry regression coverage.

## 1.4.4 — 2026-07-31

- Rebuilt the Saved Palettes chooser with the same full browser geometry and visual hierarchy used by Harmony and Palette Recipes.
- Expanded the chooser to a 740-pixel, three-column, scrollable layout with uniform 220 × 142 cards.
- Added a full swatch preview, palette name, saved-color count, load description, and selected-state indicator to every Saved Palette card.
- Integrated an individual square delete button into each card while preserving confirmation and Current Palette behavior.
- Forced the Saved Palettes chooser to open below its control when screen space permits and added regression coverage for the shared card pattern.

## 1.4.3 — 2026-07-31

- Restored the subtitle beneath HuePrint with the studio description, version, copyright, author credit, and interaction guidance.
- Escaped the ampersand in the Pango markup so GTK renders the complete two-line subtitle instead of silently leaving the label blank.
- Added regression coverage for the author-credit subtitle and rebuilt the extension packages.

## 1.4.2 — 2026-07-30

- Slimmed the Saved Swatches from 52 to 34 pixels high for a tighter single-row presentation.
- Kept each HEX code and remove icon permanently visible in black at 60% opacity across every swatch color.
- Restored the filled triangular reorder controls at the left and right edges, shown only while hovering at 50% black opacity.
- Removed the interim overflow menu and retained the single Add Active Color action beside Active Color.
- Updated the UI contract, documentation, local installation, and distribution packages.

## 1.4.1 — 2026-07-30

- Replaced the always-visible Saved Swatch editing controls with one restrained overflow menu inside each swatch.
- Added clear, labeled actions for moving a swatch left or right and removing it, preserving the polished single-row layout.
- Removed the duplicate Add Active Color button from the Saved Swatches header; the Active Color section remains the single place for that action.
- Kept adaptive HEX labels and updated the tooltips, documentation, and regression contract for the refined interaction.

## 1.4.0 — 2026-07-30

- Added the HEX value directly inside every Saved Swatch.
- Chose swatch text from two restrained neutral inks using relative luminance, maintaining contrast without introducing distracting text-color variation.
- Replaced the separate reorder/remove button row with a compact action strip that fades in inside the swatch on hover.
- Kept the editing icons consistently light against a subtle neutral overlay so they remain legible over every swatch color and in both application themes.
- Expanded the project, Inkscape, and gallery documentation to describe HuePrint as a palette creation, discovery, and management studio spanning Current Palette, Saved Swatches, reusable Saved Palettes, Apply, and GPL export.
- Added regression coverage for adaptive swatch text and the compact in-swatch editing contract.

## 1.3.1 — 2026-07-30

- Renamed Named Palettes to **Saved Palettes** throughout the Inkscape interface and documentation.
- Rebuilt the Saved Palettes chooser to match the Harmony and Palette Recipe card pattern, including a swatch strip, bold name, color count, load action, and selected-state indicator.
- Added individual Saved Palette deletion with confirmation while preserving any colors already loaded into Current Palette.
- Migrated the palette library to a clearly named storage file while continuing to read existing named-palette data.
- Removed the mismatched arrow character from the Saved Swatches workflow explanation.
- Reworked the Windows picker input lifecycle so HuePrint consumes the selection press and release instead of passing the click to Inkscape while it waits for the extension.
- Made the picker HUD transient to HuePrint, released the screen device context after every sample, and limited sampling and HUD movement to actual pointer changes to reduce intermittent stalls.

## 1.3.0 — 2026-07-30

- Expanded HuePrint from 52 to 70 curated palette recipes while preserving every existing recipe.
- Added **Background & Pop**, a six-recipe collection that treats the selected color as a backdrop and adapts foreground lightness so text, accents, and focal colors stand out.
- Added six more vibrant, exotic, and deliberately daring recipes for stronger chromatic tension and less conventional results.
- Added six semantic recipes for interface states, light and dark systems, financial signals, data states, and editorial workflows.
- Added adaptive contrast, soft-contrast, and pop transforms to both the Inkscape/Python and HTML/React recipe engines.
- Kept recipe formulas, categories, chooser metadata, randomized variations, and automated coverage synchronized across both editions.
## 1.2.0 — 2026-07-30

- Renamed Swatches to Current Palette and Saved Palette to Saved Swatches throughout the Inkscape extension.
- Added an in-window workflow note explaining how to load Saved Swatches into Current Palette before applying them to Inkscape.
- Added persistent named palettes, including a naming dialog, separate storage, swatch-preview cards, and one-click loading into Current Palette.
- Added a Save Named Palette button before Clear Saved Swatches and aligned all related tooltips, import/export labels, and GPL naming.
- Set the HuePrint SVG as the GTK window and default application icon instead of the bundled Python icon.

## 1.1.8 — 2026-07-29

- Kept HuePrint visible while screen picking so Inkscape is not exposed as a greyed, apparently frozen window.
- Restyled the picker HUD with a borderless semi-transparent grey background and removed the stray blue paths.
- Changed the heading to larger title-case text and tightened the title, instruction, RGB, and HSL spacing.
- Aligned the HEX/RGB/HSL metadata block to the swatch height and strengthened the swatch outline.

## 1.1.7 — 2026-07-29

- Rebuilt the Windows screen eyedropper from scratch without screenshots, fullscreen overlays, GTK pointer grabs, or full-screen redraws.
- Added native live pixel sampling with a compact cursor-following HUD showing HEX, RGB, and HSL metadata.
- Added reliable global click detection that arms only after the opening click is released, then restores HuePrint with the selected Active Color.
- Made Escape cancel the picker globally, restore HuePrint, and preserve the previous Active Color.

## 1.1.6 — 2026-07-25

- Kept the main HuePrint dialog alive while entering screen-picking mode instead of hiding and terminating `Gtk.Dialog.run()`.
- Replaced the Windows picker splash window and global pointer grab with a normal borderless input window.
- Routed pointer motion, click, and Escape directly through the picker window and cached captured pixels for responsive sampling.

## 1.1.5 — 2026-07-25

- Replaced the broken GTK root-window picker on Windows with native virtual-screen capture, including HiDPI and multi-monitor coordinate scaling.
- Moved Apply beside independent Fill, Stroke, and Create swatches on canvas options while enforcing at least one selected action.
- Rebuilt Harmony as a visual chooser with generated color previews, names, descriptions, and selected-state indicators.
- Restyled light-theme buttons and SVG icons with light surfaces and dark foregrounds.
- Increased the subtitle text size and adopted the official color wheel terminology.
- Synchronized the HTML palette recipe names with the extension and grouped all recipes by their current categories.

## 1.1.4 — 2026-07-18

- Prepared a clean, versioned package for submission to the Inkscape Extensions Gallery.
- Added an extension-gallery icon, menu description, license, compatibility details, and reviewer metadata.
- Moved persistent saved-palette data out of Inkscape's configuration directory while preserving read-only migration from the legacy location.
- Declared support for Inkscape 1.4.x and confirmed operation with Inkscape 1.4.4 on Windows.


## 1.1.3 — 2026-07-18

- Made HuePrint and section titles black in light mode while retaining white titles in dark mode.
- Standardized every light-theme button on the same dark-gray surface with white text and SVG icons.
- Flipped the Use saved colors as current palette icon so its arrow points upward toward Swatches.

## 1.1.2 — 2026-07-17

- Made a screen-picker click close the overlay immediately and commit the sampled pixel as Active Color.
- Added Use saved colors as current palette, preserving the complete saved order for Apply and canvas swatches.
- Increased generated palettes from 8 to 16 swatches and allowed saved-derived current palettes to exceed that limit.
- Automatically widens the window for larger current palettes while keeping every swatch in the metadata table.
- Changed Saved Palette export to Inkscape-compatible GIMP Palette (GPL) files and added GPL/JSON import support.

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
