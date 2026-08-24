# HuePrint for Inkscape

HuePrint 1.6.0 is a visual color-harmony and palette-management studio for Inkscape 1.4.x. It includes the interactive color wheel, harmony geometry, 70 curated HuePrint palette recipes across tonal, contrast, background-aware, daring, semantic, and other design categories, dual-source color naming, Saved Swatches, reusable Saved Palettes, JSON/GPL import, and Inkscape-compatible GPL export.

Tested with Inkscape 1.4.4 on Windows. Author: Winton Diaz Dauhajre ([Mr-Winch](https://github.com/Mr-Winch)). License: MIT.

## Create, discover, and manage palettes

HuePrint is both a palette studio and a palette-management tool. **Current Palette** is the active system you are exploring or applying. **Saved Swatches** is a working tray where useful colors can be collected, compared, reordered, removed, and combined independently of the current recipe. Saved Swatches stay compact: each color keeps its HEX value and remove icon visible in restrained black, while triangular reorder controls appear only when that swatch is hovered.

When a collection is ready, save it to **Saved Palettes** with a memorable name. Saved Palettes use the same full card browser as Harmony and Palette Recipes, with three-column swatch previews, names, descriptions, selected-state indicators, one-click loading into Current Palette, and an individual delete button on every card. Exporting Saved Swatches as GPL completes the workflow by making the palette available through Inkscape’s native palette interface.

This creates a continuous process: discover relationships with harmonies and recipes, refine a Current Palette, assemble the strongest colors in Saved Swatches, preserve reusable systems in Saved Palettes, and deliver them to Inkscape through Apply or GPL export.

## Easiest installation (recommended)

You do not need to program anything or install Python.

1. Download [`HuePrint-Inkscape-1.6.0.zip`](download/HuePrint-Inkscape-1.6.0.zip). Do **not** unpack it.
2. Open Inkscape.
3. Open **Extensions → Manage Extensions**.
4. Choose **Install Packages**.
5. Click the folder/disk button and select `HuePrint-Inkscape-1.6.0.zip`.
6. Close every Inkscape window, then reopen Inkscape.
7. Open **Extensions → Color → HuePrint © 1.6.0**.

## Windows: double-click installer

If **Manage Extensions** is unavailable:

1. Download [`HuePrint-Windows-1.6.0.zip`](download/HuePrint-Windows-1.6.0.zip).
2. Right-click the ZIP and choose **Extract All**.
3. Open the extracted folder.
4. Double-click **Install HuePrint.cmd**.
5. Close and reopen Inkscape.
6. Open **Extensions → Color → HuePrint © 1.6.0**.

Windows may warn that the installer is not digitally signed. Choose **More info → Run anyway**, or use Inkscape's package installer above.

## Uninstalling

Every HuePrint package includes both installation and uninstallation tools.

- On Windows, extract the ZIP and double-click **Uninstall HuePrint.cmd**. It asks before removing the extension and separately asks whether to remove Saved Swatches, Saved Palettes, and cached color names.
- From PowerShell, run `uninstall.ps1`. Add `-RemoveUserData` only if you also want to delete HuePrint’s saved palettes and cache.
- If HuePrint was installed through **Manage Extensions**, it can also be removed there.

HuePrint release ZIPs always include the semantic version in their filename. Unversioned package aliases are not published.

## Using HuePrint

1. Select objects if you want HuePrint to recolor them.
2. Open **Extensions → Color → HuePrint © 1.6.0**.
3. Click or drag around the color wheel, enter a hex color, use the gradient lightness slider, or use the eyedropper to sample any visible screen color with a live preview tile.
4. Choose a harmony, open **Palette recipe**, or load a reusable palette from **Saved Palettes**. A loaded Saved Palette acts as a reusable geometry template: move its active color on the wheel, enter a new HEX value, adjust lightness, or pick a screen color and HuePrint preserves every hue/lightness relationship and the complete swatch count. Use **Randomize** for a validated variation from the active recipe category.
5. Click the **+** beside Active Color to place it in **Saved Swatches**, or use the palette button there to add every color from **Current Palette**.
6. To send Saved Swatches to Inkscape, click **Load Saved Swatches as Current Palette**, choose the Apply options, and click **Apply**. HuePrint widens automatically for larger palettes.
7. Use **Save Saved Swatches as a reusable palette** to keep the collection in **Saved Palettes** for later reuse. Saved Palette cards show the palette name and swatch preview; use the trash button on a card to delete that palette when it is no longer needed.
8. Import JSON or GPL colors into Saved Swatches, or export Saved Swatches as an Inkscape-compatible GPL file.
9. Select any combination of **Fill**, **Stroke**, and **Create swatches on canvas**, then click **Apply**. HuePrint always keeps at least one action selected.

Hover any Current Palette or Saved Swatch color to see its HEX value followed by separate italic names from the **NTC Library** and **Colornames.org**. The same two names appear below HEX in the metadata table. NTC is bundled and works entirely offline. Colornames.org is queried in the background, successful names are cached locally, and its line reads **No connection** when the service cannot be reached. If the community result is **Unnamed**, the table offers a **Name this color** link to the exact proposal page on Colornames.org.

HuePrint can also create a labeled palette strip on the current Inkscape layer.

## Add an exported palette to Inkscape

1. Open **Edit → Preferences → System** and locate **User palettes**.
2. Export **Saved Swatches** from HuePrint and save the resulting `.gpl` file in that folder.
3. Restart Inkscape.
4. Open the palette options menu beside Inkscape's bottom color palette and select **HuePrint Saved Swatches**.

## If HuePrint does not appear

- Fully close and reopen Inkscape after installing.
- Look under **Extensions → Color**.
- Confirm you are using Inkscape 1.4.x.
- Reinstall the newest ZIP; older HuePrint packages only contained the basic parameter dialog.

## Known limitation

On some Windows/Inkscape configurations, the taskbar can still label the HuePrint window as **Python**. HuePrint supplies its own title, icon, application name, process AppUserModelID, and window-level shell identity, but Inkscape ultimately launches the extension through its bundled Python interpreter. This cosmetic label does not affect HuePrint’s palette functionality.

## Manual installation (advanced)

In Inkscape, open **Edit → Preferences → System** and find **User extensions**. Create a folder named `hueprint` there and copy these files into it:

```text
hueprint.inx
hueprint.py
hueprint_palette.py
hueprint_recipes.py
hueprint_recipe_metadata.py
hueprint_color_names.py
hueprint_ntc.js
hueprint-icon.svg
hueprint_gui_v2.py
THIRD_PARTY_NOTICES.md
Install HuePrint.cmd
Uninstall HuePrint.cmd
install.ps1
uninstall.ps1
```

Restart Inkscape afterward.

## Developer tests

```bash
python -m unittest discover -s inkscape -p "test_*.py"
```
