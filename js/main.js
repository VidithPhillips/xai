/**
 * Main JavaScript file
 * This file initializes all visualizations and UI components
 */

// Temporary placeholder for GuidedTour until implementation is complete
window.GuidedTour = {
  createTour: function(containerId, steps) {
    console.log("Starting guided tour for", containerId, steps);
  }
};

// Global visualization instances
window.neuralNetworkVis = null;
window.featureImportanceVis = null;
window.localExplanationsVis = null;
window.counterfactualsVis = null;
window.particleBackgrounds = {};

// Add global event listener tracking
const eventListeners = new Map();

function addTrackedEventListener(element, event, handler) {
    if (!element) return;
    
    const listeners = eventListeners.get(element) || [];
    listeners.push({ event, handler });
    eventListeners.set(element, listeners);
    
    element.addEventListener(event, handler);
}

function removeAllTrackedEventListeners(element) {
    if (!element) return;
    
    const listeners = eventListeners.get(element);
    if (listeners) {
        listeners.forEach(({ event, handler }) => {
            element.removeEventListener(event, handler);
        });
        eventListeners.delete(element);
    }
}

// Use in visualization cleanup
function cleanupVisualization(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Use the visualization's own dispose method
    const visualization = container.visualization;
    if (visualization && typeof visualization.dispose === 'function') {
        visualization.dispose();
    }
    
    // Remove event listeners
    removeAllTrackedEventListeners(container);
    
    // Clear container
    container.innerHTML = '';
    container.visualization = null;
}

