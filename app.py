from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, JSONResponse
from pydantic import BaseModel
from typing import List, Optional
import os
import sys
import asyncio
from pathlib import Path
import re
from datetime import datetime
import json

# File type handlers
try:
    from docx import Document
    DOCX_AVAILABLE = True
except ImportError:
    DOCX_AVAILABLE = False

try:
    from openpyxl import load_workbook
    XLSX_AVAILABLE = True
except ImportError:
    XLSX_AVAILABLE = False

try:
    from pptx import Presentation
    PPTX_AVAILABLE = True
except ImportError:
    PPTX_AVAILABLE = False

try:
    import PyPDF2
    PDF_AVAILABLE = True
except ImportError:
    PDF_AVAILABLE = False

app = FastAPI(title="Anvesh - Advanced File Search")

# Helper function to get resource path (works for both script and executable)
def resource_path(relative_path):
    """Get absolute path to resource, works for dev and PyInstaller"""
    if getattr(sys, 'frozen', False):
        # Running as compiled executable - PyInstaller creates a temp folder and stores path in _MEIPASS
        base_path = sys._MEIPASS
    else:
        # Running as script
        base_path = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(base_path, relative_path)

# Mount static files
static_path = resource_path("static")
if os.path.exists(static_path):
    app.mount("/static", StaticFiles(directory=static_path), name="static")

class SearchRequest(BaseModel):
    query: str
    folders: List[str]
    exact_match: bool = False
    case_sensitive: bool = False
    search_filenames: bool = False

class SearchResult(BaseModel):
    file_path: str
    line_number: Optional[int]
    content: str
    occurrences: int

class FileResult(BaseModel):
    file_path: str
    total_occurrences: int
    matches: List[SearchResult]

def search_txt(file_path: str, query: str, exact_match: bool, case_sensitive: bool) -> List[SearchResult]:
    """Search in plain text files"""
    results = []
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            lines = f.readlines()
            for line_num, line in enumerate(lines, 1):
                if case_sensitive:
                    search_line = line
                    search_query = query
                else:
                    search_line = line.lower()
                    search_query = query.lower()
                
                if exact_match:
                    if search_query in search_line:
                        results.append(SearchResult(
                            file_path=file_path,
                            line_number=line_num,
                            content=line.strip(),
                            occurrences=search_line.count(search_query)
                        ))
                else:
                    if search_query in search_line:
                        results.append(SearchResult(
                            file_path=file_path,
                            line_number=line_num,
                            content=line.strip()[:200],  # Limit preview
                            occurrences=search_line.count(search_query)
                        ))
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
    return results

def search_docx(file_path: str, query: str, exact_match: bool, case_sensitive: bool) -> List[SearchResult]:
    """Search in Word documents"""
    if not DOCX_AVAILABLE:
        return []
    
    results = []
    try:
        doc = Document(file_path)
        line_num = 0
        for paragraph in doc.paragraphs:
            line_num += 1
            text = paragraph.text
            if case_sensitive:
                search_text = text
                search_query = query
            else:
                search_text = text.lower()
                search_query = query.lower()
            
            if search_query in search_text:
                count = search_text.count(search_query)
                results.append(SearchResult(
                    file_path=file_path,
                    line_number=line_num,
                    content=text.strip()[:200],
                    occurrences=count
                ))
    except Exception as e:
        print(f"Error reading DOCX {file_path}: {e}")
    return results

def search_xlsx(file_path: str, query: str, exact_match: bool, case_sensitive: bool) -> List[SearchResult]:
    """Search in Excel files"""
    if not XLSX_AVAILABLE:
        return []
    
    results = []
    try:
        wb = load_workbook(file_path, data_only=True)
        line_num = 0
        for sheet_name in wb.sheetnames:
            sheet = wb[sheet_name]
            for row in sheet.iter_rows():
                for cell in row:
                    if cell.value:
                        line_num += 1
                        text = str(cell.value)
                        if case_sensitive:
                            search_text = text
                            search_query = query
                        else:
                            search_text = text.lower()
                            search_query = query.lower()
                        
                        if search_query in search_text:
                            count = search_text.count(search_query)
                            results.append(SearchResult(
                                file_path=f"{file_path} (Sheet: {sheet_name})",
                                line_number=line_num,
                                content=text.strip()[:200],
                                occurrences=count
                            ))
    except Exception as e:
        print(f"Error reading XLSX {file_path}: {e}")
    return results

