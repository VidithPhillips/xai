/**
 * Performance Optimizer
 * This file contains utilities for optimizing visualization performance
 */

const PerformanceOptimizer = {
    // Debounce function to limit how often a function can be called
    debounce: function(func, wait, immediate) {
        let timeout;
        return function() {
            const context = this, args = arguments;
            const later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    },
    
    // Throttle function to limit how often a function can be called
    throttle: function(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    // Lazy load visualizations only when they become visible
    setupLazyLoading: function() {
        // Check which sections are visible and initialize their visualizations
        const checkVisibility = this.throttle(() => {
            const sections = document.querySelectorAll('section');
            sections.forEach(section => {
                if (section.classList.contains('active') && VisualizationHelpers.isElementVisible(section)) {
                    // Dispatch section activation event
                    const event = new CustomEvent('sectionActivated', { 
                        detail: { sectionId: section.id }
                    });
                    document.dispatchEvent(event);
                }
            });
        }, 200); // Check at most every 200ms
        
        // Check visibility on scroll and resize
        window.addEventListener('scroll', checkVisibility);
        window.addEventListener('resize', checkVisibility);
        
        // Initial check
        checkVisibility();
    }
};

// Initialize lazy loading when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    PerformanceOptimizer.setupLazyLoading();
}); /**
 * Performance Monitor
 * This file contains utilities for monitoring and optimizing performance
 */

const PerformanceMonitor = {
    // FPS counter
    fps: {
        frames: 0,
        lastTime: performance.now(),
        value: 0,
        
        // Update FPS counter
        update: function() {
            this.frames++;
            const now = performance.now();
            const elapsed = now - this.lastTime;
            
            if (elapsed >= 1000) {
                this.value = Math.round((this.frames * 1000) / elapsed);
                this.frames = 0;
                this.lastTime = now;
                
                // If FPS is too low, optimize visualizations
                if (this.value < 30) {
                    this.optimizeVisualizations();
                }
            }
            
            requestAnimationFrame(() => this.update());
        },
        
        // Start monitoring FPS
        start: function() {
            this.update();
        },
        
        // Optimize visualizations if performance is poor
        optimizeVisualizations: function() {
            console.log("Low FPS detected, optimizing visualizations");
            
            // Reduce particle counts
            if (window.particleBackgrounds) {
                Object.values(window.particleBackgrounds).forEach(bg => {
                    if (bg.options.particleCount > 10) {
                        bg.options.particleCount = Math.max(10, bg.options.particleCount * 0.7);
                        bg.createParticles();
                    }
                });
            }
            
            // Simplify other visualizations as needed
        }
    },
    
    // Start all performance monitoring
    start: function() {
        this.fps.start();
    }
};

// Start performance monitoring when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    PerformanceMonitor.start();
}); 