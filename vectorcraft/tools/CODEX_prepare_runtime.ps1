param([Parameter(Mandatory=$true)][string]$Archive)
$ErrorActionPreference = 'Stop'
$projectDirectory = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$packageDirectory = Join-Path $projectDirectory 'node_modules\electron'
$checksums = Get-Content -LiteralPath (Join-Path $packageDirectory 'checksums.json') -Raw | ConvertFrom-Json
$archiveName = [System.IO.Path]::GetFileName($Archive)
$expected = $checksums.$archiveName
if (!$expected -or (Get-FileHash -LiteralPath $Archive -Algorithm SHA256).Hash.ToLowerInvariant() -ne $expected.ToLowerInvariant()) { throw 'Electron archive checksum does not match the installed npm package.' }
$destination = Join-Path $packageDirectory 'dist'
if (Test-Path -LiteralPath $destination) { throw 'Runtime directory already exists; no files replaced.' }
[System.IO.Compression.ZipFile]::ExtractToDirectory($Archive,$destination)
[System.IO.File]::WriteAllText((Join-Path $packageDirectory 'path.txt'),'electron.exe')
Write-Output 'Verified Electron archive extracted for development and packaging.'
