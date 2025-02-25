// Define colors if not defined elsewhere
const positiveColor = "#10b981"; // Green
const negativeColor = "#ef4444"; // Red

class FeatureImportanceVis {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        
        // Set dimensions based on container
        this.updateDimensions();
        
        // Create chart with proper margins
        this.margin = {
            top: 20,
            right: 120,
            bottom: 40,
            left: 200
        };
        
        // Add resize handler
        this.resizeHandler = this.handleResize.bind(this);
        window.addEventListener('resize', this.resizeHandler);
        
        // Create chart after everything is set up
        setTimeout(() => this.createChart(), 50);
    }
    
    updateDimensions() {
        const rect = this.container.getBoundingClientRect();
        this.width = rect.width;
        this.height = rect.height;
        
        if (this.svg) {
            this.svg
                .attr('width', this.width)
                .attr('height', this.height);
                
            this.updateChart();
        }
    }
    
    handleResize() {
        this.updateDimensions();
    }

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

    updateChart() {
        if (!this.svg) return;
        
        // Get current method
        const activeMethod = document.querySelector('.method-btn.active');
        const method = activeMethod ? activeMethod.dataset.method : 'permutation';
        
        // Get data for the current method
        const data = this.generateData(method);
        
        // Update scales
        const minValUp = d3.min(data, d => d.importance);
        const maxValUp = d3.max(data, d => d.importance);
        this.xScale.domain([Math.min(0, minValUp), Math.max(0, maxValUp)]);
        
        // Update y scale
        this.yScale.domain(data.map(d => d.feature));
        
        // Clear existing bars
        this.svg.selectAll('.bar').remove();
        
        // Create new bars
        this.svg.selectAll('.bar')
            .data(data)
            .enter()
            .append('rect')
            .attr('class', d => d.importance < 0 ? 'bar negative-bar' : 'bar positive-bar')
            .attr('x', d => d.importance < 0 ? this.xScale(d.importance) : this.xScale(0))
            .attr('y', d => this.yScale(d.feature))
            .attr('height', this.yScale.bandwidth())
            .attr('width', d => Math.abs(this.xScale(d.importance) - this.xScale(0)))
            .attr('fill', d => d.importance < 0 ? negativeColor : positiveColor);
        
        // Update value labels
        this.svg.selectAll('.value-label').remove();
        
        this.svg.selectAll('.value-label')
            .data(data)
            .enter()
            .append('text')
            .attr('class', 'value-label')
            .attr('y', d => this.yScale(d.feature) + this.yScale.bandwidth() / 2)
            .attr('dy', '0.35em')
            .attr('x', d => this.xScale(d.importance) + (d.importance < 0 ? -5 : 5))
            .attr('text-anchor', d => d.importance < 0 ? 'end' : 'start')
            .attr('fill', '#ffffff')
            .text(d => d.importance.toFixed(2));
        
        // Update axes
        if (!this.svg.select('.x-axis').empty()) {
            this.svg.select('.x-axis')
                .attr('transform', `translate(0, ${this.yScale.range()[1] + 10})`)
                .call(d3.axisBottom(this.xScale));
        } else {
            this.svg.append('g')
                .attr('class', 'x-axis')
                .attr('transform', `translate(0, ${this.yScale.range()[1] + 10})`)
                .call(d3.axisBottom(this.xScale));
        }
        
        if (!this.svg.select('.y-axis').empty()) {
            this.svg.select('.y-axis')
                .call(d3.axisLeft(this.yScale));
        } else {
            this.svg.append('g')
                .attr('class', 'y-axis')
                .call(d3.axisLeft(this.yScale));
        }
    }

    generateData(method = 'permutation') {
        // Generate mock data with proper neon colors
        let data;
        
        switch(method) {
            case 'shap':
                data = [
                    { feature: 'Credit Score', importance: 0.85 },
                    { feature: 'Income', importance: 0.72 },
                    { feature: 'Debt Ratio', importance: 0.64 },
                    { feature: 'Previous Defaults', importance: 0.58 },
                    { feature: 'Employment Years', importance: 0.49 },
                    { feature: 'Loan Amount', importance: 0.37 },
                    { feature: 'Age', importance: 0.25 }
                ];
                break;
            case 'tree':
                data = [
                    { feature: 'Credit Score', importance: 0.88 },
                    { feature: 'Previous Defaults', importance: 0.76 },
                    { feature: 'Income', importance: 0.67 },
                    { feature: 'Debt Ratio', importance: 0.53 },
                    { feature: 'Employment Years', importance: 0.42 },
                    { feature: 'Loan Amount', importance: 0.31 },
                    { feature: 'Age', importance: 0.15 }
                ];
                break;
            default: // permutation
                data = [
                    { feature: 'Income', importance: 0.82 },
                    { feature: 'Credit Score', importance: 0.78 },
                    { feature: 'Debt Ratio', importance: 0.65 },
                    { feature: 'Age', importance: 0.43 },
                    { feature: 'Employment Years', importance: 0.38 },
                    { feature: 'Loan Amount', importance: 0.35 },
                    { feature: 'Previous Defaults', importance: 0.28 }
                ];
        }
        
        return data;
    }

    createChart() {
        const width = this.container.clientWidth || 800;
        const height = this.container.clientHeight || 400;
        
        // Use larger margins to prevent text overlap
        const margin = { top: 30, right: 30, bottom: 50, left: 150 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;
        
        // Create or get sample data if not available
        if (!this.data) {
            this.data = this.generateData();
        }
        
        // Find the maximum absolute value for symmetric domain
        const maxValue = Math.max(
            Math.abs(d3.min(this.data, d => d.importance)),
            Math.abs(d3.max(this.data, d => d.importance))
        );
        
        // Create scales with symmetric domain
        this.xScale = d3.scaleLinear()
            .domain([-maxValue * 1.2, maxValue * 1.2])
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
        
        // Create bars with guaranteed positive width
        this.svg.selectAll('.bar')
            .data(this.data)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('x', d => d.importance < 0 ? this.xScale(d.importance) : this.xScale(0))
            .attr('y', d => this.yScale(d.feature))
            .attr('height', this.yScale.bandwidth())
            .attr('width', d => Math.abs(this.xScale(d.importance) - this.xScale(0)))
            .attr('fill', d => d.importance >= 0 ? '#4ade80' : '#f87171')
            .attr('filter', 'url(#glow)');
        
        // Add feature labels
        this.svg.selectAll('.feature-label')
            .data(this.data)
            .enter()
            .append('text')
            .attr('class', 'feature-label')
            .attr('x', d => d.importance < 0 ? this.xScale(d.importance) - 5 : this.xScale(0) + 5)
            .attr('y', d => this.yScale(d.feature) + this.yScale.bandwidth() / 2)
            .attr('dy', '0.35em')
            .attr('text-anchor', d => d.importance < 0 ? 'end' : 'start')
            .text(d => d.feature)
            .style('fill', '#ffffff')
            .style('font-size', '12px');
        
        // Add importance values
        this.svg.selectAll('.importance-value')
            .data(this.data)
            .enter()
            .append('text')
            .attr('class', 'importance-value')
            .attr('x', d => d.importance < 0 ? this.xScale(0) - 5 : this.xScale(d.importance) + 5)
            .attr('y', d => this.yScale(d.feature) + this.yScale.bandwidth() / 2)
            .attr('dy', '0.35em')
            .attr('text-anchor', d => d.importance < 0 ? 'end' : 'start')
            .text(d => d.importance.toFixed(2))
            .style('fill', '#bbbbbb')
            .style('font-size', '10px');
        
        // Add x-axis
        this.svg.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0, ${innerHeight})`)
            .call(d3.axisBottom(this.xScale))
            .selectAll('text')
            .style('fill', '#bbbbbb');
        
        // Add y-axis
        this.svg.append('g')
            .attr('class', 'y-axis')
            .call(d3.axisLeft(this.yScale))
            .selectAll('text')
            .style('fill', '#bbbbbb');
        
        // Add title
        this.svg.append('text')
            .attr('class', 'chart-title')
            .attr('x', innerWidth / 2)
            .attr('y', -10)
            .attr('text-anchor', 'middle')
            .text('Feature Importance')
            .style('fill', '#ffffff')
            .style('font-size', '16px');
    }
    
    measureMaxLabelWidth() {
        const context = document.createElement('canvas').getContext('2d');
        context.font = '12px Inter';
        
        const data = this.generateData();
        return Math.max(...data.map(d => 
            context.measureText(d.feature).width
        ));
    }
}

// Export with the correct name
window.FeatureImportanceVis = FeatureImportanceVis; 