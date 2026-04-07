param(
    [string]$ProjectRoot = 'E:\mpcforum-userscript',
    [string]$RepoName = 'mpcforum-userscript-hosting',
    [string]$Branch = 'main',
    [string]$Owner = '',
    [switch]$SkipRepoCreate,
    [switch]$Push
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

function Invoke-GitHubApi {
    param(
        [string]$Method,
        [string]$Url,
        [string]$Token,
        [object]$Body = $null
    )

    $headers = @{
        Authorization         = "Bearer $Token"
        Accept                = 'application/vnd.github+json'
        'X-GitHub-Api-Version' = '2022-11-28'
        'User-Agent'          = 'mpcforum-userscript-setup'
    }

    if ($null -ne $Body) {
        return Invoke-RestMethod -Method $Method -Uri $Url -Headers $headers -Body ($Body | ConvertTo-Json -Depth 10) -ContentType 'application/json'
    }

    return Invoke-RestMethod -Method $Method -Uri $Url -Headers $headers
}

function Ensure-GitHubRepo {
    param(
        [string]$Token,
        [string]$RepoName,
        [string]$Owner,
        [switch]$SkipRepoCreate
    )

    $resolvedOwner = [string]$Owner
    if (-not $resolvedOwner) {
        $user = Invoke-GitHubApi -Method 'GET' -Url 'https://api.github.com/user' -Token $Token
        $resolvedOwner = [string]$user.login
    }

    if ($SkipRepoCreate) {
        Write-Host "Skipping API repo creation for: $resolvedOwner/$RepoName"
        return $resolvedOwner
    }

    $repoUrl = "https://api.github.com/repos/$resolvedOwner/$RepoName"
    $exists = $true
    try {
        $null = Invoke-GitHubApi -Method 'GET' -Url $repoUrl -Token $Token
    } catch {
        $exists = $false
    }

    if (-not $exists) {
        $body = @{ name = $RepoName; private = $false; auto_init = $false; description = 'MPCForum Tampermonkey userscript modules hosting' }
        $null = Invoke-GitHubApi -Method 'POST' -Url 'https://api.github.com/user/repos' -Token $Token -Body $body
        Write-Host "Created GitHub repo: $resolvedOwner/$RepoName"
    } else {
        Write-Host "GitHub repo already exists: $resolvedOwner/$RepoName"
    }

    return $resolvedOwner
}

function Write-HostedModulesConfig {
    param(
        [string]$Root,
        [string]$Owner,
        [string]$Repo,
        [string]$Branch
    )

    $mapPath = Join-Path $Root 'config\module-map.json'
    $outPath = Join-Path $Root 'config\hosted-modules.json'
    $map = Get-Content $mapPath -Raw -Encoding UTF8 | ConvertFrom-Json | Sort-Object order

    $urls = New-Object System.Collections.Generic.List[string]
    $urls.Add("https://raw.githubusercontent.com/$Owner/$Repo/$Branch/hosted/wrapper-start.js")
    foreach ($m in $map) {
        $urls.Add("https://raw.githubusercontent.com/$Owner/$Repo/$Branch/hosted/modules/$($m.file)")
    }
    $urls.Add("https://raw.githubusercontent.com/$Owner/$Repo/$Branch/hosted/wrapper-end.js")

    $json = $urls | ConvertTo-Json
    Set-Content -Path $outPath -Value $json -Encoding UTF8
    Write-Host "Updated hosted modules config: $outPath"
}

function Ensure-LocalGit {
    param(
        [string]$Root,
        [string]$Owner,
        [string]$Repo,
        [string]$Branch
    )

    $gitPath = Join-Path $Root '.git'
    if (-not (Test-Path $gitPath)) {
        & git -C $Root init | Out-Null
    }

    & git -C $Root checkout -B $Branch | Out-Null

    $remote = (& git -C $Root remote) -split "`n" | ForEach-Object { $_.Trim() } | Where-Object { $_ }
    $remoteUrl = "https://github.com/$Owner/$Repo.git"
    if ($remote -contains 'origin') {
        & git -C $Root remote set-url origin $remoteUrl
    } else {
        & git -C $Root remote add origin $remoteUrl
    }
}

function Push-WithToken {
    param(
        [string]$Root,
        [string]$Branch,
        [string]$Token
    )

    $authBytes = [System.Text.Encoding]::UTF8.GetBytes("x-access-token:$Token")
    $authHeader = [System.Convert]::ToBase64String($authBytes)
    & git -C $Root -c "http.https://github.com/.extraheader=AUTHORIZATION: basic $authHeader" push -u origin $Branch
}

$token = Get-GitHubToken -Root $ProjectRoot
$owner = Ensure-GitHubRepo -Token $token -RepoName $RepoName -Owner $Owner -SkipRepoCreate:$SkipRepoCreate

& powershell -ExecutionPolicy Bypass -File (Join-Path $ProjectRoot 'tools\sync-hosted-files.ps1') -ProjectRoot $ProjectRoot
Write-HostedModulesConfig -Root $ProjectRoot -Owner $owner -Repo $RepoName -Branch $Branch
Ensure-LocalGit -Root $ProjectRoot -Owner $owner -Repo $RepoName -Branch $Branch

if ($Push) {
    & git -C $ProjectRoot add -A
    & git -C $ProjectRoot diff --cached --quiet
    if ($LASTEXITCODE -ne 0) {
        & git -C $ProjectRoot commit -m 'chore: migrate hosting to public GitHub repo'
    }
    Push-WithToken -Root $ProjectRoot -Branch $Branch -Token $token
}

Write-Host "Setup complete for GitHub hosting: https://github.com/$owner/$RepoName"