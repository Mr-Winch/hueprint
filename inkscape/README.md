# HuePrint for Inkscape

HuePrint is a visual color-harmony studio for Inkscape 1.4 or newer. It includes the interactive color donut, harmony geometry, all HuePrint palette recipes, saved colors, and JSON import/export.

## Easiest installation (recommended)

You do not need to program anything or install Python.

1. Download [`HuePrint-Inkscape.zip`](download/HuePrint-Inkscape.zip). Do **not** unpack it.
2. Open Inkscape.
3. Open **Extensions → Manage Extensions**.
4. Choose **Install Packages**.
5. Click the folder/disk button and select `HuePrint-Inkscape.zip`.
6. Close every Inkscape window, then reopen Inkscape.
7. Open **Extensions → Color → HuePrint**.

## Windows: double-click installer

If **Manage Extensions** is unavailable:

1. Download [`HuePrint-Windows.zip`](download/HuePrint-Windows.zip).
2. Right-click the ZIP and choose **Extract All**.
3. Open the extracted folder.
4. Double-click **Install HuePrint.cmd**.
5. Close and reopen Inkscape.
6. Open **Extensions → Color → HuePrint**.

Windows may warn that the installer is not digitally signed. Choose **More info → Run anyway**, or use Inkscape's package installer above.

## Using HuePrint

1. Select objects if you want HuePrint to recolor them.
2. Open **Extensions → Color → HuePrint**.
3. Click or drag around the color donut to select a hue and lightness.
4. Choose a harmony or one of the palette recipes.
5. Click generated swatches to make them active, or save them to your palette.
6. Use **Import** and **Export** to exchange JSON palettes.
7. Choose whether colors apply to fills or strokes, then click **Apply to Inkscape**.

HuePrint can also create a labeled palette strip on the current Inkscape layer.

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
hueprint_gui.py
```

Restart Inkscape afterward.

## Developer tests

```bash
python -m unittest discover -s inkscape -p "test_*.py"
```
