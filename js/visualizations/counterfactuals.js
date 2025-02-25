/**
 * Counterfactual Explanations Visualization
 * This file creates an interactive visualization of counterfactual explanations
 */

class CounterfactualsVis {
    constructor(containerId) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.scenario = 'loan';
        
        // Sample data for different scenarios
        this.data = {
            loan: {
                original: {
                    prediction: 'Denied',
                    confidence: 0.78,
                    features: [
                        { id: 'credit', name: 'Credit Score', value: 620, min: 300, max: 850, step: 10, threshold: 680 },
                        { id: 'income', name: 'Annual Income', value: 52000, min: 20000, max: 200000, step: 1000, threshold: 65000 },
                        { id: 'dti', name: 'Debt-to-Income Ratio', value: 42, min: 0, max: 60, step: 1, threshold: 36 },
                        { id: 'employment', name: 'Years Employed', value: 1.5, min: 0, max: 30, step: 0.5, threshold: 2 }
                    ]
                },
                counterfactual: {
                    prediction: 'Approved',
                    confidence: 0.65,
                    changes: [
                        { id: 'credit', value: 680, importance: 0.4 },
                        { id: 'dti', value: 36, importance: 0.35 },
                        { id: 'income', value: 65000, importance: 0.25 }
                    ]
                }
            },
            medical: {
                original: {
                    prediction: 'High Risk',
                    confidence: 0.82,
                    features: [
                        { id: 'bp', name: 'Blood Pressure', value: 150, min: 80, max: 200, step: 1, threshold: 130 },
                        { id: 'glucose', name: 'Glucose Level', value: 180, min: 70, max: 300, step: 1, threshold: 140 },
                        { id: 'bmi', name: 'BMI', value: 32, min: 15, max: 45, step: 0.5, threshold: 25 },
                        { id: 'activity', name: 'Physical Activity (hrs/week)', value: 1, min: 0, max: 20, step: 0.5, threshold: 3.5 }
                    ]
                },
                counterfactual: {
                    prediction: 'Low Risk',
                    confidence: 0.70,
                    changes: [
                        { id: 'bp', value: 130, importance: 0.45 },
                        { id: 'glucose', value: 140, importance: 0.35 },
                        { id: 'bmi', value: 28, importance: 0.20 }
                    ]
                }
            },
            housing: {
                original: {
                    prediction: 'Above Budget',
                    confidence: 0.75,
                    features: [
                        { id: 'sqft', name: 'Square Footage', value: 2200, min: 500, max: 5000, step: 50, threshold: 1800 },
                        { id: 'location', name: 'Location Score', value: 8.5, min: 1, max: 10, step: 0.1, threshold: 7 },
                        { id: 'age', name: 'Building Age (years)', value: 5, min: 0, max: 100, step: 1, threshold: 15 },
                        { id: 'bedrooms', name: 'Bedrooms', value: 4, min: 1, max: 6, step: 1, threshold: 3 }
                    ]
                },
                counterfactual: {
                    prediction: 'Within Budget',
                    confidence: 0.68,
                    changes: [
                        { id: 'sqft', value: 1800, importance: 0.5 },
                        { id: 'bedrooms', value: 3, importance: 0.3 },
                        { id: 'location', value: 7.5, importance: 0.2 }
                    ]
                }
            }
        };
        
        // Current feature values (will be updated by sliders)
        this.currentFeatures = {};
        
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
            .attr('transform', 'translate(50, 50)');
        
        // Create title
        this.title = this.svg.append('text')
            .attr('class', 'chart-title')
            .attr('x', '50%')
            .attr('y', 30)
            .attr('text-anchor', 'middle')
            .style('font-family', 'Poppins, sans-serif')
            .style('font-size', '18px')
            .style('font-weight', '600');
        
        // Initialize current features
        this.initCurrentFeatures();
        
        // Create feature sliders
        this.createFeatureSliders();
        
