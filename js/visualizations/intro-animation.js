class IntroAnimation {
    constructor(containerId) {
        console.log('IntroAnimation constructor called with container:', containerId);
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`Container #${containerId} not found`);
            return;
        }
        console.log('IntroAnimation container dimensions:', this.container.clientWidth, 'x', this.container.clientHeight);

        // Setup canvas
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.container.clientWidth;
        this.canvas.height = this.container.clientHeight;
        this.container.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');

        // Brain visualization settings
        this.nodes = [];
        this.connections = [];
        this.createBrainVisualization();
        
        // Start animation
        this.animate();
        
        // Handle resize
        this.resizeHandler = this.handleResize.bind(this);
        window.addEventListener('resize', this.resizeHandler);
    }
    
    createBrainVisualization() {
        // Create node network in brain shape
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const brainWidth = Math.min(this.canvas.width * 0.8, 500);
        const brainHeight = Math.min(this.canvas.height * 0.8, 400);
        
        // Generate nodes
        for (let i = 0; i < 120; i++) {
            // Brain shape distribution (ellipsoid with perturbations)
            const angle = Math.random() * Math.PI * 2;
            const radiusX = (0.5 + Math.random() * 0.5) * brainWidth/2;
            const radiusY = (0.5 + Math.random() * 0.5) * brainHeight/2;
            
            // Add two hemispheres with a slight gap
            const hemisphere = Math.random() > 0.5 ? 1 : -1;
            const gap = brainWidth * 0.05;
            
            // Create nodes for brain visualization
            this.nodes.push({
                x: centerX + hemisphere * (gap/2 + radiusX * Math.cos(angle)),
                y: centerY + radiusY * Math.sin(angle),
                radius: 1 + Math.random() * 3,
                color: i % 3 === 0 ? '#10b981' : i % 3 === 1 ? '#6366f1' : '#f59e0b',
                speed: 0.2 + Math.random() * 0.3,
                angle: Math.random() * Math.PI * 2,
                originalX: centerX + hemisphere * (gap/2 + radiusX * Math.cos(angle)),
                originalY: centerY + radiusY * Math.sin(angle),
                maxOffset: 5 + Math.random() * 10
            });
        }
        
        // Generate connections
        for (let i = 0; i < this.nodes.length; i++) {
            const node = this.nodes[i];
            
            // Connect to nearest nodes
            const nearestNodes = this.findNearestNodes(node, 3);
            nearestNodes.forEach(nearNode => {
                if (Math.random() > 0.3) { // 70% chance of connection
                    this.connections.push({
                        from: node,
                        to: nearNode,
                        opacity: 0.1 + Math.random() * 0.2
                    });
                }
            });
        }
    }
    
    findNearestNodes(node, count) {
        return this.nodes
            .filter(n => n !== node)
            .sort((a, b) => {
                const distA = Math.hypot(node.x - a.x, node.y - a.y);
                const distB = Math.hypot(node.x - b.x, node.y - b.y);
                return distA - distB;
            })
            .slice(0, count);
    }
    
    animate() {
        if (!this.ctx) return;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update nodes position with gentle movement
        this.nodes.forEach(node => {
            node.angle += node.speed/100;
            node.x = node.originalX + Math.cos(node.angle) * node.maxOffset;
            node.y = node.originalY + Math.sin(node.angle) * node.maxOffset;
        });
        
        // Draw connections
        this.ctx.lineWidth = 1;
        this.connections.forEach(conn => {
            this.ctx.beginPath();
            this.ctx.moveTo(conn.from.x, conn.from.y);
            this.ctx.lineTo(conn.to.x, conn.to.y);
            this.ctx.strokeStyle = `rgba(99, 102, 241, ${conn.opacity})`;
            this.ctx.stroke();
        });
        
        // Draw nodes
        this.nodes.forEach(node => {
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = node.color;
            this.ctx.fill();
        });
        
        // Pulse animation on random nodes
        if (Math.random() > 0.95) {
            const randomNode = this.nodes[Math.floor(Math.random() * this.nodes.length)];
            this.pulse(randomNode.x, randomNode.y, randomNode.color);
        }
        
        // Continue animation
        this.animationId = requestAnimationFrame(this.animate.bind(this));
    }
    
    pulse(x, y, color) {
        const pulseElement = document.createElement('div');
        pulseElement.className = 'node-pulse';
        pulseElement.style.left = `${x}px`;
        pulseElement.style.top = `${y}px`;
        pulseElement.style.backgroundColor = color;
        this.container.appendChild(pulseElement);
        
        // Remove after animation
        setTimeout(() => {
            if (pulseElement.parentNode) {
                pulseElement.parentNode.removeChild(pulseElement);
            }
        }, 1000);
    }
    
    handleResize() {
        if (!this.canvas || !this.container) return;
        
        this.canvas.width = this.container.clientWidth;
        this.canvas.height = this.container.clientHeight;
        
        // Recreate visualization with new dimensions
        this.nodes = [];
        this.connections = [];
        this.createBrainVisualization();
    }
    
    dispose() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        window.removeEventListener('resize', this.resizeHandler);
        
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

// Add this at the end of the file
window.IntroAnimation = IntroAnimation; 