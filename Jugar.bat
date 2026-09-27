@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Necesitas instalar Node.js 22 o posterior desde https://nodejs.org
  pause
  exit /b 1
)
if not exist "node_modules\vite" (
  call npm install
  if errorlevel 1 (
    pause
    exit /b 1
  )
)
call npm run dev -- --open
