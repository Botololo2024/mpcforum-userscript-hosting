// ==UserScript==
// @name         MPCForum SebusPL - ULTIMATE PACK (module loader)
// @namespace    http://tampermonkey.net/
// @version      50.40-loader.202604071701
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
        'https://raw.githubusercontent.com/Botololo2024/mpcforum-userscript-hosting/main/hosted/wrapper-start.js',
        'https://raw.githubusercontent.com/Botololo2024/mpcforum-userscript-hosting/main/hosted/modules/10-config-state.js',
        'https://raw.githubusercontent.com/Botololo2024/mpcforum-userscript-hosting/main/hosted/modules/20-mmo-storage-firebase.js',
        'https://raw.githubusercontent.com/Botololo2024/mpcforum-userscript-hosting/main/hosted/modules/30-radio-core.js',
        'https://raw.githubusercontent.com/Botololo2024/mpcforum-userscript-hosting/main/hosted/modules/40-shared-realtime.js',
        'https://raw.githubusercontent.com/Botololo2024/mpcforum-userscript-hosting/main/hosted/modules/50-dom-ui-foundation.js',
        'https://raw.githubusercontent.com/Botololo2024/mpcforum-userscript-hosting/main/hosted/modules/60-media-chat-tools.js',
        'https://raw.githubusercontent.com/Botololo2024/mpcforum-userscript-hosting/main/hosted/modules/70-watch-games-panels.js',
        'https://raw.githubusercontent.com/Botololo2024/mpcforum-userscript-hosting/main/hosted/modules/75-snejk.js',
        'https://raw.githubusercontent.com/Botololo2024/mpcforum-userscript-hosting/main/hosted/modules/76-room.js',
        'https://raw.githubusercontent.com/Botololo2024/mpcforum-userscript-hosting/main/hosted/modules/77-logo-badge.js',
        'https://raw.githubusercontent.com/Botololo2024/mpcforum-userscript-hosting/main/hosted/modules/78-liquid-nav.js',
        'https://raw.githubusercontent.com/Botololo2024/mpcforum-userscript-hosting/main/hosted/modules/80-baksy-mmo-advanced.js',
        'https://raw.githubusercontent.com/Botololo2024/mpcforum-userscript-hosting/main/hosted/modules/85-board-watch-gif.js',
        'https://raw.githubusercontent.com/Botololo2024/mpcforum-userscript-hosting/main/hosted/modules/90-bootstrap.js',
        'https://raw.githubusercontent.com/Botololo2024/mpcforum-userscript-hosting/main/hosted/wrapper-end.js'
    ];
    const MODULE_LABELS = [
        'wrapper-start.js',
        '10-config-state.js',
        '20-mmo-storage-firebase.js',
        '30-radio-core.js',
        '40-shared-realtime.js',
        '50-dom-ui-foundation.js',
        '60-media-chat-tools.js',
        '70-watch-games-panels.js',
        '75-snejk.js',
        '76-room.js',
        '77-logo-badge.js',
        '78-liquid-nav.js',
        '80-baksy-mmo-advanced.js',
        '85-board-watch-gif.js',
        '90-bootstrap.js',
        'wrapper-end.js'
    ];
    const APPEND_INLINE_WRAPPER_END = false;
    const WRAPPER_END_INLINE_CODE = '})();';

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
