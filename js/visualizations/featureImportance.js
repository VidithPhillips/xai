/**
 * Feature Importance Visualization
 * This file creates an interactive visualization of feature importance
 */

class FeatureImportanceVis {
    constructor(containerId) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        
        if (!this.container) {
            console.error(`Container #${containerId} not found`);
            return;
        }
        
        // Initialize properties
        this.dataset = 'credit';
        this.method = 'shap';
        
        // Sample data for different datasets and methods
        this.data = {
            housing: {
                permutation: [
                    { feature: 'Square Footage', importance: 0.85 },
                    { feature: 'Location', importance: 0.72 },
                    { feature: 'Age of Building', importance: 0.45 },
                    { feature: 'Number of Bedrooms', importance: 0.38 },
                    { feature: 'Number of Bathrooms', importance: 0.35 },
                    { feature: 'School District', importance: 0.30 },
                    { feature: 'Crime Rate', importance: 0.25 },
                    { feature: 'Lot Size', importance: 0.20 }
                ],
                shap: [
                    { feature: 'Square Footage', importance: 0.80 },
                    { feature: 'Location', importance: 0.75 },
                    { feature: 'Number of Bedrooms', importance: 0.42 },
                    { feature: 'Age of Building', importance: 0.40 },
                    { feature: 'School District', importance: 0.35 },
                    { feature: 'Number of Bathrooms', importance: 0.32 },
                    { feature: 'Crime Rate', importance: 0.28 },
                    { feature: 'Lot Size', importance: 0.18 }
                ],
                tree: [
                    { feature: 'Location', importance: 0.78 },
                    { feature: 'Square Footage', importance: 0.76 },
                    { feature: 'Age of Building', importance: 0.42 },
                    { feature: 'Number of Bedrooms', importance: 0.40 },
                    { feature: 'School District', importance: 0.38 },
                    { feature: 'Number of Bathrooms', importance: 0.30 },
                    { feature: 'Lot Size', importance: 0.22 },
                    { feature: 'Crime Rate', importance: 0.20 }
                ]
            },
            credit: {
                permutation: [
                    { feature: 'Credit Score', importance: 0.90 },
                    { feature: 'Income', importance: 0.75 },
                    { feature: 'Debt-to-Income Ratio', importance: 0.65 },
                    { feature: 'Employment History', importance: 0.55 },
                    { feature: 'Loan Amount', importance: 0.40 },
                    { feature: 'Loan Term', importance: 0.30 },
                    { feature: 'Previous Defaults', importance: 0.25 },
                    { feature: 'Age', importance: 0.15 }
                ],
                shap: [
                    { feature: 'Credit Score', importance: 0.88 },
                    { feature: 'Income', importance: 0.78 },
                    { feature: 'Debt-to-Income Ratio', importance: 0.68 },
                    { feature: 'Employment History', importance: 0.50 },
                    { feature: 'Previous Defaults', importance: 0.35 },
                    { feature: 'Loan Amount', importance: 0.32 },
                    { feature: 'Loan Term', importance: 0.25 },
                    { feature: 'Age', importance: 0.12 }
                ],
                tree: [
                    { feature: 'Credit Score', importance: 0.92 },
                    { feature: 'Income', importance: 0.70 },
                    { feature: 'Debt-to-Income Ratio', importance: 0.62 },
                    { feature: 'Previous Defaults', importance: 0.45 },
                    { feature: 'Employment History', importance: 0.40 },
                    { feature: 'Loan Amount', importance: 0.35 },
                    { feature: 'Loan Term', importance: 0.28 },
                    { feature: 'Age', importance: 0.10 }
                ]
            },
            medical: {
                permutation: [
                    { feature: 'Blood Pressure', importance: 0.82 },
                    { feature: 'Age', importance: 0.78 },
                    { feature: 'BMI', importance: 0.65 },
                    { feature: 'Glucose Level', importance: 0.60 },
                    { feature: 'Smoking History', importance: 0.55 },
                    { feature: 'Family History', importance: 0.48 },
                    { feature: 'Cholesterol', importance: 0.42 },
                    { feature: 'Physical Activity', importance: 0.30 }
                ],
                shap: [
                    { feature: 'Age', importance: 0.80 },
                    { feature: 'Blood Pressure', importance: 0.78 },
                    { feature: 'Glucose Level', importance: 0.68 },
                    { feature: 'BMI', importance: 0.62 },
                    { feature: 'Smoking History', importance: 0.58 },
                    { feature: 'Family History', importance: 0.50 },
                    { feature: 'Cholesterol', importance: 0.45 },
                    { feature: 'Physical Activity', importance: 0.32 }
                ],
                tree: [
                    { feature: 'Blood Pressure', importance: 0.85 },
                    { feature: 'Age', importance: 0.82 },
                    { feature: 'Glucose Level', importance: 0.70 },
                    { feature: 'BMI', importance: 0.65 },
                    { feature: 'Family History', importance: 0.52 },
                    { feature: 'Smoking History', importance: 0.50 },
                    { feature: 'Cholesterol', importance: 0.40 },
                    { feature: 'Physical Activity', importance: 0.28 }
                ]
            }
        };
        
        // Create SVG
        this.createSvg();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Initial chart rendering
        this.updateChart();
        
