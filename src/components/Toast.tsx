import type { ToastState } from '../hooks/useToast';
import './Toast.css';

interface ToastProps extends ToastState {
    onClose: () => void;
}

/**
 * Toast notification component for visual feedback
 */
export function Toast({ message, type, isVisible, onClose }: ToastProps) {
    if (!isVisible) return null;

    const getIcon = () => {
        switch (type) {
            case 'success':
                return '✓';
            case 'error':
                return '✕';
            case 'info':
            default:
                return 'ℹ';
        }
    };

    return (
        <div className={`toast toast--${type} ${isVisible ? 'visible' : ''}`} role="alert">
            <span className="toast__icon">{getIcon()}</span>
            <span className="toast__message">{message}</span>
            <button className="toast__close" onClick={onClose} aria-label="Cerrar">
                ✕
            </button>
        </div>
    );
}

export default Toast;