def search_pptx(file_path: str, query: str, exact_match: bool, case_sensitive: bool) -> List[SearchResult]:
    """Search in PowerPoint files"""
    if not PPTX_AVAILABLE:
        return []
    
    results = []
    try:
        prs = Presentation(file_path)
        slide_num = 0
        for slide in prs.slides:
            slide_num += 1
            for shape in slide.shapes:
                if hasattr(shape, "text"):
                    text = shape.text
                    if case_sensitive:
                        search_text = text
                        search_query = query
                    else:
                        search_text = text.lower()
                        search_query = query.lower()
                    
                    if search_query in search_text:
                        count = search_text.count(search_query)
                        results.append(SearchResult(
                            file_path=f"{file_path} (Slide: {slide_num})",
                            line_number=slide_num,
                            content=text.strip()[:200],
                            occurrences=count
                        ))
    except Exception as e:
        print(f"Error reading PPTX {file_path}: {e}")
    return results

def search_pdf(file_path: str, query: str, exact_match: bool, case_sensitive: bool) -> List[SearchResult]:
    """Search in PDF files"""
    if not PDF_AVAILABLE:
        return []
    
    results = []
    try:
        with open(file_path, 'rb') as f:
            pdf_reader = PyPDF2.PdfReader(f)
            page_num = 0
            for page in pdf_reader.pages:
                page_num += 1
                text = page.extract_text()
                if case_sensitive:
                    search_text = text
                    search_query = query
                else:
                    search_text = text.lower()
                    search_query = query.lower()
                
                if search_query in search_text:
                    lines = text.split('\n')
                    for line_idx, line in enumerate(lines, 1):
                        if case_sensitive:
                            search_line = line
                        else:
                            search_line = line.lower()
                        
                        if search_query in search_line:
                            count = search_line.count(search_query)
                            results.append(SearchResult(
                                file_path=f"{file_path} (Page: {page_num})",
                                line_number=line_idx,
                                content=line.strip()[:200],
                                occurrences=count
                            ))
    except Exception as e:
        print(f"Error reading PDF {file_path}: {e}")
    return results

def get_supported_files(folder_path: str) -> List[str]:
    """Get all supported files from a folder recursively"""
    supported_extensions = {'.txt', '.docx', '.doc', '.xlsx', '.xls', '.pptx', '.ppt', '.pdf'}
    files = []
    
    try:
        for root, dirs, filenames in os.walk(folder_path):
            for filename in filenames:
                ext = os.path.splitext(filename)[1].lower()
                if ext in supported_extensions:
                    file_path = os.path.join(root, filename)
                    files.append(file_path)
    except Exception as e:
        print(f"Error walking directory {folder_path}: {e}")
    
    return files

def log_search_history(query: str, folders: List[str], results_count: int, exact_match: bool, case_sensitive: bool, search_filenames: bool):
    """Log search history to local file"""
    # History file should be in the same directory as the executable (for persistence)
    if getattr(sys, 'frozen', False):
        # Running as executable - save history next to the .exe file
        base_path = os.path.dirname(sys.executable)
    else:
        # Running as script - save in script directory
        base_path = os.path.dirname(os.path.abspath(__file__))
    
    log_file = os.path.join(base_path, "search_history.json")
    history_entry = {
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "query": query,
        "folders": folders,
        "results_count": results_count,
        "exact_match": exact_match,
        "case_sensitive": case_sensitive,
        "search_filenames": search_filenames
    }
    
    try:
        # Read existing history
        if os.path.exists(log_file):
            with open(log_file, 'r', encoding='utf-8') as f:
                history = json.load(f)
        else:
            history = []
        
        # Append new entry
        history.append(history_entry)
        
        # Keep only last 100 entries
        if len(history) > 100:
            history = history[-100:]
        
        # Write back
        with open(log_file, 'w', encoding='utf-8') as f:
            json.dump(history, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"Error logging search history: {e}")

async def search_files(search_request: SearchRequest) -> List[FileResult]:
    """Search for query in all files across selected folders"""
    all_files = []
    
    # Collect all files from selected folders (always get all files, don't filter by filename)
    for folder in search_request.folders:
        if os.path.isdir(folder):
            all_files.extend(get_supported_files(folder))
    
    file_results = []
    
    # Search in each file
    for file_path in all_files:
        ext = os.path.splitext(file_path)[1].lower()
        matches = []
        
        # If filename search was requested, check filename match
        if search_request.search_filenames:
            filename = os.path.basename(file_path)
            if search_request.case_sensitive:
                search_filename = filename
                search_query = search_request.query
            else:
                search_filename = filename.lower()
                search_query = search_request.query.lower()
            
            if search_query in search_filename:
                # Count occurrences in filename
                count = search_filename.count(search_query)
                matches.append(SearchResult(
                    file_path=file_path,
                    line_number=None,
                    content=f"Filename match: {filename}",
                    occurrences=count
                ))
        
        # Always search file contents (regardless of filename search setting)
        if ext == '.txt':
            content_matches = search_txt(file_path, search_request.query, search_request.exact_match, search_request.case_sensitive)
            matches.extend(content_matches)
        elif ext in ['.docx', '.doc']:
            content_matches = search_docx(file_path, search_request.query, search_request.exact_match, search_request.case_sensitive)
            matches.extend(content_matches)
        elif ext in ['.xlsx', '.xls']:
            content_matches = search_xlsx(file_path, search_request.query, search_request.exact_match, search_request.case_sensitive)
            matches.extend(content_matches)
        elif ext in ['.pptx', '.ppt']:
            content_matches = search_pptx(file_path, search_request.query, search_request.exact_match, search_request.case_sensitive)
            matches.extend(content_matches)
        elif ext == '.pdf':
            content_matches = search_pdf(file_path, search_request.query, search_request.exact_match, search_request.case_sensitive)
            matches.extend(content_matches)
        
        # Include file in results if it has any matches (filename OR content)
        if matches:
            total_occurrences = sum(m.occurrences for m in matches)
            file_results.append(FileResult(
                file_path=file_path,
                total_occurrences=total_occurrences,
                matches=matches
            ))
    
    return file_results

