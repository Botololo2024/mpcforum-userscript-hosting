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