// Issue: Global state management is fragile
// Add proper state management
const AppState = {
    activeSection: null,
    visualizations: new Map(),
    isTransitioning: false,
    
    setActiveSection(sectionId) {
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        
        const previousSection = this.activeSection;
        this.activeSection = sectionId;
        
        // Cleanup previous visualization
        if (previousSection) {
            const prevVis = this.visualizations.get(previousSection);
            if (prevVis) {
                prevVis.dispose();
                this.visualizations.delete(previousSection);
            }
        }
        
        // Initialize new visualization
        initVisualizationForSection(sectionId).finally(() => {
            this.isTransitioning = false;
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Content Loaded");
    
    try {
        // Apply dark theme initialization
        initDarkTheme();
        
        // Initialize UI controls
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
        
        // Ensure sliders are properly initialized
        initializeSliders();
        
        // Initialize counterfactual sliders
        initCounterfactualSliders();
        
        // Initialize tooltips
        initTooltips();
        
        // Add GPU acceleration for animations
        optimizePerformance();
        
        // Add a fun easter egg
        addEasterEgg();
        
        // Fix navigation functionality
        initNavigation();
        
        // Add accessibility improvements
        initAccessibility();
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
        initNeuralNetworkVisualization();
        
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

// Add resize observer to handle visualization sizing
function initVisualizationSizing() {
    const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
            const container = entry.target;
            const visualization = container.visualization;
            
            if (visualization && typeof visualization.resize === 'function') {
                visualization.resize();
            }
        }
    });
    
    // Observe all visualization containers
    document.querySelectorAll('.visualization-container').forEach(container => {
        resizeObserver.observe(container);
    });
}

// Enhanced visualization initialization
function initVisualizationWithContainer(containerId, initFunction) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container ${containerId} not found`);
        return;
    }
    
    // Ensure container has dimensions
    const rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
        console.error(`Container ${containerId} has zero dimensions`);
        container.style.minHeight = '400px';  // Set minimum height
    }
    
    // Show loading state
    const loadingIndicator = LoadingAnimation.show(containerId);
    
    try {
        // Clear container safely
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
        
        // Initialize visualization with error boundary
        const visualization = initFunction();
        container.visualization = visualization;
        
        if (loadingIndicator) {
            LoadingAnimation.hide(loadingIndicator);
        }
    } catch (error) {
        console.error(`Error initializing visualization ${containerId}:`, error);
        showVisualizationError(container, error);
    }
}

// Add error handling for visualizations
function showVisualizationError(container, error) {
    container.innerHTML = `
        <div class="error-message">
            <h4>Visualization Error</h4>
            <p>${error.message || 'Failed to load visualization'}</p>
            <button onclick="retryVisualization('${container.id}')">
                Retry
            </button>
        </div>
    `;
}

function retryVisualization(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const section = container.closest('section');
    if (section) {
        initVisualizationForSection(section.id);
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
    // TODO: Implement guided tours
    console.log('Guided tours will be implemented soon');
    /*
    if (typeof GuidedTour !== 'undefined') {
        GuidedTour.createTour('intro-visualization', introSteps);
    }
    */
}

// Ensure sliders are properly initialized
function initializeSliders() {
    const sliderContainers = [
        'neural-network-controls',
        'feature-importance-controls',
        'counterfactual-sliders'
    ];
    
    sliderContainers.forEach(containerId => {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        // Find all sliders and add value display
        const sliders = container.querySelectorAll('input[type="range"]');
        sliders.forEach(slider => {
            // Create or update value display
            let valueDisplay = slider.parentNode.querySelector('.value-display');
            if (!valueDisplay) {
                valueDisplay = document.createElement('span');
                valueDisplay.className = 'value-display';
                slider.parentNode.querySelector('label').appendChild(valueDisplay);
            }
            valueDisplay.textContent = slider.value;
            
            // Update on change
            slider.addEventListener('input', () => {
                valueDisplay.textContent = slider.value;
            });
        });
    });
}

// Fix neural network loading issue
function initNeuralNetworkVisualization() {
    const containerId = 'neural-network-visualization';
    const container = document.getElementById(containerId);
    if (!container) return;
    
    try {
        // Check WebGL support first
        if (!isWebGLSupported()) {
            throw new Error('WebGL not supported');
        }
        
        // Clear existing content
        container.innerHTML = '';
        
        // Show loading indicator
        const loadingIndicator = LoadingAnimation.show(containerId);
        
        // Ensure Three.js is loaded before continuing
        if (typeof THREE === 'undefined') {
            loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', () => {
                try {
                    window.neuralNetworkVis = new NeuralNetworkVis(containerId);
                    setTimeout(() => LoadingAnimation.hide(loadingIndicator), 500);
                } catch (err) {
                    console.error("Error initializing neural network:", err);
                    LoadingAnimation.hide(loadingIndicator);
                    handleVisualizationError(containerId, err);
                }
            });
        } else {
            window.neuralNetworkVis = new NeuralNetworkVis(containerId);
            setTimeout(() => LoadingAnimation.hide(loadingIndicator), 500);
        }
    } catch (error) {
        console.error("Error setting up neural network:", error);
        handleVisualizationError(containerId, error);
    }
}

// Helper to load scripts dynamically
function loadScript(url, callback) {
    const script = document.createElement('script');
    script.src = url;
    script.onload = callback;
    script.onerror = () => {
        console.error(`Failed to load script: ${url}`);
        callback(new Error(`Failed to load: ${url}`));
    };
    document.head.appendChild(script);
}

// Add initialization for counterfactual sliders
function initCounterfactualSliders() {
    const slidersContainer = document.getElementById('counterfactual-sliders');
    if (!slidersContainer) return;
    
    // Clear existing sliders
    slidersContainer.innerHTML = '';
    
    // Create sliders for each feature
    const features = [
        {id: 'income', name: 'Income', min: 20000, max: 200000, value: 45000, step: 5000, format: val => `$${val.toLocaleString()}`},
        {id: 'credit-score', name: 'Credit Score', min: 300, max: 850, value: 620, step: 5, format: val => val},
        {id: 'debt-ratio', name: 'Debt-to-Income', min: 0, max: 100, value: 35, step: 1, format: val => `${val}%`},
        {id: 'employment', name: 'Years Employed', min: 0, max: 40, value: 5, step: 1, format: val => `${val} years`}
    ];
    
    features.forEach(feature => {
        // Create slider group
        const sliderGroup = document.createElement('div');
        sliderGroup.className = 'slider-group';
        
        // Create label with value display
        const label = document.createElement('label');
        label.htmlFor = feature.id;
        label.textContent = feature.name;
        
        const valueDisplay = document.createElement('span');
        valueDisplay.className = 'value-display';
        valueDisplay.textContent = feature.format(feature.value);
        label.appendChild(valueDisplay);
        
        // Create slider
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.id = feature.id;
        slider.min = feature.min;
        slider.max = feature.max;
        slider.value = feature.value;
        slider.step = feature.step;
        
        // Add event listener
        slider.addEventListener('input', () => {
            valueDisplay.textContent = feature.format(parseInt(slider.value));
            updatePrediction();
        });
        
        sliderGroup.appendChild(label);
        sliderGroup.appendChild(slider);
        slidersContainer.appendChild(sliderGroup);
    });
    
    // Initial prediction update
    updatePrediction();
}

// Update the prediction based on slider values
function updatePrediction() {
    // Get slider values
    const creditScore = parseInt(document.getElementById('credit-score').value);
    const income = parseInt(document.getElementById('income').value);
    const debtRatio = parseInt(document.getElementById('debt-ratio').value);
    
    // Calculate a simple prediction
    let probability = 0;
    probability += (creditScore - 300) / (850 - 300) * 50; // 50% weight to credit score
    probability += (income - 20000) / (200000 - 20000) * 30; // 30% weight to income
    probability += (100 - debtRatio) / 100 * 20; // 20% weight to debt ratio (inverse)
    
    // Clamp between 0-100
    probability = Math.min(100, Math.max(0, probability));
    
    // Update UI
    const predictionValue = document.getElementById('prediction-value');
    const predictionProbability = document.getElementById('prediction-probability');
    const predictionFill = document.querySelector('.prediction-fill');
    const predictionMessage = document.getElementById('counterfactual-message');
    
    predictionFill.style.width = `${probability}%`;
    predictionProbability.textContent = `${Math.round(probability)}%`;
    
    if (probability >= 50) {
        predictionValue.textContent = 'Loan Approved';
        predictionMessage.textContent = probability < 70 ? 
            "Your application is just above the approval threshold. Improving your credit score would make approval more secure." : 
            "Your application is strong. Consider applying for a larger loan amount if needed.";
    } else {
        predictionValue.textContent = 'Loan Denied';
        
        // Generate guidance
        let guidance = "";
        if (creditScore < 650) guidance = `Increasing your credit score to at least 650 (currently ${creditScore})`;
        else if (debtRatio > 40) guidance = `Reducing your debt-to-income ratio below 40% (currently ${debtRatio}%)`;
        else if (income < 60000) guidance = `Increasing your income to at least $60,000 (currently $${income.toLocaleString()})`;
        else guidance = "Improving multiple factors";
        
        predictionMessage.textContent = `${guidance} would change the prediction to "Loan Approved".`;
    }
}

// Initialize dark theme elements
function initDarkTheme() {
    // Add SVG filters for glow effects
    const filterContainer = document.createElement('div');
    filterContainer.style.height = 0;
    filterContainer.style.width = 0;
    filterContainer.style.position = 'absolute';
    filterContainer.style.overflow = 'hidden';
    
    filterContainer.innerHTML = `
        <svg style="height:0; width:0; position: absolute;">
            <defs>
                <filter id="primary-glow" x="-100%" y="-100%" width="300%" height="300%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
                    <feFlood flood-color="#00f2ff" flood-opacity="0.5" result="color"/>
                    <feComposite in="color" in2="blur" operator="in" result="glow"/>
                    <feMerge>
                        <feMergeNode in="glow"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
                
                <filter id="secondary-glow" x="-100%" y="-100%" width="300%" height="300%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
                    <feFlood flood-color="#00ff88" flood-opacity="0.5" result="color"/>
                    <feComposite in="color" in2="blur" operator="in" result="glow"/>
                    <feMerge>
                        <feMergeNode in="glow"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
                
                <filter id="accent-glow" x="-100%" y="-100%" width="300%" height="300%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
                    <feFlood flood-color="#ff00d4" flood-opacity="0.5" result="color"/>
                    <feComposite in="color" in2="blur" operator="in" result="glow"/>
                    <feMerge>
                        <feMergeNode in="glow"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>
        </svg>
    `;
    
    document.body.appendChild(filterContainer);
}

// Add tooltip initialization to main.js
function initTooltips() {
    // Create tooltip container
    const tooltipContainer = document.createElement('div');
    tooltipContainer.className = 'tooltip';
    document.body.appendChild(tooltipContainer);
    
    // Add event listeners for elements with tooltip data
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', (e) => {
            const tooltip = e.target.dataset.tooltip;
            tooltipContainer.innerHTML = tooltip;
            tooltipContainer.classList.add('visible');
            
            const rect = e.target.getBoundingClientRect();
            tooltipContainer.style.left = (rect.left + rect.width / 2) + 'px';
            tooltipContainer.style.top = (rect.top - 10) + 'px';
        });
        
        element.addEventListener('mouseleave', () => {
            tooltipContainer.classList.remove('visible');
        });
    });
}

// Add GPU acceleration for animations
function optimizePerformance() {
    // Add debouncing for resize events
    let resizeTimeout;
    window.addEventListener('resize', () => {
        if (resizeTimeout) {
            clearTimeout(resizeTimeout);
        }
        resizeTimeout = setTimeout(() => {
            document.querySelectorAll('.visualization-container').forEach(container => {
                if (container.visualization?.resize) {
                    container.visualization.resize();
                }
            });
        }, 150);
    });
    
    // Add intersection observer for visibility
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const container = entry.target;
            if (entry.isIntersecting) {
                container.visualization?.resume?.();
            } else {
                container.visualization?.pause?.();
            }
        });
    });
    
    document.querySelectorAll('.visualization-container').forEach(container => {
        observer.observe(container);
    });
}

// Add a fun easter egg
function addEasterEgg() {
    const logo = document.querySelector('.logo');
    if (!logo) return;
    
    let clickCount = 0;
    const maxClicks = 5;
    
    logo.addEventListener('click', (e) => {
        if (e.detail > 1) return; // Prevent double-click triggering multiple times
        
        clickCount++;
        
        if (clickCount === maxClicks) {
            activateMatrixMode();
            clickCount = 0;
        }
    });
}

function activateMatrixMode() {
    // Create matrix rain effect
    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.zIndex = '9999';
    canvas.style.pointerEvents = 'none';
    canvas.style.opacity = '0';
    canvas.style.transition = 'opacity 2s';
    
    document.body.appendChild(canvas);
    
    // Fade in
    setTimeout(() => {
        canvas.style.opacity = '1';
    }, 100);
    
    // Matrix animation
    const ctx = canvas.getContext('2d');
    const columns = Math.floor(canvas.width / 20);
    const drops = Array(columns).fill(1);
    
    function drawMatrix() {
        // Add semi-transparent black background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Set text color to neon green
        ctx.fillStyle = '#0f8';
        ctx.font = '15px monospace';
        
        // For each column
        for (let i = 0; i < drops.length; i++) {
            // Random character
            const text = String.fromCharCode(Math.floor(Math.random() * 94) + 33);
            
            // x = i * fontSize, y = value of drops[i] * fontSize
            ctx.fillText(text, i * 20, drops[i] * 20);
            
            // If it's reached the bottom or randomly with 1% chance
            if (drops[i] * 20 > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            
            // Move down
            drops[i]++;
        }
    }
    
    // Animation loop
    const interval = setInterval(drawMatrix, 50);
    
    // Remove after 5 seconds
    setTimeout(() => {
        clearInterval(interval);
        canvas.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(canvas);
        }, 2000);
    }, 5000);
}

// Update navigation handling
function initNavigation() {
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Get target section ID
            const targetId = link.getAttribute('href').substring(1);
            
            // Remove active class from all sections and links
            document.querySelectorAll('section').forEach(section => {
                section.classList.remove('active');
            });
            navLinks.forEach(navLink => {
                navLink.classList.remove('active');
            });
            
            // Add active class to target section and link
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
                link.classList.add('active');
                
                // Initialize visualization for the new section
                initVisualizationForSection(targetId);
                
                // Update URL hash without scrolling
                history.pushState(null, '', `#${targetId}`);
            }
        });
    });
    
    // Handle initial load and back/forward navigation
    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('load', handleHashChange);
}

