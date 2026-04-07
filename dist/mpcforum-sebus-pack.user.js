// ==UserScript==
// @name         MPCForum SebuśPL - ULTIMATE PACK (modular build)
// @namespace    http://tampermonkey.net/
// @version      50.40-modular
// @description  Modularny build userscriptu dla mpcforum.pl
// @author       Gemini + Copilot
// @match        *://*.mpcforum.pl/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

// Module: 10-config-state.js
// Source: e:\mpcforum-userscript\skrypt:13-346
// Purpose: Config, constants and runtime state


    const myID = '702704';
    const tenorAPIKey = 'LIVDSRZULELA';
    const giphyAPIKey = 'FDdEoqAuzB3qHqMkfMEOmJHsGeCIBmfT';

    // Generate unique session ID for anonymous users
    function getOrCreateSessionUserId() {
        let sessionId = sessionStorage.getItem('sebus_session_user_id');
        if (!sessionId) {
            // Generate random ID: 'anon_' + 6-digit random number
            sessionId = 'anon_' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
            sessionStorage.setItem('sebus_session_user_id', sessionId);
        }
        return sessionId;
    }

    const localSoundboard = [
        { name: "Vine Boom", url: "https://www.myinstants.com/media/sounds/vine-boom.mp3" },
        { name: "Twoja Stara", url: "https://www.myinstants.com/media/sounds/twoja-stara-2.mp3" },
        { name: "Bruh", url: "https://www.myinstants.com/media/sounds/movie_1.mp3" },
        { name: "Directed by Robert B. Weide", url: "https://www.myinstants.com/media/sounds/directed-by-robert-b_gE1sT6P.mp3" },
        { name: "FBI Open Up!", url: "https://www.myinstants.com/media/sounds/fbi-open-up-sfx.mp3" },
        { name: "O kurwa", url: "https://www.myinstants.com/media/sounds/o-kurwa_2.mp3" },
        { name: "Sad Trombone", url: "https://www.myinstants.com/media/sounds/sadtrombone.mp3" },
        { name: "Mission Failed", url: "https://www.myinstants.com/media/sounds/mission-failed-we-ll-get-em-next-time.mp3" },
        { name: "Nokia Arabic", url: "https://www.myinstants.com/media/sounds/nokia-arabic-ringtone.mp3" },
        { name: "SpongeBob - A few moments", url: "https://www.myinstants.com/media/sounds/a-few-moments-later-hd.mp3" },
        { name: "Windows XP Error", url: "https://www.myinstants.com/media/sounds/erro.mp3" },
        { name: "Oh No No No Laugh", url: "https://www.myinstants.com/media/sounds/oh-no-no-no-tik-tok-laugh.mp3" },
        { name: "Ba Dum Tss", url: "https://www.myinstants.com/media/sounds/badumtss.mp3" },
        { name: "Crickets (Świerszcze)", url: "https://www.myinstants.com/media/sounds/crickets.mp3" },
        { name: "Ta daaa", url: "https://www.myinstants.com/media/sounds/tada.mp3" },
        { name: "Oof (Roblox)", url: "https://www.myinstants.com/media/sounds/roblox-death-sound_1.mp3" },
        { name: "Nani!?", url: "https://www.myinstants.com/media/sounds/nani_1.mp3" },
        { name: "Dziwny Pan ze Stocku", url: "https://www.myinstants.com/media/sounds/dziwny-pan-ze-stocku.mp3" },
        { name: "Yeeey", url: "https://www.myinstants.com/media/sounds/yeeey.mp3" },
        { name: "Gejowski", url: "https://www.myinstants.com/media/sounds/gejowski.mp3" }
    ];

    const radioStations = [
        { name: 'Radio ESKA', url: 'https://waw.ic.smcdn.pl/6130-1.mp3' },
        { name: 'Radio ZET', url: 'http://zet-net-01.cdn.eurozet.pl:8400/' },
        { name: 'Chillizet', url: 'https://ch.cdn.eurozet.pl/chi-net.mp3' }
    ];
    // ── Radio Queue — stałe numeryczne i regex (RADIO_QUEUE_PATH po baksySharedRootPath) ──
    const RADIO_SYNC_MS    = 1500;   // co ile ms odpytujemy Firebase
    const RADIO_MAX_QUEUE  = 20;     // max piosenek w kolejce
    const RADIO_YT_REGEX   = /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11,12})/;
    const RADIO_YT_PLAYLIST_REGEX = /(?:youtube\.com\/(?:playlist\?|watch\?(?:.*&)?list=)|youtu\.be\/.*[?&]list=)([A-Za-z0-9_-]+)/i;
    const RADIO_MP3_REGEX  = /^https?:\/\/.+\.mp3(\?.*)?$/i;

    const storageVersion = 'v73';
    const storageMigrationMarkerKey = 'sebus_storage_migrated_version';
    const storageKeys = Object.freeze({
        settings: `sebus_settings_${storageVersion}`,
        pinnedMessages: `sebus_pinned_messages_${storageVersion}`,
        hiddenMessages: `sebus_hidden_messages_${storageVersion}`,
        profileActivityCache: `sebus_profile_activity_cache_${storageVersion}`,
        baksyDb: `sebus_baksy_db_${storageVersion}`
    });
    const legacyStorageKeys = Object.freeze({
        settings: ['sebus_settings_v72', 'sebus_settings_v71'],
        pinnedMessages: ['sebus_pinned_messages_v72', 'sebus_pinned_messages_v71'],
        hiddenMessages: ['sebus_hidden_messages_v72', 'sebus_hidden_messages_v71'],
        profileActivityCache: ['sebus_profile_activity_cache_v72', 'sebus_profile_activity_cache_v71'],
        baksyDb: ['sebus_baksy_db_v72', 'sebus_baksy_db_v71']
    });
    const settingsStorageKey = storageKeys.settings;
    const pinnedMessagesStorageKey = storageKeys.pinnedMessages;
    const hiddenMessagesStorageKey = storageKeys.hiddenMessages;
    const profileActivityCacheStorageKey = storageKeys.profileActivityCache;
    const baksyStarterBalance = 1000;
    const firebaseRtdbBaseUrl = 'https://mpcc-d36c6-default-rtdb.europe-west1.firebasedatabase.app';
    const firebaseSyncEnabled = true;
    const firebaseSyncDebounceMs = 1400;
    const firebaseSyncTimeoutMs = 8000;
    const runtimeUserIdRefreshMs = 12000;
    const baksySharedRootPath = 'sharedBaksyWorld';
    const RADIO_QUEUE_PATH = `${baksySharedRootPath}/radioQueue`; // ── Radio Queue path ──
    // ── Nowe moduły multiplayer — Firebase paths ─────────────────
    const WATCH_PATH             = `${baksySharedRootPath}/watchTogether`;
    const GAMES_PATH             = `${baksySharedRootPath}/miniGames`;
    const GIFPARTY_PATH          = `${baksySharedRootPath}/gifParty`;
    const WHITEBOARD_PATH        = `${baksySharedRootPath}/whiteboard`;
    const WATCH_SYNC_MS          = 2000;
    const GIFPARTY_MAX           = 30;
    const WHITEBOARD_MAX_STROKES = 400;
    // ─────────────────────────────────────────────────────────────
    const baksySharedSyncDebounceMs = 1800;
    const baksySharedPullIntervalMs = 14000;
    const baksySharedMmoSyncDebounceMs = 800;
    const baksySharedMmoPullIntervalMs = 3500;
    const baksyAdminUserId = '702704';
    const baksyAdminDisplayName = 'SebuśPL';
    const defaultSettings = {
        features: {
            chatTools: true,
            editorStats: true,
            nickGlow: true,
            goldSebus: true,
            radio: true,
            stickyNotes: true,
            realTimeActivity: true,
            ghostCurtain: false,
            baksy: true,
            gamesMenu: true,
            hazard: true,
            missions: true,
            ranking: true,
            eventDebug: false,
            mmoChat: true,
            watchTogether: true,
            miniGames: true,
            gifParty: true,
            whiteboard: true
        },
        radio: {
            stationIndex: 0,
            volumeLevelIndex: 2
        },
        activity: {
            activeMinutesThreshold: 5,
            ghostHoursThreshold: 4,
            useProfileLookup: true,
            showOnlyActive: false
        },
        ghostCurtain: {
            level: 0
        },
        baksy: {
            postReward: 5,
            chatReward: 1,
            nightMultiplier: 1.5,
            transfersEnabled: true
        },
        watch: {
            defaultVideoId: ''
        },
        ui: {
            skin: 'mmo2026'
        }
    };

    let radioAudio = null;
    let radioSyncTimer = null;        // setInterval dla pollingu kolejki
    let radioRealtimeAbortController = null;
    let radioRealtimeReconnectTimer = null;
    let radioRealtimeConnected = false;
    let radioRealtimeHooksBound = false;
    let radioLastRealtimeEventAt = 0;
    let radioNowPlaying = null;       // { url, title, addedBy, startedAt, type } lub null
    let radioQueueItems = [];         // lokalna kopia kolejki z Firebase
    let radioFallbackMode = false;    // true = gra stacja radiowa (fallback)
    let radioFallbackIndex = 0;       // indeks aktywnej stacji fallback
    let radioLastQueueVersion = 0;    // ostatnio widziany timestamp version z Firebase
    let radioYtReady = false;         // czy iframe YT został załadowany
    let radioLastDebugMessage = '';
    let radioLastYtEventSource = '';
    let radioDebugEvents = [];
    let radioDebugLastSyncAt = 0;
    let radioYtUnmuteSwitchedFor = '';
    let radioYtPlayerState = null;
    let radioYtCurrentTime = 0;
    let radioYtLoadedVideoId = '';
    let radioYtLastHeartbeatAt = 0;
    let radioYtWatchdogTimer = null;
    let radioYtAutoResumeAt = 0;
    let radioMediaUnlocked = false;
    let radioGlobalUnlockBound = false;
    let radioLastYtVolumeDebugSignature = '';
    let radioServerTimeOffsetMs = 0;
    let radioServerTimeOffsetSyncedAt = 0;
    let radioNeedsHardResync = true;
    let radioLastDurationSyncFor = '';
    let radioLastDurationSyncAt = 0;
    let radioLastEndedAdvanceAt = 0;

    // ── Watch Together state ──────────────────────────────────────
    let watchState       = null;   // { videoId, hostId, hostNick, playing, positionSec, updatedAt }
    let watchSyncTimer   = null;
    let watchSSEAbort    = null;
    let watchLastEventAt = 0;

    // ── Mini Games state ──────────────────────────────────────────
    let gamesState     = null;   // { type, board, turn, players:{}, winner, updatedAt }
    let gamesSyncTimer = null;
    let activeGamesTableId = '';
    let gamesPreferLobbyView = false;

    // ── GIF Party state ───────────────────────────────────────────
    let gifPartyFeed      = [];   // [{ id, url, nick, userId, votes:{uid:±1}, addedAt }]
    let gifPartySyncTimer = null;
    let gifPartySSEAbort  = null;

    // ── Whiteboard state ──────────────────────────────────────────
    let wbStrokes    = [];   // [{ id, points:[[x,y]], color, width, nick }]
    let wbSSEAbort   = null;
    let wbIsDrawing  = false;
    let wbCurStroke  = null;

    let contextMenuInitialized = false;
    let lastLifeScanAt = 0;
    let lastGhostCurtainRunAt = 0;
    let profileActivityCache = {};
    let domObserver = null;
    const pendingProfileActivityFetches = new Set();
    const moduleTimers = new Map();
    let baksyDb = null;
    let lastBaksySyncAt = 0;
    let baksyRainHost = null;
    let baksyBlackjackState = null;
    let baksySlotSpinning = false;
    let runtimeUserIdCache = String(myID || '').trim();
    let runtimeUserIdLastResolvedAt = 0;
    let firebaseHydrationCompleted = false;
    let firebaseHydrationInFlight = false;
    let firebaseSettingsSyncTimer = null;
    let firebaseBaksySyncTimer = null;
    let firebasePendingSettingsPush = false;
    let firebasePendingBaksyPush = false;
    let firebaseSharedSyncTimer = null;
    let firebaseSharedSyncInFlight = false;
    let firebaseSharedPullInFlight = false;
    let firebaseSharedMmoSyncTimer = null;
    let firebaseSharedMmoSyncInFlight = false;
    let firebaseSharedMmoPullInFlight = false;
    let lastSharedWorldSyncAt = 0;
    let lastSharedMmoSyncAt = 0;
    let firebaseAuthToken = null;
    let firebaseAuthUid = null;
    let firebaseAuthUserEmail = null;
    let firebaseAuthCheckInFlight = false;
    let firebaseAuthCheckedAt = 0;
    let baksyWorldCache = {
        leaderboard: [],
        effects: {
            profileEmoji: {},
            nickHighlight: {}
        },
        updatedAt: 0
    };
    let baksyAdminAccessAllowed = false;
    let baksyAdminAccessCheckedAt = 0;
    let baksyAdminAccessCheckInFlight = false;
    let baksyAdminUiCache = null;

    // World Boss state
    let worldBossState = {
        active: false,
        name: 'Duch MPC',
        maxHp: 1000000,
        currentHp: 1000000,
        totalDamage: 0,
        lastReset: 0,
        dailyContributors: {},  // { userId: totalDamage }
        lastDayRanking: [],     // snapshot [{userId, displayName, damage}] from last reset
        lastResetReason: '',    // 'noon' | 'midnight' | 'defeated'
        spawnedAt: 0
    };

    // Global Jackpot state
    let globalJackpotState = {
        poolBalance: 0,
        lastWinner: null,
        lastWinAmount: 0,
        lastLotteryAt: 0,
        contributions: []
    };

    // Guild Wars state - Advanced System
    let guildWarsState = {
        guilds: {},
        controlledSections: {},
        lastUpdate: 0,
        forumSections: ['Metin2', 'Lineage', 'Lost Ark', 'RPG', 'Gry', 'Offtopic']
    };

    let guildChatState = {};
    let communityGoalSyncTimer = null;
    let communityGoalCache = {
        dayKey: '',
        totalMessages: 0,
        updatedAt: 0
    };
    let lastKingIncomeTickAt = 0;
    let globalMMOEventState = {
        active: false,
        type: null, // 'boss_raid', 'dragon_event', etc.
        message: '',
        startsAt: 0,
        endsAt: 0
    };

    // Treasure Hunt state
    let treasureHuntState = {
        active: false,
        targetPostId: null,
        clue: '',
        winner: null,
        wonAt: 0,
        spawnedAt: 0
    };

    // Auction state
    let auctionState = {
        currentLot: null,
        bids: [],
        endsAt: 0,
        startedAt: 0
    };
    let playerMissionsDaily = [];
    let playerMissionsCyclic = [];
    let playerMissionInventory = [];
    let playerRankingStats = {};
    let mmoEventHandlersInitialized = false;
    let mmoEventListeners = {};
    let mmoEventDebugHistory = [];
    let mmoStateHydrated = false;
    let mmoStateSaveTimer = null;

    // ── MMO Chat ────────────────────────────────────────────────────
    const mmoChatRootPath = `${baksySharedRootPath}/mmoChat`;
    const mmoChatMaxMessages = 120;
    const mmoChatPresenceIntervalMs = 18000;
    const mmoChatPollIntervalMs = 4000;
    let mmoChatProfile = null;          // { nick, avatar, userId, setAt }
    let mmoChatMessages = [];           // local cache
    let mmoChatOnlineMap = {};          // userId → { nick, avatar, seenAt }
    let mmoChatPollTimer = null;
    let mmoChatPresenceTimer = null;
    let mmoChatLastFetchAt = 0;
    let mmoChatPanelInitialized = false;
    // ────────────────────────────────────────────────────────────────

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

