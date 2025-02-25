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

// Helper function to initialize a visualization with proper container setup
function initVisualizationWithContainer(containerId, initFunction) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Set explicit dimensions
    container.style.width = '100%';
    container.style.height = '100%';
    
    // Show loading indicator
    const loadingIndicator = LoadingAnimation.show(containerId);
    
    // Initialize with a delay to ensure DOM is ready
    setTimeout(() => {
        try {
            initFunction();
            // Hide loading indicator after initialization
            setTimeout(() => {
                LoadingAnimation.hide(loadingIndicator);
            }, 500);
        } catch (error) {
            console.error(`Error initializing ${containerId}:`, error);
            LoadingAnimation.hide(loadingIndicator);
            handleVisualizationError(containerId);
        }
    }, 100);
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