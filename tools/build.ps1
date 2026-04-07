param(
    [string]$ProjectRoot = 'E:\mpcforum-userscript',
    [string]$BaseUrl = 'https://YOUR-CDN.example.com/mpcforum-userscript/src',
    [string]$HostedModulesConfig = '',
    [string]$VersionBase = '50.40'
)

$ErrorActionPreference = 'Stop'

$srcRoot = Join-Path $ProjectRoot 'src'
$modulesRoot = Join-Path $srcRoot 'modules'
$distRoot = Join-Path $ProjectRoot 'dist'
$mapPath = Join-Path $ProjectRoot 'config\module-map.json'

$headerPath = Join-Path $srcRoot 'userscript-header.txt'
$wrapperStartPath = Join-Path $srcRoot 'wrapper-start.js'
$wrapperEndPath = Join-Path $srcRoot 'wrapper-end.js'

foreach ($required in @($headerPath, $wrapperStartPath, $wrapperEndPath, $mapPath, $modulesRoot)) {
    if (-not (Test-Path $required)) {
        throw "Missing required path: $required"
    }
}

if (-not (Test-Path $distRoot)) {
    New-Item -ItemType Directory -Force -Path $distRoot | Out-Null
}

$map = Get-Content $mapPath -Raw -Encoding UTF8 | ConvertFrom-Json | Sort-Object order
$header = (Get-Content $headerPath -Raw -Encoding UTF8).TrimEnd()
$wrapperStart = (Get-Content $wrapperStartPath -Raw -Encoding UTF8).TrimEnd()
$wrapperEnd = (Get-Content $wrapperEndPath -Raw -Encoding UTF8).TrimEnd()

$versionStampUtc = (Get-Date).ToUniversalTime().ToString('yyyyMMddHHmm')
$loaderVersion = "$VersionBase-loader.$versionStampUtc"
$requireVersion = "$VersionBase-require.$versionStampUtc"

function Normalize-HostedUrl([string]$url) {
    $trimmed = [string]$url
    if ([string]::IsNullOrWhiteSpace($trimmed)) { return $trimmed }

    if ($trimmed -match '^https://gist\.github\.com/([^/]+)/([^/]+)/raw/(.+)$') {
        return "https://gist.githubusercontent.com/$($Matches[1])/$($Matches[2])/raw/$($Matches[3])"
    }

    return $trimmed
}

$bundleParts = New-Object System.Collections.Generic.List[string]
$bundleParts.Add($header)
$bundleParts.Add('')
$bundleParts.Add($wrapperStart)

foreach ($module in $map) {
    $modulePath = Join-Path $modulesRoot $module.file
    if (-not (Test-Path $modulePath)) {
        throw "Module file missing: $modulePath. Run split-source.ps1 first."
    }

    $content = (Get-Content $modulePath -Raw -Encoding UTF8).TrimEnd()
    $bundleParts.Add('')
    $bundleParts.Add($content)
}

$bundleParts.Add('')
$bundleParts.Add($wrapperEnd)

$bundleOutput = ($bundleParts -join "`r`n") + "`r`n"
$bundlePath = Join-Path $distRoot 'mpcforum-sebus-pack.user.js'
Set-Content -Path $bundlePath -Value $bundleOutput -Encoding UTF8

if (-not $HostedModulesConfig) {
    $defaultHostedConfig = Join-Path $ProjectRoot 'config\hosted-modules.json'
    if (Test-Path $defaultHostedConfig) {
        $HostedModulesConfig = $defaultHostedConfig
    }
}

$moduleUrls = @()
$appendInlineWrapperEnd = $false
if ($HostedModulesConfig) {
    if (-not (Test-Path $HostedModulesConfig)) {
        throw "Hosted modules config not found: $HostedModulesConfig"
    }

    $parsedModuleUrls = Get-Content $HostedModulesConfig -Raw -Encoding UTF8 | ConvertFrom-Json
    if ($parsedModuleUrls -is [System.Array]) {
        $moduleUrls = @($parsedModuleUrls)
    } elseif ($null -eq $parsedModuleUrls) {
        $moduleUrls = @()
    } else {
        $moduleUrls = @($parsedModuleUrls)
    }

    $moduleUrls = @($moduleUrls | ForEach-Object { Normalize-HostedUrl ([string]$_) })
    if (-not $moduleUrls.Count) {
        throw "Hosted modules config is empty: $HostedModulesConfig"
    }

    $expectedWithRemoteWrapperEnd = $map.Count + 2
    $expectedWithoutRemoteWrapperEnd = $map.Count + 1
    if ($moduleUrls.Count -eq $expectedWithoutRemoteWrapperEnd) {
        $appendInlineWrapperEnd = $true
    } elseif ($moduleUrls.Count -ne $expectedWithRemoteWrapperEnd) {
        throw "Hosted modules config must contain either $expectedWithoutRemoteWrapperEnd URLs (without wrapper-end) or $expectedWithRemoteWrapperEnd URLs (with wrapper-end). Found: $($moduleUrls.Count)"
    }
} else {
    $moduleUrls = @(
        "$BaseUrl/wrapper-start.js"
    )
    $moduleUrls += ($map | ForEach-Object { "$BaseUrl/modules/$($_.file)" })
    $moduleUrls += "$BaseUrl/wrapper-end.js"
}

