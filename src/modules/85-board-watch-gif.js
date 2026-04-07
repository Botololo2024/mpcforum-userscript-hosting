// src/modules/85-board-watch-gif.js
// Wspólny moduł: Tablica, Watch, GIF
// Nowoczesne HTML5 rozwiązania

(function(){
    // --- Panel główny ---
    function ensureBoardWatchGifPanel() {
        let panel = document.getElementById('sebus-board-watch-gif-panel');
        if (panel) return panel;
        panel = document.createElement('div');
        panel.id = 'sebus-board-watch-gif-panel';
        panel.className = 'sebus-mp-panel';
        panel.style.cssText = 'bottom:120px;left:440px;z-index:2147483642;min-width:420px;max-width:700px;display:none;background:#181818;border-radius:14px;padding:0 0 12px 0;box-shadow:0 8px 32px #000a;';
        panel.innerHTML = `
            <div style="display:flex;gap:8px;padding:12px 12px 0 12px;">
                <button id="bw-tab-board" class="sebus-mp-btn" style="flex:1;">📝 Tablica</button>
                <button id="bw-tab-watch" class="sebus-mp-btn" style="flex:1;">🎬 Watch</button>
                <button id="bw-tab-gif" class="sebus-mp-btn" style="flex:1;">🖼️ GIF</button>
            </div>
            <div id="bw-content-board" style="display:block;padding:12px;"></div>
            <div id="bw-content-watch" style="display:none;padding:12px;"></div>
            <div id="bw-content-gif" style="display:none;padding:12px;"></div>
        `;
        document.body.appendChild(panel);
        // Tab switching
        panel.querySelector('#bw-tab-board').onclick = () => showTab('board');
        panel.querySelector('#bw-tab-watch').onclick = () => showTab('watch');
        panel.querySelector('#bw-tab-gif').onclick = () => showTab('gif');
        function showTab(tab) {
            panel.querySelector('#bw-content-board').style.display = tab==='board'?'block':'none';
            panel.querySelector('#bw-content-watch').style.display = tab==='watch'?'block':'none';
            panel.querySelector('#bw-content-gif').style.display = tab==='gif'?'block':'none';
        }
        // Inicjalizacja podpaneli
        initBoard(panel.querySelector('#bw-content-board'));
        initWatch(panel.querySelector('#bw-content-watch'));
        initGif(panel.querySelector('#bw-content-gif'));
        return panel;
    }

    // --- Tablica ---
    function initBoard(container) {
        container.innerHTML = `<h3>📝 Tablica (Sticky Notes & Canvas)</h3>
        <div id="bw-board-canvas-wrap" style="border:1px solid #444;background:#222;border-radius:8px;min-height:220px;position:relative;overflow:auto;"></div>
        <button id="bw-board-add-note" class="sebus-mp-btn" style="margin-top:8px;">Dodaj notatkę</button>
        <button id="bw-board-clear" class="sebus-mp-btn" style="margin-top:8px;">Wyczyść tablicę</button>`;
        const wrap = container.querySelector('#bw-board-canvas-wrap');
        // Canvas
        const canvas = document.createElement('canvas');
        canvas.width = 600; canvas.height = 220;
        canvas.style.background = '#191919';
        canvas.style.borderRadius = '8px';
        wrap.appendChild(canvas);
        const ctx = canvas.getContext('2d');
        let drawing = false;
        canvas.onmousedown = e => { drawing = true; ctx.beginPath(); ctx.moveTo(e.offsetX, e.offsetY); };
        canvas.onmousemove = e => { if(drawing){ ctx.lineTo(e.offsetX, e.offsetY); ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 2; ctx.stroke(); } };
        canvas.onmouseup = () => { drawing = false; };
        canvas.onmouseleave = () => { drawing = false; };
        // Sticky notes
        function addNote(txt='') {
            const note = document.createElement('textarea');
            note.className = 'bw-note';
            note.value = txt;
            note.style.cssText = 'position:absolute;top:10px;left:10px;width:120px;height:60px;background:#fffbe8;color:#222;border-radius:6px;border:1px solid #e2c96d;padding:6px;resize:both;z-index:10;box-shadow:2px 2px 8px #0002;';
            note.onmousedown = e => { note.dataset.drag = '1'; note.dataset.ox = e.offsetX; note.dataset.oy = e.offsetY; };
            note.onmouseup = () => { note.dataset.drag = ''; };
            note.onmousemove = e => { if(note.dataset.drag==='1'){ note.style.left = (e.pageX - wrap.offsetLeft - note.dataset.ox*1) + 'px'; note.style.top = (e.pageY - wrap.offsetTop - note.dataset.oy*1) + 'px'; } };
            wrap.appendChild(note);
        }
        container.querySelector('#bw-board-add-note').onclick = () => addNote();
        container.querySelector('#bw-board-clear').onclick = () => { wrap.innerHTML = ''; wrap.appendChild(canvas); };
    }

    // --- Watch ---
    function initWatch(container) {
        container.innerHTML = `<h3>🎬 Watch (Wspólne oglądanie)</h3>
        <input id="bw-watch-url" type="text" placeholder="Wklej link do filmu (YouTube/mp4)" style="width:70%;margin-bottom:8px;">
        <button id="bw-watch-load" class="sebus-mp-btn">Załaduj</button>
        <div id="bw-watch-player" style="margin-top:12px;"></div>`;
        container.querySelector('#bw-watch-load').onclick = () => {
            const url = container.querySelector('#bw-watch-url').value.trim();
            const player = container.querySelector('#bw-watch-player');
            if(url.includes('youtube.com')||url.includes('youtu.be')){
                // YouTube embed
                let vid = url.split('v=')[1]||'';
                if(url.includes('youtu.be/')) vid = url.split('youtu.be/')[1];
                vid = vid.split('&')[0];
                player.innerHTML = `<iframe width='420' height='236' src='https://www.youtube.com/embed/${vid}' frameborder='0' allowfullscreen></iframe>`;
            }else if(url.match(/\.(mp4|webm|ogg)$/i)){
                player.innerHTML = `<video src='${url}' controls style='width:420px;max-width:100%;border-radius:8px;background:#000;'></video>`;
            }else{
                player.innerHTML = `<div style='color:#f66;'>Nieobsługiwany link.</div>`;
            }
        };
    }

    // --- GIF ---
    function initGif(container) {
        container.innerHTML = `<h3>🖼️ GIF (Wyszukiwarka i kreator)</h3>
        <input id="bw-gif-query" type="text" placeholder="Szukaj GIFów (Giphy)" style="width:60%;margin-bottom:8px;">
        <button id="bw-gif-search" class="sebus-mp-btn">Szukaj</button>
        <div id="bw-gif-results" style="margin-top:12px;display:flex;flex-wrap:wrap;gap:8px;"></div>`;
        container.querySelector('#bw-gif-search').onclick = async () => {
            const q = container.querySelector('#bw-gif-query').value.trim();
            const results = container.querySelector('#bw-gif-results');
            results.innerHTML = '⏳ Szukanie...';
            if(!q) { results.innerHTML = 'Podaj frazę.'; return; }
            // Giphy API (public beta key)
            const apikey = 'dc6zaTOxFJmzC';
            const url = `https://api.giphy.com/v1/gifs/search?api_key=${apikey}&q=${encodeURIComponent(q)}&limit=12&rating=g`;
            const res = await fetch(url).then(r=>r.json());
            results.innerHTML = '';
            (res.data||[]).forEach(gif=>{
                const img = document.createElement('img');
                img.src = gif.images.fixed_height.url;
                img.style.cssText = 'width:120px;height:90px;object-fit:cover;border-radius:8px;cursor:pointer;box-shadow:0 2px 8px #0003;';
                img.title = gif.title;
                results.appendChild(img);
            });
        };
    }

    // --- Eksport do globalnego scope ---
    window.ensureBoardWatchGifPanel = ensureBoardWatchGifPanel;
})();
