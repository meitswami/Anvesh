# Quick Start Guide

## First Time Setup

1. **Double-click `run.bat`** - This will:
   - Check if Python is installed
   - Install all required packages
   - Start the server

2. **Open your browser** and go to: `http://127.0.0.1:8000`

## Manual Setup (Alternative)

If you prefer to run manually:

```bash
# Install dependencies
py -m pip install -r requirements.txt

# Start the server
py -m uvicorn app:app --host 127.0.0.1 --port 8000
```

Then open `http://127.0.0.1:8000` in your browser.

## Using the Search Tool

1. **Enter your search query** in the search box
2. **Enter folder paths** (one per line or comma-separated):
   ```
   C:\Users\Documents
   C:\Projects
   ```
3. **Choose options**:
   - ☑ Exact Match: Find exact phrase only
   - ☑ Case Sensitive: Match case exactly
4. **Click "Search"** and wait for results

## Example Searches

- Search for "budget" in all Excel files
- Find "meeting notes" across Word documents
- Locate "Q4" in PowerPoint presentations
- Search for specific terms in PDF reports

## Troubleshooting

**Server won't start?**
- Make sure Python 3.8+ is installed
- Check if port 8000 is already in use
- Try running: `python app.py` directly

**No results found?**
- Verify folder paths are correct
- Check if files are in supported formats
- Try a simpler search query

**Missing libraries?**
- Run: `pip install -r requirements.txt`
- Make sure you have internet connection

Enjoy searching! 🔍

