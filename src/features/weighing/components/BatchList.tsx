import type { Batch } from '../../../types/domain';
import { BATCH_SIZE } from '../../../types/domain';
import './BatchList.css';

interface BatchListProps {
    batches: Batch[];
    totalWeight: number;
    totalEntries: number;
    categoryName?: string;
    categoryColor?: string;
    onDeleteWeight?: (id: string) => void;
    onUpdateWeight?: (id: string, value: number) => void;
}

/**
 * BatchList - Visual display of weight batches for a category
 * Shows closed batches with subtotals and open batch with progress
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
                            onDelete={onDeleteWeight}
                            onUpdate={onUpdateWeight}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

/**
 * Individual batch display component
 */
function BatchItem({
    batch,
    onDelete,
    onUpdate
}: {
    batch: Batch;
    onDelete?: (id: string) => void;
    onUpdate?: (id: string, val: number) => void;
}) {
    const isClosed = batch.status === 'closed';
    const entriesCount = batch.entries.length;
    const progress = `${entriesCount}/${BATCH_SIZE}`;

    // Don't render empty open batches (unless it's the only one, but parent handles that usually)
    // Actually parent handles "No entries" global state, but if we have closed batches + one empty open batch at end (reversed start),
    // we might want to hide it if we only want to show history. 
    // But usually we want to see the "active" batch.
    // Logic in original code: if (!isClosed && entriesCount === 0) return null;
    if (!isClosed && entriesCount === 0) {
        return null;
    }

    const handleEditClick = (id: string, currentValue: number) => {
        if (!onUpdate) return;
        const input = window.prompt('Ingrese el nuevo peso:', currentValue.toString());
        if (input !== null) {
            const numVal = parseFloat(input);
            if (!isNaN(numVal) && numVal > 0) {
                onUpdate(id, numVal);
            } else {
                alert('Valor inválido');
            }
        }
    };

    const handleDeleteClick = (id: string) => {
        if (!onDelete) return;
        if (window.confirm('¿Está seguro de eliminar este peso?')) {
            onDelete(id);
        }
    };

    return (
        <div className={`batch-item ${isClosed ? 'batch-item--closed' : 'batch-item--open'}`}>
            {/* Batch Header */}
            <div className="batch-item__header">
                <span className="batch-item__status">
                    {isClosed ? '✓ Lote Completo' : `⏳ En progreso ${progress}`}
                </span>
                {isClosed && batch.subtotal !== null && (
                    <span className="batch-item__subtotal">
                        ∑ {batch.subtotal.toFixed(1)} kg
                    </span>
                )}
            </div>

            {/* Weight Entries */}
            <div className="batch-item__entries">
                {batch.entries.map((entry, index) => (
                    <div key={entry.id} className="weight-entry group">
                        <span className="weight-entry__index">{index + 1}</span>
                        <span className="weight-entry__value">{entry.value}</span>
                        <span className="weight-entry__unit">kg</span>

                        {(onDelete || onUpdate) && (
                            <div className="weight-entry__actions">
                                {onUpdate && (
                                    <button
                                        className="action-btn action-btn--edit"
                                        onClick={() => handleEditClick(entry.id, entry.value)}
                                        title="Editar"
                                    >
                                        ✏️
                                    </button>
                                )}
                                {onDelete && (
                                    <button
                                        className="action-btn action-btn--delete"
                                        onClick={() => handleDeleteClick(entry.id)}
                                        title="Borrar"
                                    >
                                        🗑️
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                ))}

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

export default BatchList;
