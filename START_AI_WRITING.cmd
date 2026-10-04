@echo off
cd /d "Q:\Google Antigravity\Scientific Research\ai-writing-detector"

start "" cmd /k "npm run dev"

timeout /t 3 /nobreak >nul

start "" "http://localhost:3000/"