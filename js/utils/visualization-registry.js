/**
 * Registry for managing visualizations
 */
class VisualizationRegistry {
    constructor() {
        this.visualizations = new Map();
        this.activeVisualizations = new Set();
        console.log('Visualization registry initialized');
    }
    
    register(id, VisualizationClass) {
        this.visualizations.set(id, VisualizationClass);
        console.log(`Registered visualization: ${id}`);
    }
    
    create(id, containerId, options = {}) {
        if (!this.visualizations.has(id)) {
            console.error(`Visualization ${id} not registered`);
            return null;
        }
        
        try {
            const VisualizationClass = this.visualizations.get(id);
            const instance = new VisualizationClass(containerId, options);
            this.activeVisualizations.add(instance);
            console.log(`Created visualization: ${id} in container: ${containerId}`);
            return instance;
        } catch (error) {
            console.error(`Error creating visualization ${id}:`, error);
            return null;
        }
    }
    
    dispose(instance) {
        if (!instance) return;
        
        try {
            if (typeof instance.dispose === 'function') {
                instance.dispose();
            }
            this.activeVisualizations.delete(instance);
            console.log(`Disposed visualization instance`);
        } catch (error) {
            console.error('Error disposing visualization:', error);
        }
    }
    
    disposeAll() {
        console.log(`Disposing all visualizations (${this.activeVisualizations.size})`);
        for (const instance of this.activeVisualizations) {
            this.dispose(instance);
        }
        this.activeVisualizations.clear();
    }
    
    getActiveCount() {
        return this.activeVisualizations.size;
    }
}

// Create global registry
window.visualizationRegistry = new VisualizationRegistry();

// Register visualization classes
document.addEventListener('DOMContentLoaded', () => {
    const registry = window.visualizationRegistry;
    
    // Register visualization classes when they're available
    const checkAndRegister = () => {
        if (window.IntroAnimation) {
            registry.register('introduction', window.IntroAnimation);
            console.log('Registered IntroAnimation');
        }
        if (window.NeuralNetworkVis) {
            registry.register('neural-networks', window.NeuralNetworkVis);
            console.log('Registered NeuralNetworkVis');
        }
        if (window.FeatureImportanceVis) {
            registry.register('feature-importance', window.FeatureImportanceVis);
            console.log('Registered FeatureImportanceVis');
        }
        if (window.LocalExplanationsVis) {
            registry.register('local-explanations', window.LocalExplanationsVis);
            console.log('Registered LocalExplanationsVis');
        }
        if (window.CounterfactualsVis) {
            registry.register('counterfactuals', window.CounterfactualsVis);
            console.log('Registered CounterfactualsVis');
        }
    };
    
    // Try immediately
    checkAndRegister();
    
    // And also after a short delay to ensure all scripts are loaded
    setTimeout(() => {
        checkAndRegister();
        console.log('All visualization classes loaded successfully!');
    }, 500);
}); 