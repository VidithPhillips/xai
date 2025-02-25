/**
 * Intro Animation
 * This file creates an animated introduction for the XAI Explorer
 */

class IntroAnimation {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        
        // Create canvas
        this.canvas = document.createElement('canvas');
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.container.appendChild(this.canvas);
        
        this.ctx = this.canvas.getContext('2d');
        
        // Initialize
        this.resize();
        this.createElements();
        this.animate();
        
        // Handle resize
        window.addEventListener('resize', () => this.resize());
    }
    
    resize() {
        this.canvas.width = this.container.clientWidth;
        this.canvas.height = this.container.clientHeight;
        
        // Recalculate positions
        if (this.elements) {
            this.createElements();
        }
    }
    
    createElements() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        
        // Create brain hemispheres
        this.elements = {
            leftHemisphere: {
                x: centerX - 50,
                y: centerY,
                radius: 80,
                color: '#6366f1',
                opacity: 0.7,
                startAngle: Math.PI / 2,
                endAngle: 3 * Math.PI / 2
            },
            rightHemisphere: {
                x: centerX + 50,
                y: centerY,
                radius: 80,
                color: '#10b981',
                opacity: 0.7,
                startAngle: -Math.PI / 2,
                endAngle: Math.PI / 2
            },
            connections: []
        };
        
        // Create connections between hemispheres
        for (let i = 0; i < 15; i++) {
            const startY = centerY - 60 + Math.random() * 120;
            const controlY1 = centerY - 80 + Math.random() * 160;
            const controlY2 = centerY - 80 + Math.random() * 160;
            const endY = centerY - 60 + Math.random() * 120;
            
            this.elements.connections.push({
                startX: centerX - 80,
                startY: startY,
                controlX1: centerX - 40,
                controlY1: controlY1,
                controlX2: centerX + 40,
                controlY2: controlY2,
                endX: centerX + 80,
                endY: endY,
                color: '#f59e0b',
                opacity: 0.4 + Math.random() * 0.3,
                pulseSpeed: 0.5 + Math.random() * 1.5,
                pulseOffset: Math.random() * Math.PI * 2
            });
        }
        
        // Create data points
        this.elements.dataPoints = [];
        for (let i = 0; i < 30; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = 100 + Math.random() * 100;
            
            this.elements.dataPoints.push({
                x: centerX + Math.cos(angle) * distance,
                y: centerY + Math.sin(angle) * distance,
                radius: 2 + Math.random() * 4,
                color: this.getRandomColor(),
                opacity: 0.6 + Math.random() * 0.4,
                pulseSpeed: 0.5 + Math.random() * 1.5,
                pulseOffset: Math.random() * Math.PI * 2
            });
        }
    }
    
    getRandomColor() {
        const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const time = Date.now() / 1000;
        
        // Draw brain hemispheres
        this.drawHemisphere(this.elements.leftHemisphere, time);
        this.drawHemisphere(this.elements.rightHemisphere, time);
        
        // Draw connections
        this.elements.connections.forEach(connection => {
            this.drawConnection(connection, time);
        });
        
        // Draw data points
        this.elements.dataPoints.forEach(point => {
            this.drawDataPoint(point, time);
        });
        
        requestAnimationFrame(() => this.animate());
    }
    
    drawHemisphere(hemisphere, time) {
        const pulseScale = 1 + Math.sin(time) * 0.03;
        
        this.ctx.beginPath();
        this.ctx.arc(
            hemisphere.x, 
            hemisphere.y, 
            hemisphere.radius * pulseScale, 
            hemisphere.startAngle, 
            hemisphere.endAngle
        );
        this.ctx.fillStyle = this.hexToRgba(hemisphere.color, hemisphere.opacity);
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.arc(
            hemisphere.x, 
            hemisphere.y, 
            hemisphere.radius * pulseScale, 
            hemisphere.startAngle, 
            hemisphere.endAngle
        );
        this.ctx.strokeStyle = this.hexToRgba(hemisphere.color, hemisphere.opacity + 0.1);
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }
    
    drawConnection(connection, time) {
        const pulseOpacity = connection.opacity + Math.sin(time * connection.pulseSpeed + connection.pulseOffset) * 0.2;
        
        this.ctx.beginPath();
        this.ctx.moveTo(connection.startX, connection.startY);
        this.ctx.bezierCurveTo(
            connection.controlX1, 
            connection.controlY1, 
            connection.controlX2, 
            connection.controlY2, 
            connection.endX, 
            connection.endY
        );
        this.ctx.strokeStyle = this.hexToRgba(connection.color, pulseOpacity);
        this.ctx.lineWidth = 1.5;
        this.ctx.stroke();
    }
    
    drawDataPoint(point, time) {
        const pulseScale = 1 + Math.sin(time * point.pulseSpeed + point.pulseOffset) * 0.3;
        const pulseOpacity = point.opacity + Math.sin(time * point.pulseSpeed + point.pulseOffset) * 0.2;
        
        this.ctx.beginPath();
        this.ctx.arc(point.x, point.y, point.radius * pulseScale, 0, Math.PI * 2);
        this.ctx.fillStyle = this.hexToRgba(point.color, pulseOpacity);
        this.ctx.fill();
    }
    
    hexToRgba(hex, opacity) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
} 