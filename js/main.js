/**
 * Main JavaScript file
 * This file initializes all visualizations and UI components
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize UI controls
    UIControls.initNavigation();
    UIControls.initModals();
    UIControls.initButtons();
    
    // Initialize intro visualization
    initIntroVisualization();
    
    // Initialize neural network visualization
    const neuralNetworkVis = new NeuralNetworkVis('neural-network-visualization');
    
    // Initialize feature importance visualization
    const featureImportanceVis = new FeatureImportanceVis('feature-importance-visualization');
    
    // Initialize local explanations visualization
    const localExplanationsVis = new LocalExplanationsVis('local-explanation-visualization');
    
    // Initialize counterfactuals visualization
    const counterfactualsVis = new CounterfactualsVis('counterfactual-visualization');
});

// Create intro visualization with particles
function initIntroVisualization() {
    const containerId = 'intro-visualization';
    const container = document.getElementById(containerId);
    
    if (!container) return;
    
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