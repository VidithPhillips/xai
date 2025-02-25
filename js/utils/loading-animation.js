/**
 * Loading Animation Utility
 * This file contains functions for creating loading animations
 */

// Update loading animation for dark theme
class LoadingAnimation {
    static show(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return null;
        
        // Remove any existing loading indicators first
        const existingIndicator = container.querySelector('.loading-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }
        
        const loadingContainer = document.createElement('div');
        loadingContainer.className = 'loading-indicator';
        
        // Add loading state to container
        container.dataset.loading = 'true';
        
        // Create loading animation
        loadingContainer.innerHTML = `
            <svg width="50" height="50" viewBox="0 0 50 50">
                <circle cx="25" cy="25" r="20" fill="none" 
                    stroke="${getComputedStyle(document.documentElement)
                    .getPropertyValue('--primary').trim()}" 
                    stroke-width="3" stroke-dasharray="120" stroke-dashoffset="0">
                    <animate attributeName="stroke-dashoffset" 
                        values="0;120;240" dur="2s" repeatCount="indefinite" />
                </circle>
            </svg>
            <div class="loading-text">Loading visualization...</div>
        `;
        
        container.appendChild(loadingContainer);
        return loadingContainer;
    }
    
    static hide(loadingIndicator) {
        if (!loadingIndicator || !loadingIndicator.parentNode) return;
        
        // Remove loading state
        const container = loadingIndicator.parentNode;
        delete container.dataset.loading;
        
        // Fade out animation
        loadingIndicator.classList.add('fade-out');
        
        // Remove after animation
        const removeTimeout = setTimeout(() => {
            if (loadingIndicator.parentNode) {
                loadingIndicator.parentNode.removeChild(loadingIndicator);
            }
        }, 300);
        
        // Store timeout ID for cleanup
        loadingIndicator.dataset.removeTimeout = removeTimeout;
    }
} 