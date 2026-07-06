@echo off
title OmniPilot AI Orchestration Launcher
echo ========================================================
echo          OMNIPILOT AI MULTI-AGENT SYSTEM LAUNCHER
echo ========================================================
echo Checking workspace dependencies...
call npm install
call npm run install:all
echo.
echo Starting frontend and backend services concurrently...
echo The React Dashboard will load on http://localhost:3000
echo.
call npm run dev
pause