// Module: 70-watch-games-panels.js
// Source: e:\mpcforum-userscript\skrypt:6897-8024
// Purpose: Watch Together, Mini Games, GIF Party and Whiteboard panels

    /* ═══════════════════════════════════════════════════════════════════
       WATCH TOGETHER — init + render + runner
       ═══════════════════════════════════════════════════════════════════ */
    function initWatchIfNeeded() {
        if (!appSettings.features.watchTogether) return;
        if (document.getElementById('sebus-watch-toggle')) return;

        const toggle = document.createElement('button');
        toggle.id = 'sebus-watch-toggle';
        toggle.className = 'sebus-mp-toggle';
        toggle.textContent = '🎬 Watch';
        toggle.style.cssText = 'bottom:78px;right:14px;';
        document.body.appendChild(toggle);

        const panel = document.createElement('div');
        panel.id = 'sebus-watch-panel';
        panel.className = 'sebus-mp-panel';
        panel.style.cssText = 'bottom:114px;right:14px;';
        panel.innerHTML = `
          <div class="sebus-mp-header">
            <span class="sebus-mp-title">🎬 Watch Together</span>
            <span class="sebus-mp-badge" id="sebus-watch-badge">0 widzów</span>
            <button class="sebus-mp-close" id="sebus-watch-close">✕</button>
          </div>
          <div class="sebus-mp-body">
            <div class="sebus-mp-row">
              <input type="text" id="sebus-watch-input" placeholder="YouTube URL lub ID…">
              <button class="sebus-mp-btn" id="sebus-watch-load">▶ Załaduj</button>
            </div>
            <iframe id="sebus-watch-frame" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>
            <div class="sebus-watch-controls">
              <button class="sebus-mp-btn" id="sebus-watch-play">▶</button>
              <button class="sebus-mp-btn" id="sebus-watch-pause">⏸</button>
            </div>
            <div class="sebus-watch-viewers" id="sebus-watch-viewers"></div>
            <div class="sebus-mp-status" id="sebus-watch-status"></div>
          </div>`;
        document.body.appendChild(panel);

        toggle.addEventListener('click', () => {
            const open = panel.classList.toggle('show');
            toggle.classList.toggle('active', open);
            if (open) { watchJoinAsViewer(); syncWatchState(); }
        });
        panel.querySelector('#sebus-watch-close').addEventListener('click', () => {
            panel.classList.remove('show'); toggle.classList.remove('active');
        });
        panel.querySelector('#sebus-watch-load').addEventListener('click', () => {
            const raw = panel.querySelector('#sebus-watch-input').value.trim();
            if (!raw) return;
            const id = extractYoutubeId(raw);
            if (!id) { watchSetStatus('❌ Nie rozpoznano linku YouTube'); return; }
            watchSetStatus('⏳ Ładowanie…');
            watchSetVideo(id);
        });
        panel.querySelector('#sebus-watch-play').addEventListener('click', () => watchSendCommand('play'));
        panel.querySelector('#sebus-watch-pause').addEventListener('click', () => watchSendCommand('pause'));
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
        if (!appSettings.features.gifParty) return;
        if (document.getElementById('sebus-gifparty-toggle')) return;

        const toggle = document.createElement('button');
        toggle.id = 'sebus-gifparty-toggle';
        toggle.className = 'sebus-mp-toggle';
        toggle.textContent = '🎉 GIF Party';
        toggle.style.cssText = 'bottom:150px;right:14px;';
        document.body.appendChild(toggle);

        const panel = document.createElement('div');
        panel.id = 'sebus-gifparty-panel';
        panel.className = 'sebus-mp-panel';
        panel.style.cssText = 'bottom:186px;right:14px;';
        panel.innerHTML = `
          <div class="sebus-mp-header">
            <span class="sebus-mp-title">🎉 GIF Party</span>
            <span class="sebus-mp-badge" id="sebus-gp-badge">0 GIFów</span>
            <button class="sebus-mp-close" id="sebus-gp-close">✕</button>
          </div>
          <div class="sebus-mp-body">
            <div class="sebus-mp-row">
              <input type="text" id="sebus-gp-input" placeholder="Szukaj GIFa (Tenor)…">
              <button class="sebus-mp-btn" id="sebus-gp-search">🔍</button>
            </div>
            <div id="sebus-gp-results" style="display:flex;gap:4px;flex-wrap:wrap;max-height:80px;overflow-y:auto;margin:4px 0;"></div>
            <div class="sebus-gp-feed" id="sebus-gp-feed"></div>
            <div class="sebus-mp-status" id="sebus-gp-status"></div>
          </div>`;
        document.body.appendChild(panel);

        toggle.addEventListener('click', () => {
            const open = panel.classList.toggle('show');
            toggle.classList.toggle('active', open);
            if (open) syncGifParty();
        });
        panel.querySelector('#sebus-gp-close').addEventListener('click', () => {
            panel.classList.remove('show'); toggle.classList.remove('active');
        });
        panel.querySelector('#sebus-gp-search').addEventListener('click', async () => {
            const q = panel.querySelector('#sebus-gp-input').value.trim();
            if (!q) return;
            const res = panel.querySelector('#sebus-gp-results');
            res.innerHTML = '⏳';
            try {
                const key = 'AIzaSyBVGBpE5lE3MnMG_CXWfC7Ck9wz5hBvHAA'; // Tenor public key
                const r   = await fetch(`https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(q)}&key=${key}&limit=8&media_filter=gif`);
                const d   = await r.json();
                res.innerHTML = '';
                (d.results||[]).forEach(g => {
                    const url = g.media_formats?.gif?.url || g.url;
                    if (!url) return;
                    const img = document.createElement('img');
                    img.src = url; img.style.cssText = 'height:60px;border-radius:4px;cursor:pointer;object-fit:cover;';
                    img.addEventListener('click', async () => {
                        const ok = await addGifToParty(url, g.content_description || q);
                        if (ok) { res.innerHTML = ''; gpSetStatus('✅ GIF dodany!', 2000); }
                        else gpSetStatus('❌ Błąd dodawania GIFa', 3000);
                    });
                    res.appendChild(img);
                });
                if (!d.results?.length) res.innerHTML = '<span style="color:rgba(255,232,183,.4);font-size:9px">Brak wyników</span>';
            } catch(e) { res.innerHTML = ''; gpSetStatus(`❌ ${e.message}`, 3000); }
        });
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
        if (!appSettings.features.whiteboard) return;
        if (document.getElementById('sebus-whiteboard-toggle')) return;

        const toggle = document.createElement('button');
        toggle.id = 'sebus-whiteboard-toggle';
        toggle.className = 'sebus-mp-toggle';
        toggle.textContent = '🖌️ Tablica';
        toggle.style.cssText = 'bottom:186px;right:14px;';
        document.body.appendChild(toggle);

        const COLORS = ['#ffd700','#ffffff','#ff5555','#55ff88','#5599ff','#ff88dd','#000000'];
        const panel  = document.createElement('div');
        panel.id     = 'sebus-whiteboard-panel';
        panel.className = 'sebus-mp-panel';
        panel.style.cssText = 'bottom:222px;right:14px;';
        panel.innerHTML = `
          <div class="sebus-mp-header">
            <span class="sebus-mp-title">🖌️ Wspólna Tablica</span>
            <span class="sebus-mp-badge" id="sebus-wb-badge">0 kresek</span>
            <button class="sebus-mp-close" id="sebus-wb-close">✕</button>
          </div>
          <div class="sebus-mp-body">
            <canvas id="sebus-wb-canvas" width="400" height="260"></canvas>
            <div class="sebus-wb-toolbar">
              ${COLORS.map((c,i)=>`<div class="sebus-wb-color${i===0?' sel':''}" style="background:${c}" data-c="${c}"></div>`).join('')}
              <input type="range" class="sebus-wb-size" id="sebus-wb-size" min="1" max="20" value="3">
              <button class="sebus-mp-btn" id="sebus-wb-clear" style="margin-left:auto">🗑️ Wyczyść</button>
            </div>
            <div class="sebus-mp-status" id="sebus-wb-status"></div>
          </div>`;
        document.body.appendChild(panel);

        let wbColor = '#ffd700';
        let wbSize  = 3;

        toggle.addEventListener('click', () => {
            const open = panel.classList.toggle('show');
            toggle.classList.toggle('active', open);
            if (open) syncWhiteboard();
        });
        panel.querySelector('#sebus-wb-close').addEventListener('click', () => {
            panel.classList.remove('show'); toggle.classList.remove('active');
        });
        panel.querySelectorAll('.sebus-wb-color').forEach(dot => {
            dot.addEventListener('click', () => {
                wbColor = dot.dataset.c;
                panel.querySelectorAll('.sebus-wb-color').forEach(d => d.classList.remove('sel'));
                dot.classList.add('sel');
            });
        });
        panel.querySelector('#sebus-wb-size').addEventListener('input', e => { wbSize = +e.target.value; });
        panel.querySelector('#sebus-wb-clear').addEventListener('click', () => clearWhiteboard());

        const canvas = panel.querySelector('#sebus-wb-canvas');
        const getPos = e => {
            const r = canvas.getBoundingClientRect();
            const cl = e.touches ? e.touches[0] : e;
            return [(cl.clientX - r.left) * (400 / r.width), (cl.clientY - r.top) * (260 / r.height)];
        };
        const onStart = e => {
            e.preventDefault();
            wbIsDrawing   = true;
            wbCurStroke   = { points: [getPos(e)], color: wbColor, width: wbSize };
        };
        const onMove = e => {
            e.preventDefault();
            if (!wbIsDrawing || !wbCurStroke) return;
            wbCurStroke.points.push(getPos(e));
            // Live preview
            const ctx = canvas.getContext('2d');
            const pts = wbCurStroke.points;
            ctx.strokeStyle = wbCurStroke.color;
            ctx.lineWidth   = wbCurStroke.width;
            ctx.lineCap     = 'round'; ctx.lineJoin = 'round';
            if (pts.length >= 2) { ctx.beginPath(); ctx.moveTo(pts[pts.length-2][0], pts[pts.length-2][1]); ctx.lineTo(pts[pts.length-1][0], pts[pts.length-1][1]); ctx.stroke(); }
        };
        const onEnd = e => {
            e.preventDefault();
            if (!wbIsDrawing || !wbCurStroke || wbCurStroke.points.length < 2) { wbIsDrawing = false; return; }
            wbIsDrawing = false;
            const s = wbCurStroke;
            wbCurStroke = null;
            pushWbStroke(s);
        };
        canvas.addEventListener('mousedown', onStart); canvas.addEventListener('mousemove', onMove); canvas.addEventListener('mouseup', onEnd);
        canvas.addEventListener('touchstart', onStart, {passive:false}); canvas.addEventListener('touchmove', onMove, {passive:false}); canvas.addEventListener('touchend', onEnd, {passive:false});
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

// Module: 75-snejk.js
// Purpose: Standalone retro snake mini-game opened from Mini Gry panel

	const SNEJK_CELL_SIZE = 24;
	const SNEJK_COLS = 28;
	const SNEJK_ROWS = 20;
	const SNEJK_START_LENGTH = 4;
	const SNEJK_BASE_TICK_MS = 120;
	const SNEJK_MIN_TICK_MS = 58;
	const SNEJK_SPEEDUP_PER_APPLE = 3;

	let snejkPanelInitialized = false;
	let snejkPanelOpen = false;
	let snejkAnimationFrame = 0;
	let snejkLastFrameAt = 0;
	let snejkTickCarry = 0;
	let snejkState = null;

	function ensureSnejkFontLinks() {
		if (!document.getElementById('sebus-snejk-font-preconnect')) {
			const link = document.createElement('link');
			link.id = 'sebus-snejk-font-preconnect';
			link.rel = 'preconnect';
			link.href = 'https://fonts.googleapis.com';
			document.head.appendChild(link);
		}
		if (!document.getElementById('sebus-snejk-font-preconnect-cross')) {
			const link = document.createElement('link');
			link.id = 'sebus-snejk-font-preconnect-cross';
			link.rel = 'preconnect';
			link.href = 'https://fonts.gstatic.com';
			link.crossOrigin = 'anonymous';
			document.head.appendChild(link);
		}
		if (!document.getElementById('sebus-snejk-font-style')) {
			const link = document.createElement('link');
			link.id = 'sebus-snejk-font-style';
			link.rel = 'stylesheet';
			link.href = 'https://fonts.googleapis.com/css2?family=VT323&display=swap';
			document.head.appendChild(link);
		}
	}

	function ensureSnejkStyles() {
		if (document.getElementById('sebus-snejk-styles')) return;
		const style = document.createElement('style');
		style.id = 'sebus-snejk-styles';
		style.textContent = '' +
			'#sebus-snejk-overlay{position:fixed;inset:0;display:none;align-items:center;justify-content:center;padding:18px;background:rgba(3,7,4,.72);backdrop-filter:blur(6px);z-index:2147483647;}' +
			'#sebus-snejk-overlay.show{display:flex;}' +
			'#sebus-snejk-window{position:relative;width:min(900px,calc(100vw - 24px));max-height:calc(100vh - 24px);overflow:auto;background:linear-gradient(180deg,#0c160c 0%,#081008 100%);border:3px solid #1d4a28;border-radius:8px;padding:18px 18px 14px;box-shadow:0 0 0 1px #0a1f0e,0 0 30px rgba(40,180,80,.16),0 0 80px rgba(20,80,30,.16),inset 0 1px 0 rgba(120,220,140,.06);font-family:"VT323",ui-monospace,monospace;color:#7af098;}' +
			'#sebus-snejk-close{position:absolute;top:10px;right:10px;width:34px;height:34px;border-radius:8px;border:1px solid rgba(255,120,120,.4);background:linear-gradient(180deg,#341010,#1d0a0a);color:#ffc6c6;font-size:18px;cursor:pointer;}' +
			'#sebus-snejk-close:hover{filter:brightness(1.08);}' +
			'#sebus-snejk-title{margin:0 44px 8px 0;text-align:center;font-size:52px;font-weight:400;letter-spacing:.08em;color:#9fffb0;text-shadow:0 0 12px rgba(80,255,120,.45),2px 2px 0 #0a3014;}' +
			'#sebus-snejk-subtitle{text-align:center;font-size:18px;color:#5fbf74;margin:0 0 10px 0;}' +
			'#sebus-snejk-stats{display:flex;justify-content:center;gap:22px;flex-wrap:wrap;margin:0 0 14px 0;font-size:28px;color:#4a9c5c;}' +
			'#sebus-snejk-stats strong{color:#d4ff5c;font-weight:400;text-shadow:0 0 8px rgba(200,255,80,.35);}' +
			'#sebus-snejk-stage-wrap{position:relative;border-radius:4px;overflow:hidden;border:3px solid #1a4a24;box-shadow:inset 0 0 60px rgba(0,40,10,.5),0 0 22px rgba(20,80,30,.25);}' +
			'#sebus-snejk-stage-wrap::after{content:"";position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(0deg,transparent,transparent 1px,rgba(0,0,0,.08) 1px,rgba(0,0,0,.08) 2px),repeating-linear-gradient(90deg,transparent,transparent 23px,rgba(60,120,70,.045) 23px,rgba(60,120,70,.045) 24px);mix-blend-mode:multiply;opacity:.7;}' +
			'#sebus-snejk-canvas{display:block;background:radial-gradient(ellipse 100% 70% at 50% 0%,#0f2414 0%,#030806 55%,#020403 100%);image-rendering:pixelated;outline:none;}' +
			'#sebus-snejk-overlay .sebus-snejk-hud{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-top:12px;}' +
			'#sebus-snejk-hint{font-size:22px;color:#5a8a66;}' +
			'#sebus-snejk-actions{display:flex;gap:8px;flex-wrap:wrap;}' +
			'.sebus-snejk-btn{height:36px;padding:0 14px;border-radius:8px;border:1px solid rgba(122,240,152,.32);background:linear-gradient(180deg,#16341b,#0d1b10);color:#9fffb0;font:400 24px/1 "VT323",ui-monospace,monospace;cursor:pointer;box-shadow:inset 0 1px 0 rgba(180,255,200,.08);}' +
			'.sebus-snejk-btn:hover{filter:brightness(1.08);transform:translateY(-1px);}' +
			'#sebus-snejk-gameover{position:absolute;inset:0;display:none;flex-direction:column;align-items:center;justify-content:center;background:rgba(2,6,4,.78);text-align:center;gap:8px;}' +
			'#sebus-snejk-gameover.show{display:flex;}' +
			'#sebus-snejk-gameover-title{margin:0;font-size:54px;color:#ff6b5c;text-shadow:0 0 20px rgba(255,80,60,.6),3px 3px 0 #4a1510;}' +
			'#sebus-snejk-gameover-text{font-size:24px;color:#9ac9a6;}' +
			'@media (max-width:980px){#sebus-snejk-window{padding:16px 12px 12px;}#sebus-snejk-title{font-size:42px;}#sebus-snejk-canvas{width:100%;height:auto;}}';
		document.head.appendChild(style);
	}

	function createSnejkInitialState() {
		const startY = Math.floor(SNEJK_ROWS / 2);
		const startX = 6;
		const snake = [];
		for (let idx = 0; idx < SNEJK_START_LENGTH; idx += 1) {
			snake.push({ x: startX - idx, y: startY });
		}
		return {
			snake,
			direction: { x: 1, y: 0 },
			nextDirection: { x: 1, y: 0 },
			apple: createSnejkApple(snake),
			score: 0,
			best: Number(readStorageValue('sebus_snejk_best') || 0) || 0,
			dead: false,
			flashUntil: 0
		};
	}

	function createSnejkApple(snake) {
		const occupied = new Set((snake || []).map(segment => `${segment.x}:${segment.y}`));
		const free = [];
		for (let y = 0; y < SNEJK_ROWS; y += 1) {
			for (let x = 0; x < SNEJK_COLS; x += 1) {
				const key = `${x}:${y}`;
				if (!occupied.has(key)) free.push({ x, y });
			}
		}
		if (!free.length) return { x: Math.floor(SNEJK_COLS / 2), y: Math.floor(SNEJK_ROWS / 2) };
		return free[Math.floor(Math.random() * free.length)];
	}

	function getSnejkTickMs() {
		return Math.max(SNEJK_MIN_TICK_MS, SNEJK_BASE_TICK_MS - (Number(snejkState?.score || 0) * SNEJK_SPEEDUP_PER_APPLE));
	}

	function isSnejkOpposite(a, b) {
		return a && b && a.x === -b.x && a.y === -b.y;
	}

	function updateSnejkHud() {
		const scoreEl = document.getElementById('sebus-snejk-score');
		const lenEl = document.getElementById('sebus-snejk-length');
		const bestEl = document.getElementById('sebus-snejk-best');
		const overText = document.getElementById('sebus-snejk-gameover-text');
		if (scoreEl) scoreEl.textContent = String(Number(snejkState?.score || 0));
		if (lenEl) lenEl.textContent = String(Array.isArray(snejkState?.snake) ? snejkState.snake.length : SNEJK_START_LENGTH);
		if (bestEl) bestEl.textContent = String(Number(snejkState?.best || 0));
		if (overText) overText.textContent = `Wynik: ${Number(snejkState?.score || 0)} • Enter/Spacja = restart`;
	}

	function renderSnejk() {
		const canvas = document.getElementById('sebus-snejk-canvas');
		if (!(canvas instanceof HTMLCanvasElement) || !snejkState) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const now = performance.now();
		const flash = now < Number(snejkState.flashUntil || 0);
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		const gradient = ctx.createRadialGradient(canvas.width / 2, 32, 40, canvas.width / 2, canvas.height / 2, canvas.width * 0.7);
		gradient.addColorStop(0, flash ? '#17391c' : '#0f2414');
		gradient.addColorStop(0.6, '#071108');
		gradient.addColorStop(1, '#020403');
		ctx.fillStyle = gradient;
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		for (let y = 0; y < SNEJK_ROWS; y += 1) {
			for (let x = 0; x < SNEJK_COLS; x += 1) {
				ctx.fillStyle = ((x + y) % 2 === 0) ? 'rgba(26,74,36,.16)' : 'rgba(10,40,18,.16)';
				ctx.fillRect(x * SNEJK_CELL_SIZE, y * SNEJK_CELL_SIZE, SNEJK_CELL_SIZE - 1, SNEJK_CELL_SIZE - 1);
			}
		}

		const appleX = snejkState.apple.x * SNEJK_CELL_SIZE;
		const appleY = snejkState.apple.y * SNEJK_CELL_SIZE;
		ctx.fillStyle = '#ff4a4a';
		ctx.shadowColor = 'rgba(255, 90, 90, .8)';
		ctx.shadowBlur = 16;
		ctx.beginPath();
		ctx.arc(appleX + SNEJK_CELL_SIZE / 2, appleY + SNEJK_CELL_SIZE / 2, SNEJK_CELL_SIZE * 0.32, 0, Math.PI * 2);
		ctx.fill();
		ctx.shadowBlur = 0;
		ctx.fillStyle = '#7aff9e';
		ctx.fillRect(appleX + 12, appleY + 4, 3, 7);

		snejkState.snake.forEach((segment, index) => {
			const x = segment.x * SNEJK_CELL_SIZE;
			const y = segment.y * SNEJK_CELL_SIZE;
			const isHead = index === 0;
			ctx.fillStyle = isHead ? '#9bbc0f' : (index % 2 === 0 ? '#306230' : '#3f7d2a');
			ctx.strokeStyle = '#0f380f';
			ctx.lineWidth = 2;
			ctx.fillRect(x + 1, y + 1, SNEJK_CELL_SIZE - 2, SNEJK_CELL_SIZE - 2);
			ctx.strokeRect(x + 1, y + 1, SNEJK_CELL_SIZE - 2, SNEJK_CELL_SIZE - 2);
			if (isHead) {
				ctx.fillStyle = '#0f380f';
				ctx.fillRect(x + 7, y + 9, 4, 4);
				ctx.fillRect(x + 15, y + 9, 4, 4);
			}
		});

		const overlay = document.getElementById('sebus-snejk-gameover');
		if (overlay) overlay.classList.toggle('show', !!snejkState.dead);
		updateSnejkHud();
	}

	function finishSnejkGame() {
		if (!snejkState || snejkState.dead) return;
		snejkState.dead = true;
		snejkState.best = Math.max(Number(snejkState.best || 0), Number(snejkState.score || 0));
		saveStorageValue('sebus_snejk_best', String(snejkState.best));
		renderSnejk();
	}

	function stepSnejkGame() {
		if (!snejkState || snejkState.dead) return;
		if (!isSnejkOpposite(snejkState.nextDirection, snejkState.direction)) {
			snejkState.direction = { ...snejkState.nextDirection };
		}

		const head = snejkState.snake[0];
		const nextHead = {
			x: head.x + snejkState.direction.x,
			y: head.y + snejkState.direction.y
		};

		if (nextHead.x < 0 || nextHead.x >= SNEJK_COLS || nextHead.y < 0 || nextHead.y >= SNEJK_ROWS) {
			finishSnejkGame();
			return;
		}

		const hitSelf = snejkState.snake.some((segment, index) => {
			if (index === snejkState.snake.length - 1) return false;
			return segment.x === nextHead.x && segment.y === nextHead.y;
		});
		if (hitSelf) {
			finishSnejkGame();
			return;
		}

		snejkState.snake.unshift(nextHead);
		const ateApple = nextHead.x === snejkState.apple.x && nextHead.y === snejkState.apple.y;
		if (ateApple) {
			snejkState.score += 1;
			snejkState.best = Math.max(Number(snejkState.best || 0), Number(snejkState.score || 0));
			snejkState.apple = createSnejkApple(snejkState.snake);
			snejkState.flashUntil = performance.now() + 180;
		} else {
			snejkState.snake.pop();
		}
		updateSnejkHud();
	}

	function snejkLoop(now) {
		if (!snejkPanelOpen) return;
		if (!snejkLastFrameAt) snejkLastFrameAt = now;
		const delta = Math.min(50, now - snejkLastFrameAt);
		snejkLastFrameAt = now;
		snejkTickCarry += delta;

		const tickMs = getSnejkTickMs();
		while (snejkTickCarry >= tickMs) {
			snejkTickCarry -= tickMs;
			stepSnejkGame();
		}

		renderSnejk();
		snejkAnimationFrame = requestAnimationFrame(snejkLoop);
	}

	function restartSnejkGame() {
		const best = Number(snejkState?.best || readStorageValue('sebus_snejk_best') || 0) || 0;
		snejkState = createSnejkInitialState();
		snejkState.best = best;
		snejkTickCarry = 0;
		snejkLastFrameAt = 0;
		renderSnejk();
	}

	function handleSnejkKeydown(event) {
		if (!snejkPanelOpen || !snejkState) return;
		const key = String(event.key || '');
		let nextDirection = null;
		if (key === 'ArrowUp' || key === 'w' || key === 'W') nextDirection = { x: 0, y: -1 };
		if (key === 'ArrowDown' || key === 's' || key === 'S') nextDirection = { x: 0, y: 1 };
		if (key === 'ArrowLeft' || key === 'a' || key === 'A') nextDirection = { x: -1, y: 0 };
		if (key === 'ArrowRight' || key === 'd' || key === 'D') nextDirection = { x: 1, y: 0 };
		if (nextDirection) {
			event.preventDefault();
			if (!isSnejkOpposite(nextDirection, snejkState.direction)) snejkState.nextDirection = nextDirection;
			return;
		}
		if ((key === ' ' || key === 'Enter') && snejkState.dead) {
			event.preventDefault();
			restartSnejkGame();
			return;
		}
		if (key === 'Escape') {
			event.preventDefault();
			closeSnejkPanel();
		}
	}

	function initSnejkPanelIfNeeded() {
		if (snejkPanelInitialized) return document.getElementById('sebus-snejk-overlay');
		ensureSnejkFontLinks();
		ensureSnejkStyles();
		snejkPanelInitialized = true;

		const overlay = document.createElement('div');
		overlay.id = 'sebus-snejk-overlay';
		overlay.innerHTML = `
			<div id="sebus-snejk-window" role="dialog" aria-modal="true" aria-labelledby="sebus-snejk-title" tabindex="-1">
				<button id="sebus-snejk-close" type="button" aria-label="Zamknij snejka">✕</button>
				<h2 id="sebus-snejk-title">Snejk</h2>
				<p id="sebus-snejk-subtitle">Retro arena · sterowanie: strzałki lub WASD</p>
				<div id="sebus-snejk-stats">
					<span>Jabłka: <strong id="sebus-snejk-score">0</strong></span>
					<span>Długość: <strong id="sebus-snejk-length">${SNEJK_START_LENGTH}</strong></span>
					<span>Best: <strong id="sebus-snejk-best">0</strong></span>
				</div>
				<div id="sebus-snejk-stage-wrap">
					<canvas id="sebus-snejk-canvas" width="${SNEJK_COLS * SNEJK_CELL_SIZE}" height="${SNEJK_ROWS * SNEJK_CELL_SIZE}" tabindex="0" aria-label="Pole gry Snejk"></canvas>
					<div id="sebus-snejk-gameover">
						<p id="sebus-snejk-gameover-title">Game over</p>
						<p id="sebus-snejk-gameover-text">Enter/Spacja = restart</p>
					</div>
				</div>
				<div class="sebus-snejk-hud">
					<div id="sebus-snejk-hint">Zamknij: Esc · Restart po śmierci: Spacja / Enter</div>
					<div id="sebus-snejk-actions">
						<button class="sebus-snejk-btn" id="sebus-snejk-restart" type="button">↺ Restart</button>
						<button class="sebus-snejk-btn" id="sebus-snejk-close-bottom" type="button">✕ Zamknij</button>
					</div>
				</div>
			</div>`;
		document.body.appendChild(overlay);

		overlay.addEventListener('click', (event) => {
			if (event.target === overlay) closeSnejkPanel();
		});
		overlay.querySelector('#sebus-snejk-close')?.addEventListener('click', closeSnejkPanel);
		overlay.querySelector('#sebus-snejk-close-bottom')?.addEventListener('click', closeSnejkPanel);
		overlay.querySelector('#sebus-snejk-restart')?.addEventListener('click', restartSnejkGame);
		document.addEventListener('keydown', handleSnejkKeydown, true);

		restartSnejkGame();
		return overlay;
	}

	function openSnejkPanel() {
		const overlay = initSnejkPanelIfNeeded();
		if (!overlay) return;
		overlay.classList.add('show');
		snejkPanelOpen = true;
		const canvas = document.getElementById('sebus-snejk-canvas');
		if (canvas instanceof HTMLCanvasElement) canvas.focus();
		if (snejkAnimationFrame) cancelAnimationFrame(snejkAnimationFrame);
		snejkAnimationFrame = requestAnimationFrame(snejkLoop);
	}

	function closeSnejkPanel() {
		const overlay = document.getElementById('sebus-snejk-overlay');
		if (overlay) overlay.classList.remove('show');
		snejkPanelOpen = false;
		if (snejkAnimationFrame) {
			cancelAnimationFrame(snejkAnimationFrame);
			snejkAnimationFrame = 0;
		}
	}

	function runSnejkModule() {
		if (!appSettings.features.miniGames) {
			closeSnejkPanel();
			return;
		}
		initSnejkPanelIfNeeded();
	}

// Module: 76-room.js
// Purpose: Personal ROOM builder with furniture shop, per-user persistence and public visits

	const ROOM_COLS = 10;
	const ROOM_ROWS = 10;
	const ROOM_TILE_SIZE = 54;
	const ROOM_SVG_NS = 'http://www.w3.org/2000/svg';
	const ROOM_REMOTE_PUBLIC_PATH = `${baksySharedRootPath}/rooms`;
	const ROOM_VERSION = 1;
	const ROOM_CATALOG = [
		{ id: 'bed', name: 'Lozko', icon: '🛏️', cost: 180, width: 3, height: 2, color: 'linear-gradient(135deg,#7dd8ff,#6b7dff)' },
		{ id: 'sofa', name: 'Sofa', icon: '🛋️', cost: 160, width: 3, height: 2, color: 'linear-gradient(135deg,#ffb38a,#ff6b9f)' },
		{ id: 'desk', name: 'Biurko', icon: '🧰', cost: 130, width: 2, height: 1, color: 'linear-gradient(135deg,#f7d87a,#c48a46)' },
		{ id: 'table', name: 'Stol', icon: '🍽️', cost: 120, width: 2, height: 2, color: 'linear-gradient(135deg,#d8d2b6,#9e7d54)' },
		{ id: 'shelf', name: 'Regal', icon: '🗄️', cost: 110, width: 1, height: 1, color: 'linear-gradient(135deg,#cab6ff,#7a68ff)' },
		{ id: 'plant', name: 'Roslina', icon: '🪴', cost: 70, width: 1, height: 1, color: 'linear-gradient(135deg,#96f39f,#35bc6d)' },
		{ id: 'lamp', name: 'Lampa', icon: '💡', cost: 90, width: 1, height: 1, color: 'linear-gradient(135deg,#ffe78f,#ffb84d)' },
		{ id: 'arcade', name: 'Arcade', icon: '🕹️', cost: 220, width: 2, height: 2, color: 'linear-gradient(135deg,#7ff0d5,#4f79ff)' }
	];

	let roomPanelInitialized = false;
	let roomPanelOpen = false;
	let roomSyncTimer = 0;
	let roomDirectoryRefreshToken = 0;
	let roomCurrentViewUserId = '';
	let roomCurrentState = null;
	let roomDirectory = [];
	let roomSelectedInstanceId = '';
	let roomDragState = null;

	function getRoomCatalogItem(templateId) {
		return ROOM_CATALOG.find(item => item.id === templateId) || null;
	}

	// Builds an isometric SVG model for a furniture piece.
	// Uses a 3-face isometric box as the base, with unique details per furniture type.
	// vw/vh = viewport size of the SVG in pixels
	function buildRoomModelSvg(id, vw, vh) {
		// Helper: isometric hex from center. Each face is a parallelogram.
		// cx,cy = center of the top face, w = half-width, d = depth (height of side faces)
		const iso = (cx, cy, w, h, d) => {
			// top face (rhombus)
			const tl = [cx - w, cy];        // left
			const tr = [cx, cy - h];        // top
			const tbr = [cx + w, cy];       // right
			const tbl = [cx, cy + h];       // bottom
			// left face (goes down from tl and tbl)
			const ll = [cx - w, cy + d];
			const lb = [cx, cy + h + d];
			// right face (goes down from tbr and tbl)
			const rl = [cx + w, cy + d];
			return { tl, tr, tbr, tbl, ll, lb, rl };
		};
		const pts = (arr) => arr.map(p => Array.isArray(p) ? `${p[0]},${p[1]}` : `${p.x},${p.y}`).join(' ');

		switch (id) {
			case 'bed': {
				const cx = vw/2, cy = vh*0.38, w = vw*0.4, h = vh*0.22, d = vh*0.34;
				const f = iso(cx, cy, w, h, d);
				// headboard extra box
				const hbx = cx - w*0.98, hby = cy - h*0.1, hbw = w*0.14, hbh = h*0.55, hbd = d*0.68;
				const hb = iso(hbx + hbw, hby, hbw, hbh, hbd);
				return `<svg viewBox="0 0 ${vw} ${vh}" xmlns="http://www.w3.org/2000/svg" width="${vw}" height="${vh}" aria-hidden="true">
					<defs>
						<linearGradient id="bm-bed-top" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#f0f4ff"/><stop offset="100%" stop-color="#c8d0f8"/></linearGradient>
						<linearGradient id="bm-bed-l" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#9ba8e0"/><stop offset="100%" stop-color="#5a637a"/></linearGradient>
						<linearGradient id="bm-bed-r" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#7b87c2"/><stop offset="100%" stop-color="#3e4561"/></linearGradient>
						<linearGradient id="bm-bed-hb" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#6b4f3a"/><stop offset="100%" stop-color="#3c2b1e"/></linearGradient>
					</defs>
					<polygon points="${pts([f.tbl,f.tbr,f.rl,f.lb])}" fill="url(#bm-bed-r)" opacity=".9"/>
					<polygon points="${pts([f.tl,f.tbl,f.lb,f.ll])}" fill="url(#bm-bed-l)" opacity=".95"/>
					<polygon points="${pts([f.tl,f.tr,f.tbr,f.tbl])}" fill="url(#bm-bed-top)"/>
					<polygon points="${pts([hb.tl,hb.tr,hb.tbr,hb.tbl])}" fill="#7a5840"/>
					<polygon points="${pts([hb.tl,hb.tbl,hb.lb,hb.ll])}" fill="url(#bm-bed-hb)"/>
					<ellipse cx="${cx - w*0.3}" cy="${f.tbl[1] - h*0.55}" rx="${w*0.18}" ry="${h*0.22}" fill="white" opacity=".8"/>
					<ellipse cx="${cx + w*0.3}" cy="${f.tbl[1] - h*0.55}" rx="${w*0.18}" ry="${h*0.22}" fill="white" opacity=".8"/>
					<polygon points="${pts([f.tl,f.tr,f.tbr,f.tbl])}" fill="rgba(173,205,255,.28)" stroke="rgba(255,255,255,.18)" stroke-width=".8"/>
				</svg>`;
			}
			case 'sofa': {
				const cx = vw/2, cy = vh*0.40, w = vw*0.40, h = vh*0.20, d = vh*0.22;
				const f = iso(cx, cy, w, h, d);
				// Back rest box (taller, behind)
				const bcy = cy - h*1.1, bh = h*0.6, bd = d*0.5;
				const b = iso(cx, bcy, w*0.82, bh, bd);
				// Left arm
				const alx = cx - w*0.95, ald = d*0.9, alw = w*0.12;
				const al = iso(alx, cy - h*0.1, alw, h*0.8, ald);
				// Right arm
				const arx = cx + w*0.95, arw = w*0.12;
				const ar = iso(arx, cy - h*0.1, arw, h*0.8, ald);
				return `<svg viewBox="0 0 ${vw} ${vh}" xmlns="http://www.w3.org/2000/svg" width="${vw}" height="${vh}" aria-hidden="true">
					<defs>
						<linearGradient id="bm-sofa-top" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#ff9eaa"/><stop offset="100%" stop-color="#e85a7a"/></linearGradient>
						<linearGradient id="bm-sofa-l" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#d44060"/><stop offset="100%" stop-color="#7a1c35"/></linearGradient>
						<linearGradient id="bm-sofa-r" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#c03558"/><stop offset="100%" stop-color="#601428"/></linearGradient>
					</defs>
					<polygon points="${pts([b.tl,b.tbl,b.lb,b.ll])}" fill="#9e2844"/>
					<polygon points="${pts([b.tl,b.tr,b.tbr,b.tbl])}" fill="#f07090" stroke="rgba(255,255,255,.12)" stroke-width=".8"/>
					<polygon points="${pts([al.tl,al.tbl,al.lb,al.ll])}" fill="#b03050"/>
					<polygon points="${pts([al.tl,al.tr,al.tbr,al.tbl])}" fill="#f4849a"/>
					<polygon points="${pts([ar.tl,ar.tbl,ar.lb,ar.ll])}" fill="#9e2844"/>
					<polygon points="${pts([ar.tl,ar.tr,ar.tbr,ar.tbl])}" fill="#f07090"/>
					<polygon points="${pts([f.tl,f.tbl,f.lb,f.ll])}" fill="url(#bm-sofa-l)"/>
					<polygon points="${pts([f.tbl,f.tbr,f.rl,f.lb])}" fill="url(#bm-sofa-r)"/>
					<polygon points="${pts([f.tl,f.tr,f.tbr,f.tbl])}" fill="url(#bm-sofa-top)" stroke="rgba(255,255,255,.12)" stroke-width=".8"/>
				</svg>`;
			}
			case 'desk': {
				const cx = vw/2, cy = vh*0.34, w = vw*0.38, h = vh*0.18, d = vh*0.16;
				const f = iso(cx, cy, w, h, d);
				const legH = vh*0.30;
				const lw = w*0.08, lh = h*0.2;
				const leg1 = iso(cx - w*0.65, f.tbl[1] + d*0.5, lw, lh, legH);
				const leg2 = iso(cx + w*0.65, f.tbl[1] + d*0.5, lw, lh, legH);
				const leg3 = iso(cx - w*0.65, cy - h*0.7, lw, lh, legH);
				const leg4 = iso(cx + w*0.65, cy - h*0.7, lw, lh, legH);
				return `<svg viewBox="0 0 ${vw} ${vh}" xmlns="http://www.w3.org/2000/svg" width="${vw}" height="${vh}" aria-hidden="true">
					<defs>
						<linearGradient id="bm-desk-top" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#f4d892"/><stop offset="100%" stop-color="#c8904e"/></linearGradient>
						<linearGradient id="bm-desk-l" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#a97240"/><stop offset="100%" stop-color="#5c3a1e"/></linearGradient>
					</defs>
					<polygon points="${pts([leg1.tl,leg1.tbl,leg1.lb,leg1.ll])}" fill="#5c3820"/>
					<polygon points="${pts([leg2.tl,leg2.tbl,leg2.lb,leg2.ll])}" fill="#5c3820"/>
					<polygon points="${pts([leg3.tl,leg3.tbl,leg3.lb,leg3.ll])}" fill="#5c3820"/>
					<polygon points="${pts([leg4.tl,leg4.tbl,leg4.lb,leg4.ll])}" fill="#5c3820"/>
					<polygon points="${pts([f.tl,f.tbl,f.lb,f.ll])}" fill="url(#bm-desk-l)"/>
					<polygon points="${pts([f.tbl,f.tbr,f.rl,f.lb])}" fill="#7a5030"/>
					<polygon points="${pts([f.tl,f.tr,f.tbr,f.tbl])}" fill="url(#bm-desk-top)" stroke="rgba(255,255,255,.16)" stroke-width=".8"/>
					<rect x="${cx + w*0.1}" y="${cy - h*0.5}" width="${w*0.5}" height="${h*0.7}" rx="3" fill="rgba(0,0,0,.22)" transform="skewX(-18)"/>
					<rect x="${cx + w*0.12}" y="${cy - h*0.48}" width="${w*0.46}" height="${h*0.65}" rx="3" fill="#1e2f45" transform="skewX(-18)"/>
					<rect x="${cx + w*0.15}" y="${cy - h*0.44}" width="${w*0.4}" height="${h*0.55}" rx="2" fill="#1a9fff" opacity=".7" transform="skewX(-18)"/>
				</svg>`;
			}
			case 'table': {
				const cx = vw/2, cy = vh*0.36, w = vw*0.36, h = vh*0.20, d = vh*0.16;
				const f = iso(cx, cy, w, h, d);
				const legH = vh*0.28;
				const lw = w*0.07, lh = h*0.18;
				const corners = [[cx-w*0.7,f.tbl[1]+d*0.4],[cx+w*0.7,f.tbl[1]+d*0.4],[cx-w*0.7,cy-h*0.6],[cx+w*0.7,cy-h*0.6]];
				return `<svg viewBox="0 0 ${vw} ${vh}" xmlns="http://www.w3.org/2000/svg" width="${vw}" height="${vh}" aria-hidden="true">
					<defs>
						<linearGradient id="bm-table-top" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#ede0cc"/><stop offset="100%" stop-color="#c4a47a"/></linearGradient>
					</defs>
					${corners.map(([lx,ly]) => { const lg = iso(lx,ly,lw,lh,legH); return `<polygon points="${pts([lg.tl,lg.tbl,lg.lb,lg.ll])}" fill="#7a5030"/><polygon points="${pts([lg.tbl,lg.tbr,lg.rl,lg.lb])}" fill="#5a3820"/>`; }).join('')}
					<polygon points="${pts([f.tl,f.tbl,f.lb,f.ll])}" fill="#b8905e"/>
					<polygon points="${pts([f.tbl,f.tbr,f.rl,f.lb])}" fill="#9a7040"/>
					<polygon points="${pts([f.tl,f.tr,f.tbr,f.tbl])}" fill="url(#bm-table-top)" stroke="rgba(255,255,255,.14)" stroke-width=".8"/>
					<ellipse cx="${cx}" cy="${cy - h*0.1}" rx="${w*0.3}" ry="${h*0.5}" fill="rgba(255,255,255,.12)"/>
				</svg>`;
			}
			case 'shelf': {
				const cx = vw/2, cy = vh*0.1, w = vw*0.30, h = vh*0.14, d = vh*0.72;
				const f = iso(cx, cy, w, h, d);
				// 3 shelves inside
				const sh1 = iso(cx, cy + d*0.20, w*0.84, h*0.22, vh*0.025);
				const sh2 = iso(cx, cy + d*0.45, w*0.84, h*0.22, vh*0.025);
				const sh3 = iso(cx, cy + d*0.68, w*0.84, h*0.22, vh*0.025);
				return `<svg viewBox="0 0 ${vw} ${vh}" xmlns="http://www.w3.org/2000/svg" width="${vw}" height="${vh}" aria-hidden="true">
					<defs>
						<linearGradient id="bm-shelf-l" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#d5dde8"/><stop offset="100%" stop-color="#7e8ea0"/></linearGradient>
						<linearGradient id="bm-shelf-r" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#b4c0ce"/><stop offset="100%" stop-color="#60707e"/></linearGradient>
						<linearGradient id="bm-shelf-top" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#eef2f8"/><stop offset="100%" stop-color="#c8d0dc"/></linearGradient>
					</defs>
					<polygon points="${pts([f.tl,f.tbl,f.lb,f.ll])}" fill="url(#bm-shelf-l)"/>
					<polygon points="${pts([f.tbl,f.tbr,f.rl,f.lb])}" fill="url(#bm-shelf-r)"/>
					<polygon points="${pts([sh1.tl,sh1.tbl,sh1.lb,sh1.ll])}" fill="#9aabb8" opacity=".7"/>
					<polygon points="${pts([sh1.tl,sh1.tr,sh1.tbr,sh1.tbl])}" fill="#cdd6e2"/>
					<rect x="${cx - w*0.7}" y="${sh1.tl[1] - vh*0.06}" width="${w*0.22}" height="${vh*0.07}" rx="2" fill="#ff6b6b"/>
					<rect x="${cx - w*0.4}" y="${sh1.tl[1] - vh*0.06}" width="${w*0.22}" height="${vh*0.07}" rx="2" fill="#6baaff"/>
					<polygon points="${pts([sh2.tl,sh2.tbl,sh2.lb,sh2.ll])}" fill="#9aabb8" opacity=".7"/>
					<polygon points="${pts([sh2.tl,sh2.tr,sh2.tbr,sh2.tbl])}" fill="#cdd6e2"/>
					<rect x="${cx - w*0.6}" y="${sh2.tl[1] - vh*0.06}" width="${w*0.18}" height="${vh*0.08}" rx="2" fill="#6bffaa"/>
					<rect x="${cx - w*0.35}" y="${sh2.tl[1] - vh*0.06}" width="${w*0.18}" height="${vh*0.08}" rx="2" fill="#ffca6b"/>
					<polygon points="${pts([sh3.tl,sh3.tbl,sh3.lb,sh3.ll])}" fill="#9aabb8" opacity=".7"/>
					<polygon points="${pts([sh3.tl,sh3.tr,sh3.tbr,sh3.tbl])}" fill="#cdd6e2"/>
					<polygon points="${pts([f.tl,f.tr,f.tbr,f.tbl])}" fill="url(#bm-shelf-top)" stroke="rgba(255,255,255,.2)" stroke-width=".8"/>
				</svg>`;
			}
			case 'plant': {
				const cx = vw/2, cy = vh*0.48, r = vw*0.20;
				// Pot
				const potW = r*0.9, potH = vh*0.22;
				const p = iso(cx, cy, potW*0.8, potW*0.38, potH);
				// Leaves (circles with clip)
				const leavesY = cy - potH*0.2;
				return `<svg viewBox="0 0 ${vw} ${vh}" xmlns="http://www.w3.org/2000/svg" width="${vw}" height="${vh}" aria-hidden="true">
					<defs>
						<radialGradient id="bm-plant-leaf" cx="40%" cy="30%" r="65%"><stop offset="0%" stop-color="#a8f0b0"/><stop offset="100%" stop-color="#1e8040"/></radialGradient>
						<radialGradient id="bm-plant-leaf2" cx="60%" cy="30%" r="65%"><stop offset="0%" stop-color="#7ae890"/><stop offset="100%" stop-color="#166030"/></radialGradient>
					</defs>
					<polygon points="${pts([p.tl,p.tbl,p.lb,p.ll])}" fill="#8b4020"/>
					<polygon points="${pts([p.tbl,p.tbr,p.rl,p.lb])}" fill="#6a2e14"/>
					<polygon points="${pts([p.tl,p.tr,p.tbr,p.tbl])}" fill="#b05628"/>
					<ellipse cx="${cx - r*0.55}" cy="${leavesY - vh*0.22}" rx="${r*0.62}" ry="${r*0.72}" fill="url(#bm-plant-leaf)" transform="rotate(-18,${cx - r*0.55},${leavesY - vh*0.22})"/>
					<ellipse cx="${cx + r*0.55}" cy="${leavesY - vh*0.25}" rx="${r*0.60}" ry="${r*0.68}" fill="url(#bm-plant-leaf2)" transform="rotate(22,${cx + r*0.55},${leavesY - vh*0.25})"/>
					<ellipse cx="${cx}" cy="${leavesY - vh*0.36}" rx="${r*0.55}" ry="${r*0.78}" fill="url(#bm-plant-leaf)"/>
					<ellipse cx="${cx}" cy="${leavesY - vh*0.38}" rx="${r*0.18}" ry="${r*0.28}" fill="rgba(255,255,255,.14)"/>
				</svg>`;
			}
			case 'lamp': {
				const cx = vw/2, cy = vh*0.68;
				const baseW = vw*0.22, baseH = vh*0.08, baseD = vh*0.10;
				const base = iso(cx, cy, baseW, baseH, baseD);
				const standX = cx - vw*0.02;
				const shadeR = vw*0.28, shadeY = cy - vh*0.54;
				return `<svg viewBox="0 0 ${vw} ${vh}" xmlns="http://www.w3.org/2000/svg" width="${vw}" height="${vh}" aria-hidden="true">
					<defs>
						<radialGradient id="bm-lamp-shade" cx="50%" cy="30%" r="70%"><stop offset="0%" stop-color="#fffacc"/><stop offset="100%" stop-color="#e8a020"/></radialGradient>
						<radialGradient id="bm-lamp-glow" cx="50%" cy="100%" r="70%"><stop offset="0%" stop-color="rgba(255,240,100,.45)"/><stop offset="100%" stop-color="rgba(255,200,50,0)"/></radialGradient>
					</defs>
					<polygon points="${pts([base.tl,base.tbl,base.lb,base.ll])}" fill="#4a4a5a"/>
					<polygon points="${pts([base.tl,base.tr,base.tbr,base.tbl])}" fill="#7a7a8e"/>
					<ellipse cx="${cx}" cy="${shadeY + vh*0.34}" rx="${vw*0.06}" ry="${vh*0.36}" fill="#888898"/>
					<ellipse cx="${cx}" cy="${shadeY + vh*0.28}" rx="${shadeR*1.1}" ry="${vh*0.22}" fill="url(#bm-lamp-glow)"/>
					<ellipse cx="${cx}" cy="${shadeY}" rx="${shadeR}" ry="${shadeR*0.44}" fill="url(#bm-lamp-shade)" stroke="rgba(255,255,255,.3)" stroke-width="1.2"/>
					<ellipse cx="${cx}" cy="${shadeY}" rx="${shadeR*0.55}" ry="${shadeR*0.22}" fill="rgba(255,255,255,.22)"/>
				</svg>`;
			}
			case 'arcade': {
				const cx = vw/2, cy = vh*0.30, w = vw*0.28, h = vh*0.16, d = vh*0.56;
				const f = iso(cx, cy, w, h, d);
				// Screen area on front
				const scrTop = cy + d*0.06;
				const scrH = d*0.34;
				return `<svg viewBox="0 0 ${vw} ${vh}" xmlns="http://www.w3.org/2000/svg" width="${vw}" height="${vh}" aria-hidden="true">
					<defs>
						<linearGradient id="bm-arc-l" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#4a60ff"/><stop offset="100%" stop-color="#1e28a0"/></linearGradient>
						<linearGradient id="bm-arc-r" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#3444c0"/><stop offset="100%" stop-color="#141880"/></linearGradient>
						<linearGradient id="bm-arc-top" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox"><stop offset="0%" stop-color="#7896ff"/><stop offset="100%" stop-color="#4460d0"/></linearGradient>
						<radialGradient id="bm-arc-scr" cx="50%" cy="50%" r="60%"><stop offset="0%" stop-color="#40e0d0"/><stop offset="100%" stop-color="#0a5040"/></radialGradient>
					</defs>
					<polygon points="${pts([f.tl,f.tbl,f.lb,f.ll])}" fill="url(#bm-arc-l)"/>
					<polygon points="${pts([f.tbl,f.tbr,f.rl,f.lb])}" fill="url(#bm-arc-r)"/>
					<polygon points="${pts([f.tl,f.tr,f.tbr,f.tbl])}" fill="url(#bm-arc-top)" stroke="rgba(255,255,255,.2)" stroke-width=".8"/>
					<polygon points="${pts([f.tl,f.tbl,{x:f.tl[0],y:scrTop+scrH},{x:f.tl[0]-w*0.0,y:scrTop}])}"
						 fill="rgba(0,0,0,.0)"/>
					<rect x="${f.tl[0] + w*0.15}" y="${scrTop}" width="${w*1.1}" height="${scrH}" rx="4"
						 fill="url(#bm-arc-scr)" transform="skewY(${Math.atan2(h,w) * 180/Math.PI * 0.5})" opacity=".9"/>
					<circle cx="${f.tl[0] + w*0.62}" cy="${scrTop + scrH + d*0.14}" r="${w*0.18}" fill="#ff4466"/>
					<circle cx="${f.tl[0] + w*0.98}" cy="${scrTop + scrH + d*0.10}" r="${w*0.14}" fill="#ffcc00"/>
					<rect x="${f.tl[0] + w*0.28}" y="${scrTop + scrH + d*0.24}" width="${w*0.44}" height="${d*0.08}" rx="3" fill="rgba(255,255,255,.2)"/>
				</svg>`;
			}
			default: {
				const cx = vw/2, cy = vh*0.3, w = vw*0.32, h = vh*0.18, d = vh*0.38;
				const f = iso(cx, cy, w, h, d);
				return `<svg viewBox="0 0 ${vw} ${vh}" xmlns="http://www.w3.org/2000/svg" width="${vw}" height="${vh}" aria-hidden="true">
					<polygon points="${pts([f.tl,f.tbl,f.lb,f.ll])}" fill="#5a78c0"/>
					<polygon points="${pts([f.tbl,f.tbr,f.rl,f.lb])}" fill="#3a58a0"/>
					<polygon points="${pts([f.tl,f.tr,f.tbr,f.tbl])}" fill="#7a9aff" stroke="rgba(255,255,255,.18)" stroke-width=".8"/>
				</svg>`;
			}
		}
	}

	function buildRoomModelMarkup(template, variant = 'board') {
		if (!template) return '';
		const isShop = variant === 'shop';
		// Shop icon: 58×72 viewport; board sprite: 140×160 viewport
		const vw = isShop ? 58 : 140;
		const vh = isShop ? 72 : 160;
		return buildRoomModelSvg(template.id, vw, vh);
	}

	function roomLocalStorageKey(userId) {
		return `sebus_room_state_${String(userId || '').trim()}`;
	}

	function roomEscapeHtml(value) {
		return String(value || '')
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;');
	}

	function roomNotify(message, type = 'info') {
		if (typeof sebusUiNotify === 'function') {
			sebusUiNotify(message, type).catch(() => {});
			return;
		}
		console.log('[ROOM]', message);
	}

	function createDefaultRoomState(userId = getRuntimeUserId(), nick = '') {
		const account = getBaksyAccount(userId);
		return {
			version: ROOM_VERSION,
			userId: String(userId || getRuntimeUserId()),
			nick: String(nick || account?.displayName || getCurrentNickLabel() || `#${userId}`),
			roomName: 'Moj ROOM',
			cols: ROOM_COLS,
			rows: ROOM_ROWS,
			tileSize: ROOM_TILE_SIZE,
			items: [],
			spentBaksy: 0,
			updatedAt: nowTs()
		};
	}

	function normalizeRoomItem(raw, fallbackIndex = 0) {
		const template = getRoomCatalogItem(raw?.templateId);
		if (!template) return null;
		const maxX = Math.max(0, ROOM_COLS - template.width);
		const maxY = Math.max(0, ROOM_ROWS - template.height);
		return {
			instanceId: String(raw?.instanceId || `room_item_${Date.now()}_${fallbackIndex}`),
			templateId: template.id,
			x: Math.max(0, Math.min(maxX, Math.round(Number(raw?.x) || 0))),
			y: Math.max(0, Math.min(maxY, Math.round(Number(raw?.y) || 0))),
			placedAt: Number(raw?.placedAt || nowTs())
		};
	}

	function normalizeRoomState(raw, userId = getRuntimeUserId()) {
		const base = createDefaultRoomState(userId, raw?.nick || '');
		const items = Array.isArray(raw?.items)
			? raw.items.map((item, index) => normalizeRoomItem(item, index)).filter(Boolean)
			: [];
		const normalized = {
			...base,
			...((raw && typeof raw === 'object') ? raw : {}),
			userId: String(raw?.userId || userId || getRuntimeUserId()),
			nick: String(raw?.nick || base.nick || `#${userId}`),
			roomName: String(raw?.roomName || base.roomName || 'Moj ROOM').slice(0, 40),
			cols: ROOM_COLS,
			rows: ROOM_ROWS,
			tileSize: ROOM_TILE_SIZE,
			items,
			spentBaksy: Math.max(0, Number(raw?.spentBaksy || 0)),
			updatedAt: Number(raw?.updatedAt || 0)
		};
		if (!normalized.updatedAt) normalized.updatedAt = nowTs();
		return normalized;
	}

	function cloneRoomState(state) {
		return normalizeRoomState(JSON.parse(JSON.stringify(state || {})), state?.userId || getRuntimeUserId());
	}

	function loadRoomStateLocal(userId = getRuntimeUserId()) {
		const key = roomLocalStorageKey(userId);
		try {
			const raw = localStorage.getItem(key);
			if (!raw) return createDefaultRoomState(userId);
			return normalizeRoomState(JSON.parse(raw), userId);
		} catch (e) {
			return createDefaultRoomState(userId);
		}
	}

	function saveRoomStateLocal(state) {
		if (!state?.userId) return;
		const payload = normalizeRoomState(state, state.userId);
		try {
			localStorage.setItem(roomLocalStorageKey(payload.userId), JSON.stringify(payload));
		} catch (e) {}
	}

	function buildRoomPublicPayload(state) {
		const payload = normalizeRoomState(state, state?.userId || getRuntimeUserId());
		return {
			version: ROOM_VERSION,
			userId: payload.userId,
			nick: String(payload.nick || `#${payload.userId}`),
			roomName: payload.roomName,
			cols: ROOM_COLS,
			rows: ROOM_ROWS,
			items: payload.items.map(item => ({
				instanceId: item.instanceId,
				templateId: item.templateId,
				x: item.x,
				y: item.y,
				placedAt: item.placedAt
			})),
			spentBaksy: payload.spentBaksy,
			updatedAt: nowTs()
		};
	}

	function isRoomEditable() {
		return String(roomCurrentViewUserId || '') === String(getRuntimeUserId());
	}

	function getRoomStateItemById(instanceId) {
		if (!roomCurrentState || !Array.isArray(roomCurrentState.items)) return null;
		return roomCurrentState.items.find(item => item.instanceId === instanceId) || null;
	}

	function getRoomRectForItem(item, x = item?.x, y = item?.y) {
		const template = getRoomCatalogItem(item?.templateId);
		if (!template) return null;
		return {
			left: Number(x || 0),
			top: Number(y || 0),
			right: Number(x || 0) + template.width,
			bottom: Number(y || 0) + template.height,
			width: template.width,
			height: template.height
		};
	}

	function roomRectsOverlap(a, b) {
		if (!a || !b) return false;
		return !(a.right <= b.left || a.left >= b.right || a.bottom <= b.top || a.top >= b.bottom);
	}

	function roomPositionBlocked(instanceId, x, y) {
		if (!roomCurrentState) return false;
		const item = getRoomStateItemById(instanceId);
		const rect = getRoomRectForItem(item, x, y);
		if (!rect) return true;
		return roomCurrentState.items.some(other => {
			if (!other || other.instanceId === instanceId) return false;
			return roomRectsOverlap(rect, getRoomRectForItem(other));
		});
	}

	function clampRoomPosition(templateId, x, y) {
		const template = getRoomCatalogItem(templateId);
		if (!template) return { x: 0, y: 0 };
		return {
			x: Math.max(0, Math.min(ROOM_COLS - template.width, Math.round(Number(x) || 0))),
			y: Math.max(0, Math.min(ROOM_ROWS - template.height, Math.round(Number(y) || 0)))
		};
	}

	function findOpenRoomSpot(templateId) {
		const template = getRoomCatalogItem(templateId);
		if (!template || !roomCurrentState) return null;
		for (let y = 0; y <= ROOM_ROWS - template.height; y += 1) {
			for (let x = 0; x <= ROOM_COLS - template.width; x += 1) {
				const probe = { instanceId: '__probe__', templateId, x, y };
				const occupied = roomCurrentState.items.some(other => roomRectsOverlap(getRoomRectForItem(other), getRoomRectForItem(probe)));
				if (!occupied) return { x, y };
			}
		}
		return null;
	}

	function sortRoomItemsForRender(items) {
		return [...(items || [])].sort((a, b) => {
			const aScore = (Number(a.y) * 100) + Number(a.x);
			const bScore = (Number(b.y) * 100) + Number(b.x);
			return aScore - bScore;
		});
	}

	function getRoomOwnerLabel(state) {
		if (!state) return '#?';
		return String(state.nick || `#${state.userId || '?'}`);
	}

	function getRoomBalanceLabel() {
		const account = getBaksyAccount();
		return `${Number(account?.balance || 0)} 💵`;
	}

	function getRoomBoardMetrics() {
		const tileW = ROOM_TILE_SIZE;
		const tileH = Math.round(tileW / 2);
		const wallHeight = Math.round(tileW * 1.9);
		const margin = Math.round(tileW * 1.7);
		const width = ((ROOM_COLS + ROOM_ROWS) * tileW) / 2 + margin * 2;
		const height = wallHeight + ((ROOM_COLS + ROOM_ROWS) * tileH) / 2 + margin * 1.6;
		const originX = (ROOM_ROWS * tileW) / 2 + margin;
		const originY = wallHeight + margin * 0.72;
		return { tileW, tileH, wallHeight, margin, width, height, originX, originY };
	}

	function roomIsoToScreen(x, y, metrics = getRoomBoardMetrics()) {
		return {
			x: metrics.originX + ((x - y) * metrics.tileW) / 2,
			y: metrics.originY + ((x + y) * metrics.tileH) / 2
		};
	}

	function roomScreenToIso(screenX, screenY, metrics = getRoomBoardMetrics()) {
		const dx = screenX - metrics.originX;
		const dy = screenY - metrics.originY;
		const a = dx / (metrics.tileW / 2);
		const b = dy / (metrics.tileH / 2);
		return {
			x: (a + b) / 2,
			y: (b - a) / 2
		};
	}

	function roomMakeSvgElement(name, attrs = {}) {
		const element = document.createElementNS(ROOM_SVG_NS, name);
		Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, String(value)));
		return element;
	}

	function roomMakePolygon(points, attrs = {}) {
		return roomMakeSvgElement('polygon', {
			points: points.map(point => `${point.x},${point.y}`).join(' '),
			...attrs
		});
	}

	function roomMakeLine(a, b, attrs = {}) {
		return roomMakeSvgElement('line', {
			x1: a.x,
			y1: a.y,
			x2: b.x,
			y2: b.y,
			...attrs
		});
	}

	function drawRoomIsometricScene(svg, metrics) {
		if (!(svg instanceof SVGElement)) return;
		svg.setAttribute('viewBox', `0 0 ${metrics.width} ${metrics.height}`);
		svg.setAttribute('width', String(metrics.width));
		svg.setAttribute('height', String(metrics.height));
		svg.innerHTML = '';

		const defs = roomMakeSvgElement('defs');

		const floorGrad = roomMakeSvgElement('linearGradient', { id: 'sebus-room-floor-grad', x1: '0%', y1: '0%', x2: '100%', y2: '100%' });
		floorGrad.innerHTML = '<stop offset="0%" stop-color="#6e9c4e"></stop><stop offset="55%" stop-color="#4f7b35"></stop><stop offset="100%" stop-color="#345522"></stop>';

		const wallLeftGrad = roomMakeSvgElement('linearGradient', { id: 'sebus-room-wall-left-grad', x1: '0%', y1: '0%', x2: '0%', y2: '100%' });
		wallLeftGrad.innerHTML = '<stop offset="0%" stop-color="#acb2ba"></stop><stop offset="100%" stop-color="#676d75"></stop>';

		const wallRightGrad = roomMakeSvgElement('linearGradient', { id: 'sebus-room-wall-right-grad', x1: '0%', y1: '0%', x2: '0%', y2: '100%' });
		wallRightGrad.innerHTML = '<stop offset="0%" stop-color="#8e96a0"></stop><stop offset="100%" stop-color="#4d545f"></stop>';

		const glow = roomMakeSvgElement('filter', { id: 'sebus-room-soft-glow' });
		glow.innerHTML = '<feGaussianBlur stdDeviation="8" result="blur"></feGaussianBlur><feMerge><feMergeNode in="blur"></feMergeNode><feMergeNode in="SourceGraphic"></feMergeNode></feMerge>';

		defs.appendChild(floorGrad);
		defs.appendChild(wallLeftGrad);
		defs.appendChild(wallRightGrad);
		defs.appendChild(glow);
		svg.appendChild(defs);

		const p00 = roomIsoToScreen(0, 0, metrics);
		const pC0 = roomIsoToScreen(ROOM_COLS, 0, metrics);
		const pCR = roomIsoToScreen(ROOM_COLS, ROOM_ROWS, metrics);
		const p0R = roomIsoToScreen(0, ROOM_ROWS, metrics);
		const lift = { x: 0, y: -metrics.wallHeight };

		svg.appendChild(roomMakePolygon([
			{ x: p00.x, y: p00.y + 14 },
			{ x: pC0.x, y: pC0.y + 14 },
			{ x: pCR.x, y: pCR.y + 26 },
			{ x: p0R.x, y: p0R.y + 26 }
		], { fill: 'rgba(0,0,0,0.24)', filter: 'url(#sebus-room-soft-glow)' }));

		svg.appendChild(roomMakePolygon([
			p00,
			p0R,
			{ x: p0R.x, y: p0R.y + lift.y },
			{ x: p00.x, y: p00.y + lift.y }
		], { fill: 'url(#sebus-room-wall-left-grad)', stroke: 'rgba(255,255,255,0.1)', 'stroke-width': '1.2' }));

		svg.appendChild(roomMakePolygon([
			p00,
			pC0,
			{ x: pC0.x, y: pC0.y + lift.y },
			{ x: p00.x, y: p00.y + lift.y }
		], { fill: 'url(#sebus-room-wall-right-grad)', stroke: 'rgba(255,255,255,0.08)', 'stroke-width': '1.2' }));

		svg.appendChild(roomMakePolygon([p00, pC0, pCR, p0R], {
			fill: 'url(#sebus-room-floor-grad)',
			stroke: 'rgba(255,255,255,0.1)',
			'stroke-width': '1.2'
		}));

		for (let x = 1; x < ROOM_COLS; x += 1) {
			const a = roomIsoToScreen(x, 0, metrics);
			const b = roomIsoToScreen(x, ROOM_ROWS, metrics);
			svg.appendChild(roomMakeLine(a, b, { stroke: 'rgba(255,255,255,0.08)', 'stroke-width': '1' }));
		}

		for (let y = 1; y < ROOM_ROWS; y += 1) {
			const a = roomIsoToScreen(0, y, metrics);
			const b = roomIsoToScreen(ROOM_COLS, y, metrics);
			svg.appendChild(roomMakeLine(a, b, { stroke: 'rgba(255,255,255,0.08)', 'stroke-width': '1' }));
		}

		svg.appendChild(roomMakeLine(
			{ x: p00.x, y: p00.y + lift.y },
			{ x: p0R.x, y: p0R.y + lift.y },
			{ stroke: 'rgba(255,255,255,0.18)', 'stroke-width': '1.8' }
		));
		svg.appendChild(roomMakeLine(
			{ x: p00.x, y: p00.y + lift.y },
			{ x: pC0.x, y: pC0.y + lift.y },
			{ stroke: 'rgba(255,255,255,0.18)', 'stroke-width': '1.8' }
		));
	}

	function applyRoomItemVisual(element, item, metrics = getRoomBoardMetrics()) {
		if (!(element instanceof HTMLElement) || !item) return;
		const template = getRoomCatalogItem(item.templateId);
		if (!template) return;
		const center = roomIsoToScreen(item.x + (template.width / 2), item.y + (template.height / 2), metrics);
		// Footprint: the isometric rhombus area on the floor
		const footprintWidth = Math.max(metrics.tileW, ((template.width + template.height) * metrics.tileW) / 2);
		const footprintHeight = Math.max(metrics.tileH, ((template.width + template.height) * metrics.tileH) / 2);
		// Sprite: the actual 3D model visual — must be large enough to clearly see the SVG
		const spriteWidth = Math.max(110, Math.min(280, footprintWidth * 1.35));
		const spriteHeight = Math.max(130, Math.min(320, spriteWidth * 1.14));
		const sum = template.width + template.height;
		const topX = (template.height / sum) * 100;
		const rightY = (template.width / sum) * 100;
		const bottomX = (template.width / sum) * 100;
		const leftY = (template.height / sum) * 100;

		element.style.left = `${center.x}px`;
		// Anchor at bottom of footprint, sprite rises above
		element.style.top = `${center.y + (footprintHeight / 2)}px`;
		element.style.zIndex = String(Math.round((item.x + item.y + template.height) * 100));
		element.style.setProperty('--room-piece-w', `${footprintWidth}px`);
		element.style.setProperty('--room-foot-h', `${footprintHeight}px`);
		element.style.setProperty('--room-sprite-w', `${spriteWidth}px`);
		element.style.setProperty('--room-sprite-h', `${spriteHeight}px`);
		element.style.setProperty('--room-piece-fill', template.color);
		element.style.setProperty('--room-fp-top-x', `${topX}%`);
		element.style.setProperty('--room-fp-right-y', `${rightY}%`);
		element.style.setProperty('--room-fp-bottom-x', `${bottomX}%`);
		element.style.setProperty('--room-fp-left-y', `${leftY}%`);
	}

	function updateRoomViewportScale(metrics = getRoomBoardMetrics()) {
		const viewport = document.getElementById('sebus-room-stage-frame');
		const frame = document.getElementById('sebus-room-world-frame');
		if (!(viewport instanceof HTMLElement) || !(frame instanceof HTMLElement)) return 1;
		const availableWidth = Math.max(260, viewport.clientWidth - 24);
		const availableHeight = Math.max(260, viewport.clientHeight - 24);
		const scale = Math.min(1, availableWidth / metrics.width, availableHeight / metrics.height);
		frame.style.width = `${metrics.width}px`;
		frame.style.height = `${metrics.height}px`;
		frame.style.transform = `scale(${scale})`;
		frame.dataset.renderScale = String(scale);
		return scale;
	}

	async function loadOwnRoomState(forceRemote = false) {
		const uid = String(getRuntimeUserId());
		let local = loadRoomStateLocal(uid);
		if (local && !forceRemote) return local;
		try {
			const remote = await firebaseReadPath(`users/${encodeURIComponent(uid)}/roomState`);
			if (remote && typeof remote === 'object') {
				const normalizedRemote = normalizeRoomState(remote, uid);
				if (Number(normalizedRemote.updatedAt || 0) >= Number(local?.updatedAt || 0)) {
					local = normalizedRemote;
					saveRoomStateLocal(local);
				}
			}
		} catch (e) {}
		return local || createDefaultRoomState(uid);
	}

	async function loadPublicRoomState(userId) {
		const uid = String(userId || '').trim();
		if (!uid) return null;
		if (uid === String(getRuntimeUserId())) return await loadOwnRoomState(true);
		try {
			const remote = await firebaseReadPath(`${ROOM_REMOTE_PUBLIC_PATH}/${encodeURIComponent(uid)}`);
			if (remote && typeof remote === 'object') return normalizeRoomState(remote, uid);
		} catch (e) {}
		return null;
	}

	async function flushRoomStateSync() {
		if (!roomCurrentState || !isRoomEditable()) return;
		const state = normalizeRoomState({
			...roomCurrentState,
			nick: String(getBaksyAccount()?.displayName || getCurrentNickLabel() || roomCurrentState.nick || `#${getRuntimeUserId()}`),
			updatedAt: nowTs()
		}, getRuntimeUserId());
		roomCurrentState = state;
		saveRoomStateLocal(state);
		try {
			await firebaseWriteUserStatePart('roomState', state, state.userId);
			await firebaseWritePath(`${ROOM_REMOTE_PUBLIC_PATH}/${encodeURIComponent(state.userId)}`, buildRoomPublicPayload(state));
			await firebaseWritePath(`${ROOM_REMOTE_PUBLIC_PATH}/updatedAt`, nowTs());
		} catch (e) {
			roomNotify('ROOM: nie udalo sie zsynchronizowac pokoju z baza.', 'warning');
		}
	}

	function scheduleRoomStateSync() {
		if (!isRoomEditable()) return;
		if (roomSyncTimer) clearTimeout(roomSyncTimer);
		roomSyncTimer = setTimeout(() => {
			roomSyncTimer = 0;
			flushRoomStateSync();
		}, 260);
	}

	function updateRoomTopbar() {
		const titleEl = document.getElementById('sebus-room-owner');
		const metaEl = document.getElementById('sebus-room-meta');
		const modeEl = document.getElementById('sebus-room-mode');
		const roomNameEl = document.getElementById('sebus-room-name');
		const balanceEl = document.getElementById('sebus-room-balance');
		if (titleEl) titleEl.textContent = getRoomOwnerLabel(roomCurrentState);
		if (roomNameEl) roomNameEl.textContent = String(roomCurrentState?.roomName || 'Moj ROOM');
		if (balanceEl) balanceEl.textContent = getRoomBalanceLabel();
		if (metaEl) metaEl.textContent = `ID: ${roomCurrentState?.userId || '?'} • ${roomCurrentState?.items?.length || 0} przedmiotow • wydano ${Number(roomCurrentState?.spentBaksy || 0)} 💵`;
		if (modeEl) modeEl.textContent = isRoomEditable() ? 'Tryb edycji' : 'Tryb odwiedzin';
	}

	function renderRoomShop() {
		const container = document.getElementById('sebus-room-shop-list');
		const note = document.getElementById('sebus-room-left-note');
		if (!container) return;
		const editable = isRoomEditable();
		if (note) note.textContent = editable ? 'Kup mebel za baksy i przeciagaj go po planszy.' : 'Odwiedzasz cudzy pokoj — sklep jest tylko do podgladu.';
		container.innerHTML = ROOM_CATALOG.map(item => {
			const owned = (roomCurrentState?.items || []).filter(entry => entry.templateId === item.id).length;
			return `
				<div class="sebus-room-shop-card" data-template-id="${item.id}">
					<div class="sebus-room-shop-icon"><div class="sebus-room-shop-icon-stage">${buildRoomModelMarkup(item, 'shop')}</div></div>
					<div class="sebus-room-shop-copy">
						<div class="sebus-room-shop-name">${roomEscapeHtml(item.name)}</div>
						<div class="sebus-room-shop-meta">${item.width}×${item.height} pola • posiadasz: ${owned}</div>
					</div>
					<button class="sebus-room-shop-buy" type="button" data-buy-room-item="${item.id}" ${editable ? '' : 'disabled'}>${item.cost} 💵</button>
				</div>`;
		}).join('');
	}

	function renderRoomDirectory() {
		const list = document.getElementById('sebus-room-directory-list');
		if (!list) return;
		const currentUid = String(roomCurrentViewUserId || getRuntimeUserId());
		if (!roomDirectory.length) {
			list.innerHTML = '<div class="sebus-room-empty">Brak publicznych roomow. Otworz swoj ROOM i ustaw pierwszy mebel.</div>';
			return;
		}
		list.innerHTML = roomDirectory.map(entry => {
			const active = String(entry.userId) === currentUid;
			return `
				<button class="sebus-room-visit-card${active ? ' active' : ''}" type="button" data-visit-room="${roomEscapeHtml(entry.userId)}">
					<span class="sebus-room-visit-copy">
						<strong>${roomEscapeHtml(entry.nick || `#${entry.userId}`)}</strong>
						<small>#${roomEscapeHtml(entry.userId)} • ${Number(entry.items?.length || 0)} przedm.</small>
					</span>
					<span class="sebus-room-visit-icon">🏠</span>
				</button>`;
		}).join('');
	}

	function renderRoomBoard() {
		const board = document.getElementById('sebus-room-board');
		const selectedMeta = document.getElementById('sebus-room-selected-meta');
		const removeBtn = document.getElementById('sebus-room-remove-btn');
		if (!board) return;
		const metrics = getRoomBoardMetrics();
		board.style.width = '100%';
		board.style.height = '100%';
		const itemsHtml = sortRoomItemsForRender(roomCurrentState?.items || []).map(item => {
			const template = getRoomCatalogItem(item.templateId);
			if (!template) return '';
			const selected = roomSelectedInstanceId === item.instanceId;
			return `
				<div
					class="sebus-room-item${selected ? ' selected' : ''}"
					data-room-instance-id="${roomEscapeHtml(item.instanceId)}"
					data-template-id="${roomEscapeHtml(item.templateId)}"
				>
					<div class="sebus-room-piece">
						<div class="sebus-room-footprint-shadow"></div>
						<div class="sebus-room-footprint"></div>
						<div class="sebus-room-sprite-anchor">
							${buildRoomModelMarkup(template, 'board')}
							<div class="sebus-room-item-name">${roomEscapeHtml(template.name)}</div>
							<div class="sebus-room-item-size">${template.width}×${template.height}</div>
						</div>
					</div>
				</div>`;
		}).join('');
		board.innerHTML = `
			<div id="sebus-room-stage-frame">
				<div id="sebus-room-iso-world">
					<div id="sebus-room-world-frame">
						<svg id="sebus-room-svg" aria-hidden="true"></svg>
						<div id="sebus-room-furniture-layer">${itemsHtml}</div>
					</div>
				</div>
			</div>`;
		const svg = document.getElementById('sebus-room-svg');
		drawRoomIsometricScene(svg, metrics);
		board.querySelectorAll('.sebus-room-item').forEach(itemEl => {
			const item = getRoomStateItemById(itemEl.getAttribute('data-room-instance-id'));
			applyRoomItemVisual(itemEl, item, metrics);
		});
		updateRoomViewportScale(metrics);
		const selectedItem = getRoomStateItemById(roomSelectedInstanceId);
		const selectedTemplate = selectedItem ? getRoomCatalogItem(selectedItem.templateId) : null;
		if (selectedMeta) {
			selectedMeta.textContent = selectedTemplate
				? `${selectedTemplate.name} • pozycja ${selectedItem.x + 1}, ${selectedItem.y + 1} • footprint ${selectedTemplate.width}×${selectedTemplate.height}`
				: 'Nic nie zaznaczono';
		}
		if (removeBtn) removeBtn.disabled = !selectedItem || !isRoomEditable();
	}

	function renderRoomPanel() {
		renderRoomShop();
		renderRoomDirectory();
		renderRoomBoard();
		updateRoomTopbar();
	}

	async function refreshRoomDirectory(force = false) {
		const token = ++roomDirectoryRefreshToken;
		try {
			const raw = await firebaseReadPath(ROOM_REMOTE_PUBLIC_PATH);
			if (token !== roomDirectoryRefreshToken) return;
			const entries = raw && typeof raw === 'object'
				? Object.entries(raw)
					.filter(([key, value]) => key !== 'updatedAt' && value && typeof value === 'object')
					.map(([, value]) => normalizeRoomState(value, value.userId || ''))
					.filter(item => item.userId)
					.sort((a, b) => Number(b.updatedAt || 0) - Number(a.updatedAt || 0))
				: [];
			const ownId = String(getRuntimeUserId());
			const ownLocal = loadRoomStateLocal(ownId);
			if (!entries.some(entry => String(entry.userId) === ownId) && ownLocal?.items?.length) {
				entries.unshift(ownLocal);
			}
			roomDirectory = entries;
			renderRoomDirectory();
		} catch (e) {
			if (force) roomNotify('ROOM: nie udalo sie pobrac listy roomow.', 'warning');
		}
	}

	async function switchRoomView(userId, options = {}) {
		const targetId = String(userId || getRuntimeUserId());
		const status = document.getElementById('sebus-room-status');
		if (status) status.textContent = 'Ladowanie roomu...';
		roomCurrentViewUserId = targetId;
		let nextState = null;
		if (targetId === String(getRuntimeUserId())) {
			nextState = await loadOwnRoomState(!!options.forceRemote);
			if (!nextState.nick) {
				nextState.nick = String(getBaksyAccount()?.displayName || getCurrentNickLabel() || `#${targetId}`);
			}
			roomCurrentState = nextState;
			saveRoomStateLocal(roomCurrentState);
			scheduleRoomStateSync();
		} else {
			nextState = await loadPublicRoomState(targetId);
			roomCurrentState = nextState || createDefaultRoomState(targetId, `#${targetId}`);
		}
		if (!roomCurrentState.items.length) roomSelectedInstanceId = '';
		else if (!getRoomStateItemById(roomSelectedInstanceId)) roomSelectedInstanceId = roomCurrentState.items[0].instanceId;
		renderRoomPanel();
		if (status) status.textContent = isRoomEditable() ? 'Twoj prywatny ROOM synchronizuje sie z baza.' : 'Odwiedzasz publiczny ROOM innego gracza.';
		refreshRoomDirectory(false);
	}

	function selectRoomItem(instanceId) {
		roomSelectedInstanceId = String(instanceId || '');
		renderRoomBoard();
	}

	function buyRoomItem(templateId) {
		if (!isRoomEditable()) return;
		const template = getRoomCatalogItem(templateId);
		if (!template || !roomCurrentState) return;
		const spot = findOpenRoomSpot(template.id);
		if (!spot) {
			roomNotify('ROOM: brak miejsca na ten przedmiot.', 'warning');
			return;
		}
		if (!spendBaksy(template.cost, `room:buy:${template.id}`, { templateId: template.id })) {
			roomNotify('ROOM: za malo baksow na zakup tego przedmiotu.', 'error');
			return;
		}
		const nextItem = {
			instanceId: `room_${template.id}_${nowTs()}_${Math.random().toString(36).slice(2, 7)}`,
			templateId: template.id,
			x: spot.x,
			y: spot.y,
			placedAt: nowTs()
		};
		roomCurrentState.items.push(nextItem);
		roomCurrentState.nick = String(getBaksyAccount()?.displayName || getCurrentNickLabel() || roomCurrentState.nick);
		roomCurrentState.spentBaksy = Number(roomCurrentState.spentBaksy || 0) + template.cost;
		roomCurrentState.updatedAt = nowTs();
		roomSelectedInstanceId = nextItem.instanceId;
		renderRoomPanel();
		scheduleRoomStateSync();
		roomNotify(`Kupiono ${template.name} za ${template.cost} 💵.`, 'success');
	}

	function removeSelectedRoomItem() {
		if (!isRoomEditable() || !roomCurrentState || !roomSelectedInstanceId) return;
		const target = getRoomStateItemById(roomSelectedInstanceId);
		if (!target) return;
		roomCurrentState.items = roomCurrentState.items.filter(item => item.instanceId !== roomSelectedInstanceId);
		roomSelectedInstanceId = roomCurrentState.items[0]?.instanceId || '';
		roomCurrentState.updatedAt = nowTs();
		renderRoomPanel();
		scheduleRoomStateSync();
	}

	function moveSelectedRoomItem(dx, dy) {
		if (!isRoomEditable() || !roomSelectedInstanceId) return;
		const item = getRoomStateItemById(roomSelectedInstanceId);
		if (!item) return;
		const next = clampRoomPosition(item.templateId, item.x + dx, item.y + dy);
		if (roomPositionBlocked(item.instanceId, next.x, next.y)) return;
		item.x = next.x;
		item.y = next.y;
		roomCurrentState.updatedAt = nowTs();
		renderRoomBoard();
		updateRoomTopbar();
		scheduleRoomStateSync();
	}

	function beginRoomDrag(event, instanceId, itemEl) {
		if (!isRoomEditable()) return;
		const board = document.getElementById('sebus-room-world-frame');
		const item = getRoomStateItemById(instanceId);
		if (!board || !item || !(itemEl instanceof HTMLElement)) return;
		const metrics = getRoomBoardMetrics();
		const rect = board.getBoundingClientRect();
		const scale = Math.max(0.0001, rect.width / metrics.width);
		const iso = roomScreenToIso((event.clientX - rect.left) / scale, (event.clientY - rect.top) / scale, metrics);
		roomDragState = {
			instanceId,
			pointerId: event.pointerId,
			offsetX: iso.x - item.x,
			offsetY: iso.y - item.y,
			boardRect: rect,
			metrics,
			scale,
			lastValidX: item.x,
			lastValidY: item.y,
			itemEl
		};
		selectRoomItem(instanceId);
		itemEl.setPointerCapture?.(event.pointerId);
		itemEl.classList.add('dragging');
	}

	function moveRoomDrag(event) {
		if (!roomDragState || roomDragState.pointerId !== event.pointerId) return;
		const item = getRoomStateItemById(roomDragState.instanceId);
		if (!item) return;
		const iso = roomScreenToIso((event.clientX - roomDragState.boardRect.left) / roomDragState.scale, (event.clientY - roomDragState.boardRect.top) / roomDragState.scale, roomDragState.metrics);
		const next = clampRoomPosition(
			item.templateId,
			Math.round(iso.x - roomDragState.offsetX),
			Math.round(iso.y - roomDragState.offsetY)
		);
		const blocked = roomPositionBlocked(item.instanceId, next.x, next.y);
		roomDragState.itemEl?.classList.toggle('blocked', blocked);
		if (!blocked) {
			roomDragState.lastValidX = next.x;
			roomDragState.lastValidY = next.y;
			applyRoomItemVisual(roomDragState.itemEl, { ...item, x: next.x, y: next.y }, roomDragState.metrics);
		}
	}

	function endRoomDrag(event) {
		if (!roomDragState || roomDragState.pointerId !== event.pointerId) return;
		const item = getRoomStateItemById(roomDragState.instanceId);
		if (item) {
			item.x = roomDragState.lastValidX;
			item.y = roomDragState.lastValidY;
			roomCurrentState.updatedAt = nowTs();
		}
		roomDragState.itemEl?.classList.remove('dragging', 'blocked');
		roomDragState.itemEl?.releasePointerCapture?.(event.pointerId);
		roomDragState = null;
		renderRoomBoard();
		updateRoomTopbar();
		scheduleRoomStateSync();
	}

	function handleRoomOverlayClick(event) {
		const buyId = event.target?.getAttribute?.('data-buy-room-item');
		if (buyId) {
			buyRoomItem(buyId);
			return;
		}
		const visitId = event.target?.closest?.('[data-visit-room]')?.getAttribute?.('data-visit-room');
		if (visitId) {
			switchRoomView(visitId, { forceRemote: true });
			return;
		}
		const roomItem = event.target?.closest?.('[data-room-instance-id]');
		if (roomItem) {
			selectRoomItem(roomItem.getAttribute('data-room-instance-id'));
		}
	}

	function handleRoomPointerDown(event) {
		const itemEl = event.target?.closest?.('[data-room-instance-id]');
		if (!itemEl || !isRoomEditable()) return;
		beginRoomDrag(event, itemEl.getAttribute('data-room-instance-id'), itemEl);
	}

	function handleRoomKeydown(event) {
		if (!roomPanelOpen) return;
		if (event.target && /input|textarea|select/i.test(event.target.tagName)) return;
		if (event.key === 'Escape') {
			event.preventDefault();
			closeRoomPanel();
			return;
		}
		const steps = {
			ArrowLeft: [-1, 0],
			ArrowRight: [1, 0],
			ArrowUp: [0, -1],
			ArrowDown: [0, 1]
		};
		if (steps[event.key]) {
			event.preventDefault();
			moveSelectedRoomItem(steps[event.key][0], steps[event.key][1]);
		}
	}

	function ensureRoomStyles() {
		if (document.getElementById('sebus-room-styles')) return;
		const style = document.createElement('style');
		style.id = 'sebus-room-styles';
		style.textContent = '' +
			'#sebus-room-overlay{position:fixed;inset:0;display:none;align-items:center;justify-content:center;padding:18px;background:rgba(3,6,10,.72);backdrop-filter:blur(6px);z-index:2147483647;}' +
			'#sebus-room-overlay.show{display:flex;}' +
			'#sebus-room-window{width:min(1400px,calc(100vw - 24px));max-height:calc(100vh - 24px);overflow:hidden;border-radius:24px;border:1px solid rgba(126,193,255,.28);box-shadow:0 28px 90px rgba(0,0,0,.45);background:linear-gradient(180deg,#08111b 0%,#060b12 100%);color:#eef7ff;font-family:Inter,ui-sans-serif,system-ui,sans-serif;}' +
			'#sebus-room-shell{display:grid;grid-template-columns:320px minmax(0,1fr) 280px;min-height:min(840px,calc(100vh - 24px));}' +
			'.sebus-room-pane{border-right:1px solid rgba(255,255,255,.06);padding:16px;overflow:auto;}' +
			'.sebus-room-pane:last-child{border-right:0;border-left:1px solid rgba(255,255,255,.06);}' +
			'.sebus-room-card{background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.07);border-radius:18px;box-shadow:inset 0 1px 0 rgba(255,255,255,.04);}' +
			'#sebus-room-left{display:grid;gap:14px;background:linear-gradient(180deg,rgba(9,18,28,.95),rgba(6,10,17,.98));}' +
			'#sebus-room-center{display:grid;grid-template-rows:auto auto 1fr;gap:14px;padding:16px;background:radial-gradient(circle at top,rgba(110,174,255,.12),transparent 38%),linear-gradient(180deg,#081019 0%,#050911 100%);}' +
			'#sebus-room-right{display:grid;grid-template-rows:auto auto 1fr;gap:12px;background:linear-gradient(180deg,rgba(8,14,22,.95),rgba(5,10,16,.99));}' +
			'#sebus-room-topbar{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding:16px 18px;border-bottom:1px solid rgba(255,255,255,.06);background:linear-gradient(180deg,rgba(255,255,255,.04),rgba(255,255,255,.02));}' +
			'#sebus-room-topbar h2{margin:0;font-size:26px;}' +
			'#sebus-room-owner{display:block;color:#9ed2ff;font-size:18px;margin-top:2px;}' +
			'#sebus-room-meta{display:block;color:#a7bfd6;font-size:13px;margin-top:6px;}' +
			'#sebus-room-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap;justify-content:flex-end;}' +
			'.sebus-room-btn{height:38px;padding:0 14px;border-radius:12px;border:1px solid rgba(133,202,255,.24);background:linear-gradient(180deg,rgba(33,58,87,.92),rgba(15,28,43,.92));color:#eaf6ff;font-weight:700;cursor:pointer;}' +
			'.sebus-room-btn:hover{filter:brightness(1.08);}' +
			'.sebus-room-btn:disabled{opacity:.45;cursor:not-allowed;filter:none;}' +
			'#sebus-room-mode{padding:7px 10px;border-radius:999px;background:rgba(142,183,255,.12);border:1px solid rgba(142,183,255,.2);font-size:12px;font-weight:700;color:#cde8ff;}' +
			'.sebus-room-section-title{font-size:13px;font-weight:800;letter-spacing:.08em;color:#9fd0ff;text-transform:uppercase;margin:0 0 8px 0;}' +
			'#sebus-room-left-note,#sebus-room-status{font-size:13px;line-height:1.45;color:#9db3c8;}' +
			'#sebus-room-shop-list{display:grid;gap:10px;}' +
			'.sebus-room-shop-card{display:grid;grid-template-columns:72px minmax(0,1fr) auto;gap:12px;align-items:center;padding:10px 12px;border-radius:16px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);}' +
			'.sebus-room-shop-icon{display:grid;place-items:center;width:72px;height:72px;border-radius:18px;background:linear-gradient(180deg,rgba(255,255,255,.08),rgba(255,255,255,.02));box-shadow:inset 0 1px 0 rgba(255,255,255,.12),0 10px 18px rgba(0,0,0,.16);overflow:hidden;}' +
			'.sebus-room-shop-icon-stage{position:relative;width:100%;height:100%;display:grid;place-items:center;background:radial-gradient(circle at 50% 20%,rgba(255,255,255,.08),transparent 40%);}' +
			'.sebus-room-shop-name{font-size:15px;font-weight:800;color:#f4fbff;}' +
			'.sebus-room-shop-meta{font-size:12px;color:#9db7ce;margin-top:3px;}' +
			'.sebus-room-shop-buy{height:38px;min-width:76px;padding:0 12px;border-radius:12px;border:1px solid rgba(115,255,184,.24);background:linear-gradient(180deg,rgba(33,105,71,.95),rgba(17,56,40,.95));color:#eafff4;font-weight:800;cursor:pointer;}' +
			'#sebus-room-board-wrap{position:relative;padding:14px;border-radius:22px;min-height:700px;background:radial-gradient(circle at top,rgba(158,220,255,.12),transparent 18%),linear-gradient(180deg,rgba(255,255,255,.03),rgba(255,255,255,.015));border:1px solid rgba(255,255,255,.07);overflow:hidden;}' +
			'#sebus-room-board{position:relative;width:100%;height:100%;min-height:672px;}' +
			'#sebus-room-stage-frame{position:relative;width:100%;height:672px;min-height:672px;border-radius:24px;overflow:hidden;background:radial-gradient(circle at 50% 14%,rgba(255,255,255,.07),transparent 22%),linear-gradient(180deg,#141b24 0%,#0d141d 100%);box-shadow:inset 0 0 0 1px rgba(141,184,255,.12), inset 0 24px 60px rgba(255,255,255,.03);}' +
			'#sebus-room-stage-frame::before{content:"";position:absolute;inset:12px;border-radius:20px;border:1px solid rgba(157,208,255,.14);pointer-events:none;}' +
			'#sebus-room-iso-world{position:relative;width:100%;height:100%;display:grid;place-items:center;padding:18px;overflow:hidden;}' +
			'#sebus-room-world-frame{position:relative;transform-origin:center center;filter:drop-shadow(0 28px 48px rgba(0,0,0,.34));will-change:transform;}' +
			'#sebus-room-svg,#sebus-room-furniture-layer{position:absolute;inset:0;overflow:visible;}' +
			'.sebus-room-item{position:absolute;transform:translate(-50%,-100%);touch-action:none;user-select:none;cursor:grab;outline:2px solid transparent;border-radius:18px;transition:filter .18s ease, outline-color .2s ease;}' +
			'.sebus-room-item.selected{outline-color:rgba(142,183,255,.8);}' +
			'.sebus-room-item.dragging{cursor:grabbing;filter:brightness(1.08) saturate(1.08);outline-color:rgba(155,242,209,.55);}' +
			'.sebus-room-item.blocked{outline-color:rgba(255,142,162,.85);}' +
			'.sebus-room-piece{position:relative;width:var(--room-piece-w);height:calc(var(--room-sprite-h) + var(--room-foot-h) + 34px);pointer-events:none;}' +
			'.sebus-room-footprint-shadow{position:absolute;left:50%;bottom:0;width:calc(var(--room-piece-w) * .92);height:calc(var(--room-foot-h) * .72);transform:translateX(-50%);border-radius:999px;background:rgba(0,0,0,.24);filter:blur(10px);}' +
			'.sebus-room-footprint{position:absolute;left:50%;bottom:0;width:var(--room-piece-w);height:var(--room-foot-h);transform:translateX(-50%);clip-path:polygon(var(--room-fp-top-x) 0%,100% var(--room-fp-right-y),var(--room-fp-bottom-x) 100%,0% var(--room-fp-left-y));background:var(--room-piece-fill);border:1px solid rgba(255,255,255,.14);box-shadow:inset 0 0 0 1px rgba(255,255,255,.04);opacity:.88;}' +
			'.sebus-room-footprint::before{content:"";position:absolute;inset:10% 12%;clip-path:polygon(var(--room-fp-top-x) 0%,100% var(--room-fp-right-y),var(--room-fp-bottom-x) 100%,0% var(--room-fp-left-y));background:linear-gradient(135deg,rgba(255,255,255,.26),transparent);opacity:.35;}' +
			'.sebus-room-sprite-anchor{position:absolute;left:50%;bottom:calc(var(--room-foot-h) * .22);width:var(--room-sprite-w);height:var(--room-sprite-h);transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;justify-content:flex-end;text-align:center;overflow:visible;pointer-events:none;}' +
			'.sebus-room-sprite-anchor>svg{flex:1 1 auto;min-height:0;width:100%;filter:drop-shadow(0 8px 18px rgba(0,0,0,.45)) drop-shadow(0 2px 6px rgba(0,0,0,.3));}' +
			'.sebus-room-item-name{flex-shrink:0;font-size:13px;font-weight:800;color:#fff;text-shadow:0 1px 6px rgba(0,0,0,.7),0 0 12px rgba(0,0,0,.5);margin-top:4px;white-space:nowrap;}' +
			'.sebus-room-item-size{flex-shrink:0;font-size:10px;opacity:.75;color:#cce8ff;margin-top:2px;letter-spacing:.06em;text-transform:uppercase;}' +
			'.sebus-room-model{display:flex;align-items:center;justify-content:center;width:100%;height:100%;pointer-events:none;}' +
			'.sebus-room-model svg{display:block;width:100%;height:100%;overflow:visible;}' +
			'#sebus-room-selected{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 14px;border-radius:18px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);}' +
			'#sebus-room-selected-meta{color:#cfe5fb;font-size:13px;}' +
			'#sebus-room-directory-list{display:grid;gap:10px;}' +
			'.sebus-room-visit-card{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 14px;border-radius:16px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03);color:#eaf6ff;cursor:pointer;text-align:left;}' +
			'.sebus-room-visit-card.active{border-color:rgba(142,183,255,.4);background:rgba(142,183,255,.12);}' +
			'.sebus-room-visit-copy{display:grid;gap:3px;}' +
			'.sebus-room-visit-copy strong{font-size:14px;}' +
			'.sebus-room-visit-copy small{font-size:12px;color:#aac1d7;}' +
			'.sebus-room-visit-icon{font-size:22px;}' +
			'.sebus-room-empty{padding:12px 14px;border-radius:16px;background:rgba(255,255,255,.03);border:1px dashed rgba(255,255,255,.08);font-size:13px;color:#a8bdd1;line-height:1.5;}' +
			'@media (max-width:1240px){#sebus-room-shell{grid-template-columns:290px minmax(0,1fr);}#sebus-room-right{grid-column:1 / -1;border-left:0;border-top:1px solid rgba(255,255,255,.06);grid-template-rows:auto auto 1fr;}}' +
			'@media (max-width:940px){#sebus-room-window{width:calc(100vw - 10px);max-height:calc(100vh - 10px);border-radius:18px;}#sebus-room-shell{grid-template-columns:1fr;}#sebus-room-left,#sebus-room-right{border-right:0;border-left:0;border-top:1px solid rgba(255,255,255,.06);}#sebus-room-board-wrap{min-height:560px;padding:10px;}#sebus-room-board{min-height:520px;}#sebus-room-stage-frame{height:520px;min-height:520px;}#sebus-room-iso-world{padding:8px;}#sebus-room-topbar{flex-direction:column;align-items:stretch;}}';
		document.head.appendChild(style);
	}

	function initRoomPanelIfNeeded() {
		if (roomPanelInitialized) return document.getElementById('sebus-room-overlay');
		ensureRoomStyles();
		roomPanelInitialized = true;
		const overlay = document.createElement('div');
		overlay.id = 'sebus-room-overlay';
		overlay.innerHTML = `
			<div id="sebus-room-window" role="dialog" aria-modal="true" aria-labelledby="sebus-room-name">
				<div id="sebus-room-topbar">
					<div>
						<h2 id="sebus-room-name">ROOM</h2>
						<span id="sebus-room-owner">Ladowanie...</span>
						<span id="sebus-room-meta">...</span>
					</div>
					<div id="sebus-room-actions">
						<div id="sebus-room-mode">Tryb edycji</div>
						<button class="sebus-room-btn" id="sebus-room-my-btn" type="button">🏠 Moj ROOM</button>
						<button class="sebus-room-btn" id="sebus-room-refresh-btn" type="button">↻ Odswiez</button>
						<button class="sebus-room-btn" id="sebus-room-close-btn" type="button">✕ Zamknij</button>
					</div>
				</div>
				<div id="sebus-room-shell">
					<aside id="sebus-room-left" class="sebus-room-pane">
						<div class="sebus-room-card" style="padding:14px 14px 12px;">
							<div class="sebus-room-section-title">Sklep</div>
							<div id="sebus-room-left-note">Kup mebel za baksy i przeciagaj go po planszy.</div>
						</div>
						<div id="sebus-room-shop-list"></div>
					</aside>
					<main id="sebus-room-center">
						<div id="sebus-room-selected">
							<div>
								<div class="sebus-room-section-title" style="margin-bottom:4px;">Zaznaczony przedmiot</div>
								<div id="sebus-room-selected-meta">Nic nie zaznaczono</div>
							</div>
							<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end;">
								<div class="sebus-room-btn" id="sebus-room-balance" style="display:flex;align-items:center;">0 💵</div>
								<button class="sebus-room-btn" id="sebus-room-remove-btn" type="button">🗑 Usun</button>
							</div>
						</div>
						<div id="sebus-room-status">Twoj prywatny ROOM synchronizuje sie z baza.</div>
						<div id="sebus-room-board-wrap" class="sebus-room-card">
							<div id="sebus-room-board"></div>
						</div>
					</main>
					<aside id="sebus-room-right" class="sebus-room-pane">
						<div class="sebus-room-card" style="padding:14px;">
							<div class="sebus-room-section-title">Pokoje graczy</div>
							<div style="font-size:13px;color:#9db3c8;line-height:1.45;">Po prawej widzisz zapisane ROOMY innych uzytkownikow. Kliknij domek, by odwiedzic ich plansze.</div>
						</div>
						<div id="sebus-room-directory-list"></div>
					</aside>
				</div>
			</div>`;
		document.body.appendChild(overlay);

		overlay.addEventListener('click', (event) => {
			if (event.target === overlay) closeRoomPanel();
			handleRoomOverlayClick(event);
		});
		overlay.addEventListener('pointerdown', handleRoomPointerDown);
		overlay.addEventListener('pointermove', moveRoomDrag);
		overlay.addEventListener('pointerup', endRoomDrag);
		overlay.addEventListener('pointercancel', endRoomDrag);
		overlay.querySelector('#sebus-room-close-btn')?.addEventListener('click', closeRoomPanel);
		overlay.querySelector('#sebus-room-my-btn')?.addEventListener('click', () => switchRoomView(getRuntimeUserId(), { forceRemote: true }));
		overlay.querySelector('#sebus-room-refresh-btn')?.addEventListener('click', () => {
			refreshRoomDirectory(true);
			switchRoomView(roomCurrentViewUserId || getRuntimeUserId(), { forceRemote: true });
		});
		overlay.querySelector('#sebus-room-remove-btn')?.addEventListener('click', removeSelectedRoomItem);
		document.addEventListener('keydown', handleRoomKeydown, true);
		window.addEventListener('resize', () => {
			if (!roomPanelOpen) return;
			updateRoomViewportScale();
		});
		return overlay;
	}

	function openRoomPanel(targetUserId = getRuntimeUserId()) {
		const overlay = initRoomPanelIfNeeded();
		if (!overlay) return;
		overlay.classList.add('show');
		roomPanelOpen = true;
		switchRoomView(targetUserId, { forceRemote: true });
		refreshRoomDirectory(false);
	}

	function closeRoomPanel() {
		const overlay = document.getElementById('sebus-room-overlay');
		if (overlay) overlay.classList.remove('show');
		roomPanelOpen = false;
		roomDragState = null;
		if (roomSyncTimer) {
			clearTimeout(roomSyncTimer);
			roomSyncTimer = 0;
		}
		if (isRoomEditable()) flushRoomStateSync();
	}

	function runRoomModule() {
		if (!appSettings.features.miniGames) {
			closeRoomPanel();
			return;
		}
		initRoomPanelIfNeeded();
	}

