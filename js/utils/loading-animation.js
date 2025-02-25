/**
 * Loading Animation Utility
 * This file contains functions for creating loading animations
 */

const LoadingAnimation = {
    // Show loading animation in a container
    show: function(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return null;
        
        // Create loading indicator
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'loading-indicator';
        loadingIndicator.innerHTML = `
            <div class="loading-spinner"></div>
            <div class="loading-text">Loading visualization...</div>
        `;
        
        // Add to container
        container.appendChild(loadingIndicator);
        
        return loadingIndicator;
    },
    
    // Hide loading animation
    hide: function(loadingIndicator) {
        if (loadingIndicator && loadingIndicator.parentNode) {
            // Add fade-out animation
            loadingIndicator.classList.add('fade-out');
            
            // Remove after animation completes
            setTimeout(() => {
                if (loadingIndicator.parentNode) {
                    loadingIndicator.parentNode.removeChild(loadingIndicator);
                }
            }, 300);
        }
    }
}; 