/**
 * UI Controls utility functions
 * This file contains helper functions for UI interactions
 */

const UIControls = {
    // Initialize section navigation
    initNavigation: function() {
        const navLinks = document.querySelectorAll('nav a');
        const sections = document.querySelectorAll('section');
        
        // Handle navigation clicks
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Get the target section id from the href
                const targetId = link.getAttribute('href').substring(1);
                
                // Update active states
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                sections.forEach(section => {
                    section.classList.remove('active');
                    if (section.id === targetId) {
                        section.classList.add('active');
                    }
                });
            });
        });
        
        // Handle "Start Exploring" button
        const startExploringBtn = document.getElementById('start-exploring');
        if (startExploringBtn) {
            startExploringBtn.addEventListener('click', () => {
                // Navigate to the neural networks section
                const neuralNetworksLink = document.querySelector('nav a[href="#neural-networks"]');
                neuralNetworksLink.click();
            });
        }
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
    }
}; 