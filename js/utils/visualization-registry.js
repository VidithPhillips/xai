/**
 * Registry for managing visualizations
 */
class VisualizationRegistry {
    constructor() {
        this.visualizations = new Map();
        this.instances = new Map();
        console.log('VisualizationRegistry initialized');
        
        // Add window resize handler
        this.setupResizeHandler();
    }
    
    // Add this method to handle resizing
    setupResizeHandler() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            // Debounce resize events
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                console.log('Window resized, updating visualizations');
                this.instances.forEach((instance, sectionId) => {
                    if (instance && typeof instance.resize === 'function') {
                        try {
                            instance.resize();
                        } catch (error) {
                            console.error(`Error resizing visualization for ${sectionId}:`, error);
                        }
                    }
                });
            }, 250);
        });
    }
    
    register(sectionId, VisualizationClass) {
        if (typeof VisualizationClass !== 'function') {
            console.error(`Invalid visualization class for section ${sectionId}`);
            return;
        }
        // Only register if not already registered
        if (!this.visualizations.has(sectionId)) {
            this.visualizations.set(sectionId, VisualizationClass);
            console.log(`Registered visualization: ${sectionId}`);
        }
    }
    
    create(sectionId) {
        console.log(`Creating visualization for section: ${sectionId}`);
        
        const containerMap = {
            'introduction': 'intro-visualization',
            'neural-networks': 'neural-network-visualization',
            'feature-importance': 'feature-importance-visualization',
            'local-explanations': 'local-explanations-visualization',
            'counterfactuals': 'counterfactuals-visualization'
        };

        const containerId = containerMap[sectionId];
        if (!containerId) {
            console.error(`No container mapped for section: ${sectionId}`);
            return null;
        }

        // Clean up previous instance if it exists
        this.dispose(sectionId);

        const VisualizationClass = this.visualizations.get(sectionId);
        if (!VisualizationClass) {
            console.error(`No visualization registered for section: ${sectionId}`);
            return null;
        }

        try {
            console.log(`Instantiating ${sectionId} visualization in container ${containerId}`);
            const instance = new VisualizationClass(containerId);
            this.instances.set(sectionId, instance);
            return instance;
        } catch (error) {
            console.error(`Error creating visualization for ${sectionId}:`, error);
            return null;
        }
    }
    
    dispose(sectionId) {
        const instance = this.instances.get(sectionId);
        if (instance && typeof instance.dispose === 'function') {
            try {
                console.log(`Disposing visualization for section: ${sectionId}`);
                instance.dispose();
            } catch (error) {
                console.error(`Error disposing visualization for ${sectionId}:`, error);
            }
        }
        this.instances.delete(sectionId);
    }
    
    getActiveCount() {
        return this.instances.size;
    }
}

// Create and export global instance
window.visualizationRegistry = new VisualizationRegistry();

// Register visualizations when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait a moment to ensure all classes are loaded
    setTimeout(() => {
        const registry = window.visualizationRegistry;
        
        if (window.IntroAnimation) {
            registry.register('introduction', window.IntroAnimation);
        } else {
            console.warn('IntroAnimation class not found');
        }
        
        if (window.NeuralNetworkVis) {
            registry.register('neural-networks', window.NeuralNetworkVis);
        } else {
            console.warn('NeuralNetworkVis class not found');
        }
        
        if (window.FeatureImportanceVis) {
            registry.register('feature-importance', window.FeatureImportanceVis);
        } else {
            console.warn('FeatureImportanceVis class not found');
        }
        
        if (window.LocalExplanationsVis) {
            registry.register('local-explanations', window.LocalExplanationsVis);
        } else {
            console.warn('LocalExplanationsVis class not found');
        }
        
        if (window.CounterfactualsVis) {
            registry.register('counterfactuals', window.CounterfactualsVis);
        } else {
            console.warn('CounterfactualsVis class not found');
        }
        
        console.log('Visualization registry initialized with classes');
    }, 100);
}); 