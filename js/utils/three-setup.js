/**
 * Three.js setup utility functions
 * This file contains helper functions for setting up Three.js scenes
 */

class ThreeSetup {
    static isWebGLAvailable() {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && 
                (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch (e) {
            return false;
        }
    }

    static init(containerId, options = {}) {
        if (!this.isWebGLAvailable()) {
            throw new Error('WebGL is not supported');
        }

        const container = document.getElementById(containerId);
        if (!container) {
            throw new Error(`Container #${containerId} not found`);
        }

        // Create scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x111111);
        
        // Setup camera
        const camera = new THREE.PerspectiveCamera(
            options.fov || 75,
            container.clientWidth / container.clientHeight,
            options.near || 0.1,
            options.far || 1000
        );
        camera.position.z = options.cameraZ || 5;

        // Setup renderer
        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);

        // Setup controls
        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;

        // Add resize handler
        window.addEventListener('resize', () => {
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        });

        return { scene, camera, renderer, controls };
    }
    
    static createParticleSystem(count, spread) {
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        
        const color = new THREE.Color();
        
        for (let i = 0; i < count * 3; i += 3) {
            // Position
            positions[i] = (Math.random() - 0.5) * spread;
            positions[i + 1] = (Math.random() - 0.5) * spread;
            positions[i + 2] = (Math.random() - 0.5) * spread;
            
            // Color
            color.setHSL(Math.random(), 0.7, 0.5);
            colors[i] = color.r;
            colors[i + 1] = color.g;
            colors[i + 2] = color.b;
        }
        
        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const material = new THREE.PointsMaterial({
            size: 0.05,
            vertexColors: true,
            transparent: true,
            opacity: 0.8
        });
        
        return new THREE.Points(particles, material);
    }
}

window.ThreeSetup = ThreeSetup; 