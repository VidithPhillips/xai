/**
 * State manager for visualizations
 */
class StateManager {
    constructor() {
        this.state = {
            activeSection: null,
            neuralNetwork: {
                layers: 3,
                neuronsPerLayer: 5,
                activation: 'relu'
            },
            featureImportance: {
                method: 'permutation'
            },
            localExplanations: {
                instance: '1',
                method: 'lime'
            },
            counterfactuals: {
                scenario: '1'
            }
        };
        
        // Set up state persistence
        this.setupPersistence();
        
        console.log('State manager initialized');
    }
    
    setupPersistence() {
        // Load state from localStorage if available
        const savedState = localStorage.getItem('xaiExplorerState');
        if (savedState) {
            try {
                const parsedState = JSON.parse(savedState);
                this.state = { ...this.state, ...parsedState };
                console.log('Loaded state from localStorage');
            } catch (error) {
                console.error('Error loading state from localStorage:', error);
            }
        }
        
        // Save state to localStorage when page is unloaded
        window.addEventListener('beforeunload', () => {
            this.saveState();
        });
    }
    
    saveState() {
        try {
            localStorage.setItem('xaiExplorerState', JSON.stringify(this.state));
        } catch (error) {
            console.error('Error saving state to localStorage:', error);
        }
    }
    
    getState(path = null) {
        if (!path) return { ...this.state };
        
        const parts = path.split('.');
        let current = this.state;
        
        for (const part of parts) {
            if (current[part] === undefined) {
                return null;
            }
            current = current[part];
        }
        
        return current;
    }
    
    setState(path, value) {
        const parts = path.split('.');
        let current = this.state;
        
        // Navigate to the nested property
        for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i];
            if (current[part] === undefined) {
                current[part] = {};
            }
            current = current[part];
        }
        
        // Set the value
        const lastPart = parts[parts.length - 1];
        current[lastPart] = value;
        
        // Trigger state change event
        this.triggerStateChange(path, value);
        
        return this;
    }
    
    triggerStateChange(path, value) {
        const event = new CustomEvent('stateChange', {
            detail: { path, value, state: this.getState() }
        });
        document.dispatchEvent(event);
    }
    
    subscribe(callback) {
        const handler = (event) => {
            callback(event.detail);
        };
        
        document.addEventListener('stateChange', handler);
        
        // Return unsubscribe function
        return () => {
            document.removeEventListener('stateChange', handler);
        };
    }
}

// Create global state manager
window.stateManager = new StateManager(); 