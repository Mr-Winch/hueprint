@echo off
setlocal
title Install HuePrint for Inkscape

set "SOURCE=%~dp0"
set "TARGET=%APPDATA%\inkscape\extensions\hueprint"

echo.
echo  HuePrint for Inkscape
echo  ---------------------
echo.

if not exist "%SOURCE%hueprint.inx" goto missing
if not exist "%SOURCE%hueprint.py" goto missing
if not exist "%SOURCE%hueprint_palette.py" goto missing

if not exist "%TARGET%" mkdir "%TARGET%"
if errorlevel 1 goto failed

copy /Y "%SOURCE%hueprint.inx" "%TARGET%\hueprint.inx" >nul
if errorlevel 1 goto failed
copy /Y "%SOURCE%hueprint.py" "%TARGET%\hueprint.py" >nul
if errorlevel 1 goto failed
copy /Y "%SOURCE%hueprint_palette.py" "%TARGET%\hueprint_palette.py" >nul
if errorlevel 1 goto failed

echo  Installation complete!
echo.
echo  1. Close every Inkscape window.
echo  2. Reopen Inkscape.
echo  3. Choose Extensions ^> Color ^> HuePrint Palette.
echo.
echo  Installed in:
echo  %TARGET%
echo.
pause
exit /b 0

:missing
echo  INSTALLATION COULD NOT START
echo.
echo  Keep this installer beside the three HuePrint files, then try again.
echo  Make sure you extracted the ZIP before double-clicking the installer.
echo.
pause
exit /b 1

:failed
echo  INSTALLATION FAILED
echo.
echo  Windows could not copy HuePrint to:
echo  %TARGET%
echo.
echo  Check that your Windows account can write to this folder and try again.
echo.
pause
exit /b 1