function handleHashChange() {
    const hash = window.location.hash.substring(1) || 'introduction';
    const section = document.getElementById(hash);
    const link = document.querySelector(`nav a[href="#${hash}"]`);
    
    if (section) {
        // Hide all sections
        document.querySelectorAll('section').forEach(s => {
            s.classList.remove('active');
        });
        
        // Show target section
        section.classList.add('active');
        
        // Update nav links
        document.querySelectorAll('nav a').forEach(a => {
            a.classList.remove('active');
        });
        if (link) {
            link.classList.add('active');
        }
        
        // Initialize visualization
        initVisualizationForSection(hash);
    }
}

// Update visualization initialization
function initVisualizationForSection(sectionId) {
    console.log('Initializing visualization for section:', sectionId);
    
    // Clean up any existing visualization instance
    if (window.currentVisualization) {
        if (typeof window.currentVisualization.dispose === 'function') {
            window.currentVisualization.dispose();
        }
        window.currentVisualization = null;
    }
    
    const containerMap = {
        'introduction': 'intro-visualization',
        'neural-networks': 'neural-network-visualization',
        'feature-importance': 'feature-importance-visualization',
        'local-explanations': 'local-explanations-visualization',
        'counterfactuals': 'counterfactuals-visualization'
    };
    
    const containerId = containerMap[sectionId];
    if (!containerId) return;
    
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Delay initialization if container dimensions are zero
    if (container.clientWidth === 0 || container.clientHeight === 0) {
        console.warn(`Container ${containerId} has zero dimensions, delaying visualization initialization.`);
        setTimeout(() => initVisualizationForSection(sectionId), 200);
        return;
    }
    
    // Show loading indicator
    const loadingIndicator = LoadingAnimation.show(containerId);
    try {
        switch (sectionId) {
            case 'introduction':
                window.currentVisualization = new IntroAnimation(containerId);
                break;
            case 'neural-networks':
                window.currentVisualization = new NeuralNetworkVis(containerId);
                break;
            case 'feature-importance':
                window.currentVisualization = new FeatureImportanceVis(containerId);
                break;
            case 'local-explanations':
                window.currentVisualization = new LocalExplanationsVis(containerId);
                break;
            case 'counterfactuals':
                window.currentVisualization = new CounterfactualsVis(containerId);
                break;
        }
    } catch (error) {
        console.error('Error initializing visualization:', error);
        container.innerHTML = `
            <div class="error-message">
                <h4>Visualization Error</h4>
                <p>${error.message || 'Failed to load visualization'}</p>
            </div>
        `;
    } finally {
        if (loadingIndicator) { LoadingAnimation.hide(loadingIndicator); }
    }
}

