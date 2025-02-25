class LocalExplanationsVis {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`Container #${containerId} not found`);
            return;
        }
        
        console.log(`Creating LocalExplanationsVis in container:`, containerId);
        console.log(`Container dimensions:`, this.container.clientWidth, 'x', this.container.clientHeight);
        
        // Create chart
        this.createChart();
        
        // Add event listeners for instance buttons
        this.setupInstanceButtons();
        
        // Add resize handler
        this.resizeHandler = this.handleResize.bind(this);
        window.addEventListener('resize', this.resizeHandler);
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
        const width = this.container.clientWidth || 600; // Provide fallback width
        const height = this.container.clientHeight || 400; // Provide fallback height
        
        // Increased left margin to prevent text overlap
        const margin = { top: 20, right: 30, bottom: 40, left: 150 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;
        
        // Create or get sample data if not available
        if (!this.data) {
            this.data = this.getSampleData();
        }
        
        // Create scales with proper domains
        const maxEffect = Math.max(Math.abs(d3.min(this.data, d => d.effect)), Math.abs(d3.max(this.data, d => d.effect)));
        this.xScale = d3.scaleLinear()
            .domain([-maxEffect * 1.2, maxEffect * 1.2])
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
        const positiveColor = "#10b981"; // Green
        const negativeColor = "#ef4444"; // Red
        
        // Create positive bars
        this.svg.selectAll('.positive-bar')
            .data(this.data.filter(d => d.effect >= 0))
            .enter()
            .append('rect')
            .attr('class', 'bar positive-bar')
            .attr('x', this.xScale(0))
            .attr('y', d => this.yScale(d.feature))
            .attr('height', this.yScale.bandwidth())
            .attr('width', d => Math.max(0, this.xScale(d.effect) - this.xScale(0)))
            .attr('fill', positiveColor);

        // Create negative bars
        this.svg.selectAll('.negative-bar')
            .data(this.data.filter(d => d.effect < 0))
            .enter()
            .append('rect')
            .attr('class', 'bar negative-bar')
            .attr('x', d => this.xScale(d.effect))
            .attr('y', d => this.yScale(d.feature))
            .attr('height', this.yScale.bandwidth())
            .attr('width', d => Math.max(0, this.xScale(0) - this.xScale(d.effect)))
            .attr('fill', negativeColor);
        
        // Add feature labels
        this.svg.selectAll('.feature-label')
            .data(this.data)
            .enter()
            .append('text')
            .attr('class', 'feature-label')
            .attr('x', -10)
            .attr('y', d => this.yScale(d.feature) + this.yScale.bandwidth() / 2)
            .attr('dy', '0.35em')
            .attr('text-anchor', 'end')
            .text(d => d.feature)
            .style('fill', '#ffffff')
            .style('font-size', '12px');
        
        // Add x-axis
        this.svg.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0, ${innerHeight})`)
            .call(d3.axisBottom(this.xScale))
            .selectAll('text')
            .style('fill', '#ffffff');
        
        // Add y-axis
        this.svg.append('g')
            .attr('class', 'y-axis')
            .call(d3.axisLeft(this.yScale))
            .selectAll('text')
            .style('fill', '#ffffff');
        
        // Add zero line
        this.svg.append('line')
            .attr('x1', this.xScale(0))
            .attr('y1', 0)
            .attr('x2', this.xScale(0))
            .attr('y2', innerHeight)
            .attr('stroke', '#ffffff')
            .attr('stroke-width', 1)
            .attr('stroke-dasharray', '4');
        
        // Add title
        this.svg.append('text')
            .attr('x', innerWidth / 2)
            .attr('y', -5)
            .attr('text-anchor', 'middle')
            .attr('fill', '#ffffff')
            .attr('font-size', '16px')
            .text('Feature Effects on Prediction');
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

    setupInstanceButtons() {
        // Find instance buttons within the same section as the container
        const section = this.container.closest('section');
        const instanceButtons = section ? section.querySelectorAll('.instance-btn') : [];
        
        if (instanceButtons.length === 0) {
            console.warn('No instance buttons found for local explanations visualization');
            return;
        }
        
        instanceButtons.forEach(button => {
            button.addEventListener('click', () => {
                const instanceId = button.dataset.instance;
                this.updateVisualization(instanceId);
            });
        });
    }

    updateVisualization(instanceId) {
        // Generate data for the selected instance
        const data = this.getInstanceData(instanceId);
        
        // Update scales
        const maxEffect = Math.max(Math.abs(d3.min(data, d => d.effect)), Math.abs(d3.max(data, d => d.effect)));
        this.xScale.domain([-maxEffect * 1.2, maxEffect * 1.2]);
        this.yScale.domain(data.map(d => d.feature));
        
        // Update bars with transition
        const svg = this.svg;
        const xScale = this.xScale;
        const yScale = this.yScale;
        
        // Remove existing bars
        svg.selectAll('.bar').remove();
        
        // Create positive bars with transition
        svg.selectAll('.positive-bar')
            .data(data.filter(d => d.effect >= 0))
            .enter()
            .append('rect')
            .attr('class', 'bar positive-bar')
            .attr('x', xScale(0))
            .attr('y', d => yScale(d.feature))
            .attr('height', yScale.bandwidth())
            .attr('width', 0) // Start with zero width
            .attr('fill', '#10b981')
            .transition()
            .duration(500)
            .attr('width', d => Math.max(0, xScale(d.effect) - xScale(0)));
        
        // Create negative bars with transition
        svg.selectAll('.negative-bar')
            .data(data.filter(d => d.effect < 0))
            .enter()
            .append('rect')
            .attr('class', 'bar negative-bar')
            .attr('x', xScale(0))
            .attr('y', d => yScale(d.feature))
            .attr('height', yScale.bandwidth())
            .attr('width', 0) // Start with zero width
            .attr('fill', '#ef4444')
            .transition()
            .duration(500)
            .attr('x', d => xScale(d.effect))
            .attr('width', d => Math.max(0, xScale(0) - xScale(d.effect)));
        
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
        
        // Update axes
        svg.select('.x-axis')
            .transition()
            .duration(500)
            .call(d3.axisBottom(xScale));
        
        svg.select('.y-axis')
            .transition()
            .duration(500)
            .call(d3.axisLeft(yScale));
        
        // Update zero line
        svg.select('.zero-line').remove();
        
        svg.append('line')
            .attr('class', 'zero-line')
            .attr('x1', xScale(0))
            .attr('y1', 0)
            .attr('x2', xScale(0))
            .attr('y2', yScale.range()[1])
            .attr('stroke', '#ffffff')
            .attr('stroke-width', 1)
            .attr('stroke-dasharray', '4');
    }

    getInstanceData(instanceId) {
        // Generate different data based on instance ID
        switch (instanceId) {
            case '1':
                return [
                    { feature: "Income", effect: 0.65 },
                    { feature: "Credit Score", effect: 0.42 },
                    { feature: "Employment Years", effect: 0.28 },
                    { feature: "Debt Ratio", effect: -0.35 },
                    { feature: "Loan Amount", effect: -0.22 },
                    { feature: "Previous Defaults", effect: -0.54 },
                    { feature: "Age", effect: 0.15 }
                ];
            case '2':
                return [
                    { feature: "Credit Score", effect: 0.78 },
                    { feature: "Previous Defaults", effect: -0.65 },
                    { feature: "Income", effect: 0.32 },
                    { feature: "Loan Amount", effect: -0.45 },
                    { feature: "Debt Ratio", effect: -0.28 },
                    { feature: "Employment Years", effect: 0.18 },
                    { feature: "Age", effect: 0.05 }
                ];
            case '3':
                return [
                    { feature: "Previous Defaults", effect: -0.82 },
                    { feature: "Debt Ratio", effect: -0.58 },
                    { feature: "Credit Score", effect: 0.35 },
                    { feature: "Income", effect: 0.25 },
                    { feature: "Employment Years", effect: 0.15 },
                    { feature: "Loan Amount", effect: -0.12 },
                    { feature: "Age", effect: 0.08 }
                ];
            default:
                return this.getSampleData();
        }
    }

    handleResize() {
        // Get container dimensions
        const width = this.container.clientWidth || 600;
        const height = this.container.clientHeight || 400;
        
        // Update SVG dimensions
        d3.select(this.container).select('svg')
            .attr('width', width)
            .attr('height', height);
        
        // Recreate chart with new dimensions
        this.createChart();
        
        // Update visualization with current instance
        const activeButton = document.querySelector('.instance-btn.active');
        if (activeButton) {
            const instanceId = activeButton.dataset.instance || '1';
            this.updateVisualization(instanceId);
        }
    }
}

window.LocalExplanationsVis = LocalExplanationsVis; 