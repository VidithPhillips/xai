/**
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