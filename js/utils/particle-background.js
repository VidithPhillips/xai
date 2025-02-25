/**
 * Particle Background Effect
 * This file creates an animated particle background for sections
 */

class ParticleBackground {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        
        // Default options - optimized but keeping visual style
        this.options = Object.assign({
            particleCount: 25, // Reduced but still visually appealing
            particleColor: '#4f46e5',
            particleSize: 2,
            particleSpeed: 0.7, // Slightly reduced for performance
            connectParticles: true,
            connectDistance: 100,
            lineColor: 'rgba(79, 70, 229, 0.2)' // Original opacity
        }, options);
        
        // Create canvas
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'particle-background';
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.zIndex = '0';
        this.canvas.style.pointerEvents = 'none';
        
        this.container.style.position = 'relative';
        this.container.insertBefore(this.canvas, this.container.firstChild);
        
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        
        // Store the animation frame ID so we can cancel it later
        this.animationFrameId = null;
        
        // Initialize
        this.resize();
        this.createParticles();
        this.animate();
        
        // Handle resize with proper cleanup
        this.resizeHandler = () => this.resize();
        window.addEventListener('resize', this.resizeHandler);
    }
    
    resize() {
        this.canvas.width = this.container.clientWidth;
        this.canvas.height = this.container.clientHeight;
    }
    
    createParticles() {
        this.particles = [];
        
        for (let i = 0; i < this.options.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * this.options.particleSpeed,
                vy: (Math.random() - 0.5) * this.options.particleSpeed,
                size: Math.random() * this.options.particleSize + 1,
                color: this.options.particleColor
            });
        }
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update and draw particles
        this.particles.forEach(particle => {
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Bounce off edges
            if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;
            
            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = particle.color;
            this.ctx.fill();
            
            // Connect particles
            if (this.options.connectParticles) {
                this.particles.forEach(otherParticle => {
                    const dx = particle.x - otherParticle.x;
                    const dy = particle.y - otherParticle.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < this.options.connectDistance) {
                        this.ctx.beginPath();
                        this.ctx.strokeStyle = this.options.lineColor;
                        this.ctx.lineWidth = 1 - distance / this.options.connectDistance;
                        this.ctx.moveTo(particle.x, particle.y);
                        this.ctx.lineTo(otherParticle.x, otherParticle.y);
                        this.ctx.stroke();
                    }
                });
            }
        });
        
        // Store the animation frame ID
        this.animationFrameId = requestAnimationFrame(() => this.animate());
    }

    // Add a destroy method to clean up resources
    destroy() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        
        window.removeEventListener('resize', this.resizeHandler);
        
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }
} 