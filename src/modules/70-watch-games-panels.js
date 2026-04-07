// Module: 70-watch-games-panels.js
// Source: e:\mpcforum-userscript\skrypt:6897-8024
// Purpose: Watch Together, Mini Games, GIF Party and Whiteboard panels

    /* ═══════════════════════════════════════════════════════════════════
       WATCH TOGETHER — init + render + runner
       ═══════════════════════════════════════════════════════════════════ */
    function initWatchIfNeeded() {
                // Jeden wspólny przycisk do Tablica/Watch/GIF
                if (document.getElementById('sebus-board-watch-gif-toggle')) return;
                const toggle = document.createElement('button');
                toggle.id = 'sebus-board-watch-gif-toggle';
                toggle.className = 'sebus-mp-toggle';
                toggle.textContent = '🧩 Tablica / Watch / GIF';
                toggle.style.cssText = 'bottom:78px;right:14px;background:linear-gradient(90deg,#ffd700,#55ff88,#5599ff);color:#222;font-weight:700;';
                document.body.appendChild(toggle);
                toggle.addEventListener('click', () => {
                        const panel = window.ensureBoardWatchGifPanel && window.ensureBoardWatchGifPanel();
                        if (panel) panel.style.display = (panel.style.display === 'block') ? 'none' : 'block';
                });
    }
    function watchSetStatus(msg, ms=0) {
        const el = document.getElementById('sebus-watch-status');
        if (el) el.textContent = msg;
        if (ms) setTimeout(() => { if (el) el.textContent = ''; }, ms);
    }
    function extractYoutubeId(raw) {
        try {
            const url = new URL(raw.includes('://') ? raw : 'https://'+raw);
            if (url.searchParams.has('v')) return url.searchParams.get('v');
            const m = url.pathname.match(/(?:embed\/|shorts\/|v\/|youtu\.be\/)([A-Za-z0-9_-]{11})/);
            if (m) return m[1];
        } catch(_) {}
        const m2 = raw.match(/[A-Za-z0-9_-]{11}/);
        return m2 ? m2[0] : null;
    }
    function renderWatchPanel(panel) {
        if (!watchState) return;
        const frame   = panel.querySelector('#sebus-watch-frame');
        const badge   = panel.querySelector('#sebus-watch-badge');
        const viewers = panel.querySelector('#sebus-watch-viewers');
        if (!frame) return;

        // getRadioEmbedOrigin() already returns encodeURIComponent(origin), use it directly
        const rawOrigin = (() => { try { return window.location.origin || `${window.location.protocol}//${window.location.host}`; } catch(_) { return 'https://www.mpcforum.pl'; } })();
        const encOrigin = encodeURIComponent(rawOrigin);
        const src = `https://www.youtube-nocookie.com/embed/${watchState.videoId}?enablejsapi=1&autoplay=1&origin=${encOrigin}&widget_referrer=${encOrigin}&rel=0&modestbranding=1&iv_load_policy=3`;
        if (frame.dataset.vid !== watchState.videoId) {
            frame.src = src;
            frame.dataset.vid = watchState.videoId;
        }
        const vCount = watchState.viewers ? Object.keys(watchState.viewers).length : 0;
        if (badge)   badge.textContent = `${vCount} widzów`;
        if (viewers) {
            const nicks = watchState.viewers ? Object.values(watchState.viewers).join(', ') : '';
            viewers.textContent = nicks ? `👁 ${nicks}` : '';
        }
        // host badge
        const uid = String(getRuntimeUserId());
        const isHost = String(watchState.hostId) === uid;
        let hb = panel.querySelector('.sebus-watch-host-badge');
        if (isHost && !hb) {
            hb = document.createElement('span');
            hb.className = 'sebus-watch-host-badge';
            hb.textContent = '👑 Host';
            panel.querySelector('.sebus-mp-header .sebus-mp-title').after(hb);
        } else if (!isHost && hb) { hb.remove(); }
    }
    function runWatchModule() {
        initWatchIfNeeded();
        syncWatchState();
        if (watchSyncTimer) clearInterval(watchSyncTimer);
        watchSyncTimer = setInterval(syncWatchState, WATCH_SYNC_MS);
    }

    /* ═══════════════════════════════════════════════════════════════════
       MINI GAMES — init + render + runner
       ═══════════════════════════════════════════════════════════════════ */
    function initGamesIfNeeded() {
        if (!appSettings.features.miniGames) return;
        const existingPanel = document.getElementById('sebus-games-panel');
        if (existingPanel) return existingPanel;

        const panel = document.createElement('div');
        panel.id = 'sebus-games-panel';
        panel.className = 'sebus-mp-panel';
        panel.style.cssText = 'bottom:150px;right:14px;';
        panel.innerHTML = `
          <div class="sebus-mp-header">
            <span class="sebus-mp-title">🎮 Mini Gry</span>
            <span class="sebus-mp-badge" id="sebus-games-badge">—</span>
            <button class="sebus-mp-close" id="sebus-games-close">✕</button>
          </div>
          <div class="sebus-mp-body">
            <div id="sebus-games-content"><div class="sebus-games-menu">
              <button class="sebus-mp-btn" id="sebus-games-ttt">❌⭕ Kółko i krzyżyk</button>
              <button class="sebus-mp-btn" id="sebus-games-quiz">📝 Quiz 1v1</button>
              <button class="sebus-mp-btn" id="sebus-games-snejk">🐍 Snejk</button>
            </div></div>
            <div class="sebus-mp-status" id="sebus-games-status"></div>
          </div>`;
        document.body.appendChild(panel);
        panel.querySelector('#sebus-games-close').addEventListener('click', () => {
            panel.classList.remove('show');
        });
        panel.querySelector('#sebus-games-ttt').addEventListener('click', () => createGamesTable('ttt'));
        panel.querySelector('#sebus-games-quiz').addEventListener('click', () => createGamesTable('quiz'));
        panel.querySelector('#sebus-games-snejk').addEventListener('click', () => openSnejkPanel());
        return panel;
    }
    function gamesSetStatus(msg, ms=0) {
        const el = document.getElementById('sebus-games-status');
        if (el) el.textContent = msg;
        if (ms) setTimeout(() => { if (el) el.textContent = ''; }, ms);
    }
    function renderGamesPanel(panel) {
        const badge = panel.querySelector('#sebus-games-badge');
        const content = panel.querySelector('#sebus-games-content');
        if (!content) return;

        const tables = getGamesTables(gamesState);
        if (badge) badge.textContent = `${tables.length} stolików`;

        const myTableId = getMyGamesTableId(gamesState);
        if (!myTableId) gamesPreferLobbyView = false;
        if (myTableId && !activeGamesTableId && !gamesPreferLobbyView) activeGamesTableId = myTableId;
        const activeTable = getGamesTableById(activeGamesTableId, gamesState);

        // Clear old event listeners by replacing content
        if (!activeTable) {
            renderGamesLobbyContent(content, tables, myTableId);
        } else if (activeTable.type === 'ttt') {
            renderTicTacToeContent(content, activeTable);
        } else if (activeTable.type === 'quiz') {
            renderQuizContent(content, activeTable);
        } else {
            renderGamesLobbyContent(content, tables, myTableId);
        }
    }

    function renderGamesLobbyContent(contentEl, tables, myTableId) {
        const uid = String(getRuntimeUserId());
        let html = `<div class="sebus-games-menu">
            <button class="sebus-mp-btn" id="sebus-games-create-ttt">❌⭕ Nowy stół TTT</button>
            <button class="sebus-mp-btn" id="sebus-games-create-quiz">📝 Nowy stół Quiz 1v1</button>
            <button class="sebus-mp-btn" id="sebus-games-open-snejk">🐍 Otwórz Snejka</button>
        </div>`;

        if (!tables.length) {
            html += `<div class="sebus-games-info">Brak aktywnych stolików — utwórz nowy albo odpal Snejka solo.</div>`;
        } else {
            html += `<div style="display:flex;flex-direction:column;gap:6px;margin-top:6px;">`;
            tables.forEach(table => {
                const playerIds = Object.keys(table.players || {});
                const maxPlayers = Number(table.maxPlayers || 2) || 2;
                const isMine = playerIds.includes(uid);
                const canJoin = !myTableId && playerIds.length < maxPlayers;
                const label = table.type === 'quiz' ? 'Quiz 1v1' : 'Kółko i Krzyżyk';
                const stateLabel = table.status === 'finished' ? 'zakończony' : (table.status === 'playing' ? 'w trakcie' : 'oczekuje');
                const names = playerIds.map(pid => table.players?.[pid] || pid).join(' vs ') || '—';
                html += `<div class="sebus-games-info" style="margin:0;display:flex;justify-content:space-between;align-items:center;gap:8px;">
                    <div style="flex:1;min-width:0;">
                        <div><strong>${label}</strong> • ${playerIds.length}/${maxPlayers} • ${stateLabel}</div>
                        <div style="opacity:.7;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${names}</div>
                    </div>
                    ${isMine ? `<button class="sebus-mp-btn" data-open-table="${table.id}" type="button">Wejdź</button>` : `<button class="sebus-mp-btn" data-join-table="${table.id}" ${canJoin ? '' : 'disabled'} type="button">Dołącz</button>`}
                </div>`;
            });
            html += `</div>`;
        }

        // Always show my table controls if I have a table
        if (myTableId) {
            html += `<div class="sebus-mp-row" style="margin-top:8px;justify-content:space-between;">
                <button class="sebus-mp-btn" id="sebus-games-open-my-table" type="button">▶ Otwórz mój stolik</button>
                <button class="sebus-mp-btn" id="sebus-games-leave-my-table" type="button">🚪 Opuść stolik</button>
            </div>`;
        }

        contentEl.innerHTML = html;
        
        // Attach event listeners
        contentEl.querySelector('#sebus-games-create-ttt')?.addEventListener('click', () => createGamesTable('ttt'));
        contentEl.querySelector('#sebus-games-create-quiz')?.addEventListener('click', () => createGamesTable('quiz'));
        contentEl.querySelector('#sebus-games-open-snejk')?.addEventListener('click', () => openSnejkPanel());
        contentEl.querySelectorAll('[data-join-table]').forEach(btn => {
            btn.addEventListener('click', () => joinGamesTable(btn.getAttribute('data-join-table')));
        });
        contentEl.querySelectorAll('[data-open-table]').forEach(btn => {
            btn.addEventListener('click', () => {
                activeGamesTableId = btn.getAttribute('data-open-table') || '';
                gamesPreferLobbyView = false;
                syncGamesState();
            });
        });
        contentEl.querySelector('#sebus-games-open-my-table')?.addEventListener('click', () => {
            activeGamesTableId = myTableId;
            gamesPreferLobbyView = false;
            syncGamesState();
        });
        const leaveBtn = contentEl.querySelector('#sebus-games-leave-my-table');
        if (leaveBtn) {
            leaveBtn.addEventListener('click', async () => {
                gamesSetStatus('Opuszczam stolik...', 0);
                const ok = await leaveGamesTable(myTableId);
                if (ok) gamesSetStatus('Opuszczono stolik.', 1500);
                else gamesSetStatus('Błąd opuszczania.', 2000);
            });
        }
    }
    function renderTicTacToe(panel, table) {
        const uid     = String(getRuntimeUserId());
        const state   = table;
        const tableId = String(table.id || '');
        const isMyTurn= String(state.turn) === uid;
        const winLines= [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
        let winLine   = null;
        for (const l of winLines) {
            if (state.board[l[0]] && state.board[l[0]] === state.board[l[1]] && state.board[l[0]] === state.board[l[2]]) { winLine = l; break; }
        }
        const players = Object.entries(state.players || {}).slice(0, 2);
        const symbols = { [players[0]?.[0]]: '❌', [players[1]?.[0]]: '⭕' };
        let html = `<div class="sebus-ttt-board">`;
        state.board.forEach((v,i) => {
            const winClass = winLine && winLine.includes(i) ? ' win' : '';
            html += `<div class="sebus-ttt-cell${winClass}" data-i="${i}" ${v?`data-v="${v}"`:''}>${v ? (symbols[v]||v) : ''}</div>`;
        });
        html += `</div><div class="sebus-games-info">`;
        if (state.winner) html += `🏆 Wygrał: ${symbols[state.winner]||state.winner}`;
        else if (state.board.every(c=>c)) html += `🤝 Remis!`;
        else if (players.length < 2) html += `⏳ Czekam na drugiego gracza…`;
        else html += isMyTurn ? `⬆️ Twój ruch (${symbols[uid]||'?'})` : `⏳ Czeka na ruch…`;
        html += `</div>`;
        html += `<div class="sebus-mp-row" style="justify-content:space-between">
            <button class="sebus-mp-btn" id="sebus-games-back-lobby">← Lobby</button>
            ${(state.winner || state.board.every(c=>c)) ? `<button class="sebus-mp-btn" id="sebus-ttt-again">🔄 Nowa runda</button>` : ''}
        </div>`;
        panel.querySelector('#sebus-games-content').innerHTML = html;
        if (!state.winner && !state.board.every(c=>c) && isMyTurn && players.length >= 2) {
            panel.querySelectorAll('.sebus-ttt-cell:not([data-v])').forEach(cell => {
                cell.addEventListener('click', () => {
                    const idx = +cell.dataset.i;
                    const newBoard = [...state.board];
                    newBoard[idx] = uid;
                    // Find next player
                    const ps = Object.keys(state.players || {});
                    const nextTurn = ps.find(p => p !== uid) || uid;
                    // Check winner
                    let winner = '';
                    for (const l of winLines) { if (newBoard[l[0]] === uid && newBoard[l[0]] === newBoard[l[1]] && newBoard[l[0]] === newBoard[l[2]]) { winner = uid; break; } }
                    makeTableMove(tableId, { board: newBoard, turn: nextTurn, winner, status: 'playing' });
                });
            });
        }
        panel.querySelector('#sebus-games-back-lobby')?.addEventListener('click', () => {
            activeGamesTableId = '';
            gamesPreferLobbyView = true;
            renderGamesPanel(panel);
        });
        panel.querySelector('#sebus-ttt-again')?.addEventListener('click', () => resetTableGame(tableId, 'ttt'));
    }
    function renderQuizContent(contentEl, table) {
        const uid   = String(getRuntimeUserId());
        const state = table;
        const tableId = String(table.id || '');
        const participants = getQuizParticipantIds(state);
        const isParticipant = participants.includes(uid);
        const total = state.questions?.length || 0;
        const finished = !!state.finishedAt || (state.round || 0) >= total;

        if (finished) {
            const scores = state.scores || {};
            let html = `<div class="sebus-quiz-q">🏁 Koniec quizu</div><div class="sebus-quiz-score">`;
            participants.forEach(pid => {
                html += `${state.players?.[pid] || pid}: ${scores?.[pid] || 0}pkt&nbsp;&nbsp;`;
            });
            html += `</div><div class="sebus-mp-row" style="justify-content:space-between">
                <button class="sebus-mp-btn" id="sebus-games-back-lobby">← Lobby</button>
                <button class="sebus-mp-btn" id="sebus-quiz-again">🔄 Nowy quiz</button>
            </div>`;
            contentEl.innerHTML = html;
            contentEl.querySelector('#sebus-games-back-lobby')?.addEventListener('click', () => {
                activeGamesTableId = '';
                gamesPreferLobbyView = true;
                syncGamesState();
            });
            contentEl.querySelector('#sebus-quiz-again')?.addEventListener('click', () => resetTableGame(tableId, 'quiz'));
            return;
        }

        const q     = state.questions?.[state.round];
        if (!q) { contentEl.innerHTML = `<div class="sebus-games-info">Brak pytań</div>`; return; }
        const myAns  = state.answers?.[`${state.round}_${uid}`];
        const scores = state.scores || {};
        let html     = `<div class="sebus-quiz-q">❓ ${q.q}</div><div class="sebus-quiz-answers">`;
        q.a.forEach((ans, i) => {
            let cls = 'sebus-quiz-ans';
            if (myAns !== undefined) { if (i === q.correct) cls += ' correct'; else if (i === +myAns) cls += ' wrong'; }
            html += `<div class="${cls}" data-i="${i}">${ans}</div>`;
        });
        html += `</div><div class="sebus-quiz-score">`;
        participants.forEach(pid => { html += `${state.players?.[pid]||pid}: ${scores?.[pid] || 0}pkt  `; });
        html += `<br><span style="color:rgba(255,232,183,.4)">Pytanie ${(state.round||0)+1}/${total}</span></div>`;
        html += `<div class="sebus-mp-row" style="justify-content:space-between">
            <button class="sebus-mp-btn" id="sebus-games-back-lobby">← Lobby</button>
            ${(!isParticipant && participants.length >= 2) ? '<span style="font-size:10px;opacity:.8;align-self:center;">👀 Widz</span>' : ''}
        </div>`;
        contentEl.innerHTML = html;
        contentEl.querySelector('#sebus-games-back-lobby')?.addEventListener('click', () => {
            activeGamesTableId = '';
            gamesPreferLobbyView = true;
            syncGamesState();
        });
        if (myAns === undefined && (isParticipant || participants.length < 2)) {
            contentEl.querySelectorAll('.sebus-quiz-ans').forEach(el => {
                el.addEventListener('click', async () => {
                    const ansIdx = +el.dataset.i;
                    await submitQuizAnswer(tableId, ansIdx);
                });
            });
        }
    }
    function renderQuiz(panel, table) { renderQuizContent(panel.querySelector('#sebus-games-content'), table); }
    let gamesSyncScheduled = false;
    function scheduleGamesSyncIfNeeded() {
        if (gamesSyncScheduled) return;
        gamesSyncScheduled = true;
        setTimeout(async () => {
            gamesSyncScheduled = false;
            await syncGamesState();
        }, 300);
    }
    function runGamesModule() {
        if (!appSettings.features.miniGames) {
            const panel = document.getElementById('sebus-games-panel');
            if (panel) panel.remove();
            closeSnejkPanel();
            if (gamesSyncTimer) { clearInterval(gamesSyncTimer); gamesSyncTimer = null; }
            return;
        }
        initGamesIfNeeded();
        runSnejkModule();
        // Periodic sync every 8s to catch remote updates
        if (gamesSyncTimer) clearInterval(gamesSyncTimer);
        gamesSyncTimer = setInterval(async () => {
            const data = await firebaseReadPath(GAMES_PATH);
            gamesState = normalizeGamesRoot(data);
            const panel = document.getElementById('sebus-games-panel');
            if (panel && panel.classList.contains('show')) renderGamesPanel(panel);
        }, 8000);
    }

    /* ═══════════════════════════════════════════════════════════════════
       GIF PARTY — init + render + runner
       ═══════════════════════════════════════════════════════════════════ */
    function initGifPartyIfNeeded() {
                // Usunięty osobny przycisk GIF Party
        }
    function gpSetStatus(msg, ms=0) {
        const el = document.getElementById('sebus-gp-status');
        if (el) el.textContent = msg;
        if (ms) setTimeout(() => { if (el) el.textContent = ''; }, ms);
    }
    function renderGifPartyPanel(panel) {
        const feed  = panel.querySelector('#sebus-gp-feed');
        const badge = panel.querySelector('#sebus-gp-badge');
        if (badge) badge.textContent = `${gifPartyFeed.length} GIFów`;
        if (!feed) return;
        const uid = String(getRuntimeUserId());
        feed.innerHTML = '';
        for (const item of gifPartyFeed) {
            const score    = Object.values(item.votes||{}).reduce((s,v)=>s+v, 0);
            const myVote   = item.votes?.[uid];
            const div      = document.createElement('div');
            div.className  = 'sebus-gp-item';
            div.innerHTML  = `<img class="sebus-gp-img" src="${item.url}" loading="lazy">
              <div class="sebus-gp-meta">
                <span class="sebus-gp-nick">👤 ${item.nick||'Anonim'}</span>
                <div class="sebus-gp-vote">
                  <button class="sebus-gp-vote-btn${myVote===1?' voted-up':''}" data-id="${item.id}" data-v="1">👍</button>
                  <span class="sebus-gp-score">${score>=0?'+':''}${score}</span>
                  <button class="sebus-gp-vote-btn${myVote===-1?' voted-down':''}" data-id="${item.id}" data-v="-1">👎</button>
                </div>
              </div>`;
            div.querySelectorAll('.sebus-gp-vote-btn').forEach(btn => {
                btn.addEventListener('click', () => voteGifItem(btn.dataset.id, +btn.dataset.v));
            });
            feed.appendChild(div);
        }
        if (!gifPartyFeed.length) feed.innerHTML = '<div style="color:rgba(255,232,183,.35);font-size:9px;text-align:center;padding:12px 0">Brak GIFów — bądź pierwszy! 🎉</div>';
    }
    function runGifPartyModule() {
        initGifPartyIfNeeded();
        syncGifParty();
        if (gifPartySyncTimer) clearInterval(gifPartySyncTimer);
        gifPartySyncTimer = setInterval(syncGifParty, 3000);
    }

    /* ═══════════════════════════════════════════════════════════════════
       WHITEBOARD — init + render + runner
       ═══════════════════════════════════════════════════════════════════ */
    function initWhiteboardIfNeeded() {
        // Usunięty osobny przycisk Tablica
    }
    function wbSetStatus(msg, ms=0) {
        const el = document.getElementById('sebus-wb-status');
        if (el) el.textContent = msg;
        if (ms) setTimeout(() => { if (el) el.textContent = ''; }, ms);
    }
    function runWhiteboardModule() {
        initWhiteboardIfNeeded();
        syncWhiteboard();
        const badge = document.getElementById('sebus-wb-badge');
        if (badge) badge.textContent = `${wbStrokes.length} kresek`;
    }

    function positionRadio() {
        if (!appSettings.features.radio) {
            const toggle = document.getElementById('sebus-radio-toggle');
            const player = document.getElementById('sebus-radio-player');
            if (toggle) toggle.style.display = 'none';
            if (player) player.classList.remove('show');
            const audio = radioAudio;
            if (audio && !audio.paused) audio.pause();
            stopRadioRealtimeListener();
            if (radioSyncTimer) { clearInterval(radioSyncTimer); radioSyncTimer = null; }
            return;
        }
        const toggle = document.getElementById('sebus-radio-toggle');
        if (!toggle) return;
        toggle.style.display = '';

        const dockBottomCenter = () => {
            toggle.style.position = 'fixed';
            toggle.style.top = 'auto';
            toggle.style.bottom = '14px';
            toggle.style.left = '50%';
            toggle.style.transform = 'translateX(-50%)';
            toggle.classList.remove('sebus-radio-positioned');
        };

        // Szukaj volume icon i repositionuj button obok niego tylko gdy jest widoczny
        const volAnchor = findBestVolumeAnchor();
        if (!volAnchor) {
            dockBottomCenter();
            return;
        }

        const vRect = volAnchor.getBoundingClientRect();
        const anchorVisible = vRect.width > 0
            && vRect.height > 0
            && vRect.top >= 0
            && vRect.left >= 0
            && vRect.bottom <= window.innerHeight
            && vRect.right <= window.innerWidth
            && volAnchor.offsetParent !== null;

        if (!anchorVisible) {
            dockBottomCenter();
            return;
        }

        const approxButtonWidth = Math.max(96, toggle.offsetWidth || 96);
        toggle.style.position = 'fixed';
        toggle.style.bottom = 'auto';
        toggle.style.top = `${Math.max(8, vRect.top - 2)}px`;
        toggle.style.left = `${Math.max(8, vRect.left - approxButtonWidth - 10)}px`;
        toggle.style.transform = 'none';
        toggle.classList.add('sebus-radio-positioned');
    }

    function normalizeNickText(value) {
        return (value || '').replace(/^@/, '').replace(/\s+/g, '').trim();
    }

    function isNicknameLike(el) {
        const rawText = (el.innerText || el.textContent || '').trim();
        if (!rawText) return false;

        const text = normalizeNickText(rawText);
        if (!/^[\p{L}\p{N}_.-]{2,30}$/u.test(text)) return false;

        if (el.closest('button, .ipsButton, .ipsNavBar, .ipsBreadcrumb, .ipsMenu, .cUserNav, .ipsTags')) return false;

        const href = (el.getAttribute('href') || '').toLowerCase();
        const classBlob = `${el.className || ''} ${el.parentElement ? el.parentElement.className || '' : ''}`.toLowerCase();
        const isProfileLink = href.includes('/profile/') || href.includes('showuser=') || href.includes('/members/');
        const isMention = el.hasAttribute('data-mentionid') || classBlob.includes('mention');
        const isAuthorLike = /(author|username|user-name|nickname|nick|member)/i.test(classBlob);
        const isChatLike = !!el.closest('.cChatBox, .ipsChat, [class*="Chat"], [id*="chat"]');

        return isProfileLink || isMention || isAuthorLike || isChatLike;
    }

    function applyNickGlow(el) {
        const color = window.getComputedStyle(el).color || '#FFD700';
        el.style.textShadow = `0 0 10px ${color}, 0 0 4px ${color}`;
        el.style.fontWeight = 'bold';
        el.style.filter = 'brightness(1.2)';
        el.dataset.rankGlow = 'glowing';
    }

    function forceGoldForSebus(el) {
        el.classList.add('sebus-gold-legend');
        el.dataset.rankGlow = 'gold';

        const account = getBaksyAccount();
        const neonActive = account.neonColor && Number(account.neonUntil) > nowTs();
        if (neonActive) {
            const color = account.neonColor;
            el.style.color = `${color}`;
            el.style.textShadow = `0 0 12px ${color}, 0 0 6px ${color}`;
            el.style.filter = 'brightness(1.2)';
        }
    }

    function simpleHash(text) {
        let hash = 0;
        const src = String(text || '');
        for (let i = 0; i < src.length; i += 1) {
            hash = ((hash << 5) - hash) + src.charCodeAt(i);
            hash |= 0;
        }
        return Math.abs(hash).toString(36);
    }

    function compactList(list, maxSize) {
        if (!Array.isArray(list)) return [];
        if (list.length <= maxSize) return list;
        return list.slice(list.length - maxSize);
    }

    function isElementAuthoredByMe(element) {
        if (!element) return false;
        const runtimeUserId = getRuntimeUserId();
        if (element.querySelector(`[data-mentionid="${runtimeUserId}"]`)) return true;
        if (element.querySelector(`a[data-memberid="${runtimeUserId}"]`)) return true;
        if (element.querySelector(`a[href*="showuser=${runtimeUserId}"]`)) return true;
        if (element.querySelector(`a[href*="/profile/${runtimeUserId}"]`)) return true;
        if (element.querySelector(`a[href*=".${runtimeUserId}/"]`)) return true;
        return false;
    }

    function buildChatActionKey(chatRow) {
        const rowId = chatRow.id || '';
        const rawDiv = chatRow.querySelector('[id^="chatraw_"], .ipsList_inline');
        const rawText = (rawDiv?.innerText || rawDiv?.textContent || chatRow.textContent || '').replace(/\s+/g, ' ').trim();
        if (rowId) return `chat:${rowId}`;
        return `chat:h_${simpleHash(rawText.slice(0, 240))}`;
    }

    function buildPostActionKey(postEl) {
        const commentId = postEl.getAttribute('data-commentid') || postEl.id || '';
        const text = (postEl.textContent || '').replace(/\s+/g, ' ').trim();
        if (commentId) return `post:${commentId}`;
        return `post:h_${simpleHash(text.slice(0, 300))}`;
    }

    function getNightActivityMultiplier() {
        const hour = new Date().getHours();
        if (hour < 0 || hour > 6) return 1;

        const activeUsers = document.querySelectorAll('.sebus-life-active').length;
        const onlineUsers = document.querySelectorAll('#elOnlineUsers a[data-memberid], [id*="OnlineUsers"] a[data-memberid], [class*="OnlineUsers"] a[data-memberid]').length;
        if (activeUsers <= 2 || onlineUsers <= 6) return Number(appSettings.baksy.nightMultiplier) || 1.5;
        return 1;
    }

    function hasSeenBaksyAction(key) {
        const account = getBaksyAccount();
        return Array.isArray(account.seenActionKeys) && account.seenActionKeys.includes(key);
    }

    function markBaksyActionSeen(key) {
        const account = getBaksyAccount();
        const current = Array.isArray(account.seenActionKeys) ? account.seenActionKeys : [];
        if (!current.includes(key)) current.push(key);
        account.seenActionKeys = compactList(current, 3000);
        account.updatedAt = nowTs();
    }

    /**
     * Przyznaje baksy konkretnemu użytkownikowi.
     * Jeśli targetUserId === runtimeUserId — używa lokalnego awardBaksy().
     * Jeśli targetUserId to inny gracz — pisze bezpośrednio do jego per-user Firebase baksyDb
     * oraz aktualizuje jego publiczny sharedBaksyWorld/accounts/<uid>.
     */
    async function awardBaksyToUser(targetUserId, amountBase, reason, payload = {}) {
        const runtimeUserId = String(getRuntimeUserId());
        const cleanTarget = String(targetUserId || '').trim();
        if (!cleanTarget) return;

        const amount = normalizeBaksyNumber(Number(amountBase) || 0);
        if (amount <= 0) return;

        if (cleanTarget === runtimeUserId) {
            awardBaksy(amount, reason, payload, { disableNightMultiplier: true });
            return;
        }

        // Inny gracz — zapis bezpośrednio przez Firebase
        try {
            const remoteDb = await firebaseReadPath(`users/${encodeURIComponent(cleanTarget)}/baksyDb`);
            const db = remoteDb && typeof remoteDb === 'object' ? remoteDb : {};
            const accounts = db.accounts && typeof db.accounts === 'object' ? db.accounts : {};
            const prev = accounts[cleanTarget] || createDefaultBaksyProfile(cleanTarget);
            accounts[cleanTarget] = {
                ...prev,
                balance: normalizeBaksyNumber((Number(prev.balance) || 0) + amount),
                totalEarned: normalizeBaksyNumber((Number(prev.totalEarned) || 0) + amount),
                updatedAt: nowTs()
            };
            const ledger = Array.isArray(db.ledger) ? db.ledger : [];
            ledger.push({
                id: `tx_${nowTs()}_${Math.random().toString(36).slice(2, 8)}`,
                at: nowTs(),
                type: 'earn',
                reason,
                amount,
                multiplier: 1,
                userId: cleanTarget,
                payload
            });
            if (ledger.length > 1200) ledger.splice(0, ledger.length - 1200);
            await firebaseWriteUserStatePart('baksyDb', { ...db, accounts, ledger, updatedAt: nowTs(), userId: cleanTarget }, cleanTarget);

            // Zaktualizuj publiczny shared account
            const sharedAcc = await firebaseReadPath(`${baksySharedRootPath}/accounts/${encodeURIComponent(cleanTarget)}`);
            if (sharedAcc && typeof sharedAcc === 'object') {
                await firebaseWritePath(`${baksySharedRootPath}/accounts/${encodeURIComponent(cleanTarget)}`, {
                    ...sharedAcc,
                    balance: normalizeBaksyNumber((Number(sharedAcc.balance) || 0) + amount),
                    totalEarned: normalizeBaksyNumber((Number(sharedAcc.totalEarned) || 0) + amount),
                    updatedAt: nowTs()
                });
                await firebaseWritePath(`${baksySharedRootPath}/updatedAt`, nowTs());
            }
        } catch (e) {
            console.warn('[Baksy] awardBaksyToUser: błąd Firebase dla', cleanTarget, e);
        }
    }

    function awardBaksy(amountBase, reason, payload = {}, options = {}) {
        const runtimeUserId = getRuntimeUserId();
        const account = getBaksyAccount(runtimeUserId);
        const nightMultiplier = options.disableNightMultiplier ? 1 : getNightActivityMultiplier();
        const communityState = getCommunityGoalState();
        const sunday = new Date().getDay() === 0;
        const communityMultiplier = sunday && communityState.weekendBonusActive ? 1.5 : 1;
        // Boost XP z zakupu w sklepie prestiżu
        const xpBoostActive = account.xpBoostUntil && Number(account.xpBoostUntil) > nowTs();
        const xpMultiplier = xpBoostActive ? (Number(account.xpBoostMultiplier) || 1.5) : 1;
        const multiplier = nightMultiplier * communityMultiplier * xpMultiplier;
        const amount = normalizeBaksyNumber((Number(amountBase) || 0) * multiplier);
        if (amount <= 0) return;

        account.displayName = getCurrentNickLabel();
        account.balance = normalizeBaksyNumber((Number(account.balance) || 0) + amount);
        account.totalEarned = normalizeBaksyNumber((Number(account.totalEarned) || 0) + amount);
        account.updatedAt = nowTs();

        appendBaksyLedger({
            type: 'earn',
            reason,
            amount,
            multiplier,
            userId: String(runtimeUserId),
            payload
        });
        saveBaksyDb();
    }

    function spendBaksy(amount, reason, payload = {}) {
        const runtimeUserId = getRuntimeUserId();
        const account = getBaksyAccount(runtimeUserId);
        const value = normalizeBaksyNumber(amount);
        if (value <= 0) return false;
        if ((Number(account.balance) || 0) < value) return false;

        account.balance = normalizeBaksyNumber((Number(account.balance) || 0) - value);
        account.totalSpent = normalizeBaksyNumber((Number(account.totalSpent) || 0) + value);
        account.updatedAt = nowTs();

        appendBaksyLedger({
            type: 'spend',
            reason,
            amount: value,
            userId: String(runtimeUserId),
            payload
        });
        saveBaksyDb();
        return true;
    }

    function transferBaksy(targetUserId, amount) {
        if (!appSettings.baksy.transfersEnabled) return { ok: false, message: 'Przelewy są wyłączone.' };
        const runtimeUserId = String(getRuntimeUserId());
        const cleanTarget = String(targetUserId || '').trim();
        const cleanAmount = normalizeBaksyNumber(amount);

        if (!/^\d{3,}$/.test(cleanTarget)) return { ok: false, message: 'Podaj poprawne ID odbiorcy.' };
        if (cleanTarget === runtimeUserId) return { ok: false, message: 'Nie możesz przelać do siebie.' };
        if (cleanAmount <= 0) return { ok: false, message: 'Kwota musi być > 0.' };

        const sender = getBaksyAccount(runtimeUserId);
        if ((Number(sender.balance) || 0) < cleanAmount) return { ok: false, message: 'Za mało baksów.' };

        // 1. Pobierz/potrąć konto nadawcy (lokalnie i przez Firebase)
        sender.balance = normalizeBaksyNumber((Number(sender.balance) || 0) - cleanAmount);
        sender.totalTransferredOut = normalizeBaksyNumber((Number(sender.totalTransferredOut) || 0) + cleanAmount);
        sender.updatedAt = nowTs();

        appendBaksyLedger({
            type: 'transfer',
            amount: cleanAmount,
            fromUserId: runtimeUserId,
            toUserId: cleanTarget
        });
        // Zapisz lokalnie i wyślij do Firebase per-user nadawcy
        saveBaksyDb();

        // 2. Prześlij środki do odbiorcy przez Firebase (async – nie blokuje UI)
        (async () => {
            try {
                // Odczytaj aktualny baksyDb odbiorcy z Firebase
                const receiverState = await firebaseReadPath(`users/${encodeURIComponent(cleanTarget)}/baksyDb`);
                const receiverDb = receiverState && typeof receiverState === 'object' ? receiverState : {};
                const receiverAccounts = receiverDb.accounts && typeof receiverDb.accounts === 'object' ? receiverDb.accounts : {};

                // Zaktualizuj lub utwórz konto odbiorcy
                const prevBalance = normalizeBaksyNumber((receiverAccounts[cleanTarget] || {}).balance || 0);
                const prevTotalEarned = normalizeBaksyNumber((receiverAccounts[cleanTarget] || {}).totalEarned || 0);
                const prevTotalIn = normalizeBaksyNumber((receiverAccounts[cleanTarget] || {}).totalTransferredIn || 0);
                receiverAccounts[cleanTarget] = {
                    ...(receiverAccounts[cleanTarget] || createDefaultBaksyProfile(cleanTarget)),
                    balance: normalizeBaksyNumber(prevBalance + cleanAmount),
                    totalEarned: normalizeBaksyNumber(prevTotalEarned + cleanAmount),
                    totalTransferredIn: normalizeBaksyNumber(prevTotalIn + cleanAmount),
                    updatedAt: nowTs()
                };

                // Zapisz ledger transferu do baksyDb odbiorcy
                const receiverLedger = Array.isArray(receiverDb.ledger) ? receiverDb.ledger : [];
                receiverLedger.push({
                    id: `tx_${nowTs()}_${Math.random().toString(36).slice(2, 8)}`,
                    at: nowTs(),
                    type: 'transfer_in',
                    amount: cleanAmount,
                    fromUserId: runtimeUserId,
                    toUserId: cleanTarget
                });
                if (receiverLedger.length > 1200) receiverLedger.splice(0, receiverLedger.length - 1200);

                const patchedReceiverDb = {
                    ...receiverDb,
                    accounts: receiverAccounts,
                    ledger: receiverLedger,
                    updatedAt: nowTs(),
                    userId: cleanTarget
                };

                // Zapisz zaktualizowany baksyDb odbiorcy do Firebase
                await firebaseWriteUserStatePart('baksyDb', patchedReceiverDb, cleanTarget);

                // Zaktualizuj też publiczny shared account odbiorcy
                const sharedReceiverAccount = await firebaseReadPath(`${baksySharedRootPath}/accounts/${encodeURIComponent(cleanTarget)}`);
                if (sharedReceiverAccount && typeof sharedReceiverAccount === 'object') {
                    const updatedShared = {
                        ...sharedReceiverAccount,
                        balance: normalizeBaksyNumber((Number(sharedReceiverAccount.balance) || 0) + cleanAmount),
                        totalEarned: normalizeBaksyNumber((Number(sharedReceiverAccount.totalEarned) || 0) + cleanAmount),
                        updatedAt: nowTs()
                    };
                    await firebaseWritePath(`${baksySharedRootPath}/accounts/${encodeURIComponent(cleanTarget)}`, updatedShared);
                    await firebaseWritePath(`${baksySharedRootPath}/updatedAt`, nowTs());
                }
            } catch (e) {
                // Transfer Firebase — błąd jest logowany cicho; nadawca ma już potrącone środki
                console.warn('[Baksy] transferBaksy: błąd Firebase dla odbiorcy', e);
            }
        })();

        return { ok: true, message: `Przelano ${cleanAmount} do #${cleanTarget}.` };
    }

    function collectBaksyEarnings() {
        if (!appSettings.features.baksy) return;
        seedBaksyInitialActions();

        const postReward = Math.max(0, Number(appSettings.baksy.postReward) || 5);
        const chatReward = Math.max(0, Number(appSettings.baksy.chatReward) || 1);

        document.querySelectorAll('#chatcontent li.chat_row').forEach(row => {
            if (!isElementAuthoredByMe(row)) return;
            const key = buildChatActionKey(row);
            if (hasSeenBaksyAction(key)) return;
            markBaksyActionSeen(key);
            awardBaksy(chatReward, 'chat_message', { key });
            addDailyMissionProgress('chatMessages', 1, { autoSave: false });
        });

        document.querySelectorAll('article[id^="elComment_"], [data-commentid], .ipsComment, .cPost').forEach(post => {
            if (!isElementAuthoredByMe(post)) return;
            const key = buildPostActionKey(post);
            if (hasSeenBaksyAction(key)) return;
            markBaksyActionSeen(key);
            awardBaksy(postReward, 'forum_post', { key });
            addDailyMissionProgress('forumPosts', 1, { autoSave: false });
        });

        saveBaksyDb();
    }

    function getActiveNeonColorFromBaksy() {
        const account = getBaksyAccount();
        if (!account.neonColor) return '';
        if (Number(account.neonUntil) <= nowTs()) return '';
        return String(account.neonColor);
    }

    function applyBaksyNeonEffect() {
        const color = getActiveNeonColorFromBaksy();
        if (!color) {
            document.body.style.removeProperty('--sebus-baksy-neon');
            document.body.classList.remove('sebus-baksy-neon-active');
            return;
        }

        document.body.style.setProperty('--sebus-baksy-neon', color);
        document.body.classList.add('sebus-baksy-neon-active');
    }

    function applyBaksyHighlightedPosts() {
        const account = getBaksyAccount();
        const highlightedIds = Array.isArray(account.highlightedPostIds) ? account.highlightedPostIds : [];
        document.querySelectorAll('.sebus-baksy-highlight').forEach(el => el.classList.remove('sebus-baksy-highlight'));
        document.querySelectorAll('.sebus-baksy-badge').forEach(el => el.remove());

        highlightedIds.forEach(postId => {
            const post = document.getElementById(postId);
            if (!post) return;

            post.classList.add('sebus-baksy-highlight');
            if (!post.querySelector('.sebus-baksy-badge')) {
                const badge = document.createElement('div');
                badge.className = 'sebus-baksy-badge';
                badge.textContent = '⭐ Polecane przez Weterana';
                post.prepend(badge);
            }
        });
    }

    function resolvePostElementId(postEl) {
        if (!postEl) return '';
        if (postEl.id) return postEl.id;

        const dataId = postEl.getAttribute('data-commentid') || postEl.getAttribute('data-postid') || '';
        if (!dataId) return '';

        const generated = `sebus-post-${dataId}`;
        postEl.id = generated;
        return generated;
    }

    function ensureBaksyHighlightButtons() {
        if (!appSettings.features.baksy) return;

        document.querySelectorAll('article[id^="elComment_"], [data-commentid], .ipsComment, .cPost').forEach(postEl => {
            if (!isElementAuthoredByMe(postEl)) return;
            if (postEl.querySelector('.sebus-baksy-highlight-btn')) return;

            const postId = resolvePostElementId(postEl);
            if (!postId) return;

            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'sebus-baksy-highlight-btn';
            btn.textContent = '⭐ Wyróżnij ($60)';
            btn.style.margin = '6px 0';
            btn.style.height = '24px';
            btn.style.border = '1px solid #b78a25';
            btn.style.borderRadius = '6px';
            btn.style.background = '#1b1b1b';
            btn.style.color = '#ffd66b';
            btn.style.cursor = 'pointer';

            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const result = purchaseBaksyItem('highlightPost', { postId });
                btn.textContent = result.ok ? '✔ Wyróżniono' : '✖ Brak baksów';
                scheduleModule('baksy', { immediate: true });
            });

            const targetContainer = postEl.querySelector('.ipsComment_content, .cPost_contentWrap, .ipsType_richText') || postEl;
            targetContainer.prepend(btn);
        });
    }

    function startBaksyGoldRain(durationMs = 30000) {
        if (!baksyRainHost) {
            baksyRainHost = document.createElement('div');
            baksyRainHost.id = 'sebus-baksy-rain';
            document.body.appendChild(baksyRainHost);
        }

        baksyRainHost.innerHTML = '';
        baksyRainHost.classList.add('show');
        const until = nowTs() + durationMs;

        const spawn = () => {
            if (!baksyRainHost || nowTs() >= until) {
                if (baksyRainHost) baksyRainHost.classList.remove('show');
                return;
            }

            for (let i = 0; i < 9; i += 1) {
                const coin = document.createElement('span');
                coin.className = 'sebus-baksy-coin';
                coin.textContent = '🪙';
                coin.style.left = `${Math.random() * 100}vw`;
                coin.style.animationDuration = `${2.2 + Math.random() * 2.4}s`;
                coin.style.opacity = `${0.5 + Math.random() * 0.5}`;
                baksyRainHost.appendChild(coin);
                setTimeout(() => coin.remove(), 4600);
            }

            setTimeout(spawn, 350);
        };

        spawn();
    }

    function consumeBaksyEvents() {
        const db = ensureBaksyDbLoaded();
        const now = nowTs();
        const activeEvents = [];

        db.events.forEach(event => {
            const expiresAt = Number(event.expiresAt) || 0;
            if (expiresAt && now > expiresAt) return;
            activeEvents.push(event);
        });

        db.events = activeEvents;

        const rainEvent = activeEvents.find(e => e.type === 'gold_rain' && Number(e.expiresAt) > now);
        if (rainEvent) startBaksyGoldRain(Math.max(800, Number(rainEvent.expiresAt) - now));
    }
