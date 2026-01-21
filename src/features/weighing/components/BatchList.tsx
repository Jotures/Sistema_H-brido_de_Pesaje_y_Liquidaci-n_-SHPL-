import { useState, useCallback, useMemo } from 'react';
import type { Batch, WeightEntry } from '../../../types/domain';
import { BATCH_SIZE } from '../../../types/domain';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';
import { ContextMenu, type ContextMenuOption } from '../../../components/ui/ContextMenu';
import './BatchList.css';

interface BatchListProps {
    batches: Batch[];
    totalWeight: number;
    totalEntries: number;
    categoryName?: string;
    categoryColor?: string;
    onDeleteWeight?: (entryId: string) => void;
    onUpdateWeight?: (entryId: string, newValue: number) => void;
}

/**
 * BatchList - Visual display of weight batches for a category
 * Shows closed batches with subtotals and open batch with progress
 * Supports inline editing and deletion of individual weights
 */
export function BatchList({
    batches,
    totalWeight,
    totalEntries,
    categoryName,
    categoryColor = '#10b981',
    onDeleteWeight,
    onUpdateWeight,
}: BatchListProps) {
    // Reverse to show most recent first
    const reversedBatches = [...batches].reverse();
    const closedBatchCount = batches.filter((b) => b.status === 'closed').length;

    // Editing state
    const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState<string>('');

    // Delete confirmation modal state
    const [deletingEntryId, setDeletingEntryId] = useState<string | null>(null);

    const handleEditStart = useCallback((entry: WeightEntry) => {
        setEditingEntryId(entry.id);
        setEditValue(entry.value.toString());
    }, []);

    const handleEditCancel = useCallback(() => {
        setEditingEntryId(null);
        setEditValue('');
    }, []);

    const handleEditConfirm = useCallback(() => {
        if (!editingEntryId) return;

        const numValue = parseFloat(editValue);
        if (isNaN(numValue) || numValue <= 0) {
            // Invalid value - show visual feedback but don't close
            return;
        }

        onUpdateWeight?.(editingEntryId, numValue);
        setEditingEntryId(null);
        setEditValue('');
    }, [editingEntryId, editValue, onUpdateWeight]);

    const handleDeleteClick = useCallback((entryId: string) => {
        setDeletingEntryId(entryId);
    }, []);

    const handleDeleteConfirm = useCallback(() => {
        if (deletingEntryId) {
            onDeleteWeight?.(deletingEntryId);
            setDeletingEntryId(null);
        }
    }, [deletingEntryId, onDeleteWeight]);

    const handleDeleteCancel = useCallback(() => {
        setDeletingEntryId(null);
    }, []);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleEditConfirm();
        } else if (e.key === 'Escape') {
            handleEditCancel();
        }
    }, [handleEditConfirm, handleEditCancel]);

    return (
        <div className="batch-list">
            {/* Category Header */}
            {categoryName && (
                <div
                    className="batch-list__category-header"
                    style={{ '--category-color': categoryColor } as React.CSSProperties}
                >
                    <span className="category-header__name">{categoryName}</span>
                </div>
            )}

            {/* Summary Header */}
            <div className="batch-list__summary">
                <div className="summary-stat">
                    <span className="summary-label">Total</span>
                    <span className="summary-value">{totalWeight.toFixed(1)} kg</span>
                </div>
                <div className="summary-stat">
                    <span className="summary-label">Registros</span>
                    <span className="summary-value">{totalEntries}</span>
                </div>
                <div className="summary-stat">
                    <span className="summary-label">Lotes</span>
                    <span className="summary-value">{closedBatchCount}</span>
                </div>
            </div>

            {/* Batch Items */}
            <div className="batch-list__items">
                {totalEntries === 0 ? (
                    <div className="batch-list__empty">
                        <span className="empty-icon">📦</span>
                        <span className="empty-text">No hay registros aún</span>
                        <span className="empty-hint">Ingrese pesos para ver el historial</span>
                    </div>
                ) : (
                    reversedBatches.map((batch) => (
                        <BatchItem
                            key={batch.id}
                            batch={batch}
                            editingEntryId={editingEntryId}
                            editValue={editValue}
                            onEditStart={handleEditStart}
                            onEditCancel={handleEditCancel}
                            onEditConfirm={handleEditConfirm}
                            onEditValueChange={setEditValue}
                            onDelete={handleDeleteClick}
                            onKeyDown={handleKeyDown}
                            canEdit={!!onUpdateWeight}
                            canDelete={!!onDeleteWeight}
                        />
                    ))
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={deletingEntryId !== null}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title="Eliminar Peso"
                message="¿Estás seguro de eliminar este peso? Esta acción no se puede deshacer."
                variant="danger"
            />
        </div>
    );
}

interface BatchItemProps {
    batch: Batch;
    editingEntryId: string | null;
    editValue: string;
    onEditStart: (entry: WeightEntry) => void;
    onEditCancel: () => void;
    onEditConfirm: () => void;
    onEditValueChange: (value: string) => void;
    onDelete: (entryId: string) => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
    canEdit: boolean;
    canDelete: boolean;
}

/**
 * Individual batch display component
 */
function BatchItem({
    batch,
    editingEntryId,
    editValue,
    onEditStart,
    onEditCancel,
    onEditConfirm,
    onEditValueChange,
    onDelete,
    onKeyDown,
    canEdit,
    canDelete,
}: BatchItemProps) {
    const isClosed = batch.status === 'closed';
    const entriesCount = batch.entries.length;
    const progress = `${entriesCount}/${BATCH_SIZE}`;

    // Don't render empty open batches
    if (!isClosed && entriesCount === 0) {
        return null;
    }

    // Calculate partial sum for open batches
    const partialSum = !isClosed && entriesCount > 0
        ? batch.entries.reduce((sum, e) => sum + e.value, 0)
        : null;

    return (
        <div className={`batch-item ${isClosed ? 'batch-item--closed' : 'batch-item--open'}`}>
            {/* Batch Header */}
            <div className="batch-item__header">
                <span className="batch-item__status">
                    {isClosed ? '✓ Lote Completo' : `⏳ En progreso ${progress}`}
                </span>
                {/* Subtotal for closed batches */}
                {isClosed && batch.subtotal !== null && (
                    <span className="batch-item__subtotal">
                        ∑ {batch.subtotal.toFixed(1)} kg
                    </span>
                )}
                {/* Partial sum for open batches */}
                {!isClosed && partialSum !== null && (
                    <span className="batch-item__subtotal batch-item__subtotal--partial">
                        ∑ {partialSum.toFixed(1)} kg
                    </span>
                )}
            </div>

            {/* Weight Entries */}
            <div className="batch-item__entries">
                {batch.entries.map((entry, index) => {
                    const isEditing = editingEntryId === entry.id;

                    return (
                        <div
                            key={entry.id}
                            className={`weight-entry ${isEditing ? 'weight-entry--editing' : ''}`}
                        >
                            <span className="weight-entry__index">{index + 1}</span>

                            {isEditing ? (
                                <input
                                    type="number"
                                    className="weight-entry__edit-input"
                                    value={editValue}
                                    onChange={(e) => onEditValueChange(e.target.value)}
                                    onKeyDown={onKeyDown}
                                    onBlur={onEditConfirm}
                                    autoFocus
                                    step="0.1"
                                    min="0.1"
                                />
                            ) : (
                                <div className="weight-entry__content">
                                    <span className="weight-entry__value">{entry.value}</span>
                                    <span className="weight-entry__unit">kg</span>
                                </div>
                            )}

                            {/* Context Menu for actions */}
                            {(canEdit || canDelete) && !isEditing && (
                                <WeightEntryMenu
                                    entry={entry}
                                    canEdit={canEdit}
                                    canDelete={canDelete}
                                    onEditStart={onEditStart}
                                    onDelete={onDelete}
                                />
                            )}

                            {/* Edit mode actions */}
                            {isEditing && (
                                <div className="weight-entry__edit-actions">
                                    <button
                                        className="edit-action-btn edit-action-btn--confirm"
                                        onClick={onEditConfirm}
                                        aria-label="Confirmar"
                                        type="button"
                                    >
                                        ✓
                                    </button>
                                    <button
                                        className="edit-action-btn edit-action-btn--cancel"
                                        onClick={onEditCancel}
                                        aria-label="Cancelar"
                                        type="button"
                                    >
                                        ✕
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Empty slots for open batch */}
                {!isClosed && Array.from({ length: BATCH_SIZE - entriesCount }).map((_, index) => (
                    <div key={`empty-${index}`} className="weight-entry weight-entry--empty">
                        <span className="weight-entry__index">{entriesCount + index + 1}</span>
                        <span className="weight-entry__placeholder">—</span>
                    </div>
                ))}
            </div>

            {/* Large Subtotal for closed batches */}
            {isClosed && batch.subtotal !== null && (
                <div className="batch-item__total-bar">
                    <span className="total-bar__label">SUBTOTAL LOTE</span>
                    <span className="total-bar__value">{batch.subtotal.toFixed(1)}</span>
                    <span className="total-bar__unit">kg</span>
                </div>
            )}
        </div>
    );
}

/**
 * WeightEntryMenu - Context menu for individual weight entries
 * Provides Edit and Delete options in a compact three-dot menu
 */
interface WeightEntryMenuProps {
    entry: WeightEntry;
    canEdit: boolean;
    canDelete: boolean;
    onEditStart: (entry: WeightEntry) => void;
    onDelete: (entryId: string) => void;
}

function WeightEntryMenu({
    entry,
    canEdit,
    canDelete,
    onEditStart,
    onDelete,
}: WeightEntryMenuProps) {
    const menuOptions = useMemo<ContextMenuOption[]>(() => {
        const options: ContextMenuOption[] = [];

        if (canEdit) {
            options.push({
                id: 'edit',
                icon: '✏️',
                label: 'Editar Peso',
                onClick: () => onEditStart(entry),
                variant: 'default',
            });
        }

        if (canDelete) {
            options.push({
                id: 'delete',
                icon: '🗑️',
                label: 'Eliminar Peso',
                onClick: () => onDelete(entry.id),
                variant: 'danger',
            });
        }

        return options;
    }, [canEdit, canDelete, entry, onEditStart, onDelete]);

    return <ContextMenu options={menuOptions} />;
}

export default BatchList;
