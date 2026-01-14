import { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import './Modal.css';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    closeOnBackdrop?: boolean;
    variant?: 'default' | 'danger';
}

/**
 * Modal - Base modal component with backdrop and animations
 * Renders via portal to ensure proper z-index stacking
 */
export function Modal({
    isOpen,
    onClose,
    children,
    closeOnBackdrop = true,
    variant = 'default',
}: ModalProps) {
    // Handle ESC key to close
    useEffect(() => {
        if (!isOpen) return;

        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEsc);
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    const handleBackdropClick = useCallback((e: React.MouseEvent) => {
        if (e.target === e.currentTarget && closeOnBackdrop) {
            onClose();
        }
    }, [closeOnBackdrop, onClose]);

    if (!isOpen) return null;

    return createPortal(
        <div
            className="modal-backdrop"
            onClick={handleBackdropClick}
            role="dialog"
            aria-modal="true"
        >
            <div className={`modal-container ${variant === 'danger' ? 'modal-container--danger' : ''}`}>
                {children}
            </div>
        </div>,
        document.body
    );
}

export default Modal;
