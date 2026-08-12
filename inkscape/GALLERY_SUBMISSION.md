# Inkscape Extensions Gallery submission

- **Upload file:** HuePrint-1.5.0-Inkscape-Gallery.zip
- **Signature file:** HuePrint-1.5.0-Inkscape-Gallery.zip.md5 (MD5 fallback accepted by the Inkscape submission guide)
- **Title:** HuePrint — Color Harmony & Palette Studio
- **Version:** 1.5.0
- **Author:** Winton Diaz Dauhajre
- **Username:** Mr-Winch
- **License:** MIT
- **Category:** Inkscape Package / Extension
- **Tested version:** Inkscape 1.4.4 on Windows
- **Supported versions:** Inkscape 1.4.x
- **Repository:** https://github.com/Mr-Winch/hueprint
- **Demo:** https://mr-winch.github.io/hueprint/
- **Menu location:** Extensions → Color → HuePrint © 1.5.0
- **Icon:** hueprint-icon.svg
- **Package utilities:** `Install HuePrint.cmd`, `Uninstall HuePrint.cmd`, `install.ps1`, and `uninstall.ps1`

## Short description

Create, discover, organize, reuse, and export deliberate color systems with visual harmonies, curated recipes, screen picking, and Inkscape-ready palette management.

## Full description

I created HuePrint because I missed a color-harmony and palette exploration feature that had once been available in that popular mainstream design application but was later deprecated. It offered a fast, visual way to build a palette from a single color. HuePrint brings that kind of exploration to Inkscape and expands it into a practical palette studio for real design work.

Start with any color from a HEX value, the interactive color wheel, or the screen eyedropper. Explore geometric harmonies or choose from 70 curated palette recipes, including adaptive background-and-pop combinations, daring chromatic clashes, and practical semantic systems, then adjust the lightness and number of colors while HuePrint keeps the palette visually connected. The wheel plots every swatch so you can see the relationships behind the result instead of guessing from isolated color chips.

HuePrint is useful for developing brand systems, illustrations, interfaces, editorial graphics, presentations, data visualizations, and any project that needs a deliberate color language. It helps you quickly establish a viable and repeatable palette while still showing the precise color information needed for production.

HuePrint also works as a palette manager rather than stopping at generation. Current Palette holds the system being explored or applied, while Saved Swatches acts as an assembly tray where promising colors can be collected, compared, reordered, and removed. Finished collections can be stored under custom names in Saved Palettes, recalled into Current Palette later, or exported as GPL files for Inkscape’s native palette interface. This keeps discovery, refinement, organization, reuse, and delivery in one coherent workflow.

Key features include:

- Interactive color donut with geometric harmony visualization
- 70 curated palette recipes, including adaptive background-and-pop, daring, and semantic collections, plus harmony-based and randomized exploration
- Two to sixteen generated swatches with adjustable lightness
- Screen eyedropper for sampling colors from anywhere on the screen
- Compact HEX, RGB, CMYK, HSL, and OKLCH metadata for every color, with offline NTC and live Colornames.org naming beneath HEX
- Slim Saved Swatches with persistent HEX and remove controls plus hover-only triangular reordering controls for collecting, arranging, loading, and exporting colors
- Persistent Saved Palettes in a full three-column card browser matching Harmony and Palette Recipes, with custom names, swatch previews, one-click loading, and individual deletion
- Geometry-preserving Saved Palette retargeting that moves the complete palette to a new active color without reverting to a default harmony or changing its swatch count
- JSON and GPL palette import
- Inkscape-compatible GPL export
- Direct application to selected objects or creation of labeled canvas swatches

Whether you need a quick supporting palette or want to study the structure of a complete color system, HuePrint keeps exploration, comparison, organization, and application inside Inkscape.

HuePrint is dependency-free beyond the Python 3, inkex, GTK 3, PyGObject, and Pycairo components supplied with supported Inkscape installations. NTC naming is bundled and fully offline. Colornames.org lookups are optional background requests with a local cache and explicit offline status; HuePrint does not self-update or send telemetry.

Known Windows limitation: because Inkscape launches extensions through its bundled Python interpreter, some systems can still show “Python” as HuePrint’s taskbar application label despite HuePrint’s custom title, icon, process AppUserModelID, and window-level shell identity. This is cosmetic and does not affect extension behavior.

## Suggested tags

color, palette, harmony, swatches, design, accessibility, CMYK, HSL, OKLCH
