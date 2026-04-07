// Module: 20-mmo-storage-firebase.js
// Source: e:\mpcforum-userscript\skrypt:347-2169
// Purpose: MMO state, storage, auth and Firebase sync

    function getDefaultMmoStateSnapshot() {
        return {
            worldBossState: {
                active: false,
                name: 'Duch MPC',
                maxHp: 1000000,
                currentHp: 1000000,
                totalDamage: 0,
                lastReset: 0,
                dailyContributors: {},
                lastDayRanking: [],
                lastResetReason: '',
                spawnedAt: 0
            },
            globalJackpotState: {
                poolBalance: 0,
                lastWinner: null,
                lastWinAmount: 0,
                lastLotteryAt: 0,
                contributions: []
            },
            guildWarsState: {
                guilds: {},
                controlledSections: {},
                lastUpdate: 0,
                forumSections: ['Metin2', 'Lineage', 'Lost Ark', 'RPG', 'Gry', 'Offtopic']
            },
            guildChatState: {},
            globalMMOEventState: {
                active: false,
                type: null,
                message: '',
                startsAt: 0,
                endsAt: 0
            },
            treasureHuntState: {
                active: false,
                targetPostId: null,
                clue: '',
                winner: null,
                wonAt: 0,
                spawnedAt: 0
            },
            auctionState: {
                currentLot: null,
                bids: [],
                endsAt: 0,
                startedAt: 0
            },
            playerMissionsDaily: [],
            playerMissionsCyclic: [],
            playerMissionInventory: [],
            playerRankingStats: {},
            updatedAt: 0
        };
    }

    function normalizeMmoStatePayload(raw) {
        const parsed = raw && typeof raw === 'object' ? raw : {};
        const defaults = getDefaultMmoStateSnapshot();

        return {
            worldBossState: {
                ...defaults.worldBossState,
                ...(parsed.worldBossState || {}),
                dailyContributors: { ...((parsed.worldBossState || {}).dailyContributors || {}) },
                lastDayRanking: Array.isArray((parsed.worldBossState || {}).lastDayRanking)
                    ? (parsed.worldBossState || {}).lastDayRanking
                    : []
            },
            globalJackpotState: {
                ...defaults.globalJackpotState,
                ...(parsed.globalJackpotState || {}),
                contributions: Array.isArray((parsed.globalJackpotState || {}).contributions)
                    ? (parsed.globalJackpotState || {}).contributions
                    : []
            },
            guildWarsState: {
                ...defaults.guildWarsState,
                ...(parsed.guildWarsState || {}),
                guilds: { ...((parsed.guildWarsState || {}).guilds || {}) },
                controlledSections: { ...((parsed.guildWarsState || {}).controlledSections || {}) },
                forumSections: Array.isArray((parsed.guildWarsState || {}).forumSections)
                    ? (parsed.guildWarsState || {}).forumSections
                    : defaults.guildWarsState.forumSections.slice()
            },
            guildChatState: { ...(parsed.guildChatState || {}) },
            globalMMOEventState: {
                ...defaults.globalMMOEventState,
                ...(parsed.globalMMOEventState || {})
            },
            treasureHuntState: {
                ...defaults.treasureHuntState,
                ...(parsed.treasureHuntState || {})
            },
            auctionState: {
                ...defaults.auctionState,
                ...(parsed.auctionState || {}),
                bids: Array.isArray((parsed.auctionState || {}).bids)
                    ? (parsed.auctionState || {}).bids
                    : []
            },
            playerMissionsDaily: Array.isArray(parsed.playerMissionsDaily) ? parsed.playerMissionsDaily : [],
            playerMissionsCyclic: Array.isArray(parsed.playerMissionsCyclic) ? parsed.playerMissionsCyclic : [],
            playerMissionInventory: Array.isArray(parsed.playerMissionInventory) ? parsed.playerMissionInventory : [],
            playerRankingStats: parsed.playerRankingStats && typeof parsed.playerRankingStats === 'object' ? { ...parsed.playerRankingStats } : {},
            updatedAt: Number(parsed.updatedAt || 0)
        };
    }

    function applyMmoStatePayload(payload, options = {}) {
        const normalized = normalizeMmoStatePayload(payload);
        const preserveExisting = options.preserveExisting !== false;

        if (preserveExisting) {
            const currentGuilds = guildWarsState?.guilds && typeof guildWarsState.guilds === 'object' ? guildWarsState.guilds : {};
            const incomingGuilds = normalized.guildWarsState?.guilds && typeof normalized.guildWarsState.guilds === 'object' ? normalized.guildWarsState.guilds : {};
            if (!Object.keys(incomingGuilds).length && Object.keys(currentGuilds).length) {
                normalized.guildWarsState.guilds = { ...currentGuilds };
            }

            const currentControlled = guildWarsState?.controlledSections && typeof guildWarsState.controlledSections === 'object'
                ? guildWarsState.controlledSections
                : {};
            const incomingControlled = normalized.guildWarsState?.controlledSections && typeof normalized.guildWarsState.controlledSections === 'object'
                ? normalized.guildWarsState.controlledSections
                : {};
            if (!Object.keys(incomingControlled).length && Object.keys(currentControlled).length) {
                normalized.guildWarsState.controlledSections = { ...currentControlled };
            }
        }

        // Misje i ranking są per-user — NIGDY nie nadpisuj ich z shared mmoState (incoming z Firebase).
        // Zawsze zachowaj aktualne lokalne wartości (są ładowane z baksyDb przez loadMissionsFromDb).
        normalized.playerMissionsDaily = Array.isArray(playerMissionsDaily) ? playerMissionsDaily.slice() : [];
        normalized.playerMissionsCyclic = Array.isArray(playerMissionsCyclic) ? playerMissionsCyclic.slice() : [];
        normalized.playerMissionInventory = Array.isArray(playerMissionInventory) ? playerMissionInventory.slice() : [];
        normalized.playerRankingStats = playerRankingStats && typeof playerRankingStats === 'object' ? { ...playerRankingStats } : {};

        worldBossState = normalized.worldBossState;
        globalJackpotState = normalized.globalJackpotState;
        guildWarsState = normalized.guildWarsState;
        guildChatState = normalized.guildChatState;
        globalMMOEventState = normalized.globalMMOEventState;
        treasureHuntState = normalized.treasureHuntState;
        auctionState = normalized.auctionState;
        playerMissionsDaily = normalized.playerMissionsDaily;
        playerMissionsCyclic = normalized.playerMissionsCyclic;
        playerMissionInventory = normalized.playerMissionInventory;
        playerRankingStats = normalized.playerRankingStats;

        if ((!Array.isArray(playerMissionsDaily) || !playerMissionsDaily.length) && (!Array.isArray(playerMissionsCyclic) || !playerMissionsCyclic.length)) {
            initPlayerMissionsIfNeeded();
        }

        return normalizeMmoStatePayload({
            worldBossState,
            globalJackpotState,
            guildWarsState,
            guildChatState,
            globalMMOEventState,
            treasureHuntState,
            auctionState,
            playerMissionsDaily,
            playerMissionsCyclic,
            playerMissionInventory,
            playerRankingStats,
            updatedAt: Number(normalized.updatedAt || nowTs())
        });
    }

    function buildMmoStatePayload() {
        // UWAGA: playerMissionsDaily, playerMissionsCyclic, playerMissionInventory
        // i playerRankingStats są danymi per-user — NIE trafiają do shared mmoState.
        // Są zapisywane w baksyDb (per-user Firebase) przez saveMissionsToDb().
        return normalizeMmoStatePayload({
            worldBossState,
            globalJackpotState,
            guildWarsState,
            guildChatState,
            globalMMOEventState,
            treasureHuntState,
            auctionState,
            playerMissionsDaily: [],
            playerMissionsCyclic: [],
            playerMissionInventory: [],
            playerRankingStats: {},
            updatedAt: nowTs()
        });
    }

    function ensureRankingStatsForUser(userId, displayName) {
        const key = String(userId || '').trim();
        if (!key) return null;
        if (!playerRankingStats || typeof playerRankingStats !== 'object') playerRankingStats = {};
        const rankingStore = /** @type {any} */ (playerRankingStats);
        if (!rankingStore[key] || typeof rankingStore[key] !== 'object') {
            rankingStore[key] = {
                userId: key,
                displayName: String(displayName || getCurrentNickLabel()),
                baksyBalance: 0,
                missionsCompleted: 0,
                bossDamageTotal: 0,
                updatedAt: nowTs()
            };
        }
        if (displayName) rankingStore[key].displayName = String(displayName);
        return rankingStore[key];
    }

    function syncLocalRankingSnapshot() {
        const userId = getRuntimeUserId();
        const account = getBaksyAccount();
        const row = ensureRankingStatsForUser(userId, String(account?.displayName || getCurrentNickLabel()));
        if (!row) return;
        row.baksyBalance = Number(account?.balance || 0);
        row.updatedAt = nowTs();
    }

    function onMmoEvent(eventName, handler) {
        const key = String(eventName || '').trim();
        if (!key || typeof handler !== 'function') return () => {};
        if (!mmoEventListeners[key]) mmoEventListeners[key] = [];
        mmoEventListeners[key].push(handler);
        return () => {
            const list = mmoEventListeners[key] || [];
            mmoEventListeners[key] = list.filter(cb => cb !== handler);
        };
    }

    function emitMmoEvent(eventName, payload = {}) {
        const key = String(eventName || '').trim();
        if (!key) return;
        const list = Array.isArray(mmoEventListeners[key]) ? mmoEventListeners[key].slice() : [];
        const debugEntry = {
            event: key,
            at: nowTs(),
            listeners: list.length,
            payload: payload && typeof payload === 'object' ? { ...payload } : payload
        };
        mmoEventDebugHistory.push(debugEntry);
        if (mmoEventDebugHistory.length > 80) mmoEventDebugHistory = mmoEventDebugHistory.slice(-80);
        if (appSettings?.features?.eventDebug) {
            try {
                console.log('[Sebuś MMO Event]', debugEntry.event, debugEntry);
            } catch (e) {
            }
        }
        list.forEach(handler => {
            try {
                handler(payload);
            } catch (e) {
            }
        });
    }

    function initMmoEventHandlersIfNeeded() {
        if (mmoEventHandlersInitialized) return;
        mmoEventHandlersInitialized = true;

        onMmoEvent('boss:hit', (payload) => {
            const userId = String(payload?.userId || '').trim();
            const damage = Number(payload?.damage || 0);
            if (!userId || damage <= 0) return;
            const account = getBaksyAccount(userId);
            const row = ensureRankingStatsForUser(userId, String(account?.displayName || getCurrentNickLabel()));
            if (!row) return;
            row.bossDamageTotal = Number(row.bossDamageTotal || 0) + damage;
            row.baksyBalance = Number(account?.balance || 0);
            row.updatedAt = nowTs();
        });

        onMmoEvent('boss:defeated', (payload) => {
            const userId = String(payload?.userId || '').trim();
            if (userId && userId === String(getRuntimeUserId())) {
                updateMissionProgress('daily-kill-boss', 1);
            }
        });

        onMmoEvent('jackpot:contributed', (payload) => {
            const userId = String(payload?.userId || '').trim();
            if (userId && userId === String(getRuntimeUserId())) {
                updateMissionProgress('daily-jackpot', 1);
            }
        });

        onMmoEvent('treasure:won', (payload) => {
            const userId = String(payload?.userId || '').trim();
            if (userId && userId === String(getRuntimeUserId())) {
                updateMissionProgress('cyclic-treasure', 1);
            }
        });

        onMmoEvent('auction:bid', (payload) => {
            const userId = String(payload?.userId || '').trim();
            if (userId && userId === String(getRuntimeUserId())) {
                updateMissionProgress('cyclic-auction', 1);
            }
        });

        onMmoEvent('hazard:played', () => {
            updateMissionProgress('daily-hazard-player', 1);
        });

        onMmoEvent('mission:claimed', (payload) => {
            const userId = String(payload?.userId || '').trim() || String(getRuntimeUserId());
            const account = getBaksyAccount(userId);
            const row = ensureRankingStatsForUser(userId, String(account?.displayName || getCurrentNickLabel()));
            if (!row) return;
            row.missionsCompleted = Number(row.missionsCompleted || 0) + 1;
            row.baksyBalance = Number(account?.balance || 0);
            row.updatedAt = nowTs();
        });
    }

    function hydrateMmoStateFromDb(force = false) {
        if (mmoStateHydrated && !force) return;
        const db = ensureBaksyDbLoaded();
        const source = db.mmoState && typeof db.mmoState === 'object' ? { ...db.mmoState } : {};
        if ((!source.guildWarsState || typeof source.guildWarsState !== 'object') && db.guildWarsState && typeof db.guildWarsState === 'object') {
            source.guildWarsState = db.guildWarsState;
        }
        if ((!source.guildChatState || typeof source.guildChatState !== 'object') && db.guildChatState && typeof db.guildChatState === 'object') {
            source.guildChatState = db.guildChatState;
        }
        applyMmoStatePayload(source);
        // Misje i ranking są per-user — wczytaj z baksyDb (nie z shared mmoState)
        loadMissionsFromDb();
        mmoStateHydrated = true;
    }

    function persistMmoState(immediate = false) {
        const db = ensureBaksyDbLoaded();
        db.mmoState = buildMmoStatePayload();
        // Misje i ranking są per-user — zapisz je razem z baksyDb, osobno od shared mmoState
        db.playerMissionsDaily = Array.isArray(playerMissionsDaily) ? playerMissionsDaily.slice() : [];
        db.playerMissionsCyclic = Array.isArray(playerMissionsCyclic) ? playerMissionsCyclic.slice() : [];
        db.playerMissionInventory = Array.isArray(playerMissionInventory) ? playerMissionInventory.slice() : [];
        db.playerRankingStats = playerRankingStats && typeof playerRankingStats === 'object' ? { ...playerRankingStats } : {};
        const shouldSaveImmediately = !!immediate;

        if (shouldSaveImmediately) {
            if (mmoStateSaveTimer) clearTimeout(mmoStateSaveTimer);
            mmoStateSaveTimer = null;
            saveBaksyDb();
            scheduleFirebaseSharedMmoSync(true);
            return;
        }

        if (mmoStateSaveTimer) clearTimeout(mmoStateSaveTimer);
        mmoStateSaveTimer = setTimeout(() => {
            mmoStateSaveTimer = null;
            saveBaksyDb();
            scheduleFirebaseSharedMmoSync();
        }, 900);

        scheduleFirebaseSharedMmoSync();
    }

    function sanitizeRuntimeUserId(value) {
        const raw = String(value || '').trim();
        if (!raw) return '';
        return raw.replace(/[^0-9a-zA-Z_-]/g, '');
    }

    function pickIdFromProfileHref(href) {
        const src = String(href || '');
        const m1 = src.match(/showuser=(\d+)/i);
        if (m1 && m1[1]) return m1[1];
        const m2 = src.match(/\/(?:profile|members?)\/(\d+)(?:[\-./?]|$)/i);
        if (m2 && m2[1]) return m2[1];
        const m3 = src.match(/\.(\d+)(?:[/?#]|$)/);
        if (m3 && m3[1]) return m3[1];
        return '';
    }

    function detectRuntimeUserIdFromPage() {
        const fromBodyDataset = sanitizeRuntimeUserId(
            document.body?.dataset?.memberid ||
            document.body?.dataset?.userid ||
            document.documentElement?.dataset?.memberid ||
            document.documentElement?.dataset?.userid
        );
        if (fromBodyDataset) return fromBodyDataset;

        const idAnchors = [
            '#elUserNav a[data-memberid]',
            'a[data-memberid][data-ipsmenu]',
            'a[data-memberid][href*="/profile/"]',
            'a[data-mentionid]'
        ];

        for (const selector of idAnchors) {
            const found = document.querySelector(selector);
            const foundId = sanitizeRuntimeUserId(found?.getAttribute('data-memberid') || found?.getAttribute('data-mentionid'));
            if (foundId) return foundId;
            const hrefId = sanitizeRuntimeUserId(pickIdFromProfileHref(found?.getAttribute('href')));
            if (hrefId) return hrefId;
        }

        const navProfileLink = document.querySelector('#elUserNav a[href*="/profile/"], #elUserNav a[href*="showuser="]');
        const navId = sanitizeRuntimeUserId(pickIdFromProfileHref(navProfileLink?.getAttribute('href')));
        if (navId) return navId;

        // User is not logged in - use session-based anonymous ID
        return getOrCreateSessionUserId();
    }

    function getRuntimeUserId(forceRefresh = false) {
        const now = Date.now();
        if (!forceRefresh && runtimeUserIdCache && (now - runtimeUserIdLastResolvedAt) < runtimeUserIdRefreshMs) {
            return runtimeUserIdCache;
        }

        const detected = detectRuntimeUserIdFromPage();
        runtimeUserIdCache = sanitizeRuntimeUserId(detected || runtimeUserIdCache || myID) || String(myID);
        runtimeUserIdLastResolvedAt = now;
        return runtimeUserIdCache;
    }

    function migrateStorageBucket(bucketName) {
        try {
            const currentKey = storageKeys[bucketName];
            if (!currentKey) return null;

            const currentValue = localStorage.getItem(currentKey);
            if (currentValue !== null) return currentValue;

            const legacyKeys = legacyStorageKeys[bucketName] || [];
            for (const legacyKey of legacyKeys) {
                const legacyValue = localStorage.getItem(legacyKey);
                if (legacyValue === null) continue;

                localStorage.setItem(currentKey, legacyValue);
                localStorage.setItem(storageMigrationMarkerKey, storageVersion);
                return legacyValue;
            }
        } catch (e) {}

        return null;
    }

    function migrateLegacyStorageKeys() {
        Object.keys(storageKeys).forEach(migrateStorageBucket);
        try {
            localStorage.setItem(storageMigrationMarkerKey, storageVersion);
        } catch (e) {}
    }

    function readStorageValue(bucketName) {
        try {
            const currentKey = storageKeys[bucketName];
            if (!currentKey) return null;

            const currentValue = localStorage.getItem(currentKey);
            if (currentValue !== null) return currentValue;

            return migrateStorageBucket(bucketName);
        } catch (e) {
            return null;
        }
    }

    function saveStorageValue(key, value) {
        try {
            localStorage.setItem(key, value);
            return true;
        } catch (e) {
            return false;
        }
    }

    function safeRunModule(name, callback) {
        try {
            callback();
        } catch (e) {}
    }

    function scheduleModule(name, options = {}) {
        const task = MODULE_TASKS[name];
        if (!task) return;

        const delay = options.immediate ? 0 : Math.max(0, Number(options.delayMs ?? task.debounceMs) || 0);
        const existingTimer = moduleTimers.get(name);
        if (existingTimer) clearTimeout(existingTimer);

        const timerId = setTimeout(() => {
            moduleTimers.delete(name);
            safeRunModule(name, task.run);
        }, delay);

        moduleTimers.set(name, timerId);
    }

    function scheduleModules(names, options = {}) {
        names.forEach(name => scheduleModule(name, options));
    }

    function scheduleAllModules(options = {}) {
        scheduleModules(Object.keys(MODULE_TASKS), options);
    }

    function scheduleModulesForSetting(kind, key) {
        const moduleNames = new Set(['settingsPanel']);

        if (kind === 'feature') {
            if (key === 'chatTools') moduleNames.add('chatTools');
            if (key === 'editorStats') moduleNames.add('editorStats');
            if (key === 'nickGlow') moduleNames.add('nickGlow');
            if (key === 'goldSebus') {
                moduleNames.add('goldSebus');
                moduleNames.add('nickGlow');
                moduleNames.add('avatarGlow');
            }
            if (key === 'radio') moduleNames.add('radio');
            if (key === 'stickyNotes') {
                moduleNames.add('stickyNotes');
                moduleNames.add('chatEnhancements');
            }
            if (key === 'realTimeActivity') moduleNames.add('realTimeActivity');
            if (key === 'ghostCurtain') moduleNames.add('ghostCurtain');
            if (key === 'baksy') moduleNames.add('baksy');
            if (key === 'gamesMenu') moduleNames.add('baksy');
            if (key === 'hazard') moduleNames.add('baksy');
            if (key === 'missions') moduleNames.add('baksy');
            if (key === 'ranking') moduleNames.add('baksy');
            if (key === 'mmoChat') moduleNames.add('baksy');
        }

        if (kind === 'radio') moduleNames.add('radio');

        if (kind === 'activity') {
            lastLifeScanAt = 0;
            moduleNames.add('realTimeActivity');
        }

        if (kind === 'ghostCurtain') {
            lastGhostCurtainRunAt = 0;
            moduleNames.add('ghostCurtain');
        }

        if (kind === 'baksy') {
            moduleNames.add('baksy');
            moduleNames.add('nickGlow');
        }

        if (kind === 'ui') {
            moduleNames.add('settingsPanel');
            moduleNames.add('baksy');
        }

        scheduleModules(Array.from(moduleNames), { immediate: true });
    }

    migrateLegacyStorageKeys();
    let appSettings = loadSettings();
    applyUiSkin();

    function loadProfileActivityCache() {
        try {
            const raw = readStorageValue('profileActivityCache');
            const parsed = raw ? JSON.parse(raw) : {};
            const now = Date.now();
            const maxAgeMs = 30 * 60 * 1000;
            const cleaned = {};

            Object.keys(parsed || {}).forEach(key => {
                const item = parsed[key];
                if (!item || typeof item.minutes !== 'number' || typeof item.updatedAt !== 'number') return;
                if (now - item.updatedAt > maxAgeMs) return;
                cleaned[key] = item;
            });

            return cleaned;
        } catch (e) {
            return {};
        }
    }

    function saveProfileActivityCache(cache) {
        try {
            const entries = Object.entries(cache || {});
            const limited = entries.slice(Math.max(0, entries.length - 400));
            const normalized = Object.fromEntries(limited);
            localStorage.setItem(profileActivityCacheStorageKey, JSON.stringify(normalized));
        } catch (e) {}
    }

    profileActivityCache = loadProfileActivityCache();

    function normalizeSettingsPayload(parsed) {
        return {
            features: {
                ...defaultSettings.features,
                ...(parsed?.features || {})
            },
            radio: {
                ...defaultSettings.radio,
                ...(parsed?.radio || {})
            },
            activity: {
                ...defaultSettings.activity,
                ...(parsed?.activity || {})
            },
            ghostCurtain: {
                ...defaultSettings.ghostCurtain,
                ...(parsed?.ghostCurtain || {})
            },
            baksy: {
                ...defaultSettings.baksy,
                ...(parsed?.baksy || {})
            },
            ui: {
                ...defaultSettings.ui,
                ...(parsed?.ui || {})
            }
        };
    }

    function normalizeUiSkin(value) {
        const availableSkins = new Set(['mmo2026', 'classic', 'cyber', 'void']);
        const skin = String(value || '').trim().toLowerCase();
        return availableSkins.has(skin) ? skin : defaultSettings.ui.skin;
    }

    function applyUiSkin() {
        if (!appSettings || typeof appSettings !== 'object') return;
        if (!appSettings.ui || typeof appSettings.ui !== 'object') appSettings.ui = { ...defaultSettings.ui };

        const skin = normalizeUiSkin(appSettings.ui.skin);
        appSettings.ui.skin = skin;

        const apply = () => {
            const bodyTarget = document.body;
            const rootTarget = document.documentElement;
            if (rootTarget) rootTarget.setAttribute('data-sebus-skin', skin);
            if (bodyTarget) bodyTarget.setAttribute('data-sebus-skin', skin);
        };

        if (document.body || document.documentElement) apply();
        else document.addEventListener('DOMContentLoaded', apply, { once: true });
    }

    function loadSettings() {
        try {
            const raw = readStorageValue('settings');
            if (!raw) return normalizeSettingsPayload({});

            const parsed = JSON.parse(raw);
            return normalizeSettingsPayload(parsed);
        } catch (e) {
            return normalizeSettingsPayload({});
        }
    }

    function saveSettings() {
        try {
            localStorage.setItem(settingsStorageKey, JSON.stringify(appSettings));
        } catch (e) {}
        scheduleFirebaseSettingsSync();
    }

    function setFeatureSetting(key, value) {
        appSettings.features[key] = !!value;
        saveSettings();
        scheduleModulesForSetting('feature', key);
    }

    function setRadioSetting(key, value) {
        appSettings.radio[key] = value;
        saveSettings();
        scheduleModulesForSetting('radio', key);
    }

    function setActivitySetting(key, value) {
        appSettings.activity[key] = value;
        saveSettings();
        scheduleModulesForSetting('activity', key);
    }

    function setGhostCurtainSetting(key, value) {
        appSettings.ghostCurtain[key] = value;
        saveSettings();
        scheduleModulesForSetting('ghostCurtain', key);
    }

    function setBaksySetting(key, value) {
        appSettings.baksy[key] = value;
        saveSettings();
        scheduleModulesForSetting('baksy', key);
    }

    function setUiSetting(key, value) {
        if (!appSettings.ui || typeof appSettings.ui !== 'object') appSettings.ui = { ...defaultSettings.ui };

        if (key === 'skin') {
            appSettings.ui.skin = normalizeUiSkin(value);
            applyUiSkin();
        } else {
            appSettings.ui[key] = value;
        }

        saveSettings();
        scheduleModulesForSetting('ui', key);
    }

    function getBaksyStorageKey() {
        return storageKeys.baksyDb;
    }

    function nowTs() {
        return Date.now();
    }

    function normalizeBaksyDbPayload(parsed) {
        return {
            ...createDefaultBaksyDb(),
            ...(parsed || {}),
            accounts: { ...(parsed?.accounts || {}) },
            events: Array.isArray(parsed?.events) ? parsed.events : [],
            ledger: Array.isArray(parsed?.ledger) ? parsed.ledger : [],
            mmoState: normalizeMmoStatePayload(parsed?.mmoState || {}),
            // Per-user dane misji i rankingu — przechowywane w baksyDb, nie w shared mmoState
            playerMissionsDaily: Array.isArray(parsed?.playerMissionsDaily) ? parsed.playerMissionsDaily : [],
            playerMissionsCyclic: Array.isArray(parsed?.playerMissionsCyclic) ? parsed.playerMissionsCyclic : [],
            playerMissionInventory: Array.isArray(parsed?.playerMissionInventory) ? parsed.playerMissionInventory : [],
            playerRankingStats: parsed?.playerRankingStats && typeof parsed.playerRankingStats === 'object' ? { ...parsed.playerRankingStats } : {}
        };
    }

    function buildFirebaseUserRootUrl(userId = getRuntimeUserId()) {
        const safeId = sanitizeRuntimeUserId(userId);
        if (!safeId) return '';
        return `${firebaseRtdbBaseUrl}/users/${encodeURIComponent(safeId)}.json`;
    }

    async function firebaseRequest(url, options = {}) {
        if (!firebaseSyncEnabled || !url) return null;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), firebaseSyncTimeoutMs);

        try {
            const response = await fetch(url, {
                method: options.method || 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(options.headers || {})
                },
                body: options.body,
                signal: controller.signal
            });

            if (!response.ok) return null;
            if (options.expectJson === false) return true;
            return await response.json();
        } catch (e) {
            return null;
        } finally {
            clearTimeout(timeoutId);
        }
    }

    function setFirebaseAuthToken(tokenData) {
        if (!tokenData || typeof tokenData !== 'object') return false;
        try {
            firebaseAuthToken = tokenData.token || null;
            firebaseAuthUid = tokenData.uid || null;
            firebaseAuthUserEmail = tokenData.token?.authFields?.email || null;
            saveStorageValue('firebaseAuthToken', JSON.stringify({
                token: firebaseAuthToken,
                uid: firebaseAuthUid,
                email: firebaseAuthUserEmail,
                savedAt: nowTs()
            }));
            console.log(`[Baksy] Firebase auth token set for UID: ${firebaseAuthUid}, Email: ${firebaseAuthUserEmail}`);
            return true;
        } catch (e) {
            console.error('[Baksy] Failed to set Firebase auth token:', e);
            return false;
        }
    }

    function loadFirebaseAuthToken() {
        try {
            const stored = readStorageValue('firebaseAuthToken');
            if (!stored) return false;
            const data = JSON.parse(stored);
            firebaseAuthToken = data.token || null;
            firebaseAuthUid = data.uid || null;
            firebaseAuthUserEmail = data.email || null;
            console.log(`[Baksy] Firebase auth token loaded from storage: UID ${firebaseAuthUid}`);
            return !!firebaseAuthToken;
        } catch (e) {
            return false;
        }
    }

    function getFirebaseAuthHeaders() {
        const headers = { 'Content-Type': 'application/json' };
        if (firebaseAuthToken && typeof firebaseAuthToken === 'object') {
            try {
                // Serialize token as JSON string in auth header for RTDB custom token
                headers['Authorization'] = `Bearer ${JSON.stringify(firebaseAuthToken)}`;
            } catch (e) {
                // Fallback if token can't be serialized
            }
        }
        return headers;
    }

    async function verifyFirebaseAuthToken() {
        if (!firebaseAuthToken || firebaseAuthCheckInFlight) return !!firebaseAuthToken;
        const now = nowTs();
        if ((now - firebaseAuthCheckedAt) < 30000) return !!firebaseAuthToken;

        firebaseAuthCheckInFlight = true;
        try {
            // Verify token by attempting a read on user's own path
            const testUrl = `${firebaseRtdbBaseUrl}/users/${encodeURIComponent(firebaseAuthUid || 'test')}.json`;
            const result = await firebaseRequest(testUrl, {
                method: 'GET',
                headers: getFirebaseAuthHeaders()
            });
            firebaseAuthCheckedAt = nowTs();
            return !!result;
        } catch (e) {
            firebaseAuthCheckedAt = nowTs();
            return false;
        } finally {
            firebaseAuthCheckInFlight = false;
        }
    }

    async function firebaseReadUserState(userId = getRuntimeUserId()) {
        const url = buildFirebaseUserRootUrl(userId);
        const data = await firebaseRequest(url, { method: 'GET' });
        if (!data || typeof data !== 'object') return null;
        return data;
    }

    async function firebaseWriteUserStatePart(partKey, payload, userId = getRuntimeUserId()) {
        const rootUrl = buildFirebaseUserRootUrl(userId);
        if (!rootUrl) return false;
        const partUrl = rootUrl.replace(/\.json$/i, `/${partKey}.json`);
        const result = await firebaseRequest(partUrl, {
            method: 'PUT',
            body: JSON.stringify(payload),
            expectJson: true
        });
        return result !== null;
    }

    function buildFirebasePathUrl(path) {
        const safePath = String(path || '').replace(/^\/+/, '').replace(/\/+$/, '');
        if (!safePath) return '';
        return `${firebaseRtdbBaseUrl}/${safePath}.json`;
    }

    async function firebaseReadPath(path) {
        const url = buildFirebasePathUrl(path);
        return await firebaseRequest(url, { method: 'GET' });
    }

    async function firebaseWritePath(path, payload) {
        const url = buildFirebasePathUrl(path);
        const result = await firebaseRequest(url, {
            method: 'PUT',
            body: JSON.stringify(payload),
            expectJson: true
        });
        return result !== null;
    }

    function firebaseServerTimestampValue() {
        return { '.sv': 'timestamp' };
    }

    async function firebaseDeletePath(path) {
        return await firebaseWritePath(path, null);
    }

    async function firebaseStreamPath(path, handlers = {}) {
        if (!firebaseSyncEnabled) return null;
        const url = buildFirebasePathUrl(path);
        if (!url) return null;

        const controller = new AbortController();
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                Accept: 'text/event-stream',
                'Cache-Control': 'no-cache',
                ...(getFirebaseAuthHeaders ? getFirebaseAuthHeaders() : {}),
                ...(handlers.headers || {})
            },
            signal: controller.signal
        });

        if (!response.ok || !response.body) {
            try { controller.abort(); } catch { }
            return null;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        const processEventChunk = (chunk) => {
            const lines = chunk.split(/\r?\n/);
            let eventName = 'message';
            const dataLines = [];
            for (const line of lines) {
                if (line.startsWith('event:')) eventName = line.slice(6).trim();
                else if (line.startsWith('data:')) dataLines.push(line.slice(5).trim());
            }
            const rawData = dataLines.join('\n');
            let parsedData = rawData;
            try { parsedData = rawData ? JSON.parse(rawData) : null; } catch { }
            if (handlers.onEvent) handlers.onEvent({ event: eventName, data: parsedData, raw: rawData });
        };

        (async () => {
            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    buffer += decoder.decode(value, { stream: true });

                    let separatorIndex = buffer.search(/\r?\n\r?\n/);
                    while (separatorIndex !== -1) {
                        const chunk = buffer.slice(0, separatorIndex).trim();
                        const separatorMatch = buffer.slice(separatorIndex).match(/^\r?\n\r?\n/);
                        buffer = buffer.slice(separatorIndex + (separatorMatch ? separatorMatch[0].length : 2));
                        if (chunk) processEventChunk(chunk);
                        separatorIndex = buffer.search(/\r?\n\r?\n/);
                    }
                }
                if (handlers.onClose) handlers.onClose();
            } catch (error) {
                if (!controller.signal.aborted && handlers.onError) handlers.onError(error);
            }
        })();

        return controller;
    }

    function normalizeAdminName(value) {
        return String(value || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, '')
            .toLowerCase();
    }

    async function checkAdminAccess(force = false) {
        const now = nowTs();
        if (!force && (now - baksyAdminAccessCheckedAt) < 15000) return baksyAdminAccessAllowed;
        if (baksyAdminAccessCheckInFlight) return baksyAdminAccessAllowed;

        baksyAdminAccessCheckInFlight = true;
        try {
            const runtimeUserId = String(getRuntimeUserId(true));
            if (runtimeUserId !== baksyAdminUserId) {
                baksyAdminAccessAllowed = false;
                baksyAdminAccessCheckedAt = nowTs();
                return false;
            }

            // Check if auth token is available and matches admin UID
            if (firebaseAuthToken && firebaseAuthUid === baksyAdminUserId) {
                const adminEntry = await firebaseReadPath(`${baksySharedRootPath}/accounts/${encodeURIComponent(baksyAdminUserId)}`);
                const remoteName = normalizeAdminName(adminEntry?.displayName);
                const requiredName = normalizeAdminName(baksyAdminDisplayName);
                baksyAdminAccessAllowed = !!adminEntry && remoteName === requiredName;
                baksyAdminAccessCheckedAt = nowTs();
                return baksyAdminAccessAllowed;
            }

            const adminEntry = await firebaseReadPath(`${baksySharedRootPath}/accounts/${encodeURIComponent(baksyAdminUserId)}`);
            const remoteName = normalizeAdminName(adminEntry?.displayName);
            const requiredName = normalizeAdminName(baksyAdminDisplayName);
            baksyAdminAccessAllowed = !!adminEntry && remoteName === requiredName;
            baksyAdminAccessCheckedAt = nowTs();
            return baksyAdminAccessAllowed;
        } catch (e) {
            baksyAdminAccessAllowed = false;
            baksyAdminAccessCheckedAt = nowTs();
            return false;
        } finally {
            baksyAdminAccessCheckInFlight = false;
        }
    }

    function getCurrentDayKey() {
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const d = String(now.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }

    function createDefaultDailyMissionsState(dayKey = getCurrentDayKey()) {
        return {
            dayKey,
            progress: {
                readPosts: 0, chatMessages: 0, forumPosts: 0,
                archiveHunter: 0, midnightWhisper: 0,
                visitTopic: 0, writePost: 0, reactToPost: 0,
                followTopic: 0, timeOnForum: 0, deepArchive: 0, nightOwl: 0,
                visitIn_metin2: 0, visitIn_gry: 0, visitIn_offtopic: 0, visitIn_rpg: 0,
                postIn_metin2: 0, postIn_gry: 0, reactIn_metin2: 0, reactIn_gry: 0
            },
            hiddenUnlocked: {
                midnightWhisper: false, nightOwl: false, deepArchive: false
            },
            completed: {},
            claimedAt: {},
            readSeenKeys: [],
            reactionsSeenKeys: [],
            followsSeenKeys: [],
            topicsSeenKeys: []
        };
    }

    function getDailyMissionDefinitions() {
        return [
            { id: 'readPosts',       label: 'Common: Przeczytaj 12 postów',          target: 12, reward: 45,  rarity: 'common' },
            { id: 'chatMessages',    label: 'Common: Napisz 4 wiad. na czacie',      target: 4,  reward: 35,  rarity: 'common' },
            { id: 'forumPosts',      label: 'Rare: Napisz 2 posty na forum',         target: 2,  reward: 65,  rarity: 'rare' },
            { id: 'archiveHunter',   label: 'Epic: Archeolog – odkryj 3 arch.',      target: 3,  reward: 120, rarity: 'epic' },
            { id: 'midnightWhisper', label: 'Legendary: ??? (ukryta misja)',         target: 1,  reward: 260, rarity: 'legendary', hidden: true },
            { id: 'visitTopic',      label: 'Common: Odwiedź 5 tematów',             target: 5,  reward: 35,  rarity: 'common' },
            { id: 'writePost',       label: 'Rare: Napisz 2 posty/odpowiedzi',       target: 2,  reward: 75,  rarity: 'rare' },
            { id: 'reactToPost',     label: 'Common: Zareaguj na 3 posty',           target: 3,  reward: 50,  rarity: 'common' },
            { id: 'followTopic',     label: 'Common: Zaobserwuj 1 temat',            target: 1,  reward: 40,  rarity: 'common' },
            { id: 'timeOnForum',     label: 'Common: Bądź aktywny 5 min na forum',   target: 5,  reward: 60,  rarity: 'common' },
            { id: 'deepArchive',     label: 'Epic: Historyk – temat >3 lata',        target: 1,  reward: 150, rarity: 'epic',  hidden: true },
            { id: 'nightOwl',        label: 'Epic: Nocna Sowa – post 22-4',          target: 1,  reward: 110, rarity: 'epic',  hidden: true },
            { id: 'visitIn_metin2',  label: 'Rare: Odwiedź 2 tematy w Metin2',       target: 2,  reward: 55,  rarity: 'rare' },
            { id: 'visitIn_gry',     label: 'Common: Odwiedź 3 tematy w Gry',        target: 3,  reward: 50,  rarity: 'common' }
        ];
    }

    function getLeagueDivisionByRank(rank) {
        const index = Number(rank) || 999;
        if (index <= 3) return { name: 'Legenda MPC', level: 5, rarity: 'legendary' };
        if (index <= 10) return { name: 'Diament', level: 4, rarity: 'epic' };
        if (index <= 30) return { name: 'Złoto', level: 3, rarity: 'rare' };
        if (index <= 70) return { name: 'Srebro', level: 2, rarity: 'rare' };
        return { name: 'Brąz', level: 1, rarity: 'common' };
    }

    function getRarityColor(rarity) {
        const map = {
            common: '#e8e8e8',
            rare: '#58a6ff',
            epic: '#b685ff',
            legendary: '#ff9e45'
        };
        return map[String(rarity || 'common').toLowerCase()] || map.common;
    }

    function ensureLeagueMetaState(account) {
        if (!account.leagueMeta || typeof account.leagueMeta !== 'object') {
            account.leagueMeta = {
                knowledgePoints: 0,
                skillTree: {
                    shopDiscount: 0,
                    jackpotLuck: 0,
                    missionBoost: 0
                },
                throneChallengesWon: 0,
                throneChallengesLost: 0,
                wealthHistory: [],
                lastKingIncomeAt: 0,
                market: {
                    resources: {
                        goldDust: 0,
                        oldDiskette: 0
                    },
                    craftedItems: [],
                    stockShares: 0,
                    stockAvgPrice: 0,
                    stockLastActionAt: 0
                }
            };
        }

        if (!account.leagueMeta.skillTree) {
            account.leagueMeta.skillTree = { shopDiscount: 0, jackpotLuck: 0, missionBoost: 0 };
        }
        if (!account.leagueMeta.market) {
            account.leagueMeta.market = {
                resources: { goldDust: 0, oldDiskette: 0 },
                craftedItems: [],
                stockShares: 0,
                stockAvgPrice: 0,
                stockLastActionAt: 0
            };
        }
        if (!account.leagueMeta.market.resources) {
            account.leagueMeta.market.resources = { goldDust: 0, oldDiskette: 0 };
        }
        if (!Array.isArray(account.leagueMeta.wealthHistory)) account.leagueMeta.wealthHistory = [];
        if (!Array.isArray(account.leagueMeta.market.craftedItems)) account.leagueMeta.market.craftedItems = [];
        if (!Number.isFinite(Number(account.seededAt)) || Number(account.seededAt) <= 0) account.seededAt = nowTs();
        return account.leagueMeta;
    }

    function getRuntimeLeagueLevel() {
        const runtimeUserId = String(getRuntimeUserId());
        const rows = Array.isArray(baksyWorldCache?.leaderboard) ? baksyWorldCache.leaderboard : [];
        const rank = Math.max(1, rows.findIndex(row => String(row.userId) === runtimeUserId) + 1 || 999);
        return getLeagueDivisionByRank(rank).level;
    }

    function getPrestigeMultiplier(account = getBaksyAccount()) {
        const safeAccount = account || getBaksyAccount();
        const leagueMeta = ensureLeagueMetaState(safeAccount);
        const seededAt = Number(safeAccount.seededAt || nowTs());
        const days = Math.max(0, Math.floor((nowTs() - seededAt) / (24 * 60 * 60 * 1000)));
        const leagueLevel = getRuntimeLeagueLevel();
        const base = 1 + (days / 365) + (leagueLevel / 10);
        const missionSkillBonus = 1 + (Number(leagueMeta.skillTree.missionBoost || 0) * 0.05);
        return Number((base * missionSkillBonus).toFixed(4));
    }

    function getCommunityGoalState() {
        const db = ensureBaksyDbLoaded();
        if (!db.communityGoal || typeof db.communityGoal !== 'object') {
            db.communityGoal = {
                dayKey: getCurrentDayKey(),
                targetMessages: 500,
                localMessages: 0,
                weekendBonusActive: false,
                lastRemoteTotal: 0,
                lastRemoteSyncAt: 0
            };
        }
        if (db.communityGoal.dayKey !== getCurrentDayKey()) {
            db.communityGoal.dayKey = getCurrentDayKey();
            db.communityGoal.localMessages = 0;
            db.communityGoal.weekendBonusActive = false;
            db.communityGoal.lastRemoteTotal = 0;
            db.communityGoal.lastRemoteSyncAt = 0;
        }
        return db.communityGoal;
    }

    async function pushCommunityGoalProgress() {
        try {
            if (!firebaseSyncEnabled) return;
            const state = getCommunityGoalState();
            const uid = String(getRuntimeUserId());
            const path = `${baksySharedRootPath}/communityGoal/${encodeURIComponent(state.dayKey)}/${encodeURIComponent(uid)}`;
            await firebaseWritePath(path, {
                messages: Number(state.localMessages || 0),
                userId: uid,
                updatedAt: nowTs()
            });
        } catch (e) {}
    }

    function scheduleCommunityGoalSync() {
        if (communityGoalSyncTimer) clearTimeout(communityGoalSyncTimer);
        communityGoalSyncTimer = setTimeout(() => {
            communityGoalSyncTimer = null;
            pushCommunityGoalProgress();
        }, 1200);
    }

    async function refreshCommunityGoalRemoteTotal() {
        try {
            if (!firebaseSyncEnabled) return getCommunityGoalState().localMessages;
            const state = getCommunityGoalState();
            const dayKey = state.dayKey;
            const path = `${baksySharedRootPath}/communityGoal/${encodeURIComponent(dayKey)}`;
            const payload = await firebaseReadPath(path);
            const total = Object.values(payload || {}).reduce((sum, row) => {
                return sum + Number(row?.messages || 0);
            }, 0);
            state.lastRemoteTotal = total;
            state.lastRemoteSyncAt = nowTs();
            communityGoalCache.dayKey = dayKey;
            communityGoalCache.totalMessages = total;
            communityGoalCache.updatedAt = nowTs();
            saveBaksyDb();
            return total;
        } catch (e) {
            return getCommunityGoalState().lastRemoteTotal || getCommunityGoalState().localMessages;
        }
    }

    function ensureDailyMissionsState(account) {
        if (!account) return createDefaultDailyMissionsState();

        const currentDayKey = getCurrentDayKey();
        const existing = account.dailyMissions;
        if (!existing || typeof existing !== 'object' || existing.dayKey !== currentDayKey) {
            account.dailyMissions = createDefaultDailyMissionsState(currentDayKey);
            account.updatedAt = nowTs();
            return account.dailyMissions;
        }

        if (!existing.progress || typeof existing.progress !== 'object') existing.progress = { readPosts: 0, chatMessages: 0, forumPosts: 0, archiveHunter: 0, midnightWhisper: 0, visitTopic: 0, writePost: 0, reactToPost: 0, followTopic: 0, timeOnForum: 0, deepArchive: 0, nightOwl: 0, visitIn_metin2: 0, visitIn_gry: 0, visitIn_offtopic: 0, visitIn_rpg: 0, postIn_metin2: 0, postIn_gry: 0, reactIn_metin2: 0, reactIn_gry: 0 };
        if (!existing.hiddenUnlocked || typeof existing.hiddenUnlocked !== 'object') existing.hiddenUnlocked = { midnightWhisper: false, nightOwl: false, deepArchive: false };
        if (!existing.completed || typeof existing.completed !== 'object') existing.completed = {};
        if (!existing.claimedAt || typeof existing.claimedAt !== 'object') existing.claimedAt = {};
        if (!Array.isArray(existing.readSeenKeys)) existing.readSeenKeys = [];
        if (!Array.isArray(existing.reactionsSeenKeys)) existing.reactionsSeenKeys = [];
        if (!Array.isArray(existing.followsSeenKeys)) existing.followsSeenKeys = [];
        if (!Array.isArray(existing.topicsSeenKeys)) existing.topicsSeenKeys = [];
        return existing;
    }

    function addDailyMissionProgress(missionId, step = 1, options = {}) {
        const account = getBaksyAccount();
        const leagueMeta = ensureLeagueMetaState(account);
        const missions = ensureDailyMissionsState(account);
        const defs = getDailyMissionDefinitions();
        const def = defs.find(item => item.id === missionId);
        if (!def) return false;
        const changedMissionIds = [String(missionId)];

        if (def.hidden && !missions.hiddenUnlocked?.[def.id]) return false;

        const current = Number(missions.progress[missionId] || 0);
        const target = Number(def.target || 0);
        const next = Math.min(target, current + Math.max(0, Number(step) || 0));
        if (next === current) return false;

        missions.progress[missionId] = next;

        if (missionId === 'chatMessages') {
            const hour = new Date().getHours();
            if (hour === 0) {
                missions.hiddenUnlocked.midnightWhisper = true;
                missions.progress.midnightWhisper = Math.min(1, Number(missions.progress.midnightWhisper || 0) + 1);
                changedMissionIds.push('midnightWhisper');
            }
        }

        if (missionId === 'readPosts') {
            const archiveGain = Math.max(0, Math.floor((Number(step) || 0) / 4));
            if (archiveGain > 0) {
                missions.progress.archiveHunter = Math.min(3, Number(missions.progress.archiveHunter || 0) + archiveGain);
                changedMissionIds.push('archiveHunter');

                    if (missionId === 'writePost') {
                        const hour = new Date().getHours();
                        if (hour >= 22 || hour < 4) {
                            missions.hiddenUnlocked.nightOwl = true;
                            const nightOwlPrev = Number(missions.progress.nightOwl || 0);
                            missions.progress.nightOwl = Math.min(1, nightOwlPrev + 1);
                            changedMissionIds.push('nightOwl');
                        }
                    }
            }
        }

        if (missionId === 'chatMessages' || missionId === 'forumPosts') {
            const goal = getCommunityGoalState();
            goal.localMessages = Math.max(0, Number(goal.localMessages || 0) + Math.max(0, Number(step) || 0));
            goal.weekendBonusActive = Number(goal.localMessages || 0) >= Number(goal.targetMessages || 500);
            scheduleCommunityGoalSync();
        }

        account.updatedAt = nowTs();

        const uniqueChanged = Array.from(new Set(changedMissionIds));
        uniqueChanged.forEach(changedId => {
            const changedDef = defs.find(item => item.id === changedId);
            if (!changedDef) return;
            if (changedDef.hidden && !missions.hiddenUnlocked?.[changedDef.id]) return;

            const progress = Number(missions.progress[changedId] || 0);
            const changedTarget = Number(changedDef.target || 0);
            if (progress < changedTarget || missions.completed[changedId]) return;

            missions.completed[changedId] = true;
            missions.claimedAt[changedId] = nowTs();
            leagueMeta.knowledgePoints = Number(leagueMeta.knowledgePoints || 0) + 1;
            const prestigeReward = Number(changedDef.reward || 0) * getPrestigeMultiplier(account);
            awardBaksy(prestigeReward, `daily_mission:${changedId}`, {
                dayKey: missions.dayKey,
                target: changedDef.target,
                prestige: getPrestigeMultiplier(account)
            }, { disableNightMultiplier: true });
        });

        if (!options || options.autoSave !== false) saveBaksyDb();
        return true;
    }

    function trackDailyReadMissionProgress() {
        const account = getBaksyAccount();
        const missions = ensureDailyMissionsState(account);
        const seen = new Set(Array.isArray(missions.readSeenKeys) ? missions.readSeenKeys : []);
        let added = 0;

        document.querySelectorAll('article[id^="elComment_"], [data-commentid], .ipsComment, .cPost').forEach(post => {
            const key = buildPostActionKey(post);
            if (!key || seen.has(key)) return;
            seen.add(key);
            added += 1;
        });

        if (!added) return;
        missions.readSeenKeys = compactList(Array.from(seen), 1200);
        addDailyMissionProgress('readPosts', added, { autoSave: true });
    }

    function getDailyMissionUiSnapshot() {
        const account = getBaksyAccount();
        const missions = ensureDailyMissionsState(account);
        return getDailyMissionDefinitions().map(def => {
            const progress = Number(missions.progress[def.id] || 0);
            return {
                ...def,
                progress,
                completed: !!missions.completed[def.id],
                dayKey: missions.dayKey
            };
        });
    }

    function normalizeBaksyNumber(value) {
        const n = Number(value);
        if (!Number.isFinite(n)) return 0;
        return Math.round(n * 100) / 100;
    }

    function getCurrentNickLabel() {
        const runtimeUserId = getRuntimeUserId();
        const meByMention = document.querySelector(`[data-mentionid="${runtimeUserId}"]`);
        const fromMention = (meByMention?.textContent || '').replace(/^@/, '').trim();
        if (fromMention) return fromMention;

        const navCandidates = [
            '#elUserNav #elUserLink',
            '#elUserNav .ipsType_break',
            '#elUserNav a[href*="/profile/"] strong',
            '#elUserNav a[href*="showuser="] strong',
            '#elUserNav a[data-memberid]'
        ];
        for (const selector of navCandidates) {
            const text = (document.querySelector(selector)?.textContent || '').replace(/^@/, '').trim();
            if (text) return text;
        }

        return String(runtimeUserId).startsWith('anon_') ? 'Anon' : 'Anon';
    }

    function getRadioAuthorLabel() {
        const nick = String(getCurrentNickLabel() || '').trim();
        if (nick) return nick;
        return String(getRuntimeUserId() || '').startsWith('anon_') ? 'Anon' : 'Anon';
    }

    function normalizeNickForCompare(value) {
        return String(value || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-zA-Z0-9]/g, '')
            .trim()
            .toLowerCase();
    }

    function isCurrentRadioAdmin() {
        const currentUserId = String(getRuntimeUserId() || '').trim();
        if (currentUserId && currentUserId === String(baksyAdminUserId)) return true;

        const authUid = String(firebaseAuthUid || '').trim();
        if (authUid && authUid === String(baksyAdminUserId)) return true;

        const currentNick = normalizeNickForCompare(getCurrentNickLabel());
        const adminNick = normalizeNickForCompare(baksyAdminDisplayName);
        return !!currentNick && !!adminNick && currentNick === adminNick;
    }

    function canCurrentUserSkipRadioItem(item = radioNowPlaying) {
        if (isCurrentRadioAdmin()) return true;
        const currentUserId = String(getRuntimeUserId() || '').trim();
        const ownerUserId = String(item?.addedById || '').trim();
        if (!currentUserId || !ownerUserId) return false;
        return currentUserId === ownerUserId;
    }

    function radioSyncSkipButtonState(item = radioNowPlaying) {
        const skipBtn = document.getElementById('sebus-rp-skip');
        if (!skipBtn) return;

        if (!item || radioFallbackMode) {
            skipBtn.disabled = true;
            skipBtn.title = 'Brak utworu użytkownika do pominięcia';
            skipBtn.style.opacity = '.45';
            skipBtn.style.cursor = 'not-allowed';
            return;
        }

        const canSkip = canCurrentUserSkipRadioItem(item);
        skipBtn.disabled = !canSkip;
        skipBtn.title = canSkip ? 'Pomiń utwór' : 'Możesz pominąć tylko swój utwór (admin może każdy)';
        skipBtn.style.opacity = canSkip ? '1' : '.45';
        skipBtn.style.cursor = canSkip ? 'pointer' : 'not-allowed';
    }

    function createDefaultBaksyProfile(userId) {
        return {
            userId: String(userId),
            displayName: getCurrentNickLabel(),
            balance: baksyStarterBalance,
            totalEarned: baksyStarterBalance,
            totalSpent: 0,
            totalTransferredIn: 0,
            totalTransferredOut: 0,
            neonColor: '',
            neonUntil: 0,
            highlightedPostIds: [],
            seenActionKeys: [],
            dailyMissions: createDefaultDailyMissionsState(),
            starterBonusGranted: true,
            seededAt: 0,
            updatedAt: nowTs()
        };
    }

    function createDefaultBaksyDb() {
        return {
            version: 1,
            updatedAt: nowTs(),
            accounts: {},
            events: [],
            ledger: [],
            mmoState: getDefaultMmoStateSnapshot(),
            // Per-user misje i statystyki rankingowe — NIE trafiają do shared mmoState
            playerMissionsDaily: [],
            playerMissionsCyclic: [],
            playerMissionInventory: [],
            playerRankingStats: {}
        };
    }

    function loadBaksyDb() {
        try {
            const raw = readStorageValue('baksyDb');
            if (!raw) return createDefaultBaksyDb();

            const parsed = JSON.parse(raw);
            return normalizeBaksyDbPayload(parsed);
        } catch (e) {
            return createDefaultBaksyDb();
        }
    }

    function saveBaksyDb() {
        if (!baksyDb) return;
        try {
            baksyDb.updatedAt = nowTs();
            localStorage.setItem(getBaksyStorageKey(), JSON.stringify(baksyDb));
        } catch (e) {}
        scheduleFirebaseBaksySync();
        scheduleFirebaseSharedSync();
    }

    function saveBaksyDb() {
        if (!baksyDb) return;
        try {
            baksyDb.updatedAt = nowTs();
            localStorage.setItem(getBaksyStorageKey(), JSON.stringify(baksyDb));
        } catch (e) {}
        scheduleFirebaseBaksySync();
        scheduleFirebaseSharedSync();
    }

    /**
     * Zapisuje per-user misje i statystyki rankingowe do baksyDb (localStorage + Firebase per-user).
     * Wywołuj zamiast/obok persistMmoState() gdy zmieniają się misje lub ranking gracza.
     */
    function saveMissionsToDb() {
        const db = ensureBaksyDbLoaded();
        db.playerMissionsDaily = Array.isArray(playerMissionsDaily) ? playerMissionsDaily.slice() : [];
        db.playerMissionsCyclic = Array.isArray(playerMissionsCyclic) ? playerMissionsCyclic.slice() : [];
        db.playerMissionInventory = Array.isArray(playerMissionInventory) ? playerMissionInventory.slice() : [];
        db.playerRankingStats = playerRankingStats && typeof playerRankingStats === 'object' ? { ...playerRankingStats } : {};
        saveBaksyDb();
    }

    /**
     * Wczytuje per-user misje i statystyki rankingowe z baksyDb do zmiennych runtime.
     * Wywołuj przy hydratacji (po załadowaniu baksyDb z Firebase/localStorage).
     */
    function loadMissionsFromDb() {
        const db = ensureBaksyDbLoaded();
        if (Array.isArray(db.playerMissionsDaily) && db.playerMissionsDaily.length) {
            playerMissionsDaily = db.playerMissionsDaily.slice();
        }
        if (Array.isArray(db.playerMissionsCyclic) && db.playerMissionsCyclic.length) {
            playerMissionsCyclic = db.playerMissionsCyclic.slice();
        }
        if (Array.isArray(db.playerMissionInventory) && db.playerMissionInventory.length) {
            playerMissionInventory = db.playerMissionInventory.slice();
        }
        if (db.playerRankingStats && typeof db.playerRankingStats === 'object' && Object.keys(db.playerRankingStats).length) {
            playerRankingStats = { ...db.playerRankingStats };
        }
    }

    function ensureBaksyDbLoaded() {
        if (!baksyDb) baksyDb = loadBaksyDb();
        if (!baksyDb.accounts) baksyDb.accounts = {};
        if (!Array.isArray(baksyDb.events)) baksyDb.events = [];
        if (!Array.isArray(baksyDb.ledger)) baksyDb.ledger = [];
        return baksyDb;
    }

    function buildCloudSettingsPayload() {
        return {
            ...appSettings,
            updatedAt: nowTs(),
            userId: String(getRuntimeUserId())
        };
    }

    function buildCloudBaksyPayload() {
        const db = ensureBaksyDbLoaded();
        return {
            ...db,
            updatedAt: nowTs(),
            userId: String(getRuntimeUserId())
        };
    }

    function buildSharedPublicAccountPayload() {
        const account = getBaksyAccount();
        return {
            userId: String(getRuntimeUserId()),
            displayName: String(account.displayName || getCurrentNickLabel() || `#${getRuntimeUserId()}`),
            balance: normalizeBaksyNumber(account.balance || 0),
            totalEarned: normalizeBaksyNumber(account.totalEarned || 0),
            totalSpent: normalizeBaksyNumber(account.totalSpent || 0),
            updatedAt: nowTs()
        };
    }

    function normalizeSharedWorldCache(raw) {
        const accounts = raw?.accounts && typeof raw.accounts === 'object' ? raw.accounts : {};
        const leaderboard = Object.values(accounts)
            .filter(item => item && typeof item === 'object' && item.userId)
            .map(item => ({
                userId: String(item.userId),
                displayName: String(item.displayName || `#${item.userId}`),
                balance: normalizeBaksyNumber(item.balance || 0),
                totalEarned: normalizeBaksyNumber(item.totalEarned || 0),
                updatedAt: Number(item.updatedAt || 0)
            }))
            .sort((a, b) => b.balance - a.balance)
            .slice(0, 30);

        return {
            leaderboard,
            effects: {
                profileEmoji: raw?.effects?.profileEmoji && typeof raw.effects.profileEmoji === 'object' ? raw.effects.profileEmoji : {},
                nickHighlight: raw?.effects?.nickHighlight && typeof raw.effects.nickHighlight === 'object' ? raw.effects.nickHighlight : {}
            },
            updatedAt: Number(raw?.updatedAt || 0)
        };
    }

    async function flushFirebaseSharedSync() {
        if (!firebaseSyncEnabled) return;
        if (!firebaseHydrationCompleted) return;
        if (firebaseSharedSyncInFlight) return;

        firebaseSharedSyncInFlight = true;
        try {
            const uid = getRuntimeUserId();
            const payload = buildSharedPublicAccountPayload();
            await firebaseWritePath(`${baksySharedRootPath}/accounts/${encodeURIComponent(uid)}`, payload);
            await firebaseWritePath(`${baksySharedRootPath}/updatedAt`, nowTs());
        } catch (e) {
        } finally {
            firebaseSharedSyncInFlight = false;
        }
    }

    function scheduleFirebaseSharedSync() {
        if (!firebaseSyncEnabled) return;
        if (firebaseSharedSyncTimer) clearTimeout(firebaseSharedSyncTimer);
        firebaseSharedSyncTimer = setTimeout(() => {
            firebaseSharedSyncTimer = null;
            flushFirebaseSharedSync();
        }, baksySharedSyncDebounceMs);
    }

    async function flushFirebaseSharedMmoSync() {
        if (!firebaseSyncEnabled) return;
        if (firebaseSharedMmoSyncInFlight) return;

        firebaseSharedMmoSyncInFlight = true;
        try {
            const payload = buildMmoStatePayload();
            const remoteTimestamp = await firebaseReadPath(`${baksySharedRootPath}/mmoStateUpdatedAt`);
            const remoteTs = Number(remoteTimestamp || 0);
            const localTs = Number(payload.updatedAt || 0);
            
            if (remoteTs > localTs) {
                lastSharedMmoSyncAt = nowTs();
                return;
            }
            
            await firebaseWritePath(`${baksySharedRootPath}/mmoState`, payload);
            await firebaseWritePath(`${baksySharedRootPath}/mmoStateUpdatedAt`, localTs);
            lastSharedMmoSyncAt = nowTs();
        } catch (e) {
        } finally {
            firebaseSharedMmoSyncInFlight = false;
        }
    }

    function scheduleFirebaseSharedMmoSync(immediate = false) {
        if (!firebaseSyncEnabled) return;
        if (immediate) {
            if (firebaseSharedMmoSyncTimer) clearTimeout(firebaseSharedMmoSyncTimer);
            firebaseSharedMmoSyncTimer = null;
            flushFirebaseSharedMmoSync();
            return;
        }

        if (firebaseSharedMmoSyncTimer) clearTimeout(firebaseSharedMmoSyncTimer);
        firebaseSharedMmoSyncTimer = setTimeout(() => {
            firebaseSharedMmoSyncTimer = null;
            flushFirebaseSharedMmoSync();
        }, baksySharedMmoSyncDebounceMs);
    }

    async function pullSharedMmoStateIfNeeded(force = false) {
        if (!firebaseSyncEnabled) return;
        const now = nowTs();
        if (!force && (now - lastSharedMmoSyncAt) < baksySharedMmoPullIntervalMs) return;
        if (firebaseSharedMmoPullInFlight) return;

        firebaseSharedMmoPullInFlight = true;
        try {
            const raw = await firebaseReadPath(`${baksySharedRootPath}/mmoState`);
            if (!raw || typeof raw !== 'object') return;

            const remoteState = normalizeMmoStatePayload(raw);
            const db = ensureBaksyDbLoaded();
            const localUpdatedAt = Number(db?.mmoState?.updatedAt || 0);
            const remoteUpdatedAt = Number(remoteState?.updatedAt || 0);

            if (remoteUpdatedAt > localUpdatedAt) {
                const mergedAppliedState = applyMmoStatePayload(remoteState);
                db.mmoState = mergedAppliedState;
                mmoStateHydrated = true;
                saveBaksyDb();
                scheduleModules(['baksy'], { immediate: true });
            }

            lastSharedMmoSyncAt = nowTs();
        } catch (e) {
        } finally {
            firebaseSharedMmoPullInFlight = false;
        }
    }

    async function pullSharedWorldIfNeeded(force = false) {
        if (!firebaseSyncEnabled) return;
        const now = nowTs();
        if (!force && (now - lastSharedWorldSyncAt) < baksySharedPullIntervalMs) return;
        if (firebaseSharedPullInFlight) return;

        firebaseSharedPullInFlight = true;
        try {
            const raw = await firebaseReadPath(baksySharedRootPath);
            if (raw && typeof raw === 'object') {
                baksyWorldCache = normalizeSharedWorldCache(raw);
                lastSharedWorldSyncAt = nowTs();
            }
        } catch (e) {
        } finally {
            firebaseSharedPullInFlight = false;
        }
    }

    async function flushFirebaseSettingsSync() {
        if (!firebaseSyncEnabled) return;
        if (!firebaseHydrationCompleted) {
            firebasePendingSettingsPush = true;
            return;
        }

        const payload = buildCloudSettingsPayload();
        await firebaseWriteUserStatePart('settings', payload, getRuntimeUserId());
        firebasePendingSettingsPush = false;
    }

    async function flushFirebaseBaksySync() {
        if (!firebaseSyncEnabled) return;
        if (!firebaseHydrationCompleted) {
            firebasePendingBaksyPush = true;
            return;
        }

        const payload = buildCloudBaksyPayload();
        await firebaseWriteUserStatePart('baksyDb', payload, getRuntimeUserId());
        firebasePendingBaksyPush = false;
    }

    function scheduleFirebaseSettingsSync() {
        if (!firebaseSyncEnabled) return;
        if (firebaseSettingsSyncTimer) clearTimeout(firebaseSettingsSyncTimer);
        firebaseSettingsSyncTimer = setTimeout(() => {
            firebaseSettingsSyncTimer = null;
            flushFirebaseSettingsSync();
        }, firebaseSyncDebounceMs);
    }

    function scheduleFirebaseBaksySync() {
        if (!firebaseSyncEnabled) return;
        if (firebaseBaksySyncTimer) clearTimeout(firebaseBaksySyncTimer);
        firebaseBaksySyncTimer = setTimeout(() => {
            firebaseBaksySyncTimer = null;
            flushFirebaseBaksySync();
        }, firebaseSyncDebounceMs);
    }

    async function hydrateFromFirebase() {
        if (!firebaseSyncEnabled) return;
        if (firebaseHydrationInFlight || firebaseHydrationCompleted) return;

        firebaseHydrationInFlight = true;
        try {
            const userId = getRuntimeUserId(true);
            const cloudState = await firebaseReadUserState(userId);

            if (cloudState?.settings && typeof cloudState.settings === 'object') {
                appSettings = normalizeSettingsPayload(cloudState.settings);
                applyUiSkin();
                try {
                    localStorage.setItem(settingsStorageKey, JSON.stringify(appSettings));
                } catch (e) {}
            }

            if (cloudState?.baksyDb && typeof cloudState.baksyDb === 'object') {
                const localDb = ensureBaksyDbLoaded();
                const remoteDb = normalizeBaksyDbPayload(cloudState.baksyDb);
                if (Number(remoteDb.updatedAt || 0) >= Number(localDb.updatedAt || 0)) {
                    baksyDb = remoteDb;
                    mmoStateHydrated = false;
                    hydrateMmoStateFromDb(true);
                    try {
                        localStorage.setItem(getBaksyStorageKey(), JSON.stringify(baksyDb));
                    } catch (e) {}
                }
            }
        } catch (e) {
        } finally {
            firebaseHydrationInFlight = false;
            firebaseHydrationCompleted = true;

            if (firebasePendingSettingsPush) scheduleFirebaseSettingsSync();
            if (firebasePendingBaksyPush) scheduleFirebaseBaksySync();
            scheduleFirebaseSettingsSync();
            scheduleFirebaseBaksySync();
            scheduleFirebaseSharedSync();
            scheduleFirebaseSharedMmoSync();
            pullSharedWorldIfNeeded(true);
            pullSharedMmoStateIfNeeded(true);

            scheduleModules(['settingsPanel', 'baksy', 'nickGlow'], { immediate: true });
        }
    }

    function getBaksyAccount(userId = getRuntimeUserId()) {
        const db = ensureBaksyDbLoaded();
        const key = String(userId);
        if (!db.accounts[key]) db.accounts[key] = createDefaultBaksyProfile(key);
        const account = db.accounts[key];
        ensureBaksyStarterBonus(account);
        return account;
    }

    function ensureBaksyStarterBonus(account) {
        if (!account) return;
        if (account.starterBonusGranted) return;

        account.balance = normalizeBaksyNumber((Number(account.balance) || 0) + baksyStarterBalance);
        account.totalEarned = normalizeBaksyNumber((Number(account.totalEarned) || 0) + baksyStarterBalance);
        account.starterBonusGranted = true;
        account.updatedAt = nowTs();

        appendBaksyLedger({
            type: 'earn',
            reason: 'starter_bonus',
            amount: baksyStarterBalance,
            multiplier: 1,
            userId: String(account.userId || getRuntimeUserId())
        });
        saveBaksyDb();
    }

    function appendBaksyLedger(entry) {
        const db = ensureBaksyDbLoaded();
        db.ledger.push({
            id: `tx_${nowTs()}_${Math.random().toString(36).slice(2, 8)}`,
            at: nowTs(),
            ...entry
        });
        if (db.ledger.length > 1200) db.ledger.splice(0, db.ledger.length - 1200);
    }

    function appendBaksyEvent(event) {
        const db = ensureBaksyDbLoaded();
        db.events.push({
            id: `evt_${nowTs()}_${Math.random().toString(36).slice(2, 8)}`,
            createdAt: nowTs(),
            ...event
        });
        if (db.events.length > 800) db.events.splice(0, db.events.length - 800);
    }
