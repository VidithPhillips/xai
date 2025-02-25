/**
 * Main JavaScript file
 * This file initializes all visualizations and UI components
 */

// Global visualization instances
window.neuralNetworkVis = null;
window.featureImportanceVis = null;
window.localExplanationsVis = null;
window.counterfactualsVis = null;
window.particleBackgrounds = {};

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Content Loaded");
    
    try {
        // Initialize UI controls
        UIControls.initNavigation();
        UIControls.initModals();
        UIControls.initButtons();
        
        // Initialize particle backgrounds for each section
        initParticleBackgrounds();
        
        // Initialize visualizations with error handling
        initVisualizations();
        
        // Trigger visualization for the initially active section
        const activeSection = document.querySelector('section.active');
        if (activeSection) {
            UIControls.triggerVisualizationForSection(activeSection.id);
        }
        
        // Set up guided tours
        setupGuidedTours();
    } catch (error) {
        console.error("Error initializing application:", error);
        showErrorMessage("There was an error initializing the application. Please check the console for details.");
    }
});

// Initialize particle backgrounds for each section
function initParticleBackgrounds() {
    // Disable particle backgrounds completely
    return; // Early return to skip particle background initialization
    
    // The code below won't execute
    const sections = [
        { id: 'intro', color: '#6366f1', count: 15 },
        { id: 'neural-networks', color: '#10b981', count: 12 },
        { id: 'feature-importance', color: '#f59e0b', count: 10 },
        { id: 'local-explanations', color: '#8b5cf6', count: 12 },
        { id: 'counterfactuals', color: '#ef4444', count: 10 }
    ];
    
    sections.forEach(section => {
        try {
            window.particleBackgrounds[section.id] = new ParticleBackground(section.id, {
                particleColor: section.color,
                particleCount: section.count,
                lineColor: `${section.color}15`
            });
        } catch (error) {
            console.error(`Error initializing particle background for ${section.id}:`, error);
        }
    });
}

// Initialize all visualizations with error handling
function initVisualizations() {
    try {
        // Initialize intro visualization
        initVisualizationWithContainer('intro-visualization', initIntroVisualization);
        
        // Initialize neural network visualization
        initVisualizationWithContainer('neural-network-visualization', () => {
            window.neuralNetworkVis = new NeuralNetworkVis('neural-network-visualization');
        });
        
        // Initialize feature importance visualization
        initVisualizationWithContainer('feature-importance-visualization', () => {
            window.featureImportanceVis = new FeatureImportanceVis('feature-importance-visualization');
        });
        
        // Initialize local explanations visualization
        initVisualizationWithContainer('local-explanations-visualization', () => {
            window.localExplanationsVis = new LocalExplanationsVis('local-explanations-visualization');
        });
        
        // Initialize counterfactuals visualization
        initVisualizationWithContainer('counterfactuals-visualization', () => {
            window.counterfactualsVis = new CounterfactualsVis('counterfactuals-visualization');
        });
    } catch (error) {
        console.error("Error initializing visualizations:", error);
    }
}

// Improved visualization initialization with WebGL detection and error handling
function initVisualizationWithContainer(containerId, initFunction) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Clear any existing content
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    
    try {
        // Check for WebGL support for 3D visualizations
        if (containerId.includes('neural-network') && !isWebGLSupported()) {
            throw new Error('WebGL not supported');
        }
        
        // Set proper dimensions
        const containerRect = container.getBoundingClientRect();
        if (containerRect.width > 0 && containerRect.height > 0) {
            container.style.width = `${containerRect.width}px`;
            container.style.height = `${containerRect.height}px`;
        }
        
        // Show loading indicator
        const loadingIndicator = LoadingAnimation.show(containerId);
        
        // Initialize with a delay to ensure DOM is ready
        setTimeout(() => {
            try {
                initFunction();
                setTimeout(() => {
                    LoadingAnimation.hide(loadingIndicator);
                }, 500);
            } catch (error) {
                console.error(`Error initializing ${containerId}:`, error);
                LoadingAnimation.hide(loadingIndicator);
                handleVisualizationError(containerId, error);
            }
        }, 100);
    } catch (error) {
        console.error(`Error setting up ${containerId}:`, error);
        handleVisualizationError(containerId, error);
    }
}

