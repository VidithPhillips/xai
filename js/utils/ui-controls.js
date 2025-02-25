/**
 * UI Controls utility functions
 * This file contains helper functions for UI interactions
 */

class UIControls {
    static activeSection = null;
    static activeVisualizations = new Map();
    static eventListeners = new Map();

    static initModals() {
        const modals = document.querySelectorAll('.modal');
        const modalTriggers = document.querySelectorAll('[id$="-link"]');
        const closeButtons = document.querySelectorAll('.close-modal');

        modalTriggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                const modalId = trigger.id.replace('-link', '-modal');
                document.getElementById(modalId).style.display = 'block';
            });
        });

        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                button.closest('.modal').style.display = 'none';
            });
        });
    }

    static initButtons() {
        // Initialize method buttons
        document.querySelectorAll('.method-btn').forEach(button => {
            button.addEventListener('click', () => {
                const parent = button.parentElement;
                parent.querySelectorAll('.method-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                button.classList.add('active');
            });
        });

        // Initialize instance and scenario buttons
        ['instance-btn', 'scenario-btn'].forEach(btnClass => {
            document.querySelectorAll(`.${btnClass}`).forEach(button => {
                button.addEventListener('click', () => {
                    const parent = button.parentElement;
                    parent.querySelectorAll(`.${btnClass}`).forEach(btn => {
                        btn.classList.remove('active');
                    });
                    button.classList.add('active');
                });
            });
        });

        // Set first buttons as active
        document.querySelectorAll('.method-buttons, .instance-buttons, .scenario-buttons').forEach(container => {
            const firstButton = container.querySelector('button');
            if (firstButton) {
                firstButton.classList.add('active');
            }
        });
    }

    static addTrackedEventListener(element, event, handler) {
        if (!element) return;
        
        const listeners = this.eventListeners.get(element) || [];
        listeners.push({ event, handler });
        this.eventListeners.set(element, listeners);
        
        element.addEventListener(event, handler);
    }
    
    static removeAllTrackedEventListeners(element) {
        if (!element) return;
        
        const listeners = this.eventListeners.get(element);
        if (listeners) {
            listeners.forEach(({ event, handler }) => {
                element.removeEventListener(event, handler);
            });
            this.eventListeners.delete(element);
        }
    }

    static initNavigation() {
        const navLinks = document.querySelectorAll('nav a');
        navLinks.forEach(link => {
            this.addTrackedEventListener(link, 'click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                window.location.hash = targetId;
                this.activateSection(targetId);
            });
        });
        
        // Handle initial section from hash
        const initialSection = window.location.hash.substring(1) || 'introduction';
        this.activateSection(initialSection);
        
        // Handle hash changes
        window.addEventListener('hashchange', () => {
            const sectionId = window.location.hash.substring(1) || 'introduction';
            this.activateSection(sectionId);
        });
    }

    static activateSection(sectionId) {
        if (!sectionId || this.activeSection === sectionId) return;
        
        try {
            console.log(`Activating section: ${sectionId}`);
            
            // Cleanup previous section
            if (this.activeSection) {
                const prevVis = this.activeVisualizations.get(this.activeSection);
                if (prevVis && typeof prevVis.dispose === 'function') {
                    try {
                        prevVis.dispose();
                    } catch (error) {
                        console.error(`Error disposing visualization for ${this.activeSection}:`, error);
                    }
                }
                this.activeVisualizations.delete(this.activeSection);
            }

            // Update active section
            this.activeSection = sectionId;
            
            // Update UI
            document.querySelectorAll('section').forEach(section => {
                const isActive = section.id === sectionId;
                section.style.display = isActive ? 'block' : 'none';
                section.classList.toggle('active', isActive);
            });

            // Initialize new visualization after section is visible
            if (window.visualizationRegistry) {
                setTimeout(() => {
                    try {
                        const vis = window.visualizationRegistry.create(sectionId);
                        if (vis) {
                            this.activeVisualizations.set(sectionId, vis);
                        }
                    } catch (error) {
                        console.error(`Error creating visualization for ${sectionId}:`, error);
                    }
                }, 100);
            }
        } catch (error) {
            console.error('Error activating section:', error);
        }
    }
}

// Export to window
window.UIControls = UIControls; 