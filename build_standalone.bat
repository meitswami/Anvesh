@echo off
title Building Anvesh Standalone Executable
color 0B
echo.
echo ========================================
echo    Building Anvesh Standalone Version
echo ========================================
echo.

echo Checking Python...
py --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python not found!
    pause
    exit /b 1
)

echo Installing PyInstaller...
py -m pip install pyinstaller --quiet

echo.
echo Building standalone executable...
echo This may take a few minutes...
echo.

py -m PyInstaller anvesh.spec --clean --noconfirm

if errorlevel 1 (
    echo.
    echo ERROR: Build failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo    Build Complete!
echo ========================================
echo.
echo Executable location: dist\Anvesh.exe
echo.
echo IMPORTANT NOTES:
echo - First startup takes 5-10 seconds (extracting files)
echo - Console window will show startup messages
echo - Browser opens automatically after server starts
echo - Keep console window open while using Anvesh
echo - Copy EXECUTABLE_README.txt with the .exe for instructions
echo.
echo You can now copy Anvesh.exe to any Windows PC and run it!
echo.
pause

