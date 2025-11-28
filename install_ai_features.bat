@echo off
echo ========================================
echo   Installing AI Features for Anvesh
echo ========================================
echo.
echo This will install all AI dependencies.
echo Make sure dlib is installed first (via conda recommended).
echo.

echo Installing OpenCV...
pip install opencv-python

echo.
echo Installing Pillow...
pip install Pillow

echo.
echo Installing pytesseract...
pip install pytesseract

echo.
echo Installing imageio and moviepy...
pip install imageio imageio-ffmpeg moviepy

echo.
echo Installing ultralytics (YOLO)...
pip install ultralytics

echo.
echo Installing face-recognition...
pip install face-recognition

echo.
echo ========================================
echo   Installation Complete!
echo ========================================
echo.
echo IMPORTANT: Install Tesseract OCR separately:
echo Download from: https://github.com/UB-Mannheim/tesseract/wiki
echo.
pause

