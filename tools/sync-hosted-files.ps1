param(
    [string]$ProjectRoot = 'E:\mpcforum-userscript'
)

$ErrorActionPreference = 'Stop'

$srcRoot = Join-Path $ProjectRoot 'src'
$hostedRoot = Join-Path $ProjectRoot 'hosted'
$mapPath = Join-Path $ProjectRoot 'config\module-map.json'

$wrapperStartSrc = Join-Path $srcRoot 'wrapper-start.js'
$wrapperEndSrc = Join-Path $srcRoot 'wrapper-end.js'
$modulesSrcRoot = Join-Path $srcRoot 'modules'

$wrapperStartDst = Join-Path $hostedRoot 'wrapper-start.js'
$wrapperEndDst = Join-Path $hostedRoot 'wrapper-end.js'
$modulesDstRoot = Join-Path $hostedRoot 'modules'

foreach ($required in @($wrapperStartSrc, $wrapperEndSrc, $modulesSrcRoot, $mapPath)) {
    if (-not (Test-Path $required)) {
        throw "Missing required path: $required"
    }
}

if (-not (Test-Path $modulesDstRoot)) {
    New-Item -ItemType Directory -Path $modulesDstRoot -Force | Out-Null
}

$map = Get-Content $mapPath -Raw -Encoding UTF8 | ConvertFrom-Json | Sort-Object order
$expectedModuleFiles = @($map | ForEach-Object { [string]$_.file })

Copy-Item -Path $wrapperStartSrc -Destination $wrapperStartDst -Force
Copy-Item -Path $wrapperEndSrc -Destination $wrapperEndDst -Force

foreach ($moduleFile in $expectedModuleFiles) {
    $src = Join-Path $modulesSrcRoot $moduleFile
    if (-not (Test-Path $src)) {
        throw "Module file missing: $src"
    }
    $dst = Join-Path $modulesDstRoot $moduleFile
    Copy-Item -Path $src -Destination $dst -Force
}

$expectedSet = New-Object 'System.Collections.Generic.HashSet[string]' ([System.StringComparer]::OrdinalIgnoreCase)
foreach ($name in $expectedModuleFiles) {
    [void]$expectedSet.Add($name)
}

$existingHosted = Get-ChildItem -Path $modulesDstRoot -File -Filter '*.js'
foreach ($file in $existingHosted) {
    if (-not $expectedSet.Contains($file.Name)) {
        Remove-Item -Path $file.FullName -Force
    }
}

Write-Host "Synced hosted files: $($expectedModuleFiles.Count) modules + wrappers"