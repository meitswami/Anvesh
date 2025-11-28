# अन्वेष (Anvesh) - Advanced File Search Tool

A beautiful, animated GUI application for searching text across multiple file types in Windows 11, with powerful AI features including OCR, Object Detection, and Face Recognition.

> **📖 For AI Features Guide**: See [AI_MODULE_README.md](AI_MODULE_README.md)

## Features

- 🔍 **Multi-format Search**: Search in Word (.doc, .docx), Excel (.xlsx, .xls), PowerPoint (.ppt, .pptx), PDF, and Text files
- 📁 **Multi-folder Support**: Search across multiple folders simultaneously
- 🎨 **Animated Modern UI**: Beautiful, responsive interface with Bootstrap 5
- 📊 **Detailed Results**: Shows line numbers, file paths, and occurrence counts
- ⚡ **Fast Performance**: Built with FastAPI for speed
- 🎯 **Search Options**: Exact match, case-sensitive, and filename search options
- 📜 **Search History**: Right sidebar with search history and timestamps
- 📂 **Folder Browser**: Browse and select folders or type paths manually
- 💾 **Portable**: Can be built as standalone executable (no Python needed)
- 🤖 **AI Features**: OCR, Object Detection, Face Detection & Matching (see [AI_MODULE_README.md](AI_MODULE_README.md))

## 🚀 Quick Start

### Easiest Way:
1. **Double-click `run.bat`** - It will check Python, install dependencies, and start the server
2. **Browser opens automatically** at `http://127.0.0.1:8000`
3. **Start searching!**

### Manual Start:
1. **Install dependencies** (first time only):
   ```bash
   pip install -r requirements.txt
   ```

2. **Start the server**:
   ```bash
   python app.py
   ```
   Or double-click `run.bat`

3. **Open browser** to:
   ```
   http://127.0.0.1:8000
   ```

> **📖 Detailed Guide**: See [QUICK_START.md](QUICK_START.md) for step-by-step instructions

### Option 2: Standalone Executable (Portable)

1. **Build the executable**:
   - Double-click `build_standalone.bat`
   - Or run: `py -m PyInstaller anvesh.spec --clean --noconfirm`

2. **Find the executable**:
   - Location: `dist\Anvesh.exe`
   - Copy this single file to any Windows PC
   - No Python installation needed!

3. **Run Anvesh.exe**:
   - Double-click to start
   - Browser will open automatically
   - Search history saved in `search_history.json`

## Offline Mode (Optional)

To make the app work completely offline (no internet needed):

```bash
python download_assets.py
```

This downloads Bootstrap and FontAwesome locally. The app will use local files instead of CDN.

## Usage

1. **Enter your search query** in the search box
2. **Select folders**:
   - Click "Browse Folders" button, OR
   - Type folder paths manually (one per line)
3. **Choose options**:
   - ☑ Exact Match: Find exact phrase only
   - ☑ Case Sensitive: Match case exactly
   - ☑ Search Filenames: Also search in file names
4. **Click "Search"** and view results
5. **View history** in the right sidebar - click any entry to reload it

## Search History

- All searches are logged with timestamps
- View history in the right sidebar
- Click any history entry to reload that search
- History saved in `search_history.json` (keeps last 100 entries)

## Supported File Types

- **Word Documents**: .doc, .docx
- **Excel Spreadsheets**: .xlsx, .xls
- **PowerPoint Presentations**: .ppt, .pptx
- **PDF Files**: .pdf
- **Text Files**: .txt

## Project Structure

```
Word finder tool/
├── app.py                      # FastAPI backend server
├── ai_features.py              # AI features module (OCR, Face Detection, etc.)
├── anvesh.spec                 # PyInstaller configuration
├── build_standalone.bat        # Build script for executable
├── install_ai_features.bat     # Install AI features (Windows)
├── install_ai_features.ps1     # Install AI features (PowerShell)
├── download_assets.py           # Download offline assets (optional)
├── run.bat                     # Quick start script
├── requirements.txt            # Python dependencies
├── README.md                   # Main documentation
├── AI_MODULE_README.md         # AI features complete guide
├── templates/
│   ├── index.html             # Main search interface
│   └── ai_features.html       # AI features interface
├── static/
│   ├── style.css              # Animated CSS styles
│   ├── script.js              # Main frontend JavaScript
│   ├── ai_features.js         # AI features JavaScript
│   └── vendor/                # Offline assets (Bootstrap, FontAwesome)
└── search_history.json         # Search history (created on first search)
```

## Building Standalone Executable

1. **Build the executable:**
   - Double-click `build_standalone.bat`
   - Or run: `py -m PyInstaller anvesh.spec --clean --noconfirm`

2. **Find the executable:**
   - Location: `dist\Anvesh.exe`
   - Copy this single file to any Windows PC
   - No Python installation needed!

3. **Notes:**
   - First startup takes 5-10 seconds (extracting files)
   - Console window shows startup messages
   - Browser opens automatically after server starts
   - Keep console window open while using Anvesh
   - File size: ~25-35 MB
   - Antivirus may flag it initially (false positive for PyInstaller executables)

## Troubleshooting

**Server won't start?**
- Make sure Python 3.8+ is installed
- Check if port 8000 is already in use
- Try running: `python app.py` directly

**No results found?**
- Verify folder paths are correct
- Check if files are in supported formats
- Try a simpler search query
- Enable "Search Filenames" option

**Missing libraries?**
- Run: `pip install -r requirements.txt`
- Make sure you have internet connection

**Browser can't connect?**
- Make sure the server is running (check terminal window)
- Try `http://localhost:8000` instead
- Check Windows Firewall settings

## License

Free to use and modify.

## Credits

Created by Strik3r_12ka4 & Phantom007. © All Rights reserved 2025.
