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