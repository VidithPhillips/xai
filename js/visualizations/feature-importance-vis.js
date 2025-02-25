class FeatureImportanceVis {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        
        // Set dimensions based on container
        this.updateDimensions();
        
        // Create chart with proper margins
        this.margin = {
            top: 20,
            right: 120, // Increased for labels
            bottom: 40,
            left: 200  // Increased for feature names
        };
        
        this.createChart();
        
        // Add resize handler
        this.resizeHandler = this.handleResize.bind(this);
        window.addEventListener('resize', this.resizeHandler);
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
        if (!this.svg) {
            this.createChart();
            return;
        }
        
        // Get current method
        const activeMethod = document.querySelector('.method-btn.active');
        const method = activeMethod ? activeMethod.dataset.method : 'permutation';
        
        // Get data for the current method
        const data = this.generateData(method);
        
        // Update scales
        this.xScale.domain([0, d3.max(data, d => d.importance)]);
        
        // Update bars with transition
        const bars = this.svg.selectAll('.bar')
            .data(data);
        
        // Update colors for dark theme
        const colorScale = d3.scaleLinear()
            .domain([0, this.maxImportance])
            .range(['#00395e', '#00f2ff']);
            
        // Only add glow filter if it doesn't exist yet
        if (!this.svg.select('defs').node()) {
            // Add a glow filter for neon effect
            const defs = this.svg.append('defs');
            const filter = defs.append('filter')
                .attr('id', 'feature-glow');  // Use unique ID to avoid conflicts
                
            filter.append('feGaussianBlur')
                .attr('stdDeviation', '2.5')
                .attr('result', 'coloredBlur');
                
            const feMerge = filter.append('feMerge');
            feMerge.append('feMergeNode')
                .attr('in', 'coloredBlur');
            feMerge.append('feMergeNode')
                .attr('in', 'SourceGraphic');
        }
        
        // Enter new bars
        bars.enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('y', d => this.yScale(d.feature))
            .attr('height', this.yScale.bandwidth())
            .attr('x', 0)
            .attr('width', 0)
            .attr('fill', d => colorScale(d.importance))
            .attr('filter', 'url(#feature-glow)')
            .merge(bars) // Combine enter + update
            .transition()
            .duration(750)
            .attr('y', d => this.yScale(d.feature))
            .attr('width', d => this.xScale(d.importance))
            .attr('fill', d => colorScale(d.importance));
        
        // Remove old bars
        bars.exit().remove();
        
        // Update value labels
        const labels = this.svg.selectAll('.value-label')
            .data(data);
        
        // Enter new labels
        labels.enter()
            .append('text')
            .attr('class', 'value-label')
            .attr('y', d => this.yScale(d.feature) + this.yScale.bandwidth() / 2)
            .attr('dy', '0.35em')
            .attr('x', d => this.xScale(d.importance) + 5)
            .attr('opacity', 0)
            .text(d => d.importance.toFixed(2))
            .merge(labels)
            .transition()
            .duration(750)
            .attr('y', d => this.yScale(d.feature) + this.yScale.bandwidth() / 2)
            .attr('x', d => this.xScale(d.importance) + 5)
            .attr('opacity', 1)
            .text(d => d.importance.toFixed(2));
        
        // Remove old labels
        labels.exit().remove();
        
        // Update axes
        this.svg.select('.x-axis')
            .transition()
            .duration(750)
            .call(d3.axisBottom(this.xScale))
            .selectAll('text')
            .style('fill', '#bbbbbb');
        
        this.svg.select('.y-axis')
            .call(d3.axisLeft(this.yScale))
            .selectAll('text')
            .style('fill', '#bbbbbb');
    }

    generateData(method = 'permutation') {
        // Generate mock data with proper neon colors
        const features = [
            'Income',
            'Credit Score',
            'Employment Years',
            'Debt Ratio',
            'Loan Amount',
            'Previous Defaults',
            'Age'
        ];
        
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
        
        this.maxImportance = Math.max(...data.map(d => d.importance));
        return data;
    }

    createChart() {
        // Calculate dimensions
        const availableWidth = this.width - this.margin.left - this.margin.right;
        const availableHeight = this.height - this.margin.top - this.margin.bottom;
        
        // Ensure minimum dimensions
        if (availableWidth < 200 || availableHeight < 200) {
            console.warn('Container dimensions too small for visualization');
            this.container.style.minHeight = '400px';
            this.updateDimensions();
            return;
        }
        
        // Create scales with proper domains
        this.xScale = d3.scaleLinear()
            .range([0, availableWidth]);
            
        this.yScale = d3.scaleBand()
            .range([0, availableHeight])
            .padding(0.2);
            
        // Add text measurement for dynamic margins
        const maxLabelWidth = this.measureMaxLabelWidth();
        this.margin.left = Math.max(this.margin.left, maxLabelWidth + 20);
        
        // Update chart with new margins
        this.updateChart();
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