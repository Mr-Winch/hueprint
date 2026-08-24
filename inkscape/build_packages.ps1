param([string]$Version)

$ErrorActionPreference = "Stop"
$InkscapeRoot = $PSScriptRoot
$RepositoryRoot = Split-Path -Parent $InkscapeRoot
$DownloadRoot = Join-Path $InkscapeRoot "download"

if (-not $Version) {
    $Version = (Get-Content -LiteralPath (Join-Path $InkscapeRoot "VERSION") -Raw).Trim()
}
if ($Version -notmatch '^\d+\.\d+\.\d+$') {
    throw "HuePrint package versions must use semantic versioning, for example 1.5.0."
}

$RuntimeFiles = @(
    "VERSION",
    "hueprint.inx",
    "hueprint.py",
    "hueprint_palette.py",
    "hueprint_recipes.py",
    "hueprint_recipe_metadata.py",
    "hueprint_color_names.py",
    "hueprint_ntc.js",
    "hueprint_gui_v2.py",
    "hueprint-icon.svg",
    "THIRD_PARTY_NOTICES.md"
)
$PackageFiles = $RuntimeFiles + @(
    "README.md",
    "Install HuePrint.cmd",
    "Uninstall HuePrint.cmd",
    "install.ps1",
    "uninstall.ps1"
)

foreach ($File in $PackageFiles) {
    $Path = Join-Path $InkscapeRoot $File
    if (-not (Test-Path -LiteralPath $Path)) {
        throw "Required package file is missing: $Path"
    }
}

foreach ($File in @("hueprint.inx", "hueprint_gui_v2.py", "Install HuePrint.cmd", "Uninstall HuePrint.cmd", "install.ps1", "uninstall.ps1")) {
    $Contents = Get-Content -LiteralPath (Join-Path $InkscapeRoot $File) -Raw
    if (-not $Contents.Contains($Version)) {
        throw "Version mismatch: $File does not identify HuePrint $Version."
    }
}

$Stage = Join-Path $InkscapeRoot ".package-stage-$Version"
if (Test-Path -LiteralPath $Stage) {
    throw "Unexpected existing package staging directory: $Stage"
}

try {
    New-Item -ItemType Directory -Path $Stage | Out-Null
    foreach ($File in $PackageFiles) {
        Copy-Item -LiteralPath (Join-Path $InkscapeRoot $File) -Destination (Join-Path $Stage $File)
    }
    Copy-Item -LiteralPath (Join-Path $RepositoryRoot "LICENSE") -Destination (Join-Path $Stage "LICENSE")
    Copy-Item -LiteralPath (Join-Path $RepositoryRoot "CHANGELOG.md") -Destination (Join-Path $Stage "CHANGELOG.md")

    $InkscapePackage = Join-Path $DownloadRoot "HuePrint-Inkscape-$Version.zip"
    $WindowsPackage = Join-Path $DownloadRoot "HuePrint-Windows-$Version.zip"
    Compress-Archive -Path "$Stage\*" -DestinationPath $InkscapePackage -CompressionLevel Optimal -Force
    Compress-Archive -Path "$Stage\*" -DestinationPath $WindowsPackage -CompressionLevel Optimal -Force

    $Tests = Join-Path $Stage "tests"
    New-Item -ItemType Directory -Path $Tests | Out-Null
    Get-ChildItem -LiteralPath $InkscapeRoot -Filter "test_*.py" |
        Where-Object { $_.Name -ne "test_hueprint_distribution.py" } |
        Copy-Item -Destination $Tests
    $GalleryPackage = Join-Path $DownloadRoot "HuePrint-$Version-Inkscape-Gallery.zip"
    Compress-Archive -Path "$Stage\*" -DestinationPath $GalleryPackage -CompressionLevel Optimal -Force
    $Md5 = (Get-FileHash -LiteralPath $GalleryPackage -Algorithm MD5).Hash.ToLowerInvariant()
    Set-Content -LiteralPath "$GalleryPackage.md5" -Value "$Md5  HuePrint-$Version-Inkscape-Gallery.zip" -Encoding ascii

    Write-Host "Created versioned HuePrint packages:"
    Write-Host "  $InkscapePackage"
    Write-Host "  $WindowsPackage"
    Write-Host "  $GalleryPackage"
}
finally {
    if (Test-Path -LiteralPath $Stage) {
        $ResolvedStage = (Resolve-Path -LiteralPath $Stage).Path
        $ResolvedRoot = (Resolve-Path -LiteralPath $InkscapeRoot).Path
        if (-not $ResolvedStage.StartsWith($ResolvedRoot + "\.package-stage-")) {
            throw "Unsafe package staging cleanup target: $ResolvedStage"
        }
        Remove-Item -LiteralPath $ResolvedStage -Recurse -Force
    }
}
