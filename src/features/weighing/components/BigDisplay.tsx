import './BigDisplay.css';

interface BigDisplayProps {
    value: string;
    unit?: string;
    label?: string;
}

/**
 * BigDisplay - Industrial weight display component
 * Features high contrast, large monospace numbers for visibility
 */
export function BigDisplay({ value, unit = 'kg', label = 'PESO' }: BigDisplayProps) {
    const displayValue = value || '0';

    return (
        <div className="big-display">
            <span className="big-display__label">{label}</span>
            <div className="big-display__value-container">
                <span className="big-display__value">{displayValue}</span>
                <span className="big-display__unit">{unit}</span>
            </div>
        </div>
    );
}

export default BigDisplay;
