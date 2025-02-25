/**
 * Error handling and telemetry utilities
 */
class ErrorHandler {
    static init() {
        // Global error handler
        window.addEventListener('error', this.handleGlobalError.bind(this));
        window.addEventListener('unhandledrejection', this.handlePromiseRejection.bind(this));
        
        // Override console.error to capture errors
        const originalConsoleError = console.error;
        console.error = (...args) => {
            this.logError(...args);
            originalConsoleError.apply(console, args);
        };
        
        console.log('Error handler initialized');
    }
    
    static handleGlobalError(event) {
        const { message, filename, lineno, colno, error } = event;
        this.logError('Uncaught error:', { message, filename, lineno, colno, stack: error?.stack });
        this.showErrorNotification(message);
        return false; // Let the error propagate
    }
    
    static handlePromiseRejection(event) {
        this.logError('Unhandled promise rejection:', event.reason);
        this.showErrorNotification('Unhandled promise rejection');
        return false; // Let the error propagate
    }
    
    static logError(...args) {
        // In a real app, you might send this to a server
        const errorLog = {
            timestamp: new Date().toISOString(),
            args: args.map(arg => {
                if (arg instanceof Error) {
                    return { message: arg.message, stack: arg.stack };
                }
                return arg;
            }),
            url: window.location.href,
            userAgent: navigator.userAgent
        };
        
        // Store in localStorage for debugging
        const logs = JSON.parse(localStorage.getItem('errorLogs') || '[]');
        logs.push(errorLog);
        localStorage.setItem('errorLogs', JSON.stringify(logs.slice(-20))); // Keep last 20 errors
    }
    
    static showErrorNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'error-notification';
        notification.innerHTML = `
            <div class="error-content">
                <span class="error-icon">⚠️</span>
                <span class="error-message">${message}</span>
                <button class="error-close">×</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Add close button functionality
        const closeButton = notification.querySelector('.error-close');
        closeButton.addEventListener('click', () => {
            notification.remove();
        });
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.remove();
            }
        }, 10000);
    }
    
    static getErrorLogs() {
        return JSON.parse(localStorage.getItem('errorLogs') || '[]');
    }
    
    static clearErrorLogs() {
        localStorage.removeItem('errorLogs');
    }
}

// Initialize error handler
ErrorHandler.init();

// Export to window
window.ErrorHandler = ErrorHandler; 