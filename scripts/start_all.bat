@echo off
echo ====================================================
echo Starting CareVoice Edge (Backend & Caretaker Dashboard)
echo ====================================================
start "CareVoice Edge Backend" cmd /k "cd /d %~dp0\..\backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"
start "CareVoice Edge Dashboard" cmd /k "cd /d %~dp0\..\frontend && npm run dev"
echo CareVoice Edge launched!
echo Backend REST API: http://localhost:8000 (Docs: http://localhost:8000/docs)
echo Caretaker Web Dashboard: http://localhost:5173
