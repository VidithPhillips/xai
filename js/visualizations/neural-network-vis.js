// Performance issues with Three.js
class NeuralNetworkVis {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        
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
        this.scene.background = new THREE.Color(0xf9fafb);
        
        // Use WebGL2 renderer with better performance settings
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1); // Limit for performance
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
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
        
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        
        // Remove event listeners
        window.removeEventListener('resize', this.resizeHandler);
        
        // Dispose THREE.js resources
        this.cleanupNetwork();
        this.controls.dispose();
        this.renderer.dispose();
        
        // Clear container
        while (this.container.firstChild) {
            this.container.removeChild(this.container.firstChild);
        }
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
} 