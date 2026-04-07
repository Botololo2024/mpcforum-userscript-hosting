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
