// Define colors if not defined elsewhere
const positiveColor = "#10b981"; // Green
const negativeColor = "#ef4444"; // Red

class FeatureImportanceVis {
    constructor(containerId) {
        if (!containerId) {
            console.error('No container ID provided');
            return;
        }
        
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
    
    createChart() {
        // Create SVG container
        const margin = { top: 40, right: 40, bottom: 40, left: 150 };
        const width = this.width - margin.left - margin.right;
        const height = this.height - margin.top - margin.bottom;
        
        // Create scales
        this.xScale = d3.scaleLinear()
            .domain([-1, 1])
            .range([0, width]);
            
        this.yScale = d3.scaleBand()
            .range([0, height])
            .padding(0.2);
        
        // Create SVG
        this.svg = d3.select(this.container)
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);
        
        // Add axes
        this.svg.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(this.xScale));
            
        this.svg.append('g')
            .attr('class', 'y-axis');
        
        // Add title
        this.svg.append('text')
            .attr('class', 'chart-title')
            .attr('x', width / 2)
            .attr('y', -15)
            .attr('text-anchor', 'middle')
            .text('Feature Importance');
        
        // Generate initial data
        const data = this.generateData('permutation');
        this.updateVisualization('permutation', data);
    }
    
    generateData(method) {
        // Generate different data based on method
        switch (method) {
            case 'shap':
                return [
                    { feature: 'Income', importance: 0.75 },
                    { feature: 'Credit Score', importance: 0.65 },
                    { feature: 'Employment Years', importance: 0.45 },
                    { feature: 'Loan Amount', importance: -0.35 },
                    { feature: 'Debt Ratio', importance: -0.55 },
                    { feature: 'Previous Defaults', importance: -0.85 }
                ];
            case 'lime':
                return [
                    { feature: 'Credit Score', importance: 0.82 },
                    { feature: 'Previous Defaults', importance: -0.78 },
                    { feature: 'Income', importance: 0.65 },
                    { feature: 'Debt Ratio', importance: -0.48 },
                    { feature: 'Employment Years', importance: 0.38 },
                    { feature: 'Loan Amount', importance: -0.25 }
                ];
            case 'permutation':
            default:
                return [
                    { feature: 'Previous Defaults', importance: -0.92 },
                    { feature: 'Credit Score', importance: 0.85 },
                    { feature: 'Income', importance: 0.72 },
                    { feature: 'Debt Ratio', importance: -0.68 },
                    { feature: 'Employment Years', importance: 0.45 },
                    { feature: 'Loan Amount', importance: -0.32 }
                ];
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
            .attr('class', d => d.importance < 0 ? 'bar negative-bar' : 'bar positive-bar')
            .attr('x', d => d.importance < 0 ? xScale(d.importance) : xScale(0))
            .attr('y', d => yScale(d.feature))
            .attr('height', yScale.bandwidth())
            .attr('width', d => Math.abs(xScale(d.importance) - xScale(0)))
            .attr('fill', d => d.importance < 0 ? negativeColor : positiveColor);
        
        // Update axes
        svg.select('.x-axis')
            .transition()
            .duration(500)
            .call(d3.axisBottom(xScale));
            
        svg.select('.y-axis')
            .transition()
            .duration(500)
            .call(d3.axisLeft(yScale));
        
        // Update title
        svg.select('.chart-title')
            .text(`Feature Importance (${method.charAt(0).toUpperCase() + method.slice(1)})`);
    }
    
    handleResize() {
        // Get new dimensions
        const width = this.container.clientWidth || 800;
        const height = this.container.clientHeight || 400;
        
        // Only update if dimensions have changed
        if (width !== this.width || height !== this.height) {
            this.width = width;
            this.height = height;
            
            // Remove old chart
            d3.select(this.container).select('svg').remove();
            
            // Create new chart
            this.createChart();
            
            // Get current method
            const activeButton = document.querySelector('.method-btn.active');
            const method = activeButton ? activeButton.dataset.method : 'permutation';
            
            // Update visualization
            this.updateVisualization(method);
        }
    }
    
    dispose() {
        try {
            // Remove event listeners
            window.removeEventListener('resize', this.resizeHandler);
            
            // Clean up D3 elements
            if (this.svg) {
                // Remove all event listeners from SVG elements
                this.svg.selectAll('*').on('*', null);
            }
            
            // Remove SVG
            d3.select(this.container).select('svg').remove();
            
            // Clear container safely
            if (this.container) {
                // Store reference to container before clearing
                const container = this.container;
                
                // Clear all child nodes
                while (container.firstChild) {
                    container.removeChild(container.firstChild);
                }
                
                // Clear reference
                this.container = null;
            }
        } catch (error) {
            console.warn('Error during disposal:', error);
        }
    }
    
    resize() {
        if (!this.container) return;
        
        // Get new dimensions
        const width = this.container.clientWidth || 800;
        const height = this.container.clientHeight || 400;
        
        console.log(`Resizing FeatureImportanceVis to ${width}x${height}`);
        
        // Update dimensions
        this.width = width;
        this.height = height;
        
        // Update SVG dimensions
        if (this.svg) {
            this.svg
                .attr('width', width)
                .attr('height', height);
                
            // Update visualization elements
            this.updateVisualization();
        }
    }
    
    updateVisualization() {
        // Get current method
        const method = this.currentMethod || 'permutation';
        
        // Clear existing visualization
        if (this.svg) {
            this.svg.selectAll('*').remove();
        }
        
        // Re-render with current data and dimensions
        this.renderFeatureImportance(method);
    }
}

// Export with the correct name
window.FeatureImportanceVis = FeatureImportanceVis; 