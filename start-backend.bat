@echo off
title SecureFlow Banking Engine Backend
echo ========================================================
echo   SecureFlow - Distributed Banking & Fraud Engine Backend
echo ========================================================
echo.

set JAVA_HOME=C:\Users\shavy\tools\jdk-21.0.6+7
set MAVEN_HOME=C:\Users\shavy\tools\apache-maven-3.9.9
set PATH=%JAVA_HOME%\bin;%MAVEN_HOME%\bin;%PATH%

echo [*] Using Java 21: %JAVA_HOME%
echo [*] Using Maven:   %MAVEN_HOME%
echo.

cd /d "%~dp0backend"

REM Load .env variables if .env file exists
if exist "%~dp0.env" (
    echo [*] Loading environment variables from root .env ...
    for /f "usebackq tokens=1,* delims==" %%A in ("%~dp0.env") do (
        set "line=%%A"
        if not "!line:~0,1!"=="#" (
            set "%%A=%%B"
        )
    )
) else if exist "%~dp0backend\.env" (
    echo [*] Loading environment variables from backend\.env ...
    for /f "usebackq tokens=1,* delims==" %%A in ("%~dp0backend\.env") do (
        set "line=%%A"
        if not "!line:~0,1!"=="#" (
            set "%%A=%%B"
        )
    )
)

echo [*] Booting Spring Boot 3 on http://localhost:8080 ...
echo.
mvn spring-boot:run
pause
