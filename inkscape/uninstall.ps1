[CmdletBinding(SupportsShouldProcess)]
param([switch]$RemoveUserData)

$ErrorActionPreference = "Stop"
$ExtensionPath = Join-Path $env:APPDATA "inkscape\extensions\hueprint"
$DataPath = Join-Path $env:LOCALAPPDATA "HuePrint"

if (Test-Path -LiteralPath $ExtensionPath) {
    if ($PSCmdlet.ShouldProcess($ExtensionPath, "Remove HuePrint 1.6.0 extension")) {
        Remove-Item -LiteralPath $ExtensionPath -Recurse -Force
    }
}

if ($RemoveUserData -and (Test-Path -LiteralPath $DataPath)) {
    if ($PSCmdlet.ShouldProcess($DataPath, "Remove HuePrint saved palettes and cache")) {
        Remove-Item -LiteralPath $DataPath -Recurse -Force
    }
}

Write-Host "HuePrint 1.6.0 was removed from Inkscape. Restart Inkscape if it is open."
if (-not $RemoveUserData -and (Test-Path -LiteralPath $DataPath)) {
    Write-Host "Saved HuePrint palettes and cached color names were preserved at $DataPath."
}
