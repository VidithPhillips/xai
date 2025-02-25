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
    // Show error notification to user
    const errorContainer = document.createElement('div');
    errorContainer.className = 'error-notification';
    errorContainer.innerHTML = `
        <div class="error-content">
            <h3>Error Detected</h3>
            <p>Something went wrong. Please try refreshing the page.</p>
            <p class="error-details">${event.error?.message || 'Unknown error'}</p>
            <button onclick="location.reload()">Reload Page</button>
        </div>
    `;
    document.body.appendChild(errorContainer);
    
    // Remove after 10 seconds
    setTimeout(() => {
        if (document.body.contains(errorContainer)) {
            document.body.removeChild(errorContainer);
        }
    }, 10000);
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
        return Promise.reject(new Error('Invalid section ID'));
    }
    
    // Get container and ensure it's visible
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container #${containerId} not found`);
        return Promise.reject(new Error('Container not found'));
    }

    // Show loading animation
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading-indicator';
    loadingIndicator.innerHTML = `
        <svg width="50" height="50" viewBox="0 0 50 50">
            <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" stroke-width="4" stroke-dasharray="80, 200" stroke-dashoffset="0"></circle>
        </svg>
    `;
    container.appendChild(loadingIndicator);

    // Force container to be visible and have dimensions
    container.style.display = 'block';
    
    // Force layout recalculation
    container.offsetHeight;
    
    return new Promise((resolve, reject) => {
        try {
            if (window.visualizationRegistry) {
                setTimeout(() => {
                    // Remove loading indicator
                    if (container.contains(loadingIndicator)) {
                        container.removeChild(loadingIndicator);
                    }
                    
                    const visualization = window.visualizationRegistry.create(sectionId);
                    if (!visualization) {
                        console.warn(`Visualization creation failed for ${sectionId}, using fallback`);
                        createFallbackVisualization(containerId, `${sectionId} Visualization (Fallback)`);
                    }
                    resolve(visualization);
                }, 500); // Add a small delay for the loading animation
            } else {
                if (container.contains(loadingIndicator)) {
                    container.removeChild(loadingIndicator);
                }
                console.error("Visualization registry not found");
                createFallbackVisualization(containerId, `${sectionId} Visualization (Fallback)`);
                reject(new Error("Visualization registry not found"));
            }
        } catch (error) {
            if (container.contains(loadingIndicator)) {
                container.removeChild(loadingIndicator);
            }
            console.error('Error initializing visualization:', error);
            container.innerHTML = `
                <div class="error-message">
                    <h4>Visualization Error</h4>
                    <p>${error.message || 'Failed to load visualization'}</p>
                    <button onclick="location.reload()">Reload Page</button>
                </div>
            `;
            reject(error);
        }
    });
}

// Create a fallback visualization
function createFallbackVisualization(containerId, title) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 2rem;">
            <h3 style="margin-bottom: 1rem; color: var(--neutral-200);">${title}</h3>
            <p style="text-align: center; color: var(--neutral-400);">
                The visualization could not be loaded. Please try refreshing the page.
            </p>
            <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: var(--primary); color: white; border: none; border-radius: 4px; cursor: pointer;">
                Reload Page
            </button>
        </div>
    `;
}

// Handle navigation between sections
function handleNavigation(targetSectionId) {
    if (!targetSectionId) return;
    
    console.log(`Navigating to section: ${targetSectionId}`);
    
    // Update active nav link
    document.querySelectorAll('nav a').forEach(link => {
        const isActive = link.getAttribute('href') === `#${targetSectionId}`;
        link.classList.toggle('active', isActive);
    });
    
    // Hide all sections first
    document.querySelectorAll('section').forEach(section => {
        if (section.id !== targetSectionId) {
            section.style.display = 'none';
            section.classList.remove('active');
        }
    });
    
    // Show and activate target section
    const targetSection = document.getElementById(targetSectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
        
        // Force layout recalculation
        targetSection.offsetHeight;
        
        // Add active class after a small delay for animation
        setTimeout(() => {
            targetSection.classList.add('active');
        }, 10);
        
        // Initialize visualization for this section
        initVisualizationForSection(targetSectionId).catch(error => {
            console.error(`Failed to initialize visualization for ${targetSectionId}:`, error);
        });
    }
}

// Initialize modals
function initModals() {
    // Help modal
    const helpButton = document.getElementById('help-button');
    const helpModal = document.getElementById('help-modal');
    
    if (helpButton && helpModal) {
        helpButton.addEventListener('click', () => {
            helpModal.style.display = 'block';
        });
    }
    
    // About modal
    const aboutLink = document.getElementById('about-link');
    const aboutModal = document.getElementById('about-modal');
    
    if (aboutLink && aboutModal) {
        aboutLink.addEventListener('click', (e) => {
            e.preventDefault();
            aboutModal.style.display = 'block';
        });
    }
    
    // References modal
    const referencesLink = document.getElementById('references-link');
    const referencesModal = document.getElementById('references-modal');
    
    if (referencesLink && referencesModal) {
        referencesLink.addEventListener('click', (e) => {
            e.preventDefault();
            referencesModal.style.display = 'block';
        });
    }
    
    // Close buttons
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        document.querySelectorAll('.modal').forEach(modal => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
}

// Initialize guided tour
function initGuidedTour() {
    const startTourButton = document.getElementById('start-tour');
    
    if (startTourButton) {
        startTourButton.addEventListener('click', () => {
            // Simple tour implementation
            const steps = [
                {
                    target: 'introduction',
                    title: 'Welcome to XAI Explorer',
                    content: 'This platform helps you understand how AI makes decisions.',
                    placement: 'center'
                },
                {
                    target: 'neural-networks',
                    title: 'Neural Networks',
                    content: 'Learn about the structure of neural networks and why they are difficult to interpret.',
                    placement: 'bottom'
                },
                {
                    target: 'feature-importance',
                    title: 'Feature Importance',
                    content: 'Discover which features have the most influence on model predictions.',
                    placement: 'bottom'
                },
                {
                    target: 'local-explanations',
                    title: 'Local Explanations',
                    content: 'Understand why specific predictions were made.',
                    placement: 'bottom'
                },
                {
                    target: 'counterfactuals',
                    title: 'Counterfactuals',
                    content: 'Explore what changes would lead to different outcomes.',
                    placement: 'bottom'
                }
            ];
            
            // If GuidedTour is available, use it
            if (window.GuidedTour) {
                window.GuidedTour.createTour('xai-explorer', steps);
            } else {
                // Simple fallback
                alert('Guided tour will take you through each section of the application to help you understand XAI concepts.');
                
                // Navigate to the first section
                window.location.hash = 'introduction';
                handleNavigation('introduction');
            }
        });
    }
}

// Theme toggle
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('light-theme');
            
            // Update icon
            const isDarkTheme = !document.body.classList.contains('light-theme');
            themeToggle.innerHTML = isDarkTheme 
                ? '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>'
                : '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>';
        });
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
        
        // Initialize modals
        initModals();
        
        // Initialize guided tour
        initGuidedTour();
        
        // Initialize theme toggle
        initThemeToggle();
        
    } catch (error) {
        console.error("Error initializing application:", error);
        if (window.ErrorHandler) {
            ErrorHandler.showErrorNotification("There was an error initializing the application.");
        }
    }
}); 