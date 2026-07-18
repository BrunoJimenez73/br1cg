@echo off
title br1cg -- Stop
cd /d "%~dp0"

if /i not "%1"=="silent" (
    echo ========================================
     Deteniendo procesos de br1cg...
    echo ========================================
)

REM --- Matar ventanas por titulo ---
taskkill /fi "WINDOWTITLE eq br1cg-server*" /f >nul 2>&1
taskkill /fi "WINDOWTITLE eq br1cg-astro*" /f >nul 2>&1

REM --- Matar procesos en puertos conocidos ---
for %%p in (3001 4321) do (
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%%p "') do (
        taskkill /F /PID %%a >nul 2>&1
    )
)

if /i not "%1"=="silent" (
    echo.
    echo [OK] Procesos detenidos.
    echo.
    pause
)