$moduleJsArray = ($moduleUrls | ForEach-Object { "        '$_'" }) -join ",`r`n"
$moduleLabels = @('wrapper-start.js')
$moduleLabels += ($map | ForEach-Object { [string]$_.file })
if (-not $appendInlineWrapperEnd) {
    $moduleLabels += 'wrapper-end.js'
}
$moduleLabelsJsArray = ($moduleLabels | ForEach-Object { "        '$_'" }) -join ",`r`n"
$wrapperEndInlineForLoader = $wrapperEnd.Replace("`r`n", "`n").Replace("`r", "`n")
$wrapperEndInlineForLoader = $wrapperEndInlineForLoader.Replace('\\', '\\\\').Replace("'", "\\'")
$wrapperEndInlineForLoader = $wrapperEndInlineForLoader.Replace("`n", "\\n")
$appendInlineWrapperEndLiteral = if ($appendInlineWrapperEnd) { 'true' } else { 'false' }
$loaderScript = @"
// ==UserScript==
// @name         MPCForum SebusPL - ULTIMATE PACK (module loader)
// @namespace    http://tampermonkey.net/
// @version      $loaderVersion
// @description  Developer loader fetching userscript modules from hosting
// @author       Copilot
// @match        *://*.mpcforum.pl/*
// @grant        GM_xmlhttpRequest
// @connect      gist.githubusercontent.com
// @connect      gist.github.com
// @connect      raw.githubusercontent.com
// @connect      *
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    const MODULE_URLS = [
$moduleJsArray
    ];
    const MODULE_LABELS = [
$moduleLabelsJsArray
    ];
    const APPEND_INLINE_WRAPPER_END = $appendInlineWrapperEndLiteral;
    const WRAPPER_END_INLINE_CODE = '$wrapperEndInlineForLoader';

    function createOverlay() {
        const host = document.createElement('div');
        host.id = 'sebus-module-loader';
        host.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:2147483647;width:min(560px,calc(100vw - 32px));pointer-events:none;font:700 14px/1.15 Segoe UI,Arial,sans-serif;';
        host.innerHTML = '<div style="position:relative;height:26px;border-radius:26px;overflow:hidden;background:lightblue;box-shadow:0 10px 26px rgba(0,0,0,.24);"><style>#sebus-module-loader #sebus-loader-bar{animation:sebus-loader-fill 1.8s linear infinite;background-image:linear-gradient(90deg,orange 0%,#ffb347 45%,orange 100%)}@keyframes sebus-loader-fill{0%{filter:brightness(.96);background-position:0 0}100%{filter:brightness(1.06);background-position:120px 0}}</style><div id="sebus-loader-bar" style="position:absolute;inset:0 auto 0 0;width:0%;background-color:orange;background-repeat:repeat;transition:width .18s ease;"></div><div id="sebus-loader-status" style="position:relative;z-index:1;display:flex;align-items:center;justify-content:center;height:100%;padding:0 14px;color:#17324d;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 1px 0 rgba(255,255,255,.35);"></div></div>';
        const mount = () => {
            const parent = document.documentElement || document.body || document.head;
            if (parent && !host.isConnected) parent.appendChild(host);
        };
        mount();
        if (!host.isConnected) {
            document.addEventListener('DOMContentLoaded', mount, { once: true });
        }
        return host;
    }

    function setOverlayState(overlay, index, total, status, tone = 'normal') {
        const pct = total ? Math.max(0, Math.min(100, Math.round((index / total) * 100))) : 0;
        const statusEl = overlay.querySelector('#sebus-loader-status');
        const barEl = overlay.querySelector('#sebus-loader-bar');
        if (statusEl) statusEl.textContent = status;
        if (barEl) {
            barEl.style.width = pct + '%';
            barEl.style.background = tone === 'error'
                ? 'linear-gradient(90deg,#a92d2d,#ff6b6b)'
                : 'linear-gradient(90deg,orange 0%,#ffb347 45%,orange 100%)';
        }
        if (statusEl) {
            statusEl.style.color = tone === 'error' ? '#fff5f5' : '#17324d';
            statusEl.style.textShadow = tone === 'error' ? 'none' : '0 1px 0 rgba(255,255,255,.35)';
        }
    }

    function getModuleLabel(index) {
        return String(MODULE_LABELS[index] || ('modu\u0142-' + (index + 1))).trim();
    }

    function withNoCache(url) {
        const sep = url.includes('?') ? '&' : '?';
        return url + sep + '_tmts=' + Date.now();
    }

    function fetchViaGM(url) {
        return new Promise((resolve, reject) => {
            const reqUrl = withNoCache(url);
            GM_xmlhttpRequest({
                method: 'GET',
                url: reqUrl,
                nocache: true,
                timeout: 15000,
                onload: (response) => {
                    if (response.status >= 200 && response.status < 300) {
                        resolve(response.responseText || '');
                        return;
                    }
                    reject(new Error('GM HTTP ' + response.status + ' for ' + reqUrl));
                },
                onerror: (err) => reject(new Error('GM network error for ' + reqUrl + (err && err.error ? (' :: ' + err.error) : ''))),
                ontimeout: () => reject(new Error('GM timeout for ' + reqUrl))
            });
        });
    }

    async function fetchViaWindow(url) {
        const reqUrl = withNoCache(url);
        const res = await fetch(reqUrl, { method: 'GET', cache: 'no-store', credentials: 'omit' });
        if (!res.ok) throw new Error('FETCH HTTP ' + res.status + ' for ' + reqUrl);
        return await res.text();
    }

    function shouldUseWindowFetch(url) {
        try {
            const parsed = new URL(url);
            return parsed.hostname === 'gist.githubusercontent.com' || parsed.hostname === 'gist.github.com';
        } catch (_) {
            return false;
        }
    }

    async function fetchText(url) {
        if (shouldUseWindowFetch(url)) {
            return await fetchViaWindow(url);
        }

        try {
            if (typeof GM_xmlhttpRequest === 'function') {
                return await fetchViaGM(url);
            }
        } catch (gmError) {
            try { console.warn('[Sebu\u015b Loader] GM fetch failed, fallback to window.fetch:', gmError); } catch (_) {}
        }

        return await fetchViaWindow(url);
    }

    async function fetchTextWithRetry(url, attempts = 3) {
        let lastError = null;
        for (let tryNo = 1; tryNo <= attempts; tryNo += 1) {
            try {
                return await fetchText(url);
            } catch (err) {
                lastError = err;
                const waitMs = 300 * tryNo;
                await new Promise(r => setTimeout(r, waitMs));
            }
        }
        throw lastError || new Error('Unknown fetch error for ' + url);
    }

    async function main() {
        const overlay = createOverlay();
        const parts = [];
        try {
            for (let index = 0; index < MODULE_URLS.length; index += 1) {
                const url = MODULE_URLS[index];
                const label = getModuleLabel(index);
                setOverlayState(overlay, index, MODULE_URLS.length, '\u0141aduj\u0119 ' + (index + 1) + '/' + MODULE_URLS.length + ' - ' + label);
                const text = await fetchTextWithRetry(url, 3);
                parts.push(text.replace(/^\uFEFF/, ''));
            }

            setOverlayState(overlay, MODULE_URLS.length, MODULE_URLS.length, 'Uruchamiam ' + MODULE_URLS.length + '/' + MODULE_URLS.length + ' - gotowe');
            const code = parts.join('\n\n') + (APPEND_INLINE_WRAPPER_END ? ('\n' + WRAPPER_END_INLINE_CODE) : '');
            const script = document.createElement('script');
            script.textContent = code;
            (document.documentElement || document.head || document.body).appendChild(script);
            script.remove();

            setOverlayState(overlay, MODULE_URLS.length, MODULE_URLS.length, 'Za\u0142adowano ' + MODULE_URLS.length + '/' + MODULE_URLS.length + ' - gotowe');
            setTimeout(() => { if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 1100);
        } catch (error) {
            console.error('[Sebu\u015b Loader]', error);
            setOverlayState(overlay, 1, 1, 'B\u0142\u0105d loadera - sprawd\u017a konsol\u0119', 'error');
        }
    }

    main();
})();
"@

