const API_BASE = 'http://127.0.0.1:8000';

document.addEventListener('DOMContentLoaded', function() {
    loadCapabilities();
});

function loadCapabilities() {
    fetch(`${API_BASE}/api/ai/capabilities`)
        .then(response => response.json())
        .then(data => {
            const statusDiv = document.getElementById('capabilitiesStatus');
            if (data.available === false) {
                statusDiv.innerHTML = `
                    <div class="alert alert-warning">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        AI features are not available. Please install required dependencies.
                        <br><small>Run: pip install opencv-python pytesseract face-recognition ultralytics</small>
                    </div>
                `;
                return;
            }
            
            const capabilities = [
                { name: 'OCR', available: data.ocr, icon: 'fa-image' },
                { name: 'Face Detection', available: data.face_detection, icon: 'fa-user' },
                { name: 'Object Detection', available: data.object_detection, icon: 'fa-eye' },
                { name: 'Face Matching', available: data.face_matching, icon: 'fa-user-friends' }
            ];
            
            const badges = capabilities.map(cap => `
                <span class="badge ${cap.available ? 'bg-success' : 'bg-secondary'} me-2 mb-2">
                    <i class="fas ${cap.icon} me-1"></i>${cap.name}: ${cap.available ? 'Available' : 'Not Available'}
                </span>
            `).join('');
            
            statusDiv.innerHTML = badges;
        })
        .catch(error => {
            document.getElementById('capabilitiesStatus').innerHTML = 
                `<div class="alert alert-danger">Error loading capabilities: ${error.message}</div>`;
        });
}

function showProcessing(message = 'Processing...') {
    document.getElementById('processingMessage').textContent = message;
    document.getElementById('processingOverlay').style.display = 'flex';
}

function hideProcessing() {
    document.getElementById('processingOverlay').style.display = 'none';
}

function showResults(content) {
    document.getElementById('resultsContainer').innerHTML = content;
    document.getElementById('resultsSection').classList.remove('d-none');
    document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
}

function clearResults() {
    document.getElementById('resultsContainer').innerHTML = '';
    document.getElementById('resultsSection').classList.add('d-none');
}

