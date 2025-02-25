/**
 * Fallback OrbitControls implementation
 * This is a simplified version of Three.js OrbitControls
 */

// Define OrbitControls if it doesn't exist
if (typeof OrbitControls === 'undefined') {
    console.log('Using fallback OrbitControls implementation');
    
    class OrbitControlsFallback {
        constructor(camera, domElement) {
            this.camera = camera;
            this.domElement = domElement;
            
            // Properties
            this.enableDamping = true;
            this.dampingFactor = 0.05;
            this.rotateSpeed = 0.7;
            this.zoomSpeed = 0.7;
            this.panSpeed = 0.7;
            
            // Internal state
            this.target = new THREE.Vector3();
            this.mouseButtons = { LEFT: THREE.MOUSE.ROTATE };
            this.touches = { ONE: THREE.TOUCH.ROTATE };
            
            // Event handlers
            this.onMouseDown = this.onMouseDown.bind(this);
            this.onMouseMove = this.onMouseMove.bind(this);
            this.onMouseUp = this.onMouseUp.bind(this);
            
            // Add event listeners
            this.domElement.addEventListener('mousedown', this.onMouseDown, false);
            this.domElement.addEventListener('wheel', this.onMouseWheel.bind(this), false);
            
            // Initialize
            this.update();
        }
        
        // Event handlers
        onMouseDown(event) {
            if (event.button === 0) {
                document.addEventListener('mousemove', this.onMouseMove, false);
                document.addEventListener('mouseup', this.onMouseUp, false);
            }
        }
        
        onMouseMove(event) {
            // Simple rotation based on mouse movement
            const movementX = event.movementX || 0;
            const movementY = event.movementY || 0;
            
            this.rotateCamera(movementX, movementY);
        }
        
        onMouseUp() {
            document.removeEventListener('mousemove', this.onMouseMove, false);
            document.removeEventListener('mouseup', this.onMouseUp, false);
        }
        
        onMouseWheel(event) {
            // Simple zoom based on wheel delta
            const delta = -Math.sign(event.deltaY);
            this.zoomCamera(delta);
        }
        
        // Camera manipulation
        rotateCamera(deltaX, deltaY) {
            // Simple rotation around the target
            const quaternion = new THREE.Quaternion().setFromEuler(
                new THREE.Euler(
                    deltaY * 0.002,
                    deltaX * 0.002,
                    0,
                    'XYZ'
                )
            );
            
            this.camera.position.sub(this.target);
            this.camera.position.applyQuaternion(quaternion);
            this.camera.position.add(this.target);
            this.camera.lookAt(this.target);
        }
        
        zoomCamera(delta) {
            // Simple zoom
            const zoomScale = Math.pow(0.95, -delta * this.zoomSpeed);
            
            this.camera.position.sub(this.target);
            this.camera.position.multiplyScalar(zoomScale);
            this.camera.position.add(this.target);
        }
        
        // Main update method
        update() {
            // Nothing to do in this simplified version
            return false;
        }
        
        // Cleanup
        dispose() {
            this.domElement.removeEventListener('mousedown', this.onMouseDown, false);
            this.domElement.removeEventListener('wheel', this.onMouseWheel, false);
            document.removeEventListener('mousemove', this.onMouseMove, false);
            document.removeEventListener('mouseup', this.onMouseUp, false);
        }
    }
    
    // Assign to global scope
    window.OrbitControls = OrbitControlsFallback;
} 