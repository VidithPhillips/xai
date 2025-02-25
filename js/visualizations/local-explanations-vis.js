// Add a proper dispose method
dispose() {
    // Cancel any running animations
    if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
    }
    
    // Remove event listeners
    window.removeEventListener('resize', this.resizeHandler);
    if (this.instanceSelector) {
        this.instanceSelector.removeEventListener('change', this.handleInstanceChange);
    }
    
    // Clean up D3 resources
    if (this.svg) {
        this.svg.remove();
    }
    
    // Clear container
    while (this.container.firstChild) {
        this.container.removeChild(this.container.firstChild);
    }
} 