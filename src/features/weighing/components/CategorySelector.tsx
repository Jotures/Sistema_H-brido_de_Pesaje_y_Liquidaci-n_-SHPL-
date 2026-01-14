import { useState, useCallback, useRef } from 'react';
import type { Category } from '../../../types/domain';
import './CategorySelector.css';

interface CategorySelectorProps {
    categories: Category[];
    activeCategoryId: string;
    onSelectCategory: (categoryId: string) => void;
    onAddCategory: (name: string) => Category | null;
    getCategoryStats: (categoryId: string) => { weight: number; entries: number; batches: number };
    onDeleteCategory?: (categoryId: string) => boolean;
    onRenameCategory?: (categoryId: string, newName: string) => boolean;
}

/**
 * CategorySelector - Horizontal chips for selecting product categories
 * Includes edit mode for renaming and deleting categories
 */
export function CategorySelector({
    categories,
    activeCategoryId,
    onSelectCategory,
    onAddCategory,
    getCategoryStats,
    onDeleteCategory,
    onRenameCategory,
}: CategorySelectorProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [renamingCategoryId, setRenamingCategoryId] = useState<string | null>(null);
    const [renameValue, setRenameValue] = useState('');

    // For double-click detection
    const lastClickRef = useRef<{ id: string; time: number } | null>(null);

    const handleAddClick = useCallback(() => {
        setIsAdding(true);
        setNewCategoryName('');
        setError(null);
    }, []);

    const handleCancel = useCallback(() => {
        setIsAdding(false);
        setNewCategoryName('');
        setError(null);
    }, []);

    const handleSubmit = useCallback(() => {
        const trimmed = newCategoryName.trim();
        if (!trimmed) {
            setError('Ingrese un nombre');
            return;
        }

        const result = onAddCategory(trimmed);
        if (result) {
            setIsAdding(false);
            setNewCategoryName('');
            setError(null);
        } else {
            setError('Ya existe esa categoría');
        }
    }, [newCategoryName, onAddCategory]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSubmit();
        } else if (e.key === 'Escape') {
            handleCancel();
        }
    }, [handleSubmit, handleCancel]);

    const handleDeleteCategory = useCallback((categoryId: string, categoryName: string, e: React.MouseEvent) => {
        e.stopPropagation();

        // Guardrail: Don't allow deleting if only one category remains
        if (categories.length <= 1) {
            setError('Debe haber al menos una categoría');
            return;
        }

        // Cascade delete warning
        if (window.confirm(`¿Borrar categoría "${categoryName}" y TODOS sus pesos registrados?`)) {
            onDeleteCategory?.(categoryId);
        }
    }, [categories.length, onDeleteCategory]);

    const handleCategoryClick = useCallback((categoryId: string) => {
        const now = Date.now();
        const lastClick = lastClickRef.current;

        // Double-click detection (within 300ms)
        if (
            isEditMode &&
            lastClick &&
            lastClick.id === categoryId &&
            now - lastClick.time < 300
        ) {
            // Start renaming
            const category = categories.find(c => c.id === categoryId);
            if (category) {
                setRenamingCategoryId(categoryId);
                setRenameValue(category.name);
            }
            lastClickRef.current = null;
            return;
        }

        lastClickRef.current = { id: categoryId, time: now };

        // Normal click - select category
        if (!isEditMode || renamingCategoryId !== categoryId) {
            onSelectCategory(categoryId);
        }
    }, [isEditMode, categories, onSelectCategory, renamingCategoryId]);

    const handleRenameConfirm = useCallback(() => {
        if (!renamingCategoryId) return;

        const trimmed = renameValue.trim();
        if (!trimmed) {
            setError('El nombre no puede estar vacío');
            return;
        }

        const success = onRenameCategory?.(renamingCategoryId, trimmed);
        if (success) {
            setRenamingCategoryId(null);
            setRenameValue('');
            setError(null);
        } else {
            setError('Ya existe una categoría con ese nombre');
        }
    }, [renamingCategoryId, renameValue, onRenameCategory]);

    const handleRenameCancel = useCallback(() => {
        setRenamingCategoryId(null);
        setRenameValue('');
        setError(null);
    }, []);

    const handleRenameKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleRenameConfirm();
        } else if (e.key === 'Escape') {
            handleRenameCancel();
        }
    }, [handleRenameConfirm, handleRenameCancel]);

    const toggleEditMode = useCallback(() => {
        setIsEditMode(prev => !prev);
        setRenamingCategoryId(null);
        setError(null);
    }, []);

    const canEdit = !!onRenameCategory || !!onDeleteCategory;

    return (
        <div className={`category-selector ${isEditMode ? 'category-selector--edit-mode' : ''}`}>
            <div className="category-selector__chips">
                {/* Edit Mode Toggle */}
                {canEdit && (
                    <button
                        className={`category-selector__edit-toggle ${isEditMode ? 'active' : ''}`}
                        onClick={toggleEditMode}
                        aria-label={isEditMode ? 'Salir de modo edición' : 'Modo edición'}
                        title={isEditMode ? 'Salir de edición' : 'Editar categorías'}
                    >
                        ⚙️
                    </button>
                )}

                {categories.map((category) => {
                    const isActive = category.id === activeCategoryId;
                    const stats = getCategoryStats(category.id);
                    const isRenaming = renamingCategoryId === category.id;
                    const canDelete = categories.length > 1 && isEditMode && onDeleteCategory;

                    return (
                        <div key={category.id} className="category-chip-wrapper">
                            {isRenaming ? (
                                <div className="category-rename-form">
                                    <input
                                        type="text"
                                        className="category-rename-input"
                                        value={renameValue}
                                        onChange={(e) => setRenameValue(e.target.value)}
                                        onKeyDown={handleRenameKeyDown}
                                        onBlur={handleRenameConfirm}
                                        autoFocus
                                        maxLength={20}
                                    />
                                </div>
                            ) : (
                                <button
                                    className={`category-chip ${isActive ? 'active' : ''} ${isEditMode ? 'category-chip--edit-mode' : ''}`}
                                    onClick={() => handleCategoryClick(category.id)}
                                    style={{
                                        '--chip-color': category.color || '#10b981',
                                    } as React.CSSProperties}
                                >
                                    <span className="category-chip__name">{category.name}</span>
                                    {stats.entries > 0 && (
                                        <span className="category-chip__badge">{stats.entries}</span>
                                    )}

                                    {/* Delete button in edit mode */}
                                    {canDelete && (
                                        <button
                                            className="category-chip__delete"
                                            onClick={(e) => handleDeleteCategory(category.id, category.name, e)}
                                            aria-label="Eliminar categoría"
                                            title="Eliminar"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </button>
                            )}
                        </div>
                    );
                })}

                {/* Add New Button / Form */}
                {!isEditMode && (
                    isAdding ? (
                        <div className="category-add-form">
                            <input
                                type="text"
                                className="category-add-input"
                                placeholder="Ej: Yungay"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                onKeyDown={handleKeyDown}
                                autoFocus
                                maxLength={20}
                            />
                            <button
                                type="button"
                                className="category-add-btn category-add-btn--confirm"
                                onClick={handleSubmit}
                                aria-label="Confirmar"
                            >
                                ✓
                            </button>
                            <button
                                type="button"
                                className="category-add-btn category-add-btn--cancel"
                                onClick={handleCancel}
                                aria-label="Cancelar"
                            >
                                ✕
                            </button>
                        </div>
                    ) : (
                        <button
                            className="category-chip category-chip--add"
                            onClick={handleAddClick}
                        >
                            <span className="category-chip__icon">+</span>
                            <span className="category-chip__name">Nueva</span>
                        </button>
                    )
                )}

                {/* Edit mode hint */}
                {isEditMode && (
                    <span className="category-selector__hint">
                        Doble click para renombrar
                    </span>
                )}
            </div>

            {error && (
                <div className="category-selector__error">{error}</div>
            )}
        </div>
    );
}

export default CategorySelector;

