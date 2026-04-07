// Module: 50-dom-ui-foundation.js
// Source: e:\mpcforum-userscript\skrypt:3526-6247
// Purpose: DOM helpers, style injection, sticky notes, settings and base UI

    /* ═══════════════════════════════════════════════════════════════════
       DJ VOTE QUEUE — helper (rozszerzenie radio)
       ═══════════════════════════════════════════════════════════════════ */
    async function voteRadioQueueItem(id, v) {
        const uid = String(getRuntimeUserId());
        const ok  = await firebaseWritePath(`${RADIO_QUEUE_PATH}/items/${id}/votes/${uid}`, v);
        if (ok) setTimeout(() => syncRadioQueue(), 300);
    }

    /* ═══════════════════════════════════════════════════════════════════
       CHAT HEADER (oryginał)
       ═══════════════════════════════════════════════════════════════════ */
    function findGlobalChatHeaderBar() {
        const nodes = document.querySelectorAll('div, li, header, section');
        for (const el of nodes) {
            const fullText = (el.textContent || '').replace(/\s+/g, ' ').trim();
            if (!/\bczat\b/i.test(fullText)) continue;

            const styles = window.getComputedStyle(el);
            const bgImage = styles.backgroundImage || '';
            const hasGlowHeader = bgImage.includes('title_glow') || bgImage.includes('url(');
            const hasExpectedShape = parseFloat(styles.borderRadius || '0') >= 8 && parseFloat(styles.paddingTop || '0') >= 10;
            const hasNoChatInput = !el.querySelector('input, textarea, [contenteditable="true"]');

            if (hasGlowHeader && hasExpectedShape && hasNoChatInput) return el;
        }

        const strictTitle = Array.from(nodes).find(el => {
            const text = (el.textContent || '').replace(/\s+/g, ' ').trim();
            const bgImage = window.getComputedStyle(el).backgroundImage || '';
            return /\bczat\b/i.test(text) && bgImage.includes('title_glow');
        });
        if (strictTitle) return strictTitle;

        return null;
    }

    function findBestVolumeAnchor() {
        const candidates = Array.from(document.querySelectorAll(
            'i[class*="fa-volume"], span[class*="fa-volume"], a[class*="fa-volume"], i[class*="icon-volume"], span[class*="icon-volume"], a[class*="icon-volume"], [aria-label*="Wycisz"], [aria-label*="Mute"], [title*="Wycisz"], [title*="Mute"]'
        ));

        const visibleCandidates = candidates.filter(el => {
            const rect = el.getBoundingClientRect();
            const isVisible = rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.right > 0 && rect.top < window.innerHeight && rect.left < window.innerWidth;
            return isVisible && el.offsetParent !== null;
        });

        if (!visibleCandidates.length) return null;

        const chatHeader = findGlobalChatHeaderBar();
        if (!chatHeader) return visibleCandidates[0];

        const headerRect = chatHeader.getBoundingClientRect();
        const headerCx = headerRect.left + headerRect.width / 2;
        const headerCy = headerRect.top + headerRect.height / 2;

        let best = null;
        let bestScore = Number.POSITIVE_INFINITY;

        visibleCandidates.forEach(el => {
            const rect = el.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = cx - headerCx;
            const dy = cy - headerCy;
            const distance = Math.hypot(dx, dy);
            const rowPenalty = Math.abs(cy - headerCy) * 2;
            const score = distance + rowPenalty;
            if (score < bestScore) {
                bestScore = score;
                best = el;
            }
        });

        return best;
    }

    let sebusSwalLoadPromise = null;
    let sebusSwalCssInjected = false;
    let sebusSwalThemeInjected = false;
    let sebusFallbackToastHost = null;

    function sebusInjectSwalCss() {
        if (sebusSwalCssInjected) return;
        sebusSwalCssInjected = true;
        const cssId = 'sebus-swal2-css';
        if (document.getElementById(cssId)) return;
        const link = document.createElement('link');
        link.id = cssId;
        link.rel = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css';
        (document.head || document.documentElement).appendChild(link);
    }

    function sebusInjectSwalTheme() {
        if (sebusSwalThemeInjected) return;
        sebusSwalThemeInjected = true;
        const styleId = 'sebus-swal2-theme';
        if (document.getElementById(styleId)) return;
        const themeStyle = document.createElement('style');
        themeStyle.id = styleId;
        themeStyle.textContent = '' +
            '.sebus-swal-popup{background:linear-gradient(180deg,rgba(17,16,23,.98),rgba(8,8,12,.98))!important;border:1px solid rgba(255,214,110,.45)!important;border-radius:14px!important;box-shadow:0 18px 48px rgba(0,0,0,.58)!important;color:#ffe7bc!important;}' +
            '.sebus-swal-title{color:#ffd95e!important;font-weight:800!important;letter-spacing:.4px;}' +
            '.sebus-swal-html{color:#f1e6cf!important;}' +
            '.sebus-swal-actions{gap:10px!important;}' +
            '.sebus-swal-confirm{background:linear-gradient(180deg,#ffd45c,#f0a81f)!important;color:#111!important;border:1px solid rgba(255,214,110,.9)!important;border-radius:10px!important;font-weight:800!important;}' +
            '.sebus-swal-cancel{background:linear-gradient(180deg,#27313e,#1a232f)!important;color:#c8d7ea!important;border:1px solid rgba(135,185,255,.5)!important;border-radius:10px!important;font-weight:700!important;}' +
            '.sebus-swal-toast{background:linear-gradient(180deg,rgba(20,23,30,.98),rgba(12,16,23,.98))!important;border:1px solid rgba(255,214,110,.35)!important;color:#e8eef7!important;}' +
            '.sebus-swal-toast-title{color:#ffe08d!important;font-weight:700!important;}' +
            '.sebus-fallback-overlay{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(4,6,10,.68);backdrop-filter:blur(6px);z-index:2147483647;}' +
            '.sebus-fallback-modal{width:min(440px,calc(100vw - 24px));background:linear-gradient(180deg,rgba(17,16,23,.98),rgba(8,8,12,.98));border:1px solid rgba(255,214,110,.45);border-radius:16px;box-shadow:0 18px 48px rgba(0,0,0,.58);color:#ffe7bc;padding:18px 18px 14px;display:flex;flex-direction:column;gap:12px;}' +
            '.sebus-fallback-modal[data-tone="success"]{border-color:rgba(80,220,120,.45);box-shadow:0 18px 48px rgba(0,0,0,.58),0 0 0 1px rgba(80,220,120,.12) inset;}' +
            '.sebus-fallback-modal[data-tone="error"]{border-color:rgba(255,117,135,.5);box-shadow:0 18px 48px rgba(0,0,0,.58),0 0 0 1px rgba(255,117,135,.12) inset;}' +
            '.sebus-fallback-modal[data-tone="warning"]{border-color:rgba(255,214,110,.55);}' +
            '.sebus-fallback-title{font-size:20px;line-height:1.2;font-weight:800;color:#ffd95e;letter-spacing:.4px;}' +
            '.sebus-fallback-text{font-size:14px;line-height:1.55;color:#f1e6cf;white-space:pre-wrap;word-break:break-word;}' +
            '.sebus-fallback-label{font-size:12px;font-weight:700;color:#ffe08d;display:block;margin-bottom:6px;}' +
            '.sebus-fallback-input{width:100%;height:42px;border-radius:10px;border:1px solid rgba(255,214,110,.24);background:rgba(255,255,255,.06);color:#ffe7bc;padding:0 12px;font-size:14px;outline:none;box-sizing:border-box;}' +
            '.sebus-fallback-input:focus{border-color:rgba(88,216,255,.6);box-shadow:0 0 0 3px rgba(88,216,255,.12);}' +
            '.sebus-fallback-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:4px;}' +
            '.sebus-fallback-btn{min-width:104px;height:40px;border-radius:10px;border:1px solid rgba(255,214,110,.3);cursor:pointer;font-weight:800;font-size:14px;transition:transform .12s ease,filter .12s ease,box-shadow .12s ease;}' +
            '.sebus-fallback-btn:hover{filter:brightness(1.06);transform:translateY(-1px);}' +
            '.sebus-fallback-btn-confirm{background:linear-gradient(180deg,#ffd45c,#f0a81f);color:#111;border-color:rgba(255,214,110,.9);box-shadow:0 8px 18px rgba(240,168,31,.22);}' +
            '.sebus-fallback-btn-cancel{background:linear-gradient(180deg,#27313e,#1a232f);color:#c8d7ea;border-color:rgba(135,185,255,.5);}' +
            '.sebus-fallback-toast-host{position:fixed;top:16px;right:16px;display:flex;flex-direction:column;gap:10px;z-index:2147483647;pointer-events:none;}' +
            '.sebus-fallback-toast{min-width:240px;max-width:min(360px,calc(100vw - 24px));padding:12px 14px;border-radius:12px;background:linear-gradient(180deg,rgba(20,23,30,.98),rgba(12,16,23,.98));border:1px solid rgba(255,214,110,.35);color:#e8eef7;box-shadow:0 12px 30px rgba(0,0,0,.38);font-size:13px;line-height:1.4;pointer-events:auto;opacity:0;transform:translateY(-6px);transition:opacity .16s ease,transform .16s ease;}' +
            '.sebus-fallback-toast.show{opacity:1;transform:translateY(0);}' +
            '.sebus-fallback-toast[data-tone="success"]{border-color:rgba(80,220,120,.45);}' +
            '.sebus-fallback-toast[data-tone="error"]{border-color:rgba(255,117,135,.5);}' +
            '.sebus-fallback-toast[data-tone="warning"]{border-color:rgba(255,214,110,.55);}';
        (document.head || document.documentElement).appendChild(themeStyle);
    }

    function sebusGetFallbackText(options) {
        if (options && options.htmlText !== undefined && options.htmlText !== null) return String(options.htmlText);
        if (options && options.text !== undefined && options.text !== null) return String(options.text);
        if (options && options.html !== undefined && options.html !== null) {
            const temp = document.createElement('div');
            temp.innerHTML = String(options.html);
            return String(temp.textContent || temp.innerText || '').trim();
        }
        return '';
    }

    function sebusEnsureToastHost() {
        if (sebusFallbackToastHost && sebusFallbackToastHost.isConnected) return sebusFallbackToastHost;
        sebusInjectSwalTheme();
        const host = document.createElement('div');
        host.className = 'sebus-fallback-toast-host';
        (document.body || document.documentElement).appendChild(host);
        sebusFallbackToastHost = host;
        return host;
    }

    function sebusShowFallbackToast(message, type = 'info', options = {}) {
        if (!message) return Promise.resolve({ isDismissed: true, isFallback: true });
        const host = sebusEnsureToastHost();
        const toast = document.createElement('div');
        toast.className = 'sebus-fallback-toast';
        toast.dataset.tone = String(type || 'info');
        toast.textContent = String(message || '');
        host.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add('show'));

        return new Promise((resolve) => {
            const timer = Number(options.timer) > 0 ? Number(options.timer) : 2200;
            const cleanup = () => {
                toast.classList.remove('show');
                setTimeout(() => {
                    if (toast.parentNode) toast.parentNode.removeChild(toast);
                    if (host && host.childElementCount === 0 && host.parentNode) host.parentNode.removeChild(host);
                    if (sebusFallbackToastHost === host && !host.isConnected) sebusFallbackToastHost = null;
                    resolve({ isDismissed: true, isFallback: true });
                }, 180);
            };
            setTimeout(cleanup, timer);
        });
    }

    function sebusShowFallbackModal(config = {}) {
        sebusInjectSwalTheme();

        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = 'sebus-fallback-overlay';

            const modal = document.createElement('div');
            modal.className = 'sebus-fallback-modal';
            modal.dataset.tone = String(config.type || 'info');
            overlay.appendChild(modal);

            if (config.title) {
                const titleEl = document.createElement('div');
                titleEl.className = 'sebus-fallback-title';
                titleEl.textContent = String(config.title || '');
                modal.appendChild(titleEl);
            }

            const bodyText = sebusGetFallbackText(config);
            if (bodyText) {
                const textEl = document.createElement('div');
                textEl.className = 'sebus-fallback-text';
                textEl.textContent = bodyText;
                modal.appendChild(textEl);
            }

            let inputEl = null;
            if (config.input) {
                const fieldWrap = document.createElement('div');
                if (config.inputLabel) {
                    const labelEl = document.createElement('label');
                    labelEl.className = 'sebus-fallback-label';
                    labelEl.textContent = String(config.inputLabel || '');
                    fieldWrap.appendChild(labelEl);
                }
                inputEl = config.input === 'textarea' ? document.createElement('textarea') : document.createElement('input');
                inputEl.className = 'sebus-fallback-input';
                if (config.input !== 'textarea') inputEl.type = config.input === 'password' ? 'password' : 'text';
                inputEl.placeholder = String(config.inputPlaceholder || '');
                inputEl.value = String(config.inputValue || '');
                if (config.input === 'textarea') {
                    inputEl.style.minHeight = '110px';
                    inputEl.style.padding = '10px 12px';
                    inputEl.style.resize = 'vertical';
                }
                fieldWrap.appendChild(inputEl);
                modal.appendChild(fieldWrap);
            }

            const actions = document.createElement('div');
            actions.className = 'sebus-fallback-actions';

            const confirmBtn = document.createElement('button');
            confirmBtn.type = 'button';
            confirmBtn.className = 'sebus-fallback-btn sebus-fallback-btn-confirm';
            confirmBtn.textContent = String(config.confirmButtonText || 'OK');
            actions.appendChild(confirmBtn);

            let cancelBtn = null;
            if (config.showCancelButton) {
                cancelBtn = document.createElement('button');
                cancelBtn.type = 'button';
                cancelBtn.className = 'sebus-fallback-btn sebus-fallback-btn-cancel';
                cancelBtn.textContent = String(config.cancelButtonText || 'Anuluj');
                if (config.reverseButtons) actions.appendChild(cancelBtn);
                else actions.insertBefore(cancelBtn, confirmBtn);
            }

            modal.appendChild(actions);
            (document.body || document.documentElement).appendChild(overlay);

            const previousOverflow = document.body ? document.body.style.overflow : '';
            if (document.body) document.body.style.overflow = 'hidden';

            const finish = (result) => {
                document.removeEventListener('keydown', onKeyDown, true);
                if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
                if (document.body) document.body.style.overflow = previousOverflow;
                resolve(Object.assign({ isFallback: true }, result || {}));
            };

            const readValue = () => {
                if (!inputEl) return undefined;
                const rawValue = inputEl.value;
                return config.inputAutoTrim === false ? rawValue : String(rawValue || '').trim();
            };

            const onConfirm = () => finish({ isConfirmed: true, value: readValue() });
            const onCancel = () => finish({ isConfirmed: false, isDismissed: true, dismiss: 'cancel' });
            const onKeyDown = (event) => {
                if (event.key === 'Escape') {
                    event.preventDefault();
                    onCancel();
                    return;
                }
                if (event.key === 'Enter' && (!inputEl || config.input !== 'textarea' || event.ctrlKey)) {
                    event.preventDefault();
                    onConfirm();
                }
            };

            confirmBtn.addEventListener('click', onConfirm);
            if (cancelBtn) cancelBtn.addEventListener('click', onCancel);
            overlay.addEventListener('click', (event) => {
                if (event.target === overlay) onCancel();
            });
            document.addEventListener('keydown', onKeyDown, true);

            setTimeout(() => {
                if (inputEl) {
                    inputEl.focus();
                    try { inputEl.select(); } catch (_) {}
                } else {
                    confirmBtn.focus();
                }
            }, 0);
        });
    }

    function sebusLoadScript(url) {
        return new Promise((resolve, reject) => {
            const el = document.createElement('script');
            el.src = url;
            el.async = true;
            el.onload = () => resolve();
            el.onerror = () => reject(new Error('Nie udało się załadować: ' + url));
            (document.head || document.documentElement).appendChild(el);
        });
    }

    async function sebusEnsureSwal() {
        if (window.Swal) {
            sebusInjectSwalTheme();
            return window.Swal;
        }
        if (sebusSwalLoadPromise) return sebusSwalLoadPromise;

        sebusSwalLoadPromise = (async () => {
            sebusInjectSwalCss();
            const sources = [
                'https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.all.min.js',
                'https://unpkg.com/sweetalert2@11/dist/sweetalert2.all.min.js'
            ];

            let lastError = null;
            for (const src of sources) {
                try {
                    await sebusLoadScript(src);
                    if (window.Swal) {
                        sebusInjectSwalTheme();
                        return window.Swal;
                    }
                } catch (error) {
                    lastError = error;
                }
            }

            throw lastError || new Error('SweetAlert2 jest niedostępny.');
        })();

        try {
            return await sebusSwalLoadPromise;
        } catch (error) {
            sebusSwalLoadPromise = null;
            try { console.warn('[Sebuś UI] SweetAlert2 niedostępny, używam lokalnego modala.', error); } catch (_) {}
            return null;
        }
    }

    async function sebusUiAlert(title, text = '', type = 'info', options = {}) {
        const swal = await sebusEnsureSwal();
        if (!swal) {
            return await sebusShowFallbackModal({
                title: String(title || ''),
                text: String(text || ''),
                type,
                confirmButtonText: String((options && options.confirmButtonText) || 'OK')
            });
        }

        return await swal.fire(Object.assign({
            title: String(title || ''),
            text: String(text || ''),
            icon: type,
            theme: 'dark',
            customClass: {
                popup: 'sebus-swal-popup',
                title: 'sebus-swal-title',
                htmlContainer: 'sebus-swal-html',
                actions: 'sebus-swal-actions',
                confirmButton: 'sebus-swal-confirm',
                cancelButton: 'sebus-swal-cancel'
            },
            confirmButtonText: 'OK'
        }, options || {}));
    }

    async function sebusUiNotify(message, type = 'info', options = {}) {
        const swal = await sebusEnsureSwal();
        if (!swal) return await sebusShowFallbackToast(String(message || ''), type, options || {});
        return await swal.fire(Object.assign({
            toast: true,
            position: 'top-end',
            icon: type,
            title: String(message || ''),
            showConfirmButton: false,
            timer: 2200,
            timerProgressBar: true,
            customClass: {
                popup: 'sebus-swal-toast',
                title: 'sebus-swal-toast-title'
            },
            didOpen: (toast) => {
                toast.onmouseenter = swal.stopTimer;
                toast.onmouseleave = swal.resumeTimer;
            }
        }, options || {}));
    }

    async function sebusUiConfirm(config = {}) {
        const cfg = Object.assign({
            title: 'Potwierdzenie',
            text: '',
            type: 'question',
            confirmText: 'Tak',
            cancelText: 'Anuluj'
        }, config || {});
        const swal = await sebusEnsureSwal();
        if (!swal) {
            const fallbackResult = await sebusShowFallbackModal({
                title: String(cfg.title || ''),
                text: String(cfg.text || ''),
                type: cfg.type,
                showCancelButton: true,
                confirmButtonText: String(cfg.confirmText || 'Tak'),
                cancelButtonText: String(cfg.cancelText || 'Anuluj'),
                reverseButtons: true
            });
            return Boolean(fallbackResult && fallbackResult.isConfirmed);
        }

        const result = await swal.fire({
            title: String(cfg.title || ''),
            text: String(cfg.text || ''),
            icon: cfg.type,
            showCancelButton: true,
            confirmButtonText: String(cfg.confirmText || 'Tak'),
            cancelButtonText: String(cfg.cancelText || 'Anuluj'),
            reverseButtons: true,
            theme: 'dark',
            customClass: {
                popup: 'sebus-swal-popup',
                title: 'sebus-swal-title',
                htmlContainer: 'sebus-swal-html',
                actions: 'sebus-swal-actions',
                confirmButton: 'sebus-swal-confirm',
                cancelButton: 'sebus-swal-cancel'
            }
        });
        return Boolean(result && result.isConfirmed);
    }

    async function sebusUiPrompt(config = {}) {
        const cfg = Object.assign({
            title: 'Wprowadź wartość',
            text: '',
            inputLabel: '',
            placeholder: '',
            value: '',
            input: 'text',
            confirmText: 'OK',
            cancelText: 'Anuluj'
        }, config || {});

        const swal = await sebusEnsureSwal();
        if (!swal) {
            const fallbackResult = await sebusShowFallbackModal({
                title: String(cfg.title || ''),
                text: String(cfg.text || ''),
                type: 'question',
                input: cfg.input,
                inputLabel: String(cfg.inputLabel || ''),
                inputPlaceholder: String(cfg.placeholder || ''),
                inputValue: String(cfg.value || ''),
                showCancelButton: true,
                confirmButtonText: String(cfg.confirmText || 'OK'),
                cancelButtonText: String(cfg.cancelText || 'Anuluj'),
                reverseButtons: true,
                inputAutoTrim: true
            });
            if (!fallbackResult || !fallbackResult.isConfirmed) return null;
            if (fallbackResult.value === undefined || fallbackResult.value === null) return null;
            return String(fallbackResult.value).trim();
        }

        const result = await swal.fire({
            title: String(cfg.title || ''),
            text: String(cfg.text || ''),
            input: cfg.input,
            inputLabel: String(cfg.inputLabel || ''),
            inputPlaceholder: String(cfg.placeholder || ''),
            inputValue: String(cfg.value || ''),
            showCancelButton: true,
            confirmButtonText: String(cfg.confirmText || 'OK'),
            cancelButtonText: String(cfg.cancelText || 'Anuluj'),
            reverseButtons: true,
            inputAutoTrim: true,
            theme: 'dark',
            customClass: {
                popup: 'sebus-swal-popup',
                title: 'sebus-swal-title',
                htmlContainer: 'sebus-swal-html',
                actions: 'sebus-swal-actions',
                confirmButton: 'sebus-swal-confirm',
                cancelButton: 'sebus-swal-cancel'
            }
        });

        if (!result || !result.isConfirmed) return null;
        if (result.value === undefined || result.value === null) return null;
        return String(result.value).trim();
    }

    const style = document.createElement('style');
    style.innerHTML = `
        .sebus-neon { color: #FFD700 !important; font-weight: 900 !important; text-shadow: 0 0 10px #FFD700 !important; animation: sebus-gold-pulse 1.5s infinite alternate !important; display: inline !important; }
        .sebus-gold-legend { color: #FFD700 !important; font-weight: 900 !important; text-shadow: 0 0 12px #FFD700, 0 0 6px #FFA500 !important; filter: brightness(1.25) !important; }
        .sebus-avatar-glow { box-shadow: 0 0 0 3px #FFD700, 0 0 20px #FFA500 !important; border: 1px solid #FFD700 !important; transition: 0.3s; position: relative !important; z-index: 10 !important; }
        @keyframes sebus-gold-pulse { from { filter: brightness(1); } to { filter: brightness(1.5); } }

        .sebus-stats-wrap { background: #111 !important; border: 1px solid #FFD700 !important; padding: 4px 10px !important; color: #FFD700 !important; font-size: 10px !important; display: inline-flex !important; gap: 12px !important; text-transform: uppercase !important; font-weight: bold !important; border-radius: 3px !important; margin: 10px 0 5px 0 !important; width: fit-content; clear: both !important; }
        .sebus-stats-wrap b { color: #fff !important; }

        .sebus-popup { display:none; position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); width:350px; height:450px; background:#222; border:1px solid #FFD700; border-radius:8px; box-shadow:0 10px 40px rgba(0,0,0,0.9); z-index:2147483647; padding:10px; flex-direction:column; }
        .sebus-popup.show { display:flex; }
        .sebus-popup input { width:100%; padding:8px; margin-bottom:10px; border:1px solid #555; background:#111; color:#FFD700; border-radius:4px; box-sizing:border-box; outline:none; font-weight: bold; }
        .sebus-popup-results { flex-grow:1; overflow-y:auto; gap:5px; align-content: start; }

        #gif-results { display:grid; grid-template-columns:1fr 1fr 1fr; gap:4px; }
        .gif-item { width:100%; height:90px; object-fit:cover; cursor:pointer; border-radius:4px; transition:0.15s; border:2px solid transparent; }
        .gif-item:hover { transform:scale(1.04); border-color:#FFD700; }
        .sebus-gif-picker { flex-direction:column; min-width:320px; max-width:380px; padding:10px; }
        .sebus-gif-header { display:flex; flex-direction:column; gap:6px; margin-bottom:6px; }
        .sebus-gif-sources { display:flex; gap:4px; }
        .sebus-gif-src-btn { background:#1e1e1e; color:#aaa; border:1px solid #444; border-radius:4px; padding:3px 8px; font-size:10px; cursor:pointer; transition:.15s; }
        .sebus-gif-src-btn.active,.sebus-gif-src-btn:hover { background:#FFD700; color:#000; border-color:#FFD700; }
        .sebus-gif-tabs { display:flex; gap:4px; margin-bottom:8px; }
        .sebus-gif-tab { background:#1e1e1e; color:#aaa; border:1px solid #333; border-radius:4px; padding:4px 10px; font-size:10px; cursor:pointer; flex:1; transition:.15s; }
        .sebus-gif-tab.active { background:#333; color:#FFD700; border-color:#FFD700; }
        .sebus-gif-grid { min-height:180px; }
        .sebus-gif-status { font-size:10px; color:#888; text-align:center; margin-top:4px; min-height:14px; }
        .sebus-gif-recent-label { grid-column:1/-1; font-size:9px; color:#888; padding:2px 0; }

        #mp3-results { display:flex; flex-direction:column; }
        .mp3-item { background: #333; color: #FFD700; border: 1px solid #555; padding: 10px; border-radius: 4px; cursor: pointer; text-align: center; font-weight: bold; transition: 0.2s; margin-bottom: 5px; font-size: 12px; }
        .mp3-item:hover { background: #FFD700; color: #000; border-color: #FFD700; }

        .sebus-chat-btn {
            cursor: pointer; font-size: 11px; color: #FFD700 !important; font-weight: bold;
            padding: 0 6px; border: 1px solid #FFD700; border-radius: 4px; background: #1e1e1e;
            height: 22px; display: inline-flex; align-items: center; justify-content: center;
            transition: 0.2s; text-decoration: none !important; position: absolute !important;
            top: 50% !important; transform: translateY(-50%) !important; z-index: 50 !important;
        }
        .sebus-chat-btn:hover { background: #FFD700; color: #000 !important; }
        #open-gif-btn { right: 95px !important; }
        #open-mp3-btn { right: 135px !important; }

        .sebus-pin-msg-btn {
            background: none; border: none; color: #aaa; cursor: pointer;
            padding: 2px 4px; margin: 0 2px; border-radius: 3px; font-size: 12px;
            transition: 0.2s; display: inline-flex; align-items: center; justify-content: center;
            height: 20px; opacity: 0.5;
        }

        .sebus-pin-msg-btn:hover {
            opacity: 1; color: #FFD700;
        }

        .sebus-life-active {
            color: #7CFF8A !important;
            font-weight: 700 !important;
            text-shadow: 0 0 8px rgba(124, 255, 138, 0.85);
        }
        .sebus-life-active::before {
            content: '🟢 ';
            font-size: 10px;
        }
        .sebus-life-idle {
            color: #ffd36a !important;
            opacity: 0.85;
        }
        .sebus-life-idle::before {
            content: '🟡 ';
            font-size: 10px;
        }
        .sebus-life-ghost {
            opacity: 0.45 !important;
            filter: grayscale(0.4);
        }
        .sebus-life-ghost::before {
            content: '⚫ ';
            font-size: 10px;
        }
        .sebus-life-hidden {
            display: none !important;
        }

        .sebus-ghost-hidden {
            display: none !important;
        }

        body.sebus-ghost-curtain-on .ipsLayout_sidebar,
        body.sebus-ghost-curtain-on .ipsLayout_sidebarright,
        body.sebus-ghost-curtain-on aside.ipsLayout_sidebar {
            display: none !important;
        }
        body.sebus-ghost-curtain-on .ipsLayout_container,
        body.sebus-ghost-curtain-on .ipsLayout_container.ipsClearfix {
            max-width: 98vw !important;
            width: 98vw !important;
        }
        body.sebus-ghost-curtain-on .ipsLayout_content {
            width: 100% !important;
            max-width: 100% !important;
            float: none !important;
            flex: 1 1 100% !important;
        }
        body.sebus-ghost-curtain-l2 .ipsBreadcrumb,
        body.sebus-ghost-curtain-l2 .ipsPageHeader,
        body.sebus-ghost-curtain-l2 .ipsPagination {
            display: none !important;
        }
        body.sebus-ghost-curtain-l3 #ipsLayout_header,
        body.sebus-ghost-curtain-l3 #ipsLayout_footer,
        body.sebus-ghost-curtain-l3 .ipsBreadcrumb,
        body.sebus-ghost-curtain-l3 .ipsPageHeader,
        body.sebus-ghost-curtain-l3 .ipsPagination,
        body.sebus-ghost-curtain-l3 .ipsResponsive_showDesktop.ipsResponsive_block {
            display: none !important;
        }
        body.sebus-ghost-curtain-l3 .ipsLayout_container,
        body.sebus-ghost-curtain-l3 .ipsLayout_container.ipsClearfix,
        body.sebus-ghost-curtain-l3 #ipsLayout_body,
        body.sebus-ghost-curtain-l3 .ipsLayout_content {
            width: 100vw !important;
            max-width: 100vw !important;
            margin: 0 !important;
            padding-left: 8px !important;
            padding-right: 8px !important;
        }
        body.sebus-ghost-curtain-l3,
        body.sebus-ghost-curtain-l3 #ipsLayout_body,
        body.sebus-ghost-curtain-l3 .ipsLayout_container,
        body.sebus-ghost-curtain-l3 .ipsLayout_content,
        body.sebus-ghost-curtain-l3 .ipsBox,
        body.sebus-ghost-curtain-l3 .ipsAreaBackground,
        body.sebus-ghost-curtain-l3 .ipsPad,
        body.sebus-ghost-curtain-l3 .ipsWidget,
        body.sebus-ghost-curtain-l3 .cForumRow,
        body.sebus-ghost-curtain-l3 .ipsDataItem,
        body.sebus-ghost-curtain-l3 .ipsPageHeader,
        body.sebus-ghost-curtain-l3 .ipsButton,
        body.sebus-ghost-curtain-l3 .ipsButton_primary,
        body.sebus-ghost-curtain-l3 .ipsButton_light,
        body.sebus-ghost-curtain-l3 .ipsMenu,
        body.sebus-ghost-curtain-l3 .ipsNavBar_primary,
        body.sebus-ghost-curtain-l3 .ipsToolList,
        body.sebus-ghost-curtain-l3 .ipsPagination,
        body.sebus-ghost-curtain-l3 .ipsComment,
        body.sebus-ghost-curtain-l3 .ipsComment_content,
        body.sebus-ghost-curtain-l3 .ipsComposeArea {
            background: #ffffff !important;
            background-image: none !important;
            color: #111111 !important;
            border-color: #cfcfcf !important;
            box-shadow: none !important;
            text-shadow: none !important;
            filter: none !important;
        }
        body.sebus-ghost-curtain-l3,
        body.sebus-ghost-curtain-l3 * {
            background-image: none !important;
        }
        body.sebus-ghost-curtain-l3 a,
        body.sebus-ghost-curtain-l3 span,
        body.sebus-ghost-curtain-l3 strong,
        body.sebus-ghost-curtain-l3 b,
        body.sebus-ghost-curtain-l3 p,
        body.sebus-ghost-curtain-l3 li,
        body.sebus-ghost-curtain-l3 h1,
        body.sebus-ghost-curtain-l3 h2,
        body.sebus-ghost-curtain-l3 h3,
        body.sebus-ghost-curtain-l3 h4,
        body.sebus-ghost-curtain-l3 h5,
        body.sebus-ghost-curtain-l3 h6,
        body.sebus-ghost-curtain-l3 div {
            color: #111111 !important;
            text-shadow: none !important;
        }
        body.sebus-ghost-curtain-l3 a {
            color: #000000 !important;
            text-decoration: underline !important;
        }
        body.sebus-ghost-curtain-l3 img:not(.ipsUserPhoto):not(.sebus-avatar-glow),
        body.sebus-ghost-curtain-l3 svg,
        body.sebus-ghost-curtain-l3 canvas,
        body.sebus-ghost-curtain-l3 video {
            filter: grayscale(1) contrast(1.05) !important;
        }
        body.sebus-ghost-curtain-l3 #chatboxWrap,
        body.sebus-ghost-curtain-l3 #chatcontent,
        body.sebus-ghost-curtain-l3 #chatcontent li.chat_row,
        body.sebus-ghost-curtain-l3 .sebus-pinned-container-chat,
        body.sebus-ghost-curtain-l3 #sebus-settings-panel,
        body.sebus-ghost-curtain-l3 .ck-editor,
        body.sebus-ghost-curtain-l3 .ck-editor__editable,
        body.sebus-ghost-curtain-l3 [contenteditable="true"],
        body.sebus-ghost-curtain-l3 input,
        body.sebus-ghost-curtain-l3 textarea {
            background: #ffffff !important;
            color: #000000 !important;
            border-color: #bdbdbd !important;
            box-shadow: none !important;
        }
        body.sebus-ghost-curtain-l3 .sebus-neon,
        body.sebus-ghost-curtain-l3 .sebus-gold-legend,
        body.sebus-ghost-curtain-l3 .sebus-chat-btn,
        body.sebus-ghost-curtain-l3 .sebus-mini-radio,
        body.sebus-ghost-curtain-l3 .sebus-sticky-note,
        body.sebus-ghost-curtain-l3 .sebus-stats-wrap {
            background: #ffffff !important;
            color: #000000 !important;
            border-color: #111111 !important;
            text-shadow: none !important;
            box-shadow: none !important;
            filter: none !important;
        }

        .sebus-life-summary {
            margin-top: 6px;
            padding: 4px 6px;
            border: 1px solid rgba(124, 255, 138, 0.35);
            border-radius: 6px;
            font-size: 10px;
            color: #bfffc6;
            background: rgba(40, 80, 45, 0.18);
            line-height: 1.35;
        }

        .sebus-audio-player { height: 30px; display: block; border-radius: 4px; outline: none; margin: 2px 0; }

        .sebus-mini-radio {
            position: relative;
            display: inline-flex; align-items: center; gap: 4px;
            padding: 2px 6px; margin-right: 6px;
            border: 1px solid rgba(255, 215, 0, 0.65); border-radius: 999px;
            background: rgba(0, 0, 0, 0.35); backdrop-filter: blur(2px);
        }
        .sebus-mini-radio.sebus-mini-radio-fallback { margin: 8px 0 0 0; width: fit-content; }
        .sebus-mini-radio.sebus-mini-radio-inline { position: static; transform: none; margin: 0 8px 0 0; }
        .sebus-mini-radio.sebus-mini-radio-floating { position: fixed; margin: 0; z-index: 2147483646; }
        .sebus-mini-radio.sebus-mini-radio-right { position: absolute; top: 12px; right: 34px; margin: 0; z-index: 90; }
        .sebus-mini-radio.sebus-mini-radio-header { position: absolute; right: 40px; top: 50%; transform: translateY(-50%); margin: 0; padding: 1px 5px; z-index: 95; }
        .sebus-mini-radio.sebus-mini-radio-header-right { position: absolute; right: 40px; top: 50%; transform: translateY(-50%); margin: 0; z-index: 95; }
        .sebus-mini-radio select,
        .sebus-mini-radio button {
            height: 18px; border-radius: 4px; border: 1px solid #555;
            background: rgba(17, 17, 17, 0.85); color: #FFD700; font-size: 10px;
        }
        .sebus-mini-radio select { min-width: 120px; max-width: 160px; padding: 0 4px; }
        .sebus-mini-radio button { width: 20px; cursor: pointer; font-weight: bold; padding: 0; }
        #sebus-radio-volume-btn { width: 42px; font-size: 9px; }
        #sebus-radio-station-btn { width: 36px; font-size: 9px; }
        .sebus-mini-radio button:hover { background: #FFD700; color: #000; border-color: #FFD700; }
        .sebus-radio-station-menu {
            display: none; position: absolute; right: 0; top: calc(100% + 4px);
            min-width: 118px; background: rgba(12, 12, 12, 0.97); border: 1px solid #FFD700;
            border-radius: 8px; padding: 4px; z-index: 2147483647;
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5);
        }
        .sebus-radio-station-menu.show { display: flex; flex-direction: column; gap: 3px; }
        .sebus-radio-station-item {
            border: 1px solid #555; background: #111; color: #FFD700; border-radius: 5px;
            font-size: 10px; height: 22px; cursor: pointer;
        }
        .sebus-radio-station-item:hover { background: #FFD700; color: #000; border-color: #FFD700; }

        /* ── NOWY RADIO PLAYER ─────────────────────────────────── */
        #sebus-radio-player {
            position: fixed;
            width: 340px;
            z-index: 2147483646;
            border-radius: 14px;
            border: 1px solid rgba(255, 215, 0, 0.6);
            background: linear-gradient(180deg, rgba(22,18,12,.98), rgba(10,10,10,.98));
            box-shadow: 0 12px 32px rgba(0,0,0,.65), 0 0 0 1px rgba(255,214,110,.12) inset;
            backdrop-filter: blur(6px);
            color: #ffe8b7;
            font-family: inherit;
            font-size: 11px;
            display: none;
        }
        #sebus-radio-player.show { display: block; }
        .sebus-rp-header {
            display: flex; align-items: center; justify-content: space-between;
            padding: 7px 10px 5px; border-bottom: 1px solid rgba(255,214,110,.18);
            gap: 6px;
        }
        .sebus-rp-title {
            font-size: 10px; font-weight: 700; color: #ffd700; letter-spacing: .3px;
            text-transform: uppercase;
        }
        .sebus-rp-badge {
            font-size: 9px; padding: 1px 6px; border-radius: 99px;
            border: 1px solid rgba(255,214,110,.3);
            color: #ffe9b4; background: rgba(255,214,110,.08);
            white-space: nowrap;
        }
        .sebus-rp-close {
            background: none; border: none; color: #888; cursor: pointer;
            font-size: 14px; padding: 0 2px; line-height: 1;
        }
        .sebus-rp-close:hover { color: #ffd700; }
        .sebus-rp-now {
            padding: 7px 10px 5px;
            border-bottom: 1px solid rgba(255,214,110,.12);
        }
        .sebus-rp-now-label {
            font-size: 9px; color: rgba(255,232,183,.5); text-transform: uppercase;
            letter-spacing: .4px; margin-bottom: 3px;
        }
        .sebus-rp-now-title {
            font-size: 12px; font-weight: 700; color: #ffe9c0;
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
            max-width: 100%;
        }
        .sebus-rp-now-meta {
            font-size: 9px; color: rgba(255,232,183,.5); margin-top: 2px;
        }
        .sebus-rp-yt-wrap {
            position: fixed; left: -9999px; top: -9999px;
            width: 1px; height: 1px; overflow: hidden; pointer-events: none;
        }
        .sebus-rp-yt-wrap iframe {
            width: 1px; height: 1px; display: block; border: none;
        }
        .sebus-rp-controls {
            display: flex; align-items: center; gap: 6px;
            padding: 5px 10px 7px;
        }
        .sebus-rp-btn {
            height: 26px; min-width: 26px; border-radius: 6px;
            border: 1px solid rgba(255,215,0,.4);
            background: rgba(255,215,0,.06);
            color: #ffd700; font-size: 11px; cursor: pointer;
            padding: 0 6px; transition: .15s;
        }
        .sebus-rp-btn:hover { background: #ffd700; color: #000; border-color: #ffd700; }
        .sebus-rp-btn:disabled { opacity: .35; cursor: default; }
        .sebus-rp-activate-wrap {
            padding: 0 10px 8px;
        }
        .sebus-rp-activate {
            width: 100%;
            height: 28px;
            border-radius: 8px;
            border: 1px solid rgba(80,220,120,.45);
            background: linear-gradient(180deg, rgba(80,220,120,.18), rgba(20,80,40,.22));
            color: #baffc9;
            font-size: 10px;
            font-weight: 700;
            cursor: pointer;
            letter-spacing: .2px;
        }
        .sebus-rp-activate.ready {
            border-color: rgba(255,214,110,.25);
            background: rgba(255,214,110,.06);
            color: rgba(255,232,183,.72);
        }
        .sebus-rp-btn-dbg {
            min-width: 30px;
            font-size: 9px;
            padding: 0 4px;
            color: #ffe8b7;
            border-color: rgba(255,214,110,.28);
            background: rgba(255,214,110,.08);
        }
        .sebus-rp-btn-dbg:hover { color: #000; background: #ffd700; border-color: #ffd700; }
        .sebus-rp-vol-label {
            font-size: 10px; color: rgba(255,232,183,.6); min-width: 34px;
            text-align: center;
        }
        .sebus-rp-spacer { flex: 1; }
        /* Formularz dodawania */
        .sebus-rp-add {
            padding: 0 10px 8px; display: flex; gap: 5px;
        }
        .sebus-rp-add input {
            flex: 1; height: 26px; border-radius: 6px;
            border: 1px solid rgba(255,215,0,.3);
            background: rgba(255,255,255,.05);
            color: #ffe8b7; font-size: 10px; padding: 0 8px; outline: none;
        }
        .sebus-rp-add input:focus { border-color: rgba(255,215,0,.7); }
        .sebus-rp-add input::placeholder { color: rgba(255,232,183,.35); }
        /* Lista kolejki */
        .sebus-rp-queue-wrap {
            max-height: 140px; overflow-y: auto; padding: 0 10px 8px;
        }
        .sebus-rp-queue-wrap::-webkit-scrollbar { width: 5px; }
        .sebus-rp-queue-wrap::-webkit-scrollbar-thumb {
            background: rgba(255,214,110,.3); border-radius: 99px;
        }
        .sebus-rp-debug {
            margin: 0 10px 6px;
            padding: 5px 7px;
            border-radius: 6px;
            border: 1px solid rgba(255,215,0,.16);
            background: rgba(0,0,0,.22);
            color: rgba(255,232,183,.58);
            font-size: 9px;
            line-height: 1.35;
            min-height: 18px;
            max-height: 82px;
            overflow: auto;
            word-break: break-word;
        }
        .sebus-rp-debug:empty { display: none; }
        .sebus-rp-debug-state {
            margin: -2px 10px 6px;
            color: rgba(255,232,183,.45);
            font-size: 9px;
            line-height: 1.25;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .sebus-rp-queue-empty {
            font-size: 10px; color: rgba(255,232,183,.4); text-align: center;
            padding: 8px 0;
        }
        .sebus-rp-queue-item {
            display: flex; align-items: center; gap: 6px;
            padding: 4px 6px; border-radius: 6px; margin-bottom: 3px;
            border: 1px solid rgba(255,214,110,.12);
            background: rgba(255,255,255,.03);
            font-size: 10px;
        }
        .sebus-rp-queue-item.active {
            border-color: rgba(255,214,110,.45);
            background: rgba(255,214,110,.08);
        }
        .sebus-rp-queue-num {
            color: rgba(255,232,183,.4); min-width: 14px; text-align: right;
        }
        .sebus-rp-queue-title {
            flex: 1; color: #ffe8b7; white-space: nowrap;
            overflow: hidden; text-overflow: ellipsis;
        }
        .sebus-rp-queue-by {
            color: rgba(255,232,183,.45); font-size: 9px; white-space: nowrap;
        }
        .sebus-rp-queue-del {
            background: none; border: none; color: rgba(255,100,100,.5);
            cursor: pointer; font-size: 12px; padding: 0 2px; line-height: 1;
            flex-shrink: 0;
        }
        .sebus-rp-queue-del:hover { color: #ff6464; }
        /* DJ Vote buttons */
        .sebus-rp-vote-row {
            display: inline-flex; align-items: center; gap: 2px;
            flex-shrink: 0; margin: 0 3px;
        }
        .sebus-rp-vote-btn {
            background: none; border: 1px solid rgba(255,215,0,.2); border-radius: 3px;
            color: rgba(255,232,183,.4); font-size: 9px; line-height: 1;
            padding: 1px 3px; cursor: pointer; transition: .12s;
        }
        .sebus-rp-vote-btn:hover { color: #ffd700; border-color: rgba(255,215,0,.6); }
        .sebus-rp-vote-btn:disabled { opacity: .3; cursor: default; }
        .sebus-rp-vote-btn.sebus-rp-vote-active-up   { color: #50dc78; border-color: rgba(80,220,120,.5); background: rgba(80,220,120,.1); }
        .sebus-rp-vote-btn.sebus-rp-vote-active-down { color: #ff5050; border-color: rgba(255,80,80,.5);  background: rgba(255,80,80,.1); }
        .sebus-rp-vote-score { font-size: 9px; min-width: 16px; text-align: center; color: rgba(255,232,183,.5); }
        .sebus-rp-vote-score.pos { color: #7eff9e; }
        .sebus-rp-vote-score.neg { color: #ff8888; }
        .sebus-rp-status {
            font-size: 9px; color: rgba(255,232,183,.45); text-align: center;
            padding: 0 10px 6px; min-height: 12px;
        }
        /* Toggle button dla playera */
        #sebus-radio-toggle {
            display: inline-flex; align-items: center;
            position: fixed; bottom: 14px; left: 50%; transform: translateX(-50%);
            z-index: 2147483646; height: 30px; border-radius: 999px;
            border: 1px solid rgba(255,215,0,.55);
            background: linear-gradient(160deg, #201a0e, #120f08);
            color: #ffe39b; font-size: 10px; font-weight: 700;
            padding: 0 14px; cursor: pointer; white-space: nowrap;
            box-shadow: 0 4px 12px rgba(0,0,0,.4);
            transition: border-color .15s, box-shadow .15s;
        }
        #sebus-radio-toggle.sebus-radio-in-header {
            position: relative; bottom: auto; left: auto; transform: none;
            z-index: 95; height: 26px; padding: 0 10px; margin: 0 4px 0 0;
            flex-shrink: 0; vertical-align: middle; box-shadow: none;
        }
        #sebus-radio-toggle:hover {
            border-color: #ffd700;
            box-shadow: 0 0 0 1px rgba(255,215,0,.2), 0 6px 16px rgba(0,0,0,.5);
        }
        #sebus-radio-toggle.playing {
            border-color: rgba(80,220,120,.6);
            color: #a0ffca;
            animation: sebus-radio-pulse 2s ease-in-out infinite;
        }
        @keyframes sebus-radio-pulse {
            0%, 100% { box-shadow: 0 4px 12px rgba(0,0,0,.4); }
            50% { box-shadow: 0 4px 12px rgba(0,0,0,.4), 0 0 14px rgba(80,220,120,.25); }
        }
        /* Ukrywamy stary .sebus-mini-radio gdy nowy player aktywny */
        body.sebus-radio-v2 .sebus-mini-radio { display: none !important; }
        /* ── END NOWY RADIO PLAYER ─────────────────────────────── */

        /* ══════════════════════════════════════════════════════════
           WSPÓLNE STYLE PANELI MULTIPLAYER
           ══════════════════════════════════════════════════════════ */
        .sebus-mp-panel {
            position: fixed; z-index: 2147483645;
            width: 360px; border-radius: 14px;
            border: 1px solid rgba(255,215,0,.55);
            background: linear-gradient(180deg,rgba(18,14,8,.98),rgba(8,8,8,.98));
            box-shadow: 0 12px 32px rgba(0,0,0,.7), 0 0 0 1px rgba(255,214,110,.1) inset;
            backdrop-filter: blur(6px); color: #ffe8b7;
            font-family: inherit; font-size: 11px; display: none;
        }
        .sebus-mp-panel.show { display: block; }
        .sebus-mp-header {
            display: flex; align-items: center; gap: 6px;
            padding: 7px 10px 5px; border-bottom: 1px solid rgba(255,214,110,.18);
        }
        .sebus-mp-title {
            flex: 1; font-size: 10px; font-weight: 700; color: #ffd700;
            letter-spacing: .3px; text-transform: uppercase;
        }
        .sebus-mp-badge {
            font-size: 9px; padding: 1px 7px; border-radius: 99px;
            border: 1px solid rgba(255,214,110,.3); color: #ffe9b4;
            background: rgba(255,214,110,.08); white-space: nowrap;
        }
        .sebus-mp-close {
            background: none; border: none; color: #888; cursor: pointer;
            font-size: 14px; padding: 0 2px; line-height: 1;
        }
        .sebus-mp-close:hover { color: #ffd700; }
        .sebus-mp-body { padding: 8px 10px; }
        .sebus-mp-row { display: flex; gap: 6px; align-items: center; margin: 5px 0; }
        .sebus-mp-row input[type="text"] {
            flex: 1; height: 26px; border-radius: 6px;
            border: 1px solid rgba(255,215,0,.3); background: rgba(255,255,255,.05);
            color: #ffe8b7; font-size: 10px; padding: 0 8px; outline: none;
        }
        .sebus-mp-row input[type="text"]:focus { border-color: rgba(255,215,0,.7); }
        .sebus-mp-row input::placeholder { color: rgba(255,232,183,.35); }
        .sebus-mp-btn {
            height: 26px; min-width: 26px; border-radius: 6px;
            border: 1px solid rgba(255,215,0,.4); background: rgba(255,215,0,.06);
            color: #ffd700; font-size: 11px; cursor: pointer; padding: 0 8px;
            transition: .15s; white-space: nowrap;
        }
        .sebus-mp-btn:hover { background: #ffd700; color: #000; border-color: #ffd700; }
        .sebus-mp-btn:disabled { opacity: .35; cursor: default; }
        .sebus-mp-btn.active { background: rgba(80,220,120,.18); border-color: rgba(80,220,120,.6); color: #a0ffca; }
        .sebus-mp-status {
            font-size: 9px; color: rgba(255,232,183,.45); text-align: center;
            min-height: 13px; padding: 2px 0 4px;
        }
        /* Toggle buttons (wspólny styl jak radio toggle) */
        .sebus-mp-toggle {
            display: inline-flex; align-items: center;
            position: fixed; z-index: 2147483644; height: 30px; border-radius: 999px;
            border: 1px solid rgba(255,215,0,.45);
            background: linear-gradient(160deg,#1a1408,#0e0b05);
            color: #ffe39b; font-size: 10px; font-weight: 700;
            padding: 0 14px; cursor: pointer; white-space: nowrap;
            box-shadow: 0 4px 12px rgba(0,0,0,.4); transition: border-color .15s;
        }
        .sebus-mp-toggle:hover { border-color: #ffd700; }
        .sebus-mp-toggle.active { border-color: rgba(80,220,120,.6); color: #a0ffca;
            animation: sebus-radio-pulse 2s ease-in-out infinite; }
        /* ── Watch Together ──────────────────────────────────────── */
        #sebus-watch-frame {
            width: 100%; aspect-ratio: 16/9; border-radius: 8px; border: none;
            background: #000; display: block; margin: 6px 0;
        }
        .sebus-watch-controls {
            display: flex; gap: 6px; align-items: center; flex-wrap: wrap;
            padding: 4px 0 2px;
        }
        .sebus-watch-seek { flex: 1; accent-color: #ffd700; cursor: pointer; }
        .sebus-watch-viewers {
            font-size: 9px; color: rgba(255,232,183,.5); padding: 2px 0;
        }
        .sebus-watch-host-badge {
            font-size: 9px; background: rgba(255,215,0,.15);
            border: 1px solid rgba(255,215,0,.4); border-radius: 4px;
            color: #ffd700; padding: 1px 5px; margin-left: 4px;
        }
        /* ── Mini Games ──────────────────────────────────────────── */
        #sebus-games-panel { width: 320px; }
        .sebus-games-menu { display: flex; gap: 8px; flex-wrap: wrap; padding: 8px 0 4px; }
        .sebus-games-menu .sebus-mp-btn { flex: 1; min-width: 90px; }
        .sebus-ttt-board {
            display: grid; grid-template-columns: repeat(3,1fr); gap: 4px;
            margin: 8px 0;
        }
        .sebus-ttt-cell {
            aspect-ratio: 1; border-radius: 6px; border: 1px solid rgba(255,215,0,.3);
            background: rgba(255,255,255,.04); color: #ffd700; font-size: 22px;
            cursor: pointer; display: flex; align-items: center; justify-content: center;
            transition: .1s;
        }
        .sebus-ttt-cell:hover:not([data-v]) { background: rgba(255,215,0,.08); }
        .sebus-ttt-cell.win { border-color: rgba(80,220,120,.7); background: rgba(80,220,120,.12); }
        .sebus-games-info {
            font-size: 10px; color: rgba(255,232,183,.6); text-align: center;
            padding: 4px 0;
        }
        .sebus-quiz-q { font-size: 11px; font-weight: 700; padding: 6px 0 8px; line-height: 1.4; }
        .sebus-quiz-answers { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; }
        .sebus-quiz-ans {
            padding: 6px 4px; border-radius: 6px; border: 1px solid rgba(255,215,0,.3);
            background: rgba(255,255,255,.04); color: #ffe8b7; font-size: 10px;
            cursor: pointer; text-align: center; transition: .12s;
        }
        .sebus-quiz-ans:hover { background: rgba(255,215,0,.1); border-color: rgba(255,215,0,.6); }
        .sebus-quiz-ans.correct { background: rgba(80,220,120,.2); border-color: #50dc78; color: #a0ffca; }
        .sebus-quiz-ans.wrong   { background: rgba(255,80,80,.2);  border-color: #ff5050; color: #ffa0a0; }
        .sebus-quiz-score { font-size: 10px; color: rgba(255,232,183,.5); margin-top: 6px; }
        /* ── GIF Party ───────────────────────────────────────────── */
        #sebus-gifparty-panel { width: 380px; }
        .sebus-gp-feed {
            display: flex; flex-direction: column; gap: 8px;
            max-height: 320px; overflow-y: auto; padding: 4px 0;
        }
        .sebus-gp-feed::-webkit-scrollbar { width: 4px; }
        .sebus-gp-feed::-webkit-scrollbar-thumb { background: rgba(255,214,110,.3); border-radius: 99px; }
        .sebus-gp-item {
            border-radius: 8px; border: 1px solid rgba(255,214,110,.15);
            background: rgba(255,255,255,.03); overflow: hidden;
        }
        .sebus-gp-img { width: 100%; display: block; border-radius: 8px 8px 0 0; max-height: 180px; object-fit: cover; }
        .sebus-gp-meta {
            display: flex; align-items: center; gap: 6px;
            padding: 4px 8px; font-size: 9px; color: rgba(255,232,183,.5);
        }
        .sebus-gp-nick { flex: 1; }
        .sebus-gp-vote {
            display: flex; gap: 4px; align-items: center;
        }
        .sebus-gp-vote-btn {
            background: none; border: 1px solid rgba(255,215,0,.3); border-radius: 4px;
            color: #ffe8b7; font-size: 10px; cursor: pointer; padding: 1px 5px;
            transition: .12s;
        }
        .sebus-gp-vote-btn:hover { background: rgba(255,215,0,.12); }
        .sebus-gp-vote-btn.voted-up   { background: rgba(80,220,120,.2); border-color: #50dc78; color: #a0ffca; }
        .sebus-gp-vote-btn.voted-down { background: rgba(255,80,80,.2);  border-color: #ff5050; color: #ffa0a0; }
        .sebus-gp-score { font-size: 10px; font-weight: 700; color: #ffd700; min-width: 22px; text-align: center; }
        /* ── Whiteboard ──────────────────────────────────────────── */
        #sebus-whiteboard-panel { width: 420px; }
        #sebus-wb-canvas {
            width: 100%; height: 260px; border-radius: 8px;
            border: 1px solid rgba(255,215,0,.25); background: #0d0d0d;
            display: block; cursor: crosshair; touch-action: none;
        }
        .sebus-wb-toolbar {
            display: flex; gap: 5px; align-items: center;
            padding: 5px 0 3px; flex-wrap: wrap;
        }
        .sebus-wb-color {
            width: 20px; height: 20px; border-radius: 50%; border: 2px solid transparent;
            cursor: pointer; flex-shrink: 0; transition: .12s;
        }
        .sebus-wb-color.sel { border-color: #fff; transform: scale(1.2); }
        .sebus-wb-size {
            height: 22px; width: 60px; accent-color: #ffd700; cursor: pointer;
        }
        /* ─────────────────────────────────────────────────────────── */

        #sebus-settings-footer-anchor {
            width: 100%; display: flex; justify-content: center;
            padding: 18px 0 26px 0;
        }

        #sebus-settings-open {
            position: static; z-index: 1;
            height: 28px; padding: 0 10px; border-radius: 999px;
            border: 1px solid #FFD700; background: rgba(17, 17, 17, 0.92);
            color: #FFD700; font-size: 11px; font-weight: bold; cursor: pointer;
        }
        #sebus-settings-open:hover { background: #FFD700; color: #000; }

        #sebus-settings-panel {
            display: none; position: fixed; right: 14px; bottom: 48px; z-index: 2147483647;
            width: 280px; background: rgba(12, 12, 12, 0.98); border: 1px solid #FFD700;
            border-radius: 10px; box-shadow: 0 12px 30px rgba(0,0,0,.55); padding: 10px;
            color: #FFD700; font-size: 11px;
        }
        #sebus-settings-panel.show { display: block; }
        .sebus-settings-title { font-size: 12px; font-weight: bold; margin-bottom: 8px; }
        .sebus-settings-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin: 6px 0; }
        .sebus-settings-row label { cursor: pointer; user-select: none; }
        .sebus-settings-row input[type="checkbox"] { accent-color: #FFD700; }
        .sebus-settings-row select {
            min-width: 90px; height: 22px; background: #111; color: #FFD700;
            border: 1px solid #555; border-radius: 5px; font-size: 11px;
        }
        .sebus-settings-foot { margin-top: 8px; display: flex; justify-content: flex-end; }
        #sebus-settings-close {
            height: 24px; padding: 0 8px; border-radius: 6px; border: 1px solid #555;
            background: #111; color: #FFD700; cursor: pointer;
        }
        #sebus-settings-close:hover { background: #FFD700; color: #000; border-color: #FFD700; }

        .sebus-pinned-container-chat {
            display: flex; flex-direction: column; gap: 8px; margin-bottom: 10px; padding: 8px; 
            background: rgba(0, 0, 0, 0.2); border-radius: 6px; border-left: 3px solid #FFD700;
        }

        .sebus-sticky-note {
            background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
            border: 2px solid #FF8C00; border-radius: 8px;
            padding: 12px; max-width: 300px; box-shadow: 0 8px 20px rgba(255, 215, 0, 0.3), 0 0 20px rgba(255, 215, 0, 0.2);
            color: #000; font-weight: bold; font-size: 12px;
            position: relative; animation: sebus-sticky-pop 0.3s ease-out;
            word-wrap: break-word; word-break: break-word;
        }

        .sebus-sticky-note-header {
            display: flex; justify-content: space-between; align-items: center;
            margin-bottom: 8px; border-bottom: 1px solid rgba(0, 0, 0, 0.2); padding-bottom: 6px;
        }

        .sebus-sticky-note-author { font-size: 11px; opacity: 0.8; }

        .sebus-sticky-note-close {
            background: none; border: none; color: #000; cursor: pointer; font-size: 16px;
            padding: 0; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;
            opacity: 0.7; transition: 0.2s;
        }

        .sebus-sticky-note-close:hover { opacity: 1; }

        .sebus-sticky-note-content {
            max-height: 120px; overflow-y: auto; padding-right: 8px;
        }

        #sebus-baksy-panel { display: none; }
        .sebus-baksy-title { font-size: 11px; font-weight: bold; margin-bottom: 6px; }
        .sebus-baksy-balance { font-size: 13px; font-weight: bold; color: #ffe27a; margin-bottom: 4px; }
        .sebus-baksy-stats { font-size: 10px; opacity: 0.8; margin-bottom: 6px; }
        .sebus-baksy-row { display: flex; gap: 6px; margin: 5px 0; align-items: center; }
        .sebus-baksy-row input, .sebus-baksy-row select {
            flex: 1;
            height: 22px;
            border: 1px solid #666;
            border-radius: 5px;
            background: #111;
            color: #ffd700;
            padding: 0 6px;
            font-size: 10px;
        }
        .sebus-baksy-row button {
            height: 22px;
            border: 1px solid #666;
            border-radius: 5px;
            background: #111;
            color: #ffd700;
            font-size: 10px;
            cursor: pointer;
            padding: 0 7px;
        }
        .sebus-baksy-row button:hover { background: #ffd700; color: #000; border-color: #ffd700; }
        #sebus-baksy-feedback { font-size: 10px; margin-top: 5px; min-height: 12px; }

        .sebus-baksy-highlight {
            border: 2px solid #f2c94c !important;
            box-shadow: 0 0 14px rgba(242, 201, 76, 0.45) !important;
            border-radius: 8px !important;
        }
        .sebus-baksy-badge {
            display: inline-block;
            margin: 0 0 8px 0;
            padding: 3px 8px;
            border-radius: 999px;
            font-size: 10px;
            font-weight: bold;
            color: #111;
            background: linear-gradient(135deg, #ffd66b 0%, #f2c94c 100%);
            border: 1px solid #bd9d37;
        }

        body.sebus-baksy-neon-active .sebus-neon,
        body.sebus-baksy-neon-active .sebus-gold-legend {
            color: var(--sebus-baksy-neon) !important;
            text-shadow: 0 0 12px var(--sebus-baksy-neon), 0 0 6px var(--sebus-baksy-neon) !important;
        }

        #sebus-baksy-rain {
            position: fixed;
            inset: 0;
            pointer-events: none;
            z-index: 2147483645;
            overflow: hidden;
            display: none;
        }
        #sebus-baksy-rain.show { display: block; }
        .sebus-baksy-coin {
            position: absolute;
            top: -22px;
            font-size: 18px;
            animation-name: sebus-baksy-fall;
            animation-timing-function: linear;
            animation-fill-mode: forwards;
            will-change: transform, opacity;
        }
        @keyframes sebus-baksy-fall {
            from { transform: translateY(0) rotate(0deg); opacity: 0.95; }
            to { transform: translateY(112vh) rotate(360deg); opacity: 0.1; }
        }

        #sebus-baksy-hub-open {
            position: fixed;
            right: 14px;
            bottom: 14px;
            z-index: 2147483646;
            height: 34px;
            border-radius: 999px;
            border: 1px solid #d8a335;
            background: linear-gradient(160deg, #2c2416 0%, #17130d 55%, #0f1a27 100%);
            color: #ffe39b;
            font-weight: 800;
            letter-spacing: .25px;
            cursor: pointer;
            padding: 0 14px;
            box-shadow: 0 0 0 1px rgba(255, 214, 110, .2) inset, 0 10px 16px rgba(0,0,0,.35);
            text-shadow: 0 0 8px rgba(255,214,110,.25);
            transition: transform .16s ease, box-shadow .16s ease, border-color .16s ease;
        }
        #sebus-baksy-hub-open:hover {
            border-color: #ffe7a7;
            transform: translateY(-1px);
            box-shadow: 0 0 0 1px rgba(255, 232, 170, .35) inset, 0 12px 22px rgba(0,0,0,.48);
        }

        #sebus-baksy-hub {
            position: fixed;
            right: 14px;
            bottom: 52px;
            width: 382px;
            max-height: 74vh;
            overflow: auto;
            z-index: 2147483647;
            border-radius: 14px;
            border: 1px solid rgba(217, 168, 60, 0.75);
            background:
                radial-gradient(circle at 12% 5%, rgba(255,214,110,.12), transparent 36%),
                radial-gradient(circle at 88% 3%, rgba(89,163,255,.14), transparent 40%),
                linear-gradient(180deg, rgba(27,23,17,.98), rgba(10,10,10,.98));
            box-shadow: 0 20px 44px rgba(0,0,0,.62), 0 0 0 1px rgba(255,214,110,.15) inset;
            backdrop-filter: blur(2px);
            color: #ffe8b7;
            padding: 11px;
            display: none;
        }
        #sebus-baksy-hub::-webkit-scrollbar { width: 9px; }
        #sebus-baksy-hub::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, rgba(255,214,110,.55), rgba(163,122,43,.62));
            border-radius: 999px;
            border: 2px solid rgba(12,12,12,.95);
        }

        #sebus-hazard-panel {
            position: fixed;
            right: 14px;
            bottom: 52px;
            width: 382px;
            max-height: 74vh;
            overflow: auto;
            z-index: 2147483647;
            border-radius: 14px;
            border: 1px solid rgba(217, 168, 60, 0.75);
            background:
                radial-gradient(circle at 12% 5%, rgba(255,214,110,.12), transparent 36%),
                radial-gradient(circle at 88% 3%, rgba(89,163,255,.14), transparent 40%),
                linear-gradient(180deg, rgba(27,23,17,.98), rgba(10,10,10,.98));
            box-shadow: 0 20px 44px rgba(0,0,0,.62), 0 0 0 1px rgba(255,214,110,.15) inset;
            backdrop-filter: blur(2px);
            color: #ffe8b7;
            padding: 11px;
        }
        #sebus-hazard-panel::-webkit-scrollbar { width: 9px; }
        #sebus-hazard-panel::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, rgba(255,214,110,.55), rgba(163,122,43,.62));
            border-radius: 999px;
            border: 2px solid rgba(12,12,12,.95);
        }
        #sebus-missions-panel {
            position: fixed;
            right: 14px;
            bottom: 52px;
            width: 382px;
            max-height: 74vh;
            overflow: auto;
            z-index: 2147483647;
            border-radius: 14px;
            border: 1px solid rgba(217, 168, 60, 0.75);
            background:
                radial-gradient(circle at 12% 5%, rgba(255,214,110,.12), transparent 36%),
                radial-gradient(circle at 88% 3%, rgba(89,163,255,.14), transparent 40%),
                linear-gradient(180deg, rgba(27,23,17,.98), rgba(10,10,10,.98));
            box-shadow: 0 20px 44px rgba(0,0,0,.62), 0 0 0 1px rgba(255,214,110,.15) inset;
            backdrop-filter: blur(2px);
            color: #ffe8b7;
            padding: 11px;
        }
        #sebus-missions-panel::-webkit-scrollbar { width: 9px; }
        #sebus-missions-panel::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, rgba(255,214,110,.55), rgba(163,122,43,.62));
            border-radius: 999px;
            border: 2px solid rgba(12,12,12,.95);
        }
        #sebus-missions-panel .sebus-active {
            border-color: #ffe7a7 !important;
            box-shadow: 0 0 0 1px rgba(255,214,110,.25) inset;
        }
        #sebus-ranking-panel {
            position: fixed;
            right: 14px;
            bottom: 52px;
            width: 382px;
            max-height: 74vh;
            overflow: auto;
            z-index: 2147483647;
            border-radius: 14px;
            border: 1px solid rgba(217, 168, 60, 0.75);
            background:
                radial-gradient(circle at 12% 5%, rgba(255,214,110,.12), transparent 36%),
                radial-gradient(circle at 88% 3%, rgba(89,163,255,.14), transparent 40%),
                linear-gradient(180deg, rgba(27,23,17,.98), rgba(10,10,10,.98));
            box-shadow: 0 20px 44px rgba(0,0,0,.62), 0 0 0 1px rgba(255,214,110,.15) inset;
            backdrop-filter: blur(2px);
            color: #ffe8b7;
            padding: 11px;
        }
        #sebus-ranking-panel::-webkit-scrollbar { width: 9px; }
        #sebus-ranking-panel::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, rgba(255,214,110,.55), rgba(163,122,43,.62));
            border-radius: 999px;
            border: 2px solid rgba(12,12,12,.95);
        }

        /* ── MMO CHAT ─────────────────────────────────────────── */
        #sebus-mmo-chat-panel {
            position: fixed;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            width: min(520px, 96vw);
            max-height: 88vh;
            display: none;
            flex-direction: column;
            z-index: 2147483647;
            border-radius: 16px;
            border: 1px solid rgba(217,168,60,.75);
            background: linear-gradient(180deg, rgba(22,18,12,.99), rgba(8,8,8,.99));
            box-shadow: 0 24px 64px rgba(0,0,0,.72), 0 0 0 1px rgba(255,214,110,.12) inset;
            backdrop-filter: blur(4px);
            color: #ffe8b7;
            font-family: inherit;
            overflow: visible;
            user-select: none;
        }
        #sebus-mmo-chat-panel.show { display: flex; }
        .sebus-chat-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 10px 14px 8px;
            border-bottom: 1px solid rgba(255,214,110,.18);
            gap: 8px;
            flex-shrink: 0;
            cursor: move;
            border-radius: 16px 16px 0 0;
        }
        .sebus-chat-header-title {
            font-size: 13px;
            font-weight: 900;
            color: #ffd700;
            letter-spacing: .3px;
        }
        .sebus-chat-online-badge {
            font-size: 10px;
            background: rgba(80,220,120,.18);
            border: 1px solid rgba(80,220,120,.4);
            color: #5adc7a;
            border-radius: 20px;
            padding: 2px 8px;
            white-space: nowrap;
        }
        .sebus-chat-header-actions { display: flex; gap: 6px; }
        .sebus-chat-profile-badge {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 11px;
            background: rgba(255,214,110,.08);
            border: 1px solid rgba(255,214,110,.25);
            border-radius: 20px;
            padding: 3px 10px;
            cursor: pointer;
            transition: background .15s;
        }
        .sebus-chat-profile-badge:hover { background: rgba(255,214,110,.16); }
        .sebus-chat-msgs-area {
            flex: 1;
            overflow-y: auto;
            overflow-x: hidden;
            padding: 10px 12px;
            display: flex;
            flex-direction: column;
            gap: 6px;
            min-height: 200px;
            max-height: 52vh;
        }
        .sebus-chat-msgs-area::-webkit-scrollbar { width: 6px; }
        .sebus-chat-msgs-area::-webkit-scrollbar-thumb {
            background: rgba(255,214,110,.3);
            border-radius: 999px;
        }
        .sebus-chat-msg {
            display: flex;
            gap: 8px;
            align-items: flex-start;
        }
        .sebus-chat-msg-me { flex-direction: row-reverse; }
        .sebus-chat-msg-me .sebus-chat-meta { flex-direction: row-reverse; }
        .sebus-chat-msg-me .sebus-chat-bubble {
            background: rgba(255,214,110,.14);
            border-color: rgba(255,214,110,.35);
        }
        .sebus-chat-avatar-col { flex-shrink: 0; }
        .sebus-chat-avatar {
            display: block;
            width: 32px;
            height: 32px;
            line-height: 32px;
            text-align: center;
            font-size: 20px;
            border-radius: 50%;
            background: rgba(255,255,255,.05);
        }
        .sebus-chat-content-col { flex: 1; min-width: 0; }
        .sebus-chat-meta {
            display: flex;
            align-items: center;
            gap: 6px;
            margin-bottom: 3px;
        }
        .sebus-chat-nick { font-size: 11px; font-weight: 700; color: #ffd700; }
        .sebus-chat-time { font-size: 9px; color: rgba(255,232,183,.45); }
        .sebus-chat-bubble {
            font-size: 12px;
            line-height: 1.45;
            padding: 6px 10px;
            border-radius: 10px;
            border: 1px solid rgba(255,255,255,.08);
            background: rgba(255,255,255,.05);
            word-break: break-word;
            color: #ffe8b7;
        }
        .sebus-chat-system {
            font-size: 10px;
            text-align: center;
            color: rgba(255,214,110,.55);
            padding: 4px 0;
        }
        .sebus-chat-yt-wrap {
            border-radius: 10px;
            overflow: hidden;
            border: 1px solid rgba(255,214,110,.2);
            background: #000;
        }
        .sebus-chat-img-wrap { line-height: 0; }
        .sebus-chat-img {
            max-width: 100%;
            max-height: 220px;
            border-radius: 10px;
            cursor: zoom-in;
            display: block;
            border: 1px solid rgba(255,214,110,.18);
            transition: max-height .2s;
        }
        .sebus-chat-input-row {
            display: flex;
            gap: 6px;
            padding: 8px 12px 10px;
            border-top: 1px solid rgba(255,214,110,.15);
            flex-shrink: 0;
        }
        .sebus-chat-input-wrap { flex: 1; display: flex; flex-direction: column; gap: 4px; }
        #sebus-chat-input {
            width: 100%;
            background: rgba(255,255,255,.05);
            border: 1px solid rgba(255,214,110,.3);
            border-radius: 8px;
            color: #ffe8b7;
            font-size: 12px;
            padding: 7px 10px;
            box-sizing: border-box;
            resize: none;
            outline: none;
            font-family: inherit;
        }
        #sebus-chat-input:focus { border-color: rgba(255,214,110,.65); }
        .sebus-chat-toolbar {
            display: flex;
            gap: 4px;
            flex-wrap: wrap;
        }
        .sebus-chat-tool-btn {
            background: rgba(255,214,110,.08);
            border: 1px solid rgba(255,214,110,.2);
            color: #ffd700;
            border-radius: 6px;
            font-size: 11px;
            padding: 3px 8px;
            cursor: pointer;
            transition: background .15s;
        }
        .sebus-chat-tool-btn:hover { background: rgba(255,214,110,.2); }
        .sebus-chat-send-btn {
            background: linear-gradient(135deg,#c8961e,#ffd700);
            color: #1a1200;
            border: none;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 700;
            padding: 0 14px;
            cursor: pointer;
            align-self: flex-end;
            height: 36px;
            flex-shrink: 0;
            transition: opacity .15s;
        }
        .sebus-chat-send-btn:hover { opacity: .87; }
        .sebus-chat-send-btn:disabled { opacity: .4; cursor: default; }

        /* profile setup overlay */
        #sebus-chat-setup-overlay {
            position: absolute;
            inset: 0;
            background: rgba(8,8,8,.96);
            z-index: 10;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
            overflow-y: auto;
            gap: 14px;
            border-radius: 16px;
            padding: 28px 24px 24px;
        }
        .sebus-chat-setup-title {
            font-size: 15px;
            font-weight: 900;
            color: #ffd700;
            text-align: center;
        }
        .sebus-chat-setup-sub {
            font-size: 11px;
            color: rgba(255,232,183,.65);
            text-align: center;
        }
        .sebus-chat-setup-input {
            width: 100%;
            max-width: 280px;
            background: rgba(255,255,255,.07);
            border: 1px solid rgba(255,214,110,.4);
            border-radius: 8px;
            color: #ffe8b7;
            font-size: 13px;
            padding: 9px 12px;
            box-sizing: border-box;
            outline: none;
            text-align: center;
        }
        .sebus-chat-setup-input:focus { border-color: #ffd700; }
        .sebus-chat-avatar-picker {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            max-width: 300px;
            justify-content: center;
        }
        .sebus-chat-avatar-opt {
            font-size: 22px;
            width: 38px;
            height: 38px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            border: 2px solid rgba(255,214,110,.15);
            cursor: pointer;
            transition: border-color .15s, background .15s;
            background: rgba(255,255,255,.04);
        }
        .sebus-chat-avatar-opt:hover,
        .sebus-chat-avatar-opt.selected { border-color: #ffd700; background: rgba(255,214,110,.14); }
        .sebus-chat-setup-confirm-btn {
            background: linear-gradient(135deg,#c8961e,#ffd700);
            color: #1a1200;
            border: none;
            border-radius: 10px;
            font-size: 13px;
            font-weight: 900;
            padding: 10px 28px;
            cursor: pointer;
            transition: opacity .15s;
        }
        .sebus-chat-setup-confirm-btn:hover { opacity: .87; }
        .sebus-chat-setup-confirm-btn:disabled { opacity: .4; cursor: default; }
        /* ── end MMO CHAT ─────────────────────────────────────── */
        #sebus-baksy-hub::-webkit-scrollbar-track { background: rgba(0,0,0,.2); }
        #sebus-baksy-hub.show { display: block; }
        .sebus-baksy-hub-top {
            display:flex;
            justify-content:space-between;
            align-items:flex-start;
            margin-bottom: 8px;
            border-bottom: 1px solid rgba(255,214,110,.23);
            padding-bottom: 6px;
        }
        .sebus-baksy-hub-title { font-size: 14px; font-weight: 900; letter-spacing: .25px; text-shadow: 0 0 8px rgba(255,214,110,.2); }
        .sebus-baksy-hub-subtitle { font-size: 10px; opacity: .75; margin-top: 2px; letter-spacing: .28px; }
        .sebus-baksy-chip {
            font-size: 10px;
            padding: 3px 8px;
            border-radius: 999px;
            border: 1px solid #7e5d25;
            background: linear-gradient(180deg, rgba(255,214,110,.2), rgba(90,64,17,.28));
            color: #ffe9b4;
            font-weight: 800;
        }
        .sebus-baksy-hub-balance {
            font-size: 30px;
            line-height: 1;
            font-weight: 900;
            margin: 8px 0 5px;
            color: #ffe8a8;
            text-shadow: 0 0 12px rgba(255, 201, 95, .28), 0 0 24px rgba(255, 178, 62, .16);
        }
        .sebus-baksy-hub-muted { font-size: 10px; opacity: .86; margin-bottom: 8px; color: #d7c08d; }
        .sebus-baksy-grid { display:grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .sebus-baksy-card {
            border: 1px solid #5d4720;
            border-radius: 11px;
            padding: 8px;
            background:
                linear-gradient(180deg, rgba(255,214,110,.045), rgba(18,18,18,.72)),
                radial-gradient(circle at 50% -20%, rgba(255,214,110,.08), transparent 68%);
            box-shadow: 0 0 0 1px rgba(255,214,110,.06) inset;
        }
        .sebus-baksy-card h4 {
            margin: 0 0 6px 0;
            font-size: 11px;
            letter-spacing: .25px;
            text-transform: uppercase;
            color: #ffe5aa;
        }
        .sebus-baksy-card input, .sebus-baksy-card select, .sebus-baksy-card button {
            width: 100%;
            height: 30px;
            border-radius: 6px;
            border: 1px solid #6f5628;
            background: linear-gradient(180deg, #1f2128 0%, #15171c 100%);
            color: #ffdc86;
            font-size: 11px;
            margin-top: 5px;
            padding: 0 9px;
            box-sizing: border-box;
            transition: border-color .15s ease, box-shadow .15s ease, transform .15s ease;
        }
        .sebus-baksy-card input:focus, .sebus-baksy-card select:focus {
            outline: none;
            border-color: #f5c865;
            box-shadow: 0 0 0 2px rgba(255,214,110,.12);
        }
        .sebus-baksy-card button {
            cursor: pointer;
            font-weight: 800;
            background: linear-gradient(180deg, rgba(77,58,21,.7), rgba(37,27,10,.92));
            border-color: #8c6a30;
            text-shadow: 0 0 8px rgba(255,214,110,.18);
        }
        .sebus-baksy-card button:hover {
            background: linear-gradient(180deg, rgba(255,220,130,.95), rgba(214,157,58,.95));
            color: #1a1306;
            border-color: #ffd88a;
            transform: translateY(-1px);
        }
        #sebus-baksy-casino-result {
            margin-top: 8px;
            min-height: 20px;
            font-size: 11px;
            border-radius: 7px;
            padding: 4px 6px;
            background: rgba(0,0,0,.2);
            border: 1px solid rgba(255,214,110,.12);
        }
        .sebus-casino-sub { margin-top: 8px; padding-top: 8px; border-top: 1px dashed rgba(255,214,110,.25); }
        .sebus-casino-label {
            font-size: 10px;
            color: #d9c089;
            letter-spacing: .2px;
            margin-bottom: 4px;
        }
        #sebus-hub-casino-side {
            height: 34px;
            font-size: 12px;
            font-weight: 700;
            padding-right: 26px;
        }
        #sebus-hub-casino-coinflip {
            height: 32px;
            font-size: 12px;
            letter-spacing: .2px;
        }
        .sebus-casino-row { display: flex; gap: 4px; }
        .sebus-casino-row button {
            flex: 1;
            min-width: 0;
            font-size: 11px;
            padding: 0 4px;
        }
        .sebus-casino-coin {
            margin-top: 6px;
            min-height: 26px;
            border-radius: 8px;
            border: 1px solid rgba(255,214,110,.38);
            background: linear-gradient(145deg, rgba(255,214,110,.25), rgba(20,20,20,.74));
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            font-weight: 700;
            box-shadow: inset 0 0 0 1px rgba(255,214,110,.1), inset 0 0 14px rgba(255,214,110,.12);
        }
        .sebus-casino-slots {
            margin-top: 6px;
            display: flex;
            justify-content: center;
            gap: 6px;
            padding: 7px;
            border: 1px solid rgba(255,214,110,.34);
            border-radius: 8px;
            background: linear-gradient(180deg, rgba(255,214,110,.12), rgba(15,15,15,.95));
            box-shadow: inset 0 0 22px rgba(255,214,110,.06);
        }
        .sebus-slot-reel {
            width: 45px;
            height: 45px;
            border-radius: 8px;
            border: 1px solid rgba(255,214,110,.48);
            background: linear-gradient(180deg, #20180c 0%, #100d09 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            box-shadow: inset 0 0 12px rgba(0,0,0,.52), 0 0 10px rgba(255,214,110,.08);
        }
        .sebus-slot-reel.spin { animation: sebus-slot-spin .12s linear infinite; }
        @keyframes sebus-slot-spin {
            from { transform: translateY(0); opacity: .72; }
            to { transform: translateY(1px); opacity: 1; }
        }
        .sebus-hazard-reel { transition: opacity .2s; }
        .sebus-hazard-reel.spin { animation: sebus-slot-spin .12s linear infinite; }
        #sebus-hazard-slots-display.spinning { opacity: .72; }
        .sebus-blackjack-board {
            margin-top: 6px;
            border: 1px solid rgba(0,255,140,.34);
            border-radius: 8px;
            background: radial-gradient(circle at center, rgba(0, 196, 98, .2), rgba(8,16,9,.95));
            padding: 6px;
            box-shadow: inset 0 0 14px rgba(0, 196, 98, .14);
        }
        .sebus-blackjack-line { font-size: 10px; margin-bottom: 4px; color: #cde9d6; }
        .sebus-blackjack-cards { min-height: 14px; letter-spacing: .2px; color: #f3fff6; font-weight: 700; }
        .sebus-casino-status-win { color: #88ffbd; text-shadow: 0 0 8px rgba(136,255,189,.2); }
        .sebus-casino-status-lose { color: #ff9999; text-shadow: 0 0 8px rgba(255,90,90,.16); }
        .sebus-casino-status-neutral { color: #ffe7af; }
        #sebus-baksy-hub-feedback {
            margin-top: 8px;
            min-height: 18px;
            font-size: 11px;
            padding: 4px 6px;
            border-radius: 7px;
            border: 1px solid rgba(255,214,110,.12);
            background: rgba(0,0,0,.2);
        }
        #sebus-baksy-hub-history {
            margin-top: 8px;
            max-height: 130px;
            overflow:auto;
            font-size:10px;
            opacity:.95;
            border-top: 1px solid rgba(255,214,110,.18);
            padding-top: 4px;
        }
        .sebus-baksy-hub-history-item {
            padding: 5px 2px;
            border-bottom: 1px dashed rgba(255,214,110,.2);
            color: #e2cf9f;
        }

        .sebus-hub-container {
            background: rgba(10, 10, 10, 0.92) !important;
            border: 1px solid rgba(212, 175, 55, 0.4) !important;
            border-radius: 4px !important;
            box-shadow: 0 0 20px rgba(0,0,0,0.8), inset 0 0 15px rgba(212, 175, 55, 0.1) !important;
            position: relative;
            padding: 15px !important;
            backdrop-filter: blur(5px);
        }

        .sebus-hub-container::before,
        .sebus-hub-container::after {
            content: "◈";
            position: absolute;
            color: rgba(255, 215, 0, 0.6);
            font-size: 10px;
            text-shadow: 0 0 3px rgba(255, 215, 0, 0.6);
            z-index: 2;
            pointer-events: none;
        }
        .sebus-hub-container::before { top: -2px; left: -2px; }
        .sebus-hub-container::after { bottom: -2px; right: -2px; }

        .sebus-hub-title {
            color: #ffd700 !important;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-size: 11px !important;
            border-bottom: 1px solid rgba(255, 215, 0, 0.3) !important;
            padding-bottom: 3px !important;
            margin-bottom: 8px !important;
            text-shadow: 0 0 4px rgba(255, 215, 0, 0.7) !important;
        }

        .sebus-mmo-btn {
            background: rgba(20, 20, 20, 0.8) !important;
            border: 1px solid #ffd700 !important;
            color: #ffd700 !important;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-size: 10px !important;
            transition: 0.2s;
            box-shadow: 0 0 5px rgba(212, 175, 55, 0.3) !important;
        }

        .sebus-mmo-btn:hover {
            background: rgba(40, 40, 40, 0.9) !important;
            color: #fff !important;
            border-color: #fff !important;
            box-shadow: 0 0 15px #ffd700, 0 0 5px #fff !important;
        }

        .sebus-neon-red-btn { border-color: #ff3333 !important; color: #ff3333 !important; }
        .sebus-neon-red-btn:hover { box-shadow: 0 0 15px #ff3333, 0 0 5px #fff !important; }

        .sebus-neon-violet-btn { border-color: #cc33ff !important; color: #cc33ff !important; }
        .sebus-neon-violet-btn:hover { box-shadow: 0 0 15px #cc33ff, 0 0 5px #fff !important; }

        .sebus-casino-area,
        .sebus-card-area {
            background: transparent !important;
            border: none !important;
            padding: 10px 0 !important;
            box-shadow: none !important;
        }

        .sebus-casino-symbol {
            text-shadow: 0 0 5px rgba(255,255,255,0.8), 0 0 10px rgba(0,0,0,0.5) !important;
        }

        #sebus-baksy-league-open {
            position: fixed;
            left: 14px;
            bottom: 14px;
            z-index: 2147483646;
            height: 34px;
            border-radius: 999px;
            border: 1px solid #d8a335;
            background: linear-gradient(160deg, #2c2416 0%, #17130d 55%, #0f1a27 100%);
            color: #ffe39b;
            font-weight: 800;
            letter-spacing: .2px;
            padding: 0 14px;
            cursor: pointer;
        }

        #sebus-baksy-league {
            position: fixed;
            left: 14px;
            bottom: 52px;
            width: 382px;
            max-height: 74vh;
            overflow: auto;
            z-index: 2147483647;
            display: none;
        }
        #sebus-baksy-league.show { display: block; }

        #sebus-baksy-games-open {
            position: fixed;
            left: 14px;
            bottom: 54px;
            z-index: 2147483646;
            height: 34px;
            border-radius: 999px;
            border: 1px solid #d8a335;
            background: linear-gradient(160deg, #2c2416 0%, #17130d 55%, #0f1a27 100%);
            color: #ffe39b;
            font-weight: 800;
            letter-spacing: .2px;
            padding: 0 14px;
            cursor: pointer;
        }

        #sebus-baksy-admin-open {
            position: fixed;
            right: 14px;
            top: 14px;
            z-index: 2147483646;
            height: 32px;
            border-radius: 999px;
            border: 1px solid #ff7a7a;
            background: linear-gradient(160deg, #351818 0%, #1c1010 55%, #1b1d2f 100%);
            color: #ffd3d3;
            font-weight: 800;
            padding: 0 12px;
            cursor: pointer;
            display: none;
        }
        #sebus-baksy-admin-open.show { display: inline-flex; align-items: center; }

        #sebus-baksy-admin {
            position: fixed;
            right: 14px;
            top: 52px;
            width: 430px;
            max-height: 74vh;
            overflow: auto;
            z-index: 2147483647;
            display: none;
        }
        #sebus-baksy-admin.show { display: block; }
        #sebus-baksy-admin input,
        #sebus-baksy-admin select,
        #sebus-baksy-admin button,
        #sebus-baksy-admin textarea {
            width: 100%;
            height: 30px;
            border-radius: 6px;
            border: 1px solid #7a4a4a;
            background: linear-gradient(180deg, #26202a 0%, #17171d 100%);
            color: #ffd9c3;
            font-size: 11px;
            margin-top: 5px;
            padding: 0 9px;
            box-sizing: border-box;
        }
        #sebus-baksy-admin textarea { min-height: 84px; resize: vertical; padding-top: 7px; }
        .sebus-admin-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
        .sebus-admin-table {
            margin-top: 6px;
            font-size: 10px;
            border: 1px solid rgba(255,170,170,.2);
            border-radius: 7px;
            overflow: hidden;
        }
        .sebus-admin-row { display:flex; justify-content:space-between; gap:6px; padding:4px 6px; border-bottom:1px dashed rgba(255,170,170,.16); }
        .sebus-admin-row:last-child { border-bottom: none; }
        .sebus-admin-feedback {
            margin-top: 8px;
            min-height: 18px;
            border: 1px solid rgba(255,170,170,.22);
            background: rgba(0,0,0,.2);
            border-radius: 7px;
            padding: 4px 6px;
            font-size: 11px;
        }

        .sebus-league-section { margin-top: 8px; }
        .sebus-league-list { font-size: 11px; }
        .sebus-league-item {
            display: flex;
            justify-content: space-between;
            gap: 6px;
            padding: 5px 0;
            border-bottom: 1px dashed rgba(255,214,110,.2);
            color: #e8d8af;
        }
        .sebus-league-item-you { color: #fff0c9; text-shadow: 0 0 5px rgba(255,215,0,.35); }
        .sebus-mission-item {
            border: 1px solid rgba(255,214,110,.2);
            border-radius: 6px;
            padding: 6px;
            margin-top: 6px;
            background: rgba(0,0,0,.24);
            font-size: 11px;
            color: #eddcb2;
        }
        .sebus-mission-meta { margin-top: 3px; font-size: 10px; opacity: .86; }
        .sebus-mission-done { border-color: rgba(136,255,189,.35); box-shadow: inset 0 0 8px rgba(136,255,189,.12); }
        .sebus-league-feedback {
            margin-top: 8px;
            min-height: 18px;
            border: 1px solid rgba(255,214,110,.12);
            background: rgba(0,0,0,.2);
            border-radius: 7px;
            padding: 4px 6px;
            font-size: 11px;
        }
        #sebus-baksy-league input,
        #sebus-baksy-league select,
        #sebus-baksy-league button {
            width: 100%;
            height: 30px;
            border-radius: 6px;
            border: 1px solid #6f5628;
            background: linear-gradient(180deg, #1f2128 0%, #15171c 100%);
            color: #ffdc86;
            font-size: 11px;
            margin-top: 5px;
            padding: 0 9px;
            box-sizing: border-box;
        }

        .sebus-shared-profile-emoji {
            margin-left: 4px;
            font-size: 12px;
            filter: drop-shadow(0 0 3px rgba(255,215,0,.45));
            vertical-align: middle;
        }
        .sebus-shared-nick-highlight {
            text-shadow: 0 0 8px var(--sebus-shared-highlight, #ffd700) !important;
            color: var(--sebus-shared-highlight, #ffd700) !important;
            font-weight: 700 !important;
        }

        :root {
            --sebus-ui-bg-1: #0b0d12;
            --sebus-ui-bg-2: #141926;
            --sebus-ui-bg-3: #1a2133;
            --sebus-ui-gold-1: #f8d37a;
            --sebus-ui-gold-2: #c9922d;
            --sebus-ui-cyan: #58d8ff;
            --sebus-ui-emerald: #77ffbf;
            --sebus-ui-danger: #ff7587;
            --sebus-ui-text: #f5e7c2;
            --sebus-ui-muted: #b6a98e;
            --sebus-ui-border: rgba(248, 211, 122, 0.45);
            --sebus-ui-border-soft: rgba(248, 211, 122, 0.2);
            --sebus-ui-shadow: 0 20px 54px rgba(0, 0, 0, .62);
            --sebus-ui-inset: inset 0 1px 0 rgba(255,255,255,.06), inset 0 0 0 1px color-mix(in srgb, var(--sebus-ui-gold-1) 8%, transparent);
            --sebus-ui-blur: blur(14px) saturate(135%);
            --sebus-ui-panel-bg: linear-gradient(170deg, color-mix(in srgb, var(--sebus-ui-bg-3) 78%, white 4%) 0%, color-mix(in srgb, var(--sebus-ui-bg-2) 84%, black 8%) 55%, color-mix(in srgb, var(--sebus-ui-bg-1) 92%, black 8%) 100%);
        }

        body[data-sebus-skin="mmo2026"] {
            --sebus-ui-bg-1: #0b0d12;
            --sebus-ui-bg-2: #141926;
            --sebus-ui-bg-3: #1a2133;
            --sebus-ui-gold-1: #f8d37a;
            --sebus-ui-gold-2: #c9922d;
            --sebus-ui-cyan: #58d8ff;
            --sebus-ui-emerald: #77ffbf;
            --sebus-ui-border: rgba(248, 211, 122, 0.45);
            --sebus-ui-border-soft: rgba(248, 211, 122, 0.2);
        }

        body[data-sebus-skin="classic"] {
            --sebus-ui-bg-1: #13100c;
            --sebus-ui-bg-2: #21180f;
            --sebus-ui-bg-3: #2b2114;
            --sebus-ui-gold-1: #ffd278;
            --sebus-ui-gold-2: #b67a26;
            --sebus-ui-cyan: #8fc7ff;
            --sebus-ui-emerald: #98ffca;
            --sebus-ui-border: rgba(255, 210, 120, 0.5);
            --sebus-ui-border-soft: rgba(255, 210, 120, 0.26);
        }

        body[data-sebus-skin="cyber"] {
            --sebus-ui-bg-1: #080b12;
            --sebus-ui-bg-2: #0e1321;
            --sebus-ui-bg-3: #101828;
            --sebus-ui-gold-1: #6ce8ff;
            --sebus-ui-gold-2: #1cb5d8;
            --sebus-ui-cyan: #53f0ff;
            --sebus-ui-emerald: #7dffef;
            --sebus-ui-border: rgba(108, 232, 255, 0.46);
            --sebus-ui-border-soft: rgba(108, 232, 255, 0.22);
        }

        body[data-sebus-skin="void"] {
            --sebus-ui-bg-1: #0a0710;
            --sebus-ui-bg-2: #130b1f;
            --sebus-ui-bg-3: #1d1230;
            --sebus-ui-gold-1: #d7b7ff;
            --sebus-ui-gold-2: #8b63d8;
            --sebus-ui-cyan: #b792ff;
            --sebus-ui-emerald: #e1b3ff;
            --sebus-ui-border: rgba(183, 146, 255, 0.48);
            --sebus-ui-border-soft: rgba(183, 146, 255, 0.24);
        }

        #sebus-main-games-nav {
            filter: drop-shadow(0 16px 24px rgba(0,0,0,.5));
        }
        #sebus-main-games-nav > div {
            border: 1px solid var(--sebus-ui-border) !important;
            border-radius: 16px !important;
            padding: 14px !important;
            background:
                radial-gradient(120% 80% at 6% 0%, color-mix(in srgb, var(--sebus-ui-cyan) 12%, transparent), transparent 45%),
                radial-gradient(120% 90% at 100% 0%, color-mix(in srgb, var(--sebus-ui-gold-1) 15%, transparent), transparent 42%),
                var(--sebus-ui-panel-bg) !important;
            box-shadow: var(--sebus-ui-shadow), var(--sebus-ui-inset) !important;
            backdrop-filter: var(--sebus-ui-blur) !important;
            color: var(--sebus-ui-text) !important;
        }
        #sebus-main-games-nav .sebus-mmo-dashboard-main .sebus-mmo-btn {
            min-height: 78px;
            font-weight: 800 !important;
            border-radius: 12px !important;
        }
        #sebus-main-games-nav .sebus-mmo-dashboard-main .sebus-mmo-btn:hover {
            transform: translateY(-2px) scale(1.01) !important;
        }
        #sebus-main-games-nav #sebus-nav-meta {
            color: var(--sebus-ui-muted) !important;
            border: 1px solid color-mix(in srgb, var(--sebus-ui-cyan) 22%, transparent);
            background: linear-gradient(180deg, color-mix(in srgb, var(--sebus-ui-cyan) 9%, transparent), rgba(0,0,0,.12));
            border-radius: 8px;
            padding: 5px 8px;
        }

        .sebus-hub-container,
        #sebus-baksy-hub,
        #sebus-hazard-panel,
        #sebus-missions-panel,
        #sebus-ranking-panel,
        #sebus-baksy-league,
        #sebus-baksy-admin,
        #sebus-mmo-chat-panel {
            border-radius: 16px !important;
            border: 1px solid var(--sebus-ui-border) !important;
            background:
                radial-gradient(140% 110% at 0% 0%, color-mix(in srgb, var(--sebus-ui-cyan) 12%, transparent), transparent 45%),
                radial-gradient(120% 90% at 100% 0%, color-mix(in srgb, var(--sebus-ui-gold-1) 14%, transparent), transparent 40%),
                var(--sebus-ui-panel-bg) !important;
            box-shadow: var(--sebus-ui-shadow), var(--sebus-ui-inset) !important;
            backdrop-filter: var(--sebus-ui-blur) !important;
            color: var(--sebus-ui-text) !important;
        }

        .sebus-baksy-hub-top {
            border-bottom: 1px solid color-mix(in srgb, var(--sebus-ui-gold-1) 22%, transparent) !important;
            padding-bottom: 8px !important;
            margin-bottom: 10px !important;
        }
        .sebus-hub-title,
        .sebus-baksy-hub-title {
            font-size: 12px !important;
            letter-spacing: .9px !important;
            color: color-mix(in srgb, var(--sebus-ui-gold-1) 80%, white 20%) !important;
            text-shadow: 0 0 14px color-mix(in srgb, var(--sebus-ui-gold-1) 22%, transparent) !important;
            text-transform: uppercase;
            border-bottom: none !important;
            margin-bottom: 0 !important;
            padding-bottom: 0 !important;
        }
        .sebus-baksy-hub-subtitle {
            color: var(--sebus-ui-muted) !important;
            opacity: .92 !important;
            letter-spacing: .35px !important;
        }
        .sebus-baksy-chip {
            border: 1px solid color-mix(in srgb, var(--sebus-ui-cyan) 28%, transparent) !important;
            background: linear-gradient(160deg, color-mix(in srgb, var(--sebus-ui-cyan) 18%, transparent), color-mix(in srgb, var(--sebus-ui-gold-1) 16%, transparent)) !important;
            color: color-mix(in srgb, var(--sebus-ui-cyan) 30%, white 70%) !important;
            box-shadow: inset 0 0 12px color-mix(in srgb, var(--sebus-ui-cyan) 16%, transparent), 0 0 12px rgba(0,0,0,.16);
        }

        .sebus-mmo-btn,
        #sebus-baksy-hub-open,
        #sebus-baksy-league-open,
        #sebus-baksy-games-open,
        #sebus-baksy-admin-open {
            border-radius: 10px !important;
            border: 1px solid var(--sebus-ui-border) !important;
            color: color-mix(in srgb, var(--sebus-ui-gold-1) 65%, white 35%) !important;
            background:
                linear-gradient(180deg, color-mix(in srgb, var(--sebus-ui-bg-3) 82%, white 6%), color-mix(in srgb, var(--sebus-ui-bg-2) 92%, black 8%)) !important;
            box-shadow:
                inset 0 1px 0 rgba(255,255,255,.08),
                inset 0 0 0 1px color-mix(in srgb, var(--sebus-ui-cyan) 12%, transparent),
                0 8px 14px rgba(0,0,0,.3) !important;
            text-shadow: 0 0 8px color-mix(in srgb, var(--sebus-ui-gold-1) 25%, transparent) !important;
            transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease, filter .18s ease !important;
        }

        .sebus-mmo-btn:hover,
        #sebus-baksy-hub-open:hover,
        #sebus-baksy-league-open:hover,
        #sebus-baksy-games-open:hover,
        #sebus-baksy-admin-open:hover {
            transform: translateY(-1px) !important;
            border-color: color-mix(in srgb, var(--sebus-ui-emerald) 78%, transparent) !important;
            box-shadow:
                inset 0 1px 0 rgba(255,255,255,.12),
                inset 0 0 0 1px color-mix(in srgb, var(--sebus-ui-emerald) 16%, transparent),
                0 0 0 2px color-mix(in srgb, var(--sebus-ui-emerald) 12%, transparent),
                0 14px 24px rgba(0,0,0,.35),
                0 0 18px color-mix(in srgb, var(--sebus-ui-emerald) 14%, transparent) !important;
            filter: brightness(1.08);
        }

        .sebus-mmo-btn:active {
            transform: translateY(0) scale(.99) !important;
        }

        .sebus-mmo-btn:focus-visible,
        #sebus-baksy-hub-open:focus-visible,
        #sebus-baksy-league-open:focus-visible,
        #sebus-baksy-games-open:focus-visible,
        #sebus-baksy-admin-open:focus-visible {
            outline: none !important;
            box-shadow:
                inset 0 1px 0 rgba(255,255,255,.12),
                0 0 0 2px color-mix(in srgb, var(--sebus-ui-cyan) 42%, transparent),
                0 0 0 5px color-mix(in srgb, var(--sebus-ui-cyan) 16%, transparent) !important;
        }

        #sebus-main-games-nav #sebus-nav-sword-sub {
            gap: 7px !important;
        }
        #sebus-main-games-nav #sebus-nav-sword-sub .sebus-mmo-btn {
            letter-spacing: .55px !important;
            font-weight: 800 !important;
            font-size: 10px !important;
            min-height: 52px;
            border-radius: 10px !important;
        }
        #sebus-main-games-nav #sebus-nav-sword-sub .sebus-mmo-btn::first-line {
            font-size: 10px;
        }

        .sebus-baksy-card,
        .sebus-mission-item,
        .sebus-league-item,
        .sebus-baksy-hub-history-item {
            border-color: var(--sebus-ui-border-soft) !important;
            background:
                linear-gradient(180deg, rgba(255,255,255,.03), rgba(255,255,255,.01)),
                linear-gradient(165deg, color-mix(in srgb, var(--sebus-ui-cyan) 5%, transparent), color-mix(in srgb, var(--sebus-ui-gold-1) 4%, transparent), rgba(0,0,0,.06)) !important;
        }

        .sebus-baksy-card h4,
        .sebus-casino-label {
            color: #f5ddaa !important;
            letter-spacing: .45px;
        }

        .sebus-baksy-hub-balance {
            font-size: clamp(28px, 2.6vw, 34px) !important;
            color: color-mix(in srgb, var(--sebus-ui-gold-1) 55%, white 45%) !important;
            text-shadow:
                0 0 16px color-mix(in srgb, var(--sebus-ui-gold-1) 28%, transparent),
                0 0 26px color-mix(in srgb, var(--sebus-ui-cyan) 14%, transparent) !important;
        }

        #sebus-baksy-hub-history,
        #sebus-missions-list {
            scrollbar-width: thin;
            scrollbar-color: color-mix(in srgb, var(--sebus-ui-gold-1) 50%, transparent) rgba(0,0,0,.24);
        }

        #sebus-baksy-hub::-webkit-scrollbar-thumb,
        #sebus-hazard-panel::-webkit-scrollbar-thumb,
        #sebus-missions-panel::-webkit-scrollbar-thumb,
        #sebus-ranking-panel::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, color-mix(in srgb, var(--sebus-ui-cyan) 42%, transparent), color-mix(in srgb, var(--sebus-ui-gold-1) 56%, transparent)) !important;
            border: 2px solid rgba(8,8,12,.95) !important;
        }

        #sebus-mmo-chat-panel .sebus-chat-header {
            border-bottom: 1px solid color-mix(in srgb, var(--sebus-ui-cyan) 24%, transparent) !important;
            background: linear-gradient(180deg, color-mix(in srgb, var(--sebus-ui-cyan) 5%, transparent), rgba(0,0,0,0));
        }
        #sebus-mmo-chat-panel .sebus-chat-bubble {
            border: 1px solid color-mix(in srgb, var(--sebus-ui-cyan) 20%, transparent) !important;
            background: linear-gradient(180deg, rgba(255,255,255,.07), rgba(255,255,255,.03)) !important;
        }
        #sebus-mmo-chat-panel .sebus-chat-msg-me .sebus-chat-bubble {
            border-color: color-mix(in srgb, var(--sebus-ui-emerald) 36%, transparent) !important;
            background: linear-gradient(180deg, color-mix(in srgb, var(--sebus-ui-emerald) 18%, transparent), color-mix(in srgb, var(--sebus-ui-emerald) 7%, transparent)) !important;
        }

        @media (prefers-reduced-motion: no-preference) {
            .sebus-mmo-btn,
            #sebus-baksy-hub-open,
            #sebus-baksy-league-open,
            #sebus-baksy-games-open,
            #sebus-baksy-admin-open {
                animation: sebus-ui-breathe 3.6s ease-in-out infinite;
            }
            #sebus-main-games-nav > div,
            #sebus-baksy-hub,
            #sebus-missions-panel,
            #sebus-ranking-panel,
            #sebus-hazard-panel {
                animation: sebus-ui-window-glow 5.4s ease-in-out infinite;
            }
            @keyframes sebus-ui-breathe {
                0%, 100% { box-shadow: inset 0 1px 0 rgba(255,255,255,.08), inset 0 0 0 1px color-mix(in srgb, var(--sebus-ui-cyan) 9%, transparent), 0 8px 14px rgba(0,0,0,.3); }
                50% { box-shadow: inset 0 1px 0 rgba(255,255,255,.12), inset 0 0 0 1px color-mix(in srgb, var(--sebus-ui-gold-1) 14%, transparent), 0 12px 20px rgba(0,0,0,.38), 0 0 14px color-mix(in srgb, var(--sebus-ui-cyan) 14%, transparent); }
            }
            @keyframes sebus-ui-window-glow {
                0%, 100% { box-shadow: var(--sebus-ui-shadow), var(--sebus-ui-inset); }
                50% { box-shadow: var(--sebus-ui-shadow), var(--sebus-ui-inset), 0 0 22px color-mix(in srgb, var(--sebus-ui-cyan) 12%, transparent); }
            }
        }

        @media (max-width: 430px) {
            #sebus-baksy-hub { width: calc(100vw - 18px); right: 9px; }
            #sebus-baksy-league { width: calc(100vw - 18px); left: 9px; }
            #sebus-baksy-admin { width: calc(100vw - 18px); right: 9px; }
            #sebus-main-games-nav { width: calc(100vw - 18px) !important; left: 9px !important; }
            #sebus-main-games-nav .sebus-mmo-dashboard-main { grid-template-columns: 1fr 1fr 1fr !important; }
            #sebus-main-games-nav #sebus-nav-sword-sub { grid-template-columns: 1fr 1fr !important; }
        }

        @keyframes sebus-sticky-pop {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    document.head.appendChild(style);

    const popupsHTML = `
        <div id="custom-gif-picker" class="sebus-popup sebus-gif-picker">
            <div class="sebus-gif-header">
                <input type="text" id="gif-search-input" placeholder="🔍 Szukaj GIFów (po polsku lub angielsku)..." autocomplete="off">
                <div class="sebus-gif-sources">
                    <button class="sebus-gif-src-btn active" data-src="tenor" type="button">Tenor</button>
                    <button class="sebus-gif-src-btn" data-src="giphy" type="button">Giphy</button>
                    <button class="sebus-gif-src-btn" data-src="tenor-pl" type="button">🇵🇱 PL</button>
                </div>
            </div>
            <div class="sebus-gif-tabs">
                <button class="sebus-gif-tab active" data-tab="recent" type="button">🕒 Ostatnie</button>
                <button class="sebus-gif-tab" data-tab="trending" type="button">🔥 Popularne</button>
                <button class="sebus-gif-tab" data-tab="results" type="button">🔎 Wyniki</button>
            </div>
            <div id="gif-results" class="sebus-popup-results sebus-gif-grid"></div>
            <div class="sebus-gif-status" id="gif-status"></div>
        </div>
        <div id="custom-mp3-picker" class="sebus-popup"><input type="text" id="mp3-search-input" placeholder="Szukaj dźwięku w bazie..."><div id="mp3-results" class="sebus-popup-results"></div></div>
    `;
    document.body.insertAdjacentHTML('beforeend', popupsHTML);

    const gifPicker = document.getElementById('custom-gif-picker');
    const gInput = document.getElementById('gif-search-input');
    const gResults = document.getElementById('gif-results');
    const mp3Picker = document.getElementById('custom-mp3-picker');
    const mInput = document.getElementById('mp3-search-input');
    const mResults = document.getElementById('mp3-results');

    // STICKY NOTES SYSTEM
    function loadPinnedMessages() {
        try {
            const raw = localStorage.getItem(pinnedMessagesStorageKey);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    }

    function savePinnedMessages(messages) {
        try {
            localStorage.setItem(pinnedMessagesStorageKey, JSON.stringify(messages));
        } catch (e) {}
    }

    function loadHiddenMessages() {
        try {
            const raw = localStorage.getItem(hiddenMessagesStorageKey);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    }

    function saveHiddenMessages(ids) {
        try {
            localStorage.setItem(hiddenMessagesStorageKey, JSON.stringify(ids));
        } catch (e) {}
    }

    function createStickyNote(author, content) {
        const note = document.createElement('div');
        note.className = 'sebus-sticky-note';
        note.innerHTML = `
            <div class="sebus-sticky-note-header">
                <span class="sebus-sticky-note-author">📌 ${escapeHtml(author)}</span>
                <button class="sebus-sticky-note-close" type="button">✕</button>
            </div>
            <div class="sebus-sticky-note-content">${escapeHtml(content)}</div>
        `;

        const closeBtn = note.querySelector('.sebus-sticky-note-close');
        closeBtn.onclick = () => {
            const pinnedMessages = loadPinnedMessages();
            const filtered = pinnedMessages.filter(m => !(m.author === author && m.content === content));
            savePinnedMessages(filtered);
            renderPinnedNotesInChat();
        };

        return note;
    }

    function renderPinnedNotesInChat() {
        const chatBox = document.getElementById('chatboxWrap') || document.getElementById('chatcontent')?.parentElement;
        if (!chatBox) return;

        let pinnedContainer = document.getElementById('sebus-pinned-container-chat');
        if (!pinnedContainer) {
            pinnedContainer = document.createElement('div');
            pinnedContainer.id = 'sebus-pinned-container-chat';
            pinnedContainer.className = 'sebus-pinned-container-chat';
            chatBox.insertBefore(pinnedContainer, chatBox.firstChild);
        }

        const pinnedMessages = loadPinnedMessages();

        // Porównujemy aktualny stan z renderowanym - nie odświeżamy jeśli nic się nie zmieniło
        const currentKey = JSON.stringify(pinnedMessages);
        if (pinnedContainer.dataset.lastKey === currentKey) return;
        pinnedContainer.dataset.lastKey = currentKey;

        pinnedContainer.innerHTML = '';
        if (pinnedMessages.length === 0) return;
        pinnedMessages.forEach(msg => {
            const note = createStickyNote(msg.author, msg.content);
            pinnedContainer.appendChild(note);
        });
    }

    function addPinnedMessage(author, content) {
        if (!content || !content.trim()) return;

        const pinnedMessages = loadPinnedMessages();
        const isDuplicate = pinnedMessages.some(m => m.author === author && m.content === content);
        if (isDuplicate) return;

        pinnedMessages.push({ author: author.trim(), content: content.trim() });
        savePinnedMessages(pinnedMessages);
        renderPinnedNotesInChat();
    }

    function escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    function initMessageContextMenu() {
        if (contextMenuInitialized) return;
        contextMenuInitialized = true;

        document.addEventListener('click', (e) => {
            const pinBtn = e.target.closest('.sebus-pin-msg-btn');
            if (!pinBtn) return;
            if (!appSettings.features.stickyNotes) return;

            e.preventDefault();
            e.stopPropagation();

            const chatMessage = pinBtn.closest('li.chat_row, li.ipsDataItem');
            if (!chatMessage) return;

            const author = (
                chatMessage.querySelector('[data-action="mention"][data-member]')?.getAttribute('data-member') ||
                chatMessage.querySelector('[data-action="mention"]')?.textContent?.trim() ||
                'Autor'
            ).trim();

            // chatraw_ jest WEWNĄTRZ li, nie osobnym elementem
            const rawDiv = chatMessage.querySelector('[id^="chatraw_"], .ipsList_inline');
            let content = (rawDiv?.innerText || rawDiv?.textContent || '').trim();

            content = content.split('\n')
                .map(l => l.trim())
                .filter(l => l.length > 0)
                .join(' ');

            if (content && content.length > 1) {
                addPinnedMessage(author, content);
                // Wizualna informacja że przypiono
                pinBtn.textContent = '✔️';
                setTimeout(() => { pinBtn.textContent = '📌'; }, 1500);
            }
        });
    }

    function applyHiddenMessages() {
        const hidden = loadHiddenMessages();
        if (hidden.length === 0) return;
        hidden.forEach(id => {
            const msg = document.getElementById(id);
            if (msg) msg.style.display = 'none';
        });
    }

    function addPinButtonToMessages() {
        if (!appSettings.features.stickyNotes) return;

        document.querySelectorAll('#chatcontent li.chat_row:not([data-sebus-pin-added])').forEach(msg => {
            msg.setAttribute('data-sebus-pin-added', 'true');

            // Przywracamy stan ukrycia
            if (msg.id && loadHiddenMessages().includes(msg.id)) {
                msg.style.display = 'none';
                return;
            }

            const pinBtn = document.createElement('button');
            pinBtn.type = 'button';
            pinBtn.className = 'sebus-pin-msg-btn';
            pinBtn.title = 'Przypnij wiadomość';
            pinBtn.textContent = '📌';

            const hideBtn = document.createElement('button');
            hideBtn.type = 'button';
            hideBtn.className = 'sebus-pin-msg-btn sebus-hide-msg-btn';
            hideBtn.title = 'Ukryj wiadomość (trwale)';
            hideBtn.textContent = '🗑️';
            hideBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (msg.id) {
                    const hidden = loadHiddenMessages();
                    if (!hidden.includes(msg.id)) {
                        hidden.push(msg.id);
                        // Trzymamy max 500 ostatnich ukrytych
                        if (hidden.length > 500) hidden.splice(0, hidden.length - 500);
                        saveHiddenMessages(hidden);
                    }
                }
                msg.style.transition = 'opacity 0.3s';
                msg.style.opacity = '0';
                setTimeout(() => { msg.style.display = 'none'; }, 300);
            };

            const dateSpan = msg.querySelector('.ipsPos_right');
            if (dateSpan) {
                dateSpan.insertBefore(hideBtn, dateSpan.firstChild);
                dateSpan.insertBefore(pinBtn, dateSpan.firstChild);
            } else {
                const div = msg.querySelector('div');
                if (div) { div.appendChild(pinBtn); div.appendChild(hideBtn); }
            }
        });
    }

    function initSettingsPanelIfNeeded() {
        if (document.getElementById('sebus-settings-open')) return;

        const openBtn = document.createElement('button');
        openBtn.id = 'sebus-settings-open';
        openBtn.type = 'button';
        openBtn.textContent = 'Ustawienia';

        const footerAnchor = document.createElement('div');
        footerAnchor.id = 'sebus-settings-footer-anchor';
        footerAnchor.appendChild(openBtn);

        const panel = document.createElement('div');
        panel.id = 'sebus-settings-panel';
        panel.innerHTML = `
            <div class="sebus-settings-title">Panel Ustawień</div>
            <div class="sebus-settings-row"><label for="sebus-opt-chat-tools">GIF/MP3 przyciski</label><input id="sebus-opt-chat-tools" type="checkbox"></div>
            <div class="sebus-settings-row"><label for="sebus-opt-editor-stats">Statystyki edytora</label><input id="sebus-opt-editor-stats" type="checkbox"></div>
            <div class="sebus-settings-row"><label for="sebus-opt-nick-glow">Podświetlanie nicków</label><input id="sebus-opt-nick-glow" type="checkbox"></div>
            <div class="sebus-settings-row"><label for="sebus-opt-gold-sebus">SebuśPL zawsze złoty</label><input id="sebus-opt-gold-sebus" type="checkbox"></div>
            <div class="sebus-settings-row"><label for="sebus-opt-sticky-notes">Sticky Notes (Przypinanie)</label><input id="sebus-opt-sticky-notes" type="checkbox"></div>
            <div class="sebus-settings-row"><label for="sebus-opt-real-time-activity">Wykrywacz Życia (RT)</label><input id="sebus-opt-real-time-activity" type="checkbox"></div>
            <div class="sebus-settings-row"><label for="sebus-opt-ghost-curtain">Złota Kurtyna (Ghost Cleaner)</label><input id="sebus-opt-ghost-curtain" type="checkbox"></div>
            <div class="sebus-settings-row"><label for="sebus-opt-ghost-curtain-level">Poziom Kurtyny</label><select id="sebus-opt-ghost-curtain-level"><option value="0">0 - Domyślny</option><option value="1">1 - Light</option><option value="2">2 - Focus</option><option value="3">3 - Hardcore</option></select></div>
            <div class="sebus-settings-row"><label for="sebus-opt-ui-skin">Skin MMO (UI)</label><select id="sebus-opt-ui-skin"><option value="mmo2026">MMO 2026 (Domyślny)</option><option value="classic">Classic Fantasy</option><option value="cyber">Cyber Neon</option><option value="void">Void Arcane</option></select></div>
            <div class="sebus-settings-row"><label for="sebus-opt-activity-active-min">Próg aktywności (min)</label><select id="sebus-opt-activity-active-min"><option value="2">2</option><option value="5">5</option><option value="10">10</option><option value="15">15</option></select></div>
            <div class="sebus-settings-row"><label for="sebus-opt-activity-ghost-hours">Próg ducha (h)</label><select id="sebus-opt-activity-ghost-hours"><option value="2">2</option><option value="4">4</option><option value="6">6</option><option value="12">12</option></select></div>
            <div class="sebus-settings-row"><label for="sebus-opt-activity-profile">Pobieraj z profilu</label><input id="sebus-opt-activity-profile" type="checkbox"></div>
            <div class="sebus-settings-row"><label for="sebus-opt-activity-only-active">Pokaż tylko aktywnych</label><input id="sebus-opt-activity-only-active" type="checkbox"></div>
            <div class="sebus-settings-row"><label for="sebus-opt-baksy">Sebuś-Baksy</label><input id="sebus-opt-baksy" type="checkbox"></div>
            <div class="sebus-settings-row"><label for="sebus-opt-games-menu">Menu Gier</label><input id="sebus-opt-games-menu" type="checkbox"></div>
            <div class="sebus-settings-row"><label for="sebus-opt-hazard">Hazard</label><input id="sebus-opt-hazard" type="checkbox"></div>
            <div class="sebus-settings-row"><label for="sebus-opt-missions">Misje</label><input id="sebus-opt-missions" type="checkbox"></div>
            <div class="sebus-settings-row"><label for="sebus-opt-ranking">Ranking</label><input id="sebus-opt-ranking" type="checkbox"></div>
            <div class="sebus-settings-row"><label for="sebus-opt-mmo-chat">Czat MMO</label><input id="sebus-opt-mmo-chat" type="checkbox"></div>
            <div class="sebus-settings-row"><label for="sebus-opt-event-debug">Event Debug (MMO)</label><input id="sebus-opt-event-debug" type="checkbox"></div>
            <div class="sebus-settings-row" style="align-items:flex-start;gap:6px;">
                <label for="sebus-event-debug-preview" style="padding-top:4px;">Podgląd Eventów</label>
                <div id="sebus-event-debug-preview" style="flex:1;max-height:120px;overflow:auto;border:1px solid #444;background:#0b0b0b;color:#cfcfcf;font-size:10px;line-height:1.35;border-radius:6px;padding:6px;"></div>
            </div>
            <div class="sebus-settings-row"><label for="sebus-opt-radio">Radio</label><input id="sebus-opt-radio" type="checkbox"></div>
            <div class="sebus-settings-row"><label for="sebus-opt-radio-station">Stacja startowa</label><select id="sebus-opt-radio-station"></select></div>
            <div class="sebus-settings-row"><label for="sebus-opt-radio-volume">Głośność startowa</label><select id="sebus-opt-radio-volume">
                <option value="0">MUTE</option><option value="1">VOL1</option><option value="2">VOL2</option><option value="3">VOL3</option>
            </select></div>
            <div class="sebus-settings-row" style="border-top:1px solid rgba(255,215,0,.12);margin-top:4px;padding-top:4px;">
                <label style="color:#ffd700;font-weight:700;font-size:9px;text-transform:uppercase;letter-spacing:.3px;">Multiplayer</label>
            </div>
            <div class="sebus-settings-row"><label for="sebus-opt-watch">Watch Together 🎬</label><input id="sebus-opt-watch" type="checkbox"></div>
            <div class="sebus-settings-row"><label for="sebus-opt-minigames">Mini Gry 🎮</label><input id="sebus-opt-minigames" type="checkbox"></div>
            <div class="sebus-settings-row"><label for="sebus-opt-gifparty">GIF Party 🎉</label><input id="sebus-opt-gifparty" type="checkbox"></div>
            <div class="sebus-settings-row"><label for="sebus-opt-whiteboard">Tablica 🖌️</label><input id="sebus-opt-whiteboard" type="checkbox"></div>
            <div class="sebus-settings-row"><label>Ukryte wiadomości</label><button id="sebus-clear-hidden" type="button" style="height:22px;padding:0 8px;border-radius:5px;border:1px solid #555;background:#111;color:#FFD700;font-size:10px;cursor:pointer;">Wyczyść (🗑️)</button></div>
            <div id="sebus-baksy-panel">
                <div class="sebus-baksy-title">Sebuś-Baksy • Ekonomia Prestiżu</div>
                <div id="sebus-baksy-balance" class="sebus-baksy-balance">0 💵</div>
                <div id="sebus-baksy-stats" class="sebus-baksy-stats">zarobione: 0 | wydane: 0</div>
                <div class="sebus-baksy-row">
                    <label for="sebus-opt-baksy-post" style="min-width:90px;">Post</label>
                    <select id="sebus-opt-baksy-post"><option value="3">$3</option><option value="5">$5</option><option value="8">$8</option><option value="10">$10</option></select>
                </div>
                <div class="sebus-baksy-row">
                    <label for="sebus-opt-baksy-chat" style="min-width:90px;">Chat</label>
                    <select id="sebus-opt-baksy-chat"><option value="1">$1</option><option value="2">$2</option><option value="3">$3</option></select>
                </div>
                <div class="sebus-baksy-row">
                    <button id="sebus-baksy-buy-rain" type="button">Złoty Deszcz ($120)</button>
                    <button id="sebus-baksy-buy-red" type="button">Neon Red ($80)</button>
                </div>
                <div class="sebus-baksy-row">
                    <button id="sebus-baksy-buy-purple" type="button">Neon Violet ($80)</button>
                    <button id="sebus-baksy-buy-highlight" type="button">Highlight Post ($60)</button>
                </div>
                <div class="sebus-baksy-row">
                    <input id="sebus-baksy-highlight-id" type="text" placeholder="ID posta do wyróżnienia">
                </div>
                <div class="sebus-baksy-row">
                    <input id="sebus-baksy-transfer-to" type="text" placeholder="ID odbiorcy">
                    <input id="sebus-baksy-transfer-amount" type="number" min="1" step="1" placeholder="Kwota">
                    <button id="sebus-baksy-transfer-btn" type="button">Przelej</button>
                </div>
                <div id="sebus-baksy-feedback"></div>
            </div>
            <div class="sebus-settings-foot"><button id="sebus-settings-close" type="button">Zamknij</button></div>
        `;

        document.body.appendChild(panel);
        document.body.appendChild(footerAnchor);

        const settingsFoot = panel.querySelector('.sebus-settings-foot');
        if (settingsFoot) {
            const baksyHubOpenBtn = document.createElement('button');
            baksyHubOpenBtn.id = 'sebus-open-baksy-hub-from-settings';
            baksyHubOpenBtn.type = 'button';
            baksyHubOpenBtn.textContent = '🎰 Otwórz Baksy Hub';
            baksyHubOpenBtn.style.marginRight = '8px';
            baksyHubOpenBtn.style.height = '24px';
            baksyHubOpenBtn.style.padding = '0 8px';
            baksyHubOpenBtn.style.borderRadius = '6px';
            baksyHubOpenBtn.style.border = '1px solid #555';
            baksyHubOpenBtn.style.background = '#111';
            baksyHubOpenBtn.style.color = '#FFD700';
            baksyHubOpenBtn.style.cursor = 'pointer';
            settingsFoot.prepend(baksyHubOpenBtn);
        }

        const stationSelect = panel.querySelector('#sebus-opt-radio-station');
        stationSelect.innerHTML = radioStations.map((station, index) => `<option value="${index}">${station.name}</option>`).join('');

        const chatToolsCheckbox = panel.querySelector('#sebus-opt-chat-tools');
        const editorStatsCheckbox = panel.querySelector('#sebus-opt-editor-stats');
        const nickGlowCheckbox = panel.querySelector('#sebus-opt-nick-glow');
        const goldSebusCheckbox = panel.querySelector('#sebus-opt-gold-sebus');
        const stickyNotesCheckbox = panel.querySelector('#sebus-opt-sticky-notes');
        const realTimeActivityCheckbox = panel.querySelector('#sebus-opt-real-time-activity');
        const ghostCurtainCheckbox = panel.querySelector('#sebus-opt-ghost-curtain');
        const ghostCurtainLevelSelect = panel.querySelector('#sebus-opt-ghost-curtain-level');
        const activityActiveMinSelect = panel.querySelector('#sebus-opt-activity-active-min');
        const activityGhostHoursSelect = panel.querySelector('#sebus-opt-activity-ghost-hours');
        const activityProfileCheckbox = panel.querySelector('#sebus-opt-activity-profile');
        const activityOnlyActiveCheckbox = panel.querySelector('#sebus-opt-activity-only-active');
        const baksyCheckbox = panel.querySelector('#sebus-opt-baksy');
        const gamesMenuCheckbox = panel.querySelector('#sebus-opt-games-menu');
        const hazardCheckbox = panel.querySelector('#sebus-opt-hazard');
        const missionsCheckbox = panel.querySelector('#sebus-opt-missions');
        const rankingCheckbox = panel.querySelector('#sebus-opt-ranking');
        const mmoChatCheckbox = panel.querySelector('#sebus-opt-mmo-chat');
        const eventDebugCheckbox = panel.querySelector('#sebus-opt-event-debug');
        const uiSkinSelect = panel.querySelector('#sebus-opt-ui-skin');
        const eventDebugPreview = panel.querySelector('#sebus-event-debug-preview');
        const baksyPostRewardSelect = panel.querySelector('#sebus-opt-baksy-post');
        const baksyChatRewardSelect = panel.querySelector('#sebus-opt-baksy-chat');
        const baksyBuyRainBtn = panel.querySelector('#sebus-baksy-buy-rain');
        const baksyBuyRedBtn = panel.querySelector('#sebus-baksy-buy-red');
        const baksyBuyPurpleBtn = panel.querySelector('#sebus-baksy-buy-purple');
        const baksyBuyHighlightBtn = panel.querySelector('#sebus-baksy-buy-highlight');
        const baksyHighlightIdInput = panel.querySelector('#sebus-baksy-highlight-id');
        const baksyTransferToInput = panel.querySelector('#sebus-baksy-transfer-to');
        const baksyTransferAmountInput = panel.querySelector('#sebus-baksy-transfer-amount');
        const baksyTransferBtn = panel.querySelector('#sebus-baksy-transfer-btn');
        const baksyFeedback = panel.querySelector('#sebus-baksy-feedback');
        const openBaksyHubFromSettingsBtn = panel.querySelector('#sebus-open-baksy-hub-from-settings');
        const radioCheckbox = panel.querySelector('#sebus-opt-radio');
        const volumeSelect = panel.querySelector('#sebus-opt-radio-volume');
        const watchCheckbox      = panel.querySelector('#sebus-opt-watch');
        const miniGamesCheckbox  = panel.querySelector('#sebus-opt-minigames');
        const gifPartyCheckbox   = panel.querySelector('#sebus-opt-gifparty');
        const whiteboardCheckbox = panel.querySelector('#sebus-opt-whiteboard');
        const closeBtn = panel.querySelector('#sebus-settings-close');
        const clearHiddenBtn = panel.querySelector('#sebus-clear-hidden');

        const syncActivityControlsState = () => {
            const enabled = !!realTimeActivityCheckbox.checked;
            activityActiveMinSelect.disabled = !enabled;
            activityGhostHoursSelect.disabled = !enabled;
            activityProfileCheckbox.disabled = !enabled;
            activityOnlyActiveCheckbox.disabled = !enabled;
        };

        const syncBaksyControlsState = () => {
            const enabled = !!baksyCheckbox.checked;
            baksyPostRewardSelect.disabled = !enabled;
            baksyChatRewardSelect.disabled = !enabled;
            baksyBuyRainBtn.disabled = !enabled;
            baksyBuyRedBtn.disabled = !enabled;
            baksyBuyPurpleBtn.disabled = !enabled;
            baksyBuyHighlightBtn.disabled = !enabled;
            baksyHighlightIdInput.disabled = !enabled;
            baksyTransferToInput.disabled = !enabled || !appSettings.baksy.transfersEnabled;
            baksyTransferAmountInput.disabled = !enabled || !appSettings.baksy.transfersEnabled;
            baksyTransferBtn.disabled = !enabled || !appSettings.baksy.transfersEnabled;
        };

        const syncMmoMenuControlsState = () => {
            const menuEnabled = !!gamesMenuCheckbox.checked;
            gamesMenuCheckbox.disabled = false;
            hazardCheckbox.disabled = !menuEnabled;
            missionsCheckbox.disabled = !menuEnabled;
            rankingCheckbox.disabled = !menuEnabled;
            if (mmoChatCheckbox) mmoChatCheckbox.disabled = !menuEnabled;
        };

        const syncGhostCurtainControlsState = () => {
            const enabled = !!ghostCurtainCheckbox.checked;
            ghostCurtainLevelSelect.disabled = !enabled;
        };

        const renderEventDebugPreview = () => {
            if (!eventDebugPreview) return;
            const entries = mmoEventDebugHistory.slice(-12).reverse();
            if (!entries.length) {
                eventDebugPreview.textContent = 'Brak eventów MMO w tej sesji.';
                return;
            }
            const lines = entries.map(entry => {
                const dt = new Date(Number(entry.at || 0));
                const hh = String(dt.getHours()).padStart(2, '0');
                const mm = String(dt.getMinutes()).padStart(2, '0');
                const ss = String(dt.getSeconds()).padStart(2, '0');
                let shortPayload = '';
                try {
                    shortPayload = JSON.stringify(entry.payload || {});
                } catch (e) {
                    shortPayload = '[payload]';
                }
                if (shortPayload.length > 110) shortPayload = `${shortPayload.slice(0, 107)}...`;
                return `[${hh}:${mm}:${ss}] ${entry.event} (L:${Number(entry.listeners || 0)}) ${shortPayload}`;
            });
            eventDebugPreview.textContent = lines.join('\n');
        };

        let eventDebugPreviewTimer = null;

        const render = () => {
            chatToolsCheckbox.checked = !!appSettings.features.chatTools;
            editorStatsCheckbox.checked = !!appSettings.features.editorStats;
            nickGlowCheckbox.checked = !!appSettings.features.nickGlow;
            goldSebusCheckbox.checked = !!appSettings.features.goldSebus;
            stickyNotesCheckbox.checked = !!appSettings.features.stickyNotes;
            realTimeActivityCheckbox.checked = !!appSettings.features.realTimeActivity;
            ghostCurtainCheckbox.checked = !!appSettings.features.ghostCurtain;
            ghostCurtainLevelSelect.value = String(Math.max(0, Math.min(3, Number(appSettings.ghostCurtain.level) || 0)));
            activityActiveMinSelect.value = String(Math.max(1, Math.min(60, Number(appSettings.activity.activeMinutesThreshold) || 5)));
            activityGhostHoursSelect.value = String(Math.max(1, Math.min(48, Number(appSettings.activity.ghostHoursThreshold) || 4)));
            activityProfileCheckbox.checked = !!appSettings.activity.useProfileLookup;
            activityOnlyActiveCheckbox.checked = !!appSettings.activity.showOnlyActive;
            baksyCheckbox.checked = !!appSettings.features.baksy;
            gamesMenuCheckbox.checked = !!appSettings.features.gamesMenu;
            hazardCheckbox.checked = !!appSettings.features.hazard;
            missionsCheckbox.checked = !!appSettings.features.missions;
            rankingCheckbox.checked = !!appSettings.features.ranking;
            if (mmoChatCheckbox) mmoChatCheckbox.checked = !!appSettings.features.mmoChat;
            eventDebugCheckbox.checked = !!appSettings.features.eventDebug;
            if (uiSkinSelect) uiSkinSelect.value = normalizeUiSkin(appSettings?.ui?.skin);
            baksyPostRewardSelect.value = String(Math.max(0, Number(appSettings.baksy.postReward) || 5));
            baksyChatRewardSelect.value = String(Math.max(0, Number(appSettings.baksy.chatReward) || 1));
            radioCheckbox.checked = !!appSettings.features.radio;
            stationSelect.value = String(Math.max(0, Math.min(radioStations.length - 1, Number(appSettings.radio.stationIndex) || 0)));
            volumeSelect.value = String(Math.max(0, Math.min(3, Number(appSettings.radio.volumeLevelIndex) || 0)));
            if (watchCheckbox)      watchCheckbox.checked      = !!appSettings.features.watchTogether;
            if (miniGamesCheckbox)  miniGamesCheckbox.checked  = !!appSettings.features.miniGames;
            if (gifPartyCheckbox)   gifPartyCheckbox.checked   = !!appSettings.features.gifParty;
            if (whiteboardCheckbox) whiteboardCheckbox.checked = !!appSettings.features.whiteboard;
            syncActivityControlsState();
            syncBaksyControlsState();
            syncMmoMenuControlsState();
            syncGhostCurtainControlsState();
            syncBaksyUiSummary();
            renderEventDebugPreview();
        };

        render();

        openBtn.onclick = (e) => {
            e.preventDefault();
            render();
            panel.classList.toggle('show');
            if (panel.classList.contains('show')) {
                if (eventDebugPreviewTimer) clearInterval(eventDebugPreviewTimer);
                eventDebugPreviewTimer = setInterval(() => {
                    if (!panel.classList.contains('show')) return;
                    renderEventDebugPreview();
                }, 1000);
            } else if (eventDebugPreviewTimer) {
                clearInterval(eventDebugPreviewTimer);
                eventDebugPreviewTimer = null;
            }
        };

        closeBtn.onclick = (e) => {
            e.preventDefault();
            panel.classList.remove('show');
            if (eventDebugPreviewTimer) {
                clearInterval(eventDebugPreviewTimer);
                eventDebugPreviewTimer = null;
            }
        };

        document.addEventListener('click', (e) => {
            if (!panel.classList.contains('show')) return;
            if (panel.contains(e.target) || openBtn.contains(e.target)) return;
            panel.classList.remove('show');
            if (eventDebugPreviewTimer) {
                clearInterval(eventDebugPreviewTimer);
                eventDebugPreviewTimer = null;
            }
        });

        chatToolsCheckbox.addEventListener('change', () => setFeatureSetting('chatTools', chatToolsCheckbox.checked));
        editorStatsCheckbox.addEventListener('change', () => setFeatureSetting('editorStats', editorStatsCheckbox.checked));
        nickGlowCheckbox.addEventListener('change', () => setFeatureSetting('nickGlow', nickGlowCheckbox.checked));
        goldSebusCheckbox.addEventListener('change', () => setFeatureSetting('goldSebus', goldSebusCheckbox.checked));
        ghostCurtainCheckbox.addEventListener('change', () => {
            setFeatureSetting('ghostCurtain', ghostCurtainCheckbox.checked);
            if (ghostCurtainCheckbox.checked && Number(ghostCurtainLevelSelect.value) === 0) {
                ghostCurtainLevelSelect.value = '1';
                setGhostCurtainSetting('level', 1);
            }
            syncGhostCurtainControlsState();
        });
        ghostCurtainLevelSelect.addEventListener('change', () => {
            const level = Math.max(0, Math.min(3, Number(ghostCurtainLevelSelect.value) || 0));
            setGhostCurtainSetting('level', level);
            if (level === 0) {
                setFeatureSetting('ghostCurtain', false);
                ghostCurtainCheckbox.checked = false;
                syncGhostCurtainControlsState();
                return;
            }

            if (!ghostCurtainCheckbox.checked) {
                setFeatureSetting('ghostCurtain', true);
                ghostCurtainCheckbox.checked = true;
                syncGhostCurtainControlsState();
            }

            if (ghostCurtainCheckbox.checked) lastGhostCurtainRunAt = 0;
        });
        realTimeActivityCheckbox.addEventListener('change', () => {
            setFeatureSetting('realTimeActivity', realTimeActivityCheckbox.checked);
            syncActivityControlsState();
        });
        activityActiveMinSelect.addEventListener('change', () => {
            const value = Math.max(1, Math.min(60, Number(activityActiveMinSelect.value) || 5));
            setActivitySetting('activeMinutesThreshold', value);
        });
        activityGhostHoursSelect.addEventListener('change', () => {
            const value = Math.max(1, Math.min(48, Number(activityGhostHoursSelect.value) || 4));
            setActivitySetting('ghostHoursThreshold', value);
        });
        activityProfileCheckbox.addEventListener('change', () => setActivitySetting('useProfileLookup', activityProfileCheckbox.checked));
        activityOnlyActiveCheckbox.addEventListener('change', () => setActivitySetting('showOnlyActive', activityOnlyActiveCheckbox.checked));
        baksyCheckbox.addEventListener('change', () => {
            setFeatureSetting('baksy', baksyCheckbox.checked);
            syncBaksyControlsState();
            syncMmoMenuControlsState();
        });
        gamesMenuCheckbox.addEventListener('change', () => {
            setFeatureSetting('gamesMenu', gamesMenuCheckbox.checked);
            syncMmoMenuControlsState();
        });
        hazardCheckbox.addEventListener('change', () => setFeatureSetting('hazard', hazardCheckbox.checked));
        missionsCheckbox.addEventListener('change', () => setFeatureSetting('missions', missionsCheckbox.checked));
        rankingCheckbox.addEventListener('change', () => setFeatureSetting('ranking', rankingCheckbox.checked));
        if (mmoChatCheckbox) {
            mmoChatCheckbox.addEventListener('change', () => setFeatureSetting('mmoChat', mmoChatCheckbox.checked));
        }
        eventDebugCheckbox.addEventListener('change', () => {
            setFeatureSetting('eventDebug', eventDebugCheckbox.checked);
            renderEventDebugPreview();
        });
        if (uiSkinSelect) {
            uiSkinSelect.addEventListener('change', () => {
                setUiSetting('skin', uiSkinSelect.value);
                render();
            });
        }
        baksyPostRewardSelect.addEventListener('change', () => {
            const value = Math.max(0, Number(baksyPostRewardSelect.value) || 5);
            setBaksySetting('postReward', value);
        });
        baksyChatRewardSelect.addEventListener('change', () => {
            const value = Math.max(0, Number(baksyChatRewardSelect.value) || 1);
            setBaksySetting('chatReward', value);
        });
        baksyBuyRainBtn.addEventListener('click', () => {
            const result = purchaseBaksyItem('goldRain');
            baksyFeedback.textContent = result.message;
            scheduleModules(['baksy', 'nickGlow'], { immediate: true });
        });
        baksyBuyRedBtn.addEventListener('click', () => {
            const result = purchaseBaksyItem('neonRed');
            baksyFeedback.textContent = result.message;
            scheduleModules(['baksy', 'nickGlow'], { immediate: true });
        });
        baksyBuyPurpleBtn.addEventListener('click', () => {
            const result = purchaseBaksyItem('neonPurple');
            baksyFeedback.textContent = result.message;
            scheduleModules(['baksy', 'nickGlow'], { immediate: true });
        });
        baksyBuyHighlightBtn.addEventListener('click', () => {
            const result = purchaseBaksyItem('highlightPost', { postId: baksyHighlightIdInput.value.trim() });
            baksyFeedback.textContent = result.message;
            scheduleModule('baksy', { immediate: true });
        });
        baksyTransferBtn.addEventListener('click', () => {
            const result = transferBaksy(baksyTransferToInput.value, baksyTransferAmountInput.value);
            baksyFeedback.textContent = result.message;
            if (result.ok) {
                baksyTransferAmountInput.value = '';
                scheduleModule('baksy', { immediate: true });
            }
        });
        if (openBaksyHubFromSettingsBtn) {
            openBaksyHubFromSettingsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                initBaksyHubIfNeeded();
                const hub = document.getElementById('sebus-baksy-hub');
                if (hub) hub.classList.toggle('show');
                syncBaksyUiSummary();
            });
        }
        stickyNotesCheckbox.addEventListener('change', () => {
            setFeatureSetting('stickyNotes', stickyNotesCheckbox.checked);
            if (!stickyNotesCheckbox.checked) {
                const container = document.getElementById('sebus-pinned-container');
                const containerChat = document.getElementById('sebus-pinned-container-chat');
                if (container) container.innerHTML = '';
                if (containerChat) containerChat.innerHTML = '';
            }
        });
        radioCheckbox.addEventListener('change', () => {
            setFeatureSetting('radio', radioCheckbox.checked);
            if (!radioCheckbox.checked) {
                const radio = document.getElementById('sebus-mini-radio');
                if (radio) radio.style.display = 'none';
                if (radioAudio && !radioAudio.paused) radioAudio.pause();
            }
        });
        if (watchCheckbox) watchCheckbox.addEventListener('change', () => {
            setFeatureSetting('watchTogether', watchCheckbox.checked);
            const t = document.getElementById('sebus-watch-toggle'), p = document.getElementById('sebus-watch-panel');
            if (!watchCheckbox.checked) { if(t) t.remove(); if(p) p.remove(); }
        });
        if (miniGamesCheckbox) miniGamesCheckbox.addEventListener('change', () => {
            setFeatureSetting('miniGames', miniGamesCheckbox.checked);
            const p = document.getElementById('sebus-games-panel');
            if (!miniGamesCheckbox.checked) { if (p) p.remove(); }
        });
        if (gifPartyCheckbox) gifPartyCheckbox.addEventListener('change', () => {
            setFeatureSetting('gifParty', gifPartyCheckbox.checked);
            const t = document.getElementById('sebus-gifparty-toggle'), p = document.getElementById('sebus-gifparty-panel');
            if (!gifPartyCheckbox.checked) { if(t) t.remove(); if(p) p.remove(); }
        });
        if (whiteboardCheckbox) whiteboardCheckbox.addEventListener('change', () => {
            setFeatureSetting('whiteboard', whiteboardCheckbox.checked);
            const t = document.getElementById('sebus-whiteboard-toggle'), p = document.getElementById('sebus-whiteboard-panel');
            if (!whiteboardCheckbox.checked) { if(t) t.remove(); if(p) p.remove(); }
        });

        clearHiddenBtn.addEventListener('click', (e) => {
            e.preventDefault();
            saveHiddenMessages([]);
            document.querySelectorAll('#chatcontent li.chat_row').forEach(msg => {
                if (msg.style.display === 'none') {
                    msg.style.display = '';
                    msg.style.opacity = '';
                }
            });
            clearHiddenBtn.textContent = '✔️ Wyczyszczono';
            setTimeout(() => { clearHiddenBtn.textContent = 'Wyczyść (🗑️)'; }, 2000);
        });

        stationSelect.addEventListener('change', () => setRadioSetting('stationIndex', Number(stationSelect.value) || 0));
        volumeSelect.addEventListener('change', () => {
            const idx = Math.max(0, Math.min(3, Number(volumeSelect.value) || 0));
            setRadioSetting('volumeLevelIndex', idx);
            if (radioAudio) radioAudio.volume = [0, 0.2, 0.4, 0.7][idx];
        });
    }

    function insertIntoChat(content) {
        const target = document.querySelector('input[placeholder*="wiadomość"], .cChatBox_message, [contenteditable="true"]');
        if (target) {
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') target.value += ` ${content} `;
            else target.innerHTML += ` ${content} `;
            target.dispatchEvent(new Event('input', { bubbles: true }));
            target.focus();
        }
    }

    // ═══════════════════════════════════════════════════════════════════
    // EXPORT SEBUS UI HELPERS — ostateczna inicjalizacja po wszystkich definicjach
    // ═══════════════════════════════════════════════════════════════════
    window.sebusUiAlert = sebusUiAlert;
    window.sebusUiNotify = sebusUiNotify;
    window.sebusUiConfirm = sebusUiConfirm;
    window.sebusUiPrompt = sebusUiPrompt;
