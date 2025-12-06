@echo off
echo Starting FastAPI Backend Server...
echo.
cd /d %~dp0
call S_Env\Scripts\activate
python app.py
pause

