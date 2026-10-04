@echo off
title NoteForge AI - Unified Starter
echo ==============================================
echo       NoteForge AI System Launching...
echo ==============================================

echo Starting AI Microservice (Port 8000)...
start "NoteForge AI Service" cmd /k "cd /d d:\NoteForgeAI\ai-service && python main.py"

timeout /t 2 /nobreak >nul

echo Starting Backend API (Port 5000)...
start "NoteForge Backend" cmd /k "cd /d d:\NoteForgeAI\backend && npm run dev"

timeout /t 2 /nobreak >nul

echo Starting Frontend UI (Port 5173)...
start "NoteForge Frontend" cmd /k "cd /d d:\NoteForgeAI\frontend && npm run dev"

echo ==============================================
echo All 3 services started!
echo Frontend will be live at: http://localhost:5173
echo ==============================================
pause
