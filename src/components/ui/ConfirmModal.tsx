import { Modal } from './Modal';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    variant?: 'danger' | 'info';
    confirmText?: string;
    cancelText?: string;
}

/**
 * ConfirmModal - Confirmation dialog for destructive or important actions
 * Supports danger (red) and info (blue) variants
 */
export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    variant = 'danger',
    confirmText,
    cancelText = 'Cancelar',
}: ConfirmModalProps) {
    const defaultConfirmText = variant === 'danger' ? 'Sí, Borrar' : 'Confirmar';
    const finalConfirmText = confirmText ?? defaultConfirmText;

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} variant={variant === 'danger' ? 'danger' : 'default'}>
            <div className="modal-header">
                <div className={`modal-icon modal-icon--${variant}`}>
                    {variant === 'danger' ? '⚠️' : 'ℹ️'}
                </div>
                <h2 className="modal-title">{title}</h2>
            </div>
            <div className="modal-body">
                <p className="modal-message">{message}</p>
            </div>
            <div className="modal-actions">
                <button
                    type="button"
                    className="modal-btn modal-btn--cancel"
                    onClick={onClose}
                >
                    {cancelText}
                </button>
                <button
                    type="button"
                    className={`modal-btn ${variant === 'danger' ? 'modal-btn--danger' : 'modal-btn--primary'}`}
                    onClick={handleConfirm}
                >
                    {finalConfirmText}
                </button>
            </div>
        </Modal>
    );
}

export default ConfirmModal;
