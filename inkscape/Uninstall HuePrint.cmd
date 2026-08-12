@echo off
setlocal
title Uninstall HuePrint for Inkscape
set "TARGET=%APPDATA%\inkscape\extensions\hueprint"
set "DATA=%LOCALAPPDATA%\HuePrint"

echo.
echo  HuePrint 1.5.0 uninstaller
echo  --------------------------
echo.
echo  This will remove HuePrint from:
echo  %TARGET%
echo.
choice /C YN /N /M "Continue? [Y/N] "
if errorlevel 2 exit /b 0

if exist "%TARGET%" (
  rmdir /S /Q "%TARGET%"
  if exist "%TARGET%" goto failed
)

echo.
echo  HuePrint was removed from Inkscape.
if not exist "%DATA%" goto complete

echo.
echo  Saved Swatches, Saved Palettes, and cached color names are stored in:
echo  %DATA%
choice /C YN /N /M "Remove that saved HuePrint data too? [Y/N] "
if errorlevel 2 goto complete
rmdir /S /Q "%DATA%"
if exist "%DATA%" goto data_failed

:complete
echo.
echo  Uninstallation complete. Restart Inkscape if it is open.
echo.
pause
exit /b 0

:failed
echo.
echo  UNINSTALLATION FAILED
echo  Close Inkscape and try again.
echo.
pause
exit /b 1

:data_failed
echo.
echo  HuePrint was uninstalled, but its saved user data could not be removed.
echo.
pause
exit /b 1
