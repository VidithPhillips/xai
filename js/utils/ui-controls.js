/**
 * UI Controls utility functions
 * This file contains helper functions for UI interactions
 */

const UIControls = {
    // Store active sections and visualizations for cleanup
    activeSection: null,
    activeVisualizations: {},
    
    eventListeners: new Map(),
    
    addTrackedEventListener(element, event, handler) {
        if (!element) return;
        
        const listeners = this.eventListeners.get(element) || [];
        listeners.push({ event, handler });
        this.eventListeners.set(element, listeners);
        
        element.addEventListener(event, handler);
    },
    
    removeAllTrackedEventListeners(element) {
        if (!element) return;
        
        const listeners = this.eventListeners.get(element);
        if (listeners) {
            listeners.forEach(({ event, handler }) => {
                element.removeEventListener(event, handler);
            });
            this.eventListeners.delete(element);
        }
    },
    
    // Initialize navigation with proper cleanup
    initNavigation: function() {
        const navLinks = document.querySelectorAll('nav a');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Get the target section ID
                const targetId = link.getAttribute('href').substring(1);
                
                // Clean up resources from the current active section
                if (this.activeSection) {
                    this.cleanupSection(this.activeSection);
                }
                
                // Hide all sections
                document.querySelectorAll('section').forEach(section => {
                    section.classList.remove('active');
                });
                
                // Show target section
                const targetSection = document.getElementById(targetId);
                if (targetSection) {
                    targetSection.classList.add('active');
                    this.activeSection = targetId;
                    
                    // Trigger visualization with delay
                    setTimeout(() => {
                        this.triggerVisualizationForSection(targetId);
                    }, 100);
                }
                
                // Update active nav link
                navLinks.forEach(navLink => {
                    navLink.classList.remove('active');
                });
                link.classList.add('active');
            });
        });
    },
    
    // Trigger the appropriate visualization based on section ID
    triggerVisualizationForSection: function(sectionId) {
        console.log(`Triggering visualization for section: ${sectionId}`);
        
        // Make sure the section is visible first
        const section = document.getElementById(sectionId);
        if (!section || !section.classList.contains('active')) {
            return;
        }
        
        // Clear any existing loading indicators
        const existingIndicators = document.querySelectorAll('.loading-indicator');
        existingIndicators.forEach(indicator => {
            if (indicator.parentNode) {
                indicator.parentNode.removeChild(indicator);
            }
        });
        
        switch(sectionId) {
            case 'intro':
                this.ensureVisualization('intro-visualization', initIntroVisualization);
                break;
            case 'neural-networks':
                this.ensureVisualization('neural-network-visualization', () => {
                    if (!window.neuralNetworkVis) {
                        window.neuralNetworkVis = new NeuralNetworkVis('neural-network-visualization');
                    } else {
                        window.neuralNetworkVis.updateVisualization();
                    }
                });
                break;
            case 'feature-importance':
                this.ensureVisualization('feature-importance-visualization', () => {
                    if (!window.featureImportanceVis) {
                        window.featureImportanceVis = new FeatureImportanceVis('feature-importance-visualization');
                    } else {
                        window.featureImportanceVis.updateChart();
                    }
                });
                break;
            case 'local-explanations':
                this.ensureVisualization('local-explanations-visualization', () => {
                    if (!window.localExplanationsVis) {
                        window.localExplanationsVis = new LocalExplanationsVis('local-explanations-visualization');
                    } else {
                        window.localExplanationsVis.updateChart();
                    }
                });
                break;
            case 'counterfactuals':
                this.ensureVisualization('counterfactuals-visualization', () => {
                    if (!window.counterfactualsVis) {
                        window.counterfactualsVis = new CounterfactualsVis('counterfactuals-visualization');
                    } else {
                        window.counterfactualsVis.updateChart();
                    }
                });
                break;
        }
    },
    
    // Ensure a visualization is properly initialized
    ensureVisualization: function(containerId, initFunction) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        // Show loading indicator
        const loadingIndicator = LoadingAnimation.show(containerId);
        
        // Initialize with a delay
        setTimeout(() => {
            try {
                initFunction();
                // Hide loading indicator after initialization
                setTimeout(() => {
                    LoadingAnimation.hide(loadingIndicator);
                }, 500);
            } catch (error) {
                console.error(`Error initializing ${containerId}:`, error);
                LoadingAnimation.hide(loadingIndicator);
                handleVisualizationError(containerId);
            }
        }, 100);
    },
    
    // Initialize modals
    initModals: function() {
        const aboutLink = document.getElementById('about-link');
        const resourcesLink = document.getElementById('resources-link');
        const aboutModal = document.getElementById('about-modal');
        const resourcesModal = document.getElementById('resources-modal');
        const closeButtons = document.querySelectorAll('.close-modal');
        
        // Open about modal
        if (aboutLink && aboutModal) {
            aboutLink.addEventListener('click', (e) => {
                e.preventDefault();
                aboutModal.classList.add('active');
            });
        }
        
        // Open resources modal
        if (resourcesLink && resourcesModal) {
            resourcesLink.addEventListener('click', (e) => {
                e.preventDefault();
                resourcesModal.classList.add('active');
            });
        }
        
        // Close modals
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const modal = button.closest('.modal');
                modal.classList.remove('active');
            });
        });
        
        // Close modals when clicking outside content
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.classList.remove('active');
            }
        });
    },
    
    // Initialize dataset and method buttons
    initButtons: function() {
        // Dataset buttons
        const datasetButtons = document.querySelectorAll('.dataset-btn');
        datasetButtons.forEach(button => {
            button.addEventListener('click', () => {
                const dataset = button.getAttribute('data-dataset');
                
                // Update active state
                datasetButtons.forEach(b => b.classList.remove('active'));
                button.classList.add('active');
                
                // Trigger dataset change event
                const event = new CustomEvent('datasetChange', { detail: { dataset } });
                document.dispatchEvent(event);
            });
        });
        
        // Method buttons
        const methodButtons = document.querySelectorAll('.method-btn');
        methodButtons.forEach(button => {
            button.addEventListener('click', () => {
                const method = button.getAttribute('data-method');
                
                // Find parent method-options to only update siblings
                const methodOptions = button.closest('.method-options');
                if (methodOptions) {
                    methodOptions.querySelectorAll('.method-btn').forEach(b => b.classList.remove('active'));
                    button.classList.add('active');
                }
                
                // Trigger method change event
                const event = new CustomEvent('methodChange', { detail: { method } });
                document.dispatchEvent(event);
            });
        });
        
        // Start exploring button
        const startExploringBtn = document.getElementById('start-exploring');
        if (startExploringBtn) {
            startExploringBtn.addEventListener('click', () => {
                // Navigate to neural networks section
                const neuralNetworksLink = document.querySelector('nav a[href="#neural-networks"]');
                if (neuralNetworksLink) {
                    neuralNetworksLink.click();
                }
            });
        }
    },
    
    // Create sliders for counterfactual features
    createFeatureSliders: function(features, container) {
        const slidersContainer = document.getElementById(container);
        if (!slidersContainer) return;
        
        // Clear existing sliders
        slidersContainer.innerHTML = '';
        
        // Create sliders for each feature
        features.forEach(feature => {
            const sliderGroup = document.createElement('div');
            sliderGroup.className = 'control-group';
            
            const label = document.createElement('label');
            label.textContent = feature.name;
            label.htmlFor = `slider-${feature.id}`;
            
            const valueDisplay = document.createElement('span');
            valueDisplay.className = 'value-display';
            valueDisplay.textContent = feature.value;
            label.appendChild(valueDisplay);
            
            const slider = document.createElement('input');
            slider.type = 'range';
            slider.id = `slider-${feature.id}`;
            slider.min = feature.min;
            slider.max = feature.max;
            slider.step = feature.step;
            slider.value = feature.value;
            
            slider.addEventListener('input', () => {
                valueDisplay.textContent = slider.value;
                
                // Trigger feature change event
                const event = new CustomEvent('featureChange', {
                    detail: {
                        id: feature.id,
                        value: parseFloat(slider.value)
                    }
                });
                document.dispatchEvent(event);
            });
            
            sliderGroup.appendChild(label);
            sliderGroup.appendChild(slider);
            slidersContainer.appendChild(sliderGroup);
        });
    },
    
    // Clean up resources when changing sections
    cleanupSection: function(sectionId) {
        console.log(`Cleaning up section: ${sectionId}`);
        
        // Clean up the specific visualization
        switch(sectionId) {
            case 'neural-networks':
                if (window.neuralNetworkVis) {
                    window.neuralNetworkVis.dispose();
                    window.neuralNetworkVis = null;
                }
                break;
            case 'feature-importance':
                if (window.featureImportanceVis) {
                    window.featureImportanceVis.dispose();
                    window.featureImportanceVis = null;
                }
                break;
            case 'local-explanations':
                if (window.localExplanationsVis) {
                    window.localExplanationsVis.dispose();
                    window.localExplanationsVis = null;
                }
                break;
            case 'counterfactuals':
                if (window.counterfactualsVis) {
                    window.counterfactualsVis.dispose();
                    window.counterfactualsVis = null;
                }
                break;
            case 'intro':
                // Clean up intro visualization if needed
                const introContainer = document.getElementById('intro-visualization');
                if (introContainer) {
                    introContainer.innerHTML = '';
                }
                break;
        }
        
        // Remove any loading indicators
        const section = document.getElementById(sectionId);
        if (section) {
            const loadingIndicators = section.querySelectorAll('.loading-indicator');
            loadingIndicators.forEach(indicator => {
                if (indicator.parentNode) {
                    indicator.parentNode.removeChild(indicator);
                }
            });
        }
    }
}; 