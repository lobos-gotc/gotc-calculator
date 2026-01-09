/**
 * Craft History Module
 * Stores and manages calculation history using localStorage
 */

const HISTORY_STORAGE_KEY = 'craft-history-v1';
const MAX_HISTORY_ITEMS = 25;

/**
 * Get all history items from localStorage
 * @returns {Array} Array of history items
 */
function getHistory() {
    try {
        const data = localStorage.getItem(HISTORY_STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Failed to load history:', error);
        return [];
    }
}

/**
 * Save a calculation to history
 * @param {Object} calculation - The calculation data to save
 * @returns {boolean} Success status
 */
function saveToHistory(calculation) {
    if (!calculation) return false;
    
    try {
        const history = getHistory();
        
        // Create history entry
        const entry = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            // Summary for display
            summary: generateSummary(calculation),
            // Full calculation data
            data: {
                initialMaterials: calculation.initialMaterials || {},
                templateCounts: calculation.templateCounts || {},
                materialCounts: calculation.materialCounts || {},
                requestedTemplates: calculation.requestedTemplates || {},
                qualityMultipliers: calculation.qualityMultipliers || {},
                settings: calculation.settings || {},
                failedLevels: calculation.failedLevels || [],
                ctwMediumNotice: calculation.ctwMediumNotice || false,
                level20OnlyWarlordsActive: calculation.level20OnlyWarlordsActive || false
            }
        };
        
        // Add to beginning of array
        history.unshift(entry);
        
        // Keep only the latest MAX_HISTORY_ITEMS
        const trimmedHistory = history.slice(0, MAX_HISTORY_ITEMS);
        
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(trimmedHistory));
        
        // Update UI if modal is open
        updateHistoryUI();
        
        return true;
    } catch (error) {
        console.error('Failed to save to history:', error);
        return false;
    }
}

/**
 * Generate a summary for display in the history list
 * @param {Object} calculation - The calculation data
 * @returns {Object} Summary object
 */
function generateSummary(calculation) {
    const templateCounts = calculation.templateCounts || {};
    const materialCounts = calculation.materialCounts || {};
    
    // Count total items crafted
    let totalItems = 0;
    let levelsUsed = [];
    
    Object.entries(templateCounts).forEach(([level, templates]) => {
        if (templates && templates.length > 0) {
            const levelCount = templates.reduce((sum, t) => sum + (t.amount || 0), 0);
            if (levelCount > 0) {
                totalItems += levelCount;
                levelsUsed.push(level);
            }
        }
    });
    
    // Count materials used
    const materialsUsed = Object.keys(materialCounts).length;
    
    return {
        totalItems,
        levelsUsed: levelsUsed.sort((a, b) => parseInt(a) - parseInt(b)),
        materialsUsed
    };
}

/**
 * Delete a history item by ID
 * @param {number} id - The history item ID
 * @returns {boolean} Success status
 */
function deleteFromHistory(id) {
    try {
        const history = getHistory();
        const filtered = history.filter(item => item.id !== id);
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(filtered));
        updateHistoryUI();
        return true;
    } catch (error) {
        console.error('Failed to delete from history:', error);
        return false;
    }
}

/**
 * Clear all history
 * @returns {boolean} Success status
 */
function clearHistory() {
    try {
        localStorage.removeItem(HISTORY_STORAGE_KEY);
        updateHistoryUI();
        return true;
    } catch (error) {
        console.error('Failed to clear history:', error);
        return false;
    }
}

/**
 * Export history as JSON file
 */
