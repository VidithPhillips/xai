/**
 * Error Boundary Utility
 * This file contains functions for handling errors gracefully
 */

const ErrorBoundary = {
    // Wrap a function with error handling
    wrap: function(fn, fallback, errorHandler) {
        return function(...args) {
            try {
                return fn.apply(this, args);
            } catch (error) {
                if (typeof errorHandler === 'function') {
                    errorHandler(error);
                } else {
                    console.error('Error in wrapped function:', error);
                }
                
                if (typeof fallback === 'function') {
                    return fallback.apply(this, args);
                }
                return undefined;
            }
        };
    },
    
    // Create a simple error message
    createErrorMessage: function(containerId, message) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.innerHTML = `
            <div class="error-icon">⚠️</div>
            <div class="error-text">${message}</div>
            <button class="error-retry">Retry</button>
        `;
        
        container.innerHTML = '';
        container.appendChild(errorElement);
        
        // Add retry functionality
        const retryButton = errorElement.querySelector('.error-retry');
        if (retryButton) {
            retryButton.addEventListener('click', () => {
                // Dispatch a retry event
                const event = new CustomEvent('visualizationRetry', { 
                    detail: { containerId }
                });
                document.dispatchEvent(event);
            });
        }
    }
}; 