"""
Download Bootstrap and FontAwesome for offline use
"""
import os
import urllib.request
import zipfile
import shutil
from pathlib import Path

def download_file(url, dest):
    """Download a file from URL"""
    print(f"Downloading {url}...")
    urllib.request.urlretrieve(url, dest)
    print(f"Downloaded to {dest}")

def extract_zip(zip_path, extract_to):
    """Extract zip file"""
    print(f"Extracting {zip_path}...")
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(extract_to)
    print(f"Extracted to {extract_to}")

def setup_offline_assets():
    """Download and setup offline assets"""
    static_dir = Path("static")
    static_dir.mkdir(exist_ok=True)
    
    # Create vendor directories
    vendor_dir = static_dir / "vendor"
    vendor_dir.mkdir(exist_ok=True)
    
    bootstrap_dir = vendor_dir / "bootstrap"
    bootstrap_dir.mkdir(exist_ok=True)
    
    fontawesome_dir = vendor_dir / "fontawesome"
    fontawesome_dir.mkdir(exist_ok=True)
    
    print("Setting up offline assets...")
    print("=" * 50)
    
    # Download Bootstrap CSS and JS
    bootstrap_css_url = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
    bootstrap_js_url = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"
    
    download_file(bootstrap_css_url, bootstrap_dir / "bootstrap.min.css")
    download_file(bootstrap_js_url, bootstrap_dir / "bootstrap.bundle.min.js")
    
    # Download FontAwesome CSS
    fontawesome_css_url = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
    fontawesome_webfonts_url = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/"
    
    download_file(fontawesome_css_url, fontawesome_dir / "all.min.css")
    
    # Download FontAwesome webfonts (main ones)
    webfonts_dir = fontawesome_dir / "webfonts"
    webfonts_dir.mkdir(exist_ok=True)
    
    webfonts = [
        "fa-solid-900.woff2",
        "fa-regular-400.woff2",
        "fa-brands-400.woff2",
    ]
    
    for font in webfonts:
        font_url = f"{fontawesome_webfonts_url}{font}"
        download_file(font_url, webfonts_dir / font)
    
    # Update FontAwesome CSS to use local paths
    fa_css_path = fontawesome_dir / "all.min.css"
    if fa_css_path.exists():
        with open(fa_css_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Replace CDN paths with local paths
        content = content.replace('../webfonts/', 'webfonts/')
        
        with open(fa_css_path, 'w', encoding='utf-8') as f:
            f.write(content)
    
    print("=" * 50)
    print("Offline assets setup complete!")
    print(f"Files are in: {vendor_dir.absolute()}")

if __name__ == "__main__":
    try:
        setup_offline_assets()
    except Exception as e:
        print(f"Error: {e}")
        print("\nNote: You can still use the app with CDN links if download fails.")