        // Draw initial chart
        this.updateChart();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.updateChart();
        });
    }
    
    initCurrentFeatures() {
        // Initialize current features with original values
        const features = this.data[this.scenario].original.features;
        features.forEach(feature => {
            this.currentFeatures[feature.id] = feature.value;
        });
    }
    
    createFeatureSliders() {
        // Get features for current scenario
        const features = this.data[this.scenario].original.features;
        
        // Format features for slider creation
        const sliderFeatures = features.map(feature => ({
            id: feature.id,
            name: feature.name,
            value: feature.value,
            min: feature.min,
            max: feature.max,
            step: feature.step
        }));
        
        // Create sliders
        UIControls.createFeatureSliders(sliderFeatures, 'counterfactual-sliders');
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
        const margin = { top: 50, right: 30, bottom: 30, left: 50 };
        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;
        
        // Update chart position
        this.chart.attr('transform', `translate(${margin.left}, ${margin.top})`);
        
        // Get data for current scenario
        const scenarioData = this.data[this.scenario];
        const originalFeatures = scenarioData.original.features;
        const counterfactualChanges = scenarioData.counterfactual.changes;
        
        // Update title
        this.title
            .attr('x', width / 2)
            .text(`Counterfactual Explanation: ${this.scenario.charAt(0).toUpperCase() + this.scenario.slice(1)} Scenario`);
        
        // Clear existing chart
        this.chart.selectAll('*').remove();
        
        // Draw the visualization
        this.drawCounterfactualVis(originalFeatures, counterfactualChanges, chartWidth, chartHeight);
    }
    
    drawCounterfactualVis(features, changes, chartWidth, chartHeight) {
        // Create scales
        const xScale = d3.scaleLinear()
            .domain([0, features.length - 1])
            .range([0, chartWidth]);
        
        // Create prediction indicators
        this.drawPredictionIndicators(features, changes, chartWidth);
        
        // Draw feature paths
        this.drawFeaturePaths(features, changes, xScale, chartHeight);
        
        // Draw current state
        this.drawCurrentState(features, xScale, chartHeight);
    }
    
    drawPredictionIndicators(features, changes, chartWidth) {
        const scenarioData = this.data[this.scenario];
        
        // Create container for prediction indicators
        const predictionsContainer = this.chart.append('g')
            .attr('transform', `translate(0, 20)`);
        
        // Original prediction
        predictionsContainer.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', chartWidth * 0.45)
            .attr('height', 60)
            .attr('rx', 8)
            .attr('fill', '#fee2e2')
            .attr('stroke', '#ef4444')
            .attr('stroke-width', 1);
        
        predictionsContainer.append('text')
            .attr('x', chartWidth * 0.225)
            .attr('y', 25)
            .attr('text-anchor', 'middle')
            .style('font-family', 'Poppins, sans-serif')
            .style('font-size', '16px')
            .style('font-weight', '600')
            .style('fill', '#b91c1c')
            .text(scenarioData.original.prediction);
        
        predictionsContainer.append('text')
            .attr('x', chartWidth * 0.225)
            .attr('y', 45)
            .attr('text-anchor', 'middle')
            .style('font-family', 'Inter, sans-serif')
            .style('font-size', '12px')
            .style('fill', '#b91c1c')
            .text(`Confidence: ${(scenarioData.original.confidence * 100).toFixed(0)}%`);
        
        // Arrow
        predictionsContainer.append('path')
            .attr('d', `M${chartWidth * 0.45 + 10},30 L${chartWidth * 0.55 - 10},30 M${chartWidth * 0.55 - 15},25 L${chartWidth * 0.55 - 10},30 L${chartWidth * 0.55 - 15},35`)
            .attr('stroke', '#6b7280')
            .attr('stroke-width', 2)
            .attr('fill', 'none');
        
        // Counterfactual prediction
        predictionsContainer.append('rect')
            .attr('x', chartWidth * 0.55)
            .attr('y', 0)
            .attr('width', chartWidth * 0.45)
            .attr('height', 60)
            .attr('rx', 8)
            .attr('fill', '#dcfce7')
            .attr('stroke', '#10b981')
            .attr('stroke-width', 1);
        
        predictionsContainer.append('text')
            .attr('x', chartWidth * 0.775)
            .attr('y', 25)
            .attr('text-anchor', 'middle')
            .style('font-family', 'Poppins, sans-serif')
            .style('font-size', '16px')
            .style('font-weight', '600')
            .style('fill', '#047857')
            .text(scenarioData.counterfactual.prediction);
        
        predictionsContainer.append('text')
            .attr('x', chartWidth * 0.775)
            .attr('y', 45)
            .attr('text-anchor', 'middle')
            .style('font-family', 'Inter, sans-serif')
            .style('font-size', '12px')
            .style('fill', '#047857')
            .text(`Confidence: ${(scenarioData.counterfactual.confidence * 100).toFixed(0)}%`);
    }
    
    drawFeaturePaths(features, changes, xScale, chartHeight) {
        // Create container for feature paths
        const pathsContainer = this.chart.append('g')
            .attr('transform', `translate(0, 120)`);
        
        // Calculate vertical spacing
        const featureHeight = 60;
        const totalHeight = features.length * featureHeight;
        
        // Create scales for feature values
        const featureScales = {};
        features.forEach(feature => {
            featureScales[feature.id] = d3.scaleLinear()
                .domain([feature.min, feature.max])
                .range([totalHeight - 20, 20]);
        });
        
        // Draw feature axes
        features.forEach((feature, i) => {
            const x = xScale(i);
            
            // Draw axis line
            pathsContainer.append('line')
                .attr('x1', x)
                .attr('y1', 20)
                .attr('x2', x)
                .attr('y2', totalHeight - 20)
                .attr('stroke', '#d1d5db')
                .attr('stroke-width', 1);
            
            // Draw feature name
            pathsContainer.append('text')
                .attr('x', x)
                .attr('y', 0)
                .attr('text-anchor', 'middle')
                .style('font-family', 'Inter, sans-serif')
                .style('font-size', '12px')
                .style('font-weight', '600')
                .text(feature.name);
            
            // Draw threshold marker
            if (feature.threshold) {
                const y = featureScales[feature.id](feature.threshold);
                
                pathsContainer.append('line')
                    .attr('x1', x - 10)
                    .attr('y1', y)
                    .attr('x2', x + 10)
                    .attr('y2', y)
                    .attr('stroke', '#6366f1')
                    .attr('stroke-width', 2)
                    .attr('stroke-dasharray', '2');
                
                pathsContainer.append('text')
                    .attr('x', x)
                    .attr('y', y - 10)
                    .attr('text-anchor', 'middle')
                    .style('font-family', 'Inter, sans-serif')
                    .style('font-size', '10px')
                    .style('fill', '#6366f1')
                    .text('Threshold');
            }
        });
        
        // Draw connections between original and counterfactual values
        const changedFeatures = changes.map(c => c.id);
        
        // For each feature that has a counterfactual change
        changedFeatures.forEach(featureId => {
            // Find the feature and its index
            const featureIndex = features.findIndex(f => f.id === featureId);
            const feature = features[featureIndex];
            
            // Find the change
            const change = changes.find(c => c.id === featureId);
            
            // Calculate positions
            const x1 = xScale(featureIndex);
            const y1 = featureScales[featureId](feature.value);
            const y2 = featureScales[featureId](change.value);
            
            // Draw connection line
            pathsContainer.append('path')
                .attr('d', `M${x1},${y1} C${x1 + 50},${y1} ${x1 + 50},${y2} ${x1},${y2}`)
                .attr('stroke', '#6366f1')
                .attr('stroke-width', 2)
                .attr('fill', 'none')
                .attr('stroke-dasharray', '4');
            
            // Draw original value marker
            pathsContainer.append('circle')
                .attr('cx', x1)
                .attr('cy', y1)
                .attr('r', 6)
                .attr('fill', '#ef4444');
            
            // Draw counterfactual value marker
            pathsContainer.append('circle')
                .attr('cx', x1)
                .attr('cy', y2)
                .attr('r', 6)
                .attr('fill', '#10b981');
            
            // Add value labels
            pathsContainer.append('text')
                .attr('x', x1 - 15)
                .attr('y', y1)
                .attr('text-anchor', 'end')
                .attr('dy', '0.35em')
                .style('font-family', 'Inter, sans-serif')
                .style('font-size', '12px')
                .style('fill', '#ef4444')
                .text(feature.value);
            
            pathsContainer.append('text')
                .attr('x', x1 - 15)
                .attr('y', y2)
                .attr('text-anchor', 'end')
                .attr('dy', '0.35em')
                .style('font-family', 'Inter, sans-serif')
                .style('font-size', '12px')
                .style('fill', '#10b981')
                .text(change.value);
        });
    }
    
    drawCurrentState(features, xScale, chartHeight) {
        // Create container for current state
        const currentStateContainer = this.chart.append('g')
            .attr('transform', `translate(0, 120)`);
        
        // Calculate vertical spacing
        const featureHeight = 60;
        const totalHeight = features.length * featureHeight;
        
        // Create scales for feature values
        const featureScales = {};
        features.forEach(feature => {
            featureScales[feature.id] = d3.scaleLinear()
                .domain([feature.min, feature.max])
                .range([totalHeight - 20, 20]);
        });
        
        // Draw current state markers
        features.forEach((feature, i) => {
            const x = xScale(i);
            const y = featureScales[feature.id](this.currentFeatures[feature.id]);
            
            // Draw current value marker
            currentStateContainer.append('circle')
                .attr('cx', x)
                .attr('cy', y)
                .attr('r', 8)
                .attr('fill', '#f59e0b')
                .attr('stroke', '#ffffff')
                .attr('stroke-width', 2);
        });
    }
    
    setupEventListeners() {
        // Listen for scenario changes
        const scenarioSelector = document.getElementById('scenario-selector');
        if (scenarioSelector) {
            scenarioSelector.addEventListener('change', () => {
                this.scenario = scenarioSelector.value;
                this.initCurrentFeatures();
                this.createFeatureSliders();
                this.updateChart();
            });
        }
        
        // Listen for feature changes from sliders
        document.addEventListener('featureChange', (event) => {
            const { id, value } = event.detail;
            this.currentFeatures[id] = value;
            this.updateChart();
        });
    }
    
    drawChangeBars(changes) {
        // ... existing code ...
        
        // Update the bar width calculation
        changeBars.append('rect')
            .attr('x', 0)
            .attr('y', d => yScale(d.id))
            .attr('width', d => Math.max(0, xScale(d.importance)))
            .attr('height', yScale.bandwidth())
            .attr('fill', '#10b981')
            .attr('rx', 4)
            .attr('ry', 4);
        
        // ... rest of the method ...
    }
} 