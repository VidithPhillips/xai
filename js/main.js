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
    // Different colors and settings for each section - reduced count
    const sections = [
        { id: 'intro', color: '#6366f1', count: 15 }, // Reduced from 40
        { id: 'neural-networks', color: '#10b981', count: 12 }, // Reduced from 30
        { id: 'feature-importance', color: '#f59e0b', count: 10 }, // Reduced from 25
        { id: 'local-explanations', color: '#8b5cf6', count: 12 }, // Reduced from 35
        { id: 'counterfactuals', color: '#ef4444', count: 10 } // Reduced from 20
    ];
    
    sections.forEach(section => {
        try {
            window.particleBackgrounds[section.id] = new ParticleBackground(section.id, {
                particleColor: section.color,
                particleCount: section.count,
                lineColor: `${section.color}15` // Even more transparency (15 instead of 33)
            });
        } catch (error) {
            console.error(`Error initializing particle background for ${section.id}:`, error);
        }
    });
}

// Initialize all visualizations with error handling
function initVisualizations() {
    // Initialize intro visualization
    try {
        console.log("Initializing intro visualization");
        // Only initialize if the container exists
        if (document.getElementById('intro-visualization')) {
            initIntroVisualization();
        }
    } catch (error) {
        console.error("Error initializing intro visualization:", error);
        handleVisualizationError('intro-visualization');
    }
    
    // Initialize neural network visualization
    try {
        console.log("Initializing neural network visualization");
        // Show loading animation
        const loadingIndicator = LoadingAnimation.show('neural-network-visualization');
        
        window.neuralNetworkVis = new NeuralNetworkVis('neural-network-visualization');
        
        // Hide loading animation after a short delay
        setTimeout(() => {
            LoadingAnimation.hide(loadingIndicator);
        }, 1000);
    } catch (error) {
        console.error("Error initializing neural network visualization:", error);
        handleVisualizationError('neural-network-visualization');
    }
    
    // Initialize feature importance visualization with loading animation
    try {
        console.log("Initializing feature importance visualization");
        const loadingIndicator = LoadingAnimation.show('feature-importance-visualization');
        
        window.featureImportanceVis = new FeatureImportanceVis('feature-importance-visualization');
        
        setTimeout(() => {
            LoadingAnimation.hide(loadingIndicator);
        }, 1000);
    } catch (error) {
        console.error("Error initializing feature importance visualization:", error);
        handleVisualizationError('feature-importance-visualization');
    }
    
    // Initialize local explanations visualization with loading animation
    try {
        console.log("Initializing local explanations visualization");
        const loadingIndicator = LoadingAnimation.show('local-explanations-visualization');
        
        window.localExplanationsVis = new LocalExplanationsVis('local-explanations-visualization');
        
        setTimeout(() => {
            LoadingAnimation.hide(loadingIndicator);
        }, 1000);
    } catch (error) {
        console.error("Error initializing local explanations visualization:", error);
        handleVisualizationError('local-explanations-visualization');
    }
    
    // Initialize counterfactuals visualization with loading animation
    try {
        console.log("Initializing counterfactuals visualization");
        const loadingIndicator = LoadingAnimation.show('counterfactuals-visualization');
        
        window.counterfactualsVis = new CounterfactualsVis('counterfactuals-visualization');
        
        setTimeout(() => {
            LoadingAnimation.hide(loadingIndicator);
        }, 1000);
    } catch (error) {
        console.error("Error initializing counterfactuals visualization:", error);
        handleVisualizationError('counterfactuals-visualization');
    }
    
    // Listen for section activation events
    document.addEventListener('sectionActivated', (event) => {
        const sectionId = event.detail.sectionId;
        console.log(`Section activated: ${sectionId}`);
        
        // Force visualization update for the activated section
        switch(sectionId) {
            case 'intro':
                // Intro visualization is already handled in initIntroVisualization
                break;
            case 'neural-networks':
                if (window.neuralNetworkVis) {
                    window.neuralNetworkVis.updateVisualization();
                }
                break;
            case 'feature-importance':
                if (window.featureImportanceVis) {
                    window.featureImportanceVis.updateChart();
                }
                break;
            case 'local-explanations':
                if (window.localExplanationsVis) {
                    window.localExplanationsVis.updateChart();
                }
                break;
            case 'counterfactuals':
                if (window.counterfactualsVis) {
                    window.counterfactualsVis.updateChart();
                }
                break;
        }
    });
}

// Handle visualization errors
function handleVisualizationError(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `
        <div class="error-message">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <p>There was an error loading this visualization.</p>
            <button class="retry-button">Retry</button>
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

// Create a fallback 2D visualization using D3
function createFallbackVisualization(container) {
    container.innerHTML = '';
    
    const width = container.clientWidth;
    const height = container.clientHeight || 500;
    
    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height);
    
    // Create a simple animated visualization
    const numCircles = 50;
    const circles = [];
    
    for (let i = 0; i < numCircles; i++) {
        circles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            r: Math.random() * 20 + 5,
            color: d3.interpolateInferno(Math.random()),
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2
        });
    }
    
    svg.selectAll('circle')
        .data(circles)
        .enter()
        .append('circle')
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('r', d => d.r)
        .attr('fill', d => d.color)
        .attr('opacity', 0.7);
    
    function animate() {
        circles.forEach(circle => {
            circle.x += circle.vx;
            circle.y += circle.vy;
            
            if (circle.x < 0 || circle.x > width) circle.vx *= -1;
            if (circle.y < 0 || circle.y > height) circle.vy *= -1;
        });
        
        svg.selectAll('circle')
            .data(circles)
            .attr('cx', d => d.x)
            .attr('cy', d => d.y);
        
        requestAnimationFrame(animate);
    }
    
    animate();
}

// Function to set up guided tours for each visualization
function setupGuidedTours() {
    // Feature importance tour
    GuidedTour.createTour('feature-importance-visualization', [
        {
            element: '#feature-importance-visualization .chart-title',
            title: 'Feature Importance Chart',
            content: 'This chart shows which features have the most influence on the model predictions.'
        },
        {
            element: '#feature-importance-visualization .bar',
            title: 'Importance Bars',
            content: 'Longer bars indicate features with higher importance. The model relies more heavily on these features when making predictions.'
        },
        {
            element: '#feature-importance-visualization .value-label',
            title: 'Importance Values',
            content: 'These numbers show the exact importance score for each feature, ranging from 0 to 1.'
        }
    ]);
    
    // Neural network tour
    GuidedTour.createTour('neural-network-visualization', [
        {
            element: '#neural-network-visualization',
            title: 'Neural Network Visualization',
            content: 'This 3D visualization shows the structure of a neural network with input, hidden, and output layers.'
        },
        {
            element: '#neural-network-controls',
            title: 'Network Controls',
            content: 'Use these controls to adjust the network architecture and see how information flows through the network.'
        }
    ]);
    
    // Add tours for other visualizations...
} 