@echo off
setlocal
title Install HuePrint for Inkscape
set "SOURCE=%~dp0"
set "TARGET=%APPDATA%\inkscape\extensions\hueprint"
echo.
echo  HuePrint for Inkscape
echo  ---------------------
echo.
for %%F in (hueprint.inx hueprint.py hueprint_palette.py hueprint_recipes.py hueprint_recipe_metadata.py hueprint_gui.py hueprint_gui_v2.py) do if not exist "%SOURCE%%%F" goto missing
if not exist "%TARGET%" mkdir "%TARGET%"
if errorlevel 1 goto failed
for %%F in (hueprint.inx hueprint.py hueprint_palette.py hueprint_recipes.py hueprint_recipe_metadata.py hueprint_gui.py hueprint_gui_v2.py) do (
  copy /Y "%SOURCE%%%F" "%TARGET%\%%F" >nul
  if errorlevel 1 goto failed
)
echo  Installation complete!
echo.
echo  1. Close every Inkscape window.
echo  2. Reopen Inkscape.
echo  3. Choose Extensions ^> Color ^> HuePrint RC1.
echo.
echo  Installed in:
echo  %TARGET%
echo.
pause
exit /b 0
:missing
echo  INSTALLATION COULD NOT START
echo.
echo  Extract the ZIP before running this installer and keep all HuePrint files together.
echo.
pause
exit /b 1
:failed
echo  INSTALLATION FAILED
echo.
echo  Windows could not copy HuePrint to:
echo  %TARGET%
echo.
pause
exit /b 1
