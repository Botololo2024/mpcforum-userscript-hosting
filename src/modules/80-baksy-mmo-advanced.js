// Module: 80-baksy-mmo-advanced.js
// Source: e:\mpcforum-userscript\skrypt:8025-13999
// Purpose: Baksy economy, MMO systems, guild, market, boss and advanced panels

    function initMainGamesNavigationIfNeeded() {
        const existing = document.getElementById('sebus-main-games-nav');
        if (existing) {
            syncMainGamesFeatureButtons(existing);
            return existing;
        }

        const nav = document.createElement('div');
        nav.id = 'sebus-main-games-nav';
        nav.style.cssText = 'position:fixed;left:14px;bottom:100px;width:360px;display:none;z-index:2147483640;';
        
        nav.innerHTML = `
            <div class="sebus-mmo-dashboard-shell" style="background:linear-gradient(180deg, rgba(27,23,17,.98), rgba(10,10,10,.98));border:1px solid rgba(217, 168, 60, 0.75);border-radius:14px;padding:16px;text-align:center;">
                <div style="font-size:12px;font-weight:bold;color:#ffd700;margin-bottom:12px;">🧭 GŁÓWNY DASHBOARD</div>

                <div class="sebus-mmo-dashboard-main" style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:10px;">
                    <button id="sebus-nav-sword" class="sebus-mmo-btn" style="height:78px;flex-direction:column;display:flex;align-items:center;justify-content:center;font-size:11px;" type="button">⚔️<br>ARENA</button>
                    <button id="sebus-nav-league" class="sebus-mmo-btn" style="height:78px;flex-direction:column;display:flex;align-items:center;justify-content:center;font-size:11px;" type="button">📜<br>LIGA</button>
                    <button id="sebus-nav-market" class="sebus-mmo-btn" style="height:78px;flex-direction:column;display:flex;align-items:center;justify-content:center;font-size:11px;" type="button">🧰<br>RYNEK</button>
                </div>

                <div id="sebus-nav-meta" style="font-size:9px;color:#bdbdbd;margin-bottom:8px;">Status: ładowanie…</div>

                <div id="sebus-nav-sword-sub" class="sebus-mmo-dashboard-sub" style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:10px;">
                    <button id="sebus-nav-boss" class="sebus-mmo-btn" style="height:52px;font-size:10px;" type="button">⚔️ Boss</button>
                    <button id="sebus-nav-guild" class="sebus-mmo-btn" style="height:52px;font-size:10px;" type="button">🏰 Gildia</button>
                    <button id="sebus-nav-jackpot" class="sebus-mmo-btn" style="height:52px;font-size:10px;" type="button">🎰 Jackpot</button>
                    <button id="sebus-nav-auction" class="sebus-mmo-btn" style="height:52px;font-size:10px;" type="button">💎 Aukcje</button>
                    <button id="sebus-nav-minigames-btn" class="sebus-mmo-btn" style="height:52px;font-size:10px;" type="button">🎮 Mini Gry</button>
                    <button id="sebus-nav-snejk-btn" class="sebus-mmo-btn" style="height:52px;font-size:10px;" type="button">🐍 Snejk</button>
                    <button id="sebus-nav-room-btn" class="sebus-mmo-btn" style="height:52px;font-size:10px;" type="button">🏠 ROOM</button>
                    <button id="sebus-nav-hazard-btn" class="sebus-mmo-btn" style="height:52px;font-size:10px;" type="button">🎲 Hazard</button>
                    <button id="sebus-nav-missions-btn" class="sebus-mmo-btn" style="height:52px;font-size:10px;" type="button">📋 Misje</button>
                    <button id="sebus-nav-ranking-btn" class="sebus-mmo-btn" style="height:52px;font-size:10px;" type="button">🏆 Ranking</button>
                    <button id="sebus-nav-chat-btn" class="sebus-mmo-btn" style="height:52px;font-size:10px;" type="button">💬 Czat</button>
                    <button id="sebus-nav-table-btn" class="sebus-mmo-btn" style="height:52px;font-size:10px;" type="button">🖌️ Tablica</button>
                    <button id="sebus-nav-gif-btn" class="sebus-mmo-btn" style="height:52px;font-size:10px;" type="button">🎉 GIF</button>
                    <button id="sebus-nav-watch-btn" class="sebus-mmo-btn" style="height:52px;font-size:10px;" type="button">🎬 Watch</button>
                </div>

                <div style="display:flex;gap:6px;">
                    <button id="sebus-nav-back" class="sebus-mmo-btn" style="flex:1;height:28px;font-size:10px;" type="button">✕ Zamknij</button>
                </div>
            </div>
        `;

        document.body.appendChild(nav);
        syncMainGamesFeatureButtons(nav);

        const subPanel = nav.querySelector('#sebus-nav-sword-sub');
        const metaText = nav.querySelector('#sebus-nav-meta');
        if (metaText) {
            const online = document.querySelectorAll('#elOnlineUsers a[data-memberid], [id*="OnlineUsers"] a[data-memberid], [class*="OnlineUsers"] a[data-memberid]').length;
            const leagueLevel = getRuntimeLeagueLevel();
            metaText.textContent = `Online: ${online} • Poziom Ligi: ${leagueLevel} • Prestige: x${getPrestigeMultiplier().toFixed(2)}`;
        }

        nav.querySelector('#sebus-nav-sword').addEventListener('click', () => {
            if (!subPanel) return;
            subPanel.style.display = subPanel.style.display === 'grid' ? 'none' : 'grid';
        });

        nav.querySelector('#sebus-nav-league').addEventListener('click', () => {
            const panel = initAdvancedLeaguePanelIfNeeded();
            panel.style.display = 'block';
            syncAdvancedLeaguePanelUi(panel);
            nav.style.display = 'none';
        });

        nav.querySelector('#sebus-nav-market').addEventListener('click', () => {
            const panel = initAdvancedMarketPanelIfNeeded();
            panel.style.display = 'block';
            syncAdvancedMarketPanelUi(panel);
            nav.style.display = 'none';
        });

        // Boss button
        nav.querySelector('#sebus-nav-boss').addEventListener('click', () => {
            const bossPanel = initAdvancedWorldBossPanelIfNeeded();
            bossPanel.style.display = 'block';
            checkBossResetIfNeeded();
            syncWorldBossAdvancedUI(bossPanel);
            nav.style.display = 'none';
        });

        // Guild button
        nav.querySelector('#sebus-nav-guild').addEventListener('click', () => {
            const guildPanel = initAdvancedGuildPanelIfNeeded();
            guildPanel.style.display = 'block';
            syncGuildMenuUI(guildPanel);
            nav.style.display = 'none';
        });

        // Jackpot button
        nav.querySelector('#sebus-nav-jackpot').addEventListener('click', () => {
            const jpPanel = initAdvancedJackpotPanelIfNeeded();
            jpPanel.style.display = 'block';
            syncJackpotAdvancedUI(jpPanel);
            drawJackpotWheel();
            nav.style.display = 'none';
        });

        // Auction button
        nav.querySelector('#sebus-nav-auction').addEventListener('click', () => {
            const aucPanel = initAdvancedAuctionPanelIfNeeded();
            aucPanel.style.display = 'block';
            syncAuctionAdvancedUI(aucPanel);
            nav.style.display = 'none';
        });

        // Hazard button
        nav.querySelector('#sebus-nav-hazard-btn').addEventListener('click', () => {
            if (!appSettings.features.hazard) return;
            initHazardPanelIfNeeded();
            const hazardPanel = document.getElementById('sebus-hazard-panel');
            if (hazardPanel) {
                hazardPanel.style.display = 'block';
            }
            nav.style.display = 'none';
        });

        // Mini games button
        nav.querySelector('#sebus-nav-minigames-btn').addEventListener('click', () => {
            if (!appSettings.features.miniGames) return;
            const gamesPanel = initGamesIfNeeded();
            if (gamesPanel) {
                gamesPanel.classList.add('show');
                syncGamesState();
            }
            nav.style.display = 'none';
        });

        // Snejk button
        nav.querySelector('#sebus-nav-snejk-btn').addEventListener('click', () => {
            openSnejkPanel();
            nav.style.display = 'none';
        });

        // Room button
        nav.querySelector('#sebus-nav-room-btn').addEventListener('click', () => {
            openRoomPanel();
            nav.style.display = 'none';
        });

        // Missions button
        nav.querySelector('#sebus-nav-missions-btn').addEventListener('click', () => {
            if (!appSettings.features.missions) return;
            initMissionsPanelIfNeeded();
            const missionsPanel = document.getElementById('sebus-missions-panel');
            if (missionsPanel) {
                missionsPanel.style.display = 'block';
            }
            nav.style.display = 'none';
        });

        // Ranking button
        nav.querySelector('#sebus-nav-ranking-btn').addEventListener('click', () => {
            if (!appSettings.features.ranking) return;
            initRankingPanelIfNeeded();
            const rankingPanel = document.getElementById('sebus-ranking-panel');
            if (rankingPanel) {
                syncRankingPanelUi(rankingPanel);
                rankingPanel.style.display = 'block';
            }
            nav.style.display = 'none';
        });

        // Chat button
        nav.querySelector('#sebus-nav-chat-btn').addEventListener('click', () => {
            if (!appSettings.features.mmoChat) return;
            initMmoChatPanelIfNeeded();
            const chatPanel = document.getElementById('sebus-mmo-chat-panel');
            if (chatPanel) {
                chatPanel.classList.add('show');
                // Przywróć ostatnią zapisaną pozycję
                const posKey = `sebus_mmoChat_pos_${getRuntimeUserId()}`;
                try {
                    const raw = localStorage.getItem(posKey);
                    if (raw) {
                        const { x, y } = JSON.parse(raw);
                        const maxX = window.innerWidth - chatPanel.offsetWidth;
                        const maxY = window.innerHeight - chatPanel.offsetHeight;
                        if (typeof x === 'number' && typeof y === 'number') {
                            chatPanel.style.left = Math.min(Math.max(x, 0), maxX > 0 ? maxX : 0) + 'px';
                            chatPanel.style.top = Math.min(Math.max(y, 0), maxY > 0 ? maxY : 0) + 'px';
                            chatPanel.style.transform = 'none';
                        }
                    }
                } catch (e) {}
            }
            nav.style.display = 'none';
        });

        // Tablica (Whiteboard) button
        nav.querySelector('#sebus-nav-table-btn').addEventListener('click', () => {
            if (!appSettings.features.whiteboard) return;
            initWhiteboardIfNeeded();
            const wbPanel = document.getElementById('sebus-whiteboard-panel');
            if (wbPanel) {
                wbPanel.style.display = 'block';
                syncWhiteboard();
            }
            nav.style.display = 'none';
        });

        // GIF Party button
        nav.querySelector('#sebus-nav-gif-btn').addEventListener('click', () => {
            if (!appSettings.features.gifParty) return;
            initGifPartyIfNeeded();
            const gpPanel = document.getElementById('sebus-gifparty-panel');
            if (gpPanel) {
                gpPanel.style.display = 'block';
                syncGifParty();
            }
            nav.style.display = 'none';
        });

        // Watch Together button
        nav.querySelector('#sebus-nav-watch-btn').addEventListener('click', () => {
            if (!appSettings.features.watchTogether) return;
            initWatchIfNeeded();
            const watchPanel = document.getElementById('sebus-watch-panel');
            if (watchPanel) {
                watchPanel.style.display = 'block';
                watchJoinAsViewer();
                syncWatchState();
            }
            nav.style.display = 'none';
        });

        // Close button
        nav.querySelector('#sebus-nav-back').addEventListener('click', () => {
            nav.style.display = 'none';
        });

        return nav;
    }

    function syncMainGamesFeatureButtons(nav) {
        if (!nav) return;
        const showHazard = !!appSettings.features.hazard;
        const showMiniGames = !!appSettings.features.miniGames;
        const showMissions = !!appSettings.features.missions;
        const showRanking = !!appSettings.features.ranking;
        const showChat = !!appSettings.features.mmoChat;
        const showMenu = !!appSettings.features.gamesMenu || showMiniGames || showHazard || showMissions || showRanking || showChat;

        const miniGamesBtn = nav.querySelector('#sebus-nav-minigames-btn');
        const snejkBtn = nav.querySelector('#sebus-nav-snejk-btn');
        const roomBtn = nav.querySelector('#sebus-nav-room-btn');
        const hazardBtn = nav.querySelector('#sebus-nav-hazard-btn');
        const missionsBtn = nav.querySelector('#sebus-nav-missions-btn');
        const rankingBtn = nav.querySelector('#sebus-nav-ranking-btn');
        const chatBtn = nav.querySelector('#sebus-nav-chat-btn');
        if (miniGamesBtn) miniGamesBtn.style.display = showMiniGames ? '' : 'none';
        if (snejkBtn) snejkBtn.style.display = showMiniGames ? '' : 'none';
        if (roomBtn) roomBtn.style.display = showMiniGames ? '' : 'none';
        if (hazardBtn) hazardBtn.style.display = showHazard ? '' : 'none';
        if (missionsBtn) missionsBtn.style.display = showMissions ? '' : 'none';
        if (rankingBtn) rankingBtn.style.display = showRanking ? '' : 'none';
        if (chatBtn) chatBtn.style.display = showChat ? '' : 'none';

        nav.style.display = showMenu ? nav.style.display : 'none';
    }

    // ════════════════════════════════════════════════════════════════
    //  MMO CHAT – API, state helpers, UI
    // ════════════════════════════════════════════════════════════════

    function mmoChatStorageKey() {
        return `sebus_mmoChat_profile_${getRuntimeUserId()}`;
    }

    function loadMmoChatProfile() {
        try {
            const raw = localStorage.getItem(mmoChatStorageKey());
            if (!raw) return null;
            const p = JSON.parse(raw);
            if (p && typeof p === 'object' && p.nick) return p;
        } catch (e) {}
        return null;
    }

    function saveMmoChatProfileLocal(profile) {
        try {
            localStorage.setItem(mmoChatStorageKey(), JSON.stringify(profile));
        } catch (e) {}
    }

    async function mmoChatSaveProfileRemote(profile) {
        if (!profile || !profile.userId) return;
        await firebaseWritePath(
            `${mmoChatRootPath}/profiles/${encodeURIComponent(profile.userId)}`,
            { nick: profile.nick, avatar: profile.avatar || '🎮', userId: profile.userId, setAt: profile.setAt || nowTs() }
        );
    }

    async function mmoChatLoadProfileRemote(userId) {
        if (!userId) return null;
        const raw = await firebaseReadPath(`${mmoChatRootPath}/profiles/${encodeURIComponent(userId)}`);
        if (raw && typeof raw === 'object' && raw.nick) return raw;
        return null;
    }

    async function mmoChatSendMessage(text, type = 'text', meta = {}) {
        if (!mmoChatProfile || !mmoChatProfile.nick) return { ok: false, message: 'Brak profilu czatu.' };
        const userId = getRuntimeUserId();
        if (!userId) return { ok: false, message: 'Brak ID użytkownika.' };

        const clean = String(text || '').trim();
        if (!clean) return { ok: false, message: 'Pusta wiadomość.' };
        if (clean.length > 600) return { ok: false, message: 'Wiadomość za długa (max 600 znaków).' };

        const msgId = `${nowTs()}_${Math.random().toString(36).slice(2, 8)}`;
        const payload = {
            id: msgId,
            userId,
            nick: mmoChatProfile.nick,
            avatar: mmoChatProfile.avatar || '🎮',
            text: clean,
            type: String(type || 'text'),
            meta: meta && typeof meta === 'object' ? { ...meta } : {},
            at: firebaseServerTimestampValue(),
            clientAt: nowTs()
        };
        await firebaseWritePath(`${mmoChatRootPath}/messages/${encodeURIComponent(msgId)}`, payload);
        return { ok: true };
    }

    async function mmoChatFetchMessages() {
        const raw = await firebaseReadPath(`${mmoChatRootPath}/messages`);
        if (!raw || typeof raw !== 'object') return [];
        const msgs = Object.values(raw)
            .filter(m => m && typeof m === 'object' && (m.at || m.clientAt))
            .sort((a, b) => Number(a.at || a.clientAt || 0) - Number(b.at || b.clientAt || 0))
            .slice(-mmoChatMaxMessages);
        mmoChatMessages = msgs;
        return msgs;
    }

    async function mmoChatUpdatePresence() {
        const userId = getRuntimeUserId();
        if (!userId || !mmoChatProfile || !mmoChatProfile.nick) return;
        await firebaseWritePath(
            `${mmoChatRootPath}/presence/${encodeURIComponent(userId)}`,
            { nick: mmoChatProfile.nick, avatar: mmoChatProfile.avatar || '🎮', seenAt: nowTs() }
        );
    }

    async function mmoChatFetchOnline() {
        const raw = await firebaseReadPath(`${mmoChatRootPath}/presence`);
        if (!raw || typeof raw !== 'object') { mmoChatOnlineMap = {}; return {}; }
        const threshold = nowTs() - 35000;
        const active = {};
        Object.entries(raw).forEach(([uid, data]) => {
            if (data && Number(data.seenAt || 0) > threshold) active[uid] = data;
        });
        mmoChatOnlineMap = active;
        return active;
    }

    function mmoChatExtractYouTubeId(url) {
        const m = String(url || '').match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_\-]{11})/);
        return m ? m[1] : null;
    }

    function mmoChatIsImageUrl(url) {
        return /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(String(url || ''));
    }

    function mmoChatDetectType(text) {
        const t = String(text || '').trim();
        const ytId = mmoChatExtractYouTubeId(t);
        if (ytId) return { type: 'youtube', meta: { ytId }, text: t };
        if (mmoChatIsImageUrl(t)) return { type: 'image', meta: { url: t }, text: t };
        return { type: 'text', meta: {}, text: t };
    }

    const mmoChatAvatarList = [
        '🎮','🦊','🐺','🐉','💀','👾','🤖','🧙','⚔️','🛡️',
        '🔥','💎','🌙','☀️','🐸','🦁','🐯','🐼','🦋','🦄',
        '🎯','🏆','💣','🎲','🎪','🥷','👑','🌟','💫','🎸'
    ];

    function renderMmoChatMessage(msg) {
        if (!msg || (!msg.at && !msg.clientAt)) return '';
        const dt = new Date(Number(msg.at || msg.clientAt));
        const hh = String(dt.getHours()).padStart(2, '0');
        const mm = String(dt.getMinutes()).padStart(2, '0');
        const time = `${hh}:${mm}`;
        const avatar = escapeHtml(String(msg.avatar || '🎮'));
        const nick = escapeHtml(String(msg.nick || 'Anonim'));
        const isMe = String(msg.userId) === String(getRuntimeUserId());
        const meClass = isMe ? ' sebus-chat-msg-me' : '';

        let body = '';
        if (msg.type === 'youtube') {
            const ytId = escapeHtml(String(msg.meta?.ytId || ''));
            body = `<div class="sebus-chat-yt-wrap"><iframe src="https://www.youtube-nocookie.com/embed/${ytId}?rel=0&modestbranding=1" width="100%" height="160" frameborder="0" allowfullscreen loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe></div>`;
        } else if (msg.type === 'image') {
            const url = escapeHtml(String(msg.meta?.url || ''));
            body = `<div class="sebus-chat-img-wrap"><img src="${url}" alt="img" loading="lazy" class="sebus-chat-img" onclick="this.style.maxHeight=this.style.maxHeight?'':'unset'"></div>`;
        } else if (msg.type === 'system') {
            return `<div class="sebus-chat-system">${escapeHtml(String(msg.text || ''))}</div>`;
        } else {
            body = `<div class="sebus-chat-bubble">${escapeHtml(String(msg.text || '')).replace(/\n/g, '<br>')}</div>`;
        }

        return `<div class="sebus-chat-msg${meClass}" data-msgid="${escapeHtml(String(msg.id || ''))}">
            <div class="sebus-chat-avatar-col">
                <span class="sebus-chat-avatar">${avatar}</span>
            </div>
            <div class="sebus-chat-content-col">
                <div class="sebus-chat-meta"><span class="sebus-chat-nick">${nick}</span><span class="sebus-chat-time">${time}</span></div>
                ${body}
            </div>
        </div>`;
    }

    function runBaksyModule() {
        const now = nowTs();
        initMmoEventHandlersIfNeeded();
        hydrateMmoStateFromDb();

        initBaksyHubIfNeeded();
        initBaksyLeagueIfNeeded();
        initBaksyGamesIfNeeded();
        initAdvancedJackpotPanelIfNeeded();
        initAdvancedTreasureHuntPanelIfNeeded();
        initHazardPanelIfNeeded();
        initRankingPanelIfNeeded();

        if (baksyAdminAccessAllowed) initBaksyAdminPanelIfNeeded();
        syncBaksyAdminUiVisibility();

        if (!appSettings.features.miniGames) {
            const panel = document.getElementById('sebus-games-panel');
            if (panel) panel.remove();
            if (gamesSyncTimer) { clearInterval(gamesSyncTimer); gamesSyncTimer = null; }
        } else {
            initGamesIfNeeded();
        }

        if ((now - lastBaksySyncAt) > 1500) {
            const loaded = loadBaksyDb();
            if (!baksyDb || Number(loaded.updatedAt || 0) > Number(baksyDb.updatedAt || 0)) {
                baksyDb = loaded;
                mmoStateHydrated = false;
                hydrateMmoStateFromDb(true);
            }
            lastBaksySyncAt = now;
        }

        pullSharedWorldIfNeeded(false);
        pullSharedMmoStateIfNeeded(false);
        syncLocalRankingSnapshot();
        checkBossResetIfNeeded();

        if (!appSettings.features.baksy) {
            document.body.classList.remove('sebus-baksy-neon-active');
            document.body.style.removeProperty('--sebus-baksy-neon');
            syncBaksyUiSummary();
            syncBaksyLeagueUi();
            syncBaksyAdminUiVisibility();
            return;
        }

        collectBaksyEarnings();
        trackDailyReadMissionProgress();
        initForumActivityTrackerIfNeeded();
        trackForumPostsWritten();
        trackReactionsMissions();
        trackFollowsMissions();
        trackTopicsMissions();
        saveMissionSeenKeysToState();
        consumeBaksyEvents();
        applyBaksyNeonEffect();
        applyBaksyHighlightedPosts();
        applySharedNickHighlightEffects();
        applySharedProfileEmojiEffects();
        ensureBaksyHighlightButtons();
        syncBaksyUiSummary();
        syncBaksyLeagueUi();
        syncBaksyAdminUiVisibility();
    }

    function purchaseBaksyItem(itemKey, payload = {}) {
        const runtimeUserId = getRuntimeUserId();
        const costs = {
            goldRain: 120,
            neonRed: 80,
            neonPurple: 80,
            neonCustom: 100,
            neonGold: 90,
            neonMint: 90,
            neonClear: 0,       // darmowe usunięcie neonu
            highlightPost: 60,
            profileEmoji: 140,  // emoji na własnym profilu 24h
            nickHighlight: 180, // podświetlenie własnego nicka 24h
            xpBoost: 200,       // mnożnik x1.5 na zarobki na 2h
            titleChange: 250    // własny tytuł/podpis w rankingu na 7 dni
        };

        const cost = costs[itemKey] ?? -1;
        if (cost < 0) return { ok: false, message: 'Nieznany przedmiot.' };
        if (cost > 0 && !spendBaksy(cost, `shop:${itemKey}`, payload)) return { ok: false, message: 'Za mało baksów.' };

        const account = getBaksyAccount(runtimeUserId);
        const oneDayMs = 24 * 60 * 60 * 1000;

        if (itemKey === 'goldRain') {
            appendBaksyEvent({ type: 'gold_rain', byUserId: String(runtimeUserId), expiresAt: nowTs() + 30000 });
            saveBaksyDb();
            return { ok: true, message: '🌧️ Kupiono Złoty Deszcz (30s).' };
        }

        if (itemKey === 'neonRed' || itemKey === 'neonPurple' || itemKey === 'neonGold' || itemKey === 'neonMint') {
            const colorMap = { neonRed: '#ff2345', neonPurple: '#7e2bff', neonGold: '#ffd700', neonMint: '#67ffbf' };
            account.neonColor = colorMap[itemKey];
            account.neonUntil = nowTs() + oneDayMs;
            account.updatedAt = nowTs();
            saveBaksyDb();
            scheduleFirebaseSharedSync();
            return { ok: true, message: `✨ Kupiono Kolorowy Neon (${account.neonColor}) na 1 dzień.` };
        }

        if (itemKey === 'neonCustom') {
            const color = sanitizeSharedHighlightColor(payload.color || '');
            account.neonColor = color;
            account.neonUntil = nowTs() + oneDayMs;
            account.updatedAt = nowTs();
            saveBaksyDb();
            scheduleFirebaseSharedSync();
            return { ok: true, message: `✨ Kupiono Własny Neon (${color}) na 1 dzień.` };
        }

        if (itemKey === 'neonClear') {
            account.neonColor = '';
            account.neonUntil = 0;
            account.updatedAt = nowTs();
            saveBaksyDb();
            return { ok: true, message: '🚫 Usunięto kolor neonu.' };
        }

        if (itemKey === 'highlightPost') {
            const postId = String(payload.postId || '').trim();
            if (!postId) return { ok: false, message: 'Podaj ID posta.' };
            const list = Array.isArray(account.highlightedPostIds) ? account.highlightedPostIds : [];
            if (!list.includes(postId)) list.push(postId);
            account.highlightedPostIds = compactList(list, 100);
            account.updatedAt = nowTs();
            saveBaksyDb();
            return { ok: true, message: `🌟 Wyróżniono post: ${postId}.` };
        }

        if (itemKey === 'profileEmoji') {
            // Efekt emoji na własnym profilu (widoczny dla innych przez sharedBaksyWorld/effects)
            const emoji = String(payload.emoji || '🔥').trim().slice(0, 2) || '🔥';
            purchaseSharedBaksyEffect('profileEmoji24h', runtimeUserId, { emoji });
            return { ok: true, message: `${emoji} Kupiono emoji na profilu na 24h.` };
        }

        if (itemKey === 'nickHighlight') {
            // Podświetlenie własnego nicka widoczne dla wszystkich przez sharedBaksyWorld/effects
            const color = sanitizeSharedHighlightColor(payload.color || 'gold');
            purchaseSharedBaksyEffect('nickHighlight24h', runtimeUserId, { color });
            return { ok: true, message: `🎨 Kupiono podświetlenie nicka (${color}) na 24h.` };
        }

        if (itemKey === 'xpBoost') {
            account.xpBoostUntil = nowTs() + 2 * 60 * 60 * 1000; // 2h
            account.xpBoostMultiplier = 1.5;
            account.updatedAt = nowTs();
            saveBaksyDb();
            return { ok: true, message: '⚡ Kupiono Boost XP x1.5 na 2 godziny.' };
        }

        if (itemKey === 'titleChange') {
            const title = String(payload.title || '').trim().slice(0, 30);
            if (!title) return { ok: false, message: 'Podaj tytuł (max 30 znaków).' };
            account.customTitle = title;
            account.customTitleUntil = nowTs() + 7 * oneDayMs;
            account.updatedAt = nowTs();
            saveBaksyDb();
            scheduleFirebaseSharedSync();
            return { ok: true, message: `🏷️ Ustawiono tytuł: "${title}" na 7 dni.` };
        }

        return { ok: false, message: 'Nieobsługiwany przedmiot.' };
    }

    function sanitizeSharedHighlightColor(value) {
        const color = String(value || '').trim().toLowerCase();
        if (!color) return '#ffd700';
        if (/^#[0-9a-f]{6}$/i.test(color)) return color;
        const map = {
            gold: '#ffd700',
            red: '#ff4545',
            violet: '#cc33ff',
            blue: '#58a6ff',
            mint: '#67ffbf'
        };
        return map[color] || '#ffd700';
    }

    function getSharedShopCosts() {
        return {
            profileEmoji24h: 140,
            nickHighlight24h: 180
        };
    }

    async function purchaseSharedBaksyEffect(effectKey, targetUserId, payload = {}) {
        const runtimeUserId = String(getRuntimeUserId());
        const account = getBaksyAccount(runtimeUserId);
        const targetId = String(targetUserId || '').trim();
        const costs = getSharedShopCosts();
        const cost = Number(costs[effectKey] || 0);

        if (!/^\d{3,}$/.test(targetId)) return { ok: false, message: 'Podaj poprawne ID celu.' };
        if (cost <= 0) return { ok: false, message: 'Nieznany efekt globalny.' };
        if (!spendBaksy(cost, `shop:shared:${effectKey}`, { targetId })) return { ok: false, message: 'Za mało baksów.' };

        const expiresAt = nowTs() + (24 * 60 * 60 * 1000);
        let writeOk = false;

        if (effectKey === 'profileEmoji24h') {
            const emoji = String(payload.emoji || '🔥').trim().slice(0, 2) || '🔥';
            writeOk = await firebaseWritePath(`${baksySharedRootPath}/effects/profileEmoji/${encodeURIComponent(targetId)}`, {
                targetId,
                emoji,
                byUserId: runtimeUserId,
                byName: String(account.displayName || getCurrentNickLabel()),
                expiresAt,
                updatedAt: nowTs()
            });
        }

        if (effectKey === 'nickHighlight24h') {
            const color = sanitizeSharedHighlightColor(payload.color);
            writeOk = await firebaseWritePath(`${baksySharedRootPath}/effects/nickHighlight/${encodeURIComponent(targetId)}`, {
                targetId,
                color,
                byUserId: runtimeUserId,
                byName: String(account.displayName || getCurrentNickLabel()),
                expiresAt,
                updatedAt: nowTs()
            });
        }

        if (!writeOk) {
            awardBaksy(cost, `shop_refund:${effectKey}`, { targetId }, { disableNightMultiplier: true });
            return { ok: false, message: 'Błąd zapisu w bazie globalnej, zwrócono baksy.' };
        }

        await firebaseWritePath(`${baksySharedRootPath}/updatedAt`, nowTs());
        pullSharedWorldIfNeeded(true);
        return { ok: true, message: `Kupiono efekt ${effectKey} dla #${targetId} na 24h.` };
    }

    // ===== WORLD BOSS SYSTEM =====

    /** Zwraca timestamp ostatniego resetu (południe lub północ) względem teraz */
    function getLastBossResetThreshold() {
        const now = new Date();
        const noon = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0, 0);
        const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        // Wybierz późniejszy z przeszłych progów
        if (now >= noon) return { ts: noon.getTime(), label: 'południe' };
        return { ts: midnight.getTime(), label: 'północ' };
    }

    /** Sprawdza czy minął czas resetu bossa i jeśli tak — resetuje + nagradza */
    function checkBossResetIfNeeded() {
        const threshold = getLastBossResetThreshold();
        const lastReset = Number(worldBossState.lastReset || 0);
        if (lastReset >= threshold.ts) return false; // już zresetowany w tym oknie

        // Przed resetem zapisz ranking doby i nagrodź lidera
        doWorldBossResetRewards(threshold.label);
        return true;
    }

    /** Snapshot contributors → lastDayRanking, nagradzanie lidera, reset HP */
    function doWorldBossResetRewards(reason) {
        const contributors = worldBossState.dailyContributors || {};
        const myUserId = getRuntimeUserId();

        // Zbuduj ranking doby
        const rankingSnapshot = Object.entries(contributors)
            .map(([uid, dmg]) => ({
                userId: String(uid),
                displayName: resolveRankingDisplayName(uid, String(uid)),
                damage: Number(dmg || 0)
            }))
            .filter(r => r.damage > 0)
            .sort((a, b) => b.damage - a.damage);

        worldBossState.lastDayRanking = rankingSnapshot;
        worldBossState.lastResetReason = reason || 'reset';

        // Nagrodź lidera (jeśli jest)
        if (rankingSnapshot.length > 0) {
            const winner = rankingSnapshot[0];
            // Nagrodź tylko jeśli to lokalny gracz (nie anon lub tylko bieżący user)
            if (winner.userId === myUserId) {
                const rewardBaksy = 500 + Math.floor(winner.damage / 100) * 10;
                awardBaksy(rewardBaksy, 'boss_top_damage_reward', { damage: winner.damage }, { disableNightMultiplier: true });

                // Przedmiot do ekwipunku
                const bossItems = ['⚔️ Miecz Ducha', '🛡️ Tarcza Cienia', '💎 Kryształ Mroku', '🏹 Łuk Zniszczenia', '🔮 Berło Zguby'];
                const itemName = bossItems[Math.floor(Math.random() * bossItems.length)];
                const rarity = winner.damage >= 5000 ? 'legendary' : winner.damage >= 2000 ? 'epic' : 'rare';
                playerMissionInventory.push({
                    uid: `boss-${nowTs()}-${Math.random().toString(36).slice(2, 6)}`,
                    name: itemName,
                    rarity,
                    qty: 1,
                    acquiredAt: nowTs(),
                    canAuction: true,
                    source: 'world_boss'
                });

                emitMmoEvent('boss:top_reward', { userId: myUserId, damage: winner.damage, reward: rewardBaksy, item: itemName, at: nowTs() });
            }

            // Zaktualizuj ranking bossDamageTotal dla każdego uczestnika
            rankingSnapshot.forEach(r => {
                if (r.userId !== myUserId) return; // tylko lokalny gracz może update swój ranking
                const account = getBaksyAccount(r.userId);
                const row = ensureRankingStatsForUser(r.userId, resolveRankingDisplayName(r.userId, account?.displayName || ''));
                if (row) {
                    row.bossDamageTotal = Number(row.bossDamageTotal || 0) + r.damage;
                    row.baksyBalance = Number(account?.balance || 0);
                    row.updatedAt = nowTs();
                }
            });
        }

        // Reset Boss
        worldBossState.currentHp = worldBossState.maxHp;
        worldBossState.totalDamage = 0;
        worldBossState.dailyContributors = {};
        worldBossState.lastReset = nowTs();
        persistMmoState(true);
    }

    function attackWorldBoss(damageAmount) {
        const dmg = Math.max(1, Number(damageAmount || 100));
        const userId = getRuntimeUserId();

        // Koszt ataku = tyle samo baksów co zadane obrażenia
        const account = getBaksyAccount(userId);
        const balance = Number(account?.balance || 0);
        if (balance < dmg) {
            return {
                ok: false,
                success: false,
                message: `Za mało baksów! Masz ${balance.toLocaleString('pl-PL')} 💵, potrzebujesz ${dmg.toLocaleString('pl-PL')} 💵.`
            };
        }

        // Sprawdź czy boss wymaga resetu przed atakiem
        checkBossResetIfNeeded();

        // Pobierz baksy za atak
        spendBaksy(dmg, 'boss_attack', { damage: dmg });

        // Zapisz udział
        if (!worldBossState.dailyContributors[userId]) worldBossState.dailyContributors[userId] = 0;
        worldBossState.dailyContributors[userId] += dmg;
        worldBossState.currentHp = Math.max(0, worldBossState.currentHp - dmg);
        worldBossState.totalDamage += dmg;

        emitMmoEvent('boss:hit', { userId, damage: dmg, at: nowTs() });

        if (worldBossState.currentHp <= 0) {
            emitMmoEvent('boss:defeated', { userId, at: nowTs() });
            doWorldBossResetRewards('defeated');
            persistMmoState(true);
            return { ok: true, success: true, defeated: true, message: '🎊 BOSS POKONANY! Nagrody dla lidera!' };
        }

        persistMmoState();
        return {
            ok: true,
            success: true,
            defeated: false,
            remainingHp: worldBossState.currentHp,
            totalDamage: worldBossState.totalDamage,
            myDamage: worldBossState.dailyContributors[userId] || 0,
            message: `💥 Zadałeś ${dmg.toLocaleString('pl-PL')} obrażeń! Pozostałe HP: ${worldBossState.currentHp.toLocaleString('pl-PL')}`
        };
    }

    // ===== GLOBAL JACKPOT SYSTEM =====
    function contributeToJackpot(amount) {
        const userId = getRuntimeUserId();
        if (!spendBaksy(amount, 'jackpot_contribution', { amount })) {
            return { ok: false, message: 'Za mało baksów.' };
        }
        
        globalJackpotState.poolBalance += amount;
        globalJackpotState.contributions.push({ userId, amount, at: nowTs() });
        emitMmoEvent('jackpot:contributed', { userId, amount: Number(amount || 0), at: nowTs() });
        if (globalJackpotState.contributions.length > 100) {
            globalJackpotState.contributions.shift();
        }
        
        // Sprawdź czy wylosować
        if (globalJackpotState.poolBalance >= 5000 || (nowTs() - globalJackpotState.lastLotteryAt) > (60 * 60 * 1000)) {
            return drawJackpot();
        }
        persistMmoState();
        
        return { ok: true, message: `✅ Wpłacono ${amount} do puli! Aktualna pula: ${globalJackpotState.poolBalance}` };
    }

    function drawJackpot() {
        if (globalJackpotState.contributions.length === 0) {
            return { ok: false, message: 'Pula jest pusta!' };
        }
        
        const winnerEntry = globalJackpotState.contributions[Math.floor(Math.random() * globalJackpotState.contributions.length)];
        const winner = String(winnerEntry.userId || '').trim();
        const prizeAmount = Math.floor(globalJackpotState.poolBalance * 0.95); // 95% zwycięzcy, 5% dla bazy
        
        const runtimeUserId = String(getRuntimeUserId());

        if (winner === runtimeUserId) {
            // Zwycięzcą jest aktualny klient — możemy użyć lokalnego awardBaksy
            awardBaksy(prizeAmount, 'jackpot_win', { poolSize: globalJackpotState.poolBalance }, { disableNightMultiplier: true });
        } else {
            // Zwycięzcą jest inny gracz — zapisz nagrodę bezpośrednio do jego konta w Firebase
            (async () => {
                try {
                    const winnerState = await firebaseReadPath(`users/${encodeURIComponent(winner)}/baksyDb`);
                    const winnerDb = winnerState && typeof winnerState === 'object' ? winnerState : {};
                    const winnerAccounts = winnerDb.accounts && typeof winnerDb.accounts === 'object' ? winnerDb.accounts : {};
                    const prev = winnerAccounts[winner] || createDefaultBaksyProfile(winner);
                    winnerAccounts[winner] = {
                        ...prev,
                        balance: normalizeBaksyNumber((Number(prev.balance) || 0) + prizeAmount),
                        totalEarned: normalizeBaksyNumber((Number(prev.totalEarned) || 0) + prizeAmount),
                        updatedAt: nowTs()
                    };
                    const winnerLedger = Array.isArray(winnerDb.ledger) ? winnerDb.ledger : [];
                    winnerLedger.push({
                        id: `tx_${nowTs()}_${Math.random().toString(36).slice(2, 8)}`,
                        at: nowTs(),
                        type: 'earn',
                        reason: 'jackpot_win',
                        amount: prizeAmount,
                        multiplier: 1,
                        userId: winner,
                        payload: { poolSize: globalJackpotState.poolBalance }
                    });
                    if (winnerLedger.length > 1200) winnerLedger.splice(0, winnerLedger.length - 1200);
                    await firebaseWriteUserStatePart('baksyDb', { ...winnerDb, accounts: winnerAccounts, ledger: winnerLedger, updatedAt: nowTs(), userId: winner }, winner);

                    // Zaktualizuj publiczny shared account wygranego
                    const sharedWinnerAccount = await firebaseReadPath(`${baksySharedRootPath}/accounts/${encodeURIComponent(winner)}`);
                    if (sharedWinnerAccount && typeof sharedWinnerAccount === 'object') {
                        await firebaseWritePath(`${baksySharedRootPath}/accounts/${encodeURIComponent(winner)}`, {
                            ...sharedWinnerAccount,
                            balance: normalizeBaksyNumber((Number(sharedWinnerAccount.balance) || 0) + prizeAmount),
                            totalEarned: normalizeBaksyNumber((Number(sharedWinnerAccount.totalEarned) || 0) + prizeAmount),
                            updatedAt: nowTs()
                        });
                        await firebaseWritePath(`${baksySharedRootPath}/updatedAt`, nowTs());
                    }
                } catch (e) {
                    console.warn('[Jackpot] drawJackpot: błąd Firebase dla wygranego', winner, e);
                }
            })();
        }
        
        globalJackpotState.lastWinner = winner;
        globalJackpotState.lastWinAmount = prizeAmount;
        globalJackpotState.lastLotteryAt = nowTs();
        globalJackpotState.poolBalance = 0;
        globalJackpotState.contributions = [];
        persistMmoState();
        
        return { ok: true, message: `🎊 Jackpot wylosowany! Zwycięzca: #${winner} wygrywa ${prizeAmount} baksy!`, winner, prize: prizeAmount };
    }

    // ===== ADVANCED GUILD WARS SYSTEM =====
    function getGuild(userId) {
        // Ensure guildWarsState and guilds object exist
        if (!guildWarsState) {
            guildWarsState = {
                guilds: {},
                controlledSections: {},
                lastUpdate: 0,
                forumSections: ['Metin2', 'Lineage', 'Lost Ark', 'RPG', 'Gry', 'Offtopic']
            };
        }
        if (!guildWarsState.guilds) {
            guildWarsState.guilds = {};
        }
        
        // IMPORTANT: Do NOT auto-create guild. Return undefined if doesn't exist
        return guildWarsState.guilds[userId] || null;
    }

    function getUserGuildId(userId) {
        // Find which guild this user is a member of (as leader or member)
        const guilds = guildWarsState.guilds || {};
        for (const [guildId, guild] of Object.entries(guilds)) {
            if (guild.leader === userId) return guildId; // User is leader
            if (guild.members && guild.members.some(m => m.userId === userId)) return guildId; // User is member
        }
        return null; // User is not in any guild
    }

    function createGuild(userId, guildName, guildDescription) {
        // Validate input
        if (!guildName || guildName.trim().length === 0) {
            return { ok: false, message: '❌ Nazwa gildii nie może być pusta!' };
        }
        if (guildName.length > 50) {
            return { ok: false, message: '❌ Nazwa gildii zbyt długa (max 50 znaków)!' };
        }
        
        // Check if user already in a guild
        const existingGuildId = getUserGuildId(userId);
        if (existingGuildId) {
            return { ok: false, message: '❌ Już należysz do gildii! Opuść ją najpierw.' };
        }
        
        // Ensure guildWarsState exists
        if (!guildWarsState || !guildWarsState.guilds) {
            guildWarsState = {
                guilds: {},
                controlledSections: {},
                lastUpdate: 0,
                forumSections: ['Metin2', 'Lineage', 'Lost Ark', 'RPG', 'Gry', 'Offtopic']
            };
        }
        
        const newGuildId = `guild_${userId}_${nowTs()}`;
        guildWarsState.guilds[newGuildId] = {
            id: newGuildId,
            name: guildName.trim(),
            description: (guildDescription || '').trim().slice(0, 200),
            leader: userId,
            members: [
                { userId, rank: 'Wódz', joinedAt: nowTs(), lastSeen: nowTs() }
            ],
            treasury: 0,
            buffs: {},
            chat: [],
            controlledSections: {},
            dominationBar: {},
            createdAt: nowTs(),
            updatedAt: nowTs()
        };
        
        // Initialize domination bar for all sections
        guildWarsState.forumSections.forEach(section => {
            guildWarsState.guilds[newGuildId].dominationBar[section] = 0;
        });
        
        persistMmoState(true);
        pullSharedMmoStateIfNeeded(true);
        return { ok: true, message: '✅ Gilda założona!', guildId: newGuildId };
    }

    function joinGuild(userId, guildId) {
        // Validate guild exists
        const guild = guildWarsState.guilds[guildId];
        if (!guild) {
            return { ok: false, message: '❌ Gilda nie istnieje!' };
        }
        
        // Check if user already in this guild
        if (guild.members.some(m => m.userId === userId)) {
            return { ok: false, message: '❌ Już należysz do tej gildii!' };
        }
        
        // Check if user in another guild
        const otherGuildId = getUserGuildId(userId);
        if (otherGuildId) {
            return { ok: false, message: '❌ Już należysz do innej gildii! Opuść ją najpierw.' };
        }
        
        // Add user to guild
        guild.members.push({
            userId,
            rank: 'Członek',
            joinedAt: nowTs(),
            lastSeen: nowTs()
        });
        guild.updatedAt = nowTs();
        persistMmoState(true);
        pullSharedMmoStateIfNeeded(true);
        return { ok: true, message: '✅ Dołączyłeś do gildii!' };
    }

    function leaveGuild(userId) {
        const guildId = getUserGuildId(userId);
        if (!guildId) {
            return { ok: false, message: '❌ Nie należysz do żadnej gildii!' };
        }
        
        const guild = guildWarsState.guilds[guildId];
        
        // If user is leader, check if they're the last member
        if (guild.leader === userId) {
            if (guild.members.length <= 1) {
                // Delete the entire guild
                delete guildWarsState.guilds[guildId];
                persistMmoState(true);
                pullSharedMmoStateIfNeeded(true);
                return { ok: true, message: '✅ Gilda rozwiązana (brak członków).' };
            } else {
                // Promote first member to leader
                const firstMember = guild.members.find(m => m.userId !== userId);
                guild.leader = firstMember.userId;
            }
        }
        
        // Remove user from members
        guild.members = guild.members.filter(m => m.userId !== userId);
        guild.updatedAt = nowTs();
        persistMmoState(true);
        pullSharedMmoStateIfNeeded(true);
        return { ok: true, message: '✅ Opuściłeś gildię!' };
    }

    function inviteToGuild(targetUserId, inviterUserId) {
        const guildId = getUserGuildId(inviterUserId);
        if (!guildId) return { ok: false, message: '❌ Nie należysz do żadnej gildii!' };
        
        const guild = guildWarsState.guilds[guildId];
        if (!guild) return { ok: false, message: '❌ Gilda nie istnieje!' };
        
        // Check if inviter is leader
        if (guild.leader !== inviterUserId) return { ok: false, message: '❌ Tylko wódz może zapraszać!' };
        
        const isMember = guild.members.some(m => m.userId === targetUserId);
        if (isMember) return { ok: false, message: '❌ Ten gracz już należy do gildii!' };
        
        // Wyślij zaproszenie
        guild.members.push({ userId: targetUserId, rank: 'Członek', joinedAt: nowTs(), lastSeen: nowTs() });
        guild.updatedAt = nowTs();
        persistMmoState(true);
        return { ok: true, message: `✅ #${targetUserId} zaproszony(a) do gildii!` };
    }

    function promoteMember(targetUserId, newRank, guildLeaderId) {
        const guild = getGuild(guildLeaderId);
        if (guild.leader !== guildLeaderId) return { ok: false, message: '❌ Brak uprawnień!' };
        
        const member = guild.members.find(m => m.userId === targetUserId);
        if (!member) return { ok: false, message: '❌ Gracz nie w gildii!' };
        
        member.rank = newRank; // 'Lider', 'Oficer', 'Rekrut'
        guild.updatedAt = nowTs();
        persistMmoState();
        return { ok: true, message: `✅ ${targetUserId} awansowany(a) na: ${newRank}` };
    }

    function depositToGuildTreasury(amount, userId) {
        const guildId = getUserGuildId(userId);
        if (!guildId) return { ok: false, message: '❌ Nie należysz do żadnej gildii!' };
        
        const guild = guildWarsState.guilds[guildId];
        if (!guild) return { ok: false, message: '❌ Gilda nie istnieje!' };
        
        if (!spendBaksy(amount, 'guild_deposit', { guildId: guildId })) {
            return { ok: false, message: '❌ Za mało baksów!' };
        }
        guild.treasury += amount;
        guild.updatedAt = nowTs();
        persistMmoState(true);
        return { ok: true, message: `✅ Wpłacono ${amount} do Skarbca gildii!` };
    }

    function activateGuildBuff(buffType, userId) {
        const guildId = getUserGuildId(userId);
        if (!guildId) return { ok: false, message: '❌ Nie należysz do żadnej gildii!' };
        
        const guild = guildWarsState.guilds[guildId];
        if (!guild) return { ok: false, message: '❌ Gilda nie istnieje!' };
        
        // Only leader can activate buffs
        if (guild.leader !== userId) return { ok: false, message: '❌ Tylko wódz może aktywować bufby!' };
        
        const costs = { 
            'damage+20%': 200,
            'defense+15%': 150,
            'luck+10%': 100
        };
        const cost = costs[buffType] || 0;
        
        if (guild.treasury < cost) return { ok: false, message: '❌ Za mało w Skarbcu!' };
        
        guild.treasury -= cost;
        guild.buffs[buffType] = {
            endsAt: nowTs() + (2 * 60 * 60 * 1000), // 2 godziny
            activeSince: nowTs()
        };
        guild.updatedAt = nowTs();
        persistMmoState(true);
        return { ok: true, message: `⚡ Aktywowano buff: ${buffType} na 2h!` };
    }

    function addGuildChatMessage(userId, message) {
        const guildId = getUserGuildId(userId);
        if (!guildId) {
            return { ok: false, message: '❌ Nie należysz do żadnej gildii!' };
        }
        
        const guild = guildWarsState.guilds[guildId];
        if (!guild) {
            return { ok: false, message: '❌ Gilda nie istnieje!' };
        }
        
        // Ensure chat array exists
        if (!guild.chat || !Array.isArray(guild.chat)) {
            guild.chat = [];
        }
        
        guild.chat.push({
            userId,
            message: String(message).slice(0, 200),
            at: nowTs()
        });
        
        if (guild.chat.length > 100) guild.chat.shift();
        guild.updatedAt = nowTs();
        persistMmoState(true);
        pullSharedMmoStateIfNeeded(true);
        return { ok: true };
    }

    function updateGuildDomination(sectionName, guildLeaderId, postsCount) {
        const guild = getGuild(guildLeaderId);
        const maxDomination = 100;
        const currentDom = guild.dominationBar[sectionName] || 0;
        
        // +1% dominacji za każde 10 postów
        const increment = Math.floor(postsCount / 10);
        guild.dominationBar[sectionName] = Math.min(maxDomination, currentDom + increment);
        
        if (guild.dominationBar[sectionName] >= maxDomination) {
            // Dział przejęty!
            guild.controlledSections[sectionName] = {
                controlledAt: nowTs(),
                hourlyIncome: guild.members.length * 1
            };
            guild.updatedAt = nowTs();
            persistMmoState();
            return { ok: true, captured: true, message: `⚔️ Gilda przejęła dział: ${sectionName}!` };
        }
        
        guild.updatedAt = nowTs();
        persistMmoState();
        return { ok: true, captured: false, progress: guild.dominationBar[sectionName] };
    }

    function distributeGuildIncome() {
        Object.values(guildWarsState.guilds).forEach(guild => {
            Object.entries(guild.controlledSections).forEach(([section, data]) => {
                if (guild.members.length > 0) {
                    const incomePerMember = Math.floor(data.hourlyIncome / guild.members.length);
                    guild.members.forEach(member => {
                        // awardBaksyToUser obsługuje lokalnego gracza i zdalnych przez Firebase
                        awardBaksyToUser(member.userId, incomePerMember, 'guild_control_income', {
                            guildName: guild.name,
                            section
                        });
                    });
                }
            });
            guild.updatedAt = nowTs();
        });
        persistMmoState();
    }

    // ===== TREASURE HUNT SYSTEM =====
    function startTreasureHunt() {
        // Losuj post z forum (placeholder - w praktyce trzeba zrobić fetch)
        const randomPostId = Math.floor(Math.random() * 1000000);
        const clues = [
            'Skarb ukryty w dziale gier, w temacie z 2014 roku',
            'Poszukaj starego tematu o Lineage - tam czeka nagroda',
            'W archiwach Metin2 kryje się złoto',
            'Złe jajo czeka w sekcji Bezpieczeństwa'
        ];
        
        treasureHuntState.active = true;
        treasureHuntState.targetPostId = randomPostId;
        treasureHuntState.clue = clues[Math.floor(Math.random() * clues.length)];
        treasureHuntState.spawnedAt = nowTs();
        treasureHuntState.winner = null;
        treasureHuntState.wonAt = 0;
        persistMmoState();
        
        return treasureHuntState;
    }

    function claimTreasure(userId) {
        if (!treasureHuntState.active || treasureHuntState.winner) {
            return { ok: false, message: 'Nie ma aktywnej łapanki skarbów!' };
        }
        
        treasureHuntState.winner = userId;
        treasureHuntState.wonAt = nowTs();
        treasureHuntState.active = false;
        emitMmoEvent('treasure:won', { userId, at: nowTs() });
        
        const prize = 1000;
        // awardBaksyToUser — obsługuje zarówno lokalnego gracza jak i zdalnych przez Firebase
        awardBaksyToUser(userId, prize, 'treasure_hunt_win', { clue: treasureHuntState.clue });
        persistMmoState();
        
        return { ok: true, message: `🎊 ${userId} znalazł(a) złote jajo i wygrywa ${prize} baksy!`, winner: userId, prize };
    }

    // ===== AUCTION SYSTEM =====
    function startNewAuction(itemName, startingBid) {
        auctionState.currentLot = {
            name: itemName,
            startingBid: startingBid,
            spawnedAt: nowTs()
        };
        auctionState.bids = [];
        auctionState.startedAt = nowTs();
        auctionState.endsAt = nowTs() + (60 * 60 * 1000); // 1 godzina
        persistMmoState();
        
        return auctionState.currentLot;
    }

    function placeBid(userId, bidAmount) {
        if (!auctionState.currentLot) {
            return { ok: false, message: 'Brak aukcji w toku!' };
        }
        
        if (nowTs() > auctionState.endsAt) {
            return { ok: false, message: 'Aukcja się skończyła!' };
        }
        
        const lastBid = auctionState.bids[auctionState.bids.length - 1];
        const minBid = lastBid ? lastBid.amount + 10 : auctionState.currentLot.startingBid;
        
        if (bidAmount < minBid) {
            return { ok: false, message: `Minimalna oferta to ${minBid}!` };
        }
        
        if (!spendBaksy(bidAmount, 'auction_bid', { item: auctionState.currentLot.name })) {
            return { ok: false, message: 'Za mało baksów na tę ofertę!' };
        }
        
        // Zwróć poprzedniemu licytatorowi jeśli istniał
        if (lastBid) {
            awardBaksy(lastBid.amount, 'auction_bid_returned', { item: auctionState.currentLot.name }, { disableNightMultiplier: true });
        }
        
        auctionState.bids.push({ userId, amount: bidAmount, at: nowTs() });
        emitMmoEvent('auction:bid', { userId, amount: Number(bidAmount || 0), at: nowTs() });
        persistMmoState();
        
        return { ok: true, message: `✅ Licytacja: ${bidAmount} baksy za "${auctionState.currentLot.name}"!`, currentBid: bidAmount };
    }

    function resolveAuction() {
        if (!auctionState.currentLot || auctionState.bids.length === 0) {
            return { ok: false, message: 'Brak aukcji do rozstrzygnięcia!' };
        }
        
        const winner = auctionState.bids[auctionState.bids.length - 1];
        awardBaksy(100, 'auction_winner_bonus', { item: auctionState.currentLot.name }, { disableNightMultiplier: true });
        
        const result = { ok: true, winner: winner.userId, item: auctionState.currentLot.name, finalBid: winner.amount };
        
        auctionState.currentLot = null;
        auctionState.bids = [];
        auctionState.endsAt = 0;
        auctionState.startedAt = 0;
        persistMmoState();
        
        return result;
    }

    function applySharedProfileEmojiEffects() {
        document.querySelectorAll('.sebus-shared-profile-emoji').forEach(el => el.remove());

        const map = baksyWorldCache?.effects?.profileEmoji || {};
        const now = nowTs();
        Object.keys(map).forEach(userId => {
            const effect = map[userId];
            if (!effect || Number(effect.expiresAt || 0) <= now) return;

            const anchors = document.querySelectorAll(`a[data-memberid="${userId}"], [data-mentionid="${userId}"]`);
            anchors.forEach(anchor => {
                if (anchor.querySelector('.sebus-shared-profile-emoji')) return;
                const badge = document.createElement('span');
                badge.className = 'sebus-shared-profile-emoji';
                badge.textContent = String(effect.emoji || '🔥').slice(0, 2);
                anchor.appendChild(badge);
            });
        });
    }

    function applySharedNickHighlightEffects() {
        document.querySelectorAll('.sebus-shared-nick-highlight').forEach(el => {
            el.classList.remove('sebus-shared-nick-highlight');
            el.style.removeProperty('--sebus-shared-highlight');
        });

        const map = baksyWorldCache?.effects?.nickHighlight || {};
        const now = nowTs();
        Object.keys(map).forEach(userId => {
            const effect = map[userId];
            if (!effect || Number(effect.expiresAt || 0) <= now) return;
            const color = sanitizeSharedHighlightColor(effect.color || '#ffd700');

            const anchors = document.querySelectorAll(`a[data-memberid="${userId}"], [data-mentionid="${userId}"]`);
            anchors.forEach(anchor => {
                anchor.classList.add('sebus-shared-nick-highlight');
                anchor.style.setProperty('--sebus-shared-highlight', color);
            });
        });
    }

    function captureLeagueWealthHistory() {
        const db = ensureBaksyDbLoaded();
        if (!db.leagueTrends || typeof db.leagueTrends !== 'object') db.leagueTrends = {};
        const rows = Array.isArray(baksyWorldCache?.leaderboard) ? baksyWorldCache.leaderboard : [];
        rows.slice(0, 30).forEach(row => {
            const uid = String(row.userId || '');
            if (!uid) return;
            const prev = Array.isArray(db.leagueTrends[uid]) ? db.leagueTrends[uid] : [];
            const next = prev.concat([{
                at: nowTs(),
                balance: normalizeBaksyNumber(row.balance || 0)
            }]).slice(-20);
            db.leagueTrends[uid] = next;
        });
    }

    function getSparklineForUser(userId) {
        const db = ensureBaksyDbLoaded();
        const points = Array.isArray(db?.leagueTrends?.[String(userId)]) ? db.leagueTrends[String(userId)] : [];
        if (!points.length) return '▁▁▁▁▁';
        const bars = '▁▂▃▄▅▆▇█';
        const values = points.map(p => Number(p.balance || 0));
        const min = Math.min(...values);
        const max = Math.max(...values);
        const span = Math.max(1, max - min);
        return values.map(v => {
            const idx = Math.max(0, Math.min(7, Math.floor(((v - min) / span) * 7)));
            return bars[idx];
        }).join('');
    }

    function processKingForumIncome() {
        const now = nowTs();
        if ((now - lastKingIncomeTickAt) < 20000) return;
        lastKingIncomeTickAt = now;

        const rows = Array.isArray(baksyWorldCache?.leaderboard) ? baksyWorldCache.leaderboard : [];
        if (!rows.length) return;
        const king = rows[0];
        if (!king || String(king.userId) !== String(getRuntimeUserId())) return;

        const account = getBaksyAccount();
        const meta = ensureLeagueMetaState(account);
        const lastAt = Number(meta.lastKingIncomeAt || 0) || now;
        const elapsedMinutes = Math.floor((now - lastAt) / 60000);
        if (elapsedMinutes <= 0) return;

        meta.lastKingIncomeAt = now;
        awardBaksy(elapsedMinutes, 'king_forum_income', { minutes: elapsedMinutes }, { disableNightMultiplier: true });
        saveBaksyDb();
    }

    function getLeagueSeasonInfo() {
        const db = ensureBaksyDbLoaded();
        if (!db.leagueSeason || typeof db.leagueSeason !== 'object') {
            db.leagueSeason = {
                id: `S-${new Date().getFullYear()}-${Math.floor((new Date().getMonth() / 3) + 1)}`,
                startedAt: nowTs(),
                resetsAt: nowTs() + (30 * 24 * 60 * 60 * 1000)
            };
        }
        return db.leagueSeason;
    }

    function getDailyArtifactOffer() {
        const offers = [
            { id: 'chatEntranceSfx', name: 'Rare: Echo Wejścia', cost: 220, minLeagueLevel: 2, rarity: 'rare' },
            { id: 'avatarFrame', name: 'Epic: Ramka Awatara', cost: 340, minLeagueLevel: 3, rarity: 'epic' },
            { id: 'forumPinTicket', name: 'Legendary: Bilet Moderatora (10m)', cost: 520, minLeagueLevel: 4, rarity: 'legendary' },
            { id: 'legendAura', name: 'Legendary: Aura Legendy', cost: 760, minLeagueLevel: 5, rarity: 'legendary' }
        ];
        const daySeed = Number(getCurrentDayKey().replace(/-/g, '')) || 0;
        return offers[daySeed % offers.length];
    }

    function getMarketStockSnapshot() {
        const online = document.querySelectorAll('#elOnlineUsers a[data-memberid], [id*="OnlineUsers"] a[data-memberid], [class*="OnlineUsers"] a[data-memberid]').length;
        const active = document.querySelectorAll('.sebus-life-active').length;
        const momentum = Math.max(-8, Math.min(18, (active * 2) - online + 10));
        const base = 100;
        const wave = Math.sin(nowTs() / (1000 * 60 * 15)) * 12;
        const price = Math.max(25, Math.round(base + wave + momentum));
        return {
            price,
            momentum,
            trend: momentum >= 0 ? 'bull' : 'bear'
        };
    }

    function getShopDiscountMultiplier() {
        const account = getBaksyAccount();
        const meta = ensureLeagueMetaState(account);
        const lvl = Number(meta?.skillTree?.shopDiscount || 0);
        return Math.max(0.7, 1 - (lvl * 0.05));
    }

    function buyMarketResource(resourceId, amount = 1) {
        const account = getBaksyAccount();
        const meta = ensureLeagueMetaState(account);
        const prices = {
            goldDust: 45,
            oldDiskette: 65
        };
        const basePrice = Number(prices[resourceId] || 0);
        if (!basePrice) return { ok: false, message: 'Nieznany surowiec.' };

        const totalCost = Math.round(basePrice * Math.max(1, Number(amount) || 1) * getShopDiscountMultiplier());
        if (!spendBaksy(totalCost, `market_resource:${resourceId}`, { amount })) {
            return { ok: false, message: 'Za mało baksów.' };
        }

        meta.market.resources[resourceId] = Number(meta.market.resources[resourceId] || 0) + Math.max(1, Number(amount) || 1);
        account.updatedAt = nowTs();
        saveBaksyDb();
        return { ok: true, message: `✅ Kupiono ${amount}x ${resourceId} za ${totalCost} 💵` };
    }

    function craftMarketItem(recipeId) {
        const account = getBaksyAccount();
        const meta = ensureLeagueMetaState(account);
        const recipes = {
            forumRelic: { requires: { goldDust: 4, oldDiskette: 2 }, name: 'Forum Relic (Epic)' },
            immortalSeal: { requires: { goldDust: 8, oldDiskette: 5 }, name: 'Seal of Immortality (Legendary)' }
        };
        const recipe = recipes[recipeId];
        if (!recipe) return { ok: false, message: 'Nieznana receptura.' };

        const hasAll = Object.entries(recipe.requires).every(([key, val]) => Number(meta.market.resources[key] || 0) >= Number(val || 0));
        if (!hasAll) return { ok: false, message: 'Brak surowców do craftingu.' };

        Object.entries(recipe.requires).forEach(([key, val]) => {
            meta.market.resources[key] = Math.max(0, Number(meta.market.resources[key] || 0) - Number(val || 0));
        });
        meta.market.craftedItems.push({
            id: `crafted_${recipeId}_${nowTs()}`,
            name: recipe.name,
            at: nowTs()
        });
        account.updatedAt = nowTs();
        saveBaksyDb();
        return { ok: true, message: `🔨 Wykuto: ${recipe.name}` };
    }

    function buyForumStock(shares) {
        const units = Math.max(1, Number(shares) || 1);
        const account = getBaksyAccount();
        const meta = ensureLeagueMetaState(account);
        const stock = getMarketStockSnapshot();
        const cost = units * stock.price;
        if (!spendBaksy(cost, 'market_stock_buy', { shares: units, price: stock.price })) {
            return { ok: false, message: 'Za mało baksów.' };
        }

        const oldShares = Number(meta.market.stockShares || 0);
        const oldAvg = Number(meta.market.stockAvgPrice || 0);
        const newShares = oldShares + units;
        const newAvg = newShares > 0 ? ((oldShares * oldAvg) + (units * stock.price)) / newShares : 0;

        meta.market.stockShares = newShares;
        meta.market.stockAvgPrice = Number(newAvg.toFixed(2));
        meta.market.stockLastActionAt = nowTs();
        account.updatedAt = nowTs();
        saveBaksyDb();
        return { ok: true, message: `📈 Kupiono ${units} akcji po ${stock.price} 💵` };
    }

    function sellForumStock(shares) {
        const units = Math.max(1, Number(shares) || 1);
        const account = getBaksyAccount();
        const meta = ensureLeagueMetaState(account);
        const current = Number(meta.market.stockShares || 0);
        if (current < units) return { ok: false, message: 'Brak tylu akcji.' };

        const stock = getMarketStockSnapshot();
        const revenue = units * stock.price;
        meta.market.stockShares = current - units;
        if (meta.market.stockShares <= 0) meta.market.stockAvgPrice = 0;
        meta.market.stockLastActionAt = nowTs();
        account.updatedAt = nowTs();
        awardBaksy(revenue, 'market_stock_sell', { shares: units, price: stock.price }, { disableNightMultiplier: true });
        saveBaksyDb();
        return { ok: true, message: `📉 Sprzedano ${units} akcji po ${stock.price} 💵` };
    }

    function challengeForumKing() {
        const rows = Array.isArray(baksyWorldCache?.leaderboard) ? baksyWorldCache.leaderboard : [];
        if (!rows.length) return { ok: false, message: 'Brak aktywnego rankingu.' };

        const king = rows[0];
        const runtimeUserId = String(getRuntimeUserId());
        if (String(king.userId) === runtimeUserId) return { ok: false, message: 'Jesteś już Królem Forum.' };
        if (!spendBaksy(80, 'throne_challenge_entry', { king: king.userId })) {
            return { ok: false, message: 'Potrzebujesz 80 💵 na Wyzwanie Tronowe.' };
        }

        const account = getBaksyAccount();
        const meta = ensureLeagueMetaState(account);
        const chance = 0.30 + (Number(meta.skillTree?.jackpotLuck || 0) * 0.03);
        const success = Math.random() < Math.min(0.65, chance);

        if (success) {
            meta.throneChallengesWon = Number(meta.throneChallengesWon || 0) + 1;
            awardBaksy(260, 'throne_challenge_win', { king: king.userId }, { disableNightMultiplier: true });
            saveBaksyDb();
            return { ok: true, message: `👑 Pokonałeś Króla #${king.userId}! Premia +260 💵` };
        }

        meta.throneChallengesLost = Number(meta.throneChallengesLost || 0) + 1;
        saveBaksyDb();
        return { ok: false, message: `⚔️ Wyzwanie nieudane. Król #${king.userId} utrzymał tron.` };
    }

    function spendKnowledgePoint(skillKey) {
        const account = getBaksyAccount();
        const meta = ensureLeagueMetaState(account);
        if (Number(meta.knowledgePoints || 0) <= 0) return { ok: false, message: 'Brak Punktów Wiedzy.' };
        if (!Object.prototype.hasOwnProperty.call(meta.skillTree, skillKey)) return { ok: false, message: 'Nieznana umiejętność.' };
        if (Number(meta.skillTree[skillKey] || 0) >= 5) return { ok: false, message: 'Osiągnięto maks. poziom (5).' };

        meta.knowledgePoints = Number(meta.knowledgePoints || 0) - 1;
        meta.skillTree[skillKey] = Number(meta.skillTree[skillKey] || 0) + 1;
        account.updatedAt = nowTs();
        saveBaksyDb();
        return { ok: true, message: `✅ Ulepszono ${skillKey} do ${meta.skillTree[skillKey]}.` };
    }

    function initAdvancedLeaguePanelIfNeeded() {
        const existing = document.getElementById('sebus-league-panel-adv');
        if (existing) return existing;

        const panel = document.createElement('div');
        panel.id = 'sebus-league-panel-adv';
        panel.className = 'sebus-hub-container';
        panel.style.cssText = 'position:fixed;left:100px;bottom:100px;width:430px;max-height:80vh;overflow:auto;display:none;z-index:2147483647;border-radius:14px;background:linear-gradient(180deg, rgba(27,23,17,.98), rgba(10,10,10,.98));border:1px solid rgba(217, 168, 60, 0.75);';

        panel.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid rgba(255,214,110,.23);">
                <button id="sebus-league-back-btn" class="sebus-mmo-btn" style="width:80px;height:28px;font-size:10px;padding:0;" type="button">← Wróć</button>
                <div class="sebus-baksy-hub-title" style="flex:1;text-align:center;margin:0;">📜 Liga</div>
            </div>

            <div class="sebus-mission-item" style="margin-bottom:8px;">
                <div>Sezon: <strong id="sebus-league-season-id">-</strong></div>
                <div class="sebus-mission-meta">Mnożnik prestiżu: <strong id="sebus-league-prestige">1.00</strong></div>
            </div>

            <div class="sebus-league-section">
                <h4 class="sebus-hub-title">🏆 Droga do Nieśmiertelności</h4>
                <div id="sebus-league-ranking-list" class="sebus-league-list"></div>
            </div>

            <div class="sebus-league-section">
                <h4 class="sebus-hub-title">👑 Król Forum</h4>
                <div id="sebus-league-king-box" class="sebus-mission-item"></div>
                <button id="sebus-league-challenge-btn" class="sebus-mmo-btn" type="button">⚔️ Rzuć Wyzwanie Tronowe (80)</button>
                <div id="sebus-league-king-feedback" style="margin-top:6px;font-size:10px;min-height:12px;"></div>
            </div>

            <div class="sebus-league-section">
                <h4 class="sebus-hub-title">📜 Wielki Grimoire Zadań</h4>
                <div id="sebus-league-missions-list"></div>
                <div style="margin-top:8px;font-size:10px;">Punkty Wiedzy: <strong id="sebus-league-knowledge">0</strong></div>
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;margin-top:6px;">
                    <button data-skill="shopDiscount" class="sebus-mmo-btn sebus-skill-up-btn" type="button" style="font-size:9px;height:28px;">Sklep -5%</button>
                    <button data-skill="jackpotLuck" class="sebus-mmo-btn sebus-skill-up-btn" type="button" style="font-size:9px;height:28px;">Jackpot +szansa</button>
                    <button data-skill="missionBoost" class="sebus-mmo-btn sebus-skill-up-btn" type="button" style="font-size:9px;height:28px;">Misje +5%</button>
                </div>
                <div id="sebus-league-skill-feedback" style="margin-top:6px;font-size:10px;min-height:12px;"></div>
            </div>

            <div class="sebus-league-section">
                <h4 class="sebus-hub-title">🌍 Cel Społeczności</h4>
                <div id="sebus-league-community-text" class="sebus-mission-meta"></div>
                <div style="width:100%;height:12px;background:#1d1d1d;border-radius:4px;overflow:hidden;margin-top:4px;">
                    <div id="sebus-league-community-bar" style="height:100%;width:0%;background:linear-gradient(90deg,#67ffbf,#2ec97b);"></div>
                </div>
            </div>

            <div id="sebus-league-chart-modal" style="display:none;margin-top:10px;padding:8px;border:1px solid rgba(255,214,110,.2);border-radius:8px;background:rgba(0,0,0,.25);"></div>
        `;

        document.body.appendChild(panel);

        panel.querySelector('#sebus-league-back-btn').addEventListener('click', () => {
            panel.style.display = 'none';
        });

        panel.querySelector('#sebus-league-challenge-btn').addEventListener('click', () => {
            const result = challengeForumKing();
            const feedback = panel.querySelector('#sebus-league-king-feedback');
            if (feedback) feedback.textContent = result.message;
            syncBaksyLeagueUi();
        });

        panel.querySelectorAll('.sebus-skill-up-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const skill = btn.getAttribute('data-skill') || '';
                const result = spendKnowledgePoint(skill);
                const feedback = panel.querySelector('#sebus-league-skill-feedback');
                if (feedback) feedback.textContent = result.message;
                syncBaksyLeagueUi();
            });
        });

        panel.addEventListener('click', (ev) => {
            const target = ev.target;
            if (!target || !target.classList || !target.classList.contains('sebus-league-chart-btn')) return;
            const userId = String(target.getAttribute('data-userid') || '');
            const modal = panel.querySelector('#sebus-league-chart-modal');
            if (!modal) return;
            const chart = getSparklineForUser(userId);
            modal.style.display = 'block';
            modal.innerHTML = `<div style="font-size:10px;color:#ffe7bc;">Wykres majątku gracza #${escapeHtml(userId)}</div><div style="font-size:22px;letter-spacing:2px;margin-top:4px;">${chart}</div>`;
        });

        return panel;
    }

    function syncAdvancedLeaguePanelUi(panel) {
        if (!panel) return;

        captureLeagueWealthHistory();
        const season = getLeagueSeasonInfo();
        const account = getBaksyAccount();
        const meta = ensureLeagueMetaState(account);
        const rows = Array.isArray(baksyWorldCache?.leaderboard) ? baksyWorldCache.leaderboard : [];

        const seasonEl = panel.querySelector('#sebus-league-season-id');
        const prestigeEl = panel.querySelector('#sebus-league-prestige');
        const rankEl = panel.querySelector('#sebus-league-ranking-list');
        const kingEl = panel.querySelector('#sebus-league-king-box');
        const communityTextEl = panel.querySelector('#sebus-league-community-text');
        const communityBarEl = panel.querySelector('#sebus-league-community-bar');
        const knowledgeEl = panel.querySelector('#sebus-league-knowledge');
        const missionsEl = panel.querySelector('#sebus-league-missions-list');

        if (seasonEl) seasonEl.textContent = String(season.id || 'S-?');
        if (prestigeEl) prestigeEl.textContent = `x${getPrestigeMultiplier(account).toFixed(2)}`;
        if (knowledgeEl) knowledgeEl.textContent = String(Number(meta.knowledgePoints || 0));

        if (rankEl) {
            const topRows = rows.slice(0, 15);
            rankEl.innerHTML = !topRows.length
                ? '<div class="sebus-league-item">Brak danych rankingu.</div>'
                : topRows.map((row, index) => {
                    const rank = index + 1;
                    const division = getLeagueDivisionByRank(rank);
                    const color = getRarityColor(division.rarity);
                    const spark = getSparklineForUser(row.userId);
                    return `<div class="sebus-league-item" style="border-left:3px solid ${color};">
                        <span>#${rank} ${escapeHtml(row.displayName)} (${escapeHtml(row.userId)}) <small style="color:${color};">${division.name}</small></span>
                        <span><strong>${normalizeBaksyNumber(row.balance)} 💵</strong> <button class="sebus-league-chart-btn" data-userid="${escapeHtml(String(row.userId))}" type="button" style="margin-left:6px;background:none;border:1px solid #666;border-radius:4px;color:#ddd;cursor:pointer;">📈 ${spark}</button></span>
                    </div>`;
                }).join('');
        }

        if (kingEl) {
            if (!rows.length) {
                kingEl.innerHTML = 'Brak Króla Forum (brak rankingu).';
            } else {
                const king = rows[0];
                const isMe = String(king.userId) === String(getRuntimeUserId());
                kingEl.innerHTML = `<div>Król: <strong>#${escapeHtml(String(king.userId))}</strong> (${escapeHtml(String(king.displayName || 'gracz'))})</div>
                <div class="sebus-mission-meta">Status: ${isMe ? '👑 To Ty (pasywnie +1/min)' : '⚔️ Możesz rzucić wyzwanie'}</div>`;
            }
        }

        if (missionsEl) {
            const snapshot = getDailyMissionUiSnapshot();
            missionsEl.innerHTML = snapshot.map(item => {
                if (item.hidden) {
                    const accountMissions = ensureDailyMissionsState(getBaksyAccount());
                    if (!accountMissions.hiddenUnlocked?.[item.id]) {
                        return `<div class="sebus-mission-item"><div style="color:${getRarityColor(item.rarity)};">❓ Ukryta misja (${String(item.rarity || 'legendary').toUpperCase()})</div><div class="sebus-mission-meta">Odblokowanie: napisz wiadomość o północy</div></div>`;
                    }
                }
                const color = getRarityColor(item.rarity);
                const doneText = item.completed ? '✅ Ukończona' : '⏳ W toku';
                return `<div class="sebus-mission-item ${item.completed ? 'sebus-mission-done' : ''}" style="border-left:3px solid ${color};"><div>${escapeHtml(item.label)}</div><div class="sebus-mission-meta">${item.progress}/${item.target} • +${Math.round(Number(item.reward || 0) * getPrestigeMultiplier())} 💵 • ${doneText}</div></div>`;
            }).join('');
        }

        const communityState = getCommunityGoalState();
        const total = Number(communityState.lastRemoteTotal || communityState.localMessages || 0);
        const target = Number(communityState.targetMessages || 500);
        const pct = Math.max(0, Math.min(100, Math.round((total / target) * 100)));
        if (communityTextEl) communityTextEl.textContent = `${total}/${target} wiadomości • Bonus niedzielny: ${pct >= 100 ? 'AKTYWNY (+50%)' : 'w toku'}`;
        if (communityBarEl) communityBarEl.style.width = `${pct}%`;

        if ((nowTs() - Number(communityState.lastRemoteSyncAt || 0)) > 25000) {
            refreshCommunityGoalRemoteTotal().then(() => {
                if (panel.style.display !== 'none') syncAdvancedLeaguePanelUi(panel);
            });
        }
    }

    function initAdvancedMarketPanelIfNeeded() {
        const existing = document.getElementById('sebus-market-panel-adv');
        if (existing) return existing;

        const panel = document.createElement('div');
        panel.id = 'sebus-market-panel-adv';
        panel.className = 'sebus-hub-container';
        panel.style.cssText = 'position:fixed;left:100px;bottom:100px;width:430px;max-height:80vh;overflow:auto;display:none;z-index:2147483647;border-radius:14px;background:linear-gradient(180deg, rgba(27,23,17,.98), rgba(10,10,10,.98));border:1px solid rgba(217, 168, 60, 0.75);';

        panel.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid rgba(255,214,110,.23);">
                <button id="sebus-market-back-btn" class="sebus-mmo-btn" style="width:80px;height:28px;font-size:10px;padding:0;" type="button">← Wróć</button>
                <div class="sebus-baksy-hub-title" style="flex:1;text-align:center;margin:0;">🧰 Rynek</div>
            </div>

            <div class="sebus-league-section">
                <h4 class="sebus-hub-title">🛒 Artefakt Dnia (24h)</h4>
                <div id="sebus-market-artifact" class="sebus-mission-item"></div>
                <button id="sebus-market-buy-artifact" class="sebus-mmo-btn" type="button">Kup Artefakt</button>
            </div>

            <div class="sebus-league-section">
                <h4 class="sebus-hub-title">⚒️ Crafting</h4>
                <div id="sebus-market-resources" class="sebus-mission-item"></div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:6px;">
                    <button id="sebus-market-buy-golddust" class="sebus-mmo-btn" type="button">Kup Złoty Pył</button>
                    <button id="sebus-market-buy-diskette" class="sebus-mmo-btn" type="button">Kup Starą Dyskietkę</button>
                    <button id="sebus-market-craft-relic" class="sebus-mmo-btn" type="button">Wykuj Forum Relic</button>
                    <button id="sebus-market-craft-seal" class="sebus-mmo-btn" type="button">Wykuj Seal</button>
                </div>
                <div id="sebus-market-crafted-list" style="margin-top:6px;font-size:10px;"></div>
            </div>

            <div class="sebus-league-section">
                <h4 class="sebus-hub-title">📈 Akcje Forum</h4>
                <div id="sebus-market-stock" class="sebus-mission-item"></div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:6px;">
                    <button id="sebus-market-buy-stock" class="sebus-mmo-btn" type="button">Kup 1 akcję</button>
                    <button id="sebus-market-sell-stock" class="sebus-mmo-btn" type="button">Sprzedaj 1 akcję</button>
                </div>
            </div>

            <div class="sebus-league-section">
                <h4 class="sebus-hub-title">🎨 Efekty Premium</h4>
                <input id="sebus-market-target-id" type="text" placeholder="ID celu">
                <input id="sebus-market-emoji" type="text" maxlength="2" placeholder="Emoji np. 🔥">
                <select id="sebus-market-color">
                    <option value="#ffd700">Nick: Złoty</option>
                    <option value="#ff4545">Nick: Czerwony</option>
                    <option value="#cc33ff">Nick: Fiolet</option>
                    <option value="#58a6ff">Nick: Niebieski</option>
                    <option value="#67ffbf">Nick: Miętowy</option>
                </select>
                <button id="sebus-market-buy-emoji" class="sebus-mmo-btn" type="button">Przypnij emotkę ($140)</button>
                <button id="sebus-market-buy-highlight" class="sebus-mmo-btn" type="button">Podświetl nick ($180)</button>
            </div>

            <div id="sebus-market-feedback" style="margin-top:8px;font-size:10px;min-height:12px;"></div>
        `;

        document.body.appendChild(panel);

        const feedbackEl = panel.querySelector('#sebus-market-feedback');

        panel.querySelector('#sebus-market-back-btn').addEventListener('click', () => {
            panel.style.display = 'none';
        });

        panel.querySelector('#sebus-market-buy-golddust').addEventListener('click', () => {
            const result = buyMarketResource('goldDust', 1);
            if (feedbackEl) feedbackEl.textContent = result.message;
            syncAdvancedMarketPanelUi(panel);
        });

        panel.querySelector('#sebus-market-buy-diskette').addEventListener('click', () => {
            const result = buyMarketResource('oldDiskette', 1);
            if (feedbackEl) feedbackEl.textContent = result.message;
            syncAdvancedMarketPanelUi(panel);
        });

        panel.querySelector('#sebus-market-craft-relic').addEventListener('click', () => {
            const result = craftMarketItem('forumRelic');
            if (feedbackEl) feedbackEl.textContent = result.message;
            syncAdvancedMarketPanelUi(panel);
        });

        panel.querySelector('#sebus-market-craft-seal').addEventListener('click', () => {
            const result = craftMarketItem('immortalSeal');
            if (feedbackEl) feedbackEl.textContent = result.message;
            syncAdvancedMarketPanelUi(panel);
        });

        panel.querySelector('#sebus-market-buy-stock').addEventListener('click', () => {
            const result = buyForumStock(1);
            if (feedbackEl) feedbackEl.textContent = result.message;
            syncAdvancedMarketPanelUi(panel);
        });

        panel.querySelector('#sebus-market-sell-stock').addEventListener('click', () => {
            const result = sellForumStock(1);
            if (feedbackEl) feedbackEl.textContent = result.message;
            syncAdvancedMarketPanelUi(panel);
        });

        panel.querySelector('#sebus-market-buy-artifact').addEventListener('click', () => {
            const artifact = getDailyArtifactOffer();
            const level = getRuntimeLeagueLevel();
            if (level < Number(artifact.minLeagueLevel || 1)) {
                if (feedbackEl) feedbackEl.textContent = `❌ Wymagana liga: ${artifact.minLeagueLevel} (${artifact.name})`;
                return;
            }

            const account = getBaksyAccount();
            const meta = ensureLeagueMetaState(account);
            if (!spendBaksy(Math.round(Number(artifact.cost || 0) * getShopDiscountMultiplier()), `artifact:${artifact.id}`, { artifact })) {
                if (feedbackEl) feedbackEl.textContent = '❌ Za mało baksów.';
                return;
            }

            meta.market.craftedItems.push({
                id: `artifact_${artifact.id}_${nowTs()}`,
                name: artifact.name,
                at: nowTs(),
                rarity: artifact.rarity
            });
            saveBaksyDb();
            if (feedbackEl) feedbackEl.textContent = `✅ Kupiono Artefakt Dnia: ${artifact.name}`;
            syncAdvancedMarketPanelUi(panel);
        });

        panel.querySelector('#sebus-market-buy-emoji').addEventListener('click', async () => {
            const target = panel.querySelector('#sebus-market-target-id').value.trim();
            const emoji = panel.querySelector('#sebus-market-emoji').value.trim() || '🔥';
            const result = await purchaseSharedBaksyEffect('profileEmoji24h', target, { emoji });
            if (feedbackEl) feedbackEl.textContent = result.message;
        });

        panel.querySelector('#sebus-market-buy-highlight').addEventListener('click', async () => {
            const target = panel.querySelector('#sebus-market-target-id').value.trim();
            const color = panel.querySelector('#sebus-market-color').value;
            const result = await purchaseSharedBaksyEffect('nickHighlight24h', target, { color });
            if (feedbackEl) feedbackEl.textContent = result.message;
        });

        return panel;
    }

    function syncAdvancedMarketPanelUi(panel) {
        if (!panel) return;
        const account = getBaksyAccount();
        const meta = ensureLeagueMetaState(account);
        const artifact = getDailyArtifactOffer();
        const stock = getMarketStockSnapshot();

        const artifactEl = panel.querySelector('#sebus-market-artifact');
        const resourcesEl = panel.querySelector('#sebus-market-resources');
        const stockEl = panel.querySelector('#sebus-market-stock');
        const craftedEl = panel.querySelector('#sebus-market-crafted-list');

        if (artifactEl) {
            const color = getRarityColor(artifact.rarity);
            artifactEl.innerHTML = `<div style="color:${color};font-weight:700;">${escapeHtml(artifact.name)}</div><div class="sebus-mission-meta">Koszt: ${artifact.cost} • Wymagana Liga: ${artifact.minLeagueLevel}</div>`;
        }

        if (resourcesEl) {
            resourcesEl.innerHTML = `<div>Złoty Pył: <strong>${Number(meta.market.resources.goldDust || 0)}</strong></div><div>Stara Dyskietka: <strong>${Number(meta.market.resources.oldDiskette || 0)}</strong></div><div class="sebus-mission-meta">Rabat sklepu: -${Math.round((1 - getShopDiscountMultiplier()) * 100)}%</div>`;
        }

        if (stockEl) {
            const delta = Number(stock.momentum || 0);
            const trendText = delta >= 0 ? `🟢 +${delta}` : `🔴 ${delta}`;
            stockEl.innerHTML = `<div>Cena akcji: <strong>${stock.price}</strong> 💵 (${trendText})</div><div class="sebus-mission-meta">Twoje akcje: ${Number(meta.market.stockShares || 0)} • Śr. koszt: ${Number(meta.market.stockAvgPrice || 0)}</div>`;
        }

        if (craftedEl) {
            const rows = (meta.market.craftedItems || []).slice(-6).reverse();
            craftedEl.innerHTML = rows.length
                ? rows.map(item => `<div>• ${escapeHtml(item.name || 'item')}</div>`).join('')
                : '<div class="sebus-mission-meta">Brak przedmiotów w ekwipunku.</div>';
        }
    }

    function initBaksyLeagueIfNeeded() {
        initAdvancedLeaguePanelIfNeeded();
        initAdvancedMarketPanelIfNeeded();
    }

    function syncBaksyLeagueUi() {
        processKingForumIncome();
        captureLeagueWealthHistory();

        const leaguePanel = document.getElementById('sebus-league-panel-adv');
        if (leaguePanel && leaguePanel.style.display !== 'none') {
            syncAdvancedLeaguePanelUi(leaguePanel);
        }

        const marketPanel = document.getElementById('sebus-market-panel-adv');
        if (marketPanel && marketPanel.style.display !== 'none') {
            syncAdvancedMarketPanelUi(marketPanel);
        }
    }

    function initBaksyGamesIfNeeded() {
        const shouldShowGamesMenu = !!appSettings.features.gamesMenu
            || !!appSettings.features.miniGames
            || !!appSettings.features.hazard
            || !!appSettings.features.missions
            || !!appSettings.features.ranking
            || !!appSettings.features.mmoChat;

        const existingBtn = document.getElementById('sebus-baksy-games-open');
        if (existingBtn) {
            const visible = shouldShowGamesMenu;
            existingBtn.style.display = visible ? '' : 'none';
            return;
        }

        const openBtn = document.createElement('button');
        openBtn.id = 'sebus-baksy-games-open';
        openBtn.type = 'button';
        openBtn.textContent = '🎮 Menu Gier';
        openBtn.style.display = shouldShowGamesMenu ? '' : 'none';
        document.body.appendChild(openBtn);

        openBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const navMenu = initMainGamesNavigationIfNeeded();
            navMenu.style.display = navMenu.style.display === 'block' ? 'none' : 'block';
        });
    }

    function syncBaksyGamesUi() {
        const bossPanel = document.getElementById('sebus-worldboss-panel-adv');
        if (bossPanel && bossPanel.style.display !== 'none') {
            syncWorldBossAdvancedUI(bossPanel);
        }
    }

    function initAdvancedWorldBossPanelIfNeeded() {
        const existing = document.getElementById('sebus-worldboss-panel-adv');
        if (existing) return existing;

        const panel = document.createElement('div');
        panel.id = 'sebus-worldboss-panel-adv';
        panel.className = 'sebus-hub-container';
        panel.style.cssText = 'position:fixed;left:100px;bottom:100px;width:440px;max-height:86vh;overflow:auto;display:none;z-index:2147483647;border-radius:14px;background:linear-gradient(180deg, rgba(27,23,17,.98), rgba(10,10,10,.98));border:1px solid rgba(217, 168, 60, 0.75);';

        panel.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid rgba(255,214,110,.23);">
                <button id="sebus-boss-back-btn" class="sebus-mmo-btn" style="width:80px;height:28px;font-size:10px;padding:0;" type="button">← Wróć</button>
                <div class="sebus-baksy-hub-title" style="flex:1;text-align:center;margin:0;">⚔️ World Boss</div>
            </div>

            <!-- Boss info -->
            <div class="sebus-mission-item" style="margin-bottom:8px;">
                <div style="font-size:12px;font-weight:800;color:#ffd66e;margin-bottom:4px;" id="sebus-boss-adv-name">⚔️ Duch MPC</div>
                <div style="display:flex;gap:12px;flex-wrap:wrap;font-size:10px;">
                    <span>❤️ HP: <strong id="sebus-boss-adv-hp">0</strong> / <strong id="sebus-boss-adv-maxhp">0</strong></span>
                    <span>⚔️ Twoje DMG: <strong id="sebus-boss-adv-mydmg">0</strong></span>
                    <span>💢 Łączne DMG: <strong id="sebus-boss-adv-totaldmg">0</strong></span>
                </div>
                <div style="font-size:10px;margin-top:4px;color:#aaa;">⏰ Reset: <span id="sebus-boss-adv-nextreset">—</span></div>
            </div>

            <!-- HP Bar -->
            <div style="width:100%;height:22px;background:#2a1a1a;border-radius:6px;overflow:hidden;margin-bottom:10px;border:1px solid rgba(255,80,80,.3);">
                <div id="sebus-boss-adv-hpbar-fill" style="height:100%;background:linear-gradient(90deg,#ff6b35,#ff0000);transition:width 0.4s;display:flex;align-items:center;justify-content:center;">
                    <span id="sebus-boss-adv-hpbar-pct" style="font-size:9px;font-weight:700;color:#fff;text-shadow:0 0 4px #000;"></span>
                </div>
            </div>

            <!-- Atak -->
            <div style="background:rgba(255,200,50,.07);border:1px solid rgba(255,214,110,.2);border-radius:8px;padding:10px;margin-bottom:10px;">
                <div style="font-size:10px;color:#d8d8d8;margin-bottom:6px;">
                    💵 Twoje Baksy: <strong id="sebus-boss-adv-balance">0</strong>
                    &nbsp;|&nbsp; Koszt ataku: <strong>100 DMG = 100 💵</strong>
                </div>
                <div style="display:flex;gap:6px;flex-wrap:wrap;">
                    <button id="sebus-boss-adv-attack-100" class="sebus-mmo-btn" type="button" style="flex:1;min-width:80px;font-size:10px;">💥 100 DMG<br><span style="font-size:9px;opacity:.7;">-100 💵</span></button>
                    <button id="sebus-boss-adv-attack-500" class="sebus-mmo-btn" type="button" style="flex:1;min-width:80px;font-size:10px;">⚔️ 500 DMG<br><span style="font-size:9px;opacity:.7;">-500 💵</span></button>
                    <button id="sebus-boss-adv-attack-1000" class="sebus-mmo-btn" type="button" style="flex:1;min-width:80px;font-size:10px;">🔥 1000 DMG<br><span style="font-size:9px;opacity:.7;">-1000 💵</span></button>
                </div>
                <div id="sebus-boss-adv-feedback" style="margin-top:8px;font-size:10px;min-height:14px;color:#ffd66e;"></div>
            </div>

            <!-- Ranking bieżącej doby -->
            <div style="margin-bottom:10px;">
                <div style="font-size:10px;font-weight:700;color:#ffd66e;margin-bottom:6px;">🏆 Ranking — aktualna doba</div>
                <div id="sebus-boss-adv-ranking-current" style="font-size:9px;max-height:160px;overflow-y:auto;background:rgba(0,0,0,.3);border:1px solid rgba(255,214,110,.12);border-radius:6px;padding:6px;">
                    <div style="color:#888;text-align:center;">Brak danych</div>
                </div>
            </div>

            <!-- Ranking poprzedniej doby -->
            <div>
                <div style="font-size:10px;font-weight:700;color:#a0a0a0;margin-bottom:6px;">📜 Poprzednia doba — <span id="sebus-boss-adv-lastreset-reason">—</span></div>
                <div id="sebus-boss-adv-ranking-last" style="font-size:9px;max-height:140px;overflow-y:auto;background:rgba(0,0,0,.25);border:1px solid rgba(100,100,100,.2);border-radius:6px;padding:6px;">
                    <div style="color:#888;text-align:center;">Brak danych</div>
                </div>
            </div>
        `;

        document.body.appendChild(panel);

        panel.querySelector('#sebus-boss-back-btn').addEventListener('click', () => {
            panel.style.display = 'none';
        });

        const handleAttack = (dmg) => {
            const result = attackWorldBoss(dmg);
            const feedback = panel.querySelector('#sebus-boss-adv-feedback');
            if (feedback) {
                feedback.style.color = result.ok ? '#7fff7f' : '#ff6b6b';
                feedback.textContent = result.message || (result.ok ? '✅ Atak udany!' : '❌ Błąd.');
            }
            syncWorldBossAdvancedUI(panel);
        };

        panel.querySelector('#sebus-boss-adv-attack-100').addEventListener('click', () => handleAttack(100));
        panel.querySelector('#sebus-boss-adv-attack-500').addEventListener('click', () => handleAttack(500));
        panel.querySelector('#sebus-boss-adv-attack-1000').addEventListener('click', () => handleAttack(1000));

        return panel;
    }

    function syncWorldBossAdvancedUI(panel) {
        if (!panel) return;

        // Sprawdź reset przed odświeżeniem UI
        checkBossResetIfNeeded();

        const myUserId = getRuntimeUserId();
        const account = getBaksyAccount(myUserId);
        const balance = Number(account?.balance || 0);
        const maxHp = Number(worldBossState.maxHp || 0);
        const currentHp = Number(worldBossState.currentHp || 0);
        const totalDmg = Number(worldBossState.totalDamage || 0);
        const contributors = /** @type {any} */ (worldBossState.dailyContributors || {});
        const myDmg = Number(contributors[myUserId] || 0);
        const hpPercent = maxHp > 0 ? Math.max(0, Math.min(100, (currentHp / maxHp) * 100)) : 0;

        // HP values
        const hpEl = panel.querySelector('#sebus-boss-adv-hp');
        const maxHpEl = panel.querySelector('#sebus-boss-adv-maxhp');
        const myDmgEl = panel.querySelector('#sebus-boss-adv-mydmg');
        const totalDmgEl = panel.querySelector('#sebus-boss-adv-totaldmg');
        const hpBarEl = /** @type {HTMLElement|null} */ (panel.querySelector('#sebus-boss-adv-hpbar-fill'));
        const hpPctEl = panel.querySelector('#sebus-boss-adv-hpbar-pct');
        const balanceEl = panel.querySelector('#sebus-boss-adv-balance');
        const nameEl = panel.querySelector('#sebus-boss-adv-name');
        const nextResetEl = panel.querySelector('#sebus-boss-adv-nextreset');

        if (hpEl) hpEl.textContent = currentHp.toLocaleString('pl-PL');
        if (maxHpEl) maxHpEl.textContent = maxHp.toLocaleString('pl-PL');
        if (myDmgEl) myDmgEl.textContent = myDmg.toLocaleString('pl-PL');
        if (totalDmgEl) totalDmgEl.textContent = totalDmg.toLocaleString('pl-PL');
        if (balanceEl) balanceEl.textContent = balance.toLocaleString('pl-PL') + ' 💵';
        if (nameEl) nameEl.textContent = '⚔️ ' + (worldBossState.name || 'Duch MPC');
        if (hpBarEl) {
            hpBarEl.style.width = `${hpPercent}%`;
            const color = hpPercent > 50 ? 'linear-gradient(90deg,#4caf50,#8bc34a)' : hpPercent > 20 ? 'linear-gradient(90deg,#ff9800,#ff5722)' : 'linear-gradient(90deg,#ff3d00,#d50000)';
            hpBarEl.style.background = color;
        }
        if (hpPctEl) hpPctEl.textContent = `${Math.round(hpPercent)}%`;

        // Następny reset
        if (nextResetEl) {
            const now = new Date();
            const nextNoon = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0, 0);
            const nextMidnight = new Date(now.getFullYear(), now.getMonth() + (now.getHours() >= 0 ? 1 : 0), now.getDate() + (now.getHours() >= 0 ? 1 : 0), 0, 0, 0, 0);
            if (now < nextNoon) {
                const diff = Math.floor((nextNoon.getTime() - now.getTime()) / 1000);
                const h = Math.floor(diff / 3600), m = Math.floor((diff % 3600) / 60);
                nextResetEl.textContent = `Południe za ${h}h ${m}m`;
            } else {
                const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
                const diff = Math.floor((tomorrow.getTime() - now.getTime()) / 1000);
                const h = Math.floor(diff / 3600), m = Math.floor((diff % 3600) / 60);
                nextResetEl.textContent = `Północ za ${h}h ${m}m`;
            }
        }

        // Ranking bieżącej doby
        const currentRankingEl = panel.querySelector('#sebus-boss-adv-ranking-current');
        if (currentRankingEl) {
            const currentEntries = Object.entries(contributors)
                .map(([uid, dmg]) => ({ userId: String(uid), displayName: resolveRankingDisplayName(uid, String(uid)), damage: Number(dmg || 0) }))
                .filter(r => r.damage > 0)
                .sort((a, b) => b.damage - a.damage);

            if (!currentEntries.length) {
                currentRankingEl.innerHTML = '<div style="color:#888;text-align:center;padding:6px;">Brak ataków w tej dobie</div>';
            } else {
                const medals = ['🥇', '🥈', '🥉'];
                currentRankingEl.innerHTML = currentEntries.slice(0, 20).map((r, i) => {
                    const isMe = r.userId === myUserId;
                    return `<div style="display:flex;justify-content:space-between;align-items:center;padding:3px 4px;border-radius:4px;margin-bottom:2px;background:${isMe ? 'rgba(255,214,110,.12)' : 'transparent'};">
                        <span style="color:${isMe ? '#ffd66e' : '#ccc'}">${medals[i] || `#${i+1}`} ${escapeHtml(r.displayName)}${isMe ? ' (Ty)' : ''}</span>
                        <span style="font-weight:700;color:${i === 0 ? '#ffd66e' : '#aaa'}">⚔️ ${r.damage.toLocaleString('pl-PL')}</span>
                    </div>`;
                }).join('');
            }
        }

        // Ranking poprzedniej doby
        const lastRankingEl = panel.querySelector('#sebus-boss-adv-ranking-last');
        const lastReasonEl = panel.querySelector('#sebus-boss-adv-lastreset-reason');
        const lastRanking = Array.isArray(worldBossState.lastDayRanking) ? worldBossState.lastDayRanking : [];

        if (lastReasonEl) lastReasonEl.textContent = worldBossState.lastResetReason || '—';
        if (lastRankingEl) {
            if (!lastRanking.length) {
                lastRankingEl.innerHTML = '<div style="color:#666;text-align:center;padding:6px;">Brak danych z poprzedniej doby</div>';
            } else {
                const medals = ['🥇', '🥈', '🥉'];
                lastRankingEl.innerHTML = lastRanking.slice(0, 20).map((r, i) => {
                    const isMe = String(r.userId) === myUserId;
                    const isWinner = i === 0;
                    return `<div style="display:flex;justify-content:space-between;align-items:center;padding:3px 4px;border-radius:4px;margin-bottom:2px;background:${isWinner ? 'rgba(255,180,0,.1)' : 'transparent'};">
                        <span style="color:${isMe ? '#ffd66e' : '#999'}">${medals[i] || `#${i+1}`} ${escapeHtml(String(r.displayName || r.userId))}${isMe ? ' (Ty)' : ''}${isWinner ? ' 🏆' : ''}</span>
                        <span style="color:${isWinner ? '#ffd66e' : '#777'}">⚔️ ${Number(r.damage || 0).toLocaleString('pl-PL')}</span>
                    </div>`;
                }).join('');
            }
        }
    }

    function initAdvancedGuildPanelIfNeeded() {
        const existing = document.getElementById('sebus-guild-panel-adv');
        if (existing) return existing;

        const panel = document.createElement('div');
        panel.id = 'sebus-guild-panel-adv';
        panel.className = 'sebus-hub-container';
        panel.style.cssText = 'position:fixed;left:100px;bottom:100px;width:420px;max-height:80vh;overflow:auto;display:none;z-index:2147483647;border-radius:14px;background:linear-gradient(180deg, rgba(27,23,17,.98), rgba(10,10,10,.98));border:1px solid rgba(217, 168, 60, 0.75);';
        
        panel.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid rgba(255,214,110,.23);">
                <button id="sebus-guild-back-btn" class="sebus-mmo-btn" style="width:80px;height:28px;font-size:10px;padding:0;" type="button">← Wróć</button>
                <div class="sebus-baksy-hub-title" style="flex:1;text-align:center;margin:0;">🏰 Panel Gildii</div>
            </div>

            <!-- MENU STARTOWE - Wybór między załóż a dołącz -->
            <div id="sebus-guild-start-menu" style="display:none;">
                <h4 style="color:#ffe8b7;text-align:center;margin:15px 0;">Nie należysz do żadnej gildii</h4>
                <button id="sebus-guild-create-btn" class="sebus-mmo-btn" style="width:100%;height:40px;margin-bottom:10px;font-size:11px;" type="button">🏗️ Załóż nową gildię</button>
                <button id="sebus-guild-browse-btn" class="sebus-mmo-btn" style="width:100%;height:40px;font-size:11px;" type="button">🔍 Dołącz do gildii</button>
            </div>

            <!-- CREATE GUILD FORM -->
            <div id="sebus-guild-create-form" style="display:none;">
                <h4 class="sebus-hub-title">🏗️ Załóż gildię</h4>
                <input id="sebus-guild-create-name" type="text" placeholder="Nazwa gildii" maxlength="50" style="width:100%;height:28px;border:1px solid #666;border-radius:5px;background:#111;color:#ffd700;padding:0 6px;margin-top:8px;box-sizing:border-box;font-size:10px;">
                <textarea id="sebus-guild-create-desc" placeholder="Opis gildii (opcjonalnie)" maxlength="200" style="width:100%;height:50px;border:1px solid #666;border-radius:5px;background:#111;color:#ffd700;padding:6px;margin-top:6px;box-sizing:border-box;font-size:10px;resize:none;"></textarea>
                <button id="sebus-guild-create-submit-btn" class="sebus-mmo-btn" style="width:100%;margin-top:8px;height:28px;font-size:10px;" type="button">✅ Utwórz gildię</button>
                <button id="sebus-guild-create-back-btn" class="sebus-mmo-btn" style="width:100%;margin-top:6px;height:28px;font-size:10px;background:rgba(200,100,100,.3);" type="button">← Wróć</button>
                <div id="sebus-guild-create-feedback" style="margin-top:8px;font-size:10px;min-height:12px;"></div>
            </div>

            <!-- BROWSE GUILDS -->
            <div id="sebus-guild-browse-list" style="display:none;">
                <h4 class="sebus-hub-title">🔍 Dostępne gildie</h4>
                <div id="sebus-guild-browse-items" style="font-size:9px;margin:8px 0;max-height:300px;overflow-y:auto;border:1px solid rgba(255,214,110,.12);border-radius:6px;padding:6px;background:rgba(0,0,0,.3);"></div>
                <button id="sebus-guild-browse-back-btn" class="sebus-mmo-btn" style="width:100%;margin-top:8px;height:28px;font-size:10px;background:rgba(200,100,100,.3);" type="button">← Wróć</button>
            </div>

            <!-- Main Menu - dla zalogowanego w gildii -->
            <div id="sebus-guild-main-menu" style="display:none;grid-template-columns:1fr 1fr;gap:8px;">
                <button id="sebus-guild-tab-kwatera" class="sebus-mmo-btn" style="height:60px;flex-direction:column;display:flex;align-items:center;justify-content:center;" type="button">🏠<div style="font-size:9px;">Kwatera</div></button>
                <button id="sebus-guild-tab-chat" class="sebus-mmo-btn" style="height:60px;flex-direction:column;display:flex;align-items:center;justify-content:center;" type="button">💬<div style="font-size:9px;">Czat</div></button>
                <button id="sebus-guild-tab-treasury" class="sebus-mmo-btn" style="height:60px;flex-direction:column;display:flex;align-items:center;justify-content:center;" type="button">💰<div style="font-size:9px;">Skarbiec</div></button>
                <button id="sebus-guild-tab-conquest" class="sebus-mmo-btn" style="height:60px;flex-direction:column;display:flex;align-items:center;justify-content:center;" type="button">⚔️<div style="font-size:9px;">Podbój</div></button>
            </div>

            <!-- KWATERA TAB -->
            <div id="sebus-guild-kwatera" style="display:none;">
                <h4 class="sebus-hub-title" style="margin-top:10px;">🏠 Kwatera Główna</h4>
                <div id="sebus-guild-members-list" style="font-size:10px;margin:8px 0;max-height:200px;overflow-y:auto;border:1px solid rgba(255,214,110,.12);border-radius:6px;padding:6px;"></div>
                <input id="sebus-guild-invite-id" type="text" placeholder="ID gracza do zaproszenia" style="width:100%;height:28px;border:1px solid #666;border-radius:5px;background:#111;color:#ffd700;padding:0 6px;margin-top:8px;box-sizing:border-box;">
                <button id="sebus-guild-invite-btn" class="sebus-mmo-btn" style="width:100%;margin-top:6px;height:28px;" type="button">📧 Zaproś gracza</button>
                <button id="sebus-guild-leave-btn" class="sebus-mmo-btn" style="width:100%;margin-top:6px;height:28px;background:rgba(200,100,100,.3);" type="button">🚪 Opuść gildię</button>
                <div id="sebus-guild-kwatera-feedback" style="margin-top:6px;font-size:10px;min-height:12px;"></div>
            </div>

            <!-- CZAT TAB -->
            <div id="sebus-guild-chat" style="display:none;">
                <h4 class="sebus-hub-title" style="margin-top:10px;">💬 Czat Gildii</h4>
                <div id="sebus-guild-chat-messages" style="font-size:9px;margin:8px 0;max-height:220px;overflow-y:auto;border:1px solid rgba(255,214,110,.12);border-radius:6px;padding:6px;background:rgba(0,0,0,.3);"></div>
                <textarea id="sebus-guild-chat-input" placeholder="Wiadomość dla gildii..." style="width:100%;height:50px;border:1px solid #666;border-radius:5px;background:#111;color:#ffd700;padding:6px;margin-top:6px;box-sizing:border-box;font-size:10px;resize:none;"></textarea>
                <button id="sebus-guild-chat-send-btn" class="sebus-mmo-btn" style="width:100%;margin-top:6px;height:28px;" type="button">Wyślij</button>
            </div>

            <!-- SKARBIEC TAB -->
            <div id="sebus-guild-treasury" style="display:none;">
                <h4 class="sebus-hub-title" style="margin-top:10px;">💰 Skarbiec Gildii</h4>
                <div class="sebus-mission-item">
                    <div>Stan: <strong id="sebus-guild-treasury-balance">0</strong> 💵</div>
                    <div class="sebus-mission-meta">Aktywne Bufby: <span id="sebus-guild-active-buffs">brak</span></div>
                </div>
                <input id="sebus-guild-deposit-amount" type="number" min="1" step="1" placeholder="Wpłata baksy" style="width:100%;height:28px;border:1px solid #666;border-radius:5px;background:#111;color:#ffd700;padding:0 6px;margin-top:8px;box-sizing:border-box;">
                <button id="sebus-guild-deposit-btn" class="sebus-mmo-btn" style="width:100%;margin-top:6px;height:28px;" type="button">💸 Wpłać</button>
                
                <h5 style="color:#ffe8b7;font-size:11px;margin-top:12px;">⚡ Dostępne Bufby:</h5>
                <button id="sebus-guild-buff-dmg" class="sebus-mmo-btn" style="width:100%;margin-top:6px;height:28px;font-size:9px;" type="button">⚔️ +20% DMG ($200)</button>
                <button id="sebus-guild-buff-def" class="sebus-mmo-btn" style="width:100%;margin-top:4px;height:28px;font-size:9px;" type="button">🛡️ +15% DEF ($150)</button>
                <button id="sebus-guild-buff-luck" class="sebus-mmo-btn" style="width:100%;margin-top:4px;height:28px;font-size:9px;" type="button">🍀 +10% Luck ($100)</button>
                <div id="sebus-guild-treasury-feedback" style="margin-top:6px;font-size:10px;min-height:12px;"></div>
            </div>

            <!-- PODBÓJ TAB -->
            <div id="sebus-guild-conquest" style="display:none;">
                <h4 class="sebus-hub-title" style="margin-top:10px;">⚔️ Mapa Podboju</h4>
                <div id="sebus-guild-conquest-map" style="font-size:9px;"></div>
                <div id="sebus-guild-conquest-feedback" style="margin-top:6px;font-size:10px;min-height:12px;"></div>
            </div>
        `;

        document.body.appendChild(panel);

        // Tab switching
        const tabs = {
            'kwatera': document.getElementById('sebus-guild-kwatera'),
            'chat': document.getElementById('sebus-guild-chat'),
            'treasury': document.getElementById('sebus-guild-treasury'),
            'conquest': document.getElementById('sebus-guild-conquest')
        };

        const switchTab = (tabName) => {
            Object.values(tabs).forEach(t => t.style.display = 'none');
            tabs[tabName].style.display = 'block';
        };

        panel.querySelector('#sebus-guild-tab-kwatera').addEventListener('click', () => {
            switchTab('kwatera');
            syncGuildKwateraUI();
        });

        panel.querySelector('#sebus-guild-tab-chat').addEventListener('click', () => {
            switchTab('chat');
            syncGuildChatUI();
        });

        panel.querySelector('#sebus-guild-tab-treasury').addEventListener('click', () => {
            switchTab('treasury');
            syncGuildTreasuryUI();
        });

        panel.querySelector('#sebus-guild-tab-conquest').addEventListener('click', () => {
            switchTab('conquest');
            syncGuildConquestUI();
        });

        // Back button
        panel.querySelector('#sebus-guild-back-btn').addEventListener('click', () => {
            panel.style.display = 'none';
        });

        // Kwatera actions
        panel.querySelector('#sebus-guild-invite-btn').addEventListener('click', () => {
            const targetId = panel.querySelector('#sebus-guild-invite-id').value.trim();
            const userId = getRuntimeUserId();
            const result = inviteToGuild(targetId, userId);
            panel.querySelector('#sebus-guild-kwatera-feedback').textContent = result.message;
            if (result.ok) panel.querySelector('#sebus-guild-invite-id').value = '';
            syncGuildKwateraUI();
        });

        // Chat actions - direct listener na przycisk
        const chatSendBtn = panel.querySelector('#sebus-guild-chat-send-btn');
        if (chatSendBtn) {
            chatSendBtn.addEventListener('click', function sendChatHandler(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('[Guild Chat] Send button clicked directly on button');
                try {
                    const inputEl = panel.querySelector('#sebus-guild-chat-input');
                    if (!inputEl) {
                        console.log('[Guild Chat] Input element not found');
                        return;
                    }
                    const msg = inputEl.value ? inputEl.value.trim() : '';
                    console.log('[Guild Chat] Message value:', msg);
                    if (!msg) {
                        console.log('[Guild Chat] Message is empty');
                        return;
                    }
                    const userId = getRuntimeUserId();
                    console.log('[Guild Chat] Sending message as userId:', userId);
                    const result = addGuildChatMessage(userId, msg);
                    console.log('[Guild Chat] Result:', result);
                    if (result && result.ok) {
                        inputEl.value = '';
                        syncGuildChatUI();
                        console.log('[Guild Chat] Message sent successfully');
                    }
                } catch (err) {
                    console.error('[Guild Chat] Error sending message:', err);
                }
                return false;
            });
            console.log('[Guild Chat] Direct event listener attached to send button');
        } else {
            console.log('[Guild Chat WARNING] Send button element not found during init');
        }

        // Chat actions - fallback delegacja na body dla niezawodności
        document.addEventListener('click', function(e) {
            const target = e.target;
            if (!target) return;
            
            const btn = target.id === 'sebus-guild-chat-send-btn' ? target : target.closest('#sebus-guild-chat-send-btn');
            if (!btn) return;
            
            e.preventDefault();
            e.stopPropagation();
            console.log('[Guild Chat] Send button clicked via delegation fallback', btn);
            try {
                const panelDiv = document.getElementById('sebus-guild-panel-adv');
                if (!panelDiv) {
                    console.log('[Guild Chat] Panel not found');
                    return;
                }
                const inputEl = panelDiv.querySelector('#sebus-guild-chat-input');
                if (!inputEl) {
                    console.log('[Guild Chat] Input element not found');
                    return;
                }
                const msg = inputEl.value ? inputEl.value.trim() : '';
                console.log('[Guild Chat] Message value:', msg);
                if (!msg) {
                    console.log('[Guild Chat] Message is empty');
                    return;
                }
                const userId = getRuntimeUserId();
                console.log('[Guild Chat] Sending as userId:', userId);
                const result = addGuildChatMessage(userId, msg);
                console.log('[Guild Chat] Result:', result);
                if (result && result.ok) {
                    inputEl.value = '';
                    syncGuildChatUI();
                    console.log('[Guild Chat] Message sent and UI updated');
                }
            } catch (e) {
                console.error('[Guild Chat] Send error:', e);
            }
            return false;
        }, true);

        // Treasury actions
        panel.querySelector('#sebus-guild-deposit-btn').addEventListener('click', () => {
            const amount = Number(panel.querySelector('#sebus-guild-deposit-amount').value || 0);
            const userId = getRuntimeUserId();
            if (amount < 1) {
                panel.querySelector('#sebus-guild-treasury-feedback').textContent = '❌ Minimum 1 baks!';
                return;
            }
            const result = depositToGuildTreasury(amount, userId);
            panel.querySelector('#sebus-guild-treasury-feedback').textContent = result.message;
            if (result.ok) panel.querySelector('#sebus-guild-deposit-amount').value = '';
            syncGuildTreasuryUI();
        });

        ['#sebus-guild-buff-dmg', '#sebus-guild-buff-def', '#sebus-guild-buff-luck'].forEach((selector, idx) => {
            const buffTypes = ['damage+20%', 'defense+15%', 'luck+10%'];
            panel.querySelector(selector).addEventListener('click', () => {
                const userId = getRuntimeUserId();
                const result = activateGuildBuff(buffTypes[idx], userId);
                panel.querySelector('#sebus-guild-treasury-feedback').textContent = result.message;
                syncGuildTreasuryUI();
            });
        });

        // Leave guild button
        panel.querySelector('#sebus-guild-leave-btn').addEventListener('click', () => {
            const userId = getRuntimeUserId();
            const result = leaveGuild(userId);
            panel.querySelector('#sebus-guild-kwatera-feedback').textContent = result.message;
            if (result.ok) {
                setTimeout(() => syncGuildMenuUI(panel), 500);
            }
        });

        // CREATE GUILD FORM
        panel.querySelector('#sebus-guild-create-btn').addEventListener('click', () => {
            panel.querySelector('#sebus-guild-start-menu').style.display = 'none';
            panel.querySelector('#sebus-guild-create-form').style.display = 'block';
        });

        panel.querySelector('#sebus-guild-create-back-btn').addEventListener('click', () => {
            panel.querySelector('#sebus-guild-create-form').style.display = 'none';
            panel.querySelector('#sebus-guild-start-menu').style.display = 'block';
        });

        panel.querySelector('#sebus-guild-create-submit-btn').addEventListener('click', () => {
            const userId = getRuntimeUserId();
            const name = (panel.querySelector('#sebus-guild-create-name').value || '').trim();
            const desc = (panel.querySelector('#sebus-guild-create-desc').value || '').trim();
            const result = createGuild(userId, name, desc);
            panel.querySelector('#sebus-guild-create-feedback').textContent = result.message;
            if (result.ok) {
                setTimeout(() => {
                    panel.querySelector('#sebus-guild-create-form').style.display = 'none';
                    panel.querySelector('#sebus-guild-create-name').value = '';
                    panel.querySelector('#sebus-guild-create-desc').value = '';
                    syncGuildMenuUI(panel);
                }, 500);
            }
        });

        // BROWSE GUILDS
        panel.querySelector('#sebus-guild-browse-btn').addEventListener('click', () => {
            panel.querySelector('#sebus-guild-start-menu').style.display = 'none';
            // Force pull shared MMO state to ensure we see latest guilds
            pullSharedMmoStateIfNeeded(true);
            // Give it a moment to load, then sync UI
            setTimeout(() => {
                syncGuildBrowseUI(panel);
                panel.querySelector('#sebus-guild-browse-list').style.display = 'block';
            }, 300);
        });

        panel.querySelector('#sebus-guild-browse-back-btn').addEventListener('click', () => {
            panel.querySelector('#sebus-guild-browse-list').style.display = 'none';
            panel.querySelector('#sebus-guild-start-menu').style.display = 'block';
        });

        return panel;
    }

    function syncGuildMenuUI(panel) {
        const userId = getRuntimeUserId();
        const guildId = getUserGuildId(userId);
        
        const startMenu = panel.querySelector('#sebus-guild-start-menu');
        const mainMenu = panel.querySelector('#sebus-guild-main-menu');
        const createForm = panel.querySelector('#sebus-guild-create-form');
        const browseList = panel.querySelector('#sebus-guild-browse-list');
        const allContent = [startMenu, mainMenu, createForm, browseList].filter(x => x);
        
        // Hide all
        allContent.forEach(el => el.style.display = 'none');
        
        if (!guildId) {
            // User doesn't have a guild - show start menu
            startMenu.style.display = 'block';
        } else {
            // User has a guild - show main menu
            mainMenu.style.display = 'grid';
            syncGuildKwateraUI();
        }
    }

    function syncGuildBrowseUI(panel) {
        const userId = getRuntimeUserId();
        const guilds = guildWarsState.guilds || {};
        const browseItems = panel.querySelector('#sebus-guild-browse-items');
        
        const availableGuilds = Object.entries(guilds).filter(([guildId, guild]) => {
            return guild && !guild.members.some(m => m.userId === userId);
        });
        
        if (availableGuilds.length === 0) {
            browseItems.innerHTML = '<div style="color:#ff9999;padding:10px;">Brak dostępnych gildii do dołączenia</div>';
            return;
        }
        
        browseItems.innerHTML = availableGuilds.map(([guildId, guild]) => {
            const leader = guild.leader || 'Nieznany';
            const members = (guild.members || []).length;
            return `
                <div style="border:1px solid rgba(255,214,110,.2);border-radius:4px;padding:8px;margin-bottom:6px;background:rgba(0,0,0,.2);">
                    <div style="color:#ffd700;font-weight:bold;margin-bottom:4px;">${guild.name || 'Brak nazwy'}</div>
                    <div style="font-size:8px;color:#ccc;margin-bottom:4px;">Wódz: #${leader} | Członków: ${members}</div>
                    ${guild.description ? `<div style="font-size:9px;color:#ddd;margin-bottom:6px;font-style:italic;">"${guild.description}"</div>` : ''}
                    <button class="sebus-mmo-btn sebus-guild-join-btn" data-guild-id="${guildId}" style="width:100%;height:24px;font-size:9px;" type="button">✅ Dołącz</button>
                </div>
            `;
        }).join('');
        
        // Attach click handlers to join buttons
        browseItems.querySelectorAll('.sebus-guild-join-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const guildId = btn.getAttribute('data-guild-id');
                const userId = getRuntimeUserId();
                const result = joinGuild(userId, guildId);
                sebusUiAlert('Gildia', result.message, result.ok ? 'success' : 'error');
                if (result.ok) {
                    setTimeout(() => syncGuildMenuUI(panel), 500);
                }
            });
        });
    }

    function syncGuildKwateraUI() {
        const userId = getRuntimeUserId();
        const guildId = getUserGuildId(userId);
        const listEl = document.querySelector('#sebus-guild-members-list');
        if (!listEl || !guildId) return;

        const guild = guildWarsState.guilds[guildId];
        if (!guild || !guild.members) {
            listEl.innerHTML = '<div style="color:#ff9999;">-BRAK GILDII-</div>';
            return;
        }

        listEl.innerHTML = guild.members.map((m) => {
            const status = (nowTs() - m.lastSeen) < (5 * 60 * 1000) ? '🟢 Online' : '🔴 Offline';
            return `<div style="padding:4px;border-bottom:1px dashed rgba(255,214,110,.2);">#${m.userId} <strong>${m.rank}</strong> ${status}</div>`;
        }).join('');
    }

    function syncGuildChatUI() {
        const userId = getRuntimeUserId();
        const guildId = getUserGuildId(userId);
        const msgEl = document.querySelector('#sebus-guild-chat-messages');
        if (!msgEl || !guildId) return;

        const guild = guildWarsState.guilds[guildId];
        if (!guild || !guild.chat) {
            msgEl.innerHTML = '<div style="color:#ff9999;">-BRAK GILDII-</div>';
            return;
        }

        msgEl.innerHTML = (guild.chat || []).slice(-15).map((msg) => {
            const time = new Date(msg.at).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
            return `<div style="padding:3px;border-bottom:1px dashed rgba(255,214,110,.1);"><strong>#${msg.userId}</strong> [${time}]: ${escapeHtml(msg.message)}</div>`;
        }).join('');
    }

    function syncGuildTreasuryUI() {
        const userId = getRuntimeUserId();
        const guildId = getUserGuildId(userId);
        const balEl = document.querySelector('#sebus-guild-treasury-balance');
        const bufEl = document.querySelector('#sebus-guild-active-buffs');
        
        if (!guildId) {
            if (balEl) balEl.textContent = '0';
            if (bufEl) bufEl.textContent = 'brak';
            return;
        }
        
        const guild = guildWarsState.guilds[guildId];
        if (!guild) return;
        
        if (balEl) balEl.textContent = (guild.treasury || 0).toLocaleString();
        if (bufEl) {
            const activeBufNames = Object.keys(guild.buffs || {}).filter((key) => {
                return (guild.buffs[key].endsAt || 0) > nowTs();
            });
            bufEl.textContent = activeBufNames.length > 0 ? activeBufNames.join(', ') : 'brak';
        }
    }

    function syncGuildConquestUI() {
        const userId = getRuntimeUserId();
        const guildId = getUserGuildId(userId);
        const mapEl = document.querySelector('#sebus-guild-conquest-map');
        if (!mapEl || !guildId) return;

        const guild = guildWarsState.guilds[guildId];
        // Safe check for guild state
        if (!guild || !guild.dominationBar || typeof guild.dominationBar !== 'object') {
            mapEl.innerHTML = '<div style="padding:12px;text-align:center;color:#ff9999;">-BRAK GILDII-</div>';
            return;
        }

        mapEl.innerHTML = (guildWarsState.forumSections || []).map((section) => {
            const domPercent = Number(guild.dominationBar[section] || 0);
            const controlled = guild.controlledSections && guild.controlledSections[section] ? '✅ KONTROLOWANA' : '⚔️ Walka';
            return `<div style="margin:6px 0;">
                <div style="display:flex;justify-content:space-between;font-size:9px;margin-bottom:2px;">
                    <span>${section} ${controlled}</span>
                    <span>${domPercent}%</span>
                </div>
                <div style="width:100%;height:12px;background:rgba(0,0,0,.5);border-radius:3px;overflow:hidden;">
                    <div style="width:${Math.max(0, Math.min(100, domPercent))}%;height:100%;background:linear-gradient(90deg,#ffd700,#ffaa00);transition:width 0.3s;"></div>
                </div>
            </div>`;
        }).join('');
    }

    function initAdvancedJackpotPanelIfNeeded() {
        const existing = document.getElementById('sebus-jackpot-panel-adv');
        if (existing) return existing;

        const panel = document.createElement('div');
        panel.id = 'sebus-jackpot-panel-adv';
        panel.className = 'sebus-hub-container';
        panel.style.cssText = 'position:fixed;left:100px;bottom:100px;width:420px;max-height:80vh;overflow:auto;display:none;z-index:2147483647;border-radius:14px;background:linear-gradient(180deg, rgba(27,23,17,.98), rgba(10,10,10,.98));border:1px solid rgba(217, 168, 60, 0.75);';
        
        panel.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid rgba(255,214,110,.23);">
                <button id="sebus-jp-back-btn" class="sebus-mmo-btn" style="width:80px;height:28px;font-size:10px;padding:0;" type="button">← Wróć</button>
                <div class="sebus-baksy-hub-title" style="flex:1;text-align:center;margin:0;">🎰 Jackpot</div>
            </div>

            <div style="text-align:center;margin:12px 0;">
                <div style="font-size:28px;font-weight:bold;color:#ffd700;text-shadow:0 0 10px rgba(255,215,0,0.7);" id="sebus-jp-pool-big">0</div>
                <div style="font-size:11px;color:#aaa;">💵 Pula do podziału</div>
            </div>

            <!-- WHEEL -->
            <div style="position:relative;width:200px;height:200px;margin:0 auto 12px;">
                <canvas id="sebus-jp-wheel" width="200" height="200" style="display:block;margin:0 auto;"></canvas>
            </div>

            <button id="sebus-jp-spin-btn" class="sebus-mmo-btn" style="width:100%;height:36px;font-size:13px;font-weight:bold;margin-bottom:8px;" type="button">🎰 LOSUJ! (50 baksy)</button>

            <!-- CONTRIBUTION INPUT -->
            <h5 style="color:#ffe8b7;font-size:11px;margin:12px 0 6px;">📊 Wpłata do puli:</h5>
            <div style="display:flex;gap:4px;margin-bottom:8px;">
                <input id="sebus-jp-amount" type="number" min="1" step="1" placeholder="Baksy" style="flex:1;height:28px;border:1px solid #666;border-radius:5px;background:#111;color:#ffd700;padding:0 6px;box-sizing:border-box;">
                <button id="sebus-jp-contribute-btn" class="sebus-mmo-btn" style="width:80px;height:28px;font-size:10px;padding:0;" type="button">💸 Wpłać</button>
            </div>
            <div id="sebus-jp-contribute-feedback" style="font-size:10px;min-height:12px;"></div>

            <!-- LAST WINNER -->
            <div style="margin-top:12px;padding:8px;background:rgba(255,215,0,0.1);border-left:3px solid #ffd700;border-radius:4px;">
                <div style="font-size:9px;color:#aaa;">🏆 Ostatni Zwycięzca:</div>
                <div id="sebus-jp-last-winner" style="font-size:11px;color:#ffd700;font-weight:bold;margin-top:2px;">#none - 0 baksy</div>
            </div>

            <!-- HISTORY -->
            <h5 style="color:#ffe8b7;font-size:11px;margin:12px 0 6px;">📜 Historia Wygranych:</h5>
            <div id="sebus-jp-history" style="font-size:9px;max-height:150px;overflow-y:auto;border:1px solid rgba(255,214,110,.12);border-radius:6px;padding:6px;"></div>

            <div id="sebus-jp-feedback" style="margin-top:8px;font-size:10px;min-height:12px;color:#ff9999;"></div>
        `;

        document.body.appendChild(panel);

        // Back button
        panel.querySelector('#sebus-jp-back-btn').addEventListener('click', () => {
            panel.style.display = 'none';
        });

        // Contribute button
        panel.querySelector('#sebus-jp-contribute-btn').addEventListener('click', () => {
            const amount = Number(panel.querySelector('#sebus-jp-amount').value || 0);
            if (amount < 1) {
                panel.querySelector('#sebus-jp-contribute-feedback').textContent = '❌ Min 1 baks!';
                return;
            }
            const result = contributeToJackpot(amount);
            panel.querySelector('#sebus-jp-contribute-feedback').textContent = result.message;
            if (result.ok) {
                panel.querySelector('#sebus-jp-amount').value = '';
                syncJackpotAdvancedUI(panel);
            }
        });

        // Spin button
        panel.querySelector('#sebus-jp-spin-btn').addEventListener('click', () => {
            const result = drawJackpot();
            panel.querySelector('#sebus-jp-feedback').textContent = result.message;
            syncJackpotAdvancedUI(panel);
        });

        syncJackpotAdvancedUI(panel);
        drawJackpotWheel();

        return panel;
    }

    function syncJackpotAdvancedUI(panel) {
        const poolEl = panel.querySelector('#sebus-jp-pool-big');
        const winnerEl = panel.querySelector('#sebus-jp-last-winner');
        const historyEl = panel.querySelector('#sebus-jp-history');
        
        if (poolEl) poolEl.textContent = globalJackpotState.poolBalance.toLocaleString();
        
        if (winnerEl) {
            const winner = globalJackpotState.lastWinner || '#none';
            const prize = globalJackpotState.lastWinAmount || 0;
            winnerEl.textContent = `${winner} - ${prize.toLocaleString()} baksy`;
        }

        if (historyEl) {
            historyEl.innerHTML = (globalJackpotState.contributions || []).slice(-10).reverse().map((contrib) => {
                const time = new Date(contrib.at).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
                return `<div style="padding:3px;border-bottom:1px dashed rgba(255,214,110,.1);">
                    #${contrib.userId} wpłacił <strong>${contrib.amount}</strong> baksy [${time}]
                </div>`;
            }).join('');
        }
    }

    function drawJackpotWheel() {
        const canvas = document.getElementById('sebus-jp-wheel');
        if (!canvas || typeof canvas.getContext !== 'function') return;
        
        const ctx = canvas.getContext('2d');
        const centerX = 100;
        const centerY = 100;
        const radius = 95;

        // Draw outer circle
        ctx.fillStyle = 'rgba(255,215,0,0.1)';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();

        // Draw segments
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#a29bfe', '#74b9ff', '#81ecec'];
        const segmentCount = 8;
        const anglePerSegment = (Math.PI * 2) / segmentCount;

        for (let i = 0; i < segmentCount; i++) {
            const startAngle = i * anglePerSegment;
            const endAngle = (i + 1) * anglePerSegment;

            ctx.fillStyle = colors[i];
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.lineTo(centerX, centerY);
            ctx.fill();

            ctx.strokeStyle = 'rgba(0,0,0,0.3)';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // Draw center circle
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 15, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw pointer
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - radius - 15);
        ctx.lineTo(centerX - 8, centerY - radius);
        ctx.lineTo(centerX + 8, centerY - radius);
        ctx.fill();
    }

    function initAdvancedTreasureHuntPanelIfNeeded() {
        const existing = document.getElementById('sebus-treasure-panel-adv');
        if (existing) return existing;

        const panel = document.createElement('div');
        panel.id = 'sebus-treasure-panel-adv';
        panel.className = 'sebus-hub-container';
        panel.style.cssText = 'position:fixed;left:100px;bottom:100px;width:420px;max-height:80vh;overflow:auto;display:none;z-index:2147483647;border-radius:14px;background:linear-gradient(180deg, rgba(27,23,17,.98), rgba(10,10,10,.98));border:1px solid rgba(217, 168, 60, 0.75);';
        
        panel.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid rgba(255,214,110,.23);">
                <button id="sebus-th-back-btn" class="sebus-mmo-btn" style="width:80px;height:28px;font-size:10px;padding:0;" type="button">← Wróć</button>
                <div class="sebus-baksy-hub-title" style="flex:1;text-align:center;margin:0;">🕵️ Łapanka</div>
            </div>

            <!-- STATUS -->
            <div style="text-align:center;margin:12px 0;padding:12px;background:rgba(255,215,0,0.08);border-radius:8px;">
                <div style="font-size:11px;color:#aaa;">Stan Łapanki:</div>
                <div id="sebus-th-status" style="font-size:14px;font-weight:bold;color:#ffd700;margin-top:4px;">⏳ Czekam...</div>
            </div>

            <!-- RADAR -->
            <div style="position:relative;width:200px;height:200px;margin:0 auto 12px;">
                <canvas id="sebus-th-radar" width="200" height="200" style="display:block;border:2px solid #ffd700;border-radius:50%;background:radial-gradient(circle, rgba(30,50,80,.5), rgba(10,10,20,.8));"></canvas>
                <div id="sebus-th-radar-info" style="position:absolute;bottom:8px;left:0;right:0;text-align:center;font-size:9px;color:#ffd700;">Szukasz...</div>
            </div>

            <!-- CLUES -->
            <div style="margin:12px 0;padding:10px;background:rgba(255,215,0,0.1);border-left:3px solid #ffd700;border-radius:4px;">
                <div style="font-size:10px;color:#aaa;margin-bottom:6px;">📌 Wskazówka:</div>
                <div id="sebus-th-clue" style="font-size:11px;color:#ffe8b7;font-weight:500;"></div>
                <div id="sebus-th-hint-timer" style="font-size:9px;color:#888;margin-top:4px;"></div>
            </div>

            <!-- SECTION INFO -->
            <div style="margin:8px 0;">
                <div style="font-size:10px;color:#aaa;margin-bottom:4px;">📍 Sekcje Forum:</div>
                <div id="sebus-th-sections" style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:9px;"></div>
            </div>

            <!-- BUTTONS -->
            <div style="display:flex;gap:6px;margin-top:12px;">
                <button id="sebus-th-start-btn" class="sebus-mmo-btn" style="flex:1;height:32px;font-size:11px;" type="button">🗺️ Rozpocznij</button>
                <button id="sebus-th-claim-btn" class="sebus-mmo-btn" style="flex:1;height:32px;font-size:11px;display:none;" type="button">💰 Odbierz!</button>
            </div>

            <div id="sebus-th-feedback" style="margin-top:8px;font-size:10px;min-height:12px;color:#ff9999;"></div>

            <!-- LOOT TABLE -->
            <h5 style="color:#ffe8b7;font-size:11px;margin:12px 0 6px;">🎁 Możliwe Nagrody:</h5>
            <div style="font-size:9px;color:#aaa;padding:6px;background:rgba(0,0,0,.3);border-radius:4px;">
                <div>🔑 Klucze Aukcji - +1 do aukcji</div>
                <div>💎 Kamienie Gildyjne - +5 do kasy gildii</div>
                <div>💵 Baksy - do 500 baksy</div>
            </div>
        `;

        document.body.appendChild(panel);

        // Back button
        panel.querySelector('#sebus-th-back-btn').addEventListener('click', () => {
            panel.style.display = 'none';
        });

        // Start Hunt
        panel.querySelector('#sebus-th-start-btn').addEventListener('click', () => {
            const result = startTreasureHunt();
            panel.querySelector('#sebus-th-feedback').textContent = result.message;
            panel.querySelector('#sebus-th-start-btn').style.display = 'none';
            panel.querySelector('#sebus-th-claim-btn').style.display = 'block';
            syncTreasureHuntAdvancedUI(panel);
            drawTreasureRadar(panel);
        });

        // Claim Treasure
        panel.querySelector('#sebus-th-claim-btn').addEventListener('click', () => {
            const result = claimTreasure();
            panel.querySelector('#sebus-th-feedback').textContent = result.message;
            panel.querySelector('#sebus-th-claim-btn').style.display = 'none';
            panel.querySelector('#sebus-th-start-btn').style.display = 'block';
            syncTreasureHuntAdvancedUI(panel);
        });

        // Animate radar
        const radarInterval = setInterval(() => {
            if (!panel.style.display || panel.style.display === 'none') {
                clearInterval(radarInterval);
                return;
            }
            if (treasureHuntState.active) {
                drawTreasureRadar(panel);
            }
        }, 500);

        syncTreasureHuntAdvancedUI(panel);

        return panel;
    }

    function syncTreasureHuntAdvancedUI(panel) {
        const statusEl = panel.querySelector('#sebus-th-status');
        const clueEl = panel.querySelector('#sebus-th-clue');
        const sectionsEl = panel.querySelector('#sebus-th-sections');
        const timerEl = panel.querySelector('#sebus-th-hint-timer');

        if (treasureHuntState.active) {
            if (statusEl) statusEl.textContent = '🎯 Łapanka AKTYWNA!';
            if (clueEl) clueEl.textContent = treasureHuntState.clue || 'Brak wskazówki';
            
            const timeSinceStart = nowTs() - treasureHuntState.spawnedAt;
            const hintCount = Math.floor(timeSinceStart / (10 * 60 * 1000));
            if (timerEl) timerEl.textContent = `Wskazówka #${hintCount + 1} - nowa za ${10 - (Math.floor((timeSinceStart % (10 * 60 * 1000)) / 60 / 1000))} min`;
        } else {
            if (statusEl) statusEl.textContent = '⏳ Czekam na Łapankę...';
            if (clueEl) clueEl.textContent = 'Załóż nową łapankę aby zacząć';
            if (timerEl) timerEl.textContent = '';
        }

        if (sectionsEl) {
            sectionsEl.innerHTML = guildWarsState.forumSections.map((section) => {
                return `<div style="padding:4px;background:rgba(255,215,0,0.08);border-radius:3px;border:1px solid rgba(255,214,110,.2);">${section}</div>`;
            }).join('');
        }
    }

    function drawTreasureRadar(panel) {
        const canvas = panel.querySelector('#sebus-th-radar');
        if (!canvas || typeof canvas.getContext !== 'function') return;

        const ctx = canvas.getContext('2d');
        const centerX = 100;
        const centerY = 100;
        const radius = 95;

        // Clear
        ctx.fillStyle = 'rgba(10,10,20,0.8)';
        ctx.fillRect(0, 0, 200, 200);

        // Draw grid circles
        ctx.strokeStyle = 'rgba(255,215,0,0.15)';
        ctx.lineWidth = 1;
        for (let r = 25; r < radius; r += 25) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Draw crosshair
        ctx.strokeStyle = 'rgba(255,215,0,0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(centerX - 20, centerY);
        ctx.lineTo(centerX + 20, centerY);
        ctx.moveTo(centerX, centerY - 20);
        ctx.lineTo(centerX, centerY + 20);
        ctx.stroke();

        if (treasureHuntState.active) {
            // Blinking dot
            const pulsing = Math.sin(nowTs() / 200) > 0;
            const dotRadius = pulsing ? 6 : 3;
            
            ctx.fillStyle = pulsing ? '#ff4444' : '#ff0000';
            ctx.beginPath();
            ctx.arc(centerX + 30, centerY - 30, dotRadius, 0, Math.PI * 2);
            ctx.fill();

            // Glow effect
            if (pulsing) {
                ctx.strokeStyle = 'rgba(255,68,68,0.4)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(centerX + 30, centerY - 30, 15, 0, Math.PI * 2);
                ctx.stroke();
            }
        }

        // Draw center
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
        ctx.fill();

        // Draw border
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
    }

    function initAdvancedAuctionPanelIfNeeded() {
        const existing = document.getElementById('sebus-auction-panel-adv');
        if (existing) return existing;

        const panel = document.createElement('div');
        panel.id = 'sebus-auction-panel-adv';
        panel.className = 'sebus-hub-container';
        panel.style.cssText = 'position:fixed;left:100px;bottom:100px;width:420px;max-height:80vh;overflow:auto;display:none;z-index:2147483647;border-radius:14px;background:linear-gradient(180deg, rgba(27,23,17,.98), rgba(10,10,10,.98));border:1px solid rgba(217, 168, 60, 0.75);';
        
        panel.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid rgba(255,214,110,.23);">
                <button id="sebus-auc-back-btn" class="sebus-mmo-btn" style="width:80px;height:28px;font-size:10px;padding:0;" type="button">← Wróć</button>
                <div class="sebus-baksy-hub-title" style="flex:1;text-align:center;margin:0;">💎 Aukcje Live</div>
            </div>

            <!-- TIMER -->
            <div style="text-align:center;margin:12px 0;padding:12px;background:rgba(255,50,50,0.08);border-radius:8px;border:1px solid rgba(255,100,100,.3);">
                <div style="font-size:11px;color:#aaa;">Czas do końca:</div>
                <div id="sebus-auc-timer" style="font-size:18px;font-weight:bold;color:#ff6b6b;">--:--</div>
                <div id="sebus-auc-antisnipe-msg" style="font-size:9px;color:#ff9999;margin-top:4px;display:none;">⚡ UWAGA: Bid w ostatniej minucie +15s!</div>
            </div>

            <!-- ITEM INFO -->
            <div style="margin:12px 0;padding:10px;background:rgba(255,215,0,0.08);border-left:3px solid #ffd700;border-radius:4px;">
                <div style="font-size:10px;color:#aaa;margin-bottom:4px;">📦 Przedmiot:</div>
                <div id="sebus-auc-item-name" style="font-size:12px;color:#ffd700;font-weight:bold;margin-bottom:6px;">Brak aktualnej aukcji</div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:9px;">
                    <div><span style="color:#aaa;">Cena wywoławcza:</span><br><span id="sebus-auc-start-price" style="color:#fff;">0</span></div>
                    <div><span style="color:#aaa;">Aktualna oferta:</span><br><span id="sebus-auc-current-bid" style="color:#ffff00;font-weight:bold;">0</span></div>
                </div>
            </div>

            <!-- BID HISTORY -->
            <div style="margin:12px 0;">
                <div style="font-size:10px;color:#aaa;margin-bottom:6px;">📊 Historia Bidów:</div>
                <div id="sebus-auc-bids-list" style="font-size:9px;max-height:120px;overflow-y:auto;border:1px solid rgba(255,214,110,.12);border-radius:6px;padding:6px;"></div>
            </div>

            <!-- BID INPUT -->
            <h5 style="color:#ffe8b7;font-size:11px;margin:12px 0 6px;">🏷️ Twoja Oferta:</h5>
            <div style="display:flex;gap:4px;">
                <input id="sebus-auc-bid-amount" type="number" min="1" step="1" placeholder="Zł" style="flex:1;height:32px;border:1px solid #666;border-radius:5px;background:#111;color:#ffd700;padding:0 6px;box-sizing:border-box;font-size:11px;">
                <button id="sebus-auc-bid-submit" class="sebus-mmo-btn" style="width:100px;height:32px;font-size:11px;" type="button">🔨 Licytuj</button>
            </div>
            <div id="sebus-auc-feedback" style="margin-top:8px;font-size:10px;min-height:12px;color:#ff9999;"></div>

            <!-- LEADING BID -->
            <div id="sebus-auc-leading" style="margin-top:12px;padding:8px;background:rgba(0,255,0,0.1);border-left:3px solid #00ff00;border-radius:4px;display:none;">
                <div style="font-size:10px;color:#aaa;">🏆 Prowadzisz aukcję!</div>
                <div id="sebus-auc-leading-msg" style="font-size:11px;color:#00ff00;margin-top:2px;">Jesteś najwyższym bidujący</div>
            </div>

            <!-- OUTBID ALERT -->
            <div id="sebus-auc-outbid" style="margin-top:12px;padding:8px;background:rgba(255,50,50,0.15);border-left:3px solid #ff0000;border-radius:4px;display:none;animation:pulse 1s infinite;">
                <div style="font-size:10px;color:#ff0000;">🚨 ZOSTAŁEŚ PRZEBITY!</div>
                <div id="sebus-auc-outbid-msg" style="font-size:10px;color:#ff9999;margin-top:2px;">Ktos wpłacił wyższą ofertę</div>
            </div>
        `;

        document.body.appendChild(panel);

        // Back button
        panel.querySelector('#sebus-auc-back-btn').addEventListener('click', () => {
            panel.style.display = 'none';
        });

        // Submit bid
        panel.querySelector('#sebus-auc-bid-submit').addEventListener('click', () => {
            const bidAmount = Number(panel.querySelector('#sebus-auc-bid-amount').value || 0);
            const userId = getRuntimeUserId();
            if (bidAmount < 1) {
                panel.querySelector('#sebus-auc-feedback').textContent = '❌ Min. 1 baks!';
                return;
            }
            const result = placeBid(userId, bidAmount);
            panel.querySelector('#sebus-auc-feedback').textContent = result.message;
            if (result.ok) {
                panel.querySelector('#sebus-auc-bid-amount').value = '';
                syncAuctionAdvancedUI(panel);
            }
        });

        // Timer update
        const timerInterval = setInterval(() => {
            if (!panel.style.display || panel.style.display === 'none') {
                clearInterval(timerInterval);
                return;
            }
            syncAuctionAdvancedUI(panel);
        }, 500);

        syncAuctionAdvancedUI(panel);

        return panel;
    }

    function syncAuctionAdvancedUI(panel) {
        const itemEl = panel.querySelector('#sebus-auc-item-name');
        const priceEl = panel.querySelector('#sebus-auc-start-price');
        const bidEl = panel.querySelector('#sebus-auc-current-bid');
        const historyEl = panel.querySelector('#sebus-auc-bids-list');
        const timerEl = panel.querySelector('#sebus-auc-timer');
        const antiSnipeEl = panel.querySelector('#sebus-auc-antisnipe-msg');
        const leadingEl = panel.querySelector('#sebus-auc-leading');
        const outbidEl = panel.querySelector('#sebus-auc-outbid');
        const userId = getRuntimeUserId();

        if (!auctionState.currentLot) {
            if (itemEl) itemEl.textContent = 'Brak aktualnej aukcji';
            if (priceEl) priceEl.textContent = '0';
            if (bidEl) bidEl.textContent = '0';
            if (timerEl) timerEl.textContent = 'Oczekiwanie...';
            if (historyEl) historyEl.innerHTML = '';
            return;
        }

        // Item info
        if (itemEl) itemEl.textContent = auctionState.currentLot.name;
        if (priceEl) priceEl.textContent = auctionState.currentLot.startingBid.toLocaleString();

        // Current bid
        const lastBid = auctionState.bids[auctionState.bids.length - 1];
        const currentBidAmount = lastBid ? lastBid.amount : auctionState.currentLot.startingBid;
        if (bidEl) bidEl.textContent = currentBidAmount.toLocaleString();

        // Timer with anti-snipe
        const timeLeft = Math.max(0, auctionState.endsAt - nowTs());
        const mins = Math.floor(timeLeft / 60000);
        const secs = Math.floor((timeLeft % 60000) / 1000);
        if (timerEl) timerEl.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;

        if (antiSnipeEl) {
            antiSnipeEl.style.display = (timeLeft > 0 && timeLeft < 60000) ? 'block' : 'none';
        }

        // History
        if (historyEl) {
            historyEl.innerHTML = (auctionState.bids || []).slice(-8).reverse().map((bid) => {
                const time = new Date(bid.at).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
                return `<div style="padding:3px;border-bottom:1px dashed rgba(255,214,110,.1%);">
                    #${bid.userId} ${bid.amount.toLocaleString()} 💵 [${time}]
                </div>`;
            }).join('');
        }

        // Check leading/outbid status
        const userIsLeading = lastBid && lastBid.userId === userId;
        if (leadingEl) leadingEl.style.display = userIsLeading ? 'block' : 'none';
        if (outbidEl) outbidEl.style.display = !userIsLeading && lastBid && lastBid.userId !== userId && auctionState.bids.length > 1 ? 'block' : 'none';
    }

    function formatAdminPreviewJson(data) {
        try {
            return JSON.stringify(data, null, 2);
        } catch (e) {
            return '{}';
        }
    }

    function initGlobalMMOEventsNotificationIfNeeded() {
        const existing = document.getElementById('sebus-mmo-events-notification');
        if (existing) return existing;

        const notif = document.createElement('div');
        notif.id = 'sebus-mmo-events-notification';
        notif.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%, -50%);display:none;z-index:99999;';
        
        notif.innerHTML = `
            <div style="position:relative;width:500px;max-width:90vw;padding:30px;background:linear-gradient(135deg, rgba(255,50,50,.95), rgba(200,20,20,.95));border:3px solid #ff0000;border-radius:12px;box-shadow:0 0 30px rgba(255,50,50,0.7);text-align:center;animation:slideDown 0.5s ease-out;">
                <style>
                    @keyframes slideDown {
                        from {
                            opacity: 0;
                            transform: translate(-50%, -150%);
                        }
                        to {
                            opacity: 1;
                            transform: translate(-50%, -50%);
                        }
                    }
                    @keyframes pulse {
                        0%, 100% { transform: scale(1); }
                        50% { transform: scale(1.05); }
                    }
                    #sebus-mmo-events-icon {
                        animation: pulse 0.8s infinite;
                    }
                </style>
                <div id="sebus-mmo-events-icon" style="font-size:48px;margin-bottom:12px;">⚔️</div>
                <div style="font-size:14px;font-weight:bold;color:#fff;text-shadow:0 2px 4px rgba(0,0,0,0.5);margin-bottom:8px;" id="sebus-mmo-events-title">СОБЫТИЕ!</div>
                <div style="font-size:12px;color:#ffff00;text-shadow:0 1px 3px rgba(0,0,0,0.5);margin-bottom:12px;" id="sebus-mmo-events-message">Coś się dzieje!</div>
                <button id="sebus-mmo-events-close" class="sebus-mmo-btn" style="width:100%;height:32px;font-size:11px;" type="button">✓ Rozumiem!</button>
            </div>
        `;

        document.body.appendChild(notif);

        notif.querySelector('#sebus-mmo-events-close').addEventListener('click', () => {
            notif.style.display = 'none';
        });

        return notif;
    }

    async function watchGlobalMMOEvents() {
        try {
            if (typeof database === 'undefined' || typeof firebaseBasePath === 'undefined') return;
            const eventsRef = database.ref(`${firebaseBasePath}/globalEvents`);
            
            eventsRef.on('value', async (snapshot) => {
                const events = snapshot.val() || {};
                const notif = initGlobalMMOEventsNotificationIfNeeded();

                // Check for active event
                Object.values(events).forEach((event) => {
                    if (event && event.active && nowTs() < (event.endsAt || 0)) {
                        // Show notification
                        const titleEl = notif.querySelector('#sebus-mmo-events-title');
                        const msgEl = notif.querySelector('#sebus-mmo-events-message');
                        const iconEl = notif.querySelector('#sebus-mmo-events-icon');

                        if (event.type === 'boss_raid') {
                            if (titleEl) titleEl.textContent = '⚔️ BOSS POJAWIŁ SIĘ!';
                            if (msgEl) msgEl.textContent = event.message || 'Boss czeka na czacie!';
                            if (iconEl) iconEl.textContent = '⚔️';
                        } else if (event.type === 'dragon_event') {
                            if (titleEl) titleEl.textContent = '🐉 SMOCZY DZIEŃ!';
                            if (msgEl) msgEl.textContent = event.message || 'Smoki atakują forum!';
                            if (iconEl) iconEl.textContent = '🐉';
                        } else if (event.type === 'treasure') {
                            if (titleEl) titleEl.textContent = '💎 SKARB ZNALEZIONY!';
                            if (msgEl) msgEl.textContent = event.message || 'Nowa łapanka dostępna!';
                            if (iconEl) iconEl.textContent = '💎';
                        } else if (event.type === 'giveaway') {
                            if (titleEl) titleEl.textContent = '🎁 GIVEAWAY!';
                            if (msgEl) msgEl.textContent = event.message || 'Darmowe baksy czekają!';
                            if (iconEl) iconEl.textContent = '🎁';
                        } else {
                            if (titleEl) titleEl.textContent = '📢 OGŁOSZENIE!';
                            if (msgEl) msgEl.textContent = event.message || 'Nowe wydarzenie!';
                            if (iconEl) iconEl.textContent = '📢';
                        }

                        notif.style.display = 'block';

                        // Auto-hide after 8 seconds
                        setTimeout(() => {
                            notif.style.display = 'none';
                        }, 8000);
                    }
                });
            });
        } catch (e) {
            // Silently fail if Firebase not ready
        }
    }

    function scheduleGlobalMMOEventsWatch() {
        if (window['__sebusGlobalEventsWatcherAttached']) return;
        if (window['firebaseInitialized'] === false) return;
        window['__sebusGlobalEventsWatcherAttached'] = true;
        watchGlobalMMOEvents();
    }

    async function adminLoadUserBundle(userId) {
        const uid = String(userId || '').trim();
        if (!/^\d{3,}$/.test(uid)) return null;

        const userState = await firebaseReadPath(`users/${encodeURIComponent(uid)}`) || {};
        const sharedAccount = await firebaseReadPath(`${baksySharedRootPath}/accounts/${encodeURIComponent(uid)}`) || {};
        const sharedEmoji = await firebaseReadPath(`${baksySharedRootPath}/effects/profileEmoji/${encodeURIComponent(uid)}`);
        const sharedHighlight = await firebaseReadPath(`${baksySharedRootPath}/effects/nickHighlight/${encodeURIComponent(uid)}`);

        return {
            userId: uid,
            userState,
            sharedAccount,
            sharedEffects: {
                profileEmoji: sharedEmoji,
                nickHighlight: sharedHighlight
            }
        };
    }

    async function adminBuildSummarySnapshot() {
        const users = await firebaseReadPath('users') || {};
        const shared = await firebaseReadPath(baksySharedRootPath) || {};
        const userCount = Object.keys(users || {}).length;
        const accounts = shared?.accounts && typeof shared.accounts === 'object' ? Object.values(shared.accounts) : [];
        const totalBalance = accounts.reduce((acc, row) => acc + normalizeBaksyNumber(row?.balance || 0), 0);
        const top = accounts
            .filter(row => row && row.userId)
            .sort((a, b) => normalizeBaksyNumber(b.balance || 0) - normalizeBaksyNumber(a.balance || 0))
            .slice(0, 5)
            .map(row => ({
                userId: String(row.userId),
                displayName: String(row.displayName || row.userId),
                balance: normalizeBaksyNumber(row.balance || 0)
            }));

        return {
            userCount,
            totalBalance: normalizeBaksyNumber(totalBalance),
            top,
            updatedAt: nowTs()
        };
    }

    function initBaksyAdminPanelIfNeeded() {
        if (document.getElementById('sebus-baksy-admin-open')) return;

        const openBtn = document.createElement('button');
        openBtn.id = 'sebus-baksy-admin-open';
        openBtn.type = 'button';
        openBtn.textContent = '🛠 Admin Baza';

        const panel = document.createElement('div');
        panel.id = 'sebus-baksy-admin';
        panel.className = 'sebus-hub-container';
        panel.innerHTML = `
            <div class="sebus-baksy-hub-top">
                <div>
                    <div class="sebus-baksy-hub-title sebus-hub-title">🛠 Panel Admina</div>
                    <div class="sebus-baksy-hub-subtitle">Pełne zarządzanie bazą Baksy</div>
                </div>
                <div class="sebus-baksy-chip">ADMIN</div>
            </div>

            <div class="sebus-card-area">
                <h4 class="sebus-hub-title">📊 Podsumowanie bazy</h4>
                <button id="sebus-admin-refresh-summary" class="sebus-mmo-btn" type="button">Odśwież podsumowanie</button>
                <div id="sebus-admin-summary" class="sebus-admin-table"></div>
            </div>

            <div class="sebus-card-area">
                <h4 class="sebus-hub-title">👤 Zarządzanie użytkownikiem</h4>
                <input id="sebus-admin-user-id" type="text" placeholder="ID użytkownika">
                <button id="sebus-admin-load-user" class="sebus-mmo-btn" type="button">Wczytaj użytkownika</button>
                <div class="sebus-admin-grid">
                    <input id="sebus-admin-user-name" type="text" placeholder="displayName">
                    <input id="sebus-admin-user-balance" type="number" step="0.01" placeholder="balance">
                </div>
                <button id="sebus-admin-save-user" class="sebus-mmo-btn" type="button">Zapisz profil + saldo</button>
                <button id="sebus-admin-reset-missions" class="sebus-mmo-btn" type="button">Reset misji dziennych</button>
                <button id="sebus-admin-remove-emoji" class="sebus-mmo-btn" type="button">Usuń emotkę globalną</button>
                <button id="sebus-admin-remove-highlight" class="sebus-mmo-btn" type="button">Usuń highlight nicku</button>
                <textarea id="sebus-admin-user-json" placeholder="Podgląd JSON użytkownika" spellcheck="false"></textarea>
                <div id="sebus-admin-feedback" class="sebus-admin-feedback"></div>
            </div>

            <div class="sebus-card-area">
                <h4 class="sebus-hub-title">🔐 Firebase Auth Token</h4>
                <textarea id="sebus-admin-auth-token" placeholder='Wklej Firebase token (JSON)' spellcheck="false" style="font-family: monospace; font-size: 11px; height: 120px;"></textarea>
                <button id="sebus-admin-set-token" class="sebus-neon-violet-btn" type="button">Załaduj token</button>
                <button id="sebus-admin-verify-token" class="sebus-mmo-btn" type="button">Weryfikuj token</button>
                <button id="sebus-admin-clear-token" class="sebus-neon-red-btn" type="button">Wyczyść token</button>
                <div id="sebus-admin-auth-status" class="sebus-admin-feedback"></div>
            </div>
        `;

        document.body.appendChild(openBtn);
        document.body.appendChild(panel);

        const summaryEl = panel.querySelector('#sebus-admin-summary');
        const feedbackEl = panel.querySelector('#sebus-admin-feedback');
        const userIdInput = panel.querySelector('#sebus-admin-user-id');
        const nameInput = panel.querySelector('#sebus-admin-user-name');
        const balanceInput = panel.querySelector('#sebus-admin-user-balance');
        const jsonTextarea = panel.querySelector('#sebus-admin-user-json');

        const renderSummary = (snapshot) => {
            if (!summaryEl) return;
            if (!snapshot) {
                summaryEl.innerHTML = '<div class="sebus-admin-row"><span>Brak danych</span><span>-</span></div>';
                return;
            }

            const topRows = Array.isArray(snapshot.top)
                ? snapshot.top.map((row, idx) => `<div class="sebus-admin-row"><span>#${idx + 1} ${escapeHtml(row.displayName)} (${escapeHtml(row.userId)})</span><span>${normalizeBaksyNumber(row.balance)} 💵</span></div>`).join('')
                : '';

            summaryEl.innerHTML = `
                <div class="sebus-admin-row"><span>Liczba userów</span><span>${snapshot.userCount}</span></div>
                <div class="sebus-admin-row"><span>Łączny balans</span><span>${snapshot.totalBalance} 💵</span></div>
                ${topRows || '<div class="sebus-admin-row"><span>Top</span><span>brak</span></div>'}
            `;
        };

        const refreshSummary = async () => {
            feedbackEl.textContent = 'Ładowanie podsumowania...';
            const snapshot = await adminBuildSummarySnapshot();
            renderSummary(snapshot);
            feedbackEl.textContent = 'Podsumowanie odświeżone.';
        };

        openBtn.addEventListener('click', (e) => {
            e.preventDefault();
            panel.classList.toggle('show');
        });

        panel.querySelector('#sebus-admin-refresh-summary').addEventListener('click', async () => {
            await refreshSummary();
        });

        panel.querySelector('#sebus-admin-load-user').addEventListener('click', async () => {
            const uid = userIdInput.value.trim();
            const bundle = await adminLoadUserBundle(uid);
            if (!bundle) {
                feedbackEl.textContent = 'Podaj poprawne ID użytkownika.';
                return;
            }

            const account = bundle.userState?.baksyDb?.accounts?.[uid] || bundle.sharedAccount || {};
            nameInput.value = String(account.displayName || '');
            balanceInput.value = String(normalizeBaksyNumber(account.balance || 0));
            jsonTextarea.value = formatAdminPreviewJson(bundle);
            feedbackEl.textContent = `Wczytano użytkownika #${uid}.`;
            baksyAdminUiCache = bundle;
        });

        panel.querySelector('#sebus-admin-save-user').addEventListener('click', async () => {
            const uid = userIdInput.value.trim();
            if (!/^\d{3,}$/.test(uid)) {
                feedbackEl.textContent = 'Niepoprawne ID użytkownika.';
                return;
            }

            feedbackEl.textContent = 'Zapisywanie...';
            const state = await firebaseReadPath(`users/${encodeURIComponent(uid)}`) || {};
            const db = normalizeBaksyDbPayload(state?.baksyDb || {});
            const account = db.accounts?.[uid] || createDefaultBaksyProfile(uid);
            account.displayName = String(nameInput.value || account.displayName || `#${uid}`).trim() || `#${uid}`;
            account.balance = normalizeBaksyNumber(balanceInput.value || account.balance || 0);
            account.updatedAt = nowTs();
            db.accounts[uid] = account;
            db.updatedAt = nowTs();

            await firebaseWriteUserStatePart('baksyDb', db, uid);
            await firebaseWritePath(`${baksySharedRootPath}/accounts/${encodeURIComponent(uid)}`, {
                userId: uid,
                displayName: account.displayName,
                balance: account.balance,
                totalEarned: normalizeBaksyNumber(account.totalEarned || 0),
                totalSpent: normalizeBaksyNumber(account.totalSpent || 0),
                updatedAt: nowTs()
            });
            await firebaseWritePath(`${baksySharedRootPath}/updatedAt`, nowTs());

            feedbackEl.textContent = `Zapisano konto #${uid}.`;
            pullSharedWorldIfNeeded(true);
            scheduleModule('baksy', { immediate: true });
        });

        panel.querySelector('#sebus-admin-reset-missions').addEventListener('click', async () => {
            const uid = userIdInput.value.trim();
            if (!/^\d{3,}$/.test(uid)) {
                feedbackEl.textContent = 'Niepoprawne ID użytkownika.';
                return;
            }

            const state = await firebaseReadPath(`users/${encodeURIComponent(uid)}`) || {};
            const db = normalizeBaksyDbPayload(state?.baksyDb || {});
            const account = db.accounts?.[uid] || createDefaultBaksyProfile(uid);
            account.dailyMissions = createDefaultDailyMissionsState();
            account.updatedAt = nowTs();
            db.accounts[uid] = account;
            db.updatedAt = nowTs();

            await firebaseWriteUserStatePart('baksyDb', db, uid);
            feedbackEl.textContent = `Zresetowano misje użytkownika #${uid}.`;
        });

        panel.querySelector('#sebus-admin-remove-emoji').addEventListener('click', async () => {
            const uid = userIdInput.value.trim();
            if (!/^\d{3,}$/.test(uid)) {
                feedbackEl.textContent = 'Niepoprawne ID użytkownika.';
                return;
            }
            await firebaseDeletePath(`${baksySharedRootPath}/effects/profileEmoji/${encodeURIComponent(uid)}`);
            await firebaseWritePath(`${baksySharedRootPath}/updatedAt`, nowTs());
            feedbackEl.textContent = `Usunięto emotkę globalną dla #${uid}.`;
            pullSharedWorldIfNeeded(true);
            scheduleModule('baksy', { immediate: true });
        });

        panel.querySelector('#sebus-admin-remove-highlight').addEventListener('click', async () => {
            const uid = userIdInput.value.trim();
            if (!/^\d{3,}$/.test(uid)) {
                feedbackEl.textContent = 'Niepoprawne ID użytkownika.';
                return;
            }
            await firebaseDeletePath(`${baksySharedRootPath}/effects/nickHighlight/${encodeURIComponent(uid)}`);
            await firebaseWritePath(`${baksySharedRootPath}/updatedAt`, nowTs());
            feedbackEl.textContent = `Usunięto highlight globalny dla #${uid}.`;
            pullSharedWorldIfNeeded(true);
            scheduleModule('baksy', { immediate: true });
        });

        const authTokenTextarea = panel.querySelector('#sebus-admin-auth-token');
        const authStatusEl = panel.querySelector('#sebus-admin-auth-status');

        const updateAuthStatus = () => {
            if (firebaseAuthToken && firebaseAuthUid) {
                authStatusEl.innerHTML = `<strong>✅ Token załadowany</strong><br/>UID: ${escapeHtml(firebaseAuthUid)}<br/>Email: ${escapeHtml(firebaseAuthUserEmail || 'N/A')}`;
                authStatusEl.style.color = '#2ecc71';
            } else {
                authStatusEl.textContent = '❌ Brak załadowanego tokena';
                authStatusEl.style.color = '#e74c3c';
            }
        };

        panel.querySelector('#sebus-admin-set-token').addEventListener('click', () => {
            try {
                const tokenJson = authTokenTextarea.value.trim();
                if (!tokenJson) {
                    authStatusEl.textContent = 'Wklej JSON z tokenem Firebase.';
                    authStatusEl.style.color = '#e74c3c';
                    return;
                }
                const tokenData = JSON.parse(tokenJson);
                if (setFirebaseAuthToken(tokenData)) {
                    authStatusEl.textContent = `✅ Token załadowany dla: ${escapeHtml(firebaseAuthUid)}`;
                    authStatusEl.style.color = '#2ecc71';
                } else {
                    authStatusEl.textContent = '❌ Nie udało się załadować tokena.';
                    authStatusEl.style.color = '#e74c3c';
                }
            } catch (e) {
                authStatusEl.textContent = `❌ Błąd JSON: ${escapeHtml(String(e.message))}`;
                authStatusEl.style.color = '#e74c3c';
            }
        });

        panel.querySelector('#sebus-admin-verify-token').addEventListener('click', async () => {
            authStatusEl.textContent = 'Weryfikowanie tokena...';
            try {
                const isValid = await verifyFirebaseAuthToken();
                if (isValid) {
                    authStatusEl.innerHTML = `<strong>✅ Token weryfikowany pomyślnie</strong><br/>UID: ${escapeHtml(firebaseAuthUid)}<br/>Email: ${escapeHtml(firebaseAuthUserEmail || 'N/A')}`;
                    authStatusEl.style.color = '#2ecc71';
                } else {
                    authStatusEl.textContent = '❌ Token jest nieprawidłowy lub wygasł.';
                    authStatusEl.style.color = '#e74c3c';
                }
            } catch (e) {
                authStatusEl.textContent = `❌ Błąd weryfikacji: ${escapeHtml(String(e.message))}`;
                authStatusEl.style.color = '#e74c3c';
            }
        });

        panel.querySelector('#sebus-admin-clear-token').addEventListener('click', () => {
            firebaseAuthToken = null;
            firebaseAuthUid = null;
            firebaseAuthUserEmail = null;
            firebaseAuthCheckedAt = 0;
            saveStorageValue('firebaseAuthToken', '');
            authTokenTextarea.value = '';
            authStatusEl.textContent = '✓ Token wyczyszczony.';
            authStatusEl.style.color = '#95a5a6';
        });

        updateAuthStatus();

        document.addEventListener('click', (e) => {
            if (!panel.classList.contains('show')) return;
            if (panel.contains(e.target) || openBtn.contains(e.target)) return;
            panel.classList.remove('show');
        });

        refreshSummary();
    }

    function syncBaksyAdminUiVisibility() {
        const openBtn = document.getElementById('sebus-baksy-admin-open');
        if (!openBtn) return;
        openBtn.classList.remove('show');
        const panel = document.getElementById('sebus-baksy-admin');
        if (panel) panel.classList.remove('show');
    }

    function getRecentBaksyHistory(limit = 14) {
        const db = ensureBaksyDbLoaded();
        return db.ledger.slice(Math.max(0, db.ledger.length - limit)).reverse();
    }

    function formatBaksyHistoryRow(item) {
        const at = new Date(item.at || nowTs());
        const hh = String(at.getHours()).padStart(2, '0');
        const mm = String(at.getMinutes()).padStart(2, '0');
        const amount = normalizeBaksyNumber(item.amount || 0);

        if (item.reason === 'starter_bonus') return `[${hh}:${mm}] +${amount} • bonus startowy`;
        if (String(item.reason || '').startsWith('daily_mission:')) return `[${hh}:${mm}] +${amount} • misja dzienna`;
        if (String(item.reason || '').startsWith('shop:shared:')) return `[${hh}:${mm}] -${amount} • sklep globalny`;
        if (item.type === 'earn') return `[${hh}:${mm}] +${amount} • ${item.reason}`;
        if (item.type === 'spend') return `[${hh}:${mm}] -${amount} • ${item.reason}`;
        if (item.type === 'transfer') return `[${hh}:${mm}] ⇄ ${amount} • ${item.fromUserId} → ${item.toUserId}`;
        if (item.type === 'casino_loss') return `[${hh}:${mm}] -${amount} • kasyno:${item.reason}`;
        return `[${hh}:${mm}] ${amount} • ${item.type || 'event'}`;
    }

    function playBaksyCoinflip(bet, side) {
        const runtimeUserId = getRuntimeUserId();
        const amount = Math.max(1, Math.floor(Number(bet) || 0));
        const selected = side === 'tails' ? 'tails' : 'heads';
        if (!spendBaksy(amount, 'casino:coinflip:bet', { side: selected })) {
            return { ok: false, message: 'Za mało baksów na coinflip.', status: 'lose' };
        }

        const roll = Math.random();
        const landed = roll < 0.5 ? 'heads' : 'tails';
        if (landed === selected) {
            const payout = normalizeBaksyNumber(amount * 1.95);
            awardBaksy(payout, 'casino:coinflip:win', { side: selected, landed, payout }, { disableNightMultiplier: true });
            return {
                ok: true,
                win: true,
                landed,
                selected,
                payout,
                amount,
                status: 'win',
                message: `🪙 Wygrałeś! ${landed === 'heads' ? 'Orzeł' : 'Reszka'} • +${payout}`
            };
        }

        appendBaksyLedger({ type: 'casino_loss', reason: 'coinflip', amount, userId: String(runtimeUserId), payload: { selected, landed } });
        saveBaksyDb();
        return {
            ok: true,
            win: false,
            landed,
            selected,
            amount,
            status: 'lose',
            message: `💀 Przegrana. ${landed === 'heads' ? 'Orzeł' : 'Reszka'} • -${amount}`
        };
    }

    function playBaksySlots(bet) {
        const runtimeUserId = getRuntimeUserId();
        const amount = Math.max(1, Math.floor(Number(bet) || 0));
        if (!spendBaksy(amount, 'casino:slots:bet', {})) {
            return { ok: false, message: 'Za mało baksów na sloty.', status: 'lose' };
        }

        const symbols = ['🍒', '🍋', '⭐', '7️⃣', '💎'];
        const roll = [
            symbols[Math.floor(Math.random() * symbols.length)],
            symbols[Math.floor(Math.random() * symbols.length)],
            symbols[Math.floor(Math.random() * symbols.length)]
        ];

        let multiplier = 0;
        if (roll[0] === roll[1] && roll[1] === roll[2]) {
            const map = { '🍒': 2.5, '🍋': 3.2, '⭐': 5, '7️⃣': 8, '💎': 12 };
            multiplier = map[roll[0]] || 2;
        } else if (roll[0] === roll[1] || roll[1] === roll[2] || roll[0] === roll[2]) {
            multiplier = 1.3;
        }

        const line = roll.join(' ');
        if (multiplier > 0) {
            const payout = normalizeBaksyNumber(amount * multiplier);
            awardBaksy(payout, 'casino:slots:win', { line, payout }, { disableNightMultiplier: true });
            return {
                ok: true,
                win: true,
                roll,
                multiplier,
                payout,
                amount,
                status: 'win',
                message: `🎰 ${line} • x${multiplier} • +${payout}`
            };
        }

        appendBaksyLedger({ type: 'casino_loss', reason: 'slots', amount, userId: String(runtimeUserId), payload: { line } });
        saveBaksyDb();
        return {
            ok: true,
            win: false,
            roll,
            multiplier: 0,
            payout: 0,
            amount,
            status: 'lose',
            message: `🎰 ${line} • Pudło -${amount}`
        };
    }

    function drawBaksyBlackjackCard() {
        const deck = [
            { label: 'A', value: 11, altValue: 1 },
            { label: '2', value: 2 },
            { label: '3', value: 3 },
            { label: '4', value: 4 },
            { label: '5', value: 5 },
            { label: '6', value: 6 },
            { label: '7', value: 7 },
            { label: '8', value: 8 },
            { label: '9', value: 9 },
            { label: '10', value: 10 },
            { label: 'J', value: 10 },
            { label: 'Q', value: 10 },
            { label: 'K', value: 10 }
        ];
        const picked = deck[Math.floor(Math.random() * deck.length)];
        return Object.assign({}, picked);
    }

    function sumBaksyBlackjack(cards) {
        let total = 0;
        let aces = 0;

        cards.forEach(card => {
            total += Number(card.value) || 0;
            if (Number(card.altValue) === 1) aces += 1;
        });

        while (total > 21 && aces > 0) {
            total -= 10;
            aces -= 1;
        }

        return total;
    }

    function resolveBaksyBlackjackRound(mode) {
        if (!baksyBlackjackState) return { ok: false, message: 'Brak aktywnej gry w oczko.', status: 'neutral' };

        const runtimeUserId = getRuntimeUserId();
        const state = baksyBlackjackState;
        if (mode === 'stand') {
            while (sumBaksyBlackjack(state.dealerCards) < 17) {
                state.dealerCards.push(drawBaksyBlackjackCard());
            }
        }

        const playerTotal = sumBaksyBlackjack(state.playerCards);
        const dealerTotal = sumBaksyBlackjack(state.dealerCards);
        state.playerTotal = playerTotal;
        state.dealerTotal = dealerTotal;

        let status = 'lose';
        let message = `🃏 Dealer ${dealerTotal} vs Ty ${playerTotal}.`;

        if (playerTotal > 21) {
            status = 'lose';
            message = `💥 Przekroczyłeś 21 (${playerTotal}). -${state.bet}`;
            appendBaksyLedger({ type: 'casino_loss', reason: 'blackjack', amount: state.bet, userId: String(runtimeUserId), payload: { playerTotal, dealerTotal } });
            saveBaksyDb();
        } else if (dealerTotal > 21 || playerTotal > dealerTotal) {
            status = 'win';
            const payout = normalizeBaksyNumber(state.bet * 2);
            state.payout = payout;
            awardBaksy(payout, 'casino:blackjack:win', { playerTotal, dealerTotal, payout }, { disableNightMultiplier: true });
            message = `🏆 Wygrana w oczko! Ty ${playerTotal}, dealer ${dealerTotal}. +${payout}`;
        } else if (playerTotal === dealerTotal) {
            status = 'neutral';
            const refund = normalizeBaksyNumber(state.bet);
            state.payout = refund;
            awardBaksy(refund, 'casino:blackjack:push', { playerTotal, dealerTotal, refund }, { disableNightMultiplier: true });
            message = `🤝 Remis ${playerTotal}:${dealerTotal}. Zwrot +${refund}`;
        } else {
            status = 'lose';
            appendBaksyLedger({ type: 'casino_loss', reason: 'blackjack', amount: state.bet, userId: String(runtimeUserId), payload: { playerTotal, dealerTotal } });
            saveBaksyDb();
            message = `🧊 Dealer wygrał ${dealerTotal}:${playerTotal}. -${state.bet}`;
        }

        state.phase = 'finished';
        return { ok: true, status, state, message };
    }

    function playBaksyBlackjack(action, bet = null) {
        const mode = String(action || '').toLowerCase();
        if (!['deal', 'hit', 'stand'].includes(mode)) {
            return { ok: false, message: 'Nieznana akcja oczko.', status: 'neutral' };
        }

        if (mode === 'deal') {
            if (baksyBlackjackState && baksyBlackjackState.phase === 'active') {
                return { ok: false, message: 'Najpierw zakończ aktualną rundę oczko.', status: 'neutral', state: baksyBlackjackState };
            }

            const amount = Math.max(1, Math.floor(Number(bet) || 0));
            if (!spendBaksy(amount, 'casino:blackjack:bet', {})) {
                return { ok: false, message: 'Za mało baksów na oczko.', status: 'lose' };
            }

            baksyBlackjackState = {
                bet: amount,
                phase: 'active',
                playerCards: [drawBaksyBlackjackCard(), drawBaksyBlackjackCard()],
                dealerCards: [drawBaksyBlackjackCard(), drawBaksyBlackjackCard()],
                playerTotal: 0,
                dealerTotal: 0,
                payout: 0,
                createdAt: nowTs()
            };

            baksyBlackjackState.playerTotal = sumBaksyBlackjack(baksyBlackjackState.playerCards);
            baksyBlackjackState.dealerTotal = sumBaksyBlackjack(baksyBlackjackState.dealerCards);

            if (baksyBlackjackState.playerTotal === 21) {
                const payout = normalizeBaksyNumber(amount * 2.5);
                baksyBlackjackState.payout = payout;
                baksyBlackjackState.phase = 'finished';
                awardBaksy(payout, 'casino:blackjack:blackjack', { payout }, { disableNightMultiplier: true });
                return { ok: true, status: 'win', state: baksyBlackjackState, message: `🃏 BLACKJACK! +${payout}` };
            }

            return {
                ok: true,
                status: 'neutral',
                state: baksyBlackjackState,
                message: `🃏 Oczko start! Ty: ${baksyBlackjackState.playerTotal}, dealer: ${baksyBlackjackState.dealerCards[0].label} + ?`
            };
        }

        if (!baksyBlackjackState || baksyBlackjackState.phase !== 'active') {
            return { ok: false, message: 'Najpierw rozpocznij nowe rozdanie.', status: 'neutral' };
        }

        if (mode === 'hit') {
            baksyBlackjackState.playerCards.push(drawBaksyBlackjackCard());
            baksyBlackjackState.playerTotal = sumBaksyBlackjack(baksyBlackjackState.playerCards);

            if (baksyBlackjackState.playerTotal > 21) {
                return resolveBaksyBlackjackRound('bust');
            }

            return {
                ok: true,
                status: 'neutral',
                state: baksyBlackjackState,
                message: `➕ Dobrałeś kartę. Masz ${baksyBlackjackState.playerTotal}.`
            };
        }

        return resolveBaksyBlackjackRound('stand');
    }

    // ════════════════════════════════════════════════════════════════
    //  FORUM SECTION DETECTION
    // ════════════════════════════════════════════════════════════════

    const FORUM_SECTION_MAP = {
        // Gry
        'metin2': { id: 'metin2', name: 'Metin2', emoji: '⚔️', category: 'gry' },
        'lineage': { id: 'lineage', name: 'Lineage', emoji: '🏰', category: 'gry' },
        'lineage2': { id: 'lineage', name: 'Lineage', emoji: '🏰', category: 'gry' },
        'lost-ark': { id: 'lostart', name: 'Lost Ark', emoji: '🚀', category: 'gry' },
        'lostart': { id: 'lostart', name: 'Lost Ark', emoji: '🚀', category: 'gry' },
        'wow': { id: 'wow', name: 'World of Warcraft', emoji: '🌍', category: 'gry' },
        'world-of-warcraft': { id: 'wow', name: 'World of Warcraft', emoji: '🌍', category: 'gry' },
        'gry': { id: 'gry', name: 'Gry', emoji: '🎮', category: 'gry' },
        'rpg': { id: 'rpg', name: 'RPG', emoji: '🐉', category: 'gry' },
        // Offtopic / ogólne
        'offtopic': { id: 'offtopic', name: 'Offtopic', emoji: '💬', category: 'off' },
        'off-topic': { id: 'offtopic', name: 'Offtopic', emoji: '💬', category: 'off' },
        'ogolne': { id: 'ogolne', name: 'Ogólne', emoji: '📢', category: 'off' },
        'ogólne': { id: 'ogolne', name: 'Ogólne', emoji: '📢', category: 'off' },
        // Technika
        'technika': { id: 'technika', name: 'Technika', emoji: '🔧', category: 'tech' },
        'hardware': { id: 'hardware', name: 'Hardware', emoji: '🖥️', category: 'tech' },
        'software': { id: 'software', name: 'Software', emoji: '💾', category: 'tech' },
        // Inne
        'news': { id: 'news', name: 'Aktualności', emoji: '📰', category: 'news' },
        'aktualnosci': { id: 'news', name: 'Aktualności', emoji: '📰', category: 'news' },
        'sport': { id: 'sport', name: 'Sport', emoji: '⚽', category: 'off' },
        'muzyka': { id: 'muzyka', name: 'Muzyka', emoji: '🎵', category: 'off' },
        'film': { id: 'film', name: 'Film/TV', emoji: '🎬', category: 'off' },
        'film-tv': { id: 'film', name: 'Film/TV', emoji: '🎬', category: 'off' }
    };

    function detectCurrentForumSection() {
        // 1. Spróbuj z breadcrumbs
        const breadcrumbs = document.querySelectorAll('.ipsBreadcrumb li a, nav[aria-label*="breadcrumb"] a, .ipsBreadcrumb_item a');
        for (const crumb of Array.from(breadcrumbs)) {
            const text = (crumb.textContent || '').trim().toLowerCase()
                .replace(/ą/g, 'a').replace(/ę/g, 'e').replace(/ó/g, 'o')
                .replace(/ś/g, 's').replace(/ł/g, 'l').replace(/ż|ź/g, 'z')
                .replace(/ć/g, 'c').replace(/ń/g, 'n').replace(/\s+/g, '-');
            if (FORUM_SECTION_MAP[text]) return FORUM_SECTION_MAP[text];
        }

        // 2. Spróbuj z URL
        const path = window.location.pathname.toLowerCase();
        const segments = path.split('/').filter(Boolean);
        for (const seg of segments) {
            const clean = seg.replace(/-\d+$/, '');
            if (FORUM_SECTION_MAP[clean]) return FORUM_SECTION_MAP[clean];
        }

        // 3. Spróbuj z tytułu strony
        const pageTitle = (document.title || '').toLowerCase();
        for (const [key, section] of Object.entries(FORUM_SECTION_MAP)) {
            if (pageTitle.includes(key)) return section;
        }

        return null;
    }

    function getForumPageType() {
        const path = window.location.pathname;
        if (/\/topic\//i.test(path)) return 'topic';
        if (/\/forum\//i.test(path)) return 'forum';
        if (/\/profile\//i.test(path) || /\/members\//i.test(path)) return 'profile';
        if (/^\/\s*$/.test(path) || path === '/index.php' || path === '/') return 'home';
        return 'other';
    }

    // ════════════════════════════════════════════════════════════════
    //  FORUM ACTIVITY TRACKER (MutationObserver based)
    // ════════════════════════════════════════════════════════════════

    let missionActivityTrackerInit = false;
    let missionSessionStartAt = 0;
    let missionLastActiveAt = 0;
    let missionReactionsSeenKeys = new Set();
    let missionFollowsSeenKeys = new Set();
    let missionTopicsSeenKeys = new Set();
    let missionPostsWrittenToday = 0;
    let missionLastPostCheckAt = 0;

    function getMissionSeenKey(prefix, el) {
        const id = el.id || el.getAttribute('data-commentid') || el.getAttribute('data-topicid') || '';
        if (id) return `${prefix}:${id}`;
        const text = (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80);
        return `${prefix}:h_${simpleHash(text)}`;
    }

    function initForumActivityTrackerIfNeeded() {
        if (missionActivityTrackerInit) return;
        missionActivityTrackerInit = true;
        missionSessionStartAt = nowTs();
        missionLastActiveAt = nowTs();

        // Restore seen keys from missions state
        const account = getBaksyAccount();
        const ms = ensureDailyMissionsState(account);
        if (Array.isArray(ms.reactionsSeenKeys)) missionReactionsSeenKeys = new Set(ms.reactionsSeenKeys);
        if (Array.isArray(ms.followsSeenKeys)) missionFollowsSeenKeys = new Set(ms.followsSeenKeys);
        if (Array.isArray(ms.topicsSeenKeys)) missionTopicsSeenKeys = new Set(ms.topicsSeenKeys);

        // Track DOM mutations for reactions, follows, posts
        const observer = new MutationObserver(() => {
            missionLastActiveAt = nowTs();
            trackReactionsMissions();
            trackFollowsMissions();
            trackTopicsMissions();
        });
        observer.observe(document.body, { childList: true, subtree: true });

        // Session time tracker — every minute
        setInterval(() => {
            const now = nowTs();
            const idleSecs = now - missionLastActiveAt;
            if (idleSecs < 120) { // aktywny jeśli < 2min idle
                addDailyMissionProgress('timeOnForum', 1, { autoSave: false });
                saveBaksyDb();
            }
        }, 60000);

        // Click tracking (aktywność ogólna)
        document.addEventListener('click', () => { missionLastActiveAt = nowTs(); }, { passive: true });
        document.addEventListener('keydown', () => { missionLastActiveAt = nowTs(); }, { passive: true });
        document.addEventListener('scroll', () => { missionLastActiveAt = nowTs(); }, { passive: true });
    }

    function trackReactionsMissions() {
        // Reakcje - kliknięte przyciski reakcji lub elementy z klasą ipsReact
        document.querySelectorAll('[data-action="react"], .ipsReact_reacted, .ipsLikeButton--liked, [class*="reaction"]:not([class*="sebus"])').forEach(el => {
            const key = getMissionSeenKey('react', el);
            if (missionReactionsSeenKeys.has(key)) return;
            // Sprawdź czy to reakcja UŻYTKOWNIKA (aktywna)
            const isActive = el.classList.contains('ipsReact_reacted') ||
                el.classList.contains('ipsLikeButton--liked') ||
                el.getAttribute('data-active') === 'true' ||
                el.getAttribute('aria-pressed') === 'true';
            if (!isActive) return;
            missionReactionsSeenKeys.add(key);
            addDailyMissionProgress('reactToPost', 1, { autoSave: true });

            const section = detectCurrentForumSection();
            if (section) {
                addDailyMissionProgress(`reactIn_${section.id}`, 1, { autoSave: true });
            }
        });
    }

    function trackFollowsMissions() {
        // Obserwowanie tematów
        document.querySelectorAll('[data-action="follow"].ipsFollow_followed, .ipsFollow_following, [data-follow-type="topic"].ipsFollow_followed').forEach(el => {
            const key = getMissionSeenKey('follow', el);
            if (missionFollowsSeenKeys.has(key)) return;
            missionFollowsSeenKeys.add(key);
            addDailyMissionProgress('followTopic', 1, { autoSave: true });
        });
    }

    function trackTopicsMissions() {
        // Odwiedzone tematy (linki do tematów widoczne na stronie)
        const pageType = getForumPageType();
        if (pageType === 'topic') {
            const topicMatch = window.location.pathname.match(/\/topic\/(\d+)/i);
            if (topicMatch) {
                const key = `topic:${topicMatch[1]}`;
                if (!missionTopicsSeenKeys.has(key)) {
                    missionTopicsSeenKeys.add(key);
                    addDailyMissionProgress('visitTopic', 1, { autoSave: true });

                    // Sprawdź czy to stary temat (archiwum)
                    const firstPost = document.querySelector('article[data-commentid], .cPost');
                    if (firstPost) {
                        const dateEl = firstPost.querySelector('time[datetime]');
                        if (dateEl) {
                            const postDate = new Date(dateEl.getAttribute('datetime') || 0);
                            const ageYears = (Date.now() - postDate.getTime()) / (1000 * 3600 * 24 * 365);
                            if (ageYears >= 1) addDailyMissionProgress('archiveHunter', 1, { autoSave: true });
                            if (ageYears >= 3) addDailyMissionProgress('deepArchive', 1, { autoSave: true });
                        }
                    }

                    // Sekcja-specyficzna
                    const section = detectCurrentForumSection();
                    if (section) {
                        addDailyMissionProgress(`visitIn_${section.id}`, 1, { autoSave: true });
                    }
                }
            }
        }
    }

    function trackForumPostsWritten() {
        // Sprawdź czy użytkownik napisał nowe posty/tematy dziś
        const now = nowTs();
        if ((now - missionLastPostCheckAt) < 8000) return; // maks co 8s
        missionLastPostCheckAt = now;

        const myId = getRuntimeUserId();
        if (!myId) return;

        if (!msgEl) return;

        if (!guildId || !guildWarsState.guilds[guildId]) {
            msgEl.innerHTML = '<div style="color:#ff9999;">Nie należysz do żadnej gildii.</div>';
            return;
        }

        let postsFound = 0;
        if (!guild.chat || guild.chat.length === 0) {
            msgEl.innerHTML = '<div style="color:#bbb;">Brak wiadomości w czacie gildii.</div>';
            if (!authorEl) return;
            const key = buildPostActionKey(post);
            if (!missionReactionsSeenKeys.has(key + '_mypost')) {
                missionReactionsSeenKeys.add(key + '_mypost');
                postsFound++;
            }
        });

        if (postsFound > 0) {
            addDailyMissionProgress('writePost', postsFound, { autoSave: true });
            const section = detectCurrentForumSection();
            if (section) {
                addDailyMissionProgress(`postIn_${section.id}`, postsFound, { autoSave: true });
            }
        }
    }

    function saveMissionSeenKeysToState() {
        const account = getBaksyAccount();
        const ms = ensureDailyMissionsState(account);
        ms.reactionsSeenKeys = Array.from(missionReactionsSeenKeys).slice(-500);
        ms.followsSeenKeys = Array.from(missionFollowsSeenKeys).slice(-200);
        ms.topicsSeenKeys = Array.from(missionTopicsSeenKeys).slice(-300);
    }

    function initPlayerMissionsIfNeeded() {
        if (playerMissionsDaily.length > 0 || playerMissionsCyclic.length > 0) return;

        const t = nowTs;
        const mk = (id, type, title, desc, target, baksy, items = [], extra = {}) => ({
            id, type, title, description: desc,
            progress: 0, target, completed: false, claimed: false,
            reward: { baksy, items },
            createdAt: t(), sectionId: null, ...extra
        });

        // ── Misje dzienne ─────────────────────────────────────────
        playerMissionsDaily = [
            // Podstawowe forum
            mk('daily-visit-topics',    'daily', '👀 Czytelnik',       'Odwiedź 5 różnych tematów na forum', 5,  35),
            mk('daily-read-posts',      'daily', '📖 Konsument Wiedzy', 'Przeczytaj 15 postów na forum',      15, 45),
            mk('daily-write-post',      'daily', '✍️ Autor',           'Napisz 2 posty/odpowiedzi na forum',   2,  75, [{ name: 'Atrament Pisarza', rarity: 'common', qty: 1 }]),
            mk('daily-react-post',      'daily', '👍 Reaktor',         'Zareaguj na 3 posty (like/reakcja)',   3,  50),
            mk('daily-follow-topic',    'daily', '🔔 Obserwator',      'Zaobserwuj 1 temat',                   1,  40, [{ name: 'Dzwoneczek', rarity: 'common', qty: 1 }]),
            mk('daily-time-forum',      'daily', '⏱️ Stały Bywalec',  'Spędź 5 minut aktywnie na forum',      5,  60),
            // Sekcje - gry
            mk('daily-visit-metin2',    'daily', '⚔️ Wojownik Metin', 'Odwiedź 2 tematy w dziale Metin2',    2,  55, [], { sectionId: 'metin2' }),
            mk('daily-visit-gry',       'daily', '🎮 Gracz',          'Odwiedź 3 tematy w dziale Gry',        3,  50, [], { sectionId: 'gry' }),
            // Archiwum
            mk('daily-archive-hunter',  'daily', '🏛️ Archeolog',     'Odwiedź temat starszy niż 1 rok',      1,  80, [{ name: 'Zabytkowy Scroll', rarity: 'rare', qty: 1 }]),
            // Chat + MMO
            mk('daily-chat-messages',   'daily', '💬 Gaduła',         'Napisz 5 wiadomości na czacie',        5,  40),
            mk('daily-kill-boss',       'daily', '⚔️ Łowca Bossów',  'Zadaj obrażenia Bossowi (min 100 DMG)', 1, 120, [{ name: 'Boss Token', rarity: 'rare', qty: 1 }]),
            mk('daily-hazard-player',   'daily', '🎲 Hazardzista',    'Zagraj 3 razy w Hazard',                3,  70),
            mk('daily-jackpot',         'daily', '🎰 Jackpot Hunt',   'Wpłać 2 razy do jackpotu',              2,  90, [{ name: 'Jackpot Chip', rarity: 'common', qty: 1 }]),
            // Złożone / nocne
            mk('daily-night-owl',       'daily', '🦉 Nocna Sowa',     '[Ukryta] Napisz post między 22:00 a 4:00', 1, 110, [{ name: 'Nocny Kryształ', rarity: 'epic', qty: 1 }], { hidden: true }),
            mk('daily-deep-archive',    'daily', '📜 Historyk',       '[Ukryta] Odwiedź temat starszy niż 3 lata', 1, 150, [{ name: 'Pergamin Wieków', rarity: 'epic', qty: 1 }], { hidden: true })
        ];

        // ── Misje cykliczne ───────────────────────────────────────
        playerMissionsCyclic = [
            mk('cyclic-treasure',       'cyclic', '🗺️ Łowca Skarbów',  'Wygraj 1 łapankę skarbów',               1, 150, [{ name: 'Golden Key', rarity: 'rare', qty: 1 }]),
            mk('cyclic-auction',        'cyclic', '💎 Dom Aukcyjny',    'Złóż 1 ofertę na aukcji',                 1, 180, [{ name: 'Auction Seal', rarity: 'epic', qty: 1 }]),
            mk('cyclic-post-master',    'cyclic', '🖊️ Mistrz Pióra',   'Napisz łącznie 10 postów na forum',      10, 200, [{ name: 'Złote Pióro', rarity: 'epic', qty: 1 }]),
            mk('cyclic-section-walker', 'cyclic', '🗺️ Turysta Forum',  'Odwiedź 5 różnych działów forum',         5, 160, [{ name: 'Mapa Eksploracji', rarity: 'rare', qty: 1 }]),
            mk('cyclic-reactor',        'cyclic', '⚡ Reaktor',         'Zareaguj na 20 postów w tej sesji',       20, 250, [{ name: 'Energia Reakcji', rarity: 'epic', qty: 1 }]),
            mk('cyclic-follower',       'cyclic', '🔔 Mega-Obserwator', 'Zaobserwuj 5 tematów',                    5, 140, [{ name: 'Złoty Dzwonek', rarity: 'rare', qty: 1 }]),
            mk('cyclic-night-session',  'cyclic', '🌙 Nocna Zmiana',   'Spędź 30 minut aktywnie na forum',        30, 300, [{ name: 'Księżycowy Klejnot', rarity: 'legendary', qty: 1 }]),
            mk('cyclic-boss-champion',  'cyclic', '🏆 Champion Bosów', 'Zadaj łącznie 5000 obrażeń Bossom',     5000, 400, [{ name: 'Trofeum Championa', rarity: 'legendary', qty: 1 }])
        ];
    }

    function checkDailyMissionsReset() {
        if (!playerMissionsDaily.length) return;
        const nowDate = new Date();
        const currentDay = `${nowDate.getUTCFullYear()}-${nowDate.getUTCMonth()}-${nowDate.getUTCDate()}`;
        let resetHappened = false;
        playerMissionsDaily.forEach(mission => {
            const createdDate = new Date(Number(mission.createdAt || 0) * 1000);
            const missionDay = `${createdDate.getUTCFullYear()}-${createdDate.getUTCMonth()}-${createdDate.getUTCDate()}`;
            if (missionDay !== currentDay) {
                mission.progress = 0;
                mission.completed = false;
                mission.claimed = false;
                mission.createdAt = nowTs();
                resetHappened = true;
            }
        });
        if (resetHappened) {
            // Zresetuj seen keys
            missionReactionsSeenKeys = new Set();
            missionFollowsSeenKeys = new Set();
            missionTopicsSeenKeys = new Set();
            missionLastPostCheckAt = 0;
            persistMmoState();
        }
    }

    function getMissionTabSections() {
        // Zwróć unikalne sekcje z misji dziennych do wyfiltrowania
        const sections = new Set();
        playerMissionsDaily.forEach(m => { if (m.sectionId) sections.add(m.sectionId); });
        return Array.from(sections);
    }

    function updateMissionProgress(missionId, amount) {
        const delta = Number(amount || 1);
        const mission = playerMissionsDaily.find(m => m.id === missionId) || playerMissionsCyclic.find(m => m.id === missionId);
        if (!mission || mission.completed) return false;
        mission.progress = Math.min(Number(mission.progress || 0) + delta, Number(mission.target || 1));
        if (mission.progress >= mission.target) mission.completed = true;
        persistMmoState();
        return true;
    }

    function claimMissionReward(missionId) {
        const mission = playerMissionsDaily.find(m => m.id === missionId) || playerMissionsCyclic.find(m => m.id === missionId);
        if (!mission || !mission.completed || mission.claimed) return { ok: false, message: 'Nie można odebrać nagrody.' };
        mission.claimed = true;
        const rewardBaksy = Number((mission.reward || {}).baksy || 0);
        if (rewardBaksy > 0) awardBaksy(rewardBaksy, 'mission_reward', { missionId }, { disableNightMultiplier: true });

        const rewardItems = Array.isArray((mission.reward || {}).items) ? mission.reward.items : [];
        rewardItems.forEach(item => {
            playerMissionInventory.push({
                uid: `mi-${nowTs()}-${Math.random().toString(36).slice(2, 7)}`,
                name: String(item.name || 'Item'),
                rarity: String(item.rarity || 'common'),
                qty: Math.max(1, Number(item.qty || 1)),
                acquiredAt: nowTs(),
                canAuction: true
            });
        });

        if (mission.type === 'cyclic') {
            mission.progress = 0;
            mission.completed = false;
            mission.claimed = false;
            mission.createdAt = nowTs();
        }

        emitMmoEvent('mission:claimed', { missionId, userId: getRuntimeUserId(), at: nowTs() });

        persistMmoState();
        return { ok: true, message: `✅ Otrzymano: ${rewardBaksy} 💵 oraz ${rewardItems.length} przedmiot(ów).` };
    }

    function initBaksyHubIfNeeded() {
        if (document.getElementById('sebus-baksy-hub-open')) return;

        const openBtn = document.createElement('button');
        openBtn.id = 'sebus-baksy-hub-open';
        openBtn.type = 'button';
        openBtn.textContent = '🛡️ Baksy Hub';

        const hub = document.createElement('div');
        hub.id = 'sebus-baksy-hub';
        hub.className = 'sebus-baksy-ui-mmo sebus-hub-container';
        hub.innerHTML = `
            <div class="sebus-baksy-hub-top">
                <div>
                    <div class="sebus-baksy-hub-title sebus-hub-title">💎 Sebuś-Baksy Hub</div>
                    <div class="sebus-baksy-hub-subtitle">Panel Konta • Ekwipunek • Sklep</div>
                </div>
                <div class="sebus-baksy-chip">MMO Event</div>
            </div>
            <div id="sebus-baksy-hub-balance" class="sebus-baksy-hub-balance">0 💵</div>
            <div id="sebus-baksy-hub-stats" class="sebus-baksy-hub-muted">zarobione: 0 | wydane: 0</div>

            <div class="sebus-baksy-grid">
                <div class="sebus-baksy-card sebus-baksy-card--shop sebus-card-area">
                    <h4 class="sebus-hub-title">🛒 Sklep Prestiżu</h4>
                    <div style="font-size:9px;color:#9a9a9a;margin-bottom:6px;">Efekty dotyczą <strong>Twojego</strong> konta i nicka</div>

                    <div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:6px;">
                        <button id="sebus-hub-buy-rain" class="sebus-mmo-btn" type="button" style="flex:1;min-width:130px;">🌧️ Złoty Deszcz ($120)</button>
                        <button id="sebus-hub-buy-xp" class="sebus-mmo-btn" type="button" style="flex:1;min-width:130px;">⚡ Boost XP x1.5/$200</button>
                    </div>

                    <div style="border-top:1px solid rgba(255,214,110,.12);padding-top:6px;margin-bottom:6px;">
                        <div style="font-size:10px;font-weight:700;margin-bottom:4px;">✨ Kolor Neonu (własny nick)</div>
                        <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:5px;">
                            <button id="sebus-hub-buy-red" class="sebus-mmo-btn sebus-neon-red-btn" type="button" style="flex:1;">🔴 $80</button>
                            <button id="sebus-hub-buy-purple" class="sebus-mmo-btn sebus-neon-violet-btn" type="button" style="flex:1;">🟣 $80</button>
                            <button id="sebus-hub-buy-gold" class="sebus-mmo-btn" type="button" style="flex:1;color:#ffd700;">🟡 $90</button>
                            <button id="sebus-hub-buy-mint" class="sebus-mmo-btn" type="button" style="flex:1;color:#67ffbf;">🟢 $90</button>
                        </div>
                        <div style="display:flex;gap:4px;align-items:center;">
                            <input id="sebus-hub-neon-custom-color" type="color" value="#00cfff" style="width:34px;height:28px;padding:1px;border:1px solid rgba(255,214,110,.3);border-radius:4px;background:transparent;cursor:pointer;">
                            <button id="sebus-hub-buy-neon-custom" class="sebus-mmo-btn" type="button" style="flex:1;">Własny kolor ($100)</button>
                            <button id="sebus-hub-buy-neon-clear" class="sebus-mmo-btn" type="button" style="flex:1;font-size:10px;opacity:.7;">Usuń neon</button>
                        </div>
                    </div>

                    <div style="border-top:1px solid rgba(255,214,110,.12);padding-top:6px;margin-bottom:6px;">
                        <div style="font-size:10px;font-weight:700;margin-bottom:4px;">🌐 Efekty widoczne dla innych</div>
                        <div style="display:flex;gap:4px;align-items:center;margin-bottom:5px;">
                            <input id="sebus-hub-emoji-input" type="text" maxlength="2" placeholder="🔥" style="width:44px;text-align:center;font-size:16px;">
                            <button id="sebus-hub-buy-emoji" class="sebus-mmo-btn" type="button" style="flex:1;">Emoji na profilu ($140)</button>
                        </div>
                        <div style="display:flex;gap:4px;align-items:center;">
                            <input id="sebus-hub-nick-hl-color" type="color" value="#ffd700" style="width:34px;height:28px;padding:1px;border:1px solid rgba(255,214,110,.3);border-radius:4px;background:transparent;cursor:pointer;">
                            <button id="sebus-hub-buy-nick-hl" class="sebus-mmo-btn" type="button" style="flex:1;">Podświetl nick ($180)</button>
                        </div>
                    </div>

                    <div style="border-top:1px solid rgba(255,214,110,.12);padding-top:6px;margin-bottom:6px;">
                        <div style="font-size:10px;font-weight:700;margin-bottom:4px;">🏷️ Tytuł w Rankingu (7 dni, max 30 znaków)</div>
                        <div style="display:flex;gap:4px;">
                            <input id="sebus-hub-title-input" type="text" maxlength="30" placeholder="Np. Legenda Forum...">
                            <button id="sebus-hub-buy-title" class="sebus-mmo-btn" type="button" style="white-space:nowrap;">Kup ($250)</button>
                        </div>
                    </div>

                    <div style="border-top:1px solid rgba(255,214,110,.12);padding-top:6px;">
                        <div style="font-size:10px;font-weight:700;margin-bottom:4px;">🌟 Wyróżnij Post</div>
                        <div style="display:flex;gap:4px;">
                            <input id="sebus-hub-highlight-id" type="text" placeholder="ID posta">
                            <button id="sebus-hub-buy-highlight" class="sebus-mmo-btn" type="button" style="white-space:nowrap;">Kup ($60)</button>
                        </div>
                    </div>
                </div>

                <div class="sebus-baksy-card sebus-baksy-card--inventory sebus-card-area">
                    <h4 class="sebus-hub-title">🎒 Ekwipunek</h4>
                    <div id="sebus-baksy-inventory" style="font-size:10px;max-height:150px;overflow-y:auto;border:1px solid rgba(255,214,110,.12);border-radius:6px;padding:6px;background:rgba(0,0,0,.2);">
                        <div style="color:#999;">Brak przedmiotów</div>
                    </div>
                </div>
            </div>

            <div class="sebus-baksy-card sebus-baksy-card--transfer sebus-card-area" style="margin-top:8px;">
                <h4 class="sebus-hub-title">💸 Przelew</h4>
                <input id="sebus-hub-transfer-to" type="text" placeholder="ID odbiorcy">
                <input id="sebus-hub-transfer-amount" type="number" min="1" step="1" placeholder="Kwota">
                <button id="sebus-hub-transfer-btn" class="sebus-mmo-btn" type="button">Wyślij baksy</button>
                <div id="sebus-baksy-hub-feedback"></div>
            </div>

            <div id="sebus-baksy-hub-history"></div>
        `;

        document.body.appendChild(openBtn);
        document.body.appendChild(hub);

        openBtn.addEventListener('click', (e) => {
            e.preventDefault();
            hub.classList.toggle('show');
            syncBaksyUiSummary();
        });

        const feedbackEl = hub.querySelector('#sebus-baksy-hub-feedback');
        const inventoryEl = hub.querySelector('#sebus-baksy-inventory');

        const shopFeedback = (result) => {
            feedbackEl.textContent = result.message;
            syncBaksyUiSummary();
            scheduleModules(['baksy', 'nickGlow'], { immediate: true });
        };

        hub.querySelector('#sebus-hub-buy-rain').addEventListener('click', () => shopFeedback(purchaseBaksyItem('goldRain')));
        hub.querySelector('#sebus-hub-buy-xp').addEventListener('click', () => shopFeedback(purchaseBaksyItem('xpBoost')));
        hub.querySelector('#sebus-hub-buy-red').addEventListener('click', () => shopFeedback(purchaseBaksyItem('neonRed')));
        hub.querySelector('#sebus-hub-buy-purple').addEventListener('click', () => shopFeedback(purchaseBaksyItem('neonPurple')));
        hub.querySelector('#sebus-hub-buy-gold').addEventListener('click', () => shopFeedback(purchaseBaksyItem('neonGold')));
        hub.querySelector('#sebus-hub-buy-mint').addEventListener('click', () => shopFeedback(purchaseBaksyItem('neonMint')));
        hub.querySelector('#sebus-hub-buy-neon-custom').addEventListener('click', () => {
            const color = hub.querySelector('#sebus-hub-neon-custom-color').value;
            shopFeedback(purchaseBaksyItem('neonCustom', { color }));
        });
        hub.querySelector('#sebus-hub-buy-neon-clear').addEventListener('click', () => shopFeedback(purchaseBaksyItem('neonClear')));
        hub.querySelector('#sebus-hub-buy-emoji').addEventListener('click', () => {
            const emoji = hub.querySelector('#sebus-hub-emoji-input').value.trim() || '🔥';
            shopFeedback(purchaseBaksyItem('profileEmoji', { emoji }));
        });
        hub.querySelector('#sebus-hub-buy-nick-hl').addEventListener('click', () => {
            const color = hub.querySelector('#sebus-hub-nick-hl-color').value;
            shopFeedback(purchaseBaksyItem('nickHighlight', { color }));
        });
        hub.querySelector('#sebus-hub-buy-title').addEventListener('click', () => {
            const title = hub.querySelector('#sebus-hub-title-input').value.trim();
            shopFeedback(purchaseBaksyItem('titleChange', { title }));
        });
        hub.querySelector('#sebus-hub-buy-highlight').addEventListener('click', () => {
            const postId = hub.querySelector('#sebus-hub-highlight-id').value.trim();
            shopFeedback(purchaseBaksyItem('highlightPost', { postId }));
        });

        hub.querySelector('#sebus-hub-transfer-btn').addEventListener('click', () => {
            const to = hub.querySelector('#sebus-hub-transfer-to').value.trim();
            const amount = hub.querySelector('#sebus-hub-transfer-amount').value;
            const result = transferBaksy(to, amount);
            feedbackEl.textContent = result.message;
            if (result.ok) scheduleModule('baksy', { immediate: true });
        });



        document.addEventListener('click', (e) => {
            if (!hub.classList.contains('show')) return;
            if (hub.contains(e.target) || openBtn.contains(e.target)) return;
            hub.classList.remove('show');
        });
    }

    function initHazardPanelIfNeeded() {
        if (document.getElementById('sebus-hazard-panel')) return;

        const panel = document.createElement('div');
        panel.id = 'sebus-hazard-panel';
        panel.className = 'sebus-baksy-ui-mmo sebus-hub-container';
        panel.style.display = 'none';
        panel.innerHTML = `
            <div class="sebus-baksy-hub-top">
                <div>
                    <div class="sebus-baksy-hub-title sebus-hub-title">🎰 Hazard - Kasyna</div>
                    <div class="sebus-baksy-hub-subtitle">Coin Flip • Automaty • Blackjack</div>
                </div>
                <div class="sebus-baksy-chip">Gry Na Pieniądze</div>
            </div>

            <div class="sebus-baksy-grid">
                <div class="sebus-baksy-card sebus-baksy-card--casino sebus-card-area">
                    <h4 class="sebus-hub-title">🎲 Gry Hazardowe</h4>
                    
                    <div style="margin-bottom:12px;">
                        <label style="display:block;font-size:11px;margin-bottom:4px;">Stawka:</label>
                        <input id="sebus-hazard-bet" type="number" min="1" step="1" placeholder="Kwota" style="width:100%;padding:6px;border-radius:4px;border:1px solid rgba(255,214,110,.2);background:rgba(0,0,0,.2);color:#ffd66e;">
                    </div>

                    <div style="border-top:1px solid rgba(255,214,110,.12);padding-top:8px;margin-bottom:8px;">
                        <h5 style="margin:0 0 8px 0;font-size:12px;">🦅 Orła Czy Reszkę?</h5>
                        <div style="display:flex;gap:6px;margin-bottom:8px;">
                            <select id="sebus-hazard-coinflip-side" style="flex:1;padding:6px;border-radius:4px;border:1px solid rgba(255,214,110,.2);background:rgba(0,0,0,.2);color:#ffd66e;">
                                <option value="heads">🦅 Orzeł</option>
                                <option value="tails">🌙 Reszka</option>
                            </select>
                            <button id="sebus-hazard-coinflip" class="sebus-mmo-btn" type="button" style="flex:1;">Graj!</button>
                        </div>
                        <div id="sebus-hazard-coinflip-result" style="font-size:11px;text-align:center;padding:6px;background:rgba(0,0,0,.2);border-radius:4px;color:#999;">-</div>
                    </div>

                    <div style="border-top:1px solid rgba(255,214,110,.12);padding-top:8px;margin-bottom:8px;">
                        <h5 style="margin:0 0 8px 0;font-size:12px;">🎰 Automaty Hazardowe</h5>
                        <div id="sebus-hazard-slots-display" style="display:flex;justify-content:space-around;align-items:center;padding:12px;background:rgba(0,0,0,.3);border-radius:6px;margin-bottom:8px;font-size:24px;">
                            <div class="sebus-hazard-reel">🍒</div>
                            <div class="sebus-hazard-reel">🍋</div>
                            <div class="sebus-hazard-reel">⭐</div>
                        </div>
                        <button id="sebus-hazard-slots" class="sebus-mmo-btn" type="button" style="width:100%;">Spin!</button>
                    </div>

                    <div style="border-top:1px solid rgba(255,214,110,.12);padding-top:8px;">
                        <h5 style="margin:0 0 8px 0;font-size:12px;">🃏 Blackjack (Oczko)</h5>
                        <div style="display:flex;gap:4px;margin-bottom:8px;font-size:11px;">
                            <div style="flex:1;padding:6px;background:rgba(0,0,0,.3);border-radius:4px;text-align:center;">
                                <div style="color:#999;font-size:10px;">Krupier</div>
                                <div id="sebus-hazard-bj-dealer">-</div>
                            </div>
                            <div style="flex:1;padding:6px;background:rgba(0,0,0,.3);border-radius:4px;text-align:center;">
                                <div style="color:#999;font-size:10px;">Gracz</div>
                                <div id="sebus-hazard-bj-player">-</div>
                            </div>
                        </div>
                        <div style="display:flex;gap:4px;">
                            <button id="sebus-hazard-bj-deal" class="sebus-mmo-btn" type="button" style="flex:1;font-size:11px;">Deal</button>
                            <button id="sebus-hazard-bj-hit" class="sebus-mmo-btn" type="button" style="flex:1;font-size:11px;">Hit</button>
                            <button id="sebus-hazard-bj-stand" class="sebus-mmo-btn" type="button" style="flex:1;font-size:11px;">Stand</button>
                        </div>
                    </div>
                </div>
            </div>

            <div id="sebus-hazard-feedback" class="sebus-baksy-hub-feedback" style="margin-top:8px;padding:8px;background:rgba(0,0,0,.2);border-radius:4px;text-align:center;font-size:12px;color:#999;border:1px solid rgba(255,214,110,.12);">
                Wybierz grę i stawkę
            </div>
        `;
        document.body.appendChild(panel);

        const feedbackEl = panel.querySelector('#sebus-hazard-feedback');
        const coinflipResultEl = panel.querySelector('#sebus-hazard-coinflip-result');
        const slotReels = Array.from(panel.querySelectorAll('.sebus-hazard-reel'));
        const slotsDisplayEl = panel.querySelector('#sebus-hazard-slots-display');
        const bjDealerEl = panel.querySelector('#sebus-hazard-bj-dealer');
        const bjPlayerEl = panel.querySelector('#sebus-hazard-bj-player');

        let baksySlotSpinning = false;

        const setCasinoMessage = (message, status = 'neutral') => {
            feedbackEl.textContent = message;
            feedbackEl.classList.remove('sebus-casino-status-win', 'sebus-casino-status-lose', 'sebus-casino-status-neutral');
            if (status === 'win') feedbackEl.classList.add('sebus-casino-status-win');
            else if (status === 'lose') feedbackEl.classList.add('sebus-casino-status-lose');
            else feedbackEl.classList.add('sebus-casino-status-neutral');
        };

        const renderBlackjackBoard = (state) => {
            if (!state) {
                bjDealerEl.textContent = '-';
                bjPlayerEl.textContent = '-';
                return;
            }

            const dealerCards = state.dealerCards || [];
            const playerCards = state.playerCards || [];
            const hiddenDealerCards = state.phase === 'active'
                ? [dealerCards[0] ? dealerCards[0].label : '?', '?']
                : dealerCards.map(card => card.label);

            bjDealerEl.textContent = `${hiddenDealerCards.join(' ')} (${state.phase === 'active' ? '?' : state.dealerTotal})`;
            bjPlayerEl.textContent = `${playerCards.map(card => card.label).join(' ')} (${state.playerTotal})`;
        };

        const setSlotsSymbols = (symbols) => {
            symbols.forEach((symbol, index) => {
                if (slotReels[index]) slotReels[index].textContent = symbol;
            });
        };

        panel.querySelector('#sebus-hazard-coinflip').addEventListener('click', () => {
            const bet = panel.querySelector('#sebus-hazard-bet').value;
            const side = panel.querySelector('#sebus-hazard-coinflip-side').value;
            const result = playBaksyCoinflip(bet, side);
            if (result.ok) {
                const label = result.landed === 'heads' ? '🦅 Orzeł' : '🌙 Reszka';
                coinflipResultEl.textContent = label;
                emitMmoEvent('hazard:played', { game: 'coinflip', at: nowTs() });
            }
            setCasinoMessage(result.message, result.status || 'neutral');
            scheduleModule('baksy', { immediate: true });
        });

        panel.querySelector('#sebus-hazard-slots').addEventListener('click', () => {
            const bet = panel.querySelector('#sebus-hazard-bet').value;
            if (baksySlotSpinning) return;
            baksySlotSpinning = true;
            const symbols = ['🍒', '🍋', '⭐', '7️⃣', '💎'];
            slotsDisplayEl.classList.add('spinning');
            slotReels.forEach(reel => reel.classList.add('spin'));

            let ticks = 0;
            const spinInterval = setInterval(() => {
                ticks += 1;
                setSlotsSymbols([
                    symbols[Math.floor(Math.random() * symbols.length)],
                    symbols[Math.floor(Math.random() * symbols.length)],
                    symbols[Math.floor(Math.random() * symbols.length)]
                ]);

                if (ticks >= 8) {
                    clearInterval(spinInterval);
                    const result = playBaksySlots(bet);
                    if (Array.isArray(result.roll)) setSlotsSymbols(result.roll);
                    if (result.ok) emitMmoEvent('hazard:played', { game: 'slots', at: nowTs() });
                    slotReels.forEach(reel => reel.classList.remove('spin'));
                    slotsDisplayEl.classList.remove('spinning');
                    baksySlotSpinning = false;
                    setCasinoMessage(result.message, result.status || 'neutral');
                    scheduleModule('baksy', { immediate: true });
                }
            }, 85);
        });

        panel.querySelector('#sebus-hazard-bj-deal').addEventListener('click', () => {
            const bet = panel.querySelector('#sebus-hazard-bet').value;
            const result = playBaksyBlackjack('deal', bet);
            renderBlackjackBoard(result.state || baksyBlackjackState);
            if (result.ok) emitMmoEvent('hazard:played', { game: 'blackjack', at: nowTs() });
            setCasinoMessage(result.message, result.status || 'neutral');
            scheduleModule('baksy', { immediate: true });
        });

        panel.querySelector('#sebus-hazard-bj-hit').addEventListener('click', () => {
            const result = playBaksyBlackjack('hit');
            renderBlackjackBoard(result.state || baksyBlackjackState);
            setCasinoMessage(result.message, result.status || 'neutral');
            scheduleModule('baksy', { immediate: true });
        });

        panel.querySelector('#sebus-hazard-bj-stand').addEventListener('click', () => {
            const result = playBaksyBlackjack('stand');
            renderBlackjackBoard(result.state || baksyBlackjackState);
            setCasinoMessage(result.message, result.status || 'neutral');
            scheduleModule('baksy', { immediate: true });
        });

        document.addEventListener('click', (e) => {
            if (panel.style.display !== 'block') return;
            if (panel.contains(e.target)) return;
            const hazardBtn = document.getElementById('sebus-nav-hazard-btn');
            if (hazardBtn && hazardBtn.contains(e.target)) return;
            panel.style.display = 'none';
        });
    }

    function initMissionsPanelIfNeeded() {
        if (document.getElementById('sebus-missions-panel')) return;
        initPlayerMissionsIfNeeded();
        checkDailyMissionsReset();

        const RARITY_COLORS = { common: '#9cffb3', uncommon: '#7bcfff', rare: '#a78bfa', epic: '#f472b6', legendary: '#facc15' };
        const RARITY_LABELS = { common: 'Pospolita', uncommon: 'Niepospolita', rare: 'Rzadka', epic: 'Epicka', legendary: 'Legendarna' };
        const SECTION_EMOJIS = { metin2: '⚔️', lineage: '🏰', 'lost-ark': '🚀', lostart: '🚀', wow: '🌍', gry: '🎮', rpg: '🐉', offtopic: '💬', ogolne: '📢', technika: '🔧', hardware: '💻', software: '📦', news: '📰', sport: '⚽', muzyka: '🎵', film: '🎬' };

        const panel = document.createElement('div');
        panel.id = 'sebus-missions-panel';
        panel.className = 'sebus-baksy-ui-mmo sebus-hub-container';
        panel.style.cssText = 'display:none;min-width:320px;max-width:400px;';
        panel.innerHTML = `
            <div class="sebus-baksy-hub-top">
                <div>
                    <div class="sebus-baksy-hub-title sebus-hub-title">📋 Misje & Łapanka</div>
                    <div id="sebus-missions-subtitle" class="sebus-baksy-hub-subtitle">Dzienne • Cykliczne • Łapanka</div>
                </div>
                <div class="sebus-baksy-chip">Questy MMO</div>
            </div>
            <div style="display:flex;gap:5px;margin-bottom:8px;flex-wrap:wrap;">
                <button id="sebus-missions-tab-daily" class="sebus-mmo-btn" type="button" style="flex:1;height:26px;font-size:10px;min-width:60px;">📅 Dzienne</button>
                <button id="sebus-missions-tab-cyclic" class="sebus-mmo-btn" type="button" style="flex:1;height:26px;font-size:10px;min-width:60px;">♻️ Cykliczne</button>
                <button id="sebus-missions-tab-hunt" class="sebus-mmo-btn" type="button" style="flex:1;height:26px;font-size:10px;min-width:60px;">🗺️ Łapanka</button>
                <button id="sebus-missions-tab-inventory" class="sebus-mmo-btn" type="button" style="flex:1;height:26px;font-size:10px;min-width:60px;">🎒 Ekwipunek</button>
            </div>
            <div id="sebus-missions-list" style="max-height:380px;overflow-y:auto;padding-right:2px;"></div>
        `;
        document.body.appendChild(panel);

        const dailyTab = panel.querySelector('#sebus-missions-tab-daily');
        const cyclicTab = panel.querySelector('#sebus-missions-tab-cyclic');
        const huntTab = panel.querySelector('#sebus-missions-tab-hunt');
        const inventoryTab = panel.querySelector('#sebus-missions-tab-inventory');
        const listEl = panel.querySelector('#sebus-missions-list');
        const subtitleEl = panel.querySelector('#sebus-missions-subtitle');

        const currentSection = detectCurrentForumSection ? detectCurrentForumSection() : null;

        const renderMissionCard = (mission, highlightSection) => {
            const progress = Number(mission.progress || 0);
            const target = Math.max(1, Number(mission.target || 1));
            const percent = Math.min(100, Math.round((progress / target) * 100));
            const rarity = mission.rarity || 'common';
            const rarityCol = RARITY_COLORS[rarity] || '#ccc';
            const rarityLbl = RARITY_LABELS[rarity] || rarity;
            const items = Array.isArray((mission.reward || {}).items) ? mission.reward.items : [];
            const rewardItemsLabel = items.length ? items.map(item => item.name).join(', ') : '';
            const canClaim = !!mission.completed && !mission.claimed;
            const isDone = !!mission.completed;
            const sectionId = mission.sectionId || '';
            const sectionEmoji = sectionId ? (SECTION_EMOJIS[sectionId] || '📂') : '';
            const isCurrentSection = highlightSection && sectionId && currentSection && currentSection.id === sectionId;
            const isHidden = !!mission.hidden;

            return `
                <div style="padding:9px 10px;border:1px solid ${isCurrentSection ? 'rgba(103,255,191,.35)' : 'rgba(255,214,110,.12)'};border-radius:9px;background:${isCurrentSection ? 'rgba(103,255,191,.07)' : 'rgba(0,0,0,.22)'};margin-bottom:7px;">
                    <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                        <strong style="font-size:11px;flex:1;">${escapeHtml(mission.title || 'Misja')}</strong>
                        ${sectionId ? `<span style="background:rgba(255,255,255,.08);border-radius:4px;padding:1px 5px;font-size:9px;">${sectionEmoji} ${escapeHtml(sectionId)}</span>` : ''}
                        ${isHidden ? '<span style="background:rgba(244,114,182,.18);border-radius:4px;padding:1px 5px;font-size:9px;color:#f472b6;">🔒 Ukryta</span>' : ''}
                        <span style="font-size:9px;color:${rarityCol};">${rarityLbl}</span>
                    </div>
                    <div style="font-size:10px;color:#ccc;margin-top:3px;">${escapeHtml(mission.description || '')}</div>
                    <div style="margin-top:6px;height:6px;background:rgba(255,255,255,.07);border-radius:999px;overflow:hidden;">
                        <div style="height:6px;width:${percent}%;background:${isDone ? '#67ffbf' : rarityCol};border-radius:999px;"></div>
                    </div>
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:5px;font-size:9px;color:#bbb;gap:6px;">
                        <span>${progress}/${target}${rewardItemsLabel ? ' • 🎁 ' + escapeHtml(rewardItemsLabel) : ''}</span>
                        <span style="display:flex;align-items:center;gap:5px;white-space:nowrap;">
                            <span style="color:#ffd66e;">${normalizeBaksyNumber((mission.reward || {}).baksy || 0)} 💵</span>
                            <button class="sebus-mmo-btn" type="button" data-mission-claim="${escapeHtml(mission.id)}" style="height:20px;font-size:9px;padding:0 7px;" ${canClaim ? '' : 'disabled'}>${isDone && !mission.claimed ? '✅ Odbierz' : isDone ? 'Odebrano' : 'W toku'}</button>
                        </span>
                    </div>
                </div>
            `;
        };

        const renderHuntTab = () => {
            const account = getBaksyAccount();
            const state = ensureDailyMissionsState(account);
            const progress = state.progress || {};
            const sections = Object.values(FORUM_SECTION_MAP || {});
            const totalSectionsVisited = sections.filter(section => Number(progress[`visitIn_${section.id}`] || 0) > 0).length;
            const huntStatus = treasureHuntState.active ? '🎯 AKTYWNA' : '⏳ Oczekuje';
            const huntClue = treasureHuntState.active ? (treasureHuntState.clue || 'Brak wskazówki') : 'Kliknij „Rozpocznij łapankę”';

            let html = `
                <div style="font-size:10px;color:#ffd66e;margin-bottom:8px;padding:7px 9px;background:rgba(255,214,110,.08);border-radius:7px;">
                    🗺️ Łapanka: <strong>${huntStatus}</strong>
                </div>
                <div style="font-size:10px;color:#ddd;margin-bottom:8px;padding:7px 9px;background:rgba(255,255,255,.05);border-radius:7px;">
                    📌 Wskazówka: ${escapeHtml(huntClue)}
                </div>
                <div style="display:flex;gap:6px;margin-bottom:8px;">
                    <button class="sebus-mmo-btn" type="button" data-mission-hunt-start style="flex:1;height:26px;font-size:10px;" ${treasureHuntState.active ? 'disabled' : ''}>🗺️ Rozpocznij</button>
                    <button class="sebus-mmo-btn" type="button" data-mission-hunt-claim style="flex:1;height:26px;font-size:10px;" ${treasureHuntState.active ? '' : 'disabled'}>💰 Odbierz</button>
                </div>
                <div style="font-size:10px;color:#ffd66e;margin-bottom:8px;padding:6px 8px;background:rgba(255,214,110,.07);border-radius:6px;">
                    🌍 Eksploracja sekcji: <strong>${totalSectionsVisited}/${sections.length || 0}</strong>
                </div>
            `;

            sections.forEach(section => {
                const visits = Number(progress[`visitIn_${section.id}`] || 0);
                const posts = Number(progress[`postIn_${section.id}`] || 0);
                const reacts = Number(progress[`reactIn_${section.id}`] || 0);
                const isCurrentSection = currentSection && currentSection.id === section.id;
                html += `
                    <div style="padding:7px 9px;border:1px solid ${isCurrentSection ? 'rgba(103,255,191,.3)' : 'rgba(255,255,255,.08)'};border-radius:8px;margin-bottom:6px;background:${isCurrentSection ? 'rgba(103,255,191,.06)' : 'rgba(0,0,0,.18)'};">
                        <div style="display:flex;justify-content:space-between;align-items:center;font-size:10px;">
                            <span><strong>${escapeHtml(section.emoji || '')} ${escapeHtml(section.name || section.id)}</strong>${isCurrentSection ? ' <span style="color:#67ffbf;font-size:9px;">← jesteś tutaj</span>' : ''}</span>
                            <span style="font-size:9px;color:#aaa;">${escapeHtml(section.category || '')}</span>
                        </div>
                        <div style="display:flex;gap:10px;margin-top:4px;font-size:9px;color:#ccc;">
                            <span>👁️ ${visits}</span>
                            <span>✍️ ${posts}</span>
                            <span>👍 ${reacts}</span>
                        </div>
                    </div>
                `;
            });

            listEl.innerHTML = html;
        };

        const renderInventory = () => {
            if (!playerMissionInventory || !playerMissionInventory.length) {
                listEl.innerHTML = '<div style="font-size:10px;color:#aaa;padding:14px;text-align:center;">Brak przedmiotów w ekwipunku.</div>';
                return;
            }
            listEl.innerHTML = playerMissionInventory.map((item, index) => `
                <div style="padding:8px 10px;border:1px solid rgba(255,214,110,.12);border-radius:8px;background:rgba(0,0,0,.22);margin-bottom:7px;display:flex;justify-content:space-between;align-items:center;gap:8px;">
                    <div style="font-size:10px;">
                        <div style="font-weight:bold;">${escapeHtml(item.name || 'Przedmiot')}</div>
                        <div style="color:${RARITY_COLORS[item.rarity] || '#ccc'};margin-top:2px;">${RARITY_LABELS[item.rarity] || item.rarity} × ${normalizeBaksyNumber(item.qty || 1)}</div>
                    </div>
                    <button class="sebus-mmo-btn" type="button" data-mission-auction="${index}" style="height:22px;font-size:9px;padding:0 8px;" ${item.canAuction ? '' : 'disabled'}>${item.canAuction ? '📦 Wystaw' : 'Wystawiono'}</button>
                </div>
            `).join('');
        };

        const render = () => {
            if (!playerMissionsDaily.length && !playerMissionsCyclic.length) initPlayerMissionsIfNeeded();
            if (dailyTab.classList.contains('sebus-active')) {
                const doneCount = playerMissionsDaily.filter(mission => mission.completed).length;
                subtitleEl.textContent = `Dzienne — ${doneCount}/${playerMissionsDaily.length} ukończonych`;
                listEl.innerHTML = playerMissionsDaily.map(mission => renderMissionCard(mission, true)).join('') || '<div style="font-size:10px;color:#aaa;padding:14px;text-align:center;">Brak misji dziennych.</div>';
                return;
            }
            if (cyclicTab.classList.contains('sebus-active')) {
                const doneCount = playerMissionsCyclic.filter(mission => mission.completed).length;
                subtitleEl.textContent = `Cykliczne — ${doneCount}/${playerMissionsCyclic.length} ukończonych`;
                listEl.innerHTML = playerMissionsCyclic.map(mission => renderMissionCard(mission, false)).join('') || '<div style="font-size:10px;color:#aaa;padding:14px;text-align:center;">Brak misji cyklicznych.</div>';
                return;
            }
            if (huntTab.classList.contains('sebus-active')) {
                subtitleEl.textContent = 'Łapanka — zintegrowana z misjami';
                renderHuntTab();
                return;
            }
            subtitleEl.textContent = 'Ekwipunek — zdobyte przedmioty';
            renderInventory();
        };

        const activateTab = (name) => {
            dailyTab.classList.toggle('sebus-active', name === 'daily');
            cyclicTab.classList.toggle('sebus-active', name === 'cyclic');
            huntTab.classList.toggle('sebus-active', name === 'hunt');
            inventoryTab.classList.toggle('sebus-active', name === 'inventory');
            render();
        };

        dailyTab.addEventListener('click', () => activateTab('daily'));
        cyclicTab.addEventListener('click', () => activateTab('cyclic'));
        huntTab.addEventListener('click', () => activateTab('hunt'));
        inventoryTab.addEventListener('click', () => activateTab('inventory'));

        listEl.addEventListener('click', (event) => {
            const target = event.target.closest('button');
            if (!target) return;

            const missionId = target.getAttribute('data-mission-claim');
            if (missionId) {
                const result = claimMissionReward(missionId);
                if (result && result.message) {
                    sebusUiAlert('Misje', result.message, result.ok ? 'success' : 'info');
                }
                syncBaksyUiSummary();
                render();
                return;
            }

            if (target.hasAttribute('data-mission-hunt-start')) {
                startTreasureHunt();
                persistMmoState(true);
                render();
                return;
            }

            if (target.hasAttribute('data-mission-hunt-claim')) {
                const result = claimTreasure(getRuntimeUserId());
                if (result && result.message) {
                    sebusUiAlert('Łapanka', result.message, result.ok ? 'success' : 'info');
                }
                persistMmoState(true);
                render();
                return;
            }

            const itemIndexRaw = target.getAttribute('data-mission-auction');
            if (itemIndexRaw !== null && itemIndexRaw !== undefined) {
                const itemIndex = Number(itemIndexRaw);
                const item = playerMissionInventory[itemIndex];
                if (!item || !item.canAuction) return;
                if (auctionState.currentLot) {
                    sebusUiAlert('Aukcje', 'Najpierw zakończ aktualną aukcję.', 'warning');
                    return;
                }
                const startBid = Math.max(20, Math.floor((item.rarity === 'legendary' ? 380 : item.rarity === 'epic' ? 240 : item.rarity === 'rare' ? 140 : 80) * Math.max(1, Number(item.qty || 1))));
                startNewAuction(`${item.name} [MISJA]`, startBid);
                item.canAuction = false;
                persistMmoState(true);
                sebusUiAlert('Aukcje', `Wystawiono "${item.name}" na aukcję (start: ${startBid} 💵).`, 'success');
                render();
            }
        });

        activateTab('daily');

        document.addEventListener('click', (event) => {
            if (panel.style.display !== 'block') return;
            if (panel.contains(event.target)) return;
            const missionsBtn = document.getElementById('sebus-nav-missions-btn');
            if (missionsBtn && missionsBtn.contains(event.target)) return;
            panel.style.display = 'none';
        });
    }

    function resolveRankingDisplayName(userId, storedName) {
        const uid = String(userId || '').trim();
        if (!uid) return storedName || 'Gracz';
        // Anon users → "Anonim"
        if (/^anon_/i.test(uid)) return 'Anonim';

        // Szukaj w DOM po data-memberid lub data-mentionid — zarówno na <a> jak i na rodzicu
        const candidates = [
            ...Array.from(document.querySelectorAll(`a[data-memberid="${uid}"]`)),
            ...Array.from(document.querySelectorAll(`a[data-mentionid="${uid}"]`)),
            ...Array.from(document.querySelectorAll(`[data-mentionid="${uid}"]`)),
            ...Array.from(document.querySelectorAll(`[data-memberid="${uid}"]`))
        ];
        for (const el of candidates) {
            // Pobierz bezpośredni tekstContent, pomijając zagnieżdżone ikony/emoji (span.ipsUserPhoto itd.)
            let nick = '';
            // Preferuj dzieci tekstowe bezpośrednio lub span z nickiem
            for (const child of el.childNodes) {
                if (child.nodeType === Node.TEXT_NODE) {
                    nick = child.textContent.replace(/^@/, '').trim();
                    if (nick) break;
                }
            }
            if (!nick) {
                // Fallback — pełny textContent bez obrazków
                const clone = el.cloneNode(true);
                clone.querySelectorAll('img, .ipsUserPhoto, .sebus-shared-profile-emoji').forEach(n => n.remove());
                nick = (clone.textContent || '').replace(/^@/, '').trim();
            }
            if (nick && nick !== uid) return nick;
        }

        // Sprawdź w shared leaderboard cache (account.displayName z Firebase)
        if (baksyWorldCache && Array.isArray(baksyWorldCache.leaderboard)) {
            const entry = baksyWorldCache.leaderboard.find(r => String(r.userId) === uid);
            if (entry && entry.displayName && entry.displayName !== uid) return entry.displayName;
        }

        // Lokalny baksyDb kont (dla własnego konta lub kont cache)
        const db = ensureBaksyDbLoaded();
        const localAcc = db.accounts && db.accounts[uid];
        if (localAcc && localAcc.displayName && localAcc.displayName !== uid) return localAcc.displayName;

        // Fall back to stored name (but skip if it looks like a wrong default)
        if (storedName && storedName !== uid && storedName !== 'SebuśPL') return storedName;
        return 'Gracz #' + uid.slice(-4);
    }

    function buildRankingRows() {
        const rows = [];
        const findRow = (userId) => rows.find(item => String(item.userId) === String(userId));

        if (baksyWorldCache && Array.isArray(baksyWorldCache.leaderboard)) {
            baksyWorldCache.leaderboard.forEach((row) => {
                const userId = String(row?.userId || '').trim();
                if (!userId) return;
                const existing = findRow(userId);
                if (existing) {
                    existing.displayName = resolveRankingDisplayName(userId, String(row.displayName || existing.displayName || ''));
                    existing.baksyBalance = Math.max(Number(existing.baksyBalance || 0), Number(row.balance || 0));
                    existing.updatedAt = Math.max(Number(existing.updatedAt || 0), Number(row.updatedAt || 0));
                    return;
                }
                rows.push({
                    userId,
                    displayName: resolveRankingDisplayName(userId, String(row.displayName || '')),
                    baksyBalance: Number(row.balance || 0),
                    missionsCompleted: 0,
                    bossDamageTotal: 0,
                    updatedAt: Number(row.updatedAt || 0)
                });
            });
        }

        Object.entries(/** @type {any} */ (playerRankingStats || {})).forEach(([userId, rawStat]) => {
            const stat = rawStat || {};
            const existing = findRow(userId);
            if (!existing) {
                rows.push({
                    userId,
                    displayName: resolveRankingDisplayName(userId, String(stat.displayName || '')),
                    baksyBalance: Number(stat.baksyBalance || 0),
                    missionsCompleted: Number(stat.missionsCompleted || 0),
                    bossDamageTotal: Number(stat.bossDamageTotal || 0),
                    updatedAt: Number(stat.updatedAt || 0)
                });
            } else {
                existing.displayName = resolveRankingDisplayName(userId, String(stat.displayName || existing.displayName || ''));
                if (Number(stat.updatedAt || 0) >= Number(existing.updatedAt || 0)) {
                    existing.baksyBalance = Math.max(Number(existing.baksyBalance || 0), Number(stat.baksyBalance || 0));
                }
                existing.missionsCompleted = Number(stat.missionsCompleted || 0);
                existing.bossDamageTotal = Number(stat.bossDamageTotal || 0);
                existing.updatedAt = Math.max(Number(existing.updatedAt || 0), Number(stat.updatedAt || 0));
            }
        });

        const me = getBaksyAccount();
        const meId = getRuntimeUserId();
        if (meId) {
            const existing = findRow(meId);
            if (!existing) {
                const localStats = /** @type {any} */ (playerRankingStats || {})[meId] || {};
                rows.push({
                    userId: meId,
                    displayName: resolveRankingDisplayName(meId, String(me.displayName || getCurrentNickLabel())),
                    baksyBalance: Number(me.balance || 0),
                    missionsCompleted: Number(localStats.missionsCompleted || 0),
                    bossDamageTotal: Number(localStats.bossDamageTotal || 0),
                    updatedAt: nowTs()
                });
            } else {
                existing.baksyBalance = Number(me.balance || existing.baksyBalance || 0);
            }
        }

        return rows.sort((a, b) => {
            if (b.baksyBalance !== a.baksyBalance) return b.baksyBalance - a.baksyBalance;
            if (b.missionsCompleted !== a.missionsCompleted) return b.missionsCompleted - a.missionsCompleted;
            return b.bossDamageTotal - a.bossDamageTotal;
        });
    }

    // ════════════════════════════════════════════════════════════════
    //  MMO CHAT – Panel UI
    // ════════════════════════════════════════════════════════════════

    function initMmoChatPanelIfNeeded() {
        if (mmoChatPanelInitialized && document.getElementById('sebus-mmo-chat-panel')) return;
        if (!appSettings.features.mmoChat) return;
        if (document.getElementById('sebus-mmo-chat-panel')) {
            mmoChatPanelInitialized = true;
            return;
        }
        mmoChatPanelInitialized = true;

        const panel = document.createElement('div');
        panel.id = 'sebus-mmo-chat-panel';
        panel.innerHTML = `
            <!-- ── setup overlay ── -->
            <div id="sebus-chat-setup-overlay">
                <div class="sebus-chat-setup-title">💬 Witaj w MMO Czacie!</div>
                <div class="sebus-chat-setup-sub">Wybierz swój nick i avatar widoczny dla wszystkich.</div>
                <input id="sebus-chat-setup-nick" class="sebus-chat-setup-input" type="text" maxlength="28" placeholder="Twój nick (min. 2 znaki)">
                <div class="sebus-chat-avatar-picker" id="sebus-chat-avatar-picker"></div>
                <div id="sebus-chat-setup-err" style="font-size:10px;color:#f87;min-height:14px;text-align:center;"></div>
                <button id="sebus-chat-setup-confirm" class="sebus-chat-setup-confirm-btn" type="button">✅ Zacznij czatować</button>
            </div>

            <!-- ── main chat ── -->
            <div class="sebus-chat-header">
                <span class="sebus-chat-header-title">💬 MMO Czat</span>
                <span class="sebus-chat-online-badge" id="sebus-chat-online-badge">🟢 0 online</span>
                <div class="sebus-chat-header-actions">
                    <div class="sebus-chat-profile-badge" id="sebus-chat-my-profile-badge" title="Zmień profil">
                        <span id="sebus-chat-my-avatar">🎮</span>
                        <span id="sebus-chat-my-nick">...</span>
                        ✏️
                    </div>
                    <button id="sebus-chat-close-btn" type="button" style="background:none;border:1px solid rgba(255,214,110,.3);color:#ffd700;border-radius:8px;padding:3px 10px;cursor:pointer;font-size:11px;">✕</button>
                </div>
            </div>

            <div class="sebus-chat-msgs-area" id="sebus-chat-msgs-area">
                <div class="sebus-chat-system">Ładowanie wiadomości…</div>
            </div>

            <div class="sebus-chat-input-row">
                <div class="sebus-chat-input-wrap">
                    <textarea id="sebus-chat-input" rows="2" placeholder="Napisz wiadomość… (Enter = wyślij, Shift+Enter = nowa linia)&#10;Wklej link YouTube lub URL obrazka — wykryję go automatycznie!"></textarea>
                    <div class="sebus-chat-toolbar">
                        <button class="sebus-chat-tool-btn" id="sebus-chat-btn-emoji" type="button" title="Emoji">😊 Emoji</button>
                        <button class="sebus-chat-tool-btn" id="sebus-chat-btn-img" type="button" title="Wklej URL grafiki">🖼️ Obraz</button>
                        <button class="sebus-chat-tool-btn" id="sebus-chat-btn-yt" type="button" title="Wklej link YouTube">▶️ YouTube</button>
                        <button class="sebus-chat-tool-btn" id="sebus-chat-btn-clear" type="button" title="Wyczyść input">🗑️</button>
                        <span id="sebus-chat-char-count" style="font-size:9px;color:rgba(255,232,183,.4);align-self:center;margin-left:auto;">0/600</span>
                    </div>

                    <!-- emoji picker -->
                    <div id="sebus-chat-emoji-picker" style="display:none;flex-wrap:wrap;gap:4px;padding:6px;background:rgba(10,10,10,.96);border:1px solid rgba(255,214,110,.25);border-radius:8px;margin-top:2px;max-height:120px;overflow-y:auto;"></div>
                </div>
                <button id="sebus-chat-send-btn" class="sebus-chat-send-btn" type="button">➤</button>
            </div>
        `;
        document.body.appendChild(panel);

        // ── Avatar picker in setup ──
        const avatarPicker = panel.querySelector('#sebus-chat-avatar-picker');
        let selectedAvatar = mmoChatAvatarList[0];
        mmoChatAvatarList.forEach(emoji => {
            const opt = document.createElement('span');
            opt.className = 'sebus-chat-avatar-opt';
            opt.textContent = emoji;
            opt.dataset.avatar = emoji;
            if (emoji === selectedAvatar) opt.classList.add('selected');
            opt.addEventListener('click', () => {
                selectedAvatar = emoji;
                avatarPicker.querySelectorAll('.sebus-chat-avatar-opt').forEach(el => el.classList.remove('selected'));
                opt.classList.add('selected');
            });
            avatarPicker.appendChild(opt);
        });

        // ── Emoji picker content ──
        const emojiList = ['😀','😂','🥲','😎','🤩','😍','🥰','😜','🤔','😴','😡','🥶','🤯','🙄',
            '👍','👎','❤️','💔','💯','🔥','💀','👻','🎉','🎊','🎮','⚔️','🛡️','🏆','💎','🌟'];
        const emojiPickerEl = panel.querySelector('#sebus-chat-emoji-picker');
        emojiList.forEach(e => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.textContent = e;
            btn.style.cssText = 'font-size:18px;background:none;border:none;cursor:pointer;padding:2px;';
            btn.addEventListener('click', () => {
                const input = panel.querySelector('#sebus-chat-input');
                if (input) { input.value += e; input.dispatchEvent(new Event('input')); input.focus(); }
            });
            emojiPickerEl.appendChild(btn);
        });

        // ── Helper refs ──
        const setupOverlay = panel.querySelector('#sebus-chat-setup-overlay');
        const setupNickInput = panel.querySelector('#sebus-chat-setup-nick');
        const setupConfirmBtn = panel.querySelector('#sebus-chat-setup-confirm');
        const setupErrEl = panel.querySelector('#sebus-chat-setup-err');
        const msgsArea = panel.querySelector('#sebus-chat-msgs-area');
        const chatInput = panel.querySelector('#sebus-chat-input');
        const sendBtn = panel.querySelector('#sebus-chat-send-btn');
        const onlineBadge = panel.querySelector('#sebus-chat-online-badge');
        const myAvatarEl = panel.querySelector('#sebus-chat-my-avatar');
        const myNickEl = panel.querySelector('#sebus-chat-my-nick');
        const charCountEl = panel.querySelector('#sebus-chat-char-count');

        // ── Show/hide setup overlay ──
        function showSetup(show) {
            if (!setupOverlay) return;
            setupOverlay.style.display = show ? 'flex' : 'none';
        }

        // ── Check profile, show/hide overlay ──
        function applyProfileToUI() {
            if (!mmoChatProfile || !mmoChatProfile.nick) {
                showSetup(true);
                return;
            }
            showSetup(false);
            if (myAvatarEl) myAvatarEl.textContent = mmoChatProfile.avatar || '🎮';
            if (myNickEl) myNickEl.textContent = mmoChatProfile.nick;
        }

        // Load profile from local storage first
        if (!mmoChatProfile) {
            mmoChatProfile = loadMmoChatProfile();
            if (!mmoChatProfile) {
                // try remote async
                mmoChatLoadProfileRemote(getRuntimeUserId()).then(remote => {
                    if (remote && remote.nick) {
                        mmoChatProfile = remote;
                        saveMmoChatProfileLocal(remote);
                        applyProfileToUI();
                        startMmaChatLiveUpdates();
                    } else {
                        showSetup(true);
                    }
                });
            }
        }
        applyProfileToUI();

        // ── Setup confirm ──
        setupConfirmBtn.addEventListener('click', async () => {
            const nick = String(setupNickInput.value || '').trim();
            if (nick.length < 2) {
                setupErrEl.textContent = '❌ Nick musi mieć min. 2 znaki.';
                return;
            }
            if (nick.length > 28) {
                setupErrEl.textContent = '❌ Nick za długi (max 28 znaków).';
                return;
            }
            setupConfirmBtn.disabled = true;
            setupErrEl.textContent = '';
            const userId = getRuntimeUserId();
            const profile = {
                nick,
                avatar: selectedAvatar,
                userId: String(userId),
                setAt: nowTs()
            };
            mmoChatProfile = profile;
            saveMmoChatProfileLocal(profile);
            await mmoChatSaveProfileRemote(profile);
            await mmoChatSendMessage(`🎉 ${nick} dołączył do czatu!`, 'system');
            applyProfileToUI();
            setupConfirmBtn.disabled = false;
            startMmoChatLiveUpdates();
            await mmoChatRefreshMessages(true);
        });

        // ── Profile badge: click to re-edit ──
        const myProfileBadge = panel.querySelector('#sebus-chat-my-profile-badge');
        if (myProfileBadge) {
            myProfileBadge.addEventListener('click', () => {
                if (!setupOverlay) return;
                if (mmoChatProfile) {
                    setupNickInput.value = mmoChatProfile.nick || '';
                    const curAv = mmoChatProfile.avatar || mmoChatAvatarList[0];
                    selectedAvatar = curAv;
                    avatarPicker.querySelectorAll('.sebus-chat-avatar-opt').forEach(el => {
                        el.classList.toggle('selected', el.dataset.avatar === curAv);
                    });
                }
                showSetup(true);
            });
        }

        // ── Close button ──
        const closeBtn = panel.querySelector('#sebus-chat-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                panel.classList.remove('show');
                stopMmaChatLiveUpdates();
            });
        }

        // ── Drag-and-drop (header jako uchwyt) ──
        const dragHandle = panel.querySelector('.sebus-chat-header');
        const chatPosKey = `sebus_mmoChat_pos_${getRuntimeUserId()}`;

        function saveChatPos(x, y) {
            try { localStorage.setItem(chatPosKey, JSON.stringify({ x, y })); } catch (e) {}
        }

        function restoreChatPos() {
            try {
                const raw = localStorage.getItem(chatPosKey);
                if (!raw) return;
                const { x, y } = JSON.parse(raw);
                const maxX = window.innerWidth - panel.offsetWidth;
                const maxY = window.innerHeight - panel.offsetHeight;
                if (typeof x === 'number' && typeof y === 'number') {
                    panel.style.left = Math.min(Math.max(x, 0), maxX > 0 ? maxX : 0) + 'px';
                    panel.style.top = Math.min(Math.max(y, 0), maxY > 0 ? maxY : 0) + 'px';
                    panel.style.transform = 'none';
                }
            } catch (e) {}
        }

        if (dragHandle) {
            let dragging = false;
            let dragOffX = 0;
            let dragOffY = 0;

            const onMouseMove = (e) => {
                if (!dragging) return;
                const x = Math.min(Math.max(e.clientX - dragOffX, 0), window.innerWidth - panel.offsetWidth);
                const y = Math.min(Math.max(e.clientY - dragOffY, 0), window.innerHeight - panel.offsetHeight);
                panel.style.left = x + 'px';
                panel.style.top = y + 'px';
                panel.style.transform = 'none';
            };

            const onMouseUp = () => {
                if (!dragging) return;
                dragging = false;
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
                // Zapisz finalną pozycję
                saveChatPos(parseFloat(panel.style.left), parseFloat(panel.style.top));
            };

            dragHandle.addEventListener('mousedown', (e) => {
                // nie drag gdy kliknięto w przycisk / profile badge
                if (e.target.closest('button, .sebus-chat-profile-badge')) return;
                dragging = true;
                const rect = panel.getBoundingClientRect();
                dragOffX = e.clientX - rect.left;
                dragOffY = e.clientY - rect.top;
                // zakotwicz pozycję na czas draggowania
                panel.style.left = rect.left + 'px';
                panel.style.top = rect.top + 'px';
                panel.style.transform = 'none';
                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
                e.preventDefault();
            });
        }

        // ── Char counter ──
        chatInput.addEventListener('input', () => {
            const len = (chatInput.value || '').length;
            charCountEl.textContent = `${len}/600`;
            charCountEl.style.color = len > 550 ? '#f87' : 'rgba(255,232,183,.4)';
        });

        // ── Enter to send ──
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                doSend();
            }
        });

        // ── Send button ──
        sendBtn.addEventListener('click', () => doSend());

        async function doSend() {
            if (!mmoChatProfile || !mmoChatProfile.nick) { showSetup(true); return; }
            const rawText = String(chatInput.value || '').trim();
            if (!rawText) return;
            sendBtn.disabled = true;
            chatInput.disabled = true;
            const { type, meta, text } = mmoChatDetectType(rawText);
            const result = await mmoChatSendMessage(text, type, meta);
            sendBtn.disabled = false;
            chatInput.disabled = false;
            if (result.ok) {
                chatInput.value = '';
                charCountEl.textContent = '0/600';
                await mmoChatRefreshMessages(true);
            } else {
                charCountEl.textContent = result.message || 'Błąd';
            }
            chatInput.focus();
        }

        // ── Toolbar buttons ──
        panel.querySelector('#sebus-chat-btn-emoji').addEventListener('click', () => {
            const ep = panel.querySelector('#sebus-chat-emoji-picker');
            if (ep) ep.style.display = ep.style.display === 'none' ? 'flex' : 'none';
        });
        panel.querySelector('#sebus-chat-btn-img').addEventListener('click', async () => {
            const url = await sebusUiPrompt({
                title: 'Wklej URL obrazka',
                inputLabel: 'PNG, JPG, GIF, WebP',
                placeholder: 'https://...'
            });
            if (url) { chatInput.value = url.trim(); chatInput.dispatchEvent(new Event('input')); }
        });
        panel.querySelector('#sebus-chat-btn-yt').addEventListener('click', async () => {
            const url = await sebusUiPrompt({
                title: 'Wklej link YouTube',
                inputLabel: 'Link do filmu',
                placeholder: 'https://www.youtube.com/watch?v=...'
            });
            if (url) { chatInput.value = url.trim(); chatInput.dispatchEvent(new Event('input')); }
        });
        panel.querySelector('#sebus-chat-btn-clear').addEventListener('click', () => {
            chatInput.value = '';
            chatInput.dispatchEvent(new Event('input'));
        });

        // ── Render messages ──
        async function mmoChatRefreshMessages(forceScroll = false) {
            const msgs = await mmoChatFetchMessages();
            const online = await mmoChatFetchOnline();
            const onlineCount = Object.keys(online).length;
            if (onlineBadge) onlineBadge.textContent = `🟢 ${onlineCount} online`;

            const wasAtBottom = msgsArea.scrollHeight - msgsArea.scrollTop - msgsArea.clientHeight < 80;
            msgsArea.innerHTML = msgs.length
                ? msgs.map(m => renderMmoChatMessage(/** @type {any} */ (m))).join('')
                : '<div class="sebus-chat-system">Brak wiadomości – napisz pierwszy!</div>';

            if (forceScroll || wasAtBottom) msgsArea.scrollTop = msgsArea.scrollHeight;
            mmoChatLastFetchAt = nowTs();
        }

        function startMmaChatLiveUpdates() {
            stopMmaChatLiveUpdates();
            mmoChatRefreshMessages();
            mmoChatPollTimer = setInterval(async () => {
                if (!panel.classList.contains('show')) return;
                await mmoChatRefreshMessages();
                await mmoChatUpdatePresence();
            }, mmoChatPollIntervalMs);
            mmoChatPresenceTimer = setInterval(() => {
                if (mmoChatProfile && mmoChatProfile.nick) mmoChatUpdatePresence();
            }, mmoChatPresenceIntervalMs);
        }

        function stopMmaChatLiveUpdates() {
            if (mmoChatPollTimer) { clearInterval(mmoChatPollTimer); mmoChatPollTimer = null; }
            if (mmoChatPresenceTimer) { clearInterval(mmoChatPresenceTimer); mmoChatPresenceTimer = null; }
        }

        // start polling if already have profile
        if (mmoChatProfile && mmoChatProfile.nick) {
            startMmaChatLiveUpdates();
        }

        // reopen → restart polling
        const observer = new MutationObserver(() => {
            if (panel.classList.contains('show')) {
                if (mmoChatProfile && mmoChatProfile.nick) startMmaChatLiveUpdates();
            } else {
                stopMmaChatLiveUpdates();
            }
        });
        observer.observe(panel, { attributes: true, attributeFilter: ['class'] });
    }

    function syncRankingPanelUi(panel) {
        if (!panel) return;
        const listEl = panel.querySelector('#sebus-ranking-list');
        if (!listEl) return;
        const rows = buildRankingRows();
        if (!rows.length) {
            listEl.innerHTML = '<div style="font-size:10px;color:#aaa;padding:10px;text-align:center;">Brak danych rankingu.</div>';
            return;
        }

        const meId = String(getRuntimeUserId() || '');
        const db = ensureBaksyDbLoaded();

        listEl.innerHTML = rows.slice(0, 50).map((row, index) => {
            const isMe = String(row.userId || '') === meId;
            const nick = resolveRankingDisplayName(row.userId, row.displayName || '');
            // Pobierz customTitle z lokalnego baksyDb konta jeśli to nasze, albo ze storedName
            const acc = db.accounts && db.accounts[row.userId];
            const titleActive = acc && acc.customTitle && Number(acc.customTitleUntil || 0) > nowTs();
            const titleHtml = titleActive
                ? `<span style="font-size:8px;color:#ffd700;font-style:italic;margin-left:4px;">「${escapeHtml(acc.customTitle)}」</span>`
                : '';
            const rowBorder = isMe ? '1px solid rgba(255,214,110,.5)' : '1px solid rgba(255,214,110,.14)';
            const rowBg = isMe ? 'rgba(255,214,110,.07)' : 'rgba(0,0,0,.25)';
            return `
            <div style="display:grid;grid-template-columns:24px 1fr;gap:8px;align-items:center;padding:7px 8px;border:${rowBorder};border-radius:8px;background:${rowBg};margin-bottom:6px;">
                <div style="font-size:11px;font-weight:800;color:${index < 3 ? '#ffd66e' : '#e7d7a8'};">#${index + 1}</div>
                <div>
                    <div style="font-size:10px;"><strong>${escapeHtml(nick)}</strong>${titleHtml} <span style="color:#9a9a9a;">(${escapeHtml(String(row.userId || ''))})</span>${isMe ? ' <span style="color:#ffd700;font-size:9px;">← Ty</span>' : ''}</div>
                    <div style="display:flex;gap:8px;flex-wrap:wrap;font-size:9px;color:#d8d8d8;margin-top:2px;">
                        <span>💵 ${normalizeBaksyNumber(row.baksyBalance || 0)}</span>
                        <span>📋 ${normalizeBaksyNumber(row.missionsCompleted || 0)} misji</span>
                        <span>⚔️ ${normalizeBaksyNumber(row.bossDamageTotal || 0)} dmg bossa</span>
                    </div>
                </div>
            </div>`;
        }).join('');
    }

    function initRankingPanelIfNeeded() {
        if (document.getElementById('sebus-ranking-panel')) return;
        const panel = document.createElement('div');
        panel.id = 'sebus-ranking-panel';
        panel.className = 'sebus-baksy-ui-mmo sebus-hub-container';
        panel.style.display = 'none';
        panel.innerHTML = `
            <div class="sebus-baksy-hub-top">
                <div>
                    <div class="sebus-baksy-hub-title sebus-hub-title">🏆 Ranking Graczy</div>
                    <div class="sebus-baksy-hub-subtitle">Baksy • Misje • Obrażenia Bossa</div>
                </div>
                <div class="sebus-baksy-chip">TOP 50</div>
            </div>
            <div style="display:flex;gap:6px;margin-bottom:8px;">
                <button id="sebus-ranking-refresh" class="sebus-mmo-btn" type="button" style="height:26px;font-size:10px;flex:1;">🔄 Odśwież</button>
            </div>
            <div id="sebus-ranking-list" style="max-height:360px;overflow-y:auto;"></div>
        `;
        document.body.appendChild(panel);

        const refreshBtn = panel.querySelector('#sebus-ranking-refresh');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                syncLocalRankingSnapshot();
                pullSharedWorldIfNeeded(true);
                pullSharedMmoStateIfNeeded(true);
                syncRankingPanelUi(panel);
            });
        }

        syncRankingPanelUi(panel);

        document.addEventListener('click', (e) => {
            if (panel.style.display !== 'block') return;
            if (panel.contains(e.target)) return;
            const rankingBtn = document.getElementById('sebus-nav-ranking-btn');
            if (rankingBtn && rankingBtn.contains(e.target)) return;
            panel.style.display = 'none';
        });
    }

    function syncBaksyUiSummary() {
        const account = getBaksyAccount();
        syncLocalRankingSnapshot();

        const panel = document.getElementById('sebus-baksy-panel');
        if (panel) {
            const balanceEl = panel.querySelector('#sebus-baksy-balance');
            const statEl = panel.querySelector('#sebus-baksy-stats');
            if (balanceEl) balanceEl.textContent = `${normalizeBaksyNumber(account.balance || 0)} 💵`;
            if (statEl) statEl.textContent = `zarobione: ${normalizeBaksyNumber(account.totalEarned || 0)} | wydane: ${normalizeBaksyNumber(account.totalSpent || 0)}`;
        }

        const hub = document.getElementById('sebus-baksy-hub');
        if (hub) {
            const hubBalance = hub.querySelector('#sebus-baksy-hub-balance');
            const hubStats = hub.querySelector('#sebus-baksy-hub-stats');
            if (hubBalance) hubBalance.textContent = `${normalizeBaksyNumber(account.balance || 0)} 💵`;
            if (hubStats) hubStats.textContent = `zarobione: ${normalizeBaksyNumber(account.totalEarned || 0)} | wydane: ${normalizeBaksyNumber(account.totalSpent || 0)}`;

            const inventoryEl = hub.querySelector('#sebus-baksy-inventory');
            if (inventoryEl) {
                if (!playerMissionInventory.length) {
                    inventoryEl.innerHTML = '<div style="color:#999;">Brak przedmiotów</div>';
                } else {
                    inventoryEl.innerHTML = playerMissionInventory
                        .map(item => `<div style="margin-bottom:4px;"><strong>${escapeHtml(item.name || 'Item')}</strong> x${normalizeBaksyNumber(item.qty || 1)} <span style="color:${getRarityColor(item.rarity)};">(${escapeHtml(String(item.rarity || 'common'))})</span></div>`)
                        .join('');
                }
            }

            const historyEl = hub.querySelector('#sebus-baksy-hub-history');
            if (historyEl) {
                historyEl.innerHTML = getRecentBaksyHistory(16)
                    .map(row => `<div class="sebus-baksy-hub-history-item">${escapeHtml(formatBaksyHistoryRow(row))}</div>`)
                    .join('');
            }
        }

        const rankingPanel = document.getElementById('sebus-ranking-panel');
        if (rankingPanel && rankingPanel.style.display === 'block') {
            syncRankingPanelUi(rankingPanel);
        }
    }

    function markGhostHidden(element) {
        if (!element) return;
        if (element.closest('#chatboxWrap, #chatcontent, #sebus-settings-panel, #sebus-settings-footer-anchor, #sebus-mini-radio, #sebus-pinned-container-chat')) return;
        element.classList.add('sebus-ghost-hidden');
        element.setAttribute('data-sebus-ghost-hidden', '1');
    }

    function clearGhostCurtain() {
        document.body.classList.remove('sebus-ghost-curtain-on', 'sebus-ghost-curtain-l1', 'sebus-ghost-curtain-l2', 'sebus-ghost-curtain-l3');
        document.querySelectorAll('[data-sebus-ghost-hidden="1"], .sebus-ghost-hidden').forEach(el => {
            el.classList.remove('sebus-ghost-hidden');
            el.removeAttribute('data-sebus-ghost-hidden');
        });
    }

    function hasUsefulWidgetContent(widget) {
        return !!widget.querySelector(
            '#chatboxWrap, #chatcontent, .ck-editor, [contenteditable="true"], input, textarea, form, .ipsDataList, .ipsCommentList, .ipsAttachLink, a[href*="/topic/"], a[href*="/forum/"], a[href*="/profile/"], a[href*="/members/"]'
        );
    }

    function isMostlyZeroStats(text) {
        const normalized = (text || '').toLowerCase().replace(/\s+/g, ' ');
        const hasStatsWord = /(statystyk|statistics|topics?|posts?|odpowiedzi|użytkownik|users?)/i.test(normalized);
        const hasZeroStats = /(\b0\b\s*(temat|tematy|topics?|post|posty|odpowiedzi|użytkownik|users?))/i.test(normalized);
        const hasPositiveStats = /(\b[1-9]\d*\b\s*(temat|tematy|topics?|post|posty|odpowiedzi|użytkownik|users?))/i.test(normalized);
        return hasStatsWord && hasZeroStats && !hasPositiveStats;
    }

    function applyGhostCurtain() {
        const now = Date.now();
        if (now - lastGhostCurtainRunAt < 4000) return;

        const level = Math.max(0, Math.min(3, Number(appSettings.ghostCurtain.level) || 0));
        if (level === 0) {
            clearGhostCurtain();
            return;
        }

        lastGhostCurtainRunAt = now;

        document.body.classList.add('sebus-ghost-curtain-on');
        document.body.classList.remove('sebus-ghost-curtain-l1', 'sebus-ghost-curtain-l2', 'sebus-ghost-curtain-l3');
        document.body.classList.add(`sebus-ghost-curtain-l${level}`);

        const hardHideSelectors = [
            '.ipsAd',
            '.ipsAdvertisement',
            '.adsbygoogle',
            '[id*="google_ads"]',
            '[id*="banner"] iframe',
            'iframe[src*="doubleclick.net"]',
            'iframe[src*="googlesyndication.com"]',
            '.ipsWidget[data-blockid*="ad"]',
            '.ipsWidget[data-blockid*="banner"]',
            '.ipsWidget[data-blockid*="sponsor"]',
            '.ipsWidget[data-blockid*="partners"]',
            '.cForumMiniCalendar'
        ];

        const level2ExtraSelectors = [
            '.ipsWidget[data-blockid*="online"]',
            '.ipsWidget[data-blockid*="status"]',
            '.ipsWidget[data-blockid*="stats"]',
            '.ipsWidget[data-blockid*="leaders"]',
            '.ipsWidget[data-blockid*="announcements"]',
            '.ipsWidget[data-blockid*="popular"]',
            '.ipsWidget[data-blockid*="similar"]',
            '.ipsWidget[data-blockid*="recommended"]'
        ];

        const level3ExtraSelectors = [
            '.ipsBreadcrumb',
            '.ipsPageHeader',
            '.ipsPagination',
            '.ipsPageHeader__meta',
            '.ipsReact_reputation',
            '.ipsResponsive_showDesktop.ipsResponsive_block'
        ];

        document.querySelectorAll(hardHideSelectors.join(',')).forEach(markGhostHidden);
        if (level >= 2) document.querySelectorAll(level2ExtraSelectors.join(',')).forEach(markGhostHidden);
        if (level >= 3) document.querySelectorAll(level3ExtraSelectors.join(',')).forEach(markGhostHidden);

        document.querySelectorAll('.ipsLayout_sidebar, .ipsLayout_sidebarright, aside.ipsLayout_sidebar').forEach(sidebar => {
            if (sidebar.querySelector('#chatboxWrap, #chatcontent')) return;
            markGhostHidden(sidebar);
        });

        if (level >= 3) {
            document.querySelectorAll('#ipsLayout_header, #ipsLayout_footer').forEach(section => {
                if (section.querySelector('#chatboxWrap, #chatcontent')) return;
                markGhostHidden(section);
            });
        }

        document.querySelectorAll('.ipsWidget, .cWidgetContainer, .ipsBox').forEach(widget => {
            if (widget.closest('#chatboxWrap, #chatcontent')) return;
            if (widget.matches('#sebus-settings-panel, #sebus-settings-footer-anchor')) return;

            const title = (widget.querySelector('.ipsWidget_title, .ipsType_sectionTitle, h2, h3, h4')?.textContent || '').toLowerCase();
            const bodyText = (widget.textContent || '').replace(/\s+/g, ' ').trim();
            const tinyText = bodyText.replace(/\s/g, '').length < 24;
            const hasMedia = !!widget.querySelector('img, video, iframe, canvas, svg');
            const clutterTitle = /(reklam|sponsor|partner|promocj|statystyk|top posters|najnowsze status|ostatnie status|kto jest online|who.?s online)/i.test(title);

            if (clutterTitle && !hasUsefulWidgetContent(widget)) {
                markGhostHidden(widget);
                return;
            }

            if (isMostlyZeroStats(bodyText) && !hasUsefulWidgetContent(widget)) {
                markGhostHidden(widget);
                return;
            }

            if (level >= 2 && !hasUsefulWidgetContent(widget) && !hasMedia) {
                const shortWidget = bodyText.replace(/\s/g, '').length < 120;
                if (shortWidget) {
                    markGhostHidden(widget);
                    return;
                }
            }

            if (level >= 3 && !hasUsefulWidgetContent(widget)) {
                markGhostHidden(widget);
                return;
            }

            if (tinyText && !hasMedia && !hasUsefulWidgetContent(widget)) {
                markGhostHidden(widget);
            }
        });

        if (level >= 3) {
            document.querySelectorAll('main > *').forEach(block => {
                if (block.matches('#chatboxWrap, #chatcontent, #sebus-settings-panel, #sebus-settings-footer-anchor')) return;
                if (block.querySelector && block.querySelector('#chatboxWrap, #chatcontent, .ipsCommentList, .ipsDataList, .ipsStream')) return;
                const textLen = ((block.textContent || '').replace(/\s/g, '')).length;
                const hasUsefulLinks = !!block.querySelector('a[href*="/topic/"], a[href*="/forum/"], a[href*="/profile/"], a[href*="/members/"]');
                if (!hasUsefulLinks && textLen < 180) markGhostHidden(block);
            });
        }
    }

    function clearRealTimeActivityMarks() {
        document.querySelectorAll('.sebus-life-active, .sebus-life-idle, .sebus-life-ghost, .sebus-life-hidden').forEach(el => {
            el.classList.remove('sebus-life-active', 'sebus-life-idle', 'sebus-life-ghost', 'sebus-life-hidden');
            el.removeAttribute('data-sebus-activity-min');
            const title = el.getAttribute('title') || '';
            if (/^(Aktywność|Status):/i.test(title)) el.removeAttribute('title');
        });
        document.querySelectorAll('.sebus-life-summary').forEach(el => el.remove());
    }

    function parseMinutesFromActivityText(text) {
        const normalized = (text || '').toLowerCase().replace(/\s+/g, ' ').trim();
        if (!normalized) return null;

        if (/(przed chwilą|chwile temu|chwila temu|just now|right now|teraz|now\b)/i.test(normalized)) return 0;

        const minuteMatch = normalized.match(/(\d{1,3})\s*(min|mins|min\.|minut(?:a|y|ę)?|minute(?:s)?|\bm\b)/i);
        if (minuteMatch) return Number(minuteMatch[1]);

        const hourMatch = normalized.match(/(\d{1,2})\s*(h|hr|hrs|godz(?:ina|iny|\.)?|godzin|hour(?:s)?)/i);
        if (hourMatch) return Number(hourMatch[1]) * 60;

        const dayMatch = normalized.match(/(\d{1,2})\s*(d|day(?:s)?|dni|dzień)/i);
        if (dayMatch) return Number(dayMatch[1]) * 60 * 24;

        const hhmmMatch = normalized.match(/(?:dzisiaj|today)?\s*(?:o|at)?\s*(\d{1,2}):(\d{2})/i);
        if (hhmmMatch) {
            const now = new Date();
            const candidate = new Date(now);
            candidate.setHours(Number(hhmmMatch[1]), Number(hhmmMatch[2]), 0, 0);
            let diffMinutes = Math.floor((now.getTime() - candidate.getTime()) / 60000);
            if (diffMinutes < 0) diffMinutes += 24 * 60;
            return diffMinutes;
        }

        return null;
    }

    function parseMinutesFromTimeValue(rawValue) {
        const value = (rawValue || '').toString().trim();
        if (!value) return null;

        if (/^\d{10,13}$/.test(value)) {
            let epoch = Number(value);
            if (value.length === 10) epoch *= 1000;
            if (!Number.isNaN(epoch)) {
                const diffMinutes = Math.floor((Date.now() - epoch) / 60000);
                if (diffMinutes >= 0 && diffMinutes <= 60 * 24 * 14) return diffMinutes;
            }
        }

        const parsedDate = Date.parse(value);
        if (!Number.isNaN(parsedDate)) {
            const diffMinutes = Math.floor((Date.now() - parsedDate) / 60000);
            if (diffMinutes >= 0 && diffMinutes <= 60 * 24 * 14) return diffMinutes;
        }

        return parseMinutesFromActivityText(value);
    }

    function getActivityMinutesFromUserElement(userElement) {
        const contextNode = userElement.closest('li, tr, .ipsDataItem, .ipsDataItem_main, .ipsPad, div, p');
        const nodes = [userElement, contextNode].filter(Boolean);
        const timeAttributes = ['data-lastactivity', 'data-last-active', 'data-online-time', 'data-timestamp', 'datetime', 'title', 'aria-label'];

        for (const node of nodes) {
            for (const attrName of timeAttributes) {
                const attrValue = node.getAttribute?.(attrName);
                const minutesFromAttr = parseMinutesFromTimeValue(attrValue);
                if (minutesFromAttr !== null) return minutesFromAttr;
            }
        }

        for (const node of nodes) {
            const textCandidate = [
                node.getAttribute?.('title') || '',
                node.getAttribute?.('aria-label') || '',
                node.textContent || ''
            ].join(' ');
            const minutesFromText = parseMinutesFromActivityText(textCandidate);
            if (minutesFromText !== null) return minutesFromText;
        }

        const memberId = getMemberIdFromElement(userElement);
        if (memberId && profileActivityCache[memberId]) {
            return profileActivityCache[memberId].minutes;
        }

        return null;
    }

    function getMemberIdFromElement(userElement) {
        const attrId = userElement.getAttribute('data-memberid') || userElement.getAttribute('data-mentionid');
        if (attrId) return String(attrId);

        const href = userElement.getAttribute('href') || '';
        const showUserMatch = href.match(/[?&]showuser=(\d+)/i);
        if (showUserMatch) return showUserMatch[1];

        const profileMatch = href.match(/\/profile\/(\d+)/i);
        if (profileMatch) return profileMatch[1];

        const membersMatch = href.match(/\/members\/[^/]*\.(\d+)\/?/i);
        if (membersMatch) return membersMatch[1];

        return null;
    }

    function getProfileUrlFromElement(userElement) {
        const href = userElement.getAttribute('href') || '';
        if (!href) return null;

        try {
            const absolute = new URL(href, window.location.origin);
            return absolute.href;
        } catch (e) {
            return null;
        }
    }

    function extractMinutesFromProfileHtml(doc) {
        const candidates = [];

        doc.querySelectorAll('time, [datetime], [data-lastactivity], [data-last-active], [title*="aktywn" i], [title*="active" i]').forEach(node => {
            const blobs = [
                node.getAttribute('datetime') || '',
                node.getAttribute('title') || '',
                node.getAttribute('aria-label') || '',
                node.textContent || ''
            ];
            blobs.forEach(item => { if (item) candidates.push(item); });
        });

        const bodyText = (doc.body?.textContent || '').replace(/\s+/g, ' ').trim();
        const profilePhraseMatch = bodyText.match(/(ostatnio\s+aktywn[yae]?|last\s+(?:visited|seen|active))\s*[:\-]?\s*([^\|\n\r]{1,120})/i);
        if (profilePhraseMatch && profilePhraseMatch[2]) {
            candidates.push(profilePhraseMatch[2]);
        }

        for (const raw of candidates) {
            const minutes = parseMinutesFromTimeValue(raw) ?? parseMinutesFromActivityText(raw);
            if (minutes !== null) return minutes;
        }

        return null;
    }

    function queueProfileActivityFetch(userElement) {
        const memberId = getMemberIdFromElement(userElement);
        if (!memberId) return;

        const now = Date.now();
        const cached = profileActivityCache[memberId];
        const freshEnough = cached && (now - cached.updatedAt) < (10 * 60 * 1000);
        if (freshEnough) return;
        if (pendingProfileActivityFetches.has(memberId)) return;

        const profileUrl = getProfileUrlFromElement(userElement);
        if (!profileUrl) return;

        pendingProfileActivityFetches.add(memberId);
        fetch(profileUrl, { credentials: 'include' })
            .then(res => res.ok ? res.text() : null)
            .then(html => {
                if (!html) return;
                const doc = new DOMParser().parseFromString(html, 'text/html');
                const minutes = extractMinutesFromProfileHtml(doc);
                if (minutes === null) return;

                profileActivityCache[memberId] = { minutes, updatedAt: Date.now() };
                saveProfileActivityCache(profileActivityCache);
                lastLifeScanAt = 0;
                scheduleModule('realTimeActivity', { immediate: true });
            })
            .catch(() => {})
            .finally(() => {
                pendingProfileActivityFetches.delete(memberId);
            });
    }

    function findOnlineSections() {
        const sections = new Set();

        document.querySelectorAll('#elOnlineUsers, [id*="OnlineUsers"], [class*="OnlineUsers"], [data-blockid*="online"], [data-blockID*="online"]').forEach(section => {
            sections.add(section);
        });

        document.querySelectorAll('h2, h3, h4, .ipsWidget_title, .ipsType_sectionTitle, .ipsType_majorHeading').forEach(heading => {
            const headingText = (heading.textContent || '').toLowerCase().replace(/\s+/g, ' ').trim();
            if (!/(online|aktywni użytkownicy|kto jest online|użytkownicy online)/i.test(headingText)) return;

            const container = heading.closest('.ipsWidget, .ipsBox, section, aside, .ipsPad, .cWidgetContainer, div');
            if (container) sections.add(container);
        });

        return Array.from(sections);
    }

    function runRealTimeActivityDetector() {
        const now = Date.now();
        if (now - lastLifeScanAt < 15000) return;
        lastLifeScanAt = now;

        const activeThreshold = Math.max(1, Math.min(60, Number(appSettings.activity.activeMinutesThreshold) || 5));
        const ghostThresholdHours = Math.max(1, Math.min(48, Number(appSettings.activity.ghostHoursThreshold) || 4));
        const ghostThresholdMinutes = ghostThresholdHours * 60;
        const useProfileLookup = !!appSettings.activity.useProfileLookup;
        const showOnlyActive = !!appSettings.activity.showOnlyActive;

        const sections = findOnlineSections();
        if (!sections.length) return;

        sections.forEach(section => {
            const users = Array.from(section.querySelectorAll('a[data-memberid], a[data-mentionid], a[href*="/profile/"], a[href*="/members/"], a[href*="showuser="]'));
            if (!users.length) return;

            let activeCount = 0;
            let idleCount = 0;
            let ghostCount = 0;
            let classifiedCount = 0;
            let waitingForProfileCount = 0;

            users.forEach(userEl => {
                userEl.classList.remove('sebus-life-active', 'sebus-life-idle', 'sebus-life-ghost', 'sebus-life-hidden');
                userEl.removeAttribute('data-sebus-activity-min');

                const minutes = getActivityMinutesFromUserElement(userEl);
                if (minutes === null) {
                    if (useProfileLookup) {
                        waitingForProfileCount += 1;
                        queueProfileActivityFetch(userEl);
                    }
                    return;
                }

                classifiedCount += 1;
                userEl.setAttribute('data-sebus-activity-min', String(minutes));

                if (minutes <= activeThreshold) {
                    activeCount += 1;
                    userEl.classList.add('sebus-life-active');
                    userEl.title = `Status: aktywny (${minutes} min temu)`;
                    return;
                }

                if (minutes >= ghostThresholdMinutes) {
                    ghostCount += 1;
                    userEl.classList.add('sebus-life-ghost');
                    if (showOnlyActive) userEl.classList.add('sebus-life-hidden');
                    userEl.title = `Status: duch (${minutes} min bez aktywności)`;
                    return;
                }

                idleCount += 1;
                userEl.classList.add('sebus-life-idle');
                if (showOnlyActive) userEl.classList.add('sebus-life-hidden');
                userEl.title = `Status: bezczynny (${minutes} min)`;
            });

            let summary = section.querySelector('.sebus-life-summary');
            if (!summary) {
                summary = document.createElement('div');
                summary.className = 'sebus-life-summary';
                section.appendChild(summary);
            }

            if (classifiedCount === 0) {
                if (waitingForProfileCount > 0) {
                    summary.textContent = `Wykrywacz Życia: pobieram aktywność z profili (${waitingForProfileCount} użytk.)...`;
                } else {
                    summary.textContent = 'Wykrywacz Życia: brak danych czasu aktywności dla tej listy.';
                }
            } else {
                const pendingInfo = waitingForProfileCount > 0 ? ` | ⏳ pobieram: ${waitingForProfileCount}` : '';
                const viewInfo = showOnlyActive ? ' | filtr: tylko 🟢' : '';
                summary.textContent = `Wykrywacz Życia — 🟢 aktywni ≤${activeThreshold}m: ${activeCount} | 🟡 bezczynni: ${idleCount} | ⚫ duchy ≥${ghostThresholdHours}h: ${ghostCount}${pendingInfo}${viewInfo}`;
            }
        });
    }

    function runSettingsPanelModule() {
        applyUiSkin();
        initSettingsPanelIfNeeded();
    }

    function runGhostCurtainModule() {
        if (appSettings.features.ghostCurtain) applyGhostCurtain();
        else clearGhostCurtain();
    }

    function runChatEnhancementsModule() {
        initMessageContextMenu();
        applyHiddenMessages();
        addPinButtonToMessages();
    }

    function runStickyNotesModule() {
        if (appSettings.features.stickyNotes) {
            renderPinnedNotesInChat();
            return;
        }

        const container = document.getElementById('sebus-pinned-container-chat');
        if (container) container.innerHTML = '';
    }

    function runAvatarGlowModule() {
        document.querySelectorAll('a, img').forEach(el => {
            if ((el.href && el.href.includes(myID)) || (el.dataset && el.dataset.mentionid === myID)) {
                const img = el.tagName === 'IMG' ? el : el.querySelector('img, .ipsUserPhoto');
                if (img && !img.classList.contains('sebus-avatar-glow')) {
                    img.classList.add('sebus-avatar-glow');
                    img.style.borderRadius = window.getComputedStyle(img).borderRadius;
                }
            }
        });
    }

    function runGoldSebusModule() {
        if (!appSettings.features.goldSebus) return;

        const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
        let node;
        while (node = walk.nextNode()) {
            if (!node.nodeValue.includes('SebuśPL')) continue;

            const parent = node.parentNode;
            if (!parent || ['SCRIPT','STYLE','TEXTAREA'].includes(parent.tagName)) continue;
            if (parent.classList.contains('sebus-neon') || parent.closest('.sebus-neon')) continue;

            parent.innerHTML = parent.innerHTML.replace(/(SebuśPL)(?![^<]*>)/g, '<span class="sebus-neon">$1</span>');
        }
    }

    function runNickGlowModule() {
        const nickCandidates = document.querySelectorAll(
            'a, span, strong, b, .cChatBox [class*="user"], .cChatBox [class*="author"], [class*="Chat"] [class*="user"], [class*="Chat"] [class*="author"]'
        );

        nickCandidates.forEach(el => {
            const textRaw = (el.innerText || el.textContent || '').trim();
            const normalized = normalizeNickText(textRaw);

            const isSebusNick = normalized.toLowerCase() === 'sebuśpl' || normalized.toLowerCase() === 'sebuspl';
            const isSebusMention = el.dataset && el.dataset.mentionid === myID;
            const href = el.getAttribute('href') || '';
            const hasSebusIdInHref = href.includes(myID);
            const baksyNeonColor = getActiveNeonColorFromBaksy();

            if (!appSettings.features.goldSebus && el.classList.contains('sebus-gold-legend')) {
                el.classList.remove('sebus-gold-legend');
            }

            if ((isSebusNick || isSebusMention || hasSebusIdInHref) && appSettings.features.goldSebus) {
                forceGoldForSebus(el);
                return;
            }

            if ((isSebusNick || isSebusMention || hasSebusIdInHref) && baksyNeonColor) {
                el.style.color = baksyNeonColor;
                el.style.textShadow = `0 0 12px ${baksyNeonColor}, 0 0 6px ${baksyNeonColor}`;
                el.style.fontWeight = 'bold';
            }

            if (!appSettings.features.nickGlow) {
                if (!el.classList.contains('sebus-gold-legend')) el.dataset.rankGlow = 'ignored';
                return;
            }

            if (!isNicknameLike(el)) {
                el.dataset.rankGlow = 'ignored';
                return;
            }

            applyNickGlow(el);
        });
    }

    function runRealTimeActivityModule() {
        if (appSettings.features.realTimeActivity) runRealTimeActivityDetector();
        else clearRealTimeActivityMarks();
    }

    function runEditorStatsModule() {
        const ed = document.querySelector('.ck-editor__editable') || document.querySelector('div[contenteditable="true"]');
        if (!appSettings.features.editorStats) {
            const existingBox = document.getElementById('sebus-stats-box');
            if (existingBox) existingBox.remove();
            return;
        }

        if (!ed) {
            const existingBox = document.getElementById('sebus-stats-box');
            if (existingBox) existingBox.remove();
            return;
        }

        let text = ed.innerText || ed.textContent || '';
        text = text.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
        const words = text ? text.split(/\s+/).length : 0;
        const chars = text.length;
        const readTime = Math.max(1, Math.ceil(words / 200));
        let statsBox = document.getElementById('sebus-stats-box');

        if (!statsBox) {
            statsBox = document.createElement('div');
            statsBox.id = 'sebus-stats-box';
            statsBox.className = 'sebus-stats-wrap';
            const dropZone = document.querySelector('.ipsComposeArea_dropZone');
            if (dropZone) dropZone.parentNode.insertBefore(statsBox, dropZone);
            else ed.after(statsBox);
        }

        statsBox.innerHTML = `SŁOWA: <b>${words}</b> | ZNAKI: <b>${chars}</b> | CZAS: <b>~${readTime} MIN.</b>`;
    }

    function runChatToolsModule() {
        if (!appSettings.features.chatTools) {
            const gifBtn = document.getElementById('open-gif-btn');
            const mp3Btn = document.getElementById('open-mp3-btn');
            if (gifBtn) gifBtn.remove();
            if (mp3Btn) mp3Btn.remove();
            gifPicker.classList.remove('show');
            mp3Picker.classList.remove('show');
            return;
        }

        const chatInput = document.querySelector('input[placeholder*="wiadomość"], .cChatBox_message');
        if (!chatInput) return;

        const parent = chatInput.parentNode;
        parent.style.position = 'relative';

        if (!document.getElementById('open-gif-btn')) {
            const btnG = document.createElement('a');
            btnG.id = 'open-gif-btn';
            btnG.className = 'sebus-chat-btn';
            btnG.innerHTML = 'GIF';
            btnG.href = '#';
            btnG.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                mp3Picker.classList.remove('show');
                const wasHidden = !gifPicker.classList.contains('show');
                gifPicker.classList.toggle('show');
                if (wasHidden) {
                    gInput.value = '';
                    openGifPickerDefault();
                }
            };
            parent.appendChild(btnG);
        }

        if (!document.getElementById('open-mp3-btn')) {
            const btnM = document.createElement('a');
            btnM.id = 'open-mp3-btn';
            btnM.className = 'sebus-chat-btn';
            btnM.innerHTML = 'MP3';
            btnM.href = '#';
            btnM.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                gifPicker.classList.remove('show');
                if (!mp3Picker.classList.contains('show')) filterMp3s();
                mp3Picker.classList.toggle('show');
            };
            parent.appendChild(btnM);
        }
    }

    function runRadioModule() {
        if (appSettings.features.radio) {
            initRadioIfNeeded();
            positionRadio();
            return;
        }
        // Radio wyłączone — zatrzymaj wszystko
        const toggle = document.getElementById('sebus-radio-toggle');
        const player = document.getElementById('sebus-radio-player');
        if (toggle) toggle.style.display = 'none';
        if (player) player.classList.remove('show');
        if (radioAudio && !radioAudio.paused) radioAudio.pause();
        stopRadioRealtimeListener();
        radioStopYoutubeWatchdog();
        if (radioSyncTimer) { clearInterval(radioSyncTimer); radioSyncTimer = null; }
    }

    function runIframeFixesModule() {
        document.querySelectorAll('iframe[src*="youtube.com"], iframe[src*="youtube-nocookie.com"]').forEach(iframe => {
            if (iframe.dataset.sebusFixed) return;
            // Pomijamy iframe radia i watchTogether — mają własne ustawienia API
            if (iframe.id === 'sebus-rp-yt-frame' || iframe.id === 'sebus-watch-frame') return;

            iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
            // Nie przepinamy już youtube-nocookie -> youtube.com (powodowało więcej błędów przy adblock)
            iframe.dataset.sebusFixed = 'true';
        });
    }

    function runAudioEmbedsModule() {
        document.querySelectorAll('a[href$=".mp3"], a[href*=".mp3?"]').forEach(link => {
            if (link.dataset.mp3Fixed) return;

            const audio = document.createElement('audio');
            audio.controls = true;
            audio.src = link.href;
            audio.className = 'sebus-audio-player';
            link.after(audio);
            link.style.display = 'none';
            link.dataset.mp3Fixed = 'true';
        });

        const walkMp3 = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
        let nodeMp3;
        const nodesToReplace = [];
        while (nodeMp3 = walkMp3.nextNode()) {
            if (!nodeMp3.nodeValue.includes('.mp3') || !nodeMp3.nodeValue.includes('http')) continue;

            const parent = nodeMp3.parentNode;
            if (!parent || ['SCRIPT','STYLE','TEXTAREA','AUDIO','A'].includes(parent.tagName) || parent.closest('audio')) continue;
            nodesToReplace.push(nodeMp3);
        }

        nodesToReplace.forEach(node => {
            const parent = node.parentNode;
            const regex = /(https?:\/\/[^\s]+?\.mp3)/g;
            if (!regex.test(node.nodeValue)) return;

            const span = document.createElement('span');
            span.innerHTML = node.nodeValue.replace(regex, '<audio controls src="$1" class="sebus-audio-player"></audio>');
            parent.replaceChild(span, node);
        });
    }
