// Module: 60-media-chat-tools.js
// Source: e:\mpcforum-userscript\skrypt:6248-6896
// Purpose: GIF search, MP3 picker, radio widgets and chat media tools

    // ═══════════════════════════════════════════
    //  GIF PICKER — wieloźródłowy, ostatnio używane
    // ═══════════════════════════════════════════
    const GIF_RECENT_KEY = 'sebus_gif_recent_v1';
    const GIF_RECENT_MAX = 24;
    const GIF_FIREBASE_STATS_PATH = `${baksySharedRootPath}/gifStats`;
    // Polskie query do trybu trending PL
    const GIF_PL_TRENDING_QUERIES = ['śmiech', 'taniec', 'wow', 'dobranoc', 'dzień dobry', 'tak', 'nie', 'brawo', 'okej', 'serio', 'nope', 'facepalm', 'cześć', 'super', 'kurde', 'hej', 'co', 'lol'];
    let gifCurrentSource = 'tenor'; // tenor | giphy | tenor-pl
    let gifCurrentTab = 'recent';   // recent | trending | results
    let gifSearchTimeout = null;
    let gifAbortController = null;

    function loadRecentGifs() {
        try { return JSON.parse(localStorage.getItem(GIF_RECENT_KEY) || '[]'); } catch { return []; }
    }

    function saveRecentGif(url, previewUrl) {
        try {
            const list = loadRecentGifs().filter(g => g.url !== url);
            list.unshift({ url, previewUrl: previewUrl || url, usedAt: Date.now() });
            localStorage.setItem(GIF_RECENT_KEY, JSON.stringify(list.slice(0, GIF_RECENT_MAX)));
        } catch { }
    }

    // Rejestruje użycie GIF-a w Firebase (globalny licznik popularności)
    function trackGifUsage(url, previewUrl) {
        if (!firebaseSyncEnabled) return;
        try {
            // Klucz: hash URL bezpieczny dla Firebase (bez /, ., #, $, [, ])
            const key = btoa(url).replace(/[/+=]/g, c => ({ '/': '_', '+': '-', '=': '' })[c]).slice(0, 120);
            firebaseReadPath(`${GIF_FIREBASE_STATS_PATH}/${key}`).then(existing => {
                const prev = existing && typeof existing === 'object' ? existing : {};
                firebaseWritePath(`${GIF_FIREBASE_STATS_PATH}/${key}`, {
                    url,
                    previewUrl: previewUrl || url,
                    count: (Number(prev.count) || 0) + 1,
                    lastUsed: nowTs()
                });
            }).catch(() => {});
        } catch { }
    }

    // Pobiera popularne gify użytkowników dodatku z Firebase
    async function fetchCommunityGifs() {
        try {
            const data = await firebaseReadPath(GIF_FIREBASE_STATS_PATH);
            if (!data || typeof data !== 'object') return [];
            return Object.values(data)
                .filter(g => g && g.url && Number(g.count) > 0)
                .sort((a, b) => Number(b.count) - Number(a.count))
                .slice(0, 36)
                .map(g => ({ url: g.url, previewUrl: g.previewUrl || g.url, count: Number(g.count) }));
        } catch { return []; }
    }

    function setGifStatus(msg) {
        const el = document.getElementById('gif-status');
        if (el) el.textContent = msg || '';
    }

    async function setGifStatusToast(msg, type = 'info') {
        if (typeof sebusUiNotify === 'function') {
            await sebusUiNotify(msg, type);
        }
    }

    function renderGifItems(items, emptyMsg = 'Brak wyników.') {
        if (!gResults) return;
        gResults.innerHTML = '';
        if (!items.length) {
            gResults.innerHTML = `<div style="grid-column:1/-1;color:#888;font-size:11px;text-align:center;padding:20px 0;">${emptyMsg}</div>`;
            return;
        }
        items.forEach(({ url, previewUrl, count }) => {
            const img = document.createElement('img');
            img.src = previewUrl || url;
            img.className = 'gif-item';
            img.loading = 'lazy';
            img.title = count ? `Użyto ${count}× przez użytkowników` : 'Kliknij aby wstawić';
            img.onclick = () => {
                insertIntoChat(url);
                saveRecentGif(url, previewUrl);
                trackGifUsage(url, previewUrl);
                gifPicker.classList.remove('show');
            };
            gResults.appendChild(img);
        });
    }

    function showGifTab(tab) {
        gifCurrentTab = tab;
        document.querySelectorAll('.sebus-gif-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    }

    function renderRecentGifs() {
        showGifTab('recent');
        const recent = loadRecentGifs();
        if (!recent.length) {
            gResults.innerHTML = '<div style="grid-column:1/-1;color:#888;font-size:11px;text-align:center;padding:20px 0;">Brak ostatnio używanych gifów.<br>Wyszukaj i kliknij dowolny GIF.</div>';
            setGifStatus('');
            return;
        }
        renderGifItems(recent.map(g => ({ url: g.url, previewUrl: g.previewUrl })));
        setGifStatus(`Ostatnio używane: ${recent.length}`);
    }

    // Pobiera gify bez anulowania zewnętrznego kontrolera — zwraca listę lub [] przy błędzie
    async function _doFetchTenor(q, locale, signal) {
        const endpoint = q
            ? `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(q)}&key=${tenorAPIKey}&limit=30&locale=${locale}&media_filter=gif,tinygif&contentfilter=low`
            : `https://tenor.googleapis.com/v2/featured?key=${tenorAPIKey}&limit=30&locale=${locale}&media_filter=gif,tinygif&contentfilter=low`;
        try {
            const r = await fetch(endpoint, { signal });
            if (!r.ok) throw new Error(r.status);
            const d = await r.json();
            return (d.results || []).map(gf => {
                const media = gf.media_formats || {};
                const preview = (media.tinygif || media.gif || {}).url || '';
                const full = (media.gif || media.tinygif || {}).url || preview;
                return { url: full, previewUrl: preview };
            }).filter(g => g.url);
        } catch (e) {
            if (e.name === 'AbortError') return null;
            // Fallback do Tenor v1
            try {
                const fallback = q
                    ? `https://api.tenor.com/v1/search?q=${encodeURIComponent(q)}&key=${tenorAPIKey}&limit=30&locale=${locale}`
                    : `https://api.tenor.com/v1/trending?key=${tenorAPIKey}&limit=30&locale=${locale}`;
                const r2 = await fetch(fallback, { signal });
                const d2 = await r2.json();
                return (d2.results || []).map(gf => ({
                    url: gf.media?.[0]?.gif?.url || '',
                    previewUrl: gf.media?.[0]?.tinygif?.url || ''
                })).filter(g => g.url);
            } catch (e2) {
                if (e2.name === 'AbortError') return null;
                return [];
            }
        }
    }

    async function _doFetchGiphy(q, signal) {
        const endpoint = q
            ? `https://api.giphy.com/v1/gifs/search?api_key=${giphyAPIKey}&q=${encodeURIComponent(q)}&limit=30&lang=pl&rating=pg-13`
            : `https://api.giphy.com/v1/gifs/trending?api_key=${giphyAPIKey}&limit=30&rating=pg-13`;
        try {
            const r = await fetch(endpoint, { signal });
            if (!r.ok) throw new Error(r.status);
            const d = await r.json();
            return (d.data || []).map(gf => ({
                url: gf.images?.original?.url || '',
                previewUrl: gf.images?.fixed_height_small?.url || gf.images?.downsized?.url || ''
            })).filter(g => g.url);
        } catch (e) {
            if (e.name === 'AbortError') return null;
            return [];
        }
    }

    async function fetchGifs(q = '') {
        // Anuluj poprzednie zapytanie
        if (gifAbortController) gifAbortController.abort();
        gifAbortController = new AbortController();
        const signal = gifAbortController.signal;

        setGifStatus('Ładowanie...');
        let results = null;

        if (gifCurrentSource === 'tenor') {
            results = await _doFetchTenor(q, 'pl_PL', signal);
        } else if (gifCurrentSource === 'giphy') {
            results = await _doFetchGiphy(q, signal);
        } else if (gifCurrentSource === 'tenor-pl') {
            const query = q || GIF_PL_TRENDING_QUERIES[Math.floor(Math.random() * GIF_PL_TRENDING_QUERIES.length)];
            results = await _doFetchTenor(query, 'pl_PL', signal);
        }

        if (results === null) return; // anulowane
        renderGifItems(results, 'Brak wyników. Spróbuj innej frazy.');
        setGifStatus(results.length ? `Znaleziono: ${results.length}` : 'Brak wyników');
    }

    async function showCommunityTrending() {
        showGifTab('trending');
        setGifStatus('Ładowanie popularnych...');
        const items = await fetchCommunityGifs();
        if (items.length) {
            renderGifItems(items, '');
            setGifStatus(`🔥 Popularne wśród użytkowników: ${items.length}`);
        } else {
            // Fallback: Tenor trending PL gdy brak danych Firebase
            setGifStatus('Brak danych — ładuję trending...');
            const q = GIF_PL_TRENDING_QUERIES[Math.floor(Math.random() * GIF_PL_TRENDING_QUERIES.length)];
            if (gifAbortController) gifAbortController.abort();
            gifAbortController = new AbortController();
            const fallback = await _doFetchTenor(q, 'pl_PL', gifAbortController.signal);
            if (fallback === null) return;
            renderGifItems(fallback || [], 'Brak popularnych GIFów.');
            setGifStatus(fallback?.length ? `Trending: ${fallback.length}` : '');
        }
    }

    async function openGifPickerDefault() {
        const recent = loadRecentGifs();
        if (recent.length) {
            renderRecentGifs();
        } else {
            // Brak historii — pokaż od razu popularne
            await showCommunityTrending();
        }
    }

    let gTimeout;
    gInput.addEventListener('input', function() {
        clearTimeout(gTimeout);
        const q = this.value.trim();
        if (!q) {
            // Powrót do ostatnio używanych gdy wyczyszczono pole
            renderRecentGifs();
            return;
        }
        showGifTab('results');
        setGifStatus('Wyszukiwanie...');
        gTimeout = setTimeout(() => fetchGifs(q), 450);
    });

    // Zakładki
    document.addEventListener('click', (e) => {
        const tabBtn = e.target.closest('.sebus-gif-tab');
        if (tabBtn && gifPicker.contains(tabBtn)) {
            const tab = tabBtn.dataset.tab;
            if (tab === 'recent') { gInput.value = ''; renderRecentGifs(); }
            else if (tab === 'trending') { gInput.value = ''; showCommunityTrending(); }
            else if (tab === 'results') {
                const q = gInput.value.trim();
                if (q) { showGifTab('results'); fetchGifs(q); }
                else { gInput.focus(); }
            }
        }
        // Przełącznik źródła
        const srcBtn = e.target.closest('.sebus-gif-src-btn');
        if (srcBtn && gifPicker.contains(srcBtn)) {
            gifCurrentSource = srcBtn.dataset.src;
            document.querySelectorAll('.sebus-gif-src-btn').forEach(b => b.classList.toggle('active', b.dataset.src === gifCurrentSource));
            const q = gInput.value.trim();
            if (q) fetchGifs(q); else if (gifCurrentTab === 'trending') fetchGifs('');
        }
    });

    function renderMp3s(list) {
        mResults.innerHTML = '';
        if (list.length === 0) {
            mResults.innerHTML = '<div class="mp3-item" style="border-color:red; color:red;">Nie znaleziono w bazie!</div>';
            return;
        }
        list.forEach(item => {
            const btn = document.createElement('div');
            btn.className = 'mp3-item';
            btn.innerText = `▶ ${item.name}`;
            btn.onclick = () => { insertIntoChat(item.url); mp3Picker.classList.remove('show'); };
            mResults.appendChild(btn);
        });
    }

    function filterMp3s(q = '') {
        const query = q.toLowerCase().trim();
        let filtered = localSoundboard;
        if (query) filtered = localSoundboard.filter(sound => sound.name.toLowerCase().includes(query));
        renderMp3s(filtered.slice(0, 50));
    }

    mInput.addEventListener('input', function() { filterMp3s(this.value); });

    document.addEventListener('click', (e) => {
        if (!gifPicker.contains(e.target) && e.target.id !== 'open-gif-btn') gifPicker.classList.remove('show');
        if (!mp3Picker.contains(e.target) && e.target.id !== 'open-mp3-btn') mp3Picker.classList.remove('show');
    });

    function initRadioIfNeeded() {
        if (!appSettings.features.radio) return;
        if (document.getElementById('sebus-radio-toggle')) return; // już zainicjowane

        // Oznacz body — ukryje stary mini-widget
        document.body.classList.add('sebus-radio-v2');
        initRadioGlobalUnlock();

        // ── YT iframe poza panelem — gra zawsze, niezależnie od widoczności panelu ──
        let ytFrameOuter = document.getElementById('sebus-rp-yt-frame');
        if (!ytFrameOuter) {
            ytFrameOuter = document.createElement('iframe');
            ytFrameOuter.id = 'sebus-rp-yt-frame';
            ytFrameOuter.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
            ytFrameOuter.referrerPolicy = 'strict-origin-when-cross-origin';
            ytFrameOuter.style.cssText = 'position:fixed;width:1px;height:1px;bottom:0;left:0;opacity:0.01;pointer-events:none;border:0;z-index:1;';
            document.body.appendChild(ytFrameOuter);
        }

        // ── Toggle button ─────────────────────────────────────────────
        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'sebus-radio-toggle';
        toggleBtn.type = 'button';
        toggleBtn.textContent = '🎙️ Radio · Otwórz';
        toggleBtn.style.cssText = 'position:fixed;bottom:14px;left:50%;transform:translateX(-50%);z-index:2147483646;';
        document.body.appendChild(toggleBtn);

        // ── Główny panel ──────────────────────────────────────────────
        const panel = document.createElement('div');
        panel.id = 'sebus-radio-player';
        panel.innerHTML = `
            <div class="sebus-rp-header">
                <span class="sebus-rp-title">🎙️ Sebuś Radio</span>
                <span class="sebus-rp-badge">Kolejka pusta</span>
                <button class="sebus-rp-close" id="sebus-rp-close-btn" type="button" title="Zamknij">✕</button>
            </div>
            <div class="sebus-rp-now">
                <div class="sebus-rp-now-label">Teraz gra</div>
                <div class="sebus-rp-now-title">— nic —</div>
                <div class="sebus-rp-now-meta"></div>
            </div>
            <div class="sebus-rp-controls">
                <button class="sebus-rp-btn" id="sebus-rp-play" type="button" title="Play/Pauza">▶</button>
                <button class="sebus-rp-btn" id="sebus-rp-skip" type="button" title="Pomiń — następny utwór z kolejki">⏭</button>
                <button class="sebus-rp-btn sebus-rp-btn-dbg" id="sebus-rp-dbg-copy" type="button" title="Kopiuj debug">DBG</button>
                <button class="sebus-rp-btn sebus-rp-btn-dbg" id="sebus-rp-dbg-clear" type="button" title="Wyczyść log debug">CLR</button>
                <span class="sebus-rp-spacer"></span>
                <span class="sebus-rp-vol-label" id="sebus-rp-vol-label">VOL2</span>
                <button class="sebus-rp-btn" id="sebus-rp-vol" type="button" title="Zmień głośność">🔊</button>
            </div>
            <div class="sebus-rp-activate-wrap">
                <button class="sebus-rp-activate" id="sebus-rp-activate-btn" type="button">▶ POŁĄCZ Z RADIEM</button>
            </div>
            <div class="sebus-rp-add">
                <input type="text" id="sebus-rp-url-input" placeholder="Wklej link YouTube lub .mp3…" autocomplete="off">
                <button class="sebus-rp-btn" id="sebus-rp-add-btn" type="button" title="Dodaj do kolejki">+</button>
            </div>
            <div class="sebus-rp-queue-wrap"></div>
            <div class="sebus-rp-debug"></div>
            <div class="sebus-rp-debug-state" id="sebus-rp-debug-state"></div>
            <div class="sebus-rp-status"></div>
        `;
        document.body.appendChild(panel);

        // ── Referencje DOM ────────────────────────────────────────────
        const audio       = ensureRadioAudio();
        const playBtn     = document.getElementById('sebus-rp-play');
        const skipBtn     = document.getElementById('sebus-rp-skip');
        const volBtn      = document.getElementById('sebus-rp-vol');
        const volLabel    = document.getElementById('sebus-rp-vol-label');
        const activateBtn = document.getElementById('sebus-rp-activate-btn');
        const addBtn      = document.getElementById('sebus-rp-add-btn');
        const dbgCopyBtn  = document.getElementById('sebus-rp-dbg-copy');
        const dbgClearBtn = document.getElementById('sebus-rp-dbg-clear');
        const urlInput    = document.getElementById('sebus-rp-url-input');
        const closeBtn    = document.getElementById('sebus-rp-close-btn');
        const ytFrame     = document.getElementById('sebus-rp-yt-frame');

        const debugBox = panel.querySelector('.sebus-rp-debug');
        if (debugBox) debugBox.innerHTML = radioDebugEvents.map(line => `<div>${line}</div>`).join('');
        radioRenderDebugState();

        if (dbgCopyBtn) dbgCopyBtn.addEventListener('click', () => copyRadioDebugToClipboard());
        if (dbgClearBtn) dbgClearBtn.addEventListener('click', () => {
            radioDebugEvents = [];
            radioLastDebugMessage = '';
            radioLastYtEventSource = '';
            radioDebugLastSyncAt = 0;
            if (debugBox) debugBox.innerHTML = '';
            radioRenderDebugState();
            radioSetStatus('🧹 Debug wyczyszczony');
            setTimeout(() => radioSetStatus(''), 1200);
        });

        const syncActivationBtn = () => {
            if (!activateBtn) return;
            activateBtn.classList.toggle('ready', !!radioMediaUnlocked);
            activateBtn.textContent = radioMediaUnlocked ? '✅ POŁĄCZONO Z RADIEM' : '▶ POŁĄCZ Z RADIEM';
        };

        if (activateBtn) activateBtn.addEventListener('click', async () => {
            radioUnlockMedia('activate button');
            syncActivationBtn();
            if (!radioNowPlaying && !audio.src) {
                syncRadioQueue();
            }
        });

        if (ytFrame && !ytFrame.dataset.sebusRadioLoadBound) {
            ytFrame.dataset.sebusRadioLoadBound = '1';
            ytFrame.addEventListener('load', () => {
                radioDebug('YT iframe load');
                if (!radioNowPlaying || radioNowPlaying.type !== 'yt') return;
                radioYtPlayerState = null;
                radioYtCurrentTime = 0;
                radioYtLastHeartbeatAt = Date.now();
                radioNeedsHardResync = true;
                radioSendYoutubeListeningPing();
                setTimeout(() => syncRadioYoutubePlayback(radioNowPlaying, { seek: true, forceSeek: true }), 220);
                setTimeout(() => radioSendYoutubeListeningPing(), 220);
            });
        }

        // Nasłuchuj na wiadomości od YouTube iframe API (onReady, onStateChange)
        if (!window._sebusYtMsgBound) {
            window._sebusYtMsgBound = true;
            window.addEventListener('message', (e) => {
                try {
                    const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
                    if (!data || typeof data !== 'object') return;
                    const radioFrame = document.getElementById('sebus-rp-yt-frame');
                    const watchFrame = document.getElementById('sebus-watch-frame');
                    if (radioFrame && e.source === radioFrame.contentWindow) {
                        radioLastYtEventSource = 'radio';
                        if (!radioFrame.src) return;

                        if (data.event === 'onReady') {
                            radioDebug('YT onReady source=radio');
                            radioYtReady = true;
                            radioYtLastHeartbeatAt = Date.now();
                            syncRadioYoutubePlayback(radioNowPlaying, { seek: true, forceSeek: true });
                            return;
                        }

                        if (data.event === 'infoDelivery') {
                            const hasPlayerInfo = typeof data.info === 'object' && data.info !== null;
                            if (hasPlayerInfo) {
                                if (typeof data.info.playerState === 'number') radioYtPlayerState = Number(data.info.playerState);
                                if (typeof data.info.currentTime === 'number') {
                                    radioYtCurrentTime = Number(data.info.currentTime) || 0;
                                    radioYtLastHeartbeatAt = Date.now();
                                }
                                if (typeof data.info.duration === 'number') {
                                    maybeSyncNowPlayingDuration(data.info.duration);
                                }
                            }
                            if (hasPlayerInfo && !radioYtReady) {
                                radioYtReady = true;
                                radioDebug('YT infoDelivery source=radio => ready=1');
                                syncRadioYoutubePlayback(radioNowPlaying, { seek: true, forceSeek: true });
                            }
                            return;
                        }

                        if (data.event === 'onStateChange') {
                            radioYtPlayerState = typeof data.info === 'number' ? Number(data.info) : radioYtPlayerState;
                            radioYtLastHeartbeatAt = Date.now();
                            radioDebug(`YT onStateChange source=radio state=${String(data.info ?? '?')}`);
                            if (radioYtPlayerState === 0 && radioNowPlaying?.type === 'yt' && !isRadioPurePlaylistMode(radioNowPlaying)) {
                                radioDebug('YT ended -> advance queue');
                                radioAdvanceQueue().then(() => setTimeout(() => syncRadioQueue(), 500)).catch(() => {});
                            } else if ((radioYtPlayerState === 2 || radioYtPlayerState === 5) && radioNowPlaying?.type === 'yt' && getRadioYoutubeVolumePercent() > 0) {
                                const now = Date.now();
                                if ((now - radioYtAutoResumeAt) > 2500) {
                                    radioYtAutoResumeAt = now;
                                    radioDebug(`YT state ${radioYtPlayerState} -> auto resume`);
                                    setTimeout(() => syncRadioYoutubePlayback(radioNowPlaying, { seek: true, forceLoad: false }), 180);
                                }
                            }
                            return;
                        }
                        return;
                    }
                    if (watchFrame && e.source === watchFrame.contentWindow) {
                        radioLastYtEventSource = 'watch';
                        if (data.event === 'onReady') radioDebug('YT onReady source=watch (ignored by radio)');
                        return;
                    }
                    if (data.event === 'onReady') {
                        radioLastYtEventSource = 'unknown';
                        radioDebug('YT onReady source=unknown');
                    }
                } catch { /* ignoruj */ }
            });
        }

        const syncVolLabel = () => {
            if (volLabel) volLabel.textContent = getRadioVolumeLabel();
            audio.volume = getRadioVolumeValue();
            applyRadioYoutubeVolume();
            if (radioNowPlaying?.type === 'yt' && getRadioYoutubeVolumePercent() > 0) {
                forceActivateRadioYoutube(radioNowPlaying, { muted: false });
            }
            radioDebug(`UI vol=${getRadioVolumeLabel()} ytReady=${radioYtReady ? '1' : '0'} src=${ytFrame?.src ? '1' : '0'} last=${radioLastYtEventSource || '-'}`);
            radioRenderDebugState();
        };

        const syncPlayBtn = () => {
            const ytPlaying = !!(ytFrame && ytFrame.src);
            const isPlaying = !audio.paused || ytPlaying;
            playBtn.textContent = isPlaying ? '⏸' : '▶';
            radioUpdateToggleBtn(isPlaying);
            radioRenderDebugState();
        };

        if (skipBtn) {
            skipBtn.disabled = true;
            skipBtn.title = 'Możesz pominąć tylko swój utwór';
            skipBtn.style.opacity = '.45';
            skipBtn.style.cursor = 'not-allowed';
        }

        // ── Głośność ──────────────────────────────────────────────────
        syncVolLabel();
        syncActivationBtn();
        radioStartYoutubeWatchdog();
        volBtn.addEventListener('click', () => {
            radioUnlockMedia('volume button');
            syncActivationBtn();
            const next = (getRadioVolumeIndex() + 1) % 4;
            setRadioSetting('volumeLevelIndex', next);
            syncVolLabel();
        });

        // ── Play/Pauza ────────────────────────────────────────────────
        playBtn.addEventListener('click', async () => {
            radioUnlockMedia('play button');
            syncActivationBtn();
            if (radioNowPlaying?.type === 'yt') {
                radioDebug('UI play click (YT)');
                forceActivateRadioYoutube(radioNowPlaying, { muted: getRadioYoutubeVolumePercent() <= 0 });
                radioSetStatus('▶ Wznawiam YouTube…');
                setTimeout(() => radioSetStatus(''), 2200);
                return;
            }
            if (!audio.paused) {
                radioDebug('UI play click (pause MP3/fallback)');
                audio.pause();
                syncPlayBtn();
                radioUpdateToggleBtn(false);
            } else {
                if (!audio.src) {
                    radioDebug('UI play click (fallback start)');
                    radioFallbackMode = true;
                    radioApplyFallback();
                } else {
                    radioDebug('UI play click (resume MP3/fallback)');
                    try { await audio.play(); syncPlayBtn(); } catch { radioDebug('audio.play() exception'); }
                }
            }
        });

        audio.addEventListener('pause',   syncPlayBtn);
        audio.addEventListener('playing', syncPlayBtn);
        audio.addEventListener('ended', async () => {
            syncPlayBtn();
            // Utwór skończony (MP3) — przesuń kolejkę
            if (!radioFallbackMode && radioNowPlaying) {
                radioSetStatus('⏭ Koniec — następny…');
                await radioAdvanceQueue();
                setTimeout(() => syncRadioQueue(), 800);
            }
        });

        // ── Skip ──────────────────────────────────────────────────────
        skipBtn.addEventListener('click', async () => {
            radioDebug('UI skip click');
            if (!canCurrentUserSkipRadioItem()) {
                radioSetStatus('Możesz pominąć tylko swój utwór');
                setTimeout(() => radioSetStatus(''), 2200);
                skipBtn.disabled = true;
                return;
            }
            skipBtn.disabled = true;
            radioSetStatus('Pomijam…');
            // Zatrzymaj bieżące
            if (!audio.paused) { audio.pause(); audio.src = ''; }
            if (ytFrame && ytFrame.src) ytFrame.removeAttribute('src');
            radioNowPlaying = null;
            await radioAdvanceQueue();
            setTimeout(() => { skipBtn.disabled = false; syncRadioQueue(); }, 800);
        });

        // ── Dodaj do kolejki ──────────────────────────────────────────
        const doAdd = async () => {
            const raw = urlInput.value.trim();
            if (!raw) return;
            radioDebug(`UI add click: ${raw.slice(0, 48)}`);
            addBtn.disabled = true;
            radioSetStatus('Dodawanie…');
            const res = await addToRadioQueue(raw);
            radioSetStatus(res.msg);
            if (res.ok) {
                urlInput.value = '';
                await syncRadioQueue();
                setTimeout(() => syncRadioQueue(), 600);
            }
            setTimeout(() => { addBtn.disabled = false; }, 1200);
        };

        addBtn.addEventListener('click', doAdd);
        urlInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') doAdd(); });

        // ── Toggle otwieranie ──────────────────────────────────────────
        toggleBtn.addEventListener('click', () => {
            const visible = panel.classList.contains('show');
            if (!visible) {
                const tRect = toggleBtn.getBoundingClientRect();
                const panelW = 340;
                const panelH = 420;

                let topPx;
                let leftPx;

                if (toggleBtn.classList.contains('sebus-radio-positioned')) {
                    // Przy czacie — otwórz obok przycisku, po prawej
                    topPx = tRect.top - 8;
                    leftPx = tRect.right + 8;

                    if (leftPx + panelW > window.innerWidth - 8) {
                        leftPx = Math.max(8, tRect.left - panelW - 8);
                    }
                    if (topPx + panelH > window.innerHeight - 8) {
                        topPx = Math.max(8, window.innerHeight - panelH - 8);
                    }
                } else {
                    // Na dole ekranu — otwórz nad przyciskiem
                    topPx = tRect.top - panelH - 8;
                    leftPx = tRect.left + (tRect.width / 2) - (panelW / 2);

                    if (topPx < 8) topPx = 8;
                    leftPx = Math.max(8, Math.min(leftPx, window.innerWidth - panelW - 8));
                }

                panel.style.top  = topPx + 'px';
                panel.style.left = leftPx + 'px';
                panel.style.transform = 'none';
                syncRadioQueue();
            }
            panel.classList.toggle('show', !visible);
        });

        closeBtn.addEventListener('click', () => panel.classList.remove('show'));

        // ── Start synchronizacji ───────────────────────────────────────
        syncVolLabel();
        // Pierwsza synchronizacja + uruchom realtime oraz polling fallback
        bindRadioRealtimeHooks();
        refreshRadioServerTimeOffset(true);
        syncRadioQueue();
        startRadioRealtimeListener();
        if (radioSyncTimer) clearInterval(radioSyncTimer);
        radioSyncTimer = setInterval(() => {
            refreshRadioServerTimeOffset();
            const realtimeFresh = radioRealtimeConnected
                && radioLastRealtimeEventAt
                && (nowTs() - radioLastRealtimeEventAt) < Math.max(RADIO_SYNC_MS * 3, 5000);

            if (!realtimeFresh) {
                radioRealtimeConnected = false;
                syncRadioQueue();
                if (!radioRealtimeAbortController) startRadioRealtimeListener();
            }
        }, RADIO_SYNC_MS);
    }
