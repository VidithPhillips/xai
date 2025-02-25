/**
 * Local Explanations Visualization
 * This file creates an interactive visualization of local explanations (LIME, SHAP, etc.)
 */

class LocalExplanationsVis {
    constructor(containerId) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.instance = 'instance1';
        this.method = 'lime';
        
        // Sample data for different instances and methods
        this.data = {
            instance1: {
                prediction: 'Approved',
                confidence: 0.82,
                features: {
                    lime: [
                        { feature: 'Credit Score', value: 720, contribution: 0.35, positive: true },
                        { feature: 'Income', value: '$75,000', contribution: 0.25, positive: true },
                        { feature: 'Debt-to-Income Ratio', value: '28%', contribution: 0.15, positive: true },
                        { feature: 'Employment History', value: '5 years', contribution: 0.10, positive: true },
                        { feature: 'Loan Amount', value: '$250,000', contribution: -0.05, positive: false },
                        { feature: 'Previous Defaults', value: 'None', contribution: 0.08, positive: true },
                        { feature: 'Loan Term', value: '30 years', contribution: -0.03, positive: false },
                        { feature: 'Age', value: 35, contribution: 0.02, positive: true }
                    ],
                    shap: [
                        { feature: 'Credit Score', value: 720, contribution: 0.38, positive: true },
                        { feature: 'Income', value: '$75,000', contribution: 0.22, positive: true },
                        { feature: 'Debt-to-Income Ratio', value: '28%', contribution: 0.12, positive: true },
                        { feature: 'Employment History', value: '5 years', contribution: 0.12, positive: true },
                        { feature: 'Previous Defaults', value: 'None', contribution: 0.10, positive: true },
                        { feature: 'Loan Amount', value: '$250,000', contribution: -0.08, positive: false },
                        { feature: 'Loan Term', value: '30 years', contribution: -0.02, positive: false },
                        { feature: 'Age', value: 35, contribution: 0.01, positive: true }
                    ],
                    anchors: [
                        { feature: 'Credit Score > 700', precision: 0.95 },
                        { feature: 'Income > $70,000', precision: 0.88 },
                        { feature: 'No Previous Defaults', precision: 0.82 }
                    ]
                }
            },
            instance2: {
                prediction: 'Denied',
                confidence: 0.75,
                features: {
                    lime: [
                        { feature: 'Credit Score', value: 580, contribution: -0.30, positive: false },
                        { feature: 'Income', value: '$45,000', contribution: -0.20, positive: false },
                        { feature: 'Debt-to-Income Ratio', value: '42%', contribution: -0.18, positive: false },
                        { feature: 'Employment History', value: '1 year', contribution: -0.12, positive: false },
                        { feature: 'Loan Amount', value: '$320,000', contribution: -0.10, positive: false },
                        { feature: 'Previous Defaults', value: '1', contribution: -0.15, positive: false },
                        { feature: 'Loan Term', value: '15 years', contribution: 0.05, positive: true },
                        { feature: 'Age', value: 27, contribution: 0.01, positive: true }
                    ],
                    shap: [
                        { feature: 'Credit Score', value: 580, contribution: -0.32, positive: false },
                        { feature: 'Income', value: '$45,000', contribution: -0.22, positive: false },
                        { feature: 'Debt-to-Income Ratio', value: '42%', contribution: -0.20, positive: false },
                        { feature: 'Previous Defaults', value: '1', contribution: -0.18, positive: false },
                        { feature: 'Employment History', value: '1 year', contribution: -0.10, positive: false },
                        { feature: 'Loan Amount', value: '$320,000', contribution: -0.08, positive: false },
                        { feature: 'Loan Term', value: '15 years', contribution: 0.08, positive: true },
                        { feature: 'Age', value: 27, contribution: 0.02, positive: true }
                    ],
                    anchors: [
                        { feature: 'Credit Score < 600', precision: 0.92 },
                        { feature: 'Previous Defaults > 0', precision: 0.85 },
                        { feature: 'Debt-to-Income Ratio > 40%', precision: 0.80 }
                    ]
                }
            },
            instance3: {
                prediction: 'Denied',
                confidence: 0.55,
                features: {
                    lime: [
                        { feature: 'Credit Score', value: 650, contribution: 0.10, positive: true },
                        { feature: 'Income', value: '$60,000', contribution: 0.08, positive: true },
                        { feature: 'Debt-to-Income Ratio', value: '38%', contribution: -0.15, positive: false },
                        { feature: 'Employment History', value: '2 years', contribution: 0.05, positive: true },
                        { feature: 'Loan Amount', value: '$280,000', contribution: -0.20, positive: false },
                        { feature: 'Previous Defaults', value: 'None', contribution: 0.12, positive: true },
                        { feature: 'Loan Term', value: '30 years', contribution: -0.05, positive: false },
                        { feature: 'Age', value: 32, contribution: 0.01, positive: true }
                    ],
                    shap: [
                        { feature: 'Loan Amount', value: '$280,000', contribution: -0.22, positive: false },
                        { feature: 'Debt-to-Income Ratio', value: '38%', contribution: -0.18, positive: false },
                        { feature: 'Credit Score', value: 650, contribution: 0.12, positive: true },
                        { feature: 'Previous Defaults', value: 'None', contribution: 0.15, positive: true },
                        { feature: 'Income', value: '$60,000', contribution: 0.10, positive: true },
                        { feature: 'Employment History', value: '2 years', contribution: 0.04, positive: true },
                        { feature: 'Loan Term', value: '30 years', contribution: -0.04, positive: false },
                        { feature: 'Age', value: 32, contribution: 0.01, positive: true }
                    ],
                    anchors: [
                        { feature: 'Loan Amount > $250,000', precision: 0.75 },
                        { feature: 'Debt-to-Income Ratio > 35%', precision: 0.70 }
                    ]
                }
            }
        };
        
