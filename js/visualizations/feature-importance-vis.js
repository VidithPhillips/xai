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
        // Generate data first
        const data = this.generateData();
        
        const containerWidth = this.container.clientWidth;
        const containerHeight = this.container.clientHeight;
        
        if (containerWidth < 100 || containerHeight < 100) {
            console.warn("Container dimensions too small for visualization");
            setTimeout(() => this.createChart(), 100);
            return;
        }
        
        const width = containerWidth;
        const height = containerHeight;
        const margin = { top: 20, right: 30, bottom: 40, left: 120 };
        const innerWidth = Math.max(0, width - margin.left - margin.right);
        const innerHeight = Math.max(0, height - margin.top - margin.bottom);
        
        const minVal = d3.min(data, d => d.importance);
        const maxVal = d3.max(data, d => d.importance);
        
        // Ensure domain includes 0 and handles negative values properly
        this.xScale = d3.scaleLinear()
            .domain([Math.min(0, minVal), Math.max(0, maxVal)])
            .range([0, innerWidth]);
        
        this.yScale = d3.scaleBand()
            .domain(data.map(d => d.feature))
            .range([0, innerHeight])
            .padding(0.2);
        
        this.svg = d3.select(this.container)
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);
        
        // Create bars
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
        
        // Add value labels
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
        
        // Add axes
        this.svg.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0, ${innerHeight})`)
            .call(d3.axisBottom(this.xScale));
        
        this.svg.append('g')
            .attr('class', 'y-axis')
            .call(d3.axisLeft(this.yScale));
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