function openOCRImage() {
    const path = prompt('Enter image file path:');
    if (!path) return;
    
    showProcessing('Extracting text from image...');
    
    fetch(`${API_BASE}/api/ai/ocr/image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_path: path })
    })
    .then(response => response.json())
    .then(data => {
        hideProcessing();
        if (data.error) {
            showResults(`<div class="alert alert-danger">${data.error}</div>`);
            return;
        }
        
        let html = `<h6>Extracted Text:</h6>`;
        html += `<div class="alert alert-info"><pre style="white-space: pre-wrap;">${escapeHtml(data.text || data.full_text || 'No text found')}</pre></div>`;
        
        if (data.boxes && data.boxes.length > 0) {
            html += `<h6>Text Boxes (${data.boxes.length}):</h6>`;
            html += `<div class="table-responsive"><table class="table table-sm">`;
            html += `<thead><tr><th>Text</th><th>Confidence</th><th>Position</th></tr></thead><tbody>`;
            data.boxes.forEach(box => {
                html += `<tr><td>${escapeHtml(box.text)}</td><td>${box.confidence.toFixed(1)}%</td><td>(${box.left}, ${box.top})</td></tr>`;
            });
            html += `</tbody></table></div>`;
        }
        
        showResults(html);
    })
    .catch(error => {
        hideProcessing();
        showResults(`<div class="alert alert-danger">Error: ${error.message}</div>`);
    });
}

function openOCRVideo() {
    const path = prompt('Enter video file path:');
    if (!path) return;
    
    const interval = prompt('Process every Nth frame (default: 30):', '30');
    const frameInterval = parseInt(interval) || 30;
    
    showProcessing('Extracting text from video frames... This may take a while.');
    
    fetch(`${API_BASE}/api/ai/ocr/video`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_path: path, frame_interval: frameInterval })
    })
    .then(response => response.json())
    .then(data => {
        hideProcessing();
        if (data.error) {
            showResults(`<div class="alert alert-danger">${data.error}</div>`);
            return;
        }
        
        let html = `<h6>Video OCR Results:</h6>`;
        html += `<p>Total Frames: ${data.total_frames}, Processed: ${data.frames_processed}</p>`;
        html += `<div class="alert alert-info"><pre style="white-space: pre-wrap;">${escapeHtml(data.text || 'No text found')}</pre></div>`;
        
        if (data.frame_texts && data.frame_texts.length > 0) {
            html += `<h6>Text by Frame:</h6>`;
            html += `<div class="table-responsive"><table class="table table-sm">`;
            html += `<thead><tr><th>Frame</th><th>Time (s)</th><th>Text</th></tr></thead><tbody>`;
            data.frame_texts.forEach(item => {
                html += `<tr><td>${item.frame}</td><td>${item.time.toFixed(2)}</td><td>${escapeHtml(item.text)}</td></tr>`;
            });
            html += `</tbody></table></div>`;
        }
        
        showResults(html);
    })
    .catch(error => {
        hideProcessing();
        showResults(`<div class="alert alert-danger">Error: ${error.message}</div>`);
    });
}

function openObjectDetection() {
    const path = prompt('Enter image file path:');
    if (!path) return;
    
    const confidence = prompt('Confidence threshold (0.0-1.0, default: 0.25):', '0.25');
    const conf = parseFloat(confidence) || 0.25;
    
    showProcessing('Detecting objects in image...');
    
    fetch(`${API_BASE}/api/ai/detect/objects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_path: path, confidence: conf })
    })
    .then(response => response.json())
    .then(data => {
        hideProcessing();
        if (data.error) {
            showResults(`<div class="alert alert-danger">${data.error}</div>`);
            return;
        }
        
        let html = `<h6>Object Detection Results:</h6>`;
        html += `<p><strong>Objects Found: ${data.count}</strong></p>`;
        
        if (data.detections && data.detections.length > 0) {
            // Group by class
            const grouped = {};
            data.detections.forEach(det => {
                if (!grouped[det.class]) grouped[det.class] = [];
                grouped[det.class].push(det);
            });
            
            html += `<div class="table-responsive"><table class="table table-sm">`;
            html += `<thead><tr><th>Object</th><th>Count</th><th>Avg Confidence</th></tr></thead><tbody>`;
            
            Object.keys(grouped).forEach(cls => {
                const items = grouped[cls];
                const avgConf = items.reduce((sum, d) => sum + d.confidence, 0) / items.length;
                html += `<tr><td><strong>${escapeHtml(cls)}</strong></td><td>${items.length}</td><td>${(avgConf * 100).toFixed(1)}%</td></tr>`;
            });
            
            html += `</tbody></table></div>`;
            
            html += `<h6>Detailed Detections:</h6>`;
            html += `<div class="table-responsive"><table class="table table-sm">`;
            html += `<thead><tr><th>Object</th><th>Confidence</th><th>Bounding Box</th></tr></thead><tbody>`;
            data.detections.forEach(det => {
                html += `<tr><td>${escapeHtml(det.class)}</td><td>${(det.confidence * 100).toFixed(1)}%</td><td>(${det.bbox.x1.toFixed(0)}, ${det.bbox.y1.toFixed(0)}) - (${det.bbox.x2.toFixed(0)}, ${det.bbox.y2.toFixed(0)})</td></tr>`;
            });
            html += `</tbody></table></div>`;
        }
        
        showResults(html);
    })
    .catch(error => {
        hideProcessing();
        showResults(`<div class="alert alert-danger">Error: ${error.message}</div>`);
    });
}

function openFaceDetection() {
    const path = prompt('Enter image file path:');
    if (!path) return;
    
    showProcessing('Detecting faces in image...');
    
    fetch(`${API_BASE}/api/ai/detect/faces`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_path: path })
    })
    .then(response => response.json())
    .then(data => {
        hideProcessing();
        if (data.error) {
            showResults(`<div class="alert alert-danger">${data.error}</div>`);
            return;
        }
        
        let html = `<h6>Face Detection Results:</h6>`;
        html += `<p><strong>Faces Found: ${data.count}</strong></p>`;
        
        if (data.faces && data.faces.length > 0) {
            html += `<div class="table-responsive"><table class="table table-sm">`;
            html += `<thead><tr><th>Face ID</th><th>Location</th></tr></thead><tbody>`;
            data.faces.forEach(face => {
                html += `<tr><td>${face.face_id}</td><td>Top: ${face.location.top}, Right: ${face.location.right}, Bottom: ${face.location.bottom}, Left: ${face.location.left}</td></tr>`;
            });
            html += `</tbody></table></div>`;
        }
        
        showResults(html);
    })
    .catch(error => {
        hideProcessing();
        showResults(`<div class="alert alert-danger">Error: ${error.message}</div>`);
    });
}

function openFaceDetectionVideo() {
    const path = prompt('Enter video file path:');
    if (!path) return;
    
    const interval = prompt('Process every Nth frame (default: 30):', '30');
    const frameInterval = parseInt(interval) || 30;
    
    showProcessing('Detecting faces in video... This may take a while.');
    
    fetch(`${API_BASE}/api/ai/detect/faces/video`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_path: path, frame_interval: frameInterval })
    })
    .then(response => response.json())
    .then(data => {
        hideProcessing();
        if (data.error) {
            showResults(`<div class="alert alert-danger">${data.error}</div>`);
            return;
        }
        
        let html = `<h6>Face Detection Results:</h6>`;
        html += `<p>Total Frames: ${data.total_frames}, Faces Detected: ${data.faces_detected}</p>`;
        
        if (data.faces && data.faces.length > 0) {
            html += `<div class="table-responsive"><table class="table table-sm">`;
            html += `<thead><tr><th>Frame</th><th>Time (s)</th><th>Location</th></tr></thead><tbody>`;
            data.faces.forEach(face => {
                html += `<tr><td>${face.frame}</td><td>${face.time.toFixed(2)}</td><td>Top: ${face.location.top}, Right: ${face.location.right}, Bottom: ${face.location.bottom}, Left: ${face.location.left}</td></tr>`;
            });
            html += `</tbody></table></div>`;
        }
        
        showResults(html);
    })
    .catch(error => {
        hideProcessing();
        showResults(`<div class="alert alert-danger">Error: ${error.message}</div>`);
    });
}