        // Listen for section activation
        document.addEventListener('sectionActivated', (event) => {
            if (event.detail.sectionId === 'feature-importance') {
                console.log('Feature importance section activated, updating chart');
                this.updateChart();
            }
        });
    }
    
    createSvg() {
        // Create SVG container
        this.svg = d3.select(`#${this.containerId}`)
            .append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .style('background-color', '#ffffff')
            .style('border-radius', '0.5rem')
            .style('box-shadow', '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)');
        
        // Create chart group
        this.chart = this.svg.append('g')
            .attr('transform', 'translate(80, 30)');
        
        // Create axes groups
        this.xAxis = this.chart.append('g');
        this.yAxis = this.chart.append('g');
        
        // Create title
        this.title = this.svg.append('text')
            .attr('class', 'chart-title')
            .attr('x', '50%')
            .attr('y', 20)
            .attr('text-anchor', 'middle')
            .style('font-family', 'Poppins, sans-serif')
            .style('font-size', '16px')
            .style('font-weight', '600');
    }
    
    updateChart() {
        // Get current dimensions
        const containerRect = this.container.getBoundingClientRect();
        const width = containerRect.width;
        const height = containerRect.height;
        
        // Update SVG dimensions
        this.svg
            .attr('width', width)
            .attr('height', height);
        
        // Calculate chart dimensions
        const margin = { top: 50, right: 30, bottom: 50, left: 150 };
        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;
        
        // Update chart position
        this.chart.attr('transform', `translate(${margin.left}, ${margin.top})`);
        
        // Get data for current dataset and method
        const data = this.data[this.dataset][this.method];
        
        // Sort data by importance
        const sortedData = [...data].sort((a, b) => b.importance - a.importance);
        
        // Create scales
        const xScale = d3.scaleLinear()
            .domain([0, 1])
            .range([0, chartWidth]);
        
        const yScale = d3.scaleBand()
            .domain(sortedData.map(d => d.feature))
            .range([0, chartHeight])
            .padding(0.2);
        
        // Create color scale
        const colorScale = d3.scaleLinear()
            .domain([0, 1])
            .range(['#818cf8', '#4f46e5']);
        
        // Update axes
        this.xAxis
            .attr('transform', `translate(0, ${chartHeight})`)
            .call(d3.axisBottom(xScale).ticks(5).tickFormat(d3.format('.1f')))
            .selectAll('text')
            .style('font-family', 'Inter, sans-serif')
            .style('font-size', '12px');
        
        this.yAxis
            .call(d3.axisLeft(yScale))
            .selectAll('text')
            .style('font-family', 'Inter, sans-serif')
            .style('font-size', '12px');
        
        // Update title
        this.title
            .attr('x', width / 2)
            .text(`Feature Importance: ${this.dataset.charAt(0).toUpperCase() + this.dataset.slice(1)} Dataset (${this.method.charAt(0).toUpperCase() + this.method.slice(1)} Method)`);
        
        // Draw bars
        const bars = this.chart.selectAll('.bar')
            .data(sortedData);
        
        // Remove old bars
        bars.exit().remove();
        
        // Update existing bars
        bars
            .attr('x', 0)
            .attr('y', d => yScale(d.feature))
            .attr('width', d => Math.max(0, xScale(d.importance)))
            .attr('height', yScale.bandwidth())
            .attr('fill', d => colorScale(d.importance))
            .attr('rx', 4)
            .attr('ry', 4);
        
        // Add value labels
        const labels = this.chart.selectAll('.value-label')
            .data(sortedData);
        
        // Remove old labels
        labels.exit().remove();
        
        // Update existing labels
        labels
            .attr('x', d => xScale(d.importance) + 5)
            .attr('y', d => yScale(d.feature) + yScale.bandwidth() / 2)
            .text(d => d.importance.toFixed(2));
        
        // Add new labels
        labels.enter()
            .append('text')
            .attr('class', 'value-label')
            .attr('x', d => xScale(d.importance) + 5)
            .attr('y', d => yScale(d.feature) + yScale.bandwidth() / 2)
            .attr('dy', '0.35em')
            .style('font-family', 'Inter, sans-serif')
            .style('font-size', '12px')
            .style('fill', '#6b7280')
            .text(d => d.importance.toFixed(2))
            .style('opacity', 0)
            .transition()
            .duration(800)
            .style('opacity', 1);
    }
    
    setupEventListeners() {
        // Listen for dataset changes
        document.addEventListener('datasetChange', (event) => {
            this.dataset = event.detail.dataset;
            this.updateChart();
        });
        
        // Listen for method changes
        document.addEventListener('methodChange', (event) => {
            this.method = event.detail.method;
            this.updateChart();
        });
    }
    
    addExplanations() {
        // Create an explanation container
        const explanationContainer = d3.select(`#${this.containerId}`)
            .append('div')
            .attr('class', 'visualization-explanation')
            .style('position', 'absolute')
            .style('bottom', '10px')
            .style('left', '10px')
            .style('background', 'rgba(255, 255, 255, 0.9)')
            .style('padding', '10px')
            .style('border-radius', '5px')
            .style('max-width', '300px')
            .style('font-size', '14px')
            .style('box-shadow', '0 2px 4px rgba(0,0,0,0.1)');
        
        // Add explanation text
        explanationContainer.append('p')
            .html(`<strong>How to read this chart:</strong> Longer bars indicate features that have a stronger influence on the model's predictions. The ${this.method.toUpperCase()} method quantifies each feature's importance from 0 to 1.`);
        
        // Add a close button
        explanationContainer.append('button')
            .attr('class', 'close-explanation')
            .style('position', 'absolute')
            .style('top', '5px')
            .style('right', '5px')
            .style('background', 'none')
            .style('border', 'none')
            .style('cursor', 'pointer')
            .text('×')
            .on('click', function() {
                explanationContainer.style('display', 'none');
            });
    }
} 