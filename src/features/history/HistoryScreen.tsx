import { useMemo } from 'react';
import { useSession } from '../../context/SessionContext';
import { EntitySwitcher } from '../session/components/EntitySwitcher';
import { useWeighingBatch } from '../weighing/hooks/useWeighingBatch';
import { useSettlement } from '../settlement/hooks/useSettlement';
import {
    transformBatchesToNotebook,
    getFormattedDate,
    formatWeight,
    formatCurrency,
    type NotebookColumn
} from '../../utils/notebookUtils';
import './components/NotebookLayout.css';

/**
 * HistoryScreen - Notebook/Ledger style view of weighing data
 * Replicates the physical notebook layout with weights in columns of 5
 */
export function HistoryScreen() {
    const { activeEntityId, activeEntity } = useSession();
    const { categories, batchesByKey } = useWeighingBatch(activeEntityId);

    // Settlement calculations for the footer
    const { summary, hasData } = useSettlement({
        entityId: activeEntityId,
        entityName: activeEntity?.name || 'Sin selección',
        categories,
        batchesByKey,
    });

    // Transform batch data into notebook columns
    const notebookData = useMemo(() => {
        return transformBatchesToNotebook(batchesByKey, activeEntityId, categories);
    }, [batchesByKey, activeEntityId, categories]);

    // Format current date
    const formattedDate = getFormattedDate();

    return (
        <div className="notebook-container">
            {/* 1. SHEET HEADER */}
            <header className="notebook-header">
                <EntitySwitcher />
                <span className="notebook-date">{formattedDate}</span>
            </header>

            {/* 2. GRID BODY */}
            {!hasData ? (
                <div className="notebook-empty">
                    <span className="notebook-empty__icon">📓</span>
                    <h2>Cuaderno Vacío</h2>
                    <p>Registra pesos en la pantalla de Pesaje para verlos aquí.</p>
                </div>
            ) : (
                <>
                    <div className="notebook-body">
                        <div className="notebook-grid">
                            {notebookData.columns.map((column) => (
                                <NotebookColumnComponent
                                    key={column.batchId}
                                    column={column}
                                />
                            ))}
                        </div>
                    </div>

                    {/* 3. SETTLEMENT FOOTER */}
                    <footer className="notebook-footer">
                        <div className="notebook-summary">
                            {/* Quick Stats */}
                            <div className="notebook-stats">
                                <div className="notebook-stat">
                                    <span className="notebook-stat__label">Total Kgs</span>
                                    <span className="notebook-stat__value">
                                        {formatWeight(summary.totalWeight)}
                                    </span>
                                </div>
                                <div className="notebook-stat">
                                    <span className="notebook-stat__label">Categorías</span>
                                    <span className="notebook-stat__value">
                                        {summary.categoryBreakdown.length}
                                    </span>
                                </div>
                                <div className="notebook-stat">
                                    <span className="notebook-stat__label">Columnas</span>
                                    <span className="notebook-stat__value">
                                        {notebookData.columns.length}
                                    </span>
                                </div>
                            </div>

                            {/* Category calculation rows */}
                            {summary.categoryBreakdown.map((line) => (
                                <div key={line.categoryId} className="notebook-calc-row">
                                    <div className="notebook-calc-category">
                                        <span
                                            className="notebook-calc-category__dot"
                                            style={{ backgroundColor: line.categoryColor || '#3b82f6' }}
                                        />
                                        <span className="notebook-calc-category__name">
                                            {line.categoryName}
                                        </span>
                                    </div>
                                    <div className="notebook-calc-formula">
                                        <span>{formatWeight(line.totalWeight)}</span>
                                        <span>×</span>
                                        <span>{line.unitPrice.toFixed(2)}</span>
                                        <span>=</span>
                                    </div>
                                    <span className="notebook-calc-result">
                                        {formatCurrency(line.subtotal)}
                                    </span>
                                </div>
                            ))}

                            {/* Freight deduction */}
                            {summary.freightTotal > 0 && (
                                <div className="notebook-deduction">
                                    <span className="notebook-deduction__label">
                                        🚚 Flete
                                    </span>
                                    <span className="notebook-deduction__value">
                                        - {formatCurrency(summary.freightTotal)}
                                    </span>
                                </div>
                            )}

                            {/* Sack value (if any) */}
                            {summary.sackValue > 0 && (
                                <div className="notebook-calc-row">
                                    <span className="notebook-deduction__label">
                                        🧺 Sacos
                                    </span>
                                    <span className="notebook-calc-result" style={{ color: 'var(--success-color)' }}>
                                        + {formatCurrency(summary.sackValue)}
                                    </span>
                                </div>
                            )}

                            <div className="notebook-divider--double" />

                            {/* Final total */}
                            <div className="notebook-total">
                                <span className="notebook-total__label">A PAGAR</span>
                                <span className="notebook-total__amount">
                                    S/ {formatCurrency(summary.finalAmount)}
                                </span>
                            </div>
                        </div>
                    </footer>
                </>
            )}
        </div>
    );
}

/**
 * Individual column component (one batch = one column)
 */
interface NotebookColumnComponentProps {
    column: NotebookColumn;
}

function NotebookColumnComponent({ column }: NotebookColumnComponentProps) {
    const columnClasses = [
        'notebook-column',
        column.isFirstInCategory && 'notebook-column--category-start',
        !column.isClosed && 'notebook-column--open',
    ].filter(Boolean).join(' ');

    return (
        <div className="notebook-category-group">
            {/* Category header - only visible on first column of each category */}
            <div
                className={`notebook-category-header ${!column.isFirstInCategory ? 'notebook-category-header--empty' : ''}`}
                style={column.isFirstInCategory ? { borderBottomColor: column.categoryColor } : undefined}
            >
                {column.isFirstInCategory ? column.categoryName : '\u00A0'}
            </div>

            {/* Column with weight cells */}
            <div className={columnClasses}>
                <div className="notebook-cells">
                    {column.weights.map((weight, idx) => (
                        <div
                            key={idx}
                            className={`notebook-cell ${weight === null ? 'notebook-cell--empty' : ''}`}
                        >
                            {weight !== null ? weight : '—'}
                        </div>
                    ))}
                </div>

                {/* Subtotal */}
                <div className={`notebook-subtotal ${!column.isClosed ? 'notebook-subtotal--partial' : ''}`}>
                    {column.subtotal}
                </div>
            </div>
        </div>
    );
}

export default HistoryScreen;
