// Module: 40-shared-realtime.js
// Source: e:\mpcforum-userscript\skrypt:3043-3525
// Purpose: Watch Together, Mini Games, GIF Party and Whiteboard shared state

    /* ═══════════════════════════════════════════════════════════════════
       WATCH TOGETHER — Firebase helpers
       ═══════════════════════════════════════════════════════════════════ */
    async function syncWatchState() {
        if (!appSettings.features.watchTogether) return;
        try {
            const data = await firebaseReadPath(WATCH_PATH);
            watchState = data || null;
            const panel = document.getElementById('sebus-watch-panel');
            if (panel && panel.classList.contains('show')) renderWatchPanel(panel);
        } catch(e) { /* silent */ }
    }
    async function watchSetVideo(videoId) {
        const myNick = getCurrentNickLabel() || 'Anonim';
        const payload = {
            videoId: String(videoId).trim(),
            hostId: String(getRuntimeUserId()),
            hostNick: myNick,
            playing: true,
            positionSec: 0,
            updatedAt: Date.now(),
            viewers: { [String(getRuntimeUserId())]: myNick }
        };
        await firebaseWritePath(WATCH_PATH, payload);
        watchState = payload;
        setTimeout(() => syncWatchState(), 400);
    }
    async function watchSendCommand(cmd) {
        if (!watchState) return;
        const patch = { playing: cmd === 'play', updatedAt: Date.now() };
        await firebaseWritePath(WATCH_PATH, { ...watchState, ...patch });
        watchState = { ...watchState, ...patch };
    }
    async function watchJoinAsViewer() {
        if (!watchState) return;
        const myNick = getCurrentNickLabel() || 'Anonim';
        const uid    = String(getRuntimeUserId());
        await firebaseWritePath(`${WATCH_PATH}/viewers/${uid}`, myNick);
    }

    /* ═══════════════════════════════════════════════════════════════════
       MINI GAMES — Firebase helpers
       ═══════════════════════════════════════════════════════════════════ */
    function normalizeGamesRoot(raw) {
        if (!raw || typeof raw !== 'object') return { tables: {}, updatedAt: 0 };
        if (raw.tables && typeof raw.tables === 'object') {
            return { ...raw, tables: { ...raw.tables } };
        }

        if (raw.type) {
            const rawId = String(raw.id || '');
            // Always use legacy_ prefix for root-level tables so leaveGamesTable can detect them
            const legacyId = rawId.startsWith('legacy_')
                ? rawId
                : rawId
                    ? `legacy_${rawId}`
                    : `legacy_${raw.startedAt || nowTs()}`;
            const legacyTable = {
                id: legacyId,
                type: raw.type,
                players: { ...(raw.players || {}) },
                maxPlayers: 2,
                status: raw.finishedAt ? 'finished' : 'playing',
                createdAt: Number(raw.startedAt || nowTs()),
                updatedAt: Number(raw.updatedAt || nowTs()),
                board: Array.isArray(raw.board) ? [...raw.board] : undefined,
                turn: raw.turn || '',
                winner: raw.winner || '',
                round: Number(raw.round || 0),
                questions: Array.isArray(raw.questions) ? [...raw.questions] : undefined,
                answers: raw.answers && typeof raw.answers === 'object' ? { ...raw.answers } : undefined,
                scores: raw.scores && typeof raw.scores === 'object' ? { ...raw.scores } : undefined,
                finishedAt: Number(raw.finishedAt || 0) || 0,
            };
            return { tables: { [legacyId]: legacyTable }, updatedAt: legacyTable.updatedAt };
        }

        return { tables: {}, updatedAt: Number(raw.updatedAt || 0) || 0 };
    }

    function getGamesTables(state = gamesState) {
        const rows = Object.values(state?.tables || {}).filter(Boolean);
        rows.sort((a, b) => (Number(b.updatedAt || b.createdAt || 0) - Number(a.updatedAt || a.createdAt || 0)));
        return rows;
    }

    function getGamesTableById(tableId, state = gamesState) {
        if (!tableId) return null;
        return state?.tables?.[tableId] || null;
    }

    function getMyGamesTableId(state = gamesState) {
        const uid = String(getRuntimeUserId());
        if (!uid) return '';
        const table = getGamesTables(state).find(t => t?.players && Object.prototype.hasOwnProperty.call(t.players, uid));
        return table?.id || '';
    }

    function getQuizParticipantIds(table) {
        const ids = Object.keys(table?.players || {});
        return ids.slice(0, 2);
    }

    function getQuizRoundAnswerCount(table, round = Number(table?.round || 0)) {
        const answers = table?.answers || {};
        const participants = new Set(getQuizParticipantIds(table));
        if (!participants.size) return 0;
        return Object.keys(answers).filter(key => {
            if (!key.startsWith(`${round}_`)) return false;
            const userId = key.slice(String(round).length + 1);
            return participants.has(userId);
        }).length;
    }

    async function syncGamesState() {
        if (!appSettings.features.miniGames) return;
        try {
            const data = await firebaseReadPath(GAMES_PATH);
            gamesState = normalizeGamesRoot(data);

            const myTableId = getMyGamesTableId(gamesState);
            if (!myTableId) gamesPreferLobbyView = false;
            if (myTableId && !activeGamesTableId && !gamesPreferLobbyView) activeGamesTableId = myTableId;
            if (activeGamesTableId && !getGamesTableById(activeGamesTableId, gamesState)) {
                activeGamesTableId = gamesPreferLobbyView ? '' : (myTableId || '');
            }

            const panel = document.getElementById('sebus-games-panel');
            if (panel && panel.classList.contains('show')) renderGamesPanel(panel);
        } catch(e) { /* silent */ }
    }

    async function createGamesTable(type) {
        const uid = String(getRuntimeUserId());
        const myNick = getCurrentNickLabel() || 'Anonim';
        const latestRaw = await firebaseReadPath(GAMES_PATH);
        const latest = normalizeGamesRoot(latestRaw);

        const existingId = getMyGamesTableId(latest);
        if (existingId) {
            // If it's a legacy table stuck in Firebase, auto-clean and proceed
            if (existingId.startsWith('legacy_')) {
                await firebaseDeletePath(GAMES_PATH);
            } else {
                // Valid new-format table — open it
                activeGamesTableId = existingId;
                gamesPreferLobbyView = false;
                gamesState = latest;
                const panel = document.getElementById('sebus-games-panel');
                if (panel) renderGamesPanel(panel);
                return;
            }
        }

        const tableId = `tbl_${nowTs()}_${Math.random().toString(36).slice(2, 6)}`;
        const payload = {
            id: tableId,
            type,
            players: { [uid]: myNick },
            maxPlayers: 2,
            status: 'waiting',
            createdAt: nowTs(),
            updatedAt: nowTs()
        };

        if (type === 'ttt') {
            payload.board = ['','','','','','','','',''];
            payload.turn = uid;
            payload.winner = '';
        } else {
            payload.round = 0;
            payload.questions = getDefaultQuizQuestions();
            payload.answers = {};
            payload.scores = {};
            payload.finishedAt = 0;
        }

        await firebaseWritePath(`${GAMES_PATH}/tables/${tableId}`, payload);
        await firebaseWritePath(`${GAMES_PATH}/updatedAt`, nowTs());
        activeGamesTableId = tableId;
        gamesPreferLobbyView = false;
        const data = await firebaseReadPath(GAMES_PATH);
        gamesState = normalizeGamesRoot(data);
        const panel = document.getElementById('sebus-games-panel');
        if (panel) renderGamesPanel(panel);
    }

    async function joinGamesTable(tableId) {
        const targetId = String(tableId || '').trim();
        if (!targetId) return;

        const uid = String(getRuntimeUserId());
        const myNick = getCurrentNickLabel() || 'Anonim';

        const latest = normalizeGamesRoot(await firebaseReadPath(GAMES_PATH));
        const myTableId = getMyGamesTableId(latest);
        if (myTableId && myTableId !== targetId) {
            gamesSetStatus('Najpierw opuść swój obecny stolik.', 2000);
            activeGamesTableId = myTableId;
            gamesPreferLobbyView = false;
            const p = document.getElementById('sebus-games-panel');
            if (p) renderGamesPanel(p);
            return;
        }

        const table = getGamesTableById(targetId, latest);
        if (!table) {
            gamesSetStatus('Stolik już nie istnieje.', 1500);
            const p = document.getElementById('sebus-games-panel');
            if (p) renderGamesPanel(p);
            return;
        }

        const playerIds = Object.keys(table.players || {});
        const isAlreadyIn = playerIds.includes(uid);
        if (!isAlreadyIn && playerIds.length >= 2) {
            gamesSetStatus('Ten stolik jest już pełny.', 1500);
            return;
        }

        if (!isAlreadyIn) {
            await firebaseWritePath(`${GAMES_PATH}/tables/${targetId}/players/${uid}`, myNick);
            await firebaseWritePath(`${GAMES_PATH}/tables/${targetId}/status`, (playerIds.length + 1) >= 2 ? 'playing' : 'waiting');
            await firebaseWritePath(`${GAMES_PATH}/tables/${targetId}/updatedAt`, nowTs());
            await firebaseWritePath(`${GAMES_PATH}/updatedAt`, nowTs());
        }

        activeGamesTableId = targetId;
        gamesPreferLobbyView = false;
        const data = await firebaseReadPath(GAMES_PATH);
        gamesState = normalizeGamesRoot(data);
        const panel = document.getElementById('sebus-games-panel');
        if (panel) renderGamesPanel(panel);
    }

    async function leaveGamesTable(tableId = activeGamesTableId) {
        const targetId = String(tableId || '').trim();
        if (!targetId) return false;

        const uid = String(getRuntimeUserId());
        try {
            // Detect if this is a legacy table (stored at root, not under tables/)
            const isLegacy = targetId.startsWith('legacy_');
            const tablePath = isLegacy ? GAMES_PATH : `${GAMES_PATH}/tables/${targetId}`;

            const table = await firebaseReadPath(tablePath);
            if (!table || typeof table !== 'object') return false;

            // For legacy format, players may be at root level
            const players = table.players || {};
            if (!Object.prototype.hasOwnProperty.call(players, uid)) return false;

            const newPlayers = { ...players };
            delete newPlayers[uid];

            const remainingCount = Object.keys(newPlayers).length;
            if (isLegacy) {
                // Legacy: delete entire root path (full reset)
                await firebaseDeletePath(GAMES_PATH);
            } else if (remainingCount === 0) {
                await firebaseDeletePath(tablePath);
            } else {
                await firebaseWritePath(`${tablePath}/players`, newPlayers);
                await firebaseWritePath(`${tablePath}/status`, remainingCount >= 2 ? 'playing' : 'waiting');
                await firebaseWritePath(`${tablePath}/updatedAt`, nowTs());
                await firebaseWritePath(`${GAMES_PATH}/updatedAt`, nowTs());
            }

            if (activeGamesTableId === targetId) activeGamesTableId = '';
            gamesPreferLobbyView = true;

            const data = await firebaseReadPath(GAMES_PATH);
            gamesState = normalizeGamesRoot(data);
            const panel = document.getElementById('sebus-games-panel');
            if (panel) renderGamesPanel(panel);

            return true;
        } catch (e) {
            console.error('[Games] leaveGamesTable error:', e.message || e);
            return false;
        }
    }

    async function resetTableGame(tableId, type) {
        const table = await firebaseReadPath(`${GAMES_PATH}/tables/${tableId}`);
        if (!table) return;
        const players = { ...(table.players || {}) };
        const playerIds = Object.keys(players);

        const patch = {
            status: playerIds.length >= 2 ? 'playing' : 'waiting',
            updatedAt: nowTs()
        };

        if (type === 'ttt') {
            patch.board = ['','','','','','','','',''];
            patch.turn = playerIds[0] || String(getRuntimeUserId());
            patch.winner = '';
        } else {
            patch.round = 0;
            patch.questions = getDefaultQuizQuestions();
            patch.answers = {};
            patch.scores = {};
            patch.finishedAt = 0;
        }

        await firebaseWritePath(`${GAMES_PATH}/tables/${tableId}`, { ...table, ...patch });
        await firebaseWritePath(`${GAMES_PATH}/updatedAt`, nowTs());
        const p = document.getElementById('sebus-games-panel');
        if (p) await syncGamesState();
    }

    async function makeTableMove(tableId, data) {
        if (!tableId) return;
        const table = await firebaseReadPath(`${GAMES_PATH}/tables/${tableId}`);
        if (!table) return;
        const updated = { ...table, ...data, updatedAt: nowTs() };
        await firebaseWritePath(`${GAMES_PATH}/tables/${tableId}`, updated);
        await firebaseWritePath(`${GAMES_PATH}/updatedAt`, nowTs());
        const p = document.getElementById('sebus-games-panel');
        if (p) await syncGamesState();
    }

    async function maybeAdvanceQuizRound(tableId) {
        const table = await firebaseReadPath(`${GAMES_PATH}/tables/${tableId}`);
        if (!table || table.type !== 'quiz') return;

        const round = Number(table.round || 0);
        const total = Number(table.questions?.length || 0);
        if (!total || round >= total) return;

        const participants = getQuizParticipantIds(table);
        const required = Math.max(1, participants.length);
        const answered = getQuizRoundAnswerCount(table, round);
        if (answered < required) return;

        if (round + 1 >= total) {
            await firebaseWritePath(`${GAMES_PATH}/tables/${tableId}/round`, total);
            await firebaseWritePath(`${GAMES_PATH}/tables/${tableId}/finishedAt`, nowTs());
            await firebaseWritePath(`${GAMES_PATH}/tables/${tableId}/status`, 'finished');
            await firebaseWritePath(`${GAMES_PATH}/tables/${tableId}/updatedAt`, nowTs());
        } else {
            await firebaseWritePath(`${GAMES_PATH}/tables/${tableId}/round`, round + 1);
            await firebaseWritePath(`${GAMES_PATH}/tables/${tableId}/updatedAt`, nowTs());
        }
        await firebaseWritePath(`${GAMES_PATH}/updatedAt`, nowTs());
    }

    async function submitQuizAnswer(tableId, answerIndex) {
        const uid = String(getRuntimeUserId());
        const myNick = getCurrentNickLabel() || 'Anonim';
        const table = await firebaseReadPath(`${GAMES_PATH}/tables/${tableId}`);
        if (!table || table.type !== 'quiz') return;

        const round = Number(table.round || 0);
        const total = Number(table.questions?.length || 0);
        if (round >= total) return;

        const participants = getQuizParticipantIds(table);
        const isParticipant = participants.includes(uid);
        if (!isParticipant && participants.length >= 2) {
            gamesSetStatus('Stolik 1v1 jest pełny — jesteś widzem.', 2200);
            return;
        }

        const answerKey = `${round}_${uid}`;
        if (table.answers && table.answers[answerKey] !== undefined) return;

        if (!isParticipant) {
            await firebaseWritePath(`${GAMES_PATH}/tables/${tableId}/players/${uid}`, myNick);
        }

        await firebaseWritePath(`${GAMES_PATH}/tables/${tableId}/answers/${encodeURIComponent(answerKey)}`, Number(answerIndex));

        const q = table.questions?.[round];
        const isCorrect = !!q && Number(answerIndex) === Number(q.correct);
        if (isCorrect) {
            const scoreNowRaw = await firebaseReadPath(`${GAMES_PATH}/tables/${tableId}/scores/${encodeURIComponent(uid)}`);
            const scoreNow = Number(scoreNowRaw || 0);
            await firebaseWritePath(`${GAMES_PATH}/tables/${tableId}/scores/${encodeURIComponent(uid)}`, scoreNow + 1);
        }

        await firebaseWritePath(`${GAMES_PATH}/tables/${tableId}/updatedAt`, nowTs());
        await firebaseWritePath(`${GAMES_PATH}/updatedAt`, nowTs());
        await maybeAdvanceQuizRound(tableId);
        const p = document.getElementById('sebus-games-panel');
        if (p) await syncGamesState();
    }
    function getDefaultQuizQuestions() {
        return [
            { q: 'Ile nóg ma pająk?',    a: ['4','6','8','10'],    correct: 2 },
            { q: 'Stolica Francji?',      a: ['Berlin','Paryż','Rzym','Madryt'], correct: 1 },
            { q: 'Ile cm ma metr?',       a: ['10','100','1000','50'],   correct: 1 },
            { q: '7 × 8 = ?',             a: ['54','56','58','48'],      correct: 1 },
            { q: 'Największa planeta?',   a: ['Mars','Ziemia','Saturn','Jowisz'], correct: 3 },
        ];
    }

    /* ═══════════════════════════════════════════════════════════════════
       GIF PARTY — Firebase helpers
       ═══════════════════════════════════════════════════════════════════ */
    async function syncGifParty() {
        if (!appSettings.features.gifParty) return;
        try {
            const data = await firebaseReadPath(GIFPARTY_PATH);
            gifPartyFeed = data ? Object.values(data) : [];
            gifPartyFeed.sort((a,b) => (b.addedAt||0) - (a.addedAt||0));
            const panel = document.getElementById('sebus-gifparty-panel');
            if (panel && panel.classList.contains('show')) renderGifPartyPanel(panel);
        } catch(e) { /* silent */ }
    }
    async function addGifToParty(url, tenorTitle) {
        const uid    = String(getRuntimeUserId());
        const myNick = getCurrentNickLabel() || 'Anonim';
        const id     = `gif_${uid}_${Date.now()}`;
        const entry  = { id, url, title: tenorTitle || '', nick: myNick, userId: uid, votes: {}, addedAt: Date.now() };
        const ok     = await firebaseWritePath(`${GIFPARTY_PATH}/${id}`, entry);
        if (!ok) return false;
        // Enforce max
        if (gifPartyFeed.length >= GIFPARTY_MAX) {
            const oldest = [...gifPartyFeed].sort((a,b) => (a.addedAt||0) - (b.addedAt||0))[0];
            if (oldest) await firebaseDeletePath(`${GIFPARTY_PATH}/${oldest.id}`);
        }
        setTimeout(() => syncGifParty(), 400);
        return true;
    }
    async function voteGifItem(id, v) {
        const uid = String(getRuntimeUserId());
        await firebaseWritePath(`${GIFPARTY_PATH}/${id}/votes/${uid}`, v);
        setTimeout(() => syncGifParty(), 300);
    }

    /* ═══════════════════════════════════════════════════════════════════
       WHITEBOARD — Firebase helpers
       ═══════════════════════════════════════════════════════════════════ */
    async function syncWhiteboard() {
        if (!appSettings.features.whiteboard) return;
        try {
            const data = await firebaseReadPath(WHITEBOARD_PATH);
            wbStrokes = data ? Object.values(data) : [];
            wbStrokes.sort((a,b) => (a.t||0) - (b.t||0));
            const canvas = document.getElementById('sebus-wb-canvas');
            if (canvas) redrawWhiteboard(canvas);
        } catch(e) { /* silent */ }
    }
    async function pushWbStroke(stroke) {
        const uid    = String(getRuntimeUserId());
        const myNick = getCurrentNickLabel() || 'Anonim';
        const id     = `s_${uid}_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;
        const entry  = { id, points: stroke.points, color: stroke.color, width: stroke.width, nick: myNick, userId: uid, t: Date.now() };
        await firebaseWritePath(`${WHITEBOARD_PATH}/${id}`, entry);
        wbStrokes.push(entry);
        if (wbStrokes.length > WHITEBOARD_MAX_STROKES) {
            const old = wbStrokes.splice(0, wbStrokes.length - WHITEBOARD_MAX_STROKES);
            for (const s of old) await firebaseDeletePath(`${WHITEBOARD_PATH}/${s.id}`);
        }
        setTimeout(() => syncWhiteboard(), 300);
    }
    async function clearWhiteboard() {
        const data = await firebaseReadPath(WHITEBOARD_PATH);
        if (!data) return;
        for (const id of Object.keys(data)) await firebaseDeletePath(`${WHITEBOARD_PATH}/${id}`);
        wbStrokes = [];
        const canvas = document.getElementById('sebus-wb-canvas');
        if (canvas) { const ctx = canvas.getContext('2d'); ctx.clearRect(0,0,canvas.width,canvas.height); }
    }
    function redrawWhiteboard(canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const scaleX = canvas.width  / 400;
        const scaleY = canvas.height / 260;
        for (const s of wbStrokes) {
            if (!s.points || s.points.length < 2) continue;
            ctx.strokeStyle = s.color || '#ffd700';
            ctx.lineWidth   = (s.width || 3) * Math.min(scaleX, scaleY);
            ctx.lineCap     = 'round'; ctx.lineJoin = 'round';
            ctx.beginPath();
            ctx.moveTo(s.points[0][0] * scaleX, s.points[0][1] * scaleY);
            for (let i=1; i<s.points.length; i++) ctx.lineTo(s.points[i][0]*scaleX, s.points[i][1]*scaleY);
            ctx.stroke();
        }
    }
