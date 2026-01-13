import { useState, useCallback } from 'react';
import type { Category } from '../../../types/domain';
import './CategorySelector.css';

interface CategorySelectorProps {
    categories: Category[];
    activeCategoryId: string;
    onSelectCategory: (categoryId: string) => void;
    onAddCategory: (name: string) => Category | null;
    getCategoryStats: (categoryId: string) => { weight: number; entries: number; batches: number };
}

/**
 * CategorySelector - Horizontal chips for selecting product categories
 * Includes "+ Nuevo" button for adding new categories
 */
export function CategorySelector({
    categories,
    activeCategoryId,
    onSelectCategory,
    onAddCategory,
    getCategoryStats,
}: CategorySelectorProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [error, setError] = useState<string | null>(null);

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

    return (
        <div className="category-selector">
            <div className="category-selector__chips">
                {categories.map((category) => {
                    const isActive = category.id === activeCategoryId;
                    const stats = getCategoryStats(category.id);

                    return (
                        <button
                            key={category.id}
                            className={`category-chip ${isActive ? 'active' : ''}`}
                            onClick={() => onSelectCategory(category.id)}
                            style={{
                                '--chip-color': category.color || '#10b981',
                            } as React.CSSProperties}
                        >
                            <span className="category-chip__name">{category.name}</span>
                            {stats.entries > 0 && (
                                <span className="category-chip__badge">{stats.entries}</span>
                            )}
                        </button>
                    );
                })}

                {/* Add New Button / Form */}
                {isAdding ? (
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
                )}
            </div>

            {error && (
                <div className="category-selector__error">{error}</div>
            )}
        </div>
    );
}

export default CategorySelector;
