/**
 * Main JavaScript file
 * This file initializes all visualizations and UI components
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Content Loaded");
    
    try {
        // Initialize UI controls
        UIControls.initNavigation();
        UIControls.initModals();
        UIControls.initButtons();
        
        // Initialize visualizations with error handling
        initVisualizations();
    } catch (error) {
        console.error("Error initializing application:", error);
        showErrorMessage("There was an error initializing the application. Please check the console for details.");
    }
});

// Initialize all visualizations with error handling
function initVisualizations() {
    // Initialize intro visualization
    try {
        console.log("Initializing intro visualization");
        initIntroVisualization();
    } catch (error) {
        console.error("Error initializing intro visualization:", error);
        handleVisualizationError('intro-visualization');
    }
    
    // Initialize neural network visualization
    try {
        console.log("Initializing neural network visualization");
        const neuralNetworkVis = new NeuralNetworkVis('neural-network-visualization');
    } catch (error) {
        console.error("Error initializing neural network visualization:", error);
        handleVisualizationError('neural-network-visualization');
    }
    
    // Initialize feature importance visualization
    try {
        console.log("Initializing feature importance visualization");
        const featureImportanceVis = new FeatureImportanceVis('feature-importance-visualization');
    } catch (error) {
        console.error("Error initializing feature importance visualization:", error);
        handleVisualizationError('feature-importance-visualization');
    }
    
    // Initialize local explanations visualization
    try {
        console.log("Initializing local explanations visualization");
        const localExplanationsVis = new LocalExplanationsVis('local-explanation-visualization');
    } catch (error) {
        console.error("Error initializing local explanations visualization:", error);
        handleVisualizationError('local-explanation-visualization');
    }
    
    // Initialize counterfactuals visualization
    try {
        console.log("Initializing counterfactuals visualization");
        const counterfactualsVis = new CounterfactualsVis('counterfactual-visualization');
    } catch (error) {
        console.error("Error initializing counterfactuals visualization:", error);
        handleVisualizationError('counterfactual-visualization');
    }
}

// Handle visualization errors by showing a message in the container
function handleVisualizationError(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="visualization-error">
                <p>Sorry, there was an error loading this visualization.</p>
                <button class="retry-button">Retry</button>
            </div>
        `;
        
        const retryButton = container.querySelector('.retry-button');
        if (retryButton) {
            retryButton.addEventListener('click', () => {
                location.reload();
            });
        }
    }
}

// Show a general error message
function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <p>${message}</p>
        <button class="close-error">Close</button>
    `;
    
    document.body.appendChild(errorDiv);
    
    const closeButton = errorDiv.querySelector('.close-error');
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            errorDiv.remove();
        });
    }
}

// Create intro visualization with particles
function initIntroVisualization() {
    const containerId = 'intro-visualization';
    const container = document.getElementById(containerId);
    
    if (!container) {
        console.error("Intro visualization container not found");
        return;
    }
    
    // Set up Three.js scene
    const { scene, camera, renderer } = ThreeSetup.createScene(containerId);
    
    // Add orbit controls
    const controls = ThreeSetup.createOrbitControls(camera, renderer);
    
    // Position camera
    camera.position.set(0, 0, 15);
    
    // Create particle system
    const particles = ThreeSetup.createParticleSystem(2000, 10);
    scene.add(particles);
    
    // Create brain mesh
    createBrainMesh(scene);
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        // Rotate particles
        particles.rotation.y += 0.001;
        particles.rotation.x += 0.0005;
        
        // Update controls
        controls.update();
        
        // Render scene
        renderer.render(scene, camera);
    }
    
    animate();
}

// Create a stylized brain mesh for intro visualization
function createBrainMesh(scene) {
    // Create a group for the brain
    const brainGroup = new THREE.Group();
    
    // Create hemispheres for the brain
    const leftHemisphere = new THREE.Mesh(
        new THREE.SphereGeometry(3, 32, 32, 0, Math.PI),
        new THREE.MeshPhongMaterial({
            color: 0x6366f1,
            transparent: true,
            opacity: 0.7,
            wireframe: false
        })
    );
    leftHemisphere.position.x = -0.5;
    
    const rightHemisphere = new THREE.Mesh(
        new THREE.SphereGeometry(3, 32, 32, 0, Math.PI),
        new THREE.MeshPhongMaterial({
            color: 0x10b981,
            transparent: true,
            opacity: 0.7,
            wireframe: false
        })
    );
    rightHemisphere.position.x = 0.5;
    rightHemisphere.rotation.y = Math.PI;
    
    // Add hemispheres to group
    brainGroup.add(leftHemisphere);
    brainGroup.add(rightHemisphere);
    
    // Add connections between hemispheres
    for (let i = 0; i < 20; i++) {
        const curve = new THREE.CubicBezierCurve3(
            new THREE.Vector3(-3, Math.random() * 2 - 1, Math.random() * 2 - 1),
            new THREE.Vector3(-1, Math.random() * 3 - 1.5, Math.random() * 3 - 1.5),
            new THREE.Vector3(1, Math.random() * 3 - 1.5, Math.random() * 3 - 1.5),
            new THREE.Vector3(3, Math.random() * 2 - 1, Math.random() * 2 - 1)
        );
        
        const points = curve.getPoints(50);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        
        const material = new THREE.LineBasicMaterial({
            color: 0xf59e0b,
            transparent: true,
            opacity: 0.6
        });
        
        const curveObject = new THREE.Line(geometry, material);
        brainGroup.add(curveObject);
    }
    
    // Add the brain group to the scene
    brainGroup.rotation.x = -0.5;
    scene.add(brainGroup);
    
    // Animate the brain
    function animateBrain() {
        brainGroup.rotation.y += 0.005;
        requestAnimationFrame(animateBrain);
    }
    
    animateBrain();
} 