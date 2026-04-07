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
