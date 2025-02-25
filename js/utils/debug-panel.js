/**
 * Debug panel for development
 */
class DebugPanel {
    static init() {
        // Only initialize in development mode
        if (!this.isDevelopment()) return;
        
        this.createPanel();
        this.updateStats();
        
        // Update stats every second
        setInterval(() => this.updateStats(), 1000);
        
        console.log('Debug panel initialized');
    }
    
    static isDevelopment() {
        return window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1' ||
               window.location.search.includes('debug=true');
    }
    
    static createPanel() {
        const panel = document.createElement('div');
        panel.className = 'debug-panel';
        panel.innerHTML = `
            <div class="debug-header">
                <h3>Debug Panel</h3>
                <button class="debug-toggle">_</button>
            </div>
            <div class="debug-content">
                <div class="debug-section">
                    <h4>Performance</h4>
                    <div class="debug-stat">FPS: <span id="debug-fps">--</span></div>
                    <div class="debug-stat">Render Time: <span id="debug-render-time">--</span> ms</div>
                    <div class="debug-stat">Memory: <span id="debug-memory">--</span> MB</div>
                </div>
                <div class="debug-section">
                    <h4>Visualizations</h4>
                    <div class="debug-stat">Active: <span id="debug-active-vis">--</span></div>
                </div>
                <div class="debug-section">
                    <h4>Features</h4>
                    <div id="debug-features"></div>
                </div>
                <div class="debug-section">
                    <h4>Actions</h4>
                    <button id="debug-clear-cache">Clear Cache</button>
                    <button id="debug-reload">Reload Page</button>
                    <button id="debug-error-log">Show Error Log</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(panel);
        
        // Add toggle functionality
        const toggle = panel.querySelector('.debug-toggle');
        const content = panel.querySelector('.debug-content');
        
        toggle.addEventListener('click', () => {
            const isMinimized = content.style.display === 'none';
            content.style.display = isMinimized ? 'block' : 'none';
            toggle.textContent = isMinimized ? '_' : '+';
        });
        
        // Add button actions
        const clearCacheBtn = panel.querySelector('#debug-clear-cache');
        clearCacheBtn.addEventListener('click', () => {
            localStorage.clear();
            alert('Cache cleared');
        });
        
        const reloadBtn = panel.querySelector('#debug-reload');
        reloadBtn.addEventListener('click', () => {
            window.location.reload();
        });
        
        const errorLogBtn = panel.querySelector('#debug-error-log');
        errorLogBtn.addEventListener('click', () => {
            const logs = ErrorHandler.getErrorLogs();
            console.table(logs);
            alert(`${logs.length} errors in console`);
        });
        
        // Add feature detection info
        const featuresContainer = panel.querySelector('#debug-features');
        for (const [feature, supported] of Object.entries(FeatureDetector.features)) {
            const div = document.createElement('div');
            div.className = `debug-feature ${supported ? 'supported' : 'unsupported'}`;
            div.textContent = `${feature}: ${supported ? '✓' : '✗'}`;
            featuresContainer.appendChild(div);
        }
    }
    
    static updateStats() {
        if (!this.isDevelopment()) return;
        
        // Update performance stats
        const fpsElement = document.getElementById('debug-fps');
        if (fpsElement) {
            fpsElement.textContent = PerformanceMonitor.getAverageFps();
        }
        
        const renderTimeElement = document.getElementById('debug-render-time');
        if (renderTimeElement) {
            renderTimeElement.textContent = PerformanceMonitor.getAverageRenderTime().toFixed(2);
        }
        
        const memoryElement = document.getElementById('debug-memory');
        if (memoryElement && performance.memory) {
            const memory = performance.memory.usedJSHeapSize / (1024 * 1024);
            memoryElement.textContent = memory.toFixed(2);
        }
        
        // Update visualization stats
        const activeVisElement = document.getElementById('debug-active-vis');
        if (activeVisElement && window.visualizationRegistry) {
            activeVisElement.textContent = window.visualizationRegistry.getActiveCount();
        }
    }
}

// Initialize debug panel
document.addEventListener('DOMContentLoaded', () => {
    DebugPanel.init();
}); 