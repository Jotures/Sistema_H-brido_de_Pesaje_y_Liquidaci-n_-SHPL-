import { useState, useCallback } from 'react';

export interface ToastState {
    message: string;
    type: 'success' | 'error' | 'info';
    isVisible: boolean;
}

const TOAST_DURATION = 2500;

/**
 * Hook for managing toast notifications
 */
export function useToast() {
    const [toast, setToast] = useState<ToastState>({
        message: '',
        type: 'info',
        isVisible: false,
    });

    const showToast = useCallback((message: string, type: ToastState['type'] = 'info') => {
        setToast({ message, type, isVisible: true });

        // Auto-hide after duration
        setTimeout(() => {
            setToast((prev) => ({ ...prev, isVisible: false }));
        }, TOAST_DURATION);
    }, []);

    const hideToast = useCallback(() => {
        setToast((prev) => ({ ...prev, isVisible: false }));
    }, []);

    return { toast, showToast, hideToast };
}

export default useToast;
