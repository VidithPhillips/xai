// Performance issues with Three.js
class NeuralNetworkVis {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        
        // Get container dimensions
        const rect = this.container.getBoundingClientRect();
        
        // Set minimum dimensions
        this.width = Math.max(rect.width, 400);
        this.height = Math.max(rect.height, 300);
        
        // Check WebGL support
        if (!this.isWebGLSupported()) {
            this.showWebGLError();
            return;
        }
        
        // Setup configuration
        this.config = {
            layers: 3,
            neuronsPerLayer: 5,
            activation: 'relu'
        };
        
        // Setup scene with better performance settings
        this.setupScene();
        this.setupCamera();
        this.setupLights();
        this.setupControls();
        
        // Initialize the network
        this.createNetwork();
        
        // Start animation with performance optimization
        this.lastRenderTime = 0;
        this.animate();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Store for cleanup
        this.isActive = true;
        
        // Add resize handler
        this.resizeHandler = this.handleResize.bind(this);
        window.addEventListener('resize', this.resizeHandler);
    }
    
    isWebGLSupported() {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && 
                (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch (e) {
            return false;
        }
    }
    
    showWebGLError() {
        this.container.innerHTML = `
            <div class="error-message">
                <p>WebGL is not supported in your browser. Please try a different browser.</p>
                <button class="fallback-button">Use 2D Visualization</button>
            </div>
        `;
        
        const fallbackButton = this.container.querySelector('.fallback-button');
        if (fallbackButton) {
            fallbackButton.addEventListener('click', () => {
                this.container.innerHTML = '';
                this.createFallback2DNetwork();
            });
        }
    }
    
    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x121212); // Use dark background to match theme
        
        // Use WebGL2 renderer with better performance settings
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);
    }
    
    animate(time = 0) {
        if (!this.isActive) return;
        
        // Throttle rendering for better performance (max 30fps)
        if (time - this.lastRenderTime > 33) { // ~30fps
            this.controls.update();
            this.renderer.render(this.scene, this.camera);
            this.lastRenderTime = time;
        }
        
        this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
    }
    
    updateVisualization() {
        // Clean up old network
        this.cleanupNetwork();
        
        // Create new network
        this.createNetwork();
    }
    
    cleanupNetwork() {
        // Remove all neurons and connections from scene
        this.scene.children.forEach(child => {
            if (child.type === 'Mesh' || child.type === 'Line') {
                child.geometry.dispose();
                if (child.material.map) child.material.map.dispose();
                child.material.dispose();
                this.scene.remove(child);
            }
        });
    }
    
    dispose() {
        this.isActive = false;
        
        // Cancel animation frame
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        
        // Remove event listeners
        window.removeEventListener('resize', this.resizeHandler);
        if (this.controls) {
            this.controls.dispose();
        }
        
        // Dispose THREE.js resources properly
        if (this.scene) {
            this.scene.traverse((object) => {
                if (object.geometry) {
                    object.geometry.dispose();
                }
                if (object.material) {
                    if (object.material.map) {
                        object.material.map.dispose();
                    }
                    object.material.dispose();
                }
            });
        }
        
        if (this.renderer) {
            this.renderer.dispose();
            this.renderer.forceContextLoss();
            this.renderer.domElement = null;
        }
        
        // Clear container
        if (this.container) {
            while (this.container.firstChild) {
                this.container.removeChild(this.container.firstChild);
            }
        }
        
        // Clear references
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.nodes = null;
        this.connections = null;
    }
    
    createFallback2DNetwork() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        
        // Create an SVG-based neural network
        const svg = d3.select(this.container)
            .append('svg')
            .attr('width', width)
            .attr('height', height);
        
        // Add a simple 2D network visualization
        const layers = [4, 6, 5, 3]; // Example network architecture
        const nodeRadius = 10;
        const layerSpacing = width / (layers.length + 1);
        
        // Draw nodes
        layers.forEach((nodeCount, layerIndex) => {
            const x = layerSpacing * (layerIndex + 1);
            const verticalSpacing = height / (nodeCount + 1);
            
            for (let i = 0; i < nodeCount; i++) {
                const y = verticalSpacing * (i + 1);
                
                // Draw node
                svg.append('circle')
                    .attr('cx', x)
                    .attr('cy', y)
                    .attr('r', nodeRadius)
                    .attr('fill', layerIndex === 0 ? '#10b981' : 
                           layerIndex === layers.length - 1 ? '#f59e0b' : '#6366f1')
                    .attr('opacity', 0.8);
                    
                // Connect to previous layer if not the first layer
                if (layerIndex > 0) {
                    const prevNodeCount = layers[layerIndex - 1];
                    const prevLayerX = layerSpacing * layerIndex;
                    const prevVerticalSpacing = height / (prevNodeCount + 1);
                    
                    for (let j = 0; j < prevNodeCount; j++) {
                        const prevY = prevVerticalSpacing * (j + 1);
                        
                        svg.append('line')
                            .attr('x1', prevLayerX)
                            .attr('y1', prevY)
                            .attr('x2', x)
                            .attr('y2', y)
                            .attr('stroke', '#e5e7eb')
                            .attr('stroke-width', 1)
                            .attr('opacity', 0.3);
                    }
                }
            }
        });
    }

    // Update the node materials for neon theme
    createNodes() {
        const layers = this.networkStructure;
        const layerDistance = 8;
        
        // Clear existing nodes
        this.nodes = [];
        
        for (let l = 0; l < layers.length; l++) {
            const layerSize = layers[l];
            const xPos = (l - (layers.length - 1) / 2) * layerDistance;
            
            for (let n = 0; n < layerSize; n++) {
                const yPos = (n - (layerSize - 1) / 2) * 2;
                
                // Create node with neon color based on layer
                let nodeMaterial;
                
                if (l === 0) {
                    // Input layer - primary color
                    nodeMaterial = new THREE.MeshPhongMaterial({
                        color: 0x00f2ff,
                        shininess: 30
                    });
                } else if (l === layers.length - 1) {
                    // Output layer - accent color
                    nodeMaterial = new THREE.MeshPhongMaterial({
                        color: 0xff00d4,
                        shininess: 30
                    });
                } else {
                    // Hidden layers - secondary color
                    nodeMaterial = new THREE.MeshPhongMaterial({
                        color: 0x00ff88,
                        shininess: 30
                    });
                }
                
                const nodeGeometry = new THREE.SphereGeometry(0.5, 16, 16);
                const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
                
                node.position.set(xPos, yPos, 0);
                node.userData = { layer: l, index: n };
                
                this.scene.add(node);
                this.nodes.push(node);
            }
        }
    }

    // Update the connection materials for neon theme
    createConnections() {
        // Clear existing connections
        if (this.connections) {
            this.connections.forEach(conn => {
                this.scene.remove(conn);
            });
        }
        this.connections = [];
        
        // Create connection materials with glow
        const connectionMaterial = new THREE.LineBasicMaterial({
            color: 0x444444,
            transparent: true,
            opacity: 0.3
        });
        
        const activeConnectionMaterial = new THREE.LineBasicMaterial({
            color: 0x00f2ff,
            transparent: true,
            opacity: 0.7
        });
        
        // Connect adjacent layers
        for (let l = 0; l < this.nodes.length; l++) {
            const node = this.nodes[l];
            const layer = node.userData.layer;
            
            if (layer < this.networkStructure.length - 1) {
                // Connect to all nodes in next layer
                for (let n = 0; n < this.nodes.length; n++) {
                    const nextNode = this.nodes[n];
                    if (nextNode.userData.layer === layer + 1) {
                        const geometry = new THREE.BufferGeometry().setFromPoints([
                            node.position,
                            nextNode.position
                        ]);
                        
                        const line = new THREE.Line(geometry, Math.random() > 0.8 ? activeConnectionMaterial : connectionMaterial);
                        this.scene.add(line);
                        this.connections.push(line);
                    }
                }
            }
        }
    }

    // Fix initialization and add missing methods
    createNetwork() {
        // Set network structure based on UI controls
        const layers = parseInt(document.getElementById('nn-layers')?.value || 3);
        const neuronsPerLayer = parseInt(document.getElementById('nn-neurons')?.value || 5);
        
        this.networkStructure = Array(layers).fill(neuronsPerLayer);
        
        // Create nodes and connections for the network
        this.createNodes();
        this.createConnections();
    }

    // Add missing camera setup method
    setupCamera() {
        const aspect = this.width / this.height;
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        this.camera.position.z = 15;
    }

    // Add missing lights setup method
    setupLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        this.scene.add(directionalLight);
    }

    // Add missing controls setup method
    setupControls() {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.25;
        this.controls.rotateSpeed = 0.5;
    }

    // Add missing event listener setup
    setupEventListeners() {
        // Add UI control listeners
        const layersInput = document.getElementById('nn-layers');
        if (layersInput) {
            layersInput.addEventListener('input', this.updateVisualization.bind(this));
        }
        
        const neuronsInput = document.getElementById('nn-neurons');
        if (neuronsInput) {
            neuronsInput.addEventListener('input', this.updateVisualization.bind(this));
        }
    }

    // Add missing resize handler
    handleResize() {
        const rect = this.container.getBoundingClientRect();
        this.width = Math.max(rect.width, 400);
        this.height = Math.max(rect.height, 300);
        
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(this.width, this.height);
    }
}

// Add this at the end of the file
window.NeuralNetworkVis = NeuralNetworkVis; 