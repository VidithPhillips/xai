/**
 * Guided Tour Utility
 * This file contains functions for creating guided tours of visualizations
 */

const GuidedTour = {
    // Create a tour for a specific visualization
    createTour: function(visualizationId, steps) {
        const container = document.getElementById(visualizationId);
        if (!container) return;
        
        // Create a more subtle tour button
        const tourButton = document.createElement('button');
        tourButton.className = 'tour-button';
        tourButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg> Tour';
        tourButton.style.position = 'absolute';
        tourButton.style.top = '10px';
        tourButton.style.right = '10px';
        tourButton.style.zIndex = '100';
        tourButton.style.padding = '6px 12px';
        tourButton.style.background = 'rgba(255, 255, 255, 0.9)';
        tourButton.style.color = 'var(--primary-color)';
        tourButton.style.border = '1px solid var(--border-color)';
        tourButton.style.borderRadius = '4px';
        tourButton.style.cursor = 'pointer';
        tourButton.style.fontSize = '14px';
        tourButton.style.fontWeight = '500';
        tourButton.style.display = 'flex';
        tourButton.style.alignItems = 'center';
        tourButton.style.gap = '6px';
        tourButton.style.boxShadow = 'var(--shadow-sm)';
        
        container.style.position = 'relative';
        container.appendChild(tourButton);
        
        // Start tour when button is clicked
        tourButton.addEventListener('click', () => {
            this.startTour(visualizationId, steps);
        });
    },
    
    // Start the guided tour
    startTour: function(visualizationId, steps) {
        let currentStep = 0;
        
        const showStep = (step) => {
            // Create or update tooltip
            let tooltip = document.getElementById('tour-tooltip');
            if (!tooltip) {
                tooltip = document.createElement('div');
                tooltip.id = 'tour-tooltip';
                tooltip.style.position = 'absolute';
                tooltip.style.zIndex = '1000';
                tooltip.style.background = 'white';
                tooltip.style.padding = '15px';
                tooltip.style.borderRadius = '5px';
                tooltip.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                tooltip.style.maxWidth = '300px';
                document.body.appendChild(tooltip);
            }
            
            // Position tooltip
            const element = document.querySelector(step.element);
            if (element) {
                const rect = element.getBoundingClientRect();
                tooltip.style.left = (rect.left + rect.width / 2 - 150) + 'px';
                tooltip.style.top = (rect.bottom + 10) + 'px';
            }
            
            // Set tooltip content
            tooltip.innerHTML = `
                <h4>${step.title}</h4>
                <p>${step.content}</p>
                <div style="display: flex; justify-content: space-between; margin-top: 10px;">
                    ${currentStep > 0 ? '<button id="prev-step">Previous</button>' : '<div></div>'}
                    ${currentStep < steps.length - 1 ? 
                        '<button id="next-step">Next</button>' : 
                        '<button id="end-tour">End Tour</button>'}
                </div>
            `;
            
            // Add event listeners
            if (currentStep > 0) {
                document.getElementById('prev-step').addEventListener('click', () => {
                    currentStep--;
                    showStep(steps[currentStep]);
                });
            }
            
            if (currentStep < steps.length - 1) {
                document.getElementById('next-step').addEventListener('click', () => {
                    currentStep++;
                    showStep(steps[currentStep]);
                });
            } else {
                document.getElementById('end-tour').addEventListener('click', () => {
                    tooltip.remove();
                });
            }
            
            // Highlight the element
            if (element) {
                element.style.outline = '2px solid #4f46e5';
                element.style.outlineOffset = '2px';
                
                // Remove highlight from previous elements
                document.querySelectorAll('.tour-highlight').forEach(el => {
                    if (el !== element) {
                        el.style.outline = 'none';
                        el.classList.remove('tour-highlight');
                    }
                });
                
                element.classList.add('tour-highlight');
            }
        };
        
        // Show first step
        if (steps.length > 0) {
            showStep(steps[0]);
        }
    }
}; 