import { useState, useRef, useEffect, useCallback } from 'react';
import './ContextMenu.css';

export interface ContextMenuOption {
    id: string;
    icon: string;
    label: string;
    onClick: () => void;
    variant?: 'default' | 'danger';
}

interface ContextMenuProps {
    options: ContextMenuOption[];
    disabled?: boolean;
}

/**
 * ContextMenu - Floating menu triggered by a three-dot button
 * Mobile-friendly with large touch targets
 */
export function ContextMenu({ options, disabled = false }: ContextMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node) &&
                triggerRef.current &&
                !triggerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        // Close on escape key
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen]);

    const handleToggle = useCallback(() => {
        if (!disabled) {
            setIsOpen((prev) => !prev);
        }
    }, [disabled]);

    const handleOptionClick = useCallback((option: ContextMenuOption) => {
        option.onClick();
        setIsOpen(false);
    }, []);

    return (
        <div className="context-menu">
            {/* Three-dot trigger button */}
            <button
                ref={triggerRef}
                className={`context-menu__trigger ${isOpen ? 'context-menu__trigger--active' : ''}`}
                onClick={handleToggle}
                disabled={disabled}
                aria-label="Opciones"
                aria-expanded={isOpen}
                aria-haspopup="menu"
                type="button"
            >
                <span className="context-menu__dots">⋮</span>
            </button>

            {/* Floating menu */}
            {isOpen && (
                <div
                    ref={menuRef}
                    className="context-menu__popover"
                    role="menu"
                >
                    {options.map((option) => (
                        <button
                            key={option.id}
                            className={`context-menu__option ${option.variant === 'danger' ? 'context-menu__option--danger' : ''}`}
                            onClick={() => handleOptionClick(option)}
                            role="menuitem"
                            type="button"
                        >
                            <span className="context-menu__option-icon">{option.icon}</span>
                            <span className="context-menu__option-label">{option.label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ContextMenu;
