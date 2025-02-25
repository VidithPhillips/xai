/**
 * Three.js setup utility functions
 * This file contains helper functions for setting up Three.js scenes
 */

const ThreeSetup = {
    // Create a basic Three.js scene
    createScene: function(containerId) {
        const container = document.getElementById(containerId);
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        // Create scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf9fafb);
        
        // Create camera
        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.z = 5;
        
        // Create renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);
        
        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        
        // Add directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        scene.add(directionalLight);
        
        // Handle window resize
        window.addEventListener('resize', () => {
            const newWidth = container.clientWidth;
            const newHeight = container.clientHeight;
            
            camera.aspect = newWidth / newHeight;
            camera.updateProjectionMatrix();
            
            renderer.setSize(newWidth, newHeight);
        });
        
        return { scene, camera, renderer };
    },
    
    // Create orbit controls for camera
    createOrbitControls: function(camera, renderer) {
        // Check if OrbitControls is available
        if (typeof OrbitControls === 'undefined') {
            console.warn('OrbitControls not available, using basic controls');
            // Return a basic controls object with the same API
            return {
                enableDamping: false,
                dampingFactor: 0.05,
                rotateSpeed: 0.7,
                zoomSpeed: 0.7,
                panSpeed: 0.7,
                update: function() {}
            };
        }
        
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.rotateSpeed = 0.7;
        controls.zoomSpeed = 0.7;
        controls.panSpeed = 0.7;
        return controls;
    },
    
    // Create a particle system
    createParticleSystem: function(count, spread) {
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
}; 