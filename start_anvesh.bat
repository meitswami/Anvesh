@echo off
title Anvesh - Starting...
color 0B
echo.
echo ========================================
echo    अन्वेष (Anvesh) - File Search Tool
echo ========================================
echo.
echo Starting Anvesh...
echo.
start "" "%~dp0dist\Anvesh.exe"
timeout /t 1 /nobreak >nul
exit

