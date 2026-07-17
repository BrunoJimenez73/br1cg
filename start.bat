@echo off
title br1cg — Dev Environment
cd /d "%~dp0"

echo ╔══════════════════════════════════════════╗
echo ║     br1cg — Dev Environment             ║
echo ╚══════════════════════════════════════════╝
echo.

REM ─── Verificar Bun ───
where bun >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Bun no esta instalado.
    echo         Instalalo desde: https://bun.sh
    echo.
    pause
    exit /b 1
)

REM ─── Matar procesos previos ───
echo [1/3] Limpiando procesos anteriores...
call "%~dp0stop.bat" silent

REM ─── Iniciar Servidor (ventana separada) ───
echo [2/3] Iniciando servidor API (puerto 3001)...
start "br1cg-server" "%windir%\system32\cmd.exe" /k "cd /d "%~dp0" && bun run dev:server"

REM ─── Iniciar Astro Dev (ventana separada) ───
echo [3/3] Iniciando Astro Dev (puerto 4321)...
start "br1cg-astro" "%windir%\system32\cmd.exe" /k "cd /d "%~dp0" && bun run dev:astro"

echo.
echo ✅ Todos los procesos iniciados.
echo.
echo   Servidor: http://localhost:3001
echo   Astro:    http://localhost:4321
echo   WS:       ws://localhost:3001/ws
echo   Overlay:  http://localhost:3001/overlay/timer?id=TU_ID
echo   Control:  http://localhost:3001/control
echo.
echo   Cierra con: stop.bat  o Ctrl+C en cada ventana
echo.
pause
