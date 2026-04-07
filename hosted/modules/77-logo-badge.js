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
