dispose() {
    // Stop any animations
    if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
    }
    
    // Remove event listeners
    window.removeEventListener('resize', this.resizeHandler);
    
    // Clear SVG and container
    if (this.svg) {
        this.svg.remove();
    }
    
    // Clear container
    while (this.container.firstChild) {
        this.container.removeChild(this.container.firstChild);
    }
} 