function exportHistory() {
    const history = getHistory();
    if (history.length === 0) {
        alert('No history to export');
        return;
    }
    
    const dataStr = JSON.stringify(history, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `craft-history-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Import history from JSON file
 * @param {File} file - The JSON file to import
 */
function importHistory(file) {
    const reader = new FileReader();
    
    reader.onload = (e) => {
        try {
            const imported = JSON.parse(e.target.result);
            
            if (!Array.isArray(imported)) {
                throw new Error('Invalid history format');
            }
            
            const existingHistory = getHistory();
            const existingIds = new Set(existingHistory.map(h => h.id));
            
            // Merge imported with existing, avoiding duplicates
            const newItems = imported.filter(item => !existingIds.has(item.id));
            const merged = [...existingHistory, ...newItems]
                .sort((a, b) => b.id - a.id) // Sort by newest first
                .slice(0, MAX_HISTORY_ITEMS);
            
            localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(merged));
            updateHistoryUI();
            
            alert(`Imported ${newItems.length} new history items`);
        } catch (error) {
            console.error('Failed to import history:', error);
            alert('Failed to import history. Please check the file format.');
        }
    };
    
    reader.readAsText(file);
}

/**
 * Format timestamp for display
 * @param {string} timestamp - ISO timestamp
 * @returns {string} Formatted date/time
 */
function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
}

/**
 * Update the history UI in the modal
 */
function updateHistoryUI() {
    const historyList = document.getElementById('historyList');
    if (!historyList) return;
    
    const history = getHistory();
    
    if (history.length === 0) {
        historyList.innerHTML = `
            <div class="history-empty">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="48" height="48">
                    <path fill="currentColor" d="M75 75L41 41C25.9 25.9 0 36.6 0 57.9V168c0 13.3 10.7 24 24 24H134.1c21.4 0 32.1-25.9 17-41l-30.8-30.8C155 85.5 203 64 256 64c106 0 192 86 192 192s-86 192-192 192c-40.8 0-78.6-12.7-109.7-34.4c-14.5-10.1-34.4-6.6-44.6 7.9s-6.6 34.4 7.9 44.6C151.2 495 201.7 512 256 512c141.4 0 256-114.6 256-256S397.4 0 256 0C185.3 0 121.3 28.7 75 75zm181 53c-13.3 0-24 10.7-24 24V256c0 6.4 2.5 12.5 7 17l72 72c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-65-65V152c0-13.3-10.7-24-24-24z"/>
                </svg>
                <p>No calculation history yet</p>
                <span>Your calculations will appear here</span>
            </div>
        `;
        return;
    }
    
    historyList.innerHTML = history.map(item => `
        <div class="history-item" data-id="${item.id}">
            <div class="history-item__main" onclick="restoreFromHistory(${item.id})">
                <div class="history-item__icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="24" height="24">
                        <path fill="currentColor" d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z"/>
                    </svg>
                </div>
                <div class="history-item__info">
                    <div class="history-item__title">
                        ${item.summary.totalItems.toLocaleString()} items crafted
                    </div>
                    <div class="history-item__details">
                        Levels ${item.summary.levelsUsed.join(', ')} • ${item.summary.materialsUsed} materials
                    </div>
                    <div class="history-item__time">
                        ${formatTimestamp(item.timestamp)}
                    </div>
                </div>
            </div>
            <button class="history-item__delete" onclick="event.stopPropagation(); deleteFromHistory(${item.id})" aria-label="Delete">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="16" height="16">
                    <path fill="currentColor" d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"/>
                </svg>
            </button>
        </div>
    `).join('');
}

/**
 * Restore a calculation from history
 * @param {number} id - The history item ID
 */
function restoreFromHistory(id) {
    const history = getHistory();
    const item = history.find(h => h.id === id);
    
    if (!item || !item.data) {
        alert('Could not find history item');
        return;
    }
    
    // Close the history modal
    closeHistoryModal();
    
    // Use the existing restore function from craftparse.js
    if (typeof restoreSavedCalculation === 'function') {
        // Create a payload that matches the expected format
        const payload = {
            ...item.data,
            savedAt: item.timestamp,
            version: 1
        };
        
        try {
            // Pass the payload directly to restoreSavedCalculation
            const restored = restoreSavedCalculation(payload);
            
            if (restored) {
                // Navigate to results step in wizard
                if (typeof window.wizardShowResults === 'function') {
                    setTimeout(() => {
                        window.wizardShowResults();
                    }, 100);
                }
            } else {
                alert('Failed to restore calculation - data may be corrupted');
            }
        } catch (error) {
            console.error('Failed to restore calculation:', error);
            alert('Failed to restore calculation');
        }
    } else {
        alert('Restore function not available. Please refresh the page.');
    }
}

/**
 * Open the history modal
 */
function openHistoryModal() {
    const modal = document.getElementById('historyModal');
    if (modal) {
        updateHistoryUI();
        modal.style.display = 'flex';
        modal.setAttribute('aria-hidden', 'false');
    }
}

/**
 * Close the history modal
 */
function closeHistoryModal() {
    const modal = document.getElementById('historyModal');
    if (modal) {
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
    }
}

/**
 * Initialize history module
 */
function initHistory() {
    // History button click handler
    const historyBtn = document.getElementById('openHistoryBtn');
    if (historyBtn) {
        historyBtn.addEventListener('click', openHistoryModal);
    }
    
    // Modal close handlers
    const modal = document.getElementById('historyModal');
    if (modal) {
        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeHistoryModal();
            }
        });
        
        // Close button
        const closeBtn = modal.querySelector('.history-modal__close');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeHistoryModal);
        }
        
        // Clear all button
        const clearBtn = document.getElementById('historyClearBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to clear all history?')) {
                    clearHistory();
                }
            });
        }
        
        // Export button
        const exportBtn = document.getElementById('historyExportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', exportHistory);
        }
        
        // Import button/input
        const importInput = document.getElementById('historyImportInput');
        const importBtn = document.getElementById('historyImportBtn');
        if (importInput && importBtn) {
            importBtn.addEventListener('click', () => importInput.click());
            importInput.addEventListener('change', (e) => {
                if (e.target.files && e.target.files[0]) {
                    importHistory(e.target.files[0]);
                    e.target.value = ''; // Reset input
                }
            });
        }
    }
    
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.style.display === 'flex') {
            closeHistoryModal();
        }
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initHistory);

