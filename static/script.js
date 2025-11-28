const API_BASE = 'http://127.0.0.1:8000';

document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.getElementById('searchForm');
    const searchBtn = document.getElementById('searchBtn');
    const resultsSection = document.getElementById('resultsSection');
    const resultsContainer = document.getElementById('resultsContainer');
    const resultsCount = document.getElementById('resultsCount');
    const browseFoldersBtn = document.getElementById('browseFoldersBtn');
    const addFolderBtn = document.getElementById('addFolderBtn');
    const folderPicker = document.getElementById('folderPicker');
    const foldersInput = document.getElementById('foldersInput');
    const foldersList = document.getElementById('foldersList');
    const refreshHistoryBtn = document.getElementById('refreshHistoryBtn');
    const historyContainer = document.getElementById('historyContainer');
    const searchProgress = document.getElementById('searchProgress');
    const searchStatus = document.getElementById('searchStatus');
    const elapsedTimeSpan = document.getElementById('elapsedTime');

    let folders = [];
    let searchStartTime = null;
    let timeInterval = null;
    let currentEventSource = null;

    // Add floating particles animation
    createParticles();
    
    // Load search history on page load
    loadSearchHistory();
    
    // Load saved folders from localStorage
    loadFolders();
    
    // Folder browser button
    browseFoldersBtn.addEventListener('click', function() {
        folderPicker.click();
    });
    
    // Add folder button
    addFolderBtn.addEventListener('click', function() {
        const path = prompt('Enter folder path:');
        if (path && path.trim()) {
            addFolder(path.trim());
        }
    });
    
    // Handle folder selection from file picker
    folderPicker.addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            // Browser security prevents getting full paths from file picker
            // We need to extract the common parent directory from selected files
            const files = Array.from(e.target.files);
            const paths = files.map(f => f.webkitRelativePath || f.name);
            
            if (paths.length > 0 && paths[0]) {
                // Extract the folder path from the first file's relative path
                const firstPath = paths[0];
                const folderName = firstPath.split('/')[0] || firstPath.split('\\')[0];
                
                // Show a better prompt with instructions
                const message = `Browser security limits folder path access.\n\n` +
                              `Detected folder name: "${folderName}"\n\n` +
                              `Please enter the FULL folder path manually.\n\n` +
                              `Example: C:\\Users\\Documents\\MyFolder`;
                
                const fullPath = prompt(message, '');
                if (fullPath && fullPath.trim()) {
                    // Validate the path exists (will be checked server-side, but show helpful message)
                    addFolder(fullPath.trim());
                    showAlert('Folder added. Make sure the path is correct and accessible.', 'info');
                } else {
                    showAlert('No folder path entered. Please use "Add Folder Path" button to type the path manually.', 'warning');
                }
            } else {
                // No relative path available
                showAlert('Browser security prevents automatic folder detection.\n\nPlease use "Add Folder Path" button to enter the folder path manually.', 'info');
            }
        }
        // Reset file input
        e.target.value = '';
    });
    
    // Handle Enter key in folders input
    foldersInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const path = foldersInput.value.trim();
            if (path) {
                addFolder(path);
                foldersInput.value = '';
            }
        }
    });
    
    function addFolder(path) {
        if (!folders.includes(path)) {
            folders.push(path);
            saveFolders();
            renderFolders();
        }
    }
    
    function removeFolder(index) {
        folders.splice(index, 1);
        saveFolders();
        renderFolders();
    }
    
    function renderFolders() {
        foldersList.innerHTML = '';
        folders.forEach((folder, index) => {
            const folderDiv = document.createElement('div');
            folderDiv.className = 'input-group mb-2';
            folderDiv.innerHTML = `
                <input type="text" class="form-control" value="${escapeHtml(folder)}" readonly title="${escapeHtml(folder)}">
                <button type="button" class="btn btn-outline-danger" onclick="removeFolderAt(${index})" title="Remove">
                    <i class="fas fa-times"></i>
                </button>
            `;
            foldersList.appendChild(folderDiv);
        });
        
        if (folders.length === 0) {
            foldersList.innerHTML = '<small class="text-muted">No folders added. Click "Browse Folder" or "Add Folder Path" to add.</small>';
        } else {
            // Show folder count
            const countDiv = document.createElement('div');
            countDiv.className = 'mt-2';
            countDiv.innerHTML = `<small class="text-muted"><i class="fas fa-info-circle me-1"></i>${folders.length} folder(s) added</small>`;
            foldersList.appendChild(countDiv);
        }
    }
    
    // Make removeFolderAt available globally
    window.removeFolderAt = function(index) {
        removeFolder(index);
    };
    
    function saveFolders() {
        localStorage.setItem('anvesh_folders', JSON.stringify(folders));
    }
    
    function loadFolders() {
        const saved = localStorage.getItem('anvesh_folders');
        if (saved) {
            try {
                folders = JSON.parse(saved);
                renderFolders();
            } catch (e) {
                folders = [];
            }
        }
    }
    
    // Refresh history button
    refreshHistoryBtn.addEventListener('click', function() {
        loadSearchHistory();
    });

    searchForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const query = document.getElementById('searchQuery').value.trim();
        const exactMatch = document.getElementById('exactMatch').checked;
        const caseSensitive = document.getElementById('caseSensitive').checked;
        const searchFilenames = document.getElementById('searchFilenames').checked;

        if (!query) {
            showAlert('Please enter a search query.', 'warning');
            return;
        }
        
        if (folders.length === 0) {
            showAlert('Please add at least one folder to search.', 'warning');
            return;
        }

        // Stop any existing search
        if (currentEventSource) {
            currentEventSource.close();
        }

        // Show loading state
        setLoadingState(true);
        resultsSection.classList.remove('d-none');
        resultsContainer.innerHTML = '';
        resultsCount.textContent = '0';
        searchProgress.style.display = 'block';
        searchProgress.querySelector('.progress-bar').style.width = '0%';
        searchStatus.textContent = 'Starting search...';
        
        // Start time tracking
        searchStartTime = Date.now();
        startTimeTracking();

        try {
            // Use fetch with streaming for POST requests
            const response = await fetch(`${API_BASE}/api/search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: query,
                    folders: folders,
                    exact_match: exactMatch,
                    case_sensitive: caseSensitive,
                    search_filenames: searchFilenames
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let resultCount = 0;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.substring(6));
                            
                            if (data.type === 'status') {
                                searchStatus.textContent = data.message || `Searching ${data.total_files} files...`;
                            } else if (data.type === 'progress') {
                                const progress = data.progress || 0;
                                searchProgress.querySelector('.progress-bar').style.width = progress + '%';
                                searchStatus.textContent = `Processing ${data.files_processed}/${data.total_files} files... (${data.results_found || 0} results found)`;
                            } else if (data.type === 'result') {
                                resultCount++;
                                displaySingleResult(data.data, query);
                                resultsCount.textContent = resultCount;
                            } else if (data.type === 'complete') {
                                stopTimeTracking();
                                searchProgress.style.display = 'none';
                                searchStatus.textContent = `Search completed! Found ${data.total_results || resultCount} result(s) in ${formatTime((Date.now() - searchStartTime) / 1000)}`;
                                setLoadingState(false);
                                
                                // Refresh history
                                loadSearchHistory();
                            }
                        } catch (e) {
                            console.error('Error parsing SSE data:', e);
                        }
                    }
                }
            }

        } catch (error) {
            console.error('Search error:', error);
            showAlert(`Error performing search: ${error.message}`, 'danger');
            stopTimeTracking();
            setLoadingState(false);
            searchProgress.style.display = 'none';
        }
    });
    
    function startTimeTracking() {
        if (timeInterval) clearInterval(timeInterval);
        timeInterval = setInterval(() => {
            if (searchStartTime) {
                const elapsed = (Date.now() - searchStartTime) / 1000;
                elapsedTimeSpan.textContent = formatTime(elapsed);
            }
        }, 100);
    }
    
    function stopTimeTracking() {
        if (timeInterval) {
            clearInterval(timeInterval);
            timeInterval = null;
        }
    }
    
    function formatTime(seconds) {
        if (seconds < 60) {
            return seconds.toFixed(1) + 's';
        } else if (seconds < 3600) {
            const mins = Math.floor(seconds / 60);
            const secs = (seconds % 60).toFixed(1);
            return mins + 'm ' + secs + 's';
        } else {
            const hrs = Math.floor(seconds / 3600);
            const mins = Math.floor((seconds % 3600) / 60);
            const secs = (seconds % 60).toFixed(1);
            return hrs + 'h ' + mins + 'm ' + secs + 's';
        }
    }

    function setLoadingState(loading) {
        const btnText = searchBtn.querySelector('.btn-text');
        const spinner = searchBtn.querySelector('.spinner-border');
        
        if (loading) {
            searchBtn.disabled = true;
            btnText.textContent = 'Searching...';
            spinner.classList.remove('d-none');
        } else {
            searchBtn.disabled = false;
            btnText.textContent = 'Search';
            spinner.classList.add('d-none');
        }
    }

    function displaySingleResult(fileResult, query) {
        const fileDiv = document.createElement('div');
        fileDiv.className = 'result-item';
        fileDiv.style.animationDelay = '0s';
        
        fileDiv.innerHTML = `
            <div class="file-path clickable-file" data-path="${escapeHtml(fileResult.file_path)}">
                <i class="fas fa-file me-2"></i>${escapeHtml(fileResult.file_path)}
                <i class="fas fa-external-link-alt ms-2" style="font-size: 0.8em; opacity: 0.7;"></i>
            </div>
            <div class="mb-2">
                <span class="occurrence-badge">
                    <i class="fas fa-hashtag me-1"></i>${fileResult.total_occurrences} occurrence(s)
                </span>
            </div>
            <div class="matches-container">
                ${fileResult.matches.map((match, matchIndex) => `
                    <div class="match-item clickable-match" 
                         data-path="${escapeHtml(fileResult.file_path)}" 
                         data-line="${match.line_number || ''}"
                         style="animation-delay: ${matchIndex * 0.05}s">
                        <div class="d-flex align-items-center mb-2">
                            <span class="line-number">
                                <i class="fas fa-list-ol me-1"></i>Line ${match.line_number || 'N/A'}
                            </span>
                            <span class="occurrence-badge">
                                <i class="fas fa-times me-1"></i>${match.occurrences}x
                            </span>
                        </div>
                        <div class="match-content">
                            ${highlightText(escapeHtml(match.content), query)}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        // Add click handlers
        const filePathEl = fileDiv.querySelector('.clickable-file');
        filePathEl.style.cursor = 'pointer';
        filePathEl.addEventListener('click', () => openFile(fileResult.file_path));
        
        fileDiv.querySelectorAll('.clickable-match').forEach(matchEl => {
            matchEl.style.cursor = 'pointer';
            matchEl.addEventListener('click', () => {
                const path = matchEl.getAttribute('data-path');
                const line = matchEl.getAttribute('data-line');
                openFileAtLine(path, line);
            });
        });
        
        resultsContainer.appendChild(fileDiv);
        
        // Smooth scroll to new result
        fileDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function openFile(filePath) {
        // Try to open file with default application
        fetch(`${API_BASE}/api/open-file`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: filePath })
        }).catch(() => {
            // Fallback: try using file:// protocol
            const fileUrl = 'file:///' + filePath.replace(/\\/g, '/');
            window.open(fileUrl, '_blank');
        });
    }
    
    function openFileAtLine(filePath, lineNumber) {
        if (lineNumber && lineNumber !== 'N/A' && lineNumber !== 'null') {
            // For text files, we can try to open at line number
            // This requires backend support or using file:// with line number
            fetch(`${API_BASE}/api/open-file`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path: filePath, line: parseInt(lineNumber) })
            }).catch(() => {
                openFile(filePath);
            });
        } else {
            openFile(filePath);
        }
    }

    function displayResults(results, query) {
        // Legacy function for non-streaming (kept for compatibility)
        if (results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h4>No Results Found</h4>
                    <p>Try adjusting your search query or folder paths.</p>
                </div>
            `;
            resultsSection.classList.remove('d-none');
            resultsCount.textContent = '0';
            return;
        }

        let totalFiles = results.length;
        let totalOccurrences = 0;

        results.forEach((fileResult, index) => {
            totalOccurrences += fileResult.total_occurrences;
            displaySingleResult(fileResult, query);
        });

        resultsCount.textContent = `${totalFiles} file(s) - ${totalOccurrences} total occurrence(s)`;
        resultsSection.classList.remove('d-none');
    }

    function highlightText(text, query) {
        if (!query) return text;
        const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
        return text.replace(regex, '<mark style="background: #ffd700; padding: 2px 4px; border-radius: 3px;">$1</mark>');
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function showAlert(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
        alertDiv.style.zIndex = '9999';
        alertDiv.style.minWidth = '300px';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(alertDiv);
        
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }

    function loadSearchHistory() {
        fetch(`${API_BASE}/api/history`)
            .then(response => response.json())
            .then(data => {
                displayHistory(data.history);
            })
            .catch(error => {
                console.error('Error loading history:', error);
            });
    }
    
    function displayHistory(history) {
        if (history.length === 0) {
            historyContainer.innerHTML = `
                <div class="text-center text-muted py-3">
                    <i class="fas fa-clock fa-2x mb-2"></i>
                    <p>No search history yet</p>
                </div>
            `;
            return;
        }
        
        historyContainer.innerHTML = history.map((entry, index) => `
            <div class="history-item mb-2 p-2 border rounded" style="cursor: pointer;" onclick="loadHistoryEntry('${escapeHtml(entry.query)}', ${JSON.stringify(entry.folders).replace(/"/g, '&quot;')}, ${entry.exact_match}, ${entry.case_sensitive}, ${entry.search_filenames})">
                <div class="d-flex justify-content-between align-items-start mb-1">
                    <small class="text-muted">
                        <i class="fas fa-clock me-1"></i>${entry.timestamp}
                    </small>
                    <span class="badge bg-secondary">${entry.results_count} results</span>
                </div>
                <div class="fw-bold text-truncate" title="${escapeHtml(entry.query)}">
                    <i class="fas fa-search me-1"></i>${escapeHtml(entry.query)}
                </div>
                <small class="text-muted d-block text-truncate" title="${entry.folders.join(', ')}">
                    <i class="fas fa-folder me-1"></i>${entry.folders.length} folder(s)
                </small>
                <div class="mt-1">
                    ${entry.exact_match ? '<span class="badge bg-info me-1">Exact</span>' : ''}
                    ${entry.case_sensitive ? '<span class="badge bg-warning me-1">Case</span>' : ''}
                    ${entry.search_filenames ? '<span class="badge bg-success">Filename</span>' : ''}
                </div>
            </div>
        `).join('');
    }
    
    // Make loadHistoryEntry available globally
    window.loadHistoryEntry = function(query, historyFolders, exactMatch, caseSensitive, searchFilenames) {
        document.getElementById('searchQuery').value = query;
        folders = historyFolders;
        saveFolders();
        renderFolders();
        document.getElementById('exactMatch').checked = exactMatch;
        document.getElementById('caseSensitive').checked = caseSensitive;
        document.getElementById('searchFilenames').checked = searchFilenames;
        
        // Scroll to form
        document.getElementById('searchForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    function createParticles() {
        const particleContainer = document.createElement('div');
        particleContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 0;
            overflow: hidden;
        `;
        document.body.appendChild(particleContainer);

        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                width: 4px;
                height: 4px;
                background: rgba(102, 126, 234, 0.5);
                border-radius: 50%;
                animation: float ${5 + Math.random() * 10}s ease-in-out infinite;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation-delay: ${Math.random() * 5}s;
            `;
            particleContainer.appendChild(particle);
        }

        // Add CSS animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes float {
                0%, 100% {
                    transform: translateY(0) translateX(0);
                    opacity: 0;
                }
                10% {
                    opacity: 1;
                }
                90% {
                    opacity: 1;
                }
                50% {
                    transform: translateY(-100px) translateX(${Math.random() * 100 - 50}px);
                }
            }
        `;
        document.head.appendChild(style);
    }
});
