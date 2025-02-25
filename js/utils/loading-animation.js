/**
 * Loading Animation Utility
 * This file contains functions for creating loading animations
 */

// Update loading animation for dark theme
class LoadingAnimation {
    static show(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return null;
        
        const loadingContainer = document.createElement('div');
        loadingContainer.className = 'loading-indicator';
        
        loadingContainer.innerHTML = `
            <svg width="50" height="50" viewBox="0 0 50 50">
                <circle cx="25" cy="25" r="20" fill="none" stroke="${getComputedStyle(document.documentElement).getPropertyValue('--primary').trim()}" stroke-width="3" stroke-dasharray="120" stroke-dashoffset="0">
                    <animate attributeName="stroke-dashoffset" values="0;120;240" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle cx="25" cy="25" r="10" fill="none" stroke="${getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()}" stroke-width="2" stroke-dasharray="60" stroke-dashoffset="0">
                    <animate attributeName="stroke-dashoffset" values="0;60;120" dur="1.5s" repeatCount="indefinite" />
                </circle>
            </svg>
            <div class="loading-text">Loading visualization...</div>
        `;
        
        container.appendChild(loadingContainer);
        return loadingContainer;
    }
    
    static hide(loadingIndicator) {
        if (loadingIndicator && loadingIndicator.parentNode) {
            loadingIndicator.classList.add('fade-out');
            setTimeout(() => {
                if (loadingIndicator.parentNode) {
                    loadingIndicator.parentNode.removeChild(loadingIndicator);
                }
            }, 300);
        }
    }
} 