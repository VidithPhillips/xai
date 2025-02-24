/**
 * Neural Network Visualization
 * This file creates an interactive 3D visualization of a neural network
 */

class NeuralNetworkVis {
    constructor(containerId) {
        this.containerId = containerId;
        this.neurons = [];
        this.connections = [];
        this.layers = 3;
        this.neuronsPerLayer = 5;
        this.activation = 'relu';
        
        // Initialize the visualization
        this.init();
    }
    
    init() {
        // Set up Three.js scene
        const { scene, camera, renderer } = ThreeSetup.createScene(this.containerId);
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        
        // Add orbit controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        
        // Position camera
        this.camera.position.set(0, 0, 10);
        
        // Create neural network
        this.createNeuralNetwork();
        
        // Set up animation loop
        this.animate();
        
        // Set up event listeners
        this.setupEventListeners();
    }
    
    createNeuralNetwork() {
        // Clear existing network
        this.neurons.forEach(neuron => this.scene.remove(neuron));
        this.connections.forEach(connection => this.scene.remove(connection));
        this.neurons = [];
        this.connections = [];
        
        // Calculate dimensions
        const layerSpacing = 4;
        const neuronSpacing = 1.2;
        const startX = -((this.layers - 1) * layerSpacing) / 2;
        
        // Create neurons for each layer
        for (let layer = 0; layer < this.layers; layer++) {
            const x = startX + layer * layerSpacing;
            const layerNeurons = [];
            
            // Determine number of neurons in this layer
            let neuronsInLayer = this.neuronsPerLayer;
            if (layer === 0) {
                // Input layer
                neuronsInLayer = 4; // Fixed input features
            } else if (layer === this.layers - 1) {
                // Output layer
                neuronsInLayer = 2; // Binary classification
            }
            
            // Calculate vertical positioning
            const startY = -((neuronsInLayer - 1) * neuronSpacing) / 2;
            
            // Create neurons
            for (let n = 0; n < neuronsInLayer; n++) {
                const y = startY + n * neuronSpacing;
                
                // Create neuron sphere
                const geometry = new THREE.SphereGeometry(0.2, 16, 16);
                
                // Color based on layer type
                let color;
                if (layer === 0) {
                    color = 0x6366f1; // Input layer - primary color
                } else if (layer === this.layers - 1) {
                    color = 0x10b981; // Output layer - secondary color
                } else {
                    color = 0x818cf8; // Hidden layer - primary light
                }
                
                const material = new THREE.MeshPhongMaterial({ color });
                const neuron = new THREE.Mesh(geometry, material);
                neuron.position.set(x, y, 0);
                
                // Add to scene and store
                this.scene.add(neuron);
                layerNeurons.push(neuron);
                this.neurons.push(neuron);
            }
            
            // Create connections to previous layer
            if (layer > 0) {
                const prevLayerNeurons = this.neurons.slice(
                    this.neurons.length - layerNeurons.length - (layer === 1 ? 4 : this.neuronsPerLayer),
                    this.neurons.length - layerNeurons.length
                );
                
                // Connect each neuron to all neurons in previous layer
                for (const neuron of layerNeurons) {
                    for (const prevNeuron of prevLayerNeurons) {
                        const startPoint = prevNeuron.position.clone();
                        const endPoint = neuron.position.clone();
                        
                        // Create connection line
                        const points = [startPoint, endPoint];
                        const geometry = new THREE.BufferGeometry().setFromPoints(points);
                        
                        // Random weight for visualization
                        const weight = Math.random();
                        const color = weight > 0.5 ? 0x4f46e5 : 0xf59e0b;
                        const opacity = Math.abs(weight - 0.5) * 1.5 + 0.25;
                        
                        const material = new THREE.LineBasicMaterial({
                            color,
                            transparent: true,
                            opacity
                        });
                        
                        const connection = new THREE.Line(geometry, material);
                        this.scene.add(connection);
                        this.connections.push(connection);
                    }
                }
            }
        }
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Update controls
        this.controls.update();
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
    }
    
    setupEventListeners() {
        // Listen for layer count changes
        const layersSlider = document.getElementById('nn-layers');
        if (layersSlider) {
            layersSlider.addEventListener('input', () => {
                this.layers = parseInt(layersSlider.value);
                this.createNeuralNetwork();
            });
        }
        
        // Listen for neuron count changes
        const neuronsSlider = document.getElementById('nn-neurons');
        if (neuronsSlider) {
            neuronsSlider.addEventListener('input', () => {
                this.neuronsPerLayer = parseInt(neuronsSlider.value);
                this.createNeuralNetwork();
            });
        }
        
        // Listen for activation function changes
        const activationSelect = document.getElementById('nn-activation');
        if (activationSelect) {
            activationSelect.addEventListener('change', () => {
                this.activation = activationSelect.value;
                // In a real implementation, this would change the visualization
                // of activation functions
            });
        }
    }
} 