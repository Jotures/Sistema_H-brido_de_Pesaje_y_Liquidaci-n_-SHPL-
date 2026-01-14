import './BigDisplay.css';

interface BigDisplayProps {
    value: string;
    unit?: string;
    label?: string;
    lastBatchSubtotal?: number | null;
}

/**
 * BigDisplay - Industrial weight display component
 * Features high contrast, large monospace numbers for visibility
 * Now shows last completed batch subtotal
 */
export function BigDisplay({
    value,
    unit = 'kg',
    label = 'PESO',
    lastBatchSubtotal
}: BigDisplayProps) {
    const displayValue = value || '0';

    return (
        <div className="big-display">
            <span className="big-display__label">{label}</span>
            <div className="big-display__value-container">
                <span className="big-display__value">{displayValue}</span>
                <span className="big-display__unit">{unit}</span>
            </div>
            {lastBatchSubtotal !== null && lastBatchSubtotal !== undefined && (
                <div className="big-display__last-batch">
                    <span className="last-batch__label">Último lote:</span>
                    <span className="last-batch__value">∑ {lastBatchSubtotal.toFixed(1)} kg</span>
                </div>
            )}
        </div>
    );
}

export default BigDisplay;

