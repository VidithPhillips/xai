class LocalExplanationsVis {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`Container #${containerId} not found`);
            return;
        }
        this.createChart();
    }

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

    createChart() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        
        // Increased left margin to prevent text overlap
        const margin = { top: 20, right: 30, bottom: 40, left: 150 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;
        
        // Create or get sample data if not available
        if (!this.data) {
            this.data = this.getSampleData();
        }
        
        // Create scales
        this.xScale = d3.scaleLinear()
            .domain([d3.min(this.data, d => d.effect) * 1.2, d3.max(this.data, d => d.effect) * 1.2])
            .range([0, innerWidth]);
            
        this.yScale = d3.scaleBand()
            .domain(this.data.map(d => d.feature))
            .range([0, innerHeight])
            .padding(0.2);
        
        // Create SVG container
        this.svg = d3.select(this.container)
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);
            
        // Use neon colors for positive/negative bars
        const positiveColor = getComputedStyle(document.documentElement).getPropertyValue('--secondary').trim();
        const negativeColor = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
        
        // Create positive bars
        this.svg.selectAll('.positive-bar')
            .data(this.data.filter(d => d.effect >= 0))
            .enter()
            .append('rect')
            .attr('class', 'bar positive-bar')
            .attr('x', this.xScale(0))
            .attr('y', d => this.yScale(d.feature))
            .attr('height', this.yScale.bandwidth())
            .attr('width', d => this.xScale(d.effect) - this.xScale(0))
            .attr('fill', positiveColor)
            .attr('filter', 'url(#secondary-glow)');

        // Create negative bars
        this.svg.selectAll('.negative-bar')
            .data(this.data.filter(d => d.effect < 0))
            .enter()
            .append('rect')
            .attr('class', 'bar negative-bar')
            .attr('x', d => this.xScale(d.effect))
            .attr('y', d => this.yScale(d.feature))
            .attr('height', this.yScale.bandwidth())
            .attr('width', d => this.xScale(0) - this.xScale(d.effect))
            .attr('fill', negativeColor)
            .attr('filter', 'url(#accent-glow)');
            
        // Update axis colors
        this.svg.selectAll('.axis text')
            .style('fill', '#bbbbbb');
        this.svg.selectAll('.axis path, .axis line')
            .style('stroke', '#444444');
    }

    // Add sample data method for testing
    getSampleData() {
        return [
            { feature: "Income", effect: 0.65 },
            { feature: "Credit Score", effect: 0.42 },
            { feature: "Employment Years", effect: 0.28 },
            { feature: "Debt Ratio", effect: -0.35 },
            { feature: "Loan Amount", effect: -0.22 },
            { feature: "Previous Defaults", effect: -0.54 },
            { feature: "Age", effect: 0.15 }
        ];
    }
}

window.LocalExplanationsVis = LocalExplanationsVis; 