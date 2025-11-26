# Building Standalone Executable

## Quick Build

1. **Double-click `build_standalone.bat`**
   - This will install PyInstaller if needed
   - Build the standalone executable
   - Output will be in `dist\Anvesh.exe`

## Manual Build

```bash
# Install PyInstaller
py -m pip install pyinstaller

# Build executable
py -m PyInstaller anvesh.spec --clean --noconfirm
```

## Offline Assets (Optional)

To make the app fully offline (no CDN dependencies):

```bash
# Download Bootstrap and FontAwesome locally
py download_assets.py
```

This will download assets to `static/vendor/` and the app will use them instead of CDN.

## Distribution

After building:
- The standalone executable is in `dist\Anvesh.exe`
- Copy `Anvesh.exe` to any Windows PC
- No Python installation needed on target PC
- No internet connection needed (if offline assets downloaded)
- Search history will be saved in `search_history.json` in the same folder as the executable

## File Size

The executable will be approximately 25-35 MB (includes Python runtime and all dependencies).

## Running the Executable

1. **Double-click `Anvesh.exe`**
   - A console window will open showing startup messages
   - Wait 2-5 seconds for the server to start
   - Browser will open automatically at http://127.0.0.1:8000
   - Keep the console window open while using Anvesh

2. **What you'll see:**
   ```
   ============================================================
     अन्वेष (Anvesh) - Advanced File Search
   ============================================================
   
   Starting server...
   Please wait, this may take a moment...
   
   ✓ Browser opened at http://127.0.0.1:8000
   
   ============================================================
   Server is running!
   ============================================================
   
   Keep this window open while using Anvesh.
   Close this window to stop the server.
   ```

## Notes

- **First startup**: May take 5-10 seconds (extracting bundled files)
- **Subsequent startups**: Usually 2-5 seconds
- **Console window**: Shows useful information - keep it open
- **Browser**: Opens automatically after server starts
- **Antivirus**: May flag it initially (false positive for PyInstaller executables)
- **Portable**: Just copy the .exe file - no installation needed!
- **Data files**: `search_history.json` is created in the same folder as the executable

