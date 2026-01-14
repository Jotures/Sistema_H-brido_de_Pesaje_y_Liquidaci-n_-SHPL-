import { useState, useEffect, useCallback } from 'react';
import { Modal } from './Modal';

interface InputModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (value: string) => void;
    title: string;
    initialValue?: string;
    inputType?: 'text' | 'number';
    placeholder?: string;
    confirmText?: string;
    cancelText?: string;
}

/**
 * InputModal - Input dialog for editing text or numbers
 * For numbers: triggers numeric keyboard on mobile with inputMode="decimal"
 */
export function InputModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    initialValue = '',
    inputType = 'text',
    placeholder = '',
    confirmText = 'Guardar',
    cancelText = 'Cancelar',
}: InputModalProps) {
    const [value, setValue] = useState(initialValue);

    // Reset value when modal opens with new initialValue
    useEffect(() => {
        if (isOpen) {
            setValue(initialValue);
        }
    }, [isOpen, initialValue]);

    const handleSubmit = useCallback(() => {
        const trimmed = value.trim();
        if (!trimmed) return;

        if (inputType === 'number') {
            const numVal = parseFloat(trimmed);
            if (isNaN(numVal) || numVal <= 0) return;
        }

        onConfirm(trimmed);
        onClose();
    }, [value, inputType, onConfirm, onClose]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    }, [handleSubmit]);

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="modal-header">
                <h2 className="modal-title">{title}</h2>
            </div>
            <div className="modal-body">
                <input
                    type={inputType}
                    className="modal-input"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    autoFocus
                    // Number input specifics for mobile numeric keyboard
                    {...(inputType === 'number' && {
                        inputMode: 'decimal' as const,
                        pattern: '[0-9]*\\.?[0-9]*',
                        step: 'any',
                        min: '0',
                    })}
                />
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
                    className="modal-btn modal-btn--primary"
                    onClick={handleSubmit}
                >
                    {confirmText}
                </button>
            </div>
        </Modal>
    );
}

export default InputModal;
