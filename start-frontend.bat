@echo off
title SENTINEL Frontend Portal
echo ========================================================
echo   SENTINEL - Frontend Portal (React 19 + Vite)
echo ========================================================
echo.

cd /d "%~dp0frontend"
echo [*] Starting Vite Dev Server on http://localhost:5173 ...
echo.
npm.cmd run dev -- --host
pause
