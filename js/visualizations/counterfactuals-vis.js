class CounterfactualsVis {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`Container #${containerId} not found`);
            return;
        }
        
        console.log(`Creating CounterfactualsVis in container:`, containerId);
        console.log(`Container dimensions:`, this.container.clientWidth, 'x', this.container.clientHeight);
        
        // Create chart
        this.createChart();
        
        // Add event listeners for scenario buttons
        this.setupScenarioButtons();
        
        // Add resize handler
        this.resizeHandler = this.handleResize.bind(this);
        window.addEventListener('resize', this.resizeHandler);
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
    
    setupScenarioButtons() {
        // Find scenario buttons within the same section as the container
        const section = this.container.closest('section');
        const scenarioButtons = section ? section.querySelectorAll('.scenario-btn') : [];
        
        if (scenarioButtons.length === 0) {
            console.warn('No scenario buttons found for counterfactuals visualization');
            return;
        }
        
        scenarioButtons.forEach(button => {
            button.addEventListener('click', () => {
                const scenarioId = button.dataset.scenario;
                this.updateVisualization(scenarioId);
            });
        });
    }
    
    updateVisualization(scenarioId) {
        // Generate data for the selected scenario
        const data = this.getScenarioData(scenarioId);
        
        // Update scales
        const allValues = data.flatMap(d => [d.value, d.counterfactual]);
        const minValue = d3.min(allValues) * 0.8;
        const maxValue = d3.max(allValues) * 1.2;
        
        const xScale = d3.scaleLinear()
            .domain([minValue, maxValue])
            .range([0, this.innerWidth]);
        
        const yScale = d3.scaleBand()
            .domain(data.map(d => d.name))
            .range([0, this.innerHeight])
            .padding(0.2);
        
        // Update bars with transition
        const svg = this.svg;
        
        // Remove existing bars and labels
        svg.selectAll('.original-bar, .counterfactual-bar, .value-label').remove();
        
        // Add original value bars with transition
        svg.selectAll('.original-bar')
            .data(data)
            .enter()
            .append('rect')
            .attr('class', 'original-bar')
            .attr('x', 0)
            .attr('y', d => yScale(d.name))
            .attr('height', yScale.bandwidth() / 2)
            .attr('width', 0) // Start with zero width
            .attr('fill', '#3b82f6')
            .attr('opacity', 0.7)
            .transition()
            .duration(500)
            .attr('width', d => xScale(d.value));
        
        // Add counterfactual value bars with transition
        svg.selectAll('.counterfactual-bar')
            .data(data)
            .enter()
            .append('rect')
            .attr('class', 'counterfactual-bar')
            .attr('x', 0)
            .attr('y', d => yScale(d.name) + yScale.bandwidth() / 2)
            .attr('height', yScale.bandwidth() / 2)
            .attr('width', 0) // Start with zero width
            .attr('fill', '#f97316')
            .attr('opacity', 0.7)
            .transition()
            .duration(500)
            .attr('width', d => xScale(d.counterfactual));
        
        // Add value labels (after transition)
        setTimeout(() => {
            // Add original value labels
            svg.selectAll('.original-value')
                .data(data)
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
            
            // Add counterfactual value labels
            svg.selectAll('.counterfactual-value')
                .data(data)
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
        }, 500);
        
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
    
    getScenarioData(scenarioId) {
        // Generate different data based on scenario ID
        switch (scenarioId) {
            case '1':
                return [
                    { name: 'Income', value: 45000, counterfactual: 52000 },
                    { name: 'Credit Score', value: 680, counterfactual: 720 },
                    { name: 'Debt Ratio', value: 0.42, counterfactual: 0.35 },
                    { name: 'Loan Amount', value: 15000, counterfactual: 15000 },
                    { name: 'Employment Years', value: 3, counterfactual: 3 },
                    { name: 'Previous Defaults', value: 1, counterfactual: 0 }
                ];
            case '2':
                return [
                    { name: 'Income', value: 38000, counterfactual: 38000 },
                    { name: 'Credit Score', value: 620, counterfactual: 680 },
                    { name: 'Debt Ratio', value: 0.55, counterfactual: 0.40 },
                    { name: 'Loan Amount', value: 25000, counterfactual: 18000 },
                    { name: 'Employment Years', value: 1, counterfactual: 2 },
                    { name: 'Previous Defaults', value: 2, counterfactual: 0 }
                ];
            case '3':
                return [
                    { name: 'Income', value: 65000, counterfactual: 65000 },
                    { name: 'Credit Score', value: 710, counterfactual: 710 },
                    { name: 'Debt Ratio', value: 0.38, counterfactual: 0.38 },
                    { name: 'Loan Amount', value: 35000, counterfactual: 25000 },
                    { name: 'Employment Years', value: 5, counterfactual: 5 },
                    { name: 'Previous Defaults', value: 0, counterfactual: 0 }
                ];
            default:
                return [
                    { name: 'Income', value: 45000, counterfactual: 52000 },
                    { name: 'Credit Score', value: 680, counterfactual: 720 },
                    { name: 'Debt Ratio', value: 0.42, counterfactual: 0.35 },
                    { name: 'Loan Amount', value: 15000, counterfactual: 15000 },
                    { name: 'Employment Years', value: 3, counterfactual: 3 },
                    { name: 'Previous Defaults', value: 1, counterfactual: 0 }
                ];
        }
    }
    
    createChart() {
        const width = this.container.clientWidth || 800;
        const height = this.container.clientHeight || 400;
        const margin = { top: 40, right: 30, bottom: 40, left: 150 };
        this.innerWidth = width - margin.left - margin.right;
        this.innerHeight = height - margin.top - margin.bottom;
        
        // Create SVG
        this.svg = d3.select(this.container)
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);
        
        // Add title
        this.svg.append('text')
            .attr('x', this.innerWidth / 2)
            .attr('y', -20)
            .attr('text-anchor', 'middle')
            .attr('fill', '#ffffff')
            .attr('font-size', '18px')
            .text('Counterfactual Explanation');
        
        // Create sample data
        const originalFeatures = this.getScenarioData('1');
        
        // Create scales
        const yScale = d3.scaleBand()
            .domain(originalFeatures.map(d => d.name))
            .range([0, this.innerHeight])
            .padding(0.2);
        
        // Find min and max for x scale
        const allValues = originalFeatures.flatMap(d => [d.value, d.counterfactual]);
        const minValue = d3.min(allValues) * 0.8;
        const maxValue = d3.max(allValues) * 1.2;
        
        const xScale = d3.scaleLinear()
            .domain([minValue, maxValue])
            .range([0, this.innerWidth]);
        
        // Add y-axis
        this.svg.append('g')
            .attr('class', 'y-axis')
            .call(d3.axisLeft(yScale))
            .selectAll('text')
            .style('fill', '#ffffff');
        
        // Add x-axis
        this.svg.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0, ${this.innerHeight})`)
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
            .attr('transform', `translate(${this.innerWidth - 150}, -30)`);
        
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
    
    handleResize() {
        // Get container dimensions
        const width = this.container.clientWidth || 800;
        const height = this.container.clientHeight || 400;
        
        // Update SVG dimensions
        d3.select(this.container).select('svg')
            .attr('width', width)
            .attr('height', height);
        
        // Recreate chart with new dimensions
        this.createChart();
        
        // Update visualization with current scenario
        const activeButton = document.querySelector('.scenario-btn.active');
        if (activeButton) {
            const scenarioId = activeButton.dataset.scenario || '1';
            this.updateVisualization(scenarioId);
        }
    }
}

window.CounterfactualsVis = CounterfactualsVis; 