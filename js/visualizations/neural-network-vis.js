// Performance issues with Three.js
class NeuralNetworkVis {
    constructor(containerId) {
        if (!containerId) {
            console.error('No container ID provided');
            return;
        }
        
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`Container #${containerId} not found`);
            return;
        }
        
        console.log(`Creating NeuralNetworkVis in container:`, containerId);
        console.log(`Container dimensions:`, this.container.clientWidth, 'x', this.container.clientHeight);
        
        try {
            // Initialize Three.js scene
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
            
            // Initialize network structure
            this.networkStructure = [5, 7, 5, 3];
            this.nodes = [];
            this.connections = [];
            
            // Create network
            this.createNetwork();
            
            // Add event listeners for controls
            this.setupControls();
            
            // Start animation
            this.animate();
            
        } catch (error) {
            console.error("Error initializing 3D visualization:", error);
            this.createFallback2DNetwork();
        }
    }
    
    setupControls() {
        const layersInput = document.getElementById('nn-layers');
        const neuronsInput = document.getElementById('nn-neurons');
        
        if (layersInput) {
            layersInput.addEventListener('input', () => {
                this.updateNetwork();
            });
        }
        
        if (neuronsInput) {
            neuronsInput.addEventListener('input', () => {
                this.updateNetwork();
            });
        }
    }
    
    updateNetwork() {
        const layersInput = document.getElementById('nn-layers');
        const neuronsInput = document.getElementById('nn-neurons');
        
        if (layersInput && neuronsInput) {
            const layers = parseInt(layersInput.value) || 3;
            const neurons = parseInt(neuronsInput.value) || 5;
            
            // Clear existing network
            this.clearNetwork();
            
            // Create new network structure
            this.networkStructure = Array(layers).fill(neurons);
            
            // Create new network
            this.createNetwork();
        }
    }
    
    clearNetwork() {
        // Remove all nodes and connections
        this.nodes.forEach(node => {
            this.scene.remove(node);
        });
        
        this.connections.forEach(connection => {
            this.scene.remove(connection);
        });
        
        this.nodes = [];
        this.connections = [];
    }
    
    createNetwork() {
        this.createNodes();
        this.createConnections();
    }
    
    createNodes() {
        const nodeGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        const nodeMaterial = new THREE.MeshPhongMaterial({ color: 0x00f2ff });
        
        // Create nodes for each layer
        for (let layer = 0; layer < this.networkStructure.length; layer++) {
            const nodesInLayer = this.networkStructure[layer];
            const layerX = (layer - (this.networkStructure.length - 1) / 2) * 4;
            
            for (let i = 0; i < nodesInLayer; i++) {
                const nodeY = (i - (nodesInLayer - 1) / 2) * 1.5;
                
                const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
                node.position.set(layerX, nodeY, 0);
                node.userData = { layer, index: i };
                
                this.scene.add(node);
                this.nodes.push(node);
            }
        }
    }
    
    createConnections() {
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
        for (let l = 0; l < this.networkStructure.length - 1; l++) {
            const nodesInCurrentLayer = this.nodes.filter(node => node.userData.layer === l);
            const nodesInNextLayer = this.nodes.filter(node => node.userData.layer === l + 1);
            
            nodesInCurrentLayer.forEach(currentNode => {
                nodesInNextLayer.forEach(nextNode => {
                    const geometry = new THREE.BufferGeometry().setFromPoints([
                        currentNode.position,
                        nextNode.position
                    ]);
                    
                    const material = Math.random() > 0.8 ? activeConnectionMaterial : connectionMaterial;
                    const line = new THREE.Line(geometry, material);
                    
                    this.scene.add(line);
                    this.connections.push(line);
                });
            });
        }
    }
    
    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        // Rotate nodes slightly
        this.nodes.forEach(node => {
            node.rotation.x += 0.01;
            node.rotation.y += 0.01;
        });
        
        // Update controls
        if (this.controls) {
            this.controls.update();
        }
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
    }
    
    createFallback2DNetwork() {
        this.container.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 2rem;">
                <h3 style="margin-bottom: 1rem; color: var(--text-light);">Neural Network Visualization (2D Fallback)</h3>
                <p style="text-align: center; color: var(--text-gray);">
                    3D visualization could not be loaded. Using 2D fallback.
                </p>
                <svg width="100%" height="300" id="fallback-network"></svg>
            </div>
        `;
        
        // Create simple 2D network visualization using SVG
        const svg = d3.select(this.container).select('#fallback-network');
        const width = svg.node().getBoundingClientRect().width;
        const height = 300;
        
        const layers = [4, 6, 4, 2];
        const nodes = [];
        const links = [];
        
        // Create nodes
        layers.forEach((nodeCount, layer) => {
            const layerX = (width / (layers.length - 1)) * layer;
            
            for (let i = 0; i < nodeCount; i++) {
                const nodeY = (height / (nodeCount + 1)) * (i + 1);
                nodes.push({ id: `${layer}-${i}`, x: layerX, y: nodeY, layer });
            }
        });
        
        // Create links
        for (let l = 0; l < layers.length - 1; l++) {
            const currentLayerNodes = nodes.filter(node => node.layer === l);
            const nextLayerNodes = nodes.filter(node => node.layer === l + 1);
            
            currentLayerNodes.forEach(source => {
                nextLayerNodes.forEach(target => {
                    links.push({ source, target });
                });
            });
        }
        
        // Draw links
        svg.selectAll('.link')
            .data(links)
            .enter()
            .append('line')
            .attr('class', 'link')
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y)
            .attr('stroke', '#444')
            .attr('stroke-opacity', 0.3);
        
        // Draw nodes
        svg.selectAll('.node')
            .data(nodes)
            .enter()
            .append('circle')
            .attr('class', 'node')
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
            .attr('r', 8)
            .attr('fill', '#00f2ff');
    }
    
    dispose() {
        try {
            // Stop animation
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
            }
            
            // Remove event listeners
            const layersInput = document.getElementById('nn-layers');
            const neuronsInput = document.getElementById('nn-neurons');
            
            if (layersInput) {
                layersInput.removeEventListener('input', this.updateNetwork);
            }
            
            if (neuronsInput) {
                neuronsInput.removeEventListener('input', this.updateNetwork);
            }
            
            // Dispose Three.js resources
            if (this.renderer) {
                this.renderer.dispose();
            }
            
            if (this.controls) {
                this.controls.dispose();
            }
            
            // Clear container
            if (this.container) {
                this.container.innerHTML = '';
            }
        } catch (error) {
            console.warn('Error during disposal:', error);
        }
    }
}

// Add this at the end of the file
window.NeuralNetworkVis = NeuralNetworkVis; 