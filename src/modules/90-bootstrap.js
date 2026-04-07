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