// Module: 77-logo-badge.js
// Purpose: Injects an animated 3D layered "ULTIMATE PACK" badge next to the forum logo

	const LOGO_BADGE_LAYERS = 20;
	const LOGO_BADGE_ID = 'sebus-logo-badge-stage';
	const LOGO_BADGE_FONT_ID = 'sebus-logo-badge-fonts';
	const LOGO_BADGE_STYLE_ID = 'sebus-logo-badge-styles';

	function ensureLogoBadgeFonts() {
		if (document.getElementById(LOGO_BADGE_FONT_ID)) return;
		const link = document.createElement('link');
		link.id = LOGO_BADGE_FONT_ID;
		link.rel = 'stylesheet';
		// Pacifico font — same as the reference code
		link.href = 'https://fonts.googleapis.com/css2?family=Pacifico&display=swap';
		(document.head || document.documentElement).appendChild(link);
	}

	function ensureLogoBadgeStyles() {
		if (document.getElementById(LOGO_BADGE_STYLE_ID)) return;
		const style = document.createElement('style');
		style.id = LOGO_BADGE_STYLE_ID;
		style.textContent =
			'#sebus-logo-badge-wrap{' +
				'display:inline-flex;align-items:center;justify-content:center;' +
				'vertical-align:middle;' +
				'position:relative;' +
				'pointer-events:none;' +
				'margin-left:10px;' +
				'flex-shrink:0;' +
			'}' +
			'#' + LOGO_BADGE_ID + '{' +
				'width:190px;' +
				'height:64px;' +
				'position:relative;' +
				'perspective:9999px;' +
				'transform-style:preserve-3d;' +
				'flex-shrink:0;' +
			'}' +
			'.sebus-badge-layer{' +
				'width:100%;' +
				'height:100%;' +
				'position:absolute;' +
				'top:0;left:0;' +
				'transform-style:preserve-3d;' +
				'animation:sebus-badge-tilt 5s infinite alternate ease-in-out;' +
				'animation-fill-mode:forwards;' +
				'transform:rotateY(40deg) rotateX(33deg) translateZ(0);' +
			'}' +
			'.sebus-badge-layer::after{' +
				'font:38px/1 "Pacifico",Futura,"Trebuchet MS",Helvetica,sans-serif;' +
				'content:"ULTIMATE\\a PACK";' +
				'white-space:pre;' +
				'text-align:center;' +
				'position:absolute;' +
				'top:4px;left:0;' +
				'width:100%;' +
				'height:100%;' +
				'color:whitesmoke;' +
				'letter-spacing:-1px;' +
				'text-shadow:4px 0 10px rgba(0,0,0,.13);' +
			'}' +
			// First layer — pure white, no stroke
			'.sebus-badge-layer:first-child::after{color:#fff;text-shadow:none;}' +
			// Layers 1–9: translateZ steps
			'.sebus-badge-layer:nth-child(1)::after{transform:translateZ(0px);}' +
			'.sebus-badge-layer:nth-child(2)::after{transform:translateZ(-1.5px);}' +
			'.sebus-badge-layer:nth-child(3)::after{transform:translateZ(-3px);}' +
			'.sebus-badge-layer:nth-child(4)::after{transform:translateZ(-4.5px);}' +
			'.sebus-badge-layer:nth-child(5)::after{transform:translateZ(-6px);}' +
			'.sebus-badge-layer:nth-child(6)::after{transform:translateZ(-7.5px);}' +
			'.sebus-badge-layer:nth-child(7)::after{transform:translateZ(-9px);}' +
			'.sebus-badge-layer:nth-child(8)::after{transform:translateZ(-10.5px);}' +
			'.sebus-badge-layer:nth-child(9)::after{transform:translateZ(-12px);}' +
			'.sebus-badge-layer:nth-child(10)::after{transform:translateZ(-13.5px);}' +
			'.sebus-badge-layer:nth-child(11)::after{transform:translateZ(-15px);}' +
			'.sebus-badge-layer:nth-child(12)::after{transform:translateZ(-16.5px);}' +
			'.sebus-badge-layer:nth-child(13)::after{transform:translateZ(-18px);}' +
			'.sebus-badge-layer:nth-child(14)::after{transform:translateZ(-19.5px);}' +
			'.sebus-badge-layer:nth-child(15)::after{transform:translateZ(-21px);}' +
			'.sebus-badge-layer:nth-child(16)::after{transform:translateZ(-22.5px);}' +
			'.sebus-badge-layer:nth-child(17)::after{transform:translateZ(-24px);}' +
			'.sebus-badge-layer:nth-child(18)::after{transform:translateZ(-25.5px);}' +
			'.sebus-badge-layer:nth-child(19)::after{transform:translateZ(-27px);}' +
			'.sebus-badge-layer:nth-child(20)::after{transform:translateZ(-28.5px);}' +
			// From layer 10 on: dark stroke
			'.sebus-badge-layer:nth-child(n+10)::after{-webkit-text-stroke:3px rgba(0,0,0,.25);}' +
			// From layer 11 on: dodgerblue stroke + shadow
			'.sebus-badge-layer:nth-child(n+11)::after{' +
				'-webkit-text-stroke:15px dodgerblue;' +
				'text-shadow:6px 0 6px #00366b,5px 5px 5px #002951,0 6px 6px #00366b;' +
			'}' +
			// From layer 12 on: brand blue stroke
			'.sebus-badge-layer:nth-child(n+12)::after{-webkit-text-stroke:15px #0077ea;}' +
			// Last layer: very subtle dark stroke
			'.sebus-badge-layer:last-child::after{-webkit-text-stroke:17px rgba(0,0,0,.1);}' +
			'@keyframes sebus-badge-tilt{' +
				'0%{transform:rotateY(40deg) rotateX(33deg) translateZ(0);}' +
				'100%{transform:rotateY(-40deg) rotateX(-43deg) translateZ(0);}' +
			'}';
		(document.head || document.documentElement).appendChild(style);
	}

	function buildLogoBadgeHtml() {
		const layers = Array.from({ length: LOGO_BADGE_LAYERS }, () => '<div class="sebus-badge-layer"></div>').join('');
		return `<span id="sebus-logo-badge-wrap"><span id="${LOGO_BADGE_ID}">${layers}</span></span>`;
	}

	function findLogoAnchor() {
		// IPS4 forum: logo is inside #ipsLayout_header, typically in .ipsLogo or #elLogo or an <a> with an <img> src containing 'logo'
		const selectors = [
			'#ipsLayout_header .ipsLogo',
			'#ipsLayout_header #elLogo',
			'#ipsLayout_header a[id*="logo" i]',
			'#ipsLayout_header a img[src*="logo" i]',
			'.ipsMasthead .ipsLogo',
			'.ipsMasthead a[id*="logo" i]',
			'.ipsLayout_headerPrimary .ipsLogo',
			'#header .logo',
			'#header a img',
			// Generic fallback: first link with a logo image in the site header area
			'header a img[src*="logo" i]',
			'header .logo',
		];
		for (const sel of selectors) {
			const el = document.querySelector(sel);
			if (el) {
				// Return the closest anchor or the element itself
				return el.closest('a') || el.parentElement || el;
			}
		}
		// Last resort: any element whose text is "MPC" or "MPCforum"
		const allLinks = Array.from(document.querySelectorAll('#ipsLayout_header a, .ipsMasthead a, header a'));
		for (const a of allLinks) {
			const text = (a.textContent || '').trim();
			if (/mpc/i.test(text) || a.querySelector('img')) {
				return a;
			}
		}
		return null;
	}

	function injectLogoBadge() {
		// Already injected
		if (document.getElementById(LOGO_BADGE_ID)) return;

		const anchor = findLogoAnchor();
		if (!anchor) return;

		ensureLogoBadgeFonts();
		ensureLogoBadgeStyles();

		const wrap = document.createElement('span');
		wrap.id = 'sebus-logo-badge-wrap';
		wrap.innerHTML = `<span id="${LOGO_BADGE_ID}">${Array.from({ length: LOGO_BADGE_LAYERS }, () => '<div class="sebus-badge-layer"></div>').join('')}</span>`;

		// Insert right after the logo anchor, or append to its parent
		const parent = anchor.parentElement;
		if (parent) {
			// Insert after the anchor
			const next = anchor.nextSibling;
			if (next) {
				parent.insertBefore(wrap, next);
			} else {
				parent.appendChild(wrap);
			}
		}
	}

	function runLogoBadgeModule() {
		if (!appSettings.features.goldSebus) return; // Tie to goldSebus feature flag (cosmetics)
		injectLogoBadge();
	}

