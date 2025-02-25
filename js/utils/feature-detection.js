/**
 * Feature detection and polyfill loading
 */
class FeatureDetector {
    static init() {
        this.features = {
            webgl: this.detectWebGL(),
            webgl2: this.detectWebGL2(),
            es6: this.detectES6(),
            d3: this.detectD3(),
            resizeObserver: this.detectResizeObserver(),
            intersectionObserver: this.detectIntersectionObserver()
        };
        
        console.log('Feature detection results:', this.features);
        
        // Load polyfills for missing features
        this.loadPolyfills();
    }
    
    static detectWebGL() {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && 
                (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch (e) {
            return false;
        }
    }
    
    static detectWebGL2() {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGL2RenderingContext && canvas.getContext('webgl2'));
        } catch (e) {
            return false;
        }
    }
    
    static detectES6() {
        try {
            // Test for basic ES6 features
            eval('class Test {}; const arrow = () => {}; let spread = [...[1,2,3]];');
            return true;
        } catch (e) {
            return false;
        }
    }
    
    static detectD3() {
        return typeof d3 !== 'undefined';
    }
    
    static detectResizeObserver() {
        return typeof ResizeObserver !== 'undefined';
    }
    
    static detectIntersectionObserver() {
        return typeof IntersectionObserver !== 'undefined';
    }
    
    static async loadPolyfills() {
        const polyfills = [];
        
        if (!this.features.resizeObserver) {
            polyfills.push(this.loadScript('https://cdn.jsdelivr.net/npm/resize-observer-polyfill@1.5.1/dist/ResizeObserver.min.js'));
        }
        
        if (!this.features.intersectionObserver) {
            polyfills.push(this.loadScript('https://cdn.jsdelivr.net/npm/intersection-observer@0.12.0/intersection-observer.js'));
        }
        
        if (polyfills.length > 0) {
            try {
                await Promise.all(polyfills);
                console.log('Polyfills loaded successfully');
            } catch (error) {
                console.error('Error loading polyfills:', error);
            }
        }
    }
    
    static loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    
    static isFeatureSupported(feature) {
        return this.features[feature] || false;
    }
    
    static showUnsupportedMessage(feature, container) {
        if (!container) return;
        
        container.innerHTML = `
            <div class="unsupported-feature">
                <h3>Feature Not Supported</h3>
                <p>Your browser doesn't support ${feature}, which is required for this visualization.</p>
                <p>Please try using a modern browser like Chrome, Firefox, or Edge.</p>
            </div>
        `;
    }
}

// Initialize feature detector
FeatureDetector.init();

// Export to window
window.FeatureDetector = FeatureDetector; 