@app.get("/", response_class=HTMLResponse)
async def read_root():
    """Serve the main HTML page"""
    template_path = resource_path("templates/index.html")
    if not os.path.exists(template_path):
        return HTMLResponse(content="<h1>Error: templates/index.html not found</h1><p>Path: " + template_path + "</p>", status_code=500)
    with open(template_path, "r", encoding="utf-8") as f:
        return HTMLResponse(content=f.read())

@app.post("/api/search")
async def search(search_request: SearchRequest):
    """Search endpoint"""
    try:
        results = await search_files(search_request)
        results_count = len(results)
        
        # Log search history
        log_search_history(
            search_request.query,
            search_request.folders,
            results_count,
            search_request.exact_match,
            search_request.case_sensitive,
            search_request.search_filenames
        )
        
        return JSONResponse(content={"results": [r.dict() for r in results]})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/history")
async def get_history():
    """Get search history"""
    # History file should be in the same directory as the executable (for persistence)
    if getattr(sys, 'frozen', False):
        # Running as executable - save history next to the .exe file
        base_path = os.path.dirname(sys.executable)
    else:
        # Running as script - save in script directory
        base_path = os.path.dirname(os.path.abspath(__file__))
    
    log_file = os.path.join(base_path, "search_history.json")
    try:
        if os.path.exists(log_file):
            with open(log_file, 'r', encoding='utf-8') as f:
                history = json.load(f)
            # Return in reverse order (newest first)
            return JSONResponse(content={"history": list(reversed(history))})
        else:
            return JSONResponse(content={"history": []})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health():
    """Health check endpoint"""
    return {
        "status": "ok",
        "docx": DOCX_AVAILABLE,
        "xlsx": XLSX_AVAILABLE,
        "pptx": PPTX_AVAILABLE,
        "pdf": PDF_AVAILABLE
    }

if __name__ == "__main__":
    import uvicorn
    import webbrowser
    import threading
    import time
    
    # Detect if running as PyInstaller executable
    if getattr(sys, 'frozen', False):
        # Running as compiled executable
        # Change to executable directory for data files (history, etc.)
        application_path = os.path.dirname(sys.executable)
        os.chdir(application_path)
        print("=" * 60)
        print("  अन्वेष (Anvesh) - Advanced File Search")
        print("=" * 60)
        print("\nStarting server...")
        print("Please wait, this may take a moment...\n")
    else:
        # Running as script
        print("=" * 60)
        print("  अन्वेष (Anvesh) - Advanced File Search")
        print("=" * 60)
        print("\nStarting server on http://127.0.0.1:8000")
        print("Press Ctrl+C to stop the server\n")
    
    # Function to open browser after delay
    def open_browser():
        time.sleep(2)  # Wait for server to start
        try:
            url = "http://127.0.0.1:8000"
            webbrowser.open(url)
            if getattr(sys, 'frozen', False):
                print(f"✓ Browser opened at {url}")
                print("\n" + "=" * 60)
                print("Server is running!")
                print("=" * 60)
                print("\nKeep this window open while using Anvesh.")
                print("Close this window to stop the server.\n")
        except Exception as e:
            print(f"Could not open browser automatically: {e}")
            print(f"Please open http://127.0.0.1:8000 in your browser manually")
    
    # Start browser opener in background
    browser_thread = threading.Thread(target=open_browser, daemon=True)
    browser_thread.start()
    
    try:
        uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")
    except KeyboardInterrupt:
        print("\n\nServer stopped by user.")
    except Exception as e:
        print(f"\n\nERROR: Failed to start server: {e}")
        print("\nPress any key to exit...")
        if getattr(sys, 'frozen', False):
            input()

