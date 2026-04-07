param(
    [string]$ProjectRoot = 'E:\mpcforum-userscript',
    [string]$Branch = 'main',
    [string]$CommitMessage = 'chore: update userscript modules'
)

$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

function Get-GitHubToken([string]$Root) {
    if ($env:GITHUB_TOKEN) { return [string]$env:GITHUB_TOKEN }
    if ($env:GH_TOKEN) { return [string]$env:GH_TOKEN }
    $tokenPath = Join-Path $Root 'token.txt'
    if (Test-Path $tokenPath) {
        $token = (Get-Content $tokenPath -Raw -Encoding UTF8).Trim()
        if ($token) { return $token }
    }
    throw 'Missing GitHub token. Set GITHUB_TOKEN or GH_TOKEN, or place token in token.txt.'
}

function Push-WithToken {
    param(
        [string]$Root,
        [string]$Branch,
        [string]$Token
    )

    $authBytes = [System.Text.Encoding]::UTF8.GetBytes("x-access-token:$Token")
    $authHeader = [System.Convert]::ToBase64String($authBytes)
    & git -C $Root -c "http.https://github.com/.extraheader=AUTHORIZATION: basic $authHeader" push origin $Branch
}

$token = Get-GitHubToken -Root $ProjectRoot

& powershell -ExecutionPolicy Bypass -File (Join-Path $ProjectRoot 'tools\sync-hosted-files.ps1') -ProjectRoot $ProjectRoot
& powershell -ExecutionPolicy Bypass -File (Join-Path $ProjectRoot 'tools\build.ps1') -ProjectRoot $ProjectRoot -HostedModulesConfig (Join-Path $ProjectRoot 'config\hosted-modules.json')

& git -C $ProjectRoot checkout $Branch | Out-Null
& git -C $ProjectRoot add -A
& git -C $ProjectRoot diff --cached --quiet
if ($LASTEXITCODE -eq 0) {
    Write-Host 'No changes to publish.'
    exit 0
}

& git -C $ProjectRoot commit -m $CommitMessage
Push-WithToken -Root $ProjectRoot -Branch $Branch -Token $token

Write-Host 'Publish complete.'