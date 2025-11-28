# PowerShell script to install AI features
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Installing AI Features for Anvesh" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This will install all AI dependencies." -ForegroundColor Gray
Write-Host "Make sure dlib is installed first (via conda recommended)." -ForegroundColor Gray
Write-Host ""

Write-Host "Installing OpenCV..." -ForegroundColor Yellow
pip install opencv-python

Write-Host ""
Write-Host "Installing Pillow..." -ForegroundColor Yellow
pip install Pillow

Write-Host ""
Write-Host "Installing pytesseract..." -ForegroundColor Yellow
pip install pytesseract

Write-Host ""
Write-Host "Installing imageio and moviepy..." -ForegroundColor Yellow
pip install imageio imageio-ffmpeg moviepy

Write-Host ""
Write-Host "Installing ultralytics (YOLO)..." -ForegroundColor Yellow
pip install ultralytics

Write-Host ""
Write-Host "Installing face-recognition..." -ForegroundColor Yellow
pip install face-recognition

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Installation Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANT: Install Tesseract OCR separately:" -ForegroundColor Yellow
Write-Host "Download from: https://github.com/UB-Mannheim/tesseract/wiki" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter to exit"

