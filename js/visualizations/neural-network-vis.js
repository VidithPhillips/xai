// Performance issues with Three.js
class NeuralNetworkVis {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`Container #${containerId} not found`);
            return;
        }
        
        console.log(`Creating NeuralNetworkVis in container:`, containerId);
        console.log(`Container dimensions:`, this.container.clientWidth, 'x', this.container.clientHeight);
        
        try {
            // Check WebGL support
            if (!this.isWebGLSupported()) {
                console.warn("WebGL not supported, using 2D fallback");
                this.createFallback2DNetwork();
                return;
            }
            
            // Initialize Three.js scene using ThreeSetup
            const { scene, camera, renderer, controls } = ThreeSetup.init(containerId, {
                fov: 75,
                cameraZ: 15
            });
            
            this.scene = scene;
            this.camera = camera;
            this.renderer = renderer;
            this.controls = controls;
            
            // Add lights
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
            this.scene.add(ambientLight);
            
            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
            directionalLight.position.set(1, 1, 1);
            this.scene.add(directionalLight);
            
            // Create network
            this.createNetwork();
            
            // Start animation
            this.animate();
            
        } catch (error) {
            console.error("Error initializing 3D visualization:", error);
            this.createFallback2DNetwork();
        }
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
        // Check if we're using the fallback 2D visualization
        if (!this.scene) {
            console.log('Using 2D fallback, recreating visualization');
            this.createFallback2DNetwork();
            return;
        }
        
        // Clean up old network
        this.cleanupNetwork();
        
        // Create new network
        this.createNetwork();
    }
    
    cleanupNetwork() {
        // Check if scene exists before trying to access its children
        if (!this.scene) {
            console.warn('Scene is not initialized');
            return;
        }
        
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
        console.log("Creating fallback 2D network visualization");
        
        // Clear container
        this.container.innerHTML = '';
        
        // Create SVG element
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("width", "100%");
        svg.setAttribute("height", "100%");
        svg.style.background = "#1a1a2e";
        this.container.appendChild(svg);
        
        // Define network structure
        const layers = [4, 6, 6, 3];
        const layerDistance = 150;
        const nodeRadius = 15;
        
        // Calculate positions
        const width = this.container.clientWidth || 800;
        const height = this.container.clientHeight || 400;
        
        // Create nodes
        const nodes = [];
        for (let l = 0; l < layers.length; l++) {
            const layerSize = layers[l];
            const xPos = (l * layerDistance) + 100;
            
            for (let n = 0; n < layerSize; n++) {
                const yPos = ((n + 0.5) * (height / layerSize));
                
                // Create node
                const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                circle.setAttribute("cx", xPos);
                circle.setAttribute("cy", yPos);
                circle.setAttribute("r", nodeRadius);
                
                // Set color based on layer
                let color;
                if (l === 0) color = "#00f2ff"; // Input layer
                else if (l === layers.length - 1) color = "#ff00d4"; // Output layer
                else color = "#00ff88"; // Hidden layer
                
                circle.setAttribute("fill", color);
                circle.setAttribute("stroke", "#ffffff");
                circle.setAttribute("stroke-width", "2");
                
                svg.appendChild(circle);
                nodes.push({ x: xPos, y: yPos, layer: l, index: n });
            }
        }
        
        // Create connections
        for (let l = 0; l < layers.length - 1; l++) {
            const currentLayerNodes = nodes.filter(n => n.layer === l);
            const nextLayerNodes = nodes.filter(n => n.layer === l + 1);
            
            for (const sourceNode of currentLayerNodes) {
                for (const targetNode of nextLayerNodes) {
                    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                    line.setAttribute("x1", sourceNode.x);
                    line.setAttribute("y1", sourceNode.y);
                    line.setAttribute("x2", targetNode.x);
                    line.setAttribute("y2", targetNode.y);
                    line.setAttribute("stroke", "#ffffff");
                    line.setAttribute("stroke-width", "1");
                    line.setAttribute("opacity", "0.3");
                    
                    svg.appendChild(line);
                }
            }
        }
        
        // Add title
        const title = document.createElementNS("http://www.w3.org/2000/svg", "text");
        title.setAttribute("x", width / 2);
        title.setAttribute("y", 30);
        title.setAttribute("text-anchor", "middle");
        title.setAttribute("fill", "#ffffff");
        title.setAttribute("font-size", "20px");
        title.textContent = "Neural Network Visualization";
        
        svg.appendChild(title);
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