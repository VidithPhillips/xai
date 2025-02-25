class CounterfactualsVis {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`Container #${containerId} not found`);
            return;
        }
        
        console.log(`Creating CounterfactualsVis in container:`, containerId);
        console.log(`Container dimensions:`, this.container.clientWidth, 'x', this.container.clientHeight);
        
        this.createChart();
    }
    
    dispose() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        window.removeEventListener('resize', this.resizeHandler);
        document.removeEventListener('featureChange', this.handleFeatureChange);
        if (this.svg) {
            this.svg.remove();
        }
        while (this.container.firstChild) {
            this.container.removeChild(this.container.firstChild);
        }
    }
    
    createChart() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        const margin = { top: 20, right: 30, bottom: 40, left: 150 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;
        
        this.svg = d3.select(this.container)
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);
        
        // Example placeholder for Counterfactuals visualization
        this.svg.append('text')
            .attr('x', innerWidth / 2)
            .attr('y', innerHeight / 2)
            .attr('text-anchor', 'middle')
            .text('Counterfactuals Visualization Placeholder');
    }
}

window.CounterfactualsVis = CounterfactualsVis; 