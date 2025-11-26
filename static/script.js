const API_BASE = 'http://127.0.0.1:8000';

document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.getElementById('searchForm');
    const searchBtn = document.getElementById('searchBtn');
    const resultsSection = document.getElementById('resultsSection');
    const resultsContainer = document.getElementById('resultsContainer');
    const resultsCount = document.getElementById('resultsCount');
    const browseFoldersBtn = document.getElementById('browseFoldersBtn');
    const folderPicker = document.getElementById('folderPicker');
    const foldersInput = document.getElementById('foldersInput');
    const refreshHistoryBtn = document.getElementById('refreshHistoryBtn');
    const historyContainer = document.getElementById('historyContainer');

    // Add floating particles animation
    createParticles();
    
    // Load search history on page load
    loadSearchHistory();
    
    // Folder browser button
    browseFoldersBtn.addEventListener('click', function() {
        folderPicker.click();
    });
    
    // Handle folder selection
    folderPicker.addEventListener('change', function(e) {
        const selectedFolders = new Set();
        
        // Get unique folder paths from selected files
        for (let file of e.target.files) {
            const folderPath = file.webkitRelativePath.split('/')[0];
            // Get full path (approximate - browser security limits this)
            // We'll use the file path to extract folder
            const fullPath = file.path || file.name;
            if (fullPath) {
                const folder = fullPath.substring(0, fullPath.lastIndexOf('\\') || fullPath.lastIndexOf('/'));
                if (folder) {
                    selectedFolders.add(folder);
                }
            }
        }
        
        // Note: Due to browser security, we can't get full paths from file picker
        // So we'll show a message and let user enter manually
        if (selectedFolders.size > 0) {
            const currentFolders = foldersInput.value.split('\n').filter(f => f.trim());
            selectedFolders.forEach(f => {
                if (f && !currentFolders.includes(f)) {
                    currentFolders.push(f);
                }
            });
            foldersInput.value = currentFolders.join('\n');
            showAlert('Folders selected. Please verify paths are correct and adjust if needed.', 'info');
        } else {
            showAlert('Note: Browser security limits folder path access. Please enter folder paths manually in the text area.', 'info');
        }
    });
    
    // Refresh history button
    refreshHistoryBtn.addEventListener('click', function() {
        loadSearchHistory();
    });

    searchForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const query = document.getElementById('searchQuery').value.trim();
        const foldersInput = document.getElementById('foldersInput').value.trim();
        const exactMatch = document.getElementById('exactMatch').checked;
        const caseSensitive = document.getElementById('caseSensitive').checked;
        const searchFilenames = document.getElementById('searchFilenames').checked;

        if (!query || !foldersInput) {
            showAlert('Please enter a search query and at least one folder path.', 'warning');
            return;
        }

        // Parse folders (support both newline and comma separation)
        const folders = foldersInput
            .split(/[,\n]/)
            .map(f => f.trim())
            .filter(f => f.length > 0);

        if (folders.length === 0) {
            showAlert('Please enter at least one valid folder path.', 'warning');
            return;
        }

        // Show loading state
        setLoadingState(true);
        resultsSection.classList.add('d-none');
        resultsContainer.innerHTML = '';

        try {
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

            const data = await response.json();
            displayResults(data.results, query);
            
            // Refresh history after search
            loadSearchHistory();

        } catch (error) {
            console.error('Search error:', error);
            showAlert(`Error performing search: ${error.message}`, 'danger');
        } finally {
            setLoadingState(false);
        }
    });
    
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
    window.loadHistoryEntry = function(query, folders, exactMatch, caseSensitive, searchFilenames) {
        document.getElementById('searchQuery').value = query;
        document.getElementById('foldersInput').value = folders.join('\n');
        document.getElementById('exactMatch').checked = exactMatch;
        document.getElementById('caseSensitive').checked = caseSensitive;
        document.getElementById('searchFilenames').checked = searchFilenames;
        
        // Scroll to form
        document.getElementById('searchForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

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

    function displayResults(results, query) {
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
            
            const fileDiv = document.createElement('div');
            fileDiv.className = 'result-item';
            fileDiv.style.animationDelay = `${index * 0.1}s`;
            
            fileDiv.innerHTML = `
                <div class="file-path">
                    <i class="fas fa-file me-2"></i>${escapeHtml(fileResult.file_path)}
                </div>
                <div class="mb-2">
                    <span class="occurrence-badge">
                        <i class="fas fa-hashtag me-1"></i>${fileResult.total_occurrences} occurrence(s)
                    </span>
                </div>
                <div class="matches-container">
                    ${fileResult.matches.map((match, matchIndex) => `
                        <div class="match-item" style="animation-delay: ${(index * 0.1 + matchIndex * 0.05)}s">
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
            
            resultsContainer.appendChild(fileDiv);
        });

        resultsCount.textContent = `${totalFiles} file(s) - ${totalOccurrences} total occurrence(s)`;
        resultsSection.classList.remove('d-none');
        
        // Smooth scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

