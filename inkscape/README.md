# HuePrint for Inkscape

A native Inkscape 1.2+ effect extension based on HuePrint's color-harmony engine.

## Install

On Windows, run `./install.ps1`, then restart Inkscape. The default destination is `%APPDATA%\inkscape\extensions\hueprint`.

On Linux and macOS, copy `hueprint.inx`, `hueprint.py`, and `hueprint_palette.py` into a `hueprint` folder inside the **User extensions** directory shown under **Edit → Preferences → System**. Restart Inkscape.

## Use

Select objects if desired, open **Extensions → Color → HuePrint Palette**, choose the base color and harmony, then apply. Selected objects are colored in selection order; the palette repeats as needed. HuePrint can also create labeled swatches on the current layer.

## Test

```bash
python -m unittest discover -s inkscape -p "test_*.py"
```
