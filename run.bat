@echo off
title Anvesh - Advanced File Search
color 0A
echo.
echo ========================================
echo    अन्वेष (Anvesh) - File Search Tool
echo ========================================
echo.
echo Checking Python launcher...
py --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python launcher ^(py.exe^) not found!
    echo Install Python 3.8+ from https://www.python.org/ and retry.
    pause
    exit /b 1
)

echo Python launcher detected.
echo.
echo Checking dependencies...
py -m pip show fastapi >nul 2>&1
if errorlevel 1 (
    echo Installing required packages...
    py -m pip install -r requirements.txt
    if errorlevel 1 (
        echo ERROR: Failed to install dependencies!
        pause
        exit /b 1
    )
)

echo.
echo Starting server on http://127.0.0.1:8000 ...
echo Leave this window open while you use Anvesh.
echo Press Ctrl+C to stop the server.
echo.
py -m uvicorn app:app --host 127.0.0.1 --port 8000
pause

