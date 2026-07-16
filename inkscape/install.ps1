param([string]$Destination = "$env:APPDATA\inkscape\extensions\hueprint")
$ErrorActionPreference = "Stop"
New-Item -ItemType Directory -Force -Path $Destination | Out-Null
Copy-Item "$PSScriptRoot\hueprint.inx", "$PSScriptRoot\hueprint.py", "$PSScriptRoot\hueprint_palette.py" -Destination $Destination -Force
Write-Host "HuePrint installed at $Destination. Restart Inkscape to load it."
