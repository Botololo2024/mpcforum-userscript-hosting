# MPCForum userscript — modularna wersja

Ten katalog zawiera modularny podział istniejącego userscriptu z `E:\skrypt`.

## Co tu jest

- `config/module-map.json` — mapa logicznych modułów i zakresów linii z oryginalnego pliku.
- `tools/split-source.ps1` — dzieli `E:\skrypt` na moduły w `src/modules/`.
- `tools/build.ps1` — składa moduły do jednego pliku release oraz generuje loader developerski.
- `dist/mpcforum-sebus-pack.user.js` — finalny bundle do Tampermonkey.
- `dist/mpcforum-loader.user.js` — loader developerski pobierający moduły z hostingu i pokazujący postęp.

## Co jest czym

- `dist/mpcforum-sebus-pack.user.js` — to jest gotowy plik do instalacji w Tampermonkey, bez hostowania czegokolwiek.
- `dist/mpcforum-loader.user.js` — to też instalujesz do Tampermonkey, ale on sam pobiera moduły z internetu.
- `src/wrapper-start.js` — hostujesz.
- `src/modules/*.js` — hostujesz.
- `src/wrapper-end.js` — hostujesz.
- `src/userscript-header.txt` — nie hostujesz do loadera; jest tylko do budowania pojedynczego bundle.

## Szybki start

1. Wygeneruj moduły z aktualnego pliku źródłowego:

```powershell
powershell -ExecutionPolicy Bypass -File "E:\mpcforum-userscript\tools\split-source.ps1"
```

2. Zbuduj finalny userscript oraz loader:

```powershell
powershell -ExecutionPolicy Bypass -File "E:\mpcforum-userscript\tools\build.ps1"
```

3. Zainstaluj w Tampermonkey plik:

- `E:\mpcforum-userscript\dist\mpcforum-sebus-pack.user.js` — produkcyjnie
- `E:\mpcforum-userscript\dist\mpcforum-loader.user.js` — do dev/testów z hostowanych modułów

## Hosting modułów pod loader

Loader pobiera kolejno pliki z `BASE_URL`. Najwygodniej hostować zawartość `src/` jako statyczne pliki, np. na:

- GitHub Pages
- Cloudflare Pages
- jsDelivr (na bazie repo)
- własnym serwerze/CDN

Loader pobiera:

- `wrapper-start.js`
- `modules/*.js`
- `wrapper-end.js`

### Wariant rekomendowany: publiczne repo GitHub (`raw.githubusercontent.com`)

Hostowane pliki są kopiowane do katalogu `hosted/`:

- `hosted/wrapper-start.js`
- `hosted/modules/*.js`
- `hosted/wrapper-end.js`

Jednorazowy setup (repo + konfiguracja URL + opcjonalny pierwszy push):

```powershell
powershell -ExecutionPolicy Bypass -File "E:\mpcforum-userscript\tools\setup-github-hosting.ps1" -RepoName "mpcforum-userscript-hosting" -Branch "main" -Push
```

Skrypt:

- zakłada publiczne repo na Twoim koncie,
- synchronizuje `src/` -> `hosted/`,
- generuje `config/hosted-modules.json` z URL `raw.githubusercontent.com`,
- ustawia `origin` i wykonuje commit/push (gdy podasz `-Push`).

Po setupie loader korzysta z URL z `config/hosted-modules.json`.

## Build z własnym URL modułów

Jeśli chcesz używać loadera, zbuduj go z własnym adresem hostingu:

```powershell
powershell -ExecutionPolicy Bypass -File "E:\mpcforum-userscript\tools\build.ps1" -BaseUrl "https://twoj-host.example.com/mpcforum-userscript/src"
```

## Build z linkami `gist raw`

1. Utwórz `config/hosted-modules.json` na podstawie template.
2. Wklej swoje linki `raw`.
3. Zbuduj loader:

```powershell
powershell -ExecutionPolicy Bypass -File "E:\mpcforum-userscript\tools\build.ps1" -HostedModulesConfig "E:\mpcforum-userscript\config\hosted-modules.json"
```

Wtedy instalujesz w Tampermonkey plik `dist/mpcforum-loader.user.js`.

## Aktualizacje GitHub (bez wrzucania wszystkich plików)

Do codziennej pracy używaj:

```powershell
powershell -ExecutionPolicy Bypass -File "E:\mpcforum-userscript\tools\publish-github.ps1" -ProjectRoot "E:\mpcforum-userscript" -Branch "main" -CommitMessage "feat: opis zmian"
```

Skrypt robi automatycznie:

- sync `src/` -> `hosted/`,
- build `dist/`,
- `git add/commit/push` tylko zmian,
- push przez token z `GITHUB_TOKEN`, `GH_TOKEN` albo `token.txt`.

Git i tak przesyła tylko różnice, więc nie wysyłasz „całości” za każdym razem.

### Token GitHub

Potrzebujesz tokena GitHub z dostępem do gistów:

- classic PAT: scope `gist`
- fine-grained token: uprawnienie do `Gists` z zapisem

Najwygodniej ustaw zmienną środowiskową:

```powershell
$env:GITHUB_TOKEN = "twoj_token_github"
```

Albo wpisz token do lokalnego pliku `token.txt` w katalogu projektu:

```text
E:\mpcforum-userscript\token.txt
```

W pliku ma być tylko sam token w jednej linii. `token.txt` jest ignorowany przez git.

### Test bez uploadu (stary workflow gist)

```powershell
e:/mpcforum-userscript/.venv/Scripts/python.exe "E:\mpcforum-userscript\tools\publish_gists.py" --dry-run
```

### Właściwa publikacja (stary workflow gist)

```powershell
e:/mpcforum-userscript/.venv/Scripts/python.exe "E:\mpcforum-userscript\tools\publish_gists.py"
```

### Typowy workflow (stary workflow gist)

```powershell
powershell -ExecutionPolicy Bypass -File "E:\mpcforum-userscript\tools\split-source.ps1" -ProjectRoot "E:\mpcforum-userscript"
e:/mpcforum-userscript/.venv/Scripts/python.exe "E:\mpcforum-userscript\tools\verify_modules.py" --check-bundle
e:/mpcforum-userscript/.venv/Scripts/python.exe "E:\mpcforum-userscript\tools\publish_gists.py"
powershell -ExecutionPolicy Bypass -File "E:\mpcforum-userscript\tools\build.ps1" -ProjectRoot "E:\mpcforum-userscript"
```

Skrypt działa zarówno dla:

- osobnych gistów per plik,
- jednego gista wieloplikowego,
- konfiguracji z `wrapper-end.js` albo bez niego.

## Szybki workflow dzienny (GitHub)

```powershell
powershell -ExecutionPolicy Bypass -File "E:\mpcforum-userscript\tools\split-source.ps1" -ProjectRoot "E:\mpcforum-userscript"
powershell -ExecutionPolicy Bypass -File "E:\mpcforum-userscript\tools\publish-github.ps1" -ProjectRoot "E:\mpcforum-userscript" -Branch "main" -CommitMessage "chore: update modules"
```

## Ważne

- Produkcyjnie polecam bundle w jednym pliku — najmniej problemów z CORS/CSP.
- Loader jest wygodny do rozwoju i pokazuje postęp ładowania modułów.
- Aktualny podział zachowuje funkcjonalność przez bezpieczne cięcie po zakresach linii, bez ręcznego refaktoru logiki.
