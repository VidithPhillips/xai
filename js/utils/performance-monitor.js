/**
 * Performance monitoring utilities
 */
class PerformanceMonitor {
    static init() {
        this.metrics = {
            fps: [],
            renderTimes: [],
            memoryUsage: []
        };
        
        this.isMonitoring = false;
        this.lastFrameTime = 0;
        this.frameCount = 0;
        this.lastFpsUpdate = 0;
        
        console.log('Performance monitor initialized');
    }
    
    static startMonitoring() {
        if (this.isMonitoring) return;
        
        this.isMonitoring = true;
        this.lastFrameTime = performance.now();
        this.frameCount = 0;
        this.lastFpsUpdate = this.lastFrameTime;
        
        this.monitorFrame();
        
        // Monitor memory usage if available
        if (performance.memory) {
            this.memoryInterval = setInterval(() => {
                this.metrics.memoryUsage.push({
                    timestamp: performance.now(),
                    value: performance.memory.usedJSHeapSize / (1024 * 1024) // MB
                });
                
                // Keep only last 100 samples
                if (this.metrics.memoryUsage.length > 100) {
                    this.metrics.memoryUsage.shift();
                }
            }, 1000);
        }
        
        console.log('Performance monitoring started');
    }
    
    static stopMonitoring() {
        this.isMonitoring = false;
        if (this.memoryInterval) {
            clearInterval(this.memoryInterval);
        }
        console.log('Performance monitoring stopped');
    }
    
    static monitorFrame() {
        if (!this.isMonitoring) return;
        
        const now = performance.now();
        const elapsed = now - this.lastFrameTime;
        
        // Record render time
        this.metrics.renderTimes.push({
            timestamp: now,
            value: elapsed
        });
        
        // Keep only last 100 samples
        if (this.metrics.renderTimes.length > 100) {
            this.metrics.renderTimes.shift();
        }
        
        // Update FPS counter
        this.frameCount++;
        if (now - this.lastFpsUpdate >= 1000) { // Update FPS every second
            const fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate));
            this.metrics.fps.push({
                timestamp: now,
                value: fps
            });
            
            // Keep only last 60 samples
            if (this.metrics.fps.length > 60) {
                this.metrics.fps.shift();
            }
            
            this.lastFpsUpdate = now;
            this.frameCount = 0;
            
            // Log performance issues
            if (fps < 30) {
                console.warn(`Low FPS detected: ${fps}`);
            }
        }
        
        this.lastFrameTime = now;
        requestAnimationFrame(() => this.monitorFrame());
    }
    
    static getMetrics() {
        return this.metrics;
    }
    
    static getAverageFps() {
        if (this.metrics.fps.length === 0) return 0;
        const sum = this.metrics.fps.reduce((acc, curr) => acc + curr.value, 0);
        return Math.round(sum / this.metrics.fps.length);
    }
    
    static getAverageRenderTime() {
        if (this.metrics.renderTimes.length === 0) return 0;
        const sum = this.metrics.renderTimes.reduce((acc, curr) => acc + curr.value, 0);
        return sum / this.metrics.renderTimes.length;
    }
}

// Initialize performance monitor
PerformanceMonitor.init();

// Export to window
window.PerformanceMonitor = PerformanceMonitor; 