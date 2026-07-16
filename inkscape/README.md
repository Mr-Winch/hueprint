# HuePrint for Inkscape

HuePrint is a color-harmony extension for Inkscape 1.2 or newer.

## Easiest installation (recommended)

You do not need to program anything or install Python.

1. Download [`HuePrint-Inkscape.zip`](download/HuePrint-Inkscape.zip). Do **not** unpack it.
2. Open Inkscape.
3. Open **Extensions → Manage Extensions**.
4. Choose **Install Packages**.
5. Click the small folder/disk button and select `HuePrint-Inkscape.zip`.
6. Close every Inkscape window, then reopen Inkscape.
7. Open **Extensions → Color → HuePrint Palette**.

That is all. If your copy of Inkscape does not have **Manage Extensions**, use the Windows installer below.

## Windows: double-click installer

1. Download [`HuePrint-Windows.zip`](download/HuePrint-Windows.zip).
2. Right-click the downloaded ZIP and choose **Extract All**.
3. Open the extracted folder.
4. Double-click **Install HuePrint.cmd**.
5. When it says installation is complete, close the installer.
6. Close and reopen Inkscape.
7. Open **Extensions → Color → HuePrint Palette**.

Windows may show a security warning because the installer is not digitally signed. You can choose **More info → Run anyway**, or use the recommended Inkscape installation method above.

## Using HuePrint

1. Select objects if you want to recolor them.
2. Open **Extensions → Color → HuePrint Palette**.
3. Pick a base color and a harmony.
4. Choose how many colors you want.
5. Click **Apply**.

HuePrint can recolor the fill or outline of selected objects and can create a strip of color swatches on the page.

## If HuePrint does not appear

- Make sure you fully closed and reopened Inkscape after installing.
- Look under **Extensions → Color**, not the Fill and Stroke panel.
- Use Inkscape 1.2 or newer.
- If the ZIP method reports an error, extract `HuePrint-Windows.zip` and use the double-click installer.

## Manual installation (advanced)

In Inkscape, open **Edit → Preferences → System** and find **User extensions**. Create a folder named `hueprint` there and copy these files into it:

```text
hueprint.inx
hueprint.py
hueprint_palette.py
```

Restart Inkscape afterward.

## Developer test

```bash
python -m unittest discover -s inkscape -p "test_*.py"
```