        // Initialize the visualization
        this.init();
    }
    
    init() {
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
            .attr('transform', 'translate(80, 80)');
        
        // Create title
        this.title = this.svg.append('text')
            .attr('class', 'chart-title')
            .attr('x', '50%')
            .attr('y', 30)
            .attr('text-anchor', 'middle')
            .style('font-family', 'Poppins, sans-serif')
            .style('font-size', '18px')
            .style('font-weight', '600');
        
        // Create subtitle
        this.subtitle = this.svg.append('text')
            .attr('class', 'chart-subtitle')
            .attr('x', '50%')
            .attr('y', 55)
            .attr('text-anchor', 'middle')
            .style('font-family', 'Inter, sans-serif')
            .style('font-size', '14px')
            .style('fill', '#6b7280');
        
        // Draw initial chart
        this.updateChart();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.updateChart();
        });
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
        const margin = { top: 80, right: 30, bottom: 50, left: 150 };
        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;
        
        // Update chart position
        this.chart.attr('transform', `translate(${margin.left}, ${margin.top})`);
        
        // Get data for current instance and method
        const instanceData = this.data[this.instance];
        
        // Update title and subtitle
        this.title
            .attr('x', width / 2)
            .text(`Prediction: ${instanceData.prediction} (${(instanceData.confidence * 100).toFixed(0)}% confidence)`);
        
        this.subtitle
            .attr('x', width / 2)
            .text(`Explanation Method: ${this.method.toUpperCase()}`);
        
        // Clear existing chart
        this.chart.selectAll('*').remove();
        
        // Draw based on method
        if (this.method === 'anchors') {
            this.drawAnchors(instanceData.features.anchors, chartWidth, chartHeight);
        } else {
            this.drawFeatureContributions(instanceData.features[this.method], chartWidth, chartHeight);
        }
    }
    
    drawFeatureContributions(features, chartWidth, chartHeight) {
        // Sort features by absolute contribution
        const sortedFeatures = [...features].sort((a, b) => 
            Math.abs(b.contribution) - Math.abs(a.contribution)
        );
        
        // Create scales with proper domains
        const xScale = d3.scaleLinear()
            .domain([
                Math.min(0, d3.min(sortedFeatures, d => d.contribution) * 1.2), // Ensure 0 is included
                Math.max(0, d3.max(sortedFeatures, d => d.contribution) * 1.2)  // Ensure 0 is included
            ])
            .range([0, chartWidth]);
        
        const yScale = d3.scaleBand()
            .domain(sortedFeatures.map(d => d.feature))
            .range([0, chartHeight])
            .padding(0.3);
        
        // Create axes
        const xAxis = d3.axisBottom(xScale)
            .ticks(5)
            .tickFormat(d3.format('+.2f'));
        
        const yAxis = d3.axisLeft(yScale);
        
        // Add x-axis
        this.chart.append('g')
            .attr('transform', `translate(0, ${chartHeight})`)
            .call(xAxis)
            .selectAll('text')
            .style('font-family', 'Inter, sans-serif')
            .style('font-size', '12px');
        
        // Add y-axis
        this.chart.append('g')
            .call(yAxis)
            .selectAll('text')
            .style('font-family', 'Inter, sans-serif')
            .style('font-size', '12px');
        
        // Add zero line
        this.chart.append('line')
            .attr('x1', xScale(0))
            .attr('y1', 0)
            .attr('x2', xScale(0))
            .attr('y2', chartHeight)
            .style('stroke', '#d1d5db')
            .style('stroke-width', 1)
            .style('stroke-dasharray', '4');
        
        // Add bars
        this.chart.selectAll('.bar')
            .data(sortedFeatures)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('x', d => d.contribution < 0 ? xScale(d.contribution) : xScale(0))
            .attr('y', d => yScale(d.feature))
            .attr('width', d => {
                const width = Math.abs(xScale(d.contribution) - xScale(0));
                return Math.max(0, width); // Ensure width is never negative
            })
            .attr('height', yScale.bandwidth())
            .attr('fill', d => d.positive ? '#10b981' : '#ef4444')
            .attr('rx', 4)
            .attr('ry', 4)
            .attr('opacity', 0.8)
            .on('mouseover', function() {
                d3.select(this).attr('opacity', 1);
            })
            .on('mouseout', function() {
                d3.select(this).attr('opacity', 0.8);
            });
        
        // Add feature values
        this.chart.selectAll('.feature-value')
            .data(sortedFeatures)
            .enter()
            .append('text')
            .attr('class', 'feature-value')
            .attr('x', d => d.contribution < 0 ? xScale(0) - 5 : xScale(d.contribution) + 5)
            .attr('y', d => yScale(d.feature) + yScale.bandwidth() / 2)
            .attr('text-anchor', d => d.contribution < 0 ? 'end' : 'start')
            .attr('dy', '0.35em')
            .style('font-family', 'Inter, sans-serif')
            .style('font-size', '12px')
            .style('fill', '#6b7280')
            .text(d => `${d.value} (${d.contribution > 0 ? '+' : ''}${d.contribution.toFixed(2)})`);
    }
    
    drawAnchors(anchors, chartWidth, chartHeight) {
        // Create container for anchors
        const anchorsContainer = this.chart.append('g')
            .attr('class', 'anchors-container');
        
        // Add explanation text
        this.chart.append('text')
            .attr('x', chartWidth / 2)
            .attr('y', -30)
            .attr('text-anchor', 'middle')
            .style('font-family', 'Inter, sans-serif')
            .style('font-size', '14px')
            .text('Rules that explain the prediction:');
        
        // Create anchor rules
        const anchorGroups = anchorsContainer.selectAll('.anchor-rule')
            .data(anchors)
            .enter()
            .append('g')
            .attr('class', 'anchor-rule')
            .attr('transform', (d, i) => `translate(0, ${i * 60})`);
        
        // Add rule boxes
        anchorGroups.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', chartWidth)
            .attr('height', 50)
            .attr('rx', 8)
            .attr('ry', 8)
            .attr('fill', '#f3f4f6')
            .attr('stroke', '#d1d5db')
            .attr('stroke-width', 1);
        
        // Add rule text
        anchorGroups.append('text')
            .attr('x', 20)
            .attr('y', 20)
            .style('font-family', 'Inter, sans-serif')
            .style('font-size', '14px')
            .style('font-weight', '600')
            .text(d => `IF ${d.feature}`);
        
        // Add precision text
        anchorGroups.append('text')
            .attr('x', 20)
            .attr('y', 40)
            .style('font-family', 'Inter, sans-serif')
            .style('font-size', '12px')
            .style('fill', '#6b7280')
            .text(d => `Precision: ${(d.precision * 100).toFixed(0)}%`);
        
        // Add precision bar
        anchorGroups.append('rect')
            .attr('x', chartWidth - 120)
            .attr('y', 30)
            .attr('width', 100)
            .attr('height', 10)
            .attr('rx', 5)
            .attr('ry', 5)
            .attr('fill', '#e5e7eb');
        
        anchorGroups.append('rect')
            .attr('x', chartWidth - 120)
            .attr('y', 30)
            .attr('width', d => d.precision * 100)
            .attr('height', 10)
            .attr('rx', 5)
            .attr('ry', 5)
            .attr('fill', '#10b981');
    }
    
    setupEventListeners() {
        // Listen for instance changes
        const instanceSelector = document.getElementById('instance-selector');
        if (instanceSelector) {
            instanceSelector.addEventListener('change', () => {
                this.instance = instanceSelector.value;
                this.updateChart();
            });
        }
        
        // Listen for method changes
        document.addEventListener('methodChange', (event) => {
            if (['lime', 'shap', 'anchors'].includes(event.detail.method)) {
                this.method = event.detail.method;
                this.updateChart();
            }
        });
    }
    
    // Add a legend to explain the colors and elements
    addLegend() {
        const legendContainer = this.svg.append('g')
            .attr('class', 'legend')
            .attr('transform', `translate(${this.width - 150}, 20)`);
        
        // Add legend title
        legendContainer.append('text')
            .attr('x', 0)
            .attr('y', 0)
            .text('Legend')
            .style('font-weight', 'bold')
            .style('font-family', 'Inter, sans-serif');
        
        // Add positive contribution
        legendContainer.append('rect')
            .attr('x', 0)
            .attr('y', 10)
            .attr('width', 15)
            .attr('height', 15)
            .attr('fill', '#10b981');
        
        legendContainer.append('text')
            .attr('x', 20)
            .attr('y', 22)
            .text('Positive impact')
            .style('font-size', '12px')
            .style('font-family', 'Inter, sans-serif');
        
        // Add negative contribution
        legendContainer.append('rect')
            .attr('x', 0)
            .attr('y', 35)
            .attr('width', 15)
            .attr('height', 15)
            .attr('fill', '#ef4444');
        
        legendContainer.append('text')
            .attr('x', 20)
            .attr('y', 47)
            .text('Negative impact')
            .style('font-size', '12px')
            .style('font-family', 'Inter, sans-serif');
    }
} 