@echo off
setlocal EnableExtensions

set "ROOT=%~dp0"
if "%ROOT:~-1%"=="\" set "ROOT=%ROOT:~0,-1%"

set "VENV_PYTHON=%ROOT%\.venv\Scripts\python.exe"
if exist "%VENV_PYTHON%" (
    set "PYTHON=%VENV_PYTHON%"
) else (
    set "PYTHON=python"
)

set "MODE=%~1"
if /I "%MODE%"=="" set "MODE=publish"

if /I "%MODE%"=="help" goto :help
if /I "%MODE%"=="--help" goto :help
if /I "%MODE%"=="-h" goto :help
if /I "%MODE%"=="dry-run" goto :dryrun
if /I "%MODE%"=="publish" goto :publish
if /I "%MODE%"=="github" goto :github
if /I "%MODE%"=="verify" goto :verify

echo [ERROR] Nieznany tryb: %MODE%
goto :help

:run_split
echo.
echo === [1/4] Split source ===
powershell -ExecutionPolicy Bypass -File "%ROOT%\tools\split-source.ps1" -ProjectRoot "%ROOT%"
if errorlevel 1 goto :fail
goto :eof

:run_verify
echo.
echo === [2/4] Verify modules ===
"%PYTHON%" "%ROOT%\tools\verify_modules.py" --check-bundle
if errorlevel 1 goto :fail
goto :eof

:run_publish_dry
echo.
echo === [3/4] Publish gists (dry-run) ===
"%PYTHON%" "%ROOT%\tools\publish_gists.py" --dry-run
if errorlevel 1 goto :fail
goto :eof

:run_publish_live
echo.
echo === [3/4] Publish gists ===
if "%GITHUB_TOKEN%"=="" if "%GH_TOKEN%"=="" if not exist "%ROOT%\token.txt" (
    echo [ERROR] Brak tokena GitHub. Ustaw GITHUB_TOKEN, GH_TOKEN albo wpisz token do "%ROOT%\token.txt".
    goto :fail
)
"%PYTHON%" "%ROOT%\tools\publish_gists.py"
if errorlevel 1 goto :fail
goto :eof

:run_build
echo.
echo === [4/4] Build dist files ===
powershell -ExecutionPolicy Bypass -File "%ROOT%\tools\build.ps1" -ProjectRoot "%ROOT%"
if errorlevel 1 goto :fail
goto :eof

:dryrun
call :run_split
call :run_verify
call :run_publish_dry
call :run_build
goto :success

:publish
call :run_split
call :run_verify
call :run_publish_live
call :run_build
goto :success

:github
echo.
echo === [1/3] Split source ===
powershell -ExecutionPolicy Bypass -File "%ROOT%\tools\split-source.ps1" -ProjectRoot "%ROOT%"
if errorlevel 1 goto :fail
echo.
echo === [2/3] Sync + build + git publish (GitHub) ===
powershell -ExecutionPolicy Bypass -File "%ROOT%\tools\publish-github.ps1" -ProjectRoot "%ROOT%"
if errorlevel 1 goto :fail
echo.
echo === [3/3] Done ===
goto :success

:verify
call :run_split
call :run_verify
goto :success

:success
echo.
echo [OK] Workflow zakonczony powodzeniem.
goto :end

:fail
echo.
echo [FAIL] Workflow przerwany przez blad.
exit /b 1

:help
echo.
echo Uzycie:
echo   run-workflow.bat publish   ^(domyslnie: split + verify + publish + build^)
echo   run-workflow.bat dry-run   ^(split + verify + publish dry-run + build^)
echo   run-workflow.bat github    ^(split + sync hosted + build + commit + push do GitHub repo^)
echo   run-workflow.bat verify    ^(tylko split + verify^)
echo.
echo Do trybu publish ustaw token:
echo   set GITHUB_TOKEN=twoj_token
echo lub:
echo   set GH_TOKEN=twoj_token
echo lub wpisz token do pliku:
echo   %ROOT%\token.txt
goto :end

:end
endlocal
