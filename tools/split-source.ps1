param(
    [string]$SourceFile = '',
    [string]$ProjectRoot = 'E:\mpcforum-userscript'
)

$ErrorActionPreference = 'Stop'

if (-not $SourceFile) {
    $workspaceSourceFile = Join-Path $ProjectRoot 'skrypt'
    if (Test-Path $workspaceSourceFile) {
        $SourceFile = $workspaceSourceFile
    } else {
        $SourceFile = 'E:\skrypt'
    }
}

if (-not (Test-Path $SourceFile)) {
    throw "Source file not found: $SourceFile"
}

$mapPath = Join-Path $ProjectRoot 'config\module-map.json'
$modulesRoot = Join-Path $ProjectRoot 'src\modules'
if (-not (Test-Path $mapPath)) {
    throw "Module map not found: $mapPath"
}

$map = Get-Content $mapPath -Raw -Encoding UTF8 | ConvertFrom-Json
$lines = Get-Content $SourceFile -Encoding UTF8

foreach ($module in ($map | Sort-Object order)) {
    $startIndex = [Math]::Max([int]$module.startLine - 1, 0)
    $endLine = if ($null -eq $module.endLine) { $lines.Count } else { [int]$module.endLine }
    $endIndex = [Math]::Min($endLine - 1, $lines.Count - 1)

    if ($endIndex -lt $startIndex) {
        throw "Invalid range for module $($module.file): $($module.startLine)-$($module.endLine)"
    }

    $slice = @($lines[$startIndex..$endIndex])

    while ($slice.Count -gt 0 -and [string]::IsNullOrWhiteSpace($slice[-1])) {
        if ($slice.Count -eq 1) { break }
        $slice = $slice[0..($slice.Count - 2)]
    }

    if ($module.file -eq '90-bootstrap.js') {
        while ($slice.Count -gt 0 -and ($slice[-1] -match '^\s*\}\)\(\);\s*$' -or $slice[-1] -match '^\s*\}\);\s*$')) {
            if ($slice.Count -eq 1) {
                $slice = @()
                break
            }
            $slice = $slice[0..($slice.Count - 2)]
        }
    }

    $banner = @(
        "// Module: $($module.file)",
        "// Source: ${SourceFile}:$($module.startLine)-$($module.endLine)",
        "// Purpose: $($module.label)",
        ''
    )

    $outPath = Join-Path $modulesRoot $module.file
    Set-Content -Path $outPath -Value ($banner + $slice) -Encoding UTF8
    Write-Host "Generated $outPath"
}

Write-Host "Done. Generated $($map.Count) modules in $modulesRoot"
