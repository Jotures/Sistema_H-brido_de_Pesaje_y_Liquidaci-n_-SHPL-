import './BigDisplay.css';

interface BigDisplayProps {
    value: string;
    unit?: string;
    label?: string;
    lastBatchSubtotal?: number | null;
    lastWeight?: number | null;
    batchCount?: number;
    categoryColor?: string;
}

/**
 * BigDisplay - Industrial weight display component
 * Features high contrast, large monospace numbers for visibility
 * Shows last completed batch subtotal, last weight, and batch count
 */
export function BigDisplay({
    value,
    unit = 'kg',
    label = 'PESO',
    lastBatchSubtotal,
    lastWeight,
    batchCount = 0,
    categoryColor = '#10b981'
}: BigDisplayProps) {
    const displayValue = value || '0';

    return (
        <div className="big-display" style={{ '--category-color': categoryColor } as React.CSSProperties}>
            <span className="big-display__label">{label}</span>
            <div className="big-display__value-container">
                <span className="big-display__value">{displayValue}</span>
                <span className="big-display__unit">{unit}</span>
            </div>

            {/* Stats row: Last weight | Batch count | Last batch subtotal */}
            <div className="big-display__stats">
                {lastWeight !== null && lastWeight !== undefined && (
                    <div className="big-display__stat">
                        <span className="stat__label">Último:</span>
                        <span className="stat__value">{lastWeight} kg</span>
                    </div>
                )}
                {batchCount > 0 && (
                    <div className="big-display__stat">
                        <span className="stat__label">Lotes:</span>
                        <span className="stat__value stat__value--count">{batchCount}</span>
                    </div>
                )}
                {lastBatchSubtotal !== null && lastBatchSubtotal !== undefined && (
                    <div className="big-display__stat big-display__stat--subtotal">
                        <span className="stat__label">Últ. Lote:</span>
                        <span className="stat__value stat__value--subtotal">∑ {lastBatchSubtotal.toFixed(1)} kg</span>
                    </div>
                )}
            </div>
        </div>
    );
}

export default BigDisplay;


