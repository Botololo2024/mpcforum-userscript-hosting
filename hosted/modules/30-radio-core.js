// Module: 30-radio-core.js
// Source: e:\mpcforum-userscript\skrypt:2170-3042
// Purpose: Radio core, queue, YouTube sync and fallback playback

    function ensureRadioAudio() {
        if (!radioAudio) {
            radioAudio = new Audio();
            radioAudio.preload = 'none';
            radioAudio.volume = 0.4;
        }
        return radioAudio;
    }

    function getRadioVolumeIndex() {
        const raw = appSettings.radio.volumeLevelIndex;
        const idx = (raw === null || raw === undefined || raw === '') ? 2 : Number(raw);
        return Math.max(0, Math.min(3, isNaN(idx) ? 2 : idx));
    }

    function getRadioVolumeValue() {
        return [0, 0.15, 0.45, 1][getRadioVolumeIndex()];
    }

    function getRadioVolumeLabel() {
        return ['M', '1', '2', '3'][getRadioVolumeIndex()];
    }

    function getRadioYoutubeVolumePercent() {
        return [0, 20, 55, 100][getRadioVolumeIndex()];
    }

    function getRadioEmbedOrigin() {
        try {
            return encodeURIComponent(window.location.origin || `${window.location.protocol}//${window.location.host}`);
        } catch {
            return encodeURIComponent('https://www.mpcforum.pl');
        }
    }

    function buildRadioYoutubeSrc(item, elapsedSec = 0, options = {}) {
        const start = Math.max(0, Number(elapsedSec) || 0);
        const muted = options.muted === false ? 0 : 1;
        const origin = getRadioEmbedOrigin();
        const videoId = String(item?.videoId || '').trim();
        const playlistId = String(item?.playlistId || '').trim();
        if (!videoId && playlistId) {
            const list = encodeURIComponent(playlistId);
            return `https://www.youtube-nocookie.com/embed/videoseries?list=${list}&autoplay=1&mute=${muted}&controls=0&disablekb=1&fs=0&start=${start}&loop=1&enablejsapi=1&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3&origin=${origin}&widget_referrer=${origin}`;
        }
        if (!videoId) return '';
        return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=${muted}&controls=0&disablekb=1&fs=0&start=${start}&enablejsapi=1&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3&origin=${origin}&widget_referrer=${origin}`;
    }

    function radioDebug(message) {
        const stamp = new Date().toLocaleTimeString('pl-PL', { hour12: false });
        radioLastDebugMessage = `${stamp} ${message}`;
        radioDebugEvents.push(radioLastDebugMessage);
        if (radioDebugEvents.length > 14) radioDebugEvents = radioDebugEvents.slice(-14);

        const box = document.querySelector('#sebus-radio-player .sebus-rp-debug');
        if (box) box.innerHTML = radioDebugEvents.map(line => `<div>${line}</div>`).join('');
        radioRenderDebugState();
        try { console.debug('[SebuśRadio]', message); } catch { }
    }

    function radioCollectDebugState() {
        const yt = document.getElementById('sebus-rp-yt-frame');
        const audio = ensureRadioAudio();
        const np = radioNowPlaying;
        return {
            now: np ? `${np.type || '?'}:${String(np.videoId || np.id || '').slice(0, 8)}` : 'none',
            unlocked: radioMediaUnlocked ? 1 : 0,
            ytSrc: yt?.src ? 1 : 0,
            ytReady: radioYtReady ? 1 : 0,
            ytState: radioYtPlayerState === null ? '-' : String(radioYtPlayerState),
            ytSource: radioLastYtEventSource || '-',
            audioSrc: audio?.src ? 1 : 0,
            audioPaused: audio?.paused ? 1 : 0,
            vol: `${getRadioVolumeLabel()}(${getRadioYoutubeVolumePercent()}%)`,
            syncAgo: radioDebugLastSyncAt ? `${Math.max(0, Math.floor((Date.now() - radioDebugLastSyncAt) / 1000))}s` : '-',
            hbAgo: radioYtLastHeartbeatAt ? `${Math.max(0, Math.floor((Date.now() - radioYtLastHeartbeatAt) / 1000))}s` : '-'
        };
    }

    function radioRenderDebugState() {
        const el = document.querySelector('#sebus-radio-player #sebus-rp-debug-state');
        if (!el) return;
        const s = radioCollectDebugState();
        el.textContent = `now=${s.now} unlocked=${s.unlocked} yt[src:${s.ytSrc}|ready:${s.ytReady}|state:${s.ytState}|srcEvt:${s.ytSource}|hb:${s.hbAgo}] audio[src:${s.audioSrc}|paused:${s.audioPaused}] vol=${s.vol} sync=${s.syncAgo}`;
    }

    async function copyRadioDebugToClipboard() {
        const s = radioCollectDebugState();
        const payload = [
            `=== Sebuś Radio Debug ===`,
            `url: ${location.href}`,
            `ua: ${navigator.userAgent}`,
            `state: now=${s.now} unlocked=${s.unlocked} ytSrc=${s.ytSrc} ytReady=${s.ytReady} ytState=${s.ytState} ytSource=${s.ytSource} hbAgo=${s.hbAgo} audioSrc=${s.audioSrc} audioPaused=${s.audioPaused} vol=${s.vol} syncAgo=${s.syncAgo}`,
            `last: ${radioLastDebugMessage || '-'}`,
            `events:`,
            ...radioDebugEvents
        ].join('\n');
        try {
            await navigator.clipboard.writeText(payload);
            radioSetStatus('📋 Debug skopiowany');
            setTimeout(() => radioSetStatus(''), 1800);
        } catch {
            try { console.log(payload); } catch { }
            radioSetStatus('📋 Clipboard niedostępny — log w konsoli');
            setTimeout(() => radioSetStatus(''), 2200);
        }
    }

    function getRadioItemStartTimestamp(item) {
        const raw = Number(item?.startTime || item?.startedAt || 0);
        return Number.isFinite(raw) ? raw : 0;
    }

    function getRadioItemDurationSec(item) {
        const raw = Number(item?.durationSec || item?.duration || 0);
        return Number.isFinite(raw) && raw > 0 ? raw : 0;
    }

    function getRadioNowMs() {
        return Date.now() + (Number(radioServerTimeOffsetMs) || 0);
    }

    async function refreshRadioServerTimeOffset(force = false) {
        const now = Date.now();
        if (!force && (now - radioServerTimeOffsetSyncedAt) < 60000) return;
        radioServerTimeOffsetMs = 0;
        radioServerTimeOffsetSyncedAt = now;
    }

    function getRadioGlobalOffsetSec(item = radioNowPlaying) {
        const startedAt = getRadioItemStartTimestamp(item);
        if (!startedAt) return { offsetSec: 0, ended: false };
        const offsetSec = Math.max(0, (getRadioNowMs() - startedAt) / 1000);
        const durationSec = getRadioItemDurationSec(item);
        const ended = durationSec > 0 && offsetSec > durationSec;
        return { offsetSec, ended };
    }

    function getRadioElapsedSec(item = radioNowPlaying) {
        return Math.floor(getRadioGlobalOffsetSec(item).offsetSec);
    }

    function maybeSyncNowPlayingDuration(durationSecRaw) {
        if (!radioNowPlaying || radioNowPlaying.type !== 'yt' || isRadioPurePlaylistMode(radioNowPlaying)) return;

        const durationSec = Math.max(0, Math.floor(Number(durationSecRaw) || 0));
        if (!durationSec) return;

        const trackId = String(radioNowPlaying.id || '').trim();
        if (!trackId) return;

        const existing = getRadioItemDurationSec(radioNowPlaying);
        if (existing > 0 && Math.abs(existing - durationSec) <= 1) return;

        const now = Date.now();
        if (radioLastDurationSyncFor === trackId && (now - radioLastDurationSyncAt) < 12000) return;
        radioLastDurationSyncFor = trackId;
        radioLastDurationSyncAt = now;

        firebaseWritePath(`${RADIO_QUEUE_PATH}/nowPlaying/durationSec`, durationSec).then(ok => {
            if (ok && radioNowPlaying && String(radioNowPlaying.id || '') === trackId) {
                radioNowPlaying.durationSec = durationSec;
            }
        }).catch(() => {});
    }

    function getRadioYoutubeTargetKey(item = radioNowPlaying) {
        const videoId = String(item?.videoId || '').trim();
        if (videoId) return `v:${videoId}`;
        const playlistId = String(item?.playlistId || '').trim();
        if (playlistId) return `pl:${playlistId}`;
        return '';
    }

    function isRadioPurePlaylistMode(item = radioNowPlaying) {
        const videoId = String(item?.videoId || '').trim();
        const playlistId = String(item?.playlistId || '').trim();
        return !videoId && !!playlistId;
    }

    function radioLoadYoutubeVideo(item, startSec = 0) {
        if (!item || item.type !== 'yt') return false;
        const targetKey = getRadioYoutubeTargetKey(item);
        if (!targetKey) return false;
        const startSeconds = Math.max(0, Math.floor(Number(startSec) || 0));
        const videoId = String(item?.videoId || '').trim();
        const playlistId = String(item?.playlistId || '').trim();

        let ok = false;
        if (videoId) ok = radioSendYoutubeCommand('loadVideoById', [{ videoId, startSeconds, suggestedQuality: 'large' }]);
        else if (playlistId) ok = radioSendYoutubeCommand('loadPlaylist', [{ listType: 'playlist', list: playlistId, index: 0, startSeconds, suggestedQuality: 'large' }]);

        if (ok) {
            radioYtLoadedVideoId = targetKey;
            radioDebug(`YT load target=${targetKey.slice(0, 10)} t=${startSeconds}s`);
        }
        return ok;
    }

    function forceActivateRadioYoutube(item = radioNowPlaying, options = {}) {
        if (!item || item.type !== 'yt') return;
        const ytFrame = document.getElementById('sebus-rp-yt-frame');
        if (!ytFrame) return;

        const elapsedSec = getRadioElapsedSec(item);
        const shouldMute = options.muted !== undefined ? !!options.muted : (getRadioYoutubeVolumePercent() <= 0);

        const targetKey = getRadioYoutubeTargetKey(item);
        if (!ytFrame.src || radioYtLoadedVideoId !== targetKey) {
            radioYtReady = false;
            radioDebug(`YT bootstrap src id=${targetKey.slice(0, 10)} muted=${shouldMute ? 1 : 0}`);
            ytFrame.src = buildRadioYoutubeSrc(item, elapsedSec, { muted: shouldMute });
            radioYtLoadedVideoId = targetKey;
            setTimeout(() => radioSendYoutubeListeningPing(), 140);
            return;
        }

        radioDebug(`YT immediate resume src=${ytFrame.src ? '1' : '0'} ready=${radioYtReady ? '1' : '0'} mute=${shouldMute ? '1' : '0'}`);
        applyRadioYoutubeVolume();
        if (!shouldMute) radioSendYoutubeCommand('unMute');
        radioSendYoutubeCommand('seekTo', [elapsedSec, true]);
        radioSendYoutubeCommand('playVideo');
    }

    function radioSendYoutubeListeningPing() {
        const ytFrame = document.getElementById('sebus-rp-yt-frame');
        if (!ytFrame || !ytFrame.contentWindow || !ytFrame.src) return false;
        try {
            ytFrame.contentWindow.postMessage(JSON.stringify({ event: 'listening', id: ytFrame.id || 'sebus-rp-yt-frame' }), '*');
            return true;
        } catch {
            return false;
        }
    }

    function radioSendYoutubeCommand(func, args = []) {
        const ytFrame = document.getElementById('sebus-rp-yt-frame');
        if (!ytFrame || !ytFrame.contentWindow || !ytFrame.src) {
            radioDebug(`YT cmd ${func} FAIL(no-frame/src)`);
            return false;
        }
        try {
            if (func === 'playVideo' && !radioYtReady) radioSendYoutubeListeningPing();
            ytFrame.contentWindow.postMessage(JSON.stringify({
                event: 'command',
                func,
                args
            }), '*');
            if (func === 'playVideo' || func === 'unMute' || func === 'setVolume') {
                radioDebug(`YT cmd ${func} OK`);
            }
            return true;
        } catch {
            radioDebug(`YT cmd ${func} FAIL(exception)`);
            return false;
        }
    }

    function radioStartYoutubeWatchdog() {
        if (radioYtWatchdogTimer) return;
        radioYtWatchdogTimer = setInterval(() => {
            const ytFrame = document.getElementById('sebus-rp-yt-frame');
            if (!appSettings.features.radio || !radioNowPlaying || radioNowPlaying.type !== 'yt' || !ytFrame || !ytFrame.src) return;

            radioSendYoutubeListeningPing();
            radioSendYoutubeCommand('getPlayerState');
            radioSendYoutubeCommand('getCurrentTime');

            const now = Date.now();
            const heartbeatStale = radioYtLastHeartbeatAt && (now - radioYtLastHeartbeatAt) > 5000;
            const stateNeedsResume = radioYtPlayerState === 2 || radioYtPlayerState === 5;
            if ((heartbeatStale || stateNeedsResume) && (now - radioYtAutoResumeAt) > 4000) {
                radioYtAutoResumeAt = now;
                radioDebug(`YT watchdog resume hbStale=${heartbeatStale ? 1 : 0} state=${radioYtPlayerState}`);
                syncRadioYoutubePlayback(radioNowPlaying, { seek: true, forceLoad: true });
            }
        }, 2500);
    }

    function radioStopYoutubeWatchdog() {
        if (radioYtWatchdogTimer) {
            clearInterval(radioYtWatchdogTimer);
            radioYtWatchdogTimer = null;
        }
    }

    function radioUnlockMedia(reason = 'unknown') {
        const wasUnlocked = radioMediaUnlocked;
        radioMediaUnlocked = true;
        if (!wasUnlocked) radioDebug(`media unlock: ${reason}`);

        const audio = ensureRadioAudio();
        if (radioNowPlaying?.type === 'yt') {
            forceActivateRadioYoutube(radioNowPlaying, { muted: getRadioYoutubeVolumePercent() <= 0 });
        } else if (audio?.src) {
            audio.play().catch(() => radioDebug('audio.play() blocked after media unlock'));
        }
        radioRenderDebugState();
    }

    function initRadioGlobalUnlock() {
        if (radioGlobalUnlockBound) return;
        radioGlobalUnlockBound = true;

        const unlockFromInteraction = () => radioUnlockMedia('global interaction');
        window.addEventListener('pointerdown', unlockFromInteraction, { passive: true, capture: true });
        window.addEventListener('keydown', unlockFromInteraction, { passive: true, capture: true });
        window.addEventListener('touchstart', unlockFromInteraction, { passive: true, capture: true });
    }

    function applyRadioYoutubeVolume() {
        if (!radioNowPlaying || radioNowPlaying.type !== 'yt') return;
        const volPercent = getRadioYoutubeVolumePercent();
        const yt = document.getElementById('sebus-rp-yt-frame');
        const volSig = `${volPercent}|${radioYtReady ? 1 : 0}|${yt?.src ? 1 : 0}`;
        if (volSig !== radioLastYtVolumeDebugSignature) {
            radioLastYtVolumeDebugSignature = volSig;
            radioDebug(`YT volume=${volPercent}% ready=${radioYtReady ? '1' : '0'} src=${yt?.src ? '1' : '0'}`);
        }
        radioSendYoutubeCommand('setVolume', [volPercent]);
        if (volPercent <= 0) radioSendYoutubeCommand('mute');
        else radioSendYoutubeCommand('unMute');
    }

    function syncRadioYoutubePlayback(item = radioNowPlaying, options = {}) {
        if (!item || item.type !== 'yt') return;
        const yt = document.getElementById('sebus-rp-yt-frame');
        if (!yt) return;

        const shouldSeek = options.seek !== false;
        const forceLoad = options.forceLoad === true;
        const forceSeek = options.forceSeek === true;
        const shouldMute = getRadioYoutubeVolumePercent() <= 0 || !radioMediaUnlocked;
        const { offsetSec, ended } = getRadioGlobalOffsetSec(item);
        const targetSec = Math.floor(offsetSec);

        if (ended) return;

        if (!yt.src) {
            radioYtReady = false;
            yt.src = buildRadioYoutubeSrc(item, targetSec, { muted: shouldMute });
            radioDebug(`YT bootstrap sync t=${targetSec}s`);
            setTimeout(() => radioSendYoutubeListeningPing(), 140);
            return;
        }

        const expectedTarget = getRadioYoutubeTargetKey(item);
        const wrongVideo = radioYtLoadedVideoId !== expectedTarget;
        if (wrongVideo || forceLoad) {
            const loaded = radioLoadYoutubeVideo(item, targetSec);
            if (!loaded) {
                radioYtReady = false;
                yt.src = buildRadioYoutubeSrc(item, targetSec, { muted: shouldMute });
                radioYtLoadedVideoId = expectedTarget;
                radioDebug(`YT fallback src reload id=${expectedTarget.slice(0, 10)}`);
                setTimeout(() => radioSendYoutubeListeningPing(), 160);
                return;
            }
        }

        applyRadioYoutubeVolume();
        if (!shouldMute) radioSendYoutubeCommand('unMute');

        const driftSec = Math.abs((Number(radioYtCurrentTime) || 0) - targetSec);
        const needsSeek = shouldSeek && (forceSeek || radioNeedsHardResync || driftSec > 2);
        if (needsSeek) {
            radioDebug(`YT master seek drift=${driftSec.toFixed(1)}s -> ${targetSec}s`);
            radioSendYoutubeCommand('seekTo', [targetSec, true]);
            radioNeedsHardResync = false;
        }

        if (!shouldMute && radioYtPlayerState !== 1) {
            radioSendYoutubeCommand('playVideo');
        }
    }

    // ── RADIO QUEUE HELPERS ─────────────────────────────────────────

    function radioParseUrl(rawUrl) {
        const url = (rawUrl || '').trim();
        const ytPlaylistMatch = url.match(RADIO_YT_PLAYLIST_REGEX);
        const ytMatch = url.match(RADIO_YT_REGEX);
        if (ytMatch) return { type: 'yt', url, videoId: ytMatch[1], playlistId: ytPlaylistMatch ? ytPlaylistMatch[1] : null };
        if (ytPlaylistMatch) return { type: 'yt', url, videoId: null, playlistId: ytPlaylistMatch[1] };
        if (RADIO_MP3_REGEX.test(url)) return { type: 'mp3', url };
        return null;
    }

    function radioSafeTitle(rawUrl, rawTitle) {
        if (rawTitle && rawTitle.trim().length > 1) return rawTitle.trim().slice(0, 80);
        try {
            const u = new URL(rawUrl);
            // Dla YT: weź v= param lub ostatni segment
            const v = u.searchParams.get('v');
            if (v) return `YouTube: ${v}`;
            const list = u.searchParams.get('list');
            if (list) return `YouTube Playlist: ${list}`;
            const seg = u.pathname.split('/').filter(Boolean).pop();
            return seg || u.hostname;
        } catch { return 'Utwór'; }
    }

    // Dodaje utwór do kolejki w Firebase (push)
    async function addToRadioQueue(rawUrl, rawTitle) {
        const parsed = radioParseUrl(rawUrl);
        if (!parsed) return { ok: false, msg: 'Nieprawidłowy link. Podaj URL YouTube, YouTube Playlist lub bezpośredni link .mp3' };
        let state;
        try { state = await fetchRadioQueueState(); } catch { state = { items: [], nowPlaying: null, version: 0 }; }
        const count = state.items.length;
        if (count >= RADIO_MAX_QUEUE) return { ok: false, msg: `Kolejka pełna (max ${RADIO_MAX_QUEUE})` };
        const nick = getRadioAuthorLabel();
        const authorUserId = String(getRuntimeUserId() || '').trim();
        const createdAt = nowTs();
        const id = `rq_${createdAt}_${Math.random().toString(36).slice(2, 6)}`;
        const entry = {
            id,
            url: parsed.url,
            videoId: parsed.videoId || null,
            playlistId: parsed.playlistId || null,
            durationSec: null,
            type: parsed.type,
            title: radioSafeTitle(parsed.url, rawTitle),
            addedBy: nick,
            addedById: authorUserId,
            addedAt: firebaseServerTimestampValue(),
            clientAddedAt: createdAt,
            votes: {}
        };

        try {
            if (!state.nowPlaying && !state.items.length) {
                const ok1 = await firebaseWritePath(`${RADIO_QUEUE_PATH}/nowPlaying`, {
                    ...entry,
                    startTime: firebaseServerTimestampValue(),
                    startedAt: firebaseServerTimestampValue()
                });
                await firebaseWritePath(`${RADIO_QUEUE_PATH}/version`, firebaseServerTimestampValue());
                if (!ok1) return { ok: false, msg: '❌ Błąd zapisu do Firebase — spróbuj ponownie' };
                return { ok: true, msg: `✅ Odtwarzam od razu: ${entry.title}` };
            }

            const ok1 = await firebaseWritePath(`${RADIO_QUEUE_PATH}/items/${id}`, entry);
            await firebaseWritePath(`${RADIO_QUEUE_PATH}/version`, firebaseServerTimestampValue());
            if (!ok1) return { ok: false, msg: '❌ Błąd zapisu do Firebase — spróbuj ponownie' };
            return { ok: true, msg: `✅ Dodano: ${entry.title}` };
        } catch (e) {
            return { ok: false, msg: `❌ Błąd: ${e?.message || 'nieznany'}` };
        }
    }

    // Usuwa utwór z kolejki (tylko własny, chyba że admin)
    async function removeFromRadioQueue(id) {
        const targetId = String(id || '').trim();
        if (!targetId) return;

        if (String(radioNowPlaying?.id || '') === targetId) {
            await firebaseDeletePath(`${RADIO_QUEUE_PATH}/nowPlaying`);
            await radioAdvanceQueue();
            await firebaseWritePath(`${RADIO_QUEUE_PATH}/version`, firebaseServerTimestampValue());
            return;
        }

        await firebaseDeletePath(`${RADIO_QUEUE_PATH}/items/${id}`);
        await firebaseWritePath(`${RADIO_QUEUE_PATH}/version`, firebaseServerTimestampValue());
    }

    function computeRadioVoteScore(item) {
        return item?.votes ? Object.values(item.votes).reduce((sum, value) => sum + Number(value || 0), 0) : 0;
    }

    function getRadioItemAddedTimestamp(item) {
        return Number(item?.addedAt || item?.clientAddedAt || 0) || 0;
    }

    function sortRadioQueueItems(items = []) {
        return [...items].sort((a, b) => {
            const scoreDiff = computeRadioVoteScore(b) - computeRadioVoteScore(a);
            if (scoreDiff !== 0) return scoreDiff;
            return getRadioItemAddedTimestamp(a) - getRadioItemAddedTimestamp(b);
        });
    }

    // Pobiera pełny stan kolejki z Firebase
    async function fetchRadioQueueState() {
        try {
            const data = await firebaseReadPath(RADIO_QUEUE_PATH);
            if (!data || typeof data !== 'object') return { items: [], nowPlaying: null, version: 0 };
            const items = sortRadioQueueItems(Object.values(data.items || {}).filter(Boolean));
            return {
                items,
                nowPlaying: data.nowPlaying || null,
                version: Number(data.version) || 0
            };
        } catch { return { items: [], nowPlaying: null, version: 0 }; }
    }

    // Ustawia nowPlaying i usuwa go z kolejki (wywołuje "DJ" — pierwszy w kolejce)
    async function radioAdvanceQueue() {
        const state = await fetchRadioQueueState();
        if (!state.items.length) {
            await firebaseDeletePath(`${RADIO_QUEUE_PATH}/nowPlaying`);
            await firebaseWritePath(`${RADIO_QUEUE_PATH}/version`, firebaseServerTimestampValue());
            return;
        }
        const next = state.items[0];
        await firebaseDeletePath(`${RADIO_QUEUE_PATH}/items/${next.id}`);
        await firebaseWritePath(`${RADIO_QUEUE_PATH}/nowPlaying`, {
            ...next,
            startTime: firebaseServerTimestampValue(),
            startedAt: firebaseServerTimestampValue()
        });
        await firebaseWritePath(`${RADIO_QUEUE_PATH}/version`, firebaseServerTimestampValue());
    }

    // Główna funkcja synchronizacji — odpytuje Firebase i aktualizuje lokalny player
    async function syncRadioQueue() {
        if (!appSettings.features.radio) return;
        try {
            const state = await fetchRadioQueueState();
            radioDebugLastSyncAt = Date.now();
            radioQueueItems = state.items;
            const version = state.version;
            const nowP = state.nowPlaying;
            const ytFrame = document.getElementById('sebus-rp-yt-frame');
            const audio = ensureRadioAudio();
            radioDebug(`SYNC items=${state.items.length} now=${nowP ? (nowP.type || '?') : 'none'} v=${version}`);

            if (nowP?.type === 'yt') {
                const { ended } = getRadioGlobalOffsetSec(nowP);
                const now = Date.now();
                if (ended && (now - radioLastEndedAdvanceAt) > 6000) {
                    radioLastEndedAdvanceAt = now;
                    const jitter = 120 + Math.random() * 220;
                    setTimeout(async () => {
                        const check = await fetchRadioQueueState();
                        if (check.nowPlaying?.id === nowP.id) {
                            await radioAdvanceQueue();
                            setTimeout(() => syncRadioQueue(), 120);
                        }
                    }, jitter);
                    radioLastQueueVersion = version;
                    return;
                }
            }

            radioSyncSkipButtonState(nowP || null);

            // Sprawdź czy nowPlaying się zmieniło — to musi działać ZAWSZE (niezależnie od panelu)
            const prevId = radioNowPlaying?.id || null;
            const newId = nowP?.id || null;
            const localPlayerNeedsRecovery = !!newId && (
                (nowP?.type === 'yt' && (!ytFrame || !ytFrame.src || !radioYtReady || radioYtLoadedVideoId !== getRadioYoutubeTargetKey(nowP))) ||
                (nowP?.type !== 'yt' && (!audio.src || audio.paused))
            );

            if (newId && newId !== prevId) {
                radioNowPlaying = nowP;
                radioFallbackMode = false;
                radioNeedsHardResync = true;
                radioApplyNowPlaying(nowP);
            } else if (newId && newId === prevId && localPlayerNeedsRecovery) {
                radioNowPlaying = nowP;
                radioFallbackMode = false;
                radioNeedsHardResync = true;
                radioApplyNowPlaying(nowP);
            } else if (newId && newId === prevId && getRadioItemStartTimestamp(nowP) !== getRadioItemStartTimestamp(radioNowPlaying)) {
                radioNowPlaying = nowP;
                radioNeedsHardResync = true;
                radioApplyNowPlaying(nowP);
            } else if (!newId && state.items.length > 0 && version !== radioLastQueueVersion) {
                const jitter = 120 + Math.random() * 180;
                setTimeout(async () => {
                    const check = await fetchRadioQueueState();
                    if (!check.nowPlaying && check.items.length > 0) {
                        await radioAdvanceQueue();
                        setTimeout(() => syncRadioQueue(), 120);
                    }
                }, jitter);
            } else if (!newId && !state.items.length && !radioFallbackMode) {
                radioNowPlaying = null;
                radioFallbackMode = true;
                radioApplyFallback();
            } else if (!newId && !state.items.length && radioFallbackMode && (!audio.src || audio.paused)) {
                radioApplyFallback();
            } else if (!newId && state.items.length > 0 && radioFallbackMode) {
                const jitter = 80 + Math.random() * 120;
                setTimeout(async () => {
                    const check = await fetchRadioQueueState();
                    if (!check.nowPlaying && check.items.length > 0) {
                        await radioAdvanceQueue();
                        setTimeout(() => syncRadioQueue(), 120);
                    }
                }, jitter);
            }

            radioLastQueueVersion = version;

            // Aktualizuj UI panelu — tylko jeśli panel istnieje w DOM
            const panel = document.getElementById('sebus-radio-player');
            if (!panel) return;

            renderRadioQueueList(state.items, nowP);

            const badge = panel.querySelector('.sebus-rp-badge');
            if (badge) badge.textContent = state.items.length ? `${state.items.length} w kolejce` : 'Kolejka pusta';

        } catch (e) {
            radioSetStatus(`❌ Błąd sync: ${e?.message || String(e)}`);
            setTimeout(() => radioSetStatus(''), 5000);
        }
    }

    function stopRadioRealtimeListener() {
        radioRealtimeConnected = false;
        radioLastRealtimeEventAt = 0;
        if (radioRealtimeReconnectTimer) {
            clearTimeout(radioRealtimeReconnectTimer);
            radioRealtimeReconnectTimer = null;
        }
        if (radioRealtimeAbortController) {
            try { radioRealtimeAbortController.abort(); } catch { }
            radioRealtimeAbortController = null;
        }
    }

    function scheduleRadioRealtimeReconnect(delayMs = 1200) {
        if (!appSettings.features.radio) return;
        if (radioRealtimeReconnectTimer) clearTimeout(radioRealtimeReconnectTimer);
        radioRealtimeReconnectTimer = setTimeout(() => {
            radioRealtimeReconnectTimer = null;
            startRadioRealtimeListener();
        }, delayMs);
    }

    function bindRadioRealtimeHooks() {
        if (radioRealtimeHooksBound) return;
        radioRealtimeHooksBound = true;

        const ensureFreshRadioSync = () => {
            if (!appSettings.features.radio) return;
            syncRadioQueue();
            if (!radioRealtimeAbortController) startRadioRealtimeListener();
        };

        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') ensureFreshRadioSync();
        });
        window.addEventListener('focus', ensureFreshRadioSync);
        window.addEventListener('online', ensureFreshRadioSync);
        window.addEventListener('pageshow', ensureFreshRadioSync);
    }

    async function startRadioRealtimeListener() {
        if (!appSettings.features.radio) return;
        if (radioRealtimeAbortController || radioRealtimeConnected) return;

        try {
            const controller = await firebaseStreamPath(RADIO_QUEUE_PATH, {
                onEvent: ({ event, data }) => {
                    if (event === 'keep-alive') return;
                    radioLastRealtimeEventAt = nowTs();
                    const path = String(data?.path || '');
                    if (path === '/' || path.startsWith('/items') || path.startsWith('/nowPlaying') || path.startsWith('/version')) {
                        radioRealtimeConnected = true;
                        syncRadioQueue();
                    }
                },
                onClose: () => {
                    radioRealtimeAbortController = null;
                    radioRealtimeConnected = false;
                    scheduleRadioRealtimeReconnect(1200);
                },
                onError: () => {
                    radioRealtimeAbortController = null;
                    radioRealtimeConnected = false;
                    scheduleRadioRealtimeReconnect(1800);
                }
            });

            if (!controller) {
                scheduleRadioRealtimeReconnect(1800);
                return;
            }

            radioRealtimeAbortController = controller;
            radioRealtimeConnected = false;
            radioLastRealtimeEventAt = nowTs();
        } catch {
            radioRealtimeAbortController = null;
            radioRealtimeConnected = false;
            radioLastRealtimeEventAt = 0;
            scheduleRadioRealtimeReconnect(2000);
        }
    }

    // ── RADIO PLAYBACK ──────────────────────────────────────────────

    function radioApplyNowPlaying(item) {
        const panel    = document.getElementById('sebus-radio-player');
        const nowTitle = panel ? panel.querySelector('.sebus-rp-now-title') : null;
        const nowMeta  = panel ? panel.querySelector('.sebus-rp-now-meta')  : null;
        const skipBtn  = panel ? panel.querySelector('#sebus-rp-skip')      : null;
        const ytFrame  = document.getElementById('sebus-rp-yt-frame');
        const audio    = ensureRadioAudio();

        // Oblicz ile sekund minęło od startu (synchronizacja czasowa)
        const elapsedSec = getRadioElapsedSec(item);
        radioDebug(`Now playing: ${item.type || '?'} ${String(item.title || item.url || '').slice(0, 36)}`);

        if (nowTitle) nowTitle.textContent = item.title || 'Nieznany utwór';
        if (nowMeta)  nowMeta.textContent  = `dodał: ${item.addedBy || '?'}`;
        if (skipBtn) {
            const canSkip = canCurrentUserSkipRadioItem(item);
            skipBtn.disabled = !canSkip;
            skipBtn.title = canSkip ? 'Pomiń utwór' : 'Możesz pominąć tylko swój utwór (admin może każdy)';
            skipBtn.style.opacity = canSkip ? '1' : '.45';
            skipBtn.style.cursor = canSkip ? 'pointer' : 'not-allowed';
        }

        if (item.type === 'yt') {
            radioYtUnmuteSwitchedFor = '';
            if (!audio.paused) { audio.pause(); audio.src = ''; }
            radioNeedsHardResync = true;
            if (ytFrame) {
                const shouldMute = getRadioYoutubeVolumePercent() <= 0 || !radioMediaUnlocked;
                const needBootstrapSrc = !ytFrame.src;
                if (needBootstrapSrc) {
                    radioYtReady = false;
                    ytFrame.src = buildRadioYoutubeSrc(item, elapsedSec, { muted: shouldMute });
                    radioYtLoadedVideoId = getRadioYoutubeTargetKey(item);
                } else {
                    syncRadioYoutubePlayback(item, { seek: true, forceLoad: true });
                }
            }
            radioUpdateToggleBtn(true);
        } else {
            if (ytFrame) ytFrame.removeAttribute('src');
            radioYtReady = false;
            radioYtLoadedVideoId = '';
            audio.src = item.url;
            const vol = getRadioVolumeValue();
            audio.volume = vol;
            audio.play().then(() => {
                if (elapsedSec > 0 && isFinite(audio.duration) && elapsedSec < audio.duration) {
                    audio.currentTime = elapsedSec;
                } else if (elapsedSec > 0) {
                    audio.addEventListener('loadedmetadata', function onMeta() {
                        audio.removeEventListener('loadedmetadata', onMeta);
                        if (elapsedSec < audio.duration) audio.currentTime = elapsedSec;
                    });
                }
                radioUpdateToggleBtn(true);
            }).catch(() => radioUpdateToggleBtn(false));
        }
        radioSetStatus('');
    }

    function radioApplyFallback() {
        const panel    = document.getElementById('sebus-radio-player');
        const nowTitle = panel ? panel.querySelector('.sebus-rp-now-title') : null;
        const nowMeta  = panel ? panel.querySelector('.sebus-rp-now-meta')  : null;
        const skipBtn  = panel ? panel.querySelector('#sebus-rp-skip')      : null;
        const ytFrame  = document.getElementById('sebus-rp-yt-frame');
        const audio    = ensureRadioAudio();
        const station  = radioStations[radioFallbackIndex] || radioStations[0];
        radioDebug(`Fallback radio: ${station.name}`);

        if (nowTitle) nowTitle.textContent = station.name;
        if (nowMeta)  nowMeta.textContent  = 'stacja radiowa (brak piosenek w kolejce)';
        if (skipBtn) {
            skipBtn.disabled = true;
            skipBtn.title = 'Brak utworu użytkownika do pominięcia';
            skipBtn.style.opacity = '.45';
            skipBtn.style.cursor = 'not-allowed';
        }
        if (ytFrame) ytFrame.removeAttribute('src');
        radioYtReady = false;

        const vol = getRadioVolumeValue();
        if (audio.src !== station.url || audio.paused) {
            if (audio.src !== station.url) {
                audio.src = station.url;
            }
            audio.volume = vol;
            audio.play().then(() => radioUpdateToggleBtn(true)).catch(() => radioUpdateToggleBtn(false));
        }
        radioSetStatus('📻 Tryb radia — dodaj utwór do kolejki');
    }

    function radioSetStatus(msg) {
        const el = document.querySelector('#sebus-radio-player .sebus-rp-status');
        if (el) el.textContent = msg || '';
    }

    function radioUpdateToggleBtn(isPlaying) {
        const btn = document.getElementById('sebus-radio-toggle');
        if (!btn) return;
        btn.classList.toggle('playing', !!isPlaying);
        btn.textContent = isPlaying ? '🎵 Gra · Otwórz' : '🎙️ Radio · Otwórz';
    }

    function renderRadioQueueList(items, nowPlaying) {
        const wrap = document.querySelector('#sebus-radio-player .sebus-rp-queue-wrap');
        if (!wrap) return;
        const myNick = getRadioAuthorLabel();
        const myUserId = String(getRuntimeUserId() || '').trim();
        wrap.innerHTML = '';
        if (!items.length) {
            wrap.innerHTML = '<div class="sebus-rp-queue-empty">Kolejka pusta — dodaj link YouTube lub .mp3</div>';
            return;
        }
        // Sort by vote score (descending) — items already ordered but apply vote sort
        const scored = items.map(item => {
            const score = computeRadioVoteScore(item);
            return { ...item, _voteScore: score };
        });
        // Active item stays at top, rest sorted by votes
        const activeItem = scored.find(i => nowPlaying && nowPlaying.id === i.id);
        const rest = scored.filter(i => !(nowPlaying && nowPlaying.id === i.id));
        rest.sort((a,b) => b._voteScore - a._voteScore);
        const ordered = activeItem ? [activeItem, ...rest] : rest;

        ordered.forEach((item, idx) => {
            const isActive = nowPlaying && nowPlaying.id === item.id;
            const canDelete = String(item.addedById || '').trim() === myUserId
                || item.addedBy === myNick
                || isCurrentRadioAdmin();
            const myVote  = item.votes?.[myUserId];
            const score   = item._voteScore;
            const scoreLabel = score > 0 ? `+${score}` : String(score);
            const upCls   = myVote === 1  ? ' sebus-rp-vote-active-up'   : '';
            const downCls = myVote === -1 ? ' sebus-rp-vote-active-down' : '';
            const row = document.createElement('div');
            row.className = `sebus-rp-queue-item${isActive ? ' active' : ''}`;
            row.innerHTML = `
                <span class="sebus-rp-queue-num">${idx + 1}.</span>
                <span class="sebus-rp-queue-title" title="${item.title || ''}">${item.title || item.url}</span>
                <span class="sebus-rp-queue-by">${item.addedBy || ''}</span>
                <span class="sebus-rp-vote-row">
                  <button class="sebus-rp-vote-btn${upCls}" data-id="${item.id}" data-v="1" title="Głosuj za">▲</button>
                  <span class="sebus-rp-vote-score${score>0?' pos':score<0?' neg':''}">${scoreLabel}</span>
                  <button class="sebus-rp-vote-btn${downCls}" data-id="${item.id}" data-v="-1" title="Głosuj przeciw">▼</button>
                </span>
                ${canDelete ? `<button class="sebus-rp-queue-del" data-id="${item.id}" title="Usuń">✕</button>` : ''}
            `;
            wrap.appendChild(row);
        });
        wrap.querySelectorAll('.sebus-rp-vote-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                const v  = +btn.dataset.v;
                btn.disabled = true;
                await voteRadioQueueItem(id, v);
            });
        });
        wrap.querySelectorAll('.sebus-rp-queue-del').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                btn.disabled = true;
                await removeFromRadioQueue(btn.dataset.id);
                radioSetStatus('Usunięto z kolejki');
                setTimeout(() => syncRadioQueue(), 600);
            });
        });
    }
