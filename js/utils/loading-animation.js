/**
 * Loading Animation Utility
 * This file contains functions for creating loading animations
 */

const LoadingAnimation = {
    // Show loading animation in a container
    show: function(containerId, message = 'Loading visualization...') {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        // Create loading indicator
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'loading-indicator';
        loadingIndicator.innerHTML = `
            <div class="loading-spinner"></div>
            <div class="loading-text">${message}</div>
        `;
        
        // Add to container
        container.appendChild(loadingIndicator);
        
        return loadingIndicator;
    },
    
    // Hide loading animation
    hide: function(loadingIndicator) {
        if (loadingIndicator && loadingIndicator.parentNode) {
            loadingIndicator.parentNode.removeChild(loadingIndicator);
        }
    }
}; 