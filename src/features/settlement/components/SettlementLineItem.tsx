import type { CategoryLine } from '../../../types/domain';

interface SettlementLineItemProps {
    line: CategoryLine;
    onPriceChange: (categoryId: string, price: number) => void;
}

/**
 * A row component for displaying a category's weight and price input
 */
export function SettlementLineItem({ line, onPriceChange }: SettlementLineItemProps) {
    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value) || 0;
        onPriceChange(line.categoryId, value);
    };

    return (
        <div className="settlement-line">
            {/* Category indicator and name */}
            <div className="settlement-line__category">
                <span
                    className="settlement-line__color"
                    style={{ backgroundColor: line.categoryColor || '#10b981' }}
                />
                <span className="settlement-line__name">{line.categoryName}</span>
            </div>

            {/* Weight display */}
            <div className="settlement-line__weight">
                <span className="settlement-line__value">{line.totalWeight.toFixed(0)}</span>
                <span className="settlement-line__unit">kg</span>
            </div>

            {/* Price input */}
            <div className="settlement-line__price">
                <span className="settlement-line__currency">S/</span>
                <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={line.unitPrice || ''}
                    onChange={handlePriceChange}
                    placeholder="0.00"
                    className="settlement-line__input"
                />
            </div>

            {/* Subtotal */}
            <div className="settlement-line__subtotal">
                <span className="settlement-line__currency">S/</span>
                <span className="settlement-line__total-value">
                    {line.subtotal.toFixed(2)}
                </span>
            </div>
        </div>
    );
}

export default SettlementLineItem;
