# HuePrint for Inkscape

HuePrint 1.1.3 is a visual color-harmony studio for Inkscape 1.4 or newer. It includes the interactive color donut, harmony geometry, all 53 HuePrint palette recipes, saved colors, JSON/GPL import, and Inkscape-compatible GPL export.

## Easiest installation (recommended)

You do not need to program anything or install Python.

1. Download [`HuePrint-Inkscape.zip`](download/HuePrint-Inkscape.zip). Do **not** unpack it.
2. Open Inkscape.
3. Open **Extensions → Manage Extensions**.
4. Choose **Install Packages**.
5. Click the folder/disk button and select `HuePrint-Inkscape.zip`.
6. Close every Inkscape window, then reopen Inkscape.
7. Open **Extensions → Color → HuePrint © 1.1.3**.

## Windows: double-click installer

If **Manage Extensions** is unavailable:

1. Download [`HuePrint-Windows.zip`](download/HuePrint-Windows.zip).
2. Right-click the ZIP and choose **Extract All**.
3. Open the extracted folder.
4. Double-click **Install HuePrint.cmd**.
5. Close and reopen Inkscape.
6. Open **Extensions → Color → HuePrint © 1.1.3**.

Windows may warn that the installer is not digitally signed. Choose **More info → Run anyway**, or use Inkscape's package installer above.

## Using HuePrint

1. Select objects if you want HuePrint to recolor them.
2. Open **Extensions → Color → HuePrint © 1.1.3**.
3. Click or drag around the color donut, enter a hex color, use the gradient lightness slider, or use the eyedropper to sample any visible screen color with a live preview tile.
4. Choose a harmony, or open **Palette recipe** to browse Tonal, Accent, Spectrum, Contrast, Systems, Vibrant, Harmony, Dark & Luminous, and Temperature recipes. Use **Randomize** for a validated variation from the active category.
5. Click the **+** beside Active Color to save it, or use the palette button in Saved Palette to save every generated swatch.
6. Click **Use saved colors as current palette** to make the complete Saved Palette current. HuePrint widens automatically for larger palettes.
7. Import saved palettes from JSON or GPL files, or export the Saved Palette as an Inkscape-compatible GPL file.
8. Choose whether colors apply to fills or strokes, then click **Apply**.

HuePrint can also create a labeled palette strip on the current Inkscape layer.

## Add an exported palette to Inkscape

1. Open **Edit → Preferences → System** and locate **User palettes**.
2. Export the Saved Palette from HuePrint and save the resulting `.gpl` file in that folder.
3. Restart Inkscape.
4. Open the palette options menu beside Inkscape's bottom color palette and select **HuePrint Saved Palette**.

## If HuePrint does not appear

- Fully close and reopen Inkscape after installing.
- Look under **Extensions → Color**.
- Confirm you are using Inkscape 1.4 or newer.
- Reinstall the newest ZIP; older HuePrint packages only contained the basic parameter dialog.

## Manual installation (advanced)

In Inkscape, open **Edit → Preferences → System** and find **User extensions**. Create a folder named `hueprint` there and copy these files into it:

```text
hueprint.inx
hueprint.py
hueprint_palette.py
hueprint_recipes.py
hueprint_recipe_metadata.py
hueprint_gui.py
hueprint_gui_v2.py
```

Restart Inkscape afterward.

## Developer tests

```bash
python -m unittest discover -s inkscape -p "test_*.py"
```
