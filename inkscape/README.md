# HuePrint for Inkscape

A native Inkscape 1.2+ effect extension based on HuePrint's color-harmony engine.

## Install in Inkscape

HuePrint requires Inkscape 1.2 or newer. You do not need to install Python or Python packages because Inkscape includes the extension runtime.

### 1. Find the correct extensions folder

Open Inkscape and go to **Edit → Preferences → System**. Copy the path shown next to **User extensions**. Use that path, especially for Microsoft Store, Homebrew, Flatpak, or Snap installations.

### 2. Copy the extension

Download or clone this branch. Copy the `inkscape` folder into the **User extensions** folder and rename the copied folder to `hueprint`. These files must be directly inside it:

```text
hueprint/
├── hueprint.inx
├── hueprint.py
└── hueprint_palette.py
```

The README, installer, and test file are not required by Inkscape.

#### Windows automatic install

Open PowerShell in the repository root and run:

```powershell
.\inkscape\install.ps1
```

This uses `%APPDATA%\inkscape\extensions\hueprint`. If Inkscape shows a different **User extensions** path, pass it explicitly:

```powershell
.\inkscape\install.ps1 -Destination "C:\path\shown\by\Inkscape\hueprint"
```

If PowerShell blocks local scripts:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\inkscape\install.ps1
```

### 3. Restart and verify

Close every Inkscape window and reopen it. HuePrint should appear under **Extensions → Color → HuePrint Palette**.

If it is missing, confirm `hueprint.inx` is directly inside the copied folder—not inside another nested `inkscape` folder—and recheck the **User extensions** path.

## Use

1. Select objects if you want HuePrint to recolor them.
2. Open **Extensions → Color → HuePrint Palette**.
3. Choose the base color, harmony, and swatch count.
4. Choose **Fill** or **Stroke**.
5. Optionally create a palette strip and enable **Live preview**.
6. Click **Apply**.

Selected objects are colored in selection order. If there are more objects than colors, the palette repeats.

## Test

```bash
python -m unittest discover -s inkscape -p "test_*.py"
```