$loaderPath = Join-Path $distRoot 'mpcforum-loader.user.js'
Set-Content -Path $loaderPath -Value $loaderScript -Encoding UTF8

# Build @require variant (installs remote modules via Tampermonkey metadata)
$requireMetaLines = New-Object System.Collections.Generic.List[string]
$requireMetaLines.Add('// ==UserScript==')
$requireMetaLines.Add('// @name         MPCForum SebusPL - ULTIMATE PACK (@require loader)')
$requireMetaLines.Add('// @namespace    http://tampermonkey.net/')
$requireMetaLines.Add("// @version      $requireVersion")
$requireMetaLines.Add('// @description  Userscript based on @require (without runtime fetch)')
$requireMetaLines.Add('// @author       Copilot')
$requireMetaLines.Add('// @match        *://*.mpcforum.pl/*')
$requireMetaLines.Add('// @grant        none')

foreach ($url in $moduleUrls) {
    $requireMetaLines.Add("// @require      $url")
}

$requireMetaLines.Add('// ==/UserScript==')
$requireMetaLines.Add('')

$requireBody = @()
if ($appendInlineWrapperEnd) {
    $requireBody += $wrapperEnd
}

$requireOutput = (($requireMetaLines + $requireBody) -join "`r`n") + "`r`n"
$requirePath = Join-Path $distRoot 'mpcforum-require.user.js'
Set-Content -Path $requirePath -Value $requireOutput -Encoding UTF8

Write-Host "Built bundle: $bundlePath"
Write-Host "Built loader: $loaderPath"
Write-Host "Built @require script: $requirePath"
