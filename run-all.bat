@echo off
echo ================================================================
echo Launching SENTINEL Platform (Backend + Frontend)
echo ================================================================
start "SENTINEL Backend Engine" cmd /k "%~dp0start-backend.bat"
timeout /t 5 /nobreak >nul
start "SENTINEL Fintech Dashboard" cmd /k "%~dp0start-frontend.bat"
echo Services launched.
echo Backend:  http://localhost:8080 (Swagger: http://localhost:8080/swagger-ui.html)
echo Frontend: http://localhost:5173
pause
