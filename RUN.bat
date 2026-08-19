@echo off
REM Starts the SwipeRight backend (FastAPI) and frontend (Next.js) dev servers.
REM First run: create server\venv and run "pip install -r server\requirements.txt",
REM and "npm install" in client\ before using this script. See README.md.

cd /d "%~dp0"

start "SwipeRight Backend" cmd /k "cd server && venv\Scripts\activate && python main.py"
start "SwipeRight Frontend" cmd /k "cd client && npm run dev"

echo Backend starting on http://localhost:8000
echo Frontend starting on http://localhost:3000
