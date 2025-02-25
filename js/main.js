/**
 * Main JavaScript file
 * This file initializes all visualizations and UI components
 */

// Temporary placeholder for GuidedTour until implementation is complete
window.GuidedTour = {
  createTour: function(containerId, steps) {
    console.log("Starting guided tour for", containerId, steps);
  }
};

// Global visualization instances
window.neuralNetworkVis = null;
window.featureImportanceVis = null;
window.localExplanationsVis = null;
window.counterfactualsVis = null;
window.particleBackgrounds = {};

// Add global event listener tracking
const eventListeners = new Map();

function addTrackedEventListener(element, event, handler) {
    if (!element) return;
    
    const listeners = eventListeners.get(element) || [];
    listeners.push({ event, handler });
    eventListeners.set(element, listeners);
    
    element.addEventListener(event, handler);
}

function removeAllTrackedEventListeners(element) {
    if (!element) return;
    
    const listeners = eventListeners.get(element);
    if (listeners) {
        listeners.forEach(({ event, handler }) => {
            element.removeEventListener(event, handler);
        });
        eventListeners.delete(element);
    }
}

// Use in visualization cleanup
function cleanupVisualization(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Use the visualization's own dispose method
    const visualization = container.visualization;
    if (visualization && typeof visualization.dispose === 'function') {
        visualization.dispose();
    }
    
    // Remove event listeners
    removeAllTrackedEventListeners(container);
    
    // Clear container
    container.innerHTML = '';
    container.visualization = null;
}

// Issue: Global state management is fragile
// Add proper state management
const AppState = {
    activeSection: null,
    visualizations: new Map(),
    isTransitioning: false,
    
    setActiveSection(sectionId) {
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        
        const previousSection = this.activeSection;
        this.activeSection = sectionId;
        
        // Cleanup previous visualization
        if (previousSection) {
            const prevVis = this.visualizations.get(previousSection);
            if (prevVis) {
                prevVis.dispose();
                this.visualizations.delete(previousSection);
            }
        }
        
        // Initialize new visualization
        initVisualizationForSection(sectionId).finally(() => {
            this.isTransitioning = false;
        });
    }
};

// Global error handler
window.addEventListener('error', function(event) {
    console.error('Global error caught:', event.error);
});

// Initialize visualization for a specific section
function initVisualizationForSection(sectionId) {
    console.log(`Initializing visualization for section: ${sectionId}`);
    
    const containerMap = {
        'introduction': 'intro-visualization',
        'neural-networks': 'neural-network-visualization',
        'feature-importance': 'feature-importance-visualization',
        'local-explanations': 'local-explanations-visualization',
        'counterfactuals': 'counterfactuals-visualization'
    };
    
    const containerId = containerMap[sectionId];
    if (!containerId) {
        console.error(`No container ID mapped for section: ${sectionId}`);
        return;
    }
    
    // Get container and ensure it's visible
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container #${containerId} not found`);
        return;
    }

    // Force container to be visible and have dimensions
    container.style.display = 'block';
    container.style.width = '100%';
    container.style.minHeight = '400px';
    
    // Force layout recalculation
    container.offsetHeight;
    
    console.log(`Container #${containerId} dimensions:`, container.clientWidth, 'x', container.clientHeight);

    try {
        if (window.visualizationRegistry) {
            const visualization = window.visualizationRegistry.create(sectionId);
            if (!visualization) {
                console.warn(`Visualization creation failed for ${sectionId}, using fallback`);
                createFallbackVisualization(containerId, `${sectionId} Visualization (Fallback)`);
            }
        } else {
            console.error("Visualization registry not found");
        }
    } catch (error) {
        console.error('Error initializing visualization:', error);
        container.innerHTML = `
            <div class="error-message">
                <h4>Visualization Error</h4>
                <p>${error.message || 'Failed to load visualization'}</p>
            </div>
        `;
    }
}

// Create a fallback visualization
function createFallbackVisualization(containerId, title) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 2rem;">
            <h3 style="margin-bottom: 1rem; color: var(--text-light);">${title}</h3>
            <p style="text-align: center; color: var(--text-gray);">
                The visualization could not be loaded. Please try refreshing the page.
            </p>
        </div>
    `;
}

// Handle navigation between sections
function handleNavigation(targetSectionId) {
    if (!targetSectionId) return;
    
    console.log(`Navigating to section: ${targetSectionId}`);
    
    // Hide all sections first
    document.querySelectorAll('section').forEach(section => {
        section.style.display = 'none';
        section.classList.remove('active');
    });
    
    // Show and activate target section
    const targetSection = document.getElementById(targetSectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
        targetSection.classList.add('active');
        
        // Force layout recalculation
        targetSection.offsetHeight;
        
        // Initialize visualization for this section
        initVisualizationForSection(targetSectionId);
    }
}

// Debug all containers
function debugAllContainers() {
    console.group('Container Debug Info');
    
    const containerMap = {
        'introduction': 'intro-visualization',
        'neural-networks': 'neural-network-visualization',
        'feature-importance': 'feature-importance-visualization',
        'local-explanations': 'local-explanations-visualization',
        'counterfactuals': 'counterfactuals-visualization'
    };
    
    Object.entries(containerMap).forEach(([sectionId, containerId]) => {
        const container = document.getElementById(containerId);
        if (container) {
            console.log(`✓ Container #${containerId}: ${container.clientWidth}x${container.clientHeight}`);
        } else {
            console.error(`❌ Container #${containerId} NOT FOUND`);
        }
    });
    
    console.groupEnd();
}

// Add this debugging function
function debugGlobalObjects() {
    console.log('Checking global objects:');
    console.log('IntroAnimation:', typeof window.IntroAnimation);
    console.log('NeuralNetworkVis:', typeof window.NeuralNetworkVis);
    console.log('FeatureImportanceVis:', typeof window.FeatureImportanceVis);
    console.log('LocalExplanationsVis:', typeof window.LocalExplanationsVis);
    console.log('CounterfactualsVis:', typeof window.CounterfactualsVis);
    console.log('LoadingAnimation:', typeof window.LoadingAnimation);
}

// Main initialization
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Content Loaded");
    
    try {
        // Debug containers
        debugAllContainers();
        
        // Debug global objects
        debugGlobalObjects();
        
        // Initialize UI controls
        if (window.UIControls) {
            UIControls.initButtons();
            UIControls.initModals();
            
            // Initialize navigation
            UIControls.initNavigation();
        } else {
            console.warn("UIControls not found, using fallback navigation");
            
            // Fallback navigation if UIControls is not available
            document.querySelectorAll('nav a').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetId = link.getAttribute('href').substring(1);
                    window.location.hash = targetId;
                    handleNavigation(targetId);
                });
            });
            
            // Get initial section from hash or default to introduction
            const initialSection = window.location.hash.substring(1) || 'introduction';
            
            // Navigate to initial section
            handleNavigation(initialSection);
            
            // Set up hash change handler
            window.addEventListener('hashchange', () => {
                const sectionId = window.location.hash.substring(1) || 'introduction';
                handleNavigation(sectionId);
            });
        }
    } catch (error) {
        console.error("Error initializing application:", error);
        if (window.ErrorHandler) {
            ErrorHandler.showErrorNotification("There was an error initializing the application.");
        }
    }
}); 