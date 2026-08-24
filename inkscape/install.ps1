param([string]$Destination = "$env:APPDATA\inkscape\extensions\hueprint")
$ErrorActionPreference = "Stop"
New-Item -ItemType Directory -Force -Path $Destination | Out-Null
Copy-Item "$PSScriptRoot\hueprint.inx", "$PSScriptRoot\hueprint.py", "$PSScriptRoot\hueprint_palette.py", "$PSScriptRoot\hueprint_recipes.py", "$PSScriptRoot\hueprint_recipe_metadata.py", "$PSScriptRoot\hueprint_color_names.py", "$PSScriptRoot\hueprint_ntc.js", "$PSScriptRoot\hueprint_gui_v2.py", "$PSScriptRoot\hueprint-icon.svg", "$PSScriptRoot\THIRD_PARTY_NOTICES.md" -Destination $Destination -Force
Write-Host "HuePrint 1.6.0 installed at $Destination. Restart Inkscape to load it."
