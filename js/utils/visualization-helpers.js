/**
 * Visualization Helper Utilities
 * This file contains helper functions for robust visualization rendering
 */

const VisualizationHelpers = {
    // Safe D3 scale value getter that prevents negative values
    safeScaleValue: function(scale, value, min = 0) {
        try {
            const scaledValue = scale(value);
            return isNaN(scaledValue) ? min : Math.max(min, scaledValue);
        } catch (error) {
            console.warn('Error in scale calculation:', error);
            return min;
        }
    },
    
    // Safe data accessor that provides defaults for missing data
    safeDataAccess: function(data, path, defaultValue = 0) {
        try {
            const parts = path.split('.');
            let result = data;
            
            for (const part of parts) {
                if (result === null || result === undefined) {
                    return defaultValue;
                }
                result = result[part];
            }
            
            return result === null || result === undefined || isNaN(result) ? 
                defaultValue : result;
        } catch (error) {
            console.warn('Error accessing data:', error);
            return defaultValue;
        }
    },
    
    // Initialize a visualization container safely
    initContainer: function(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container #${containerId} not found`);
            return null;
        }
        
        // Clear any existing content
        container.innerHTML = '';
        
        return container;
    },
    
    // Create a D3 SVG container with proper sizing
    createSvgContainer: function(container, margin = {top: 40, right: 40, bottom: 40, left: 40}) {
        if (!container) return null;
        
        const width = container.clientWidth;
        const height = container.clientHeight || 500; // Fallback height
        
        const svg = d3.select(container)
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);
            
        return {
            svg,
            width: width - margin.left - margin.right,
            height: height - margin.top - margin.bottom
        };
    },
    
    // Handle window resize for visualizations
    setupResizeHandler: function(containerId, updateFn) {
        const resizeHandler = () => {
            const container = document.getElementById(containerId);
            if (!container) return;
            
            // Debounce the resize event
            clearTimeout(container._resizeTimer);
            container._resizeTimer = setTimeout(() => {
                updateFn();
            }, 250);
        };
        
        window.addEventListener('resize', resizeHandler);
        
        // Return a function to remove the event listener if needed
        return () => window.removeEventListener('resize', resizeHandler);
    },
    
    // Check if an element is visible in the viewport
    isElementVisible: function(element) {
        if (!element) return false;
        
        const rect = element.getBoundingClientRect();
        
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },
    
    // Check if a section is currently active
    isSectionActive: function(sectionId) {
        const section = document.getElementById(sectionId);
        return section && section.classList.contains('active');
    }
};

// Add this to index.html before the visualization scripts 