// Module: 78-liquid-nav.js
// Purpose: Apple Liquid Glass bottom-left nav bar replacing the Menu Gier / Baksy Hub buttons

    const LIQUID_NAV_ID        = 'sebus-liquid-nav';
    const LIQUID_NAV_STYLE_ID  = 'sebus-liquid-nav-styles';

    // ── CSS ──────────────────────────────────────────────────────────────────
    function ensureLiquidNavStyles() {
        if (document.getElementById(LIQUID_NAV_STYLE_ID)) return;
        const style = document.createElement('style');
        style.id = LIQUID_NAV_STYLE_ID;
        style.textContent = `
/* Hide old toggle buttons from right side of screen */
#sebus-watch-toggle,
#sebus-gifparty-toggle,
#sebus-whiteboard-toggle {
    display: none !important;
}

/* Hide old panels positioning — they'll be repositioned */
#sebus-watch-panel,
#sebus-gifparty-panel,
#sebus-whiteboard-panel {
    display: none !important;
    bottom: 90px !important;
    right: auto !important;
    left: 14px !important;
}

/* Hide stare bottom-left buttons when liquid nav is active */
#sebus-baksy-league-open {
    display: none !important;
}

/* Hide old glowing Baksy Hub and Menu Gier buttons */
#sebus-baksy-hub-open,
#sebus-baksy-games-open {
    display: none !important;
}

/* Adjust existing button positions when liquid nav is active */
.sebus-lnav-hidden {
    display: none !important;
}

/* ── Liquid Glass Nav wrapper ─────────────────────────────────────────────── */
#${LIQUID_NAV_ID} {
    position: fixed;
    left: 14px;
    bottom: 14px;
    z-index: 2147483645;
    display: flex;
    align-items: center;
    padding: 8px;
    border-radius: 99px;
    background: rgba(30, 30, 35, 0.45);
    backdrop-filter: blur(50px) saturate(200%);
    -webkit-backdrop-filter: blur(50px) saturate(200%);
    box-shadow:
        0 40px 80px -20px rgba(0,0,0,0.8),
        0 10px 30px -10px rgba(0,0,0,0.8),
        inset 0 2px 3px -1px rgba(255,255,255,0.25),
        inset 0 -2px 4px -1px rgba(255,255,255,0.05),
        inset 0 0 0 1px rgba(255,255,255,0.15);
    transition: box-shadow 0.4s ease, opacity 0.3s ease;
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif;
    -webkit-font-smoothing: antialiased;
    user-select: none;
}
/* Upper reflection */
#${LIQUID_NAV_ID}::before {
    content: '';
    position: absolute;
    top: 1px; left: 1px; right: 1px; height: 46%;
    border-radius: 99px 99px 24px 24px / 99px 99px 12px 12px;
    background: linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 100%);
    pointer-events: none;
    z-index: 6;
}

/* Glare container */
#sebus-liquid-nav-glare-wrap {
    position: absolute;
    inset: 0;
    border-radius: 99px;
    overflow: hidden;
    pointer-events: none;
    z-index: 5;
}
#sebus-liquid-nav-glare {
    position: absolute;
    inset: 0;
    opacity: 0;
    transition: opacity 0.3s ease;
    background: radial-gradient(circle 90px at var(--x, 50%) var(--y, 50%), rgba(255,255,255,0.15) 0%, transparent 100%);
    mix-blend-mode: overlay;
}
#${LIQUID_NAV_ID}:hover #sebus-liquid-nav-glare { opacity: 1; }

/* Nav items */
#sebus-liquid-nav-items {
    position: relative;
    display: flex;
    gap: 4px;
    z-index: 3;
}

/* Sliding pill */
#sebus-liquid-nav-pill {
    position: absolute;
    top: 0; left: 0;
    height: 44px;
    background: rgba(60, 60, 65, 0.8);
    border-radius: 99px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.2);
    transition:
        transform 0.5s cubic-bezier(0.34, 1.2, 0.64, 1),
        width   0.5s cubic-bezier(0.34, 1.2, 0.64, 1),
        background 0.5s ease,
        box-shadow 0.5s ease;
    z-index: 1;
}

/* Buttons */
.sebus-lnav-btn {
    position: relative;
    background: transparent;
    border: none;
    padding: 0 18px;
    height: 44px;
    border-radius: 99px;
    font-family: inherit;
    font-size: 14px;
    font-weight: 600;
    color: rgba(255,255,255,0.5);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition: color 0.3s ease;
    outline: none;
    z-index: 2;
    white-space: nowrap;
}
.sebus-lnav-btn.active { color: #ffffff; }
.sebus-lnav-btn-content {
    display: flex;
    align-items: center;
    gap: 7px;
    pointer-events: none;
    transition: transform 0.2s cubic-bezier(0.32, 0.72, 0, 1);
}
.sebus-lnav-btn:active .sebus-lnav-btn-content { transform: scale(0.92); }

/* Divider */
#sebus-liquid-nav-divider {
    width: 1px;
    height: 24px;
    background: rgba(255,255,255,0.15);
    margin: 0 4px;
    z-index: 3;
    flex-shrink: 0;
}

/* Hide the original buttons when this nav is active */
#sebus-baksy-games-open.sebus-lnav-hidden,
#sebus-baksy-hub-open.sebus-lnav-hidden,
#sebus-baksy-league-open.sebus-lnav-hidden {
    display: none !important;
}

/* Position panels above the liquid nav bar (≈70px height + 14px gap) */
#sebus-main-games-nav {
    bottom: 94px !important;
    left: 14px !important;
}
#sebus-baksy-hub {
    bottom: 94px !important;
    right: auto !important;
    left: 14px !important;
}
#sebus-baksy-league {
    bottom: 94px !important;
    left: 14px !important;
}
#sebus-watch-panel {
    bottom: 94px !important;
    right: auto !important;
    left: 14px !important;
}
#sebus-gifparty-panel {
    bottom: 94px !important;
    right: auto !important;
    left: 14px !important;
}
#sebus-whiteboard-panel {
    bottom: 94px !important;
    right: auto !important;
    left: 14px !important;
}
        `;
        (document.head || document.documentElement).appendChild(style);
    }

    // ── SVG icons ────────────────────────────────────────────────────────
    const LNAV_ICON_GAMES    = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="4"/><line x1="12" y1="12" x2="12" y2="12.01"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="12" y1="8" x2="12" y2="16"/></svg>`;
    const LNAV_ICON_BAKSY    = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77 5.82 21.02 7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
    const LNAV_ICON_CLOSE    = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
    const LNAV_ICON_TABLE    = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3" y2="18"/><line x1="21" y1="6" x2="21" y2="18"/></svg>`;
    const LNAV_ICON_GIF      = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><circle cx="15.5" cy="8.5" r="1.5"/><path d="M8 15s1 2 4 2 4-2 4-2"/></svg>`;
    const LNAV_ICON_WATCH    = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>`;

    // ── Build & Inject ───────────────────────────────────────────────────────
    function buildLiquidNav() {
        if (document.getElementById(LIQUID_NAV_ID)) return;

        ensureLiquidNavStyles();

        const nav = document.createElement('nav');
        nav.id = LIQUID_NAV_ID;
        nav.innerHTML = `
            <div id="sebus-liquid-nav-glare-wrap">
                <div id="sebus-liquid-nav-glare"></div>
            </div>
            <div id="sebus-liquid-nav-items">
                <div id="sebus-liquid-nav-pill"></div>
                <button class="sebus-lnav-btn active" id="sebus-lnav-games" type="button">
                    <div class="sebus-lnav-btn-content">
                        ${LNAV_ICON_GAMES}<span>Menu Gier</span>
                    </div>
                </button>
                <button class="sebus-lnav-btn" id="sebus-lnav-baksy" type="button">
                    <div class="sebus-lnav-btn-content">
                        ${LNAV_ICON_BAKSY}<span>Baksy Hub</span>
                    </div>
                </button>
                <button class="sebus-lnav-btn" id="sebus-lnav-table" type="button">
                    <div class="sebus-lnav-btn-content">
                        ${LNAV_ICON_TABLE}<span>Tablica</span>
                    </div>
                </button>
                <button class="sebus-lnav-btn" id="sebus-lnav-gif" type="button">
                    <div class="sebus-lnav-btn-content">
                        ${LNAV_ICON_GIF}<span>GIF</span>
                    </div>
                </button>
                <button class="sebus-lnav-btn" id="sebus-lnav-watch" type="button">
                    <div class="sebus-lnav-btn-content">
                        ${LNAV_ICON_WATCH}<span>Watch</span>
                    </div>
                </button>
            </div>
            <div id="sebus-liquid-nav-divider"></div>
            <button class="sebus-lnav-btn" id="sebus-lnav-close" type="button" aria-label="Zamknij panel" style="padding:0 12px;min-width:44px;">
                <div class="sebus-lnav-btn-content">${LNAV_ICON_CLOSE}</div>
            </button>
        `;

        document.body.appendChild(nav);

        // Hide original buttons
        const origGames  = document.getElementById('sebus-baksy-games-open');
        const origBaksy  = document.getElementById('sebus-baksy-hub-open');
        const origLeague = document.getElementById('sebus-baksy-league-open');
        if (origGames)  origGames.classList.add('sebus-lnav-hidden');
        if (origBaksy)  origBaksy.classList.add('sebus-lnav-hidden');
        if (origLeague) origLeague.classList.add('sebus-lnav-hidden');

        initLiquidNavLogic(nav);
    }

    function initLiquidNavLogic(nav) {
        const pill      = nav.querySelector('#sebus-liquid-nav-pill');
        const glare     = nav.querySelector('#sebus-liquid-nav-glare');
        const btns      = nav.querySelectorAll('.sebus-lnav-btn:not(#sebus-lnav-close)');
        const closeBtn  = nav.querySelector('#sebus-lnav-close');

        // Sliding pill positioning
        function updatePill(btn, animate = true) {
            if (!btn) return;
            if (!animate) {
                pill.style.transition = 'none';
            } else {
                pill.style.transition = 'transform 0.5s cubic-bezier(0.34,1.2,0.64,1), width 0.5s cubic-bezier(0.34,1.2,0.64,1), background 0.5s ease, box-shadow 0.5s ease';
            }
            pill.style.width     = btn.offsetWidth + 'px';
            pill.style.transform = 'translateX(' + btn.offsetLeft + 'px)';
        }

        // Init pill position (after layout settle)
        const initBtn = nav.querySelector('.sebus-lnav-btn.active');
        if (initBtn) {
            setTimeout(() => {
                updatePill(initBtn, false);
                void pill.offsetWidth; // force reflow
            }, 60);
        }

        // Helper: close all panels
        function closeAllPanels() {
            const panels = [
                document.getElementById('sebus-main-games-nav'),
                document.getElementById('sebus-baksy-hub'),
                document.getElementById('sebus-baksy-league'),
                document.getElementById('sebus-hazard-panel'),
                document.getElementById('sebus-missions-panel'),
                document.getElementById('sebus-ranking-panel'),
                document.getElementById('sebus-watch-panel'),
                document.getElementById('sebus-gifparty-panel'),
                document.getElementById('sebus-whiteboard-panel'),
            ];
            panels.forEach(p => {
                if (p) {
                    p.style.display = 'none';
                    p.classList.remove('show');
                }
            });
        }

        // Button click logic
        btns.forEach(btn => {
            btn.addEventListener('click', () => {
                const wasActive = btn.classList.contains('active');
                btns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                updatePill(btn);

                if (btn.id === 'sebus-lnav-games') {
                    // Games menu
                    closeAllPanels();
                    const gamesNav = document.getElementById('sebus-main-games-nav');
                    if (gamesNav) gamesNav.style.display = gamesNav.style.display === 'none' ? 'block' : 'none';
                } else if (btn.id === 'sebus-lnav-baksy') {
                    // Baksy Hub
                    closeAllPanels();
                    const hub = document.getElementById('sebus-baksy-hub');
                    if (hub) hub.style.display = hub.style.display === 'none' ? 'block' : 'none';
                } else if (btn.id === 'sebus-lnav-table') {
                    // Tablica (Whiteboard)
                    closeAllPanels();
                    const whiteboardPanel = document.getElementById('sebus-whiteboard-panel');
                    if (whiteboardPanel) whiteboardPanel.style.display = 'block';
                } else if (btn.id === 'sebus-lnav-gif') {
                    // GIF Party
                    closeAllPanels();
                    const gifPanel = document.getElementById('sebus-gifparty-panel');
                    if (gifPanel) gifPanel.style.display = 'block';
                } else if (btn.id === 'sebus-lnav-watch') {
                    // Watch Together
                    closeAllPanels();
                    const watchPanel = document.getElementById('sebus-watch-panel');
                    if (watchPanel) watchPanel.style.display = 'block';
                }
            });
        });

        // Close button
        closeBtn.addEventListener('click', () => {
            closeAllPanels();
        });

        // Window resize → reposition pill
        window.addEventListener('resize', () => {
            const active = nav.querySelector('.sebus-lnav-btn.active');
            if (active) updatePill(active, false);
        }, { passive: true });

        // Interactive liquid glare
        nav.addEventListener('mousemove', e => {
            const rect = nav.getBoundingClientRect();
            glare.style.setProperty('--x', (e.clientX - rect.left) + 'px');
            glare.style.setProperty('--y', (e.clientY - rect.top)  + 'px');
        }, { passive: true });
    }

    // ── Module entry point ───────────────────────────────────────────────────
    function runLiquidNavModule() {
        // Requires at least one of these features
        if (!appSettings.features.baksy && !appSettings.features.miniGames && !appSettings.features.mmoChat) return;

        buildLiquidNav();

        // Keep original buttons hidden in case they were re-created by baksy module
        setTimeout(() => {
            ['sebus-baksy-games-open', 'sebus-baksy-hub-open', 'sebus-baksy-league-open'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.classList.add('sebus-lnav-hidden');
            });
        }, 300);
    }

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
        // Trigger Firebase sync and pull to ensure other users see the new guild
        setTimeout(() => pullSharedMmoStateIfNeeded(true), 500);
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

        // Posty na forum (artykuły z data-commentid napisane przez mnie)
        let postsFound = 0;
        document.querySelectorAll('article[data-commentid], .cPost, .ipsComment').forEach(post => {
            const authorEl = post.querySelector(`[data-memberid="${myId}"], [data-mentionid="${myId}"]`);
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

// Module: 90-bootstrap.js
// Source: e:\mpcforum-userscript\skrypt:14000-14113
// Purpose: Module registry, reactive runner and bootstrap

    const MODULE_TASKS = {
        settingsPanel: { debounceMs: 60, run: runSettingsPanelModule },
        ghostCurtain: { debounceMs: 180, run: runGhostCurtainModule },
        chatEnhancements: { debounceMs: 140, run: runChatEnhancementsModule },
        stickyNotes: { debounceMs: 160, run: runStickyNotesModule },
        baksy: { debounceMs: 220, run: runBaksyModule },
        avatarGlow: { debounceMs: 180, run: runAvatarGlowModule },
        goldSebus: { debounceMs: 240, run: runGoldSebusModule },
        nickGlow: { debounceMs: 180, run: runNickGlowModule },
        realTimeActivity: { debounceMs: 220, run: runRealTimeActivityModule },
        editorStats: { debounceMs: 120, run: runEditorStatsModule },
        chatTools: { debounceMs: 140, run: runChatToolsModule },
        radio: { debounceMs: 120, run: runRadioModule },
        watchTogether: { debounceMs: 160, run: runWatchModule },
        miniGames:     { debounceMs: 200, run: runGamesModule },
        snejk:         { debounceMs: 180, run: runSnejkModule },
        room:          { debounceMs: 180, run: runRoomModule },
        logoBadge:     { debounceMs: 240, run: runLogoBadgeModule },
        liquidNav:     { debounceMs: 260, run: runLiquidNavModule },
        gifParty:      { debounceMs: 180, run: runGifPartyModule },
        whiteboard:    { debounceMs: 200, run: runWhiteboardModule },
        iframeFixes: { debounceMs: 260, run: runIframeFixesModule },
        audioEmbeds: { debounceMs: 260, run: runAudioEmbedsModule }
    };

    const PERIODIC_MODULES = ['ghostCurtain', 'realTimeActivity', 'baksy'];

    function collectModulesForMutations(mutations) {
        const moduleNames = new Set();

        mutations.forEach(mutation => {
            const target = mutation.target?.nodeType === Node.ELEMENT_NODE ? mutation.target : mutation.target?.parentElement;
            if (!target || !document.body) return;
            if (target.closest('#sebus-settings-panel, #sebus-settings-open, #sebus-mini-radio, #custom-gif-picker, #custom-mp3-picker')) return;

            if (target.closest('.ck-editor, .ck-editor__editable, [contenteditable="true"], .ipsComposeArea')) {
                moduleNames.add('editorStats');
            }

            if (target.closest('#chatboxWrap, #chatcontent, .cChatBox, .cChatBox_message')) {
                moduleNames.add('chatEnhancements');
                moduleNames.add('stickyNotes');
                moduleNames.add('baksy');
                moduleNames.add('avatarGlow');
                moduleNames.add('goldSebus');
                moduleNames.add('nickGlow');
                moduleNames.add('chatTools');
                moduleNames.add('audioEmbeds');
            }

            if (target.closest('article[id^="elComment_"], [data-commentid], .ipsComment, .cPost')) {
                moduleNames.add('baksy');
            }

            if (target.closest('#elOnlineUsers, [id*="OnlineUsers"], [class*="OnlineUsers"], [data-blockid*="online"], [data-blockID*="online"]')) {
                moduleNames.add('realTimeActivity');
            }

            if (mutation.type !== 'childList') return;

            const changedNodes = [...mutation.addedNodes, ...mutation.removedNodes].filter(node => node.nodeType === Node.ELEMENT_NODE);
            if (!changedNodes.length) return;

            moduleNames.add('settingsPanel');
            moduleNames.add('ghostCurtain');
            moduleNames.add('baksy');
            moduleNames.add('avatarGlow');
            moduleNames.add('goldSebus');
            moduleNames.add('nickGlow');

            changedNodes.forEach(node => {
                if (node.matches?.('iframe, iframe[src*="youtube"], iframe[src*="youtube-nocookie"]') || node.querySelector?.('iframe')) {
                    moduleNames.add('iframeFixes');
                }

                if (node.matches?.('a[href$=".mp3"], a[href*=".mp3?"], audio') || node.querySelector?.('a[href$=".mp3"], a[href*=".mp3?"], audio')) {
                    moduleNames.add('audioEmbeds');
                }
            });
        });

        return Array.from(moduleNames);
    }

    let reactiveRunnerInitialized = false;
    function initReactiveRunner() {
        if (reactiveRunnerInitialized) return;
        reactiveRunnerInitialized = true;

        const observerTarget = document.body || document.documentElement;
        if (observerTarget) {
            domObserver = new MutationObserver(mutations => {
                const modules = collectModulesForMutations(mutations);
                if (modules.length) scheduleModules(modules);
            });
            domObserver.observe(observerTarget, { childList: true, subtree: true, characterData: true });
        }

        window.addEventListener('resize', () => scheduleModules(['ghostCurtain', 'radio'], { delayMs: 120 }), { passive: true });
        window.addEventListener('scroll', () => scheduleModule('radio', { delayMs: 120 }), { passive: true });
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                getRuntimeUserId(true);
                scheduleAllModules({ immediate: true });
            }
        });

        setInterval(() => {
            scheduleModules(PERIODIC_MODULES, { immediate: true });
        }, 5000);
    }

    initReactiveRunner();
    hydrateFromFirebase();
    scheduleAllModules({ immediate: true });

})();

