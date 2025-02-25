/**
 * Base class for all visualizations
 * Provides common functionality and error handling
 */
class BaseVisualization {
    /**
     * Creates a new visualization
     * @param {string} containerId - The ID of the container element
     */
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`Container #${containerId} not found`);
            return;
        }
        
        // Set default dimensions
        this.width = this.container.clientWidth || 800;
        this.height = this.container.clientHeight || 400;
        
        // Store container ID for debugging
        this.containerId = containerId;
        
        // Add resize handler
        this.resizeHandler = this.handleResize.bind(this);
        window.addEventListener('resize', this.resizeHandler);
        
        // Initialize with error handling
        try {
            this.initialize();
        } catch (error) {
            console.error(`Error initializing ${this.constructor.name}:`, error);
            this.createFallback(`Error: ${error.message}`);
        }
    }
    
    /**
     * Initialize the visualization - to be implemented by subclasses
     */
    initialize() {
        // Implement in subclasses
    }
    
    /**
     * Clean up resources when the visualization is no longer needed
     */
    dispose() {
        // Remove event listeners
        window.removeEventListener('resize', this.resizeHandler);
        
        // Cancel any animations
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        
        // Clear container
        while (this.container.firstChild) {
            this.container.removeChild(this.container.firstChild);
        }
    }
    
    /**
     * Handle window resize events
     */
    handleResize() {
        // Update dimensions
        this.width = this.container.clientWidth || 800;
        this.height = this.container.clientHeight || 400;
        
        // Implement in subclasses
        if (typeof this.updateDimensions === 'function') {
            this.updateDimensions();
        }
    }
    
    /**
     * Create a fallback visualization when the main one fails
     * @param {string} message - The error message to display
     */
    createFallback(message) {
        this.container.innerHTML = `
            <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;text-align:center;padding:20px;background:#1a1a2e;color:white;">
                <div>
                    <h3>${message || 'Visualization Error'}</h3>
                    <p>This is a fallback visualization. The actual visualization could not be loaded.</p>
                </div>
            </div>
        `;
    }
    
    /**
     * Log debug information
     * @param {string} message - The debug message
     * @param {any} data - Additional data to log
     */
    debug(message, data) {
        console.log(`[${this.constructor.name}] ${message}`, data);
    }
    
    /**
     * Add accessibility attributes to the container
     * @param {string} label - The ARIA label for the visualization
     */
    addAccessibility(label) {
        this.container.setAttribute('role', 'region');
        this.container.setAttribute('aria-label', label || 'Interactive Visualization');
        this.container.setAttribute('tabindex', '0');
    }
}

// Export to window for global access
window.BaseVisualization = BaseVisualization; 