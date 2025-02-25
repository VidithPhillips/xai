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
        const width = this.container.clientWidth || 800;
        const height = this.container.clientHeight || 400;
        const margin = { top: 40, right: 30, bottom: 40, left: 150 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;
        
        // Create SVG
        this.svg = d3.select(this.container)
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);
        
        // Add title
        this.svg.append('text')
            .attr('x', innerWidth / 2)
            .attr('y', -20)
            .attr('text-anchor', 'middle')
            .attr('fill', '#ffffff')
            .attr('font-size', '18px')
            .text('Counterfactual Explanation');
        
        // Create sample data
        const originalFeatures = [
            { name: 'Income', value: 45000, counterfactual: 52000 },
            { name: 'Credit Score', value: 680, counterfactual: 720 },
            { name: 'Debt Ratio', value: 0.42, counterfactual: 0.35 },
            { name: 'Loan Amount', value: 15000, counterfactual: 15000 },
            { name: 'Employment Years', value: 3, counterfactual: 3 },
            { name: 'Previous Defaults', value: 1, counterfactual: 0 }
        ];
        
        // Create scales
        const yScale = d3.scaleBand()
            .domain(originalFeatures.map(d => d.name))
            .range([0, innerHeight])
            .padding(0.2);
        
        // Find min and max for x scale
        const allValues = originalFeatures.flatMap(d => [d.value, d.counterfactual]);
        const minValue = d3.min(allValues) * 0.8;
        const maxValue = d3.max(allValues) * 1.2;
        
        const xScale = d3.scaleLinear()
            .domain([minValue, maxValue])
            .range([0, innerWidth]);
        
        // Add y-axis
        this.svg.append('g')
            .attr('class', 'y-axis')
            .call(d3.axisLeft(yScale))
            .selectAll('text')
            .style('fill', '#ffffff');
        
        // Add x-axis
        this.svg.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0, ${innerHeight})`)
            .call(d3.axisBottom(xScale))
            .selectAll('text')
            .style('fill', '#ffffff');
        
        // Add original value bars
        this.svg.selectAll('.original-bar')
            .data(originalFeatures)
            .enter()
            .append('rect')
            .attr('class', 'original-bar')
            .attr('x', 0)
            .attr('y', d => yScale(d.name))
            .attr('height', yScale.bandwidth() / 2)
            .attr('width', d => xScale(d.value))
            .attr('fill', '#3b82f6')
            .attr('opacity', 0.7);
        
        // Add counterfactual value bars
        this.svg.selectAll('.counterfactual-bar')
            .data(originalFeatures)
            .enter()
            .append('rect')
            .attr('class', 'counterfactual-bar')
            .attr('x', 0)
            .attr('y', d => yScale(d.name) + yScale.bandwidth() / 2)
            .attr('height', yScale.bandwidth() / 2)
            .attr('width', d => xScale(d.counterfactual))
            .attr('fill', '#f97316')
            .attr('opacity', 0.7);
        
        // Add value labels
        this.svg.selectAll('.original-value')
            .data(originalFeatures)
            .enter()
            .append('text')
            .attr('class', 'value-label')
            .attr('x', d => xScale(d.value) + 5)
            .attr('y', d => yScale(d.name) + yScale.bandwidth() / 4)
            .attr('dy', '0.35em')
            .attr('text-anchor', 'start')
            .text(d => d.value)
            .style('fill', '#ffffff')
            .style('font-size', '10px');
        
        this.svg.selectAll('.counterfactual-value')
            .data(originalFeatures)
            .enter()
            .append('text')
            .attr('class', 'value-label')
            .attr('x', d => xScale(d.counterfactual) + 5)
            .attr('y', d => yScale(d.name) + yScale.bandwidth() * 3/4)
            .attr('dy', '0.35em')
            .attr('text-anchor', 'start')
            .text(d => d.counterfactual)
            .style('fill', '#ffffff')
            .style('font-size', '10px');
        
        // Add legend
        const legend = this.svg.append('g')
            .attr('class', 'legend')
            .attr('transform', `translate(${innerWidth - 150}, -30)`);
        
        legend.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', 15)
            .attr('height', 15)
            .attr('fill', '#3b82f6')
            .attr('opacity', 0.7);
        
        legend.append('text')
            .attr('x', 20)
            .attr('y', 7.5)
            .attr('dy', '0.35em')
            .text('Original')
            .style('fill', '#ffffff')
            .style('font-size', '12px');
        
        legend.append('rect')
            .attr('x', 0)
            .attr('y', 20)
            .attr('width', 15)
            .attr('height', 15)
            .attr('fill', '#f97316')
            .attr('opacity', 0.7);
        
        legend.append('text')
            .attr('x', 20)
            .attr('y', 27.5)
            .attr('dy', '0.35em')
            .text('Counterfactual')
            .style('fill', '#ffffff')
            .style('font-size', '12px');
    }
}

window.CounterfactualsVis = CounterfactualsVis; 