// Add accessibility improvements
function initAccessibility() {
    // Add ARIA labels
    document.querySelectorAll('.visualization-container').forEach(container => {
        container.setAttribute('role', 'region');
        container.setAttribute('aria-label', 'Interactive Visualization');
    });
    
    // Add keyboard navigation
    document.querySelectorAll('.method-btn').forEach(btn => {
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                btn.click();
            }
        });
    });
}

function handleNavigation(targetSectionId) {
    // Hide all sections
    document.querySelectorAll('section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(targetSectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        
        // Wait a moment for the section to be rendered
        setTimeout(() => {
            initVisualizationForSection(targetSectionId);
        }, 50);
    }
}

// Simple LoadingAnimation implementation
const LoadingAnimation = {
  show: function(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return null;
    
    const loader = document.createElement('div');
    loader.className = 'loading-indicator';
    loader.innerHTML = '<div class="spinner"></div><p>Loading...</p>';
    loader.style.position = 'absolute';
    loader.style.top = '0';
    loader.style.left = '0';
    loader.style.width = '100%';
    loader.style.height = '100%';
    loader.style.display = 'flex';
    loader.style.flexDirection = 'column';
    loader.style.alignItems = 'center';
    loader.style.justifyContent = 'center';
    loader.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    loader.style.color = 'white';
    loader.style.zIndex = '100';
    
    container.appendChild(loader);
    return loader;
  },
  
  hide: function(loader) {
    if (loader && loader.parentNode) {
      loader.parentNode.removeChild(loader);
    }
  }
}; 