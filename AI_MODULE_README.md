# 🤖 Anvesh AI Features Module - Complete Guide

## 📋 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Installation Guide](#installation-guide)
- [Usage Guide](#usage-guide)
- [Feature Details](#feature-details)
- [Troubleshooting](#troubleshooting)
- [System Requirements](#system-requirements)

---

## 🎯 Overview

The Anvesh AI Features Module is an advanced add-on that extends the core file search functionality with powerful AI capabilities including:

- **OCR (Optical Character Recognition)** - Extract text from images and videos
- **Object Detection** - Identify objects in images using YOLO
- **Face Detection** - Detect and locate faces in images and videos
- **Face Matching** - Compare and match faces with similarity percentages

All processing happens **locally** on your machine - no cloud services, no data uploads, complete privacy.

---

## ✨ Features

### 1. 📸 OCR - Image Text Extraction
- Extract text from images (JPG, PNG, BMP, etc.)
- Get text with bounding box coordinates
- Confidence scores for each detected text
- Supports multiple languages (with Tesseract language packs)

### 2. 🎬 OCR - Video Text Extraction
- Extract text from video frames
- Configurable frame sampling interval
- Time-stamped text extraction
- Perfect for extracting subtitles or on-screen text

### 3. 👁️ Object Detection
- Detect 80+ object classes using YOLO
- Real-time object identification
- Bounding box coordinates
- Confidence scores
- Grouped results by object type

### 4. 👤 Face Detection
- Detect faces in images
- Get face locations (coordinates)
- Face encoding extraction
- Multiple face detection support

### 5. 🎥 Face Detection in Video
- Detect faces across video frames
- Frame-by-frame face tracking
- Time-stamped face locations
- Efficient frame sampling

### 6. 🔍 Face Matching
- Compare faces between two images
- Similarity percentage calculation
- Match threshold configuration
- Best match identification

### 7. 📁 Find Matching Faces in Folder
- Search for matching faces across entire folders
- Batch face comparison
- Sorted by similarity percentage
- Fast and efficient processing

---

## 📦 Installation Guide

### Prerequisites
- Python 3.8+ (3.14 compatible)
- Basic Anvesh installation working
- Internet connection (for downloading models)

### Step 1: Install Basic Requirements

```bash
pip install -r requirements.txt
```

This installs the core Anvesh application without AI features.

### Step 2: Install dlib (Required for Face Recognition)

**Option A: Using Conda (Recommended for Windows)**
```bash
conda install -c conda-forge dlib
```

**Option B: Using pip**
```bash
pip install dlib
```

**Option C: Pre-built Wheel (If above fails)**
1. Download from: https://github.com/sachadee/Dlib/releases
2. Install: `pip install path/to/dlib-*.whl`

### Step 3: Install AI Packages

**Using PowerShell:**
```powershell
.\install_remaining_ai.ps1
```

**Using Command Prompt:**
```cmd
.\install_remaining_ai.bat
```

**Manual Installation:**
```bash
pip install opencv-python Pillow pytesseract imageio imageio-ffmpeg moviepy ultralytics face-recognition
```

### Step 4: Install Tesseract OCR

**Windows:**
1. Download installer: https://github.com/UB-Mannheim/tesseract/wiki
2. Run installer
3. Install to: `C:\Program Files\Tesseract-OCR`
4. Add to PATH or set environment variable:
   ```powershell
   [System.Environment]::SetEnvironmentVariable('TESSDATA_PREFIX', 'C:\Program Files\Tesseract-OCR\tessdata', 'User')
   ```
5. **Restart terminal/IDE**

**Linux:**
```bash
sudo apt-get update
sudo apt-get install tesseract-ocr
```

**macOS:**
```bash
brew install tesseract
```

### Step 5: Verify Installation

Test if everything is installed correctly:

```python
python -c "import cv2; import face_recognition; from ultralytics import YOLO; import pytesseract; print('✓ All AI packages installed successfully!')"
```

If you see the success message, you're ready to go!

---

## 🚀 Usage Guide

### Starting the Application

1. **Start the server:**
   ```bash
   python app.py
   ```
   Or double-click `run.bat`

2. **Open browser:**
   - Navigate to: http://127.0.0.1:8000
   - Or browser opens automatically

3. **Access AI Features:**
   - Click the **"AI Features"** button on the main page
   - Or go directly to: http://127.0.0.1:8000/ai

### Using OCR - Image

1. Click **"OCR - Image"** card
2. Enter the full path to your image file
3. Click OK
4. View extracted text and bounding boxes

**Example:**
```
Image Path: C:\Users\Documents\screenshot.png
```

### Using OCR - Video

1. Click **"OCR - Video"** card
2. Enter video file path
3. Set frame interval (default: 30)
   - Lower = more frames, slower processing
   - Higher = fewer frames, faster processing
4. View extracted text with timestamps

**Example:**
```
Video Path: C:\Users\Videos\presentation.mp4
Frame Interval: 30
```

### Using Object Detection

1. Click **"Object Detection"** card
2. Enter image file path
3. Set confidence threshold (0.0-1.0, default: 0.25)
   - Lower = more detections, may include false positives
   - Higher = fewer detections, more accurate
4. View detected objects with confidence scores

**Example:**
```
Image Path: C:\Users\Pictures\photo.jpg
Confidence: 0.25
```

### Using Face Detection

1. Click **"Face Detection"** card
2. Enter image file path
3. View detected faces with coordinates

**Example:**
```
Image Path: C:\Users\Pictures\group_photo.jpg
```

### Using Face Detection in Video

1. Click **"Face Detection - Video"** card
2. Enter video file path
3. Set frame interval (default: 30)
4. View faces detected across video with timestamps

### Using Face Matching

1. Click **"Face Matching"** card
2. Enter first image path
3. Enter second image path
4. Set similarity threshold (default: 0.6)
5. View match results with similarity percentage

**Example:**
```
Image 1: C:\Users\Pictures\person1.jpg
Image 2: C:\Users\Pictures\person2.jpg
Threshold: 0.6
```

### Finding Matching Faces in Folder

1. Click **"Find Faces in Folder"** card
2. Enter reference image path (the face to search for)
3. Enter folder path to search
4. Set similarity threshold (default: 0.6)
5. View all matching images sorted by similarity

**Example:**
```
Reference Image: C:\Users\Pictures\reference.jpg
Folder: C:\Users\Pictures\Family Photos
Threshold: 0.6
```

---

## 📖 Feature Details

### OCR (Optical Character Recognition)

**How it works:**
- Uses Tesseract OCR engine
- Preprocesses images for better accuracy
- Extracts text with location information
- Provides confidence scores

**Best for:**
- Screenshots with text
- Scanned documents
- Images with text overlays
- Video subtitles

**Tips:**
- Higher resolution images = better results
- Clear, readable text = higher accuracy
- Can process multiple languages (install language packs)

### Object Detection

**How it works:**
- Uses YOLOv8 (You Only Look Once) model
- Detects 80+ object classes
- Provides bounding boxes and confidence scores
- Fast and accurate

**Detectable Objects Include:**
- People, vehicles, animals
- Furniture, electronics
- Food, sports equipment
- And 70+ more categories

**Tips:**
- Lower confidence = more detections
- First run downloads model (~6MB)
- Works best with clear, well-lit images

### Face Detection

**How it works:**
- Uses face_recognition library (dlib-based)
- Detects face locations
- Extracts face encodings
- Supports multiple faces per image

**Best for:**
- Group photos
- Security applications
- Photo organization
- People counting

**Tips:**
- Works with frontal and side faces
- Multiple faces supported
- Fast processing

### Face Matching

**How it works:**
- Compares face encodings
- Calculates Euclidean distance
- Converts to similarity percentage
- Configurable threshold

**Similarity Thresholds:**
- **0.4-0.5**: Very strict (high confidence matches)
- **0.6**: Recommended (balanced)
- **0.7+**: More lenient (may include false positives)

**Best for:**
- Finding photos of specific person
- Duplicate detection
- Photo organization
- Security applications

---

## 🔧 Troubleshooting

### Issue: "Tesseract OCR not available"

**Solution:**
1. Verify Tesseract is installed
2. Check PATH environment variable
3. Set TESSDATA_PREFIX if needed
4. Restart terminal/IDE

**Test:**
```bash
tesseract --version
```

### Issue: "Face recognition not available"

**Solution:**
1. Verify dlib is installed: `python -c "import dlib; print(dlib.__version__)"`
2. If missing, install via conda: `conda install -c conda-forge dlib`
3. Reinstall face-recognition: `pip install face-recognition --force-reinstall`

### Issue: "YOLO model download fails"

**Solution:**
1. Check internet connection
2. Model downloads on first use (~6MB)
3. Can be slow on first run
4. Model is cached after first download

### Issue: "NumPy installation fails"

**Solution:**
```bash
# Use pre-built wheels
pip install numpy --only-binary :all:

# Or install Visual Studio Build Tools for compilation
```

### Issue: "Processing is very slow"

**Solutions:**
- **OCR Video**: Increase frame interval (30-60)
- **Face Detection Video**: Process every 30th frame
- **Object Detection**: Lower confidence threshold
- **Face Matching**: Process smaller folders first

### Issue: "dlib installation fails on Windows"

**Solutions:**
1. Use conda: `conda install -c conda-forge dlib` (Recommended)
2. Download pre-built wheel from GitHub
3. Install Visual C++ Build Tools
4. Use conda environment instead of pip

### Issue: "AI features show as 'Not Available'"

**Check:**
1. Are packages installed? Run verification script
2. Is Tesseract installed? (for OCR)
3. Is dlib installed? (for face recognition)
4. Restart the server after installing packages

---

## 💻 System Requirements

### Minimum Requirements
- **OS**: Windows 10/11, Linux, macOS
- **Python**: 3.8+ (3.14 compatible)
- **RAM**: 4GB (8GB recommended)
- **Storage**: 500MB for models and dependencies
- **CPU**: Any modern processor

### Recommended Requirements
- **RAM**: 8GB+
- **Storage**: 2GB+ (for models and cache)
- **GPU**: Optional (CPU works fine, GPU speeds up YOLO)

### Disk Space Breakdown
- Python packages: ~200MB
- YOLO model: ~6MB (downloads on first use)
- Tesseract OCR: ~50MB
- dlib: ~10MB
- OpenCV: ~100MB
- Other dependencies: ~150MB

**Total**: ~500MB-1GB

---

## 🎯 Use Cases

### OCR Use Cases
- Extract text from screenshots
- Digitize scanned documents
- Extract subtitles from videos
- Read text from images
- Process receipts and invoices

### Object Detection Use Cases
- Find specific objects in photo collections
- Count objects in images
- Security and surveillance
- Content moderation
- Image organization

### Face Detection Use Cases
- Count people in photos
- Organize photos by people
- Security applications
- Social media tagging
- Event photography

### Face Matching Use Cases
- Find all photos of a person
- Detect duplicate photos
- Organize family photos
- Security and access control
- Photo deduplication

---

## 📝 Notes

- **First Run**: May be slower (downloading models, loading libraries)
- **Privacy**: All processing is local - no data leaves your computer
- **Performance**: CPU processing is fast enough for most use cases
- **Models**: YOLO model downloads automatically on first use
- **Updates**: Keep packages updated for best performance

---

## 🔗 Additional Resources

- **Tesseract OCR**: https://github.com/tesseract-ocr/tesseract
- **YOLO**: https://github.com/ultralytics/ultralytics
- **face_recognition**: https://github.com/ageitgey/face_recognition
- **OpenCV**: https://opencv.org/

---

## 📞 Support

If you encounter issues:
1. Check the Troubleshooting section
2. Verify all dependencies are installed
3. Check the console for error messages
4. Ensure file paths are correct and accessible

---

## 🎉 Enjoy Your AI-Powered Search!

The AI Features Module transforms Anvesh from a simple file search tool into a powerful AI-powered analysis platform. All processing happens locally on your machine, ensuring complete privacy and security.

**Happy Searching!** 🔍🤖

