param([switch]$WithoutEditor)
$ErrorActionPreference = 'Stop'
$projectDirectory = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$env:VECTORCRAFT_CONFIG_DIR = Join-Path $projectDirectory '.test-profile'
$env:HUEPRINT_CONTROL_PORT = '7989'
$env:HUEPRINT_USER_DATA = Join-Path $projectDirectory '.app-test-profile'
$documentPath = Join-Path $projectDirectory 'test-output\CODEX_HuePrint-test.vectorcraft'
$editor = if (!$WithoutEditor) {
    Start-Process -FilePath (Join-Path $env:ProgramFiles 'VectorCraft\vectorcraft.exe') -ArgumentList @('--control=7989', ('"' + $documentPath + '"')) -WindowStyle Normal -PassThru
}
$runtime = Join-Path $projectDirectory 'node_modules\electron\dist\electron.exe'
$preview = Start-Process -FilePath $runtime -ArgumentList @('"' + $projectDirectory + '"') -WorkingDirectory $projectDirectory -WindowStyle Normal -PassThru
@{ editorPid=$editor.Id; previewPid=$preview.Id } | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $projectDirectory 'test-output\preview-processes.json')
Write-Output 'Isolated VectorCraft and HuePrint preview started.'
Wait-Process -Id $preview.Id
if ($editor -and (Get-Process -Id $editor.Id -ErrorAction SilentlyContinue)) { Stop-Process -Id $editor.Id }
