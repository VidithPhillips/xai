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
                // Remove active class from siblings
                button.parentElement.querySelectorAll('.method-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                // Add active class to clicked button
                button.classList.add('active');
            });
        });

        // Initialize instance and scenario buttons
        ['instance-btn', 'scenario-btn'].forEach(btnClass => {
            document.querySelectorAll(`.${btnClass}`).forEach(button => {
                button.addEventListener('click', () => {
                    // Remove active class from siblings
                    button.parentElement.querySelectorAll(`.${btnClass}`).forEach(btn => {
                        btn.classList.remove('active');
                    });
                    // Add active class to clicked button
                    button.classList.add('active');
                });
            });
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
                this.activateSection(targetId);
            });
        });
    }

    static activateSection(sectionId) {
        if (this.activeSection === sectionId) return;
        
        // Cleanup previous section
        if (this.activeSection) {
            const prevVis = this.activeVisualizations.get(this.activeSection);
            if (prevVis && typeof prevVis.dispose === 'function') {
                prevVis.dispose();
            }
            this.activeVisualizations.delete(this.activeSection);
        }

        // Update active section
        this.activeSection = sectionId;
        
        // Update UI
        document.querySelectorAll('section').forEach(section => {
            section.classList.toggle('active', section.id === sectionId);
        });

        // Initialize new visualization
        if (window.visualizationRegistry) {
            const vis = window.visualizationRegistry.create(sectionId);
            if (vis) {
                this.activeVisualizations.set(sectionId, vis);
            }
        }
    }
}

// Export to window
window.UIControls = UIControls; 