function openFaceMatching() {
    const path1 = prompt('Enter first image file path:');
    if (!path1) return;
    
    const path2 = prompt('Enter second image file path:');
    if (!path2) return;
    
    const threshold = prompt('Similarity threshold (0.0-1.0, default: 0.6):', '0.6');
    const thresh = parseFloat(threshold) || 0.6;
    
    showProcessing('Matching faces between images...');
    
    fetch(`${API_BASE}/api/ai/match/faces`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image1_path: path1, image2_path: path2, threshold: thresh })
    })
    .then(response => response.json())
    .then(data => {
        hideProcessing();
        if (data.error) {
            showResults(`<div class="alert alert-danger">${data.error}</div>`);
            return;
        }
        
        let html = `<h6>Face Matching Results:</h6>`;
        html += `<p>Faces in Image 1: ${data.faces_in_image1}, Faces in Image 2: ${data.faces_in_image2}</p>`;
        
        if (data.matches && data.matches.length > 0) {
            html += `<div class="table-responsive"><table class="table table-sm">`;
            html += `<thead><tr><th>Face 1</th><th>Face 2</th><th>Similarity</th><th>Match</th></tr></thead><tbody>`;
            data.matches.forEach(match => {
                const badgeClass = match.is_match ? 'bg-success' : 'bg-secondary';
                html += `<tr>
                    <td>${match.face1_index}</td>
                    <td>${match.face2_index}</td>
                    <td><span class="badge ${badgeClass} face-match-badge">${match.similarity_percentage.toFixed(2)}%</span></td>
                    <td>${match.is_match ? '<span class="badge bg-success">Match</span>' : '<span class="badge bg-secondary">No Match</span>'}</td>
                </tr>`;
            });
            html += `</tbody></table></div>`;
            
            if (data.best_match) {
                html += `<div class="alert alert-info mt-3">`;
                html += `<strong>Best Match:</strong> Face ${data.best_match.face1_index} ↔ Face ${data.best_match.face2_index} `;
                html += `<span class="badge bg-primary">${data.best_match.similarity_percentage.toFixed(2)}% similar</span>`;
                html += `</div>`;
            }
        }
        
        showResults(html);
    })
    .catch(error => {
        hideProcessing();
        showResults(`<div class="alert alert-danger">Error: ${error.message}</div>`);
    });
}

function openFindFacesInFolder() {
    const refPath = prompt('Enter reference image file path:');
    if (!refPath) return;
    
    const folderPath = prompt('Enter folder path to search:');
    if (!folderPath) return;
    
    const threshold = prompt('Similarity threshold (0.0-1.0, default: 0.6):', '0.6');
    const thresh = parseFloat(threshold) || 0.6;
    
    showProcessing('Searching for matching faces in folder... This may take a while.');
    
    fetch(`${API_BASE}/api/ai/match/faces/folder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference_image_path: refPath, folder_path: folderPath, threshold: thresh })
    })
    .then(response => response.json())
    .then(data => {
        hideProcessing();
        if (data.error) {
            showResults(`<div class="alert alert-danger">${data.error}</div>`);
            return;
        }
        
        let html = `<h6>Face Search Results:</h6>`;
        html += `<p><strong>Reference Image:</strong> ${escapeHtml(data.reference_image)}</p>`;
        html += `<p><strong>Matches Found: ${data.matches_found}</strong></p>`;
        
        if (data.matches && data.matches.length > 0) {
            html += `<div class="table-responsive"><table class="table table-sm">`;
            html += `<thead><tr><th>Image</th><th>Similarity</th></tr></thead><tbody>`;
            data.matches.forEach(match => {
                html += `<tr>
                    <td>${escapeHtml(match.image_path)}</td>
                    <td><span class="badge bg-success face-match-badge">${match.similarity_percentage.toFixed(2)}%</span></td>
                </tr>`;
            });
            html += `</tbody></table></div>`;
        } else {
            html += `<div class="alert alert-warning">No matching faces found.</div>`;
        }
        
        showResults(html);
    })
    .catch(error => {
        hideProcessing();
        showResults(`<div class="alert alert-danger">Error: ${error.message}</div>`);
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

