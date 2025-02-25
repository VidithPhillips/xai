// Define colors if not defined elsewhere
const positiveColor = "#10b981"; // Green
const negativeColor = "#ef4444"; // Red

class FeatureImportanceVis {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`Container #${containerId} not found`);
            return;
        }
        
        console.log(`Creating FeatureImportanceVis in container:`, containerId);
        console.log(`Container dimensions:`, this.container.clientWidth, 'x', this.container.clientHeight);
        
        // Set default dimensions if container dimensions are zero
        const width = this.container.clientWidth || 800;
        const height = this.container.clientHeight || 400;
        
        // These should be assigned to instance properties
        this.width = width;
        this.height = height;
        
        // Create chart
        this.createChart();
        
        // Add event listeners for method buttons
        this.setupMethodButtons();
        
        // Add resize handler
        this.resizeHandler = this.handleResize.bind(this);
        window.addEventListener('resize', this.resizeHandler);
    }
    
    setupMethodButtons() {
        // Find method buttons
        const methodButtons = document.querySelectorAll('.method-btn');
        if (methodButtons.length === 0) {
            console.warn('No method buttons found for feature importance visualization');
            return;
        }
        
        // Add click event listeners
        methodButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Update active button
                methodButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Get method from button
                const method = button.dataset.method || 'permutation';
                console.log(`Switching to method: ${method}`);
                
                // Update visualization
                this.updateVisualization(method);
            });
        });
        
        // Set first button as active
        if (methodButtons[0]) {
            methodButtons[0].classList.add('active');
        }
    }

    updateVisualization(method) {
        // Generate data for the selected method
        const data = this.generateData(method);
        
        // Update scales
        const maxValue = Math.max(
            Math.abs(d3.min(data, d => d.importance)),
            Math.abs(d3.max(data, d => d.importance))
        );
        
        this.xScale.domain([-maxValue * 1.2, maxValue * 1.2]);
        this.yScale.domain(data.map(d => d.feature));
        
        // Update bars with transition
        const svg = this.svg;
        const xScale = this.xScale;
        const yScale = this.yScale;
        
        // Remove existing bars
        svg.selectAll('.bar').remove();
        
        // Create new bars with transition
        svg.selectAll('.bar')
            .data(data)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('x', d => d.importance < 0 ? xScale(d.importance) : xScale(0))
            .attr('y', d => yScale(d.feature))
            .attr('height', yScale.bandwidth())
            .attr('width', 0) // Start with zero width
            .attr('fill', d => d.importance >= 0 ? '#4ade80' : '#f87171')
            .transition()
            .duration(500)
            .attr('width', d => Math.abs(xScale(d.importance) - xScale(0)));
        
        // Update feature labels
        svg.selectAll('.feature-label').remove();
        
        svg.selectAll('.feature-label')
            .data(data)
            .enter()
            .append('text')
            .attr('class', 'feature-label')
            .attr('x', -10)
            .attr('y', d => yScale(d.feature) + yScale.bandwidth() / 2)
            .attr('dy', '0.35em')
            .attr('text-anchor', 'end')
            .text(d => d.feature)
            .style('fill', '#ffffff')
            .style('font-size', '12px');
        
        // Update importance values
        svg.selectAll('.importance-value').remove();
        
        svg.selectAll('.importance-value')
            .data(data)
            .enter()
            .append('text')
            .attr('class', 'importance-value')
            .attr('x', d => d.importance < 0 ? xScale(d.importance) - 5 : xScale(d.importance) + 5)
            .attr('y', d => yScale(d.feature) + yScale.bandwidth() / 2)
            .attr('dy', '0.35em')
            .attr('text-anchor', d => d.importance < 0 ? 'end' : 'start')
            .text(d => d.importance.toFixed(2))
            .style('fill', '#bbbbbb')
            .style('font-size', '10px');
        
        // Update axes
        svg.select('.x-axis')
            .transition()
            .duration(500)
            .call(d3.axisBottom(xScale));
        
        svg.select('.y-axis')
            .transition()
            .duration(500)
            .call(d3.axisLeft(yScale));
    }

    generateData(method) {
        // Generate different data based on method
        let data = [];
        
        switch (method) {
            case 'permutation':
                data = [
                    { feature: 'Income', importance: 0.85 },
                    { feature: 'Credit Score', importance: 0.78 },
                    { feature: 'Debt Ratio', importance: 0.65 },
                    { feature: 'Age', importance: 0.43 },
                    { feature: 'Employment Years', importance: 0.38 },
                    { feature: 'Loan Amount', importance: 0.35 },
                    { feature: 'Previous Defaults', importance: 0.28 }
                ];
                break;
            case 'shap':
                data = [
                    { feature: 'Credit Score', importance: 0.92 },
                    { feature: 'Income', importance: 0.76 },
                    { feature: 'Previous Defaults', importance: -0.65 },
                    { feature: 'Debt Ratio', importance: -0.58 },
                    { feature: 'Loan Amount', importance: -0.45 },
                    { feature: 'Employment Years', importance: 0.32 },
                    { feature: 'Age', importance: 0.25 }
                ];
                break;
            case 'lime':
                data = [
                    { feature: 'Previous Defaults', importance: -0.88 },
                    { feature: 'Credit Score', importance: 0.75 },
                    { feature: 'Income', importance: 0.62 },
                    { feature: 'Debt Ratio', importance: -0.55 },
                    { feature: 'Loan Amount', importance: -0.42 },
                    { feature: 'Age', importance: 0.30 },
                    { feature: 'Employment Years', importance: 0.28 }
                ];
                break;
            default:
                data = [
                    { feature: 'Income', importance: 0.85 },
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

    handleResize() {
        this.updateDimensions();
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
}

// Export with the correct name
window.FeatureImportanceVis = FeatureImportanceVis; 