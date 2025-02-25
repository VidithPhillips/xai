/**
 * Registry for managing visualizations
 */
class VisualizationRegistry {
    constructor() {
        this.visualizations = new Map();
        this.instances = new Map();
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
            instance.dispose();
        }
        this.instances.delete(sectionId);
    }
}

// Create and export global instance
window.visualizationRegistry = new VisualizationRegistry();

// Register visualizations when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait a moment to ensure all classes are loaded
    setTimeout(() => {
        const registry = window.visualizationRegistry;
        
        if (window.IntroAnimation) registry.register('introduction', window.IntroAnimation);
        if (window.NeuralNetworkVis) registry.register('neural-networks', window.NeuralNetworkVis);
        if (window.FeatureImportanceVis) registry.register('feature-importance', window.FeatureImportanceVis);
        if (window.LocalExplanationsVis) registry.register('local-explanations', window.LocalExplanationsVis);
        if (window.CounterfactualsVis) registry.register('counterfactuals', window.CounterfactualsVis);
        
        console.log('Visualization registry initialized');
    }, 100);
}); 