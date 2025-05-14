/**
 * Toast notification utility
 * Provides simple toast notifications for success, error, or info messages
 */

let toastContainer;

/**
 * Creates a toast notification
 * @param {string} message - The message to display
 * @param {string} type - The type of toast (success, error, info)
 * @param {number} duration - How long to show the toast in ms (default 3000)
 */
export function showToast(message, type = 'info', duration = 3000) {
    // Create container if it doesn't exist
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
        
        // Add styles if not already present
        if (!document.getElementById('toast-styles')) {
            const style = document.createElement('style');
            style.id = 'toast-styles';
            style.textContent = `
                .toast-container {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 10000;
                }
                .toast {
                    margin-bottom: 10px;
                    padding: 15px 20px;
                    border-radius: 4px;
                    color: white;
                    font-weight: bold;
                    opacity: 0;
                    transition: opacity 0.3s ease-in;
                    min-width: 200px;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                }
                .toast-success {
                    background-color: #28a745;
                }
                .toast-error {
                    background-color: #dc3545;
                }
                .toast-info {
                    background-color: #17a2b8;
                }
                .toast-show {
                    opacity: 1;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // Add to container
    toastContainer.appendChild(toast);
    
    // Show the toast (delay to trigger animation)
    setTimeout(() => {
        toast.classList.add('toast-show');
    }, 10);
    
    // Remove after duration
    setTimeout(() => {
        toast.classList.remove('toast-show');
        setTimeout(() => {
            toastContainer.removeChild(toast);
        }, 300); // Wait for opacity transition to complete
    }, duration);
} 