// WebGL support detection
function isWebGLSupported() {
    try {
        const canvas = document.createElement('canvas');
        return !!(window.WebGLRenderingContext && 
            (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
        return false;
    }
}

// Improved error handling
function handleVisualizationError(containerId, error) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `
        <div class="error-message">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <p>${error.message || 'There was an error loading this visualization.'}</p>
            <button class="retry-button">Retry</button>
            <button class="fallback-button">Use Simplified Version</button>
        </div>
    `;
    
    // Add retry functionality
    const retryButton = container.querySelector('.retry-button');
    if (retryButton) {
        retryButton.addEventListener('click', () => {
            container.innerHTML = '';
            initVisualizations();
        });
    }
    
    // Add fallback functionality
    const fallbackButton = container.querySelector('.fallback-button');
    if (fallbackButton) {
        fallbackButton.addEventListener('click', () => {
            container.innerHTML = '';
            createFallbackVisualization(container);
        });
    }
}

// Show error message
function showErrorMessage(message) {
    const errorContainer = document.createElement('div');
    errorContainer.className = 'global-error';
    errorContainer.innerHTML = `
        <div class="error-content">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <p>${message}</p>
            <button class="close-error">&times;</button>
        </div>
    `;
    
    document.body.appendChild(errorContainer);
    
    // Add close functionality
    const closeButton = errorContainer.querySelector('.close-error');
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            errorContainer.remove();
        });
    }
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (document.body.contains(errorContainer)) {
            errorContainer.remove();
        }
    }, 5000);
}

// Create intro visualization with beautiful brain animation
function initIntroVisualization() {
    const containerId = 'intro-visualization';
    const container = document.getElementById(containerId);
    
    if (!container) {
        console.error("Intro visualization container not found");
        return;
    }
    
    try {
        // Show loading animation
        const loadingIndicator = LoadingAnimation.show(containerId);
        
        // Initialize the intro animation
        const introAnimation = new IntroAnimation(containerId);
        
        // Hide loading animation after a short delay
        setTimeout(() => {
            LoadingAnimation.hide(loadingIndicator);
        }, 1000);
    } catch (error) {
        console.error("Failed to initialize 3D visualization, falling back to 2D:", error);
        createFallbackVisualization(container);
    }
}

// Enhance fallback visualization creation
function createFallbackVisualization(container, type = 'generic') {
    container.innerHTML = '';
    
    const width = container.clientWidth;
    const height = container.clientHeight || 500;
    
    // Add fade-in animation class
    container.classList.add('fade-in');
    
    // Create SVG container
    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height);
        
    switch(type) {
        case 'neural-network':
            createFallbackNeuralNetwork(svg, width, height);
            break;
        case 'feature-importance':
            createFallbackFeatureImportance(svg, width, height);
            break;
        case 'local-explanations':
            createFallbackLocalExplanation(svg, width, height);
            break;
        case 'counterfactuals':
            createFallbackCounterfactual(svg, width, height);
            break;
        default:
            createGenericFallback(svg, width, height);
    }
}

// Add specific fallback function for feature importance
function createFallbackFeatureImportance(svg, width, height) {
    const features = [
        { name: "Income", value: 0.8 },
        { name: "Credit Score", value: 0.75 },
        { name: "Debt Ratio", value: 0.6 },
        { name: "Age", value: 0.4 },
        { name: "Employment Years", value: 0.35 }
    ];
    
    const margin = { top: 20, right: 30, bottom: 40, left: 120 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    const g = svg.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);
    
    // Create scales
    const xScale = d3.scaleLinear()
        .domain([0, 1])
        .range([0, innerWidth]);
    
    const yScale = d3.scaleBand()
        .domain(features.map(d => d.name))
        .range([0, innerHeight])
        .padding(0.2);
    
    // Create bars with animation
    g.selectAll('.bar')
        .data(features)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('y', d => yScale(d.name))
        .attr('height', yScale.bandwidth())
        .attr('x', 0)
        .attr('width', 0)
        .attr('fill', '#6366f1')
        .transition()
        .duration(1000)
        .attr('width', d => xScale(d.value));
    
    // Add value labels
    g.selectAll('.value-label')
        .data(features)
        .enter()
        .append('text')
        .attr('class', 'value-label')
        .attr('y', d => yScale(d.name) + yScale.bandwidth() / 2)
        .attr('x', d => xScale(d.value) + 5)
        .attr('dy', '0.35em')
        .attr('opacity', 0)
        .text(d => d.value.toFixed(2))
        .transition()
        .delay(1000)
        .duration(500)
        .attr('opacity', 1);
    
    // Add axes
    g.append('g')
        .attr('transform', `translate(0, ${innerHeight})`)
        .call(d3.axisBottom(xScale));
    
    g.append('g')
        .call(d3.axisLeft(yScale));
}

// Function to set up guided tours for each visualization
function setupGuidedTours() {
    // Feature importance tour - simplified
    GuidedTour.createTour('feature-importance-visualization', [
        {
            element: '#feature-importance-visualization',
            title: 'Feature Importance',
            content: 'This visualization shows which features have the most influence on the model predictions.'
        }
    ]);
    
    // Neural network tour - simplified
    GuidedTour.createTour('neural-network-visualization', [
        {
            element: '#neural-network-visualization',
            title: 'Neural Network',
            content: 'This 3D visualization shows how neural networks process information through layers of neurons.'
        }
    ]);
} 