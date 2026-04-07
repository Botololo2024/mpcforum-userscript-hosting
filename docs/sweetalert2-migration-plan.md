# Plan wdrożenia SweetAlert2 (MMO-RPG UI)

## Cel
Ujednolicić wszystkie dialogi i komunikaty w userscripcie do jednej warstwy UX opartej o SweetAlert2, z klimatem MMO-RPG (złoto, ciemne tło, neonowe akcenty), bez ryzyka regresji logiki gry.

## Co już wiemy z dokumentacji SweetAlert2
- `Swal.fire(...)` jako podstawowy modal (confirm/info/error/success).
- `toast: true` + `position` + `timer` do krótkich powiadomień.
- `Swal.mixin(...)` do stworzenia spójnego, projektowego API.
- `customClass` + własny CSS do pełnego skina MMO-RPG.
- `preConfirm`/`inputValidator` do formularzy i walidacji.
- Hooki cyklu życia: `didOpen`, `willClose`, `didDestroy`.
- Kontrola dostępności i klawiatury (`allowEscapeKey`, focus, aria labels).

## Mapa miejsc do migracji (repo)

### 1) Obecne custom popupy/panele
- `src/modules/50-dom-ui-foundation.js:93` — styl `.sebus-popup` (legacy modal).
- `src/modules/50-dom-ui-foundation.js:2026` — `#custom-gif-picker`.
- `src/modules/50-dom-ui-foundation.js:2043` — `#custom-mp3-picker`.
- `src/modules/60-media-chat-tools.js:274` — ręczne zamykanie popupów kliknięciem poza.

### 2) Natywne `alert/prompt` (najlepszy szybki zysk)
- `src/modules/80-baksy-mmo-advanced.js:2454`
- `src/modules/80-baksy-mmo-advanced.js:4633`
- `src/modules/80-baksy-mmo-advanced.js:4648`
- `src/modules/80-baksy-mmo-advanced.js:4660`
- `src/modules/80-baksy-mmo-advanced.js:4667`
- `src/modules/80-baksy-mmo-advanced.js:5114` (`window.prompt` URL obrazka)
- `src/modules/80-baksy-mmo-advanced.js:5118` (`window.prompt` URL YouTube)

### 3) Duże panele MMO (migracja etapowa, nie 1:1 od razu)
- `initAdvancedLeaguePanelIfNeeded` (`80-baksy-mmo-advanced.js:1499`)
- `initAdvancedMarketPanelIfNeeded` (`1669`)
- `initAdvancedWorldBossPanelIfNeeded` (`1907`)
- `initAdvancedGuildPanelIfNeeded` (`2096`)
- `initAdvancedJackpotPanelIfNeeded` (`2550`)
- `initAdvancedTreasureHuntPanelIfNeeded` (`2711`)
- `initAdvancedAuctionPanelIfNeeded` (`2902`)
- `initBaksyAdminPanelIfNeeded` (`3210`)
- `initBaksyHubIfNeeded` (`4099`)
- `initHazardPanelIfNeeded` (`4257`)
- `initMissionsPanelIfNeeded` (`4447`)
- `initMmoChatPanelIfNeeded` (`4810`)
- `initRankingPanelIfNeeded` (`5215`)

## Proponowana architektura integracji

### A. Warstwa adaptera (jedno API dla całego projektu)
Nowy moduł: `src/modules/55-swal-ui.js`

Eksportowane helpery (globalne, jak reszta projektu):
- `uiNotify(message, type = 'info', options = {})` — toast.
- `uiAlert(title, text, type = 'info', options = {})` — modal informacyjny.
- `uiConfirm({ title, text, confirmText, cancelText, danger }) => Promise<boolean>`.
- `uiPrompt({ title, inputLabel, placeholder, inputType }) => Promise<string|null>`.
- `uiForm({ title, html, preConfirm }) => Promise<any>`.

Dzięki temu migracja odbywa się przez podmianę wywołań, bez naruszania logiki domenowej.

### B. Jeden motyw MMO-RPG
- Dodać klasę bazową np. `sebus-swal-theme` przez `customClass.popup`.
- Trzymać styl w `src/modules/50-dom-ui-foundation.js` (spójnie z resztą CSS).
- Paleta:
  - tło: grafit/czerń,
  - obramowanie: złoto,
  - akcje pozytywne: bursztyn/złoto,
  - akcje niebezpieczne: czerwony.

### C. Strategia ładowania biblioteki
Dla userscriptu najprościej i najstabilniej:
- loader dynamiczny z CDN (jsDelivr) + lazy init,
- cache w `window.Swal`,
- bez blokowania startu modułów (import na pierwsze użycie helpera).

Alternatywa: dopisanie `@require` tylko do wariantu require-loader (bardziej sztywne, mniej elastyczne).

## Plan wdrożenia (etapy)

## Etap 0 — Fundament (niski risk)
1. Dodać `55-swal-ui.js` z adapterem i lazy loaderem.
2. Dodać skin MMO-RPG (CSS + `customClass`).
3. Dodać fallback: jeśli SweetAlert2 się nie załaduje, helper używa `alert/confirm/prompt`.

**Kryterium akceptacji:** brak regressji przy braku internetu/CDN.

## Etap 1 — Szybkie migracje natywnych popupów
Podmienić wszystkie `alert(...)` i `window.prompt(...)` z modułu `80-baksy-mmo-advanced.js` na helpery adaptera.

**Kryterium akceptacji:** te same ścieżki logiki, ale nowy wygląd i spójny UX.

## Etap 2 — Toasty statusowe
W miejscach krótkich statusów (`set...Status`) dodać opcjonalny tryb toast (nie wszędzie, tylko gdzie komunikat jest akcyjny i krótkotrwały).

Priorytet:
- `70-watch-games-panels.js`
- `60-media-chat-tools.js`
- `30-radio-core.js`

**Kryterium akceptacji:** brak spamowania; max 1-2 toasty na akcję.

## Etap 3 — Migracja lekkich popupów (GIF/MP3)
- Zamienić `#custom-gif-picker` i `#custom-mp3-picker` na `Swal.fire({ html: ... })`.
- Zachować istniejącą logikę renderowania list i eventów (przenieść tylko kontener).

**Kryterium akceptacji:** identyczna funkcjonalność + pełna kontrola zamykania/focusu.

## Etap 4 — Panele MMO (hybryda)
Nie przerabiać od razu wszystkich paneli na modal.
- Zostawić duże dashboardy jako własne panele (lepsza ergonomia).
- SweetAlert2 używać dla akcji punktowych: confirm, reward, błędy, wybory, krótkie formularze.

**Kryterium akceptacji:** UX nowoczesny, ale bez utraty „centrum dowodzenia”.

## Etap 5 — UX polish i telemetria jakości
- Ujednolicić copywriting komunikatów (styl RPG, krótsze teksty).
- Ograniczyć „podwójne komunikaty” (status + modal o tym samym).
- Sprawdzić mobilne viewporty i ESC/outside-click behavior.

## Ryzyka i zabezpieczenia
- **Ryzyko:** CDN niedostępny.  
  **Mitigacja:** fallback do natywnych popupów.
- **Ryzyko:** za dużo toastów.  
  **Mitigacja:** centralny throttling/deduplikacja w adapterze.
- **Ryzyko:** konflikty stylu z IPS/mpcforum.  
  **Mitigacja:** prefiksowane klasy `sebus-swal-*` + scoped CSS.

## Minimalny backlog implementacyjny
1. `src/modules/55-swal-ui.js` (nowy)
2. `config/module-map.json` (dopisanie modułu 55 w kolejności po 50)
3. `src/modules/80-baksy-mmo-advanced.js` (zamiana `alert/prompt`)
4. `src/modules/50-dom-ui-foundation.js` (styl `sebus-swal-theme`)
5. `tools/build.ps1` + rebuild dist

## Definicja ukończenia (DoD)
- Wszystkie `alert/prompt` zidentyfikowane w module 80 zastąpione helperami.
- Jeden spójny theme SweetAlert2 dla całego skryptu.
- Działanie potwierdzone w `dist/mpcforum-sebus-pack.user.js` i `dist/mpcforum-loader.user.js`.
- Brak nowych błędów składniowych i brak regresji krytycznych flow (chat, misje, aukcja, GIF/MP3).
