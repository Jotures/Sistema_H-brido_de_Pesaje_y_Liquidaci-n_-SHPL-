import { useSession } from '../../context/SessionContext';
import { EntitySwitcher } from '../session/components/EntitySwitcher';
import { useWeighingBatch } from '../weighing/hooks/useWeighingBatch';
import { useSettlement } from './hooks/useSettlement';
import { SettlementLineItem } from './components/SettlementLineItem';
import './SettlementScreen.css';

/**
 * SettlementScreen - Main settlement/liquidation screen
 * Calculates final payment based on weights, prices, freight, and sack values
 */
export function SettlementScreen() {
    const { activeEntityId, activeEntity } = useSession();

    // Get weighing data (categories and batches)
    const { categories, batchesByKey } = useWeighingBatch(activeEntityId);

    // Settlement calculations
    const {
        summary,
        settlementData,
        setPrice,
        setFreightRate,
        setSackValue,
        hasData,
    } = useSettlement({
        entityId: activeEntityId,
        entityName: activeEntity?.name || 'Sin selección',
        categories,
        batchesByKey,
    });

    // Format current date
    const currentDate = new Date().toLocaleDateString('es-PE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    // Build formula string for display
    const formulaString = hasData
        ? `${summary.grossTotal.toFixed(0)} - ${summary.freightTotal.toFixed(0)} + ${summary.sackValue.toFixed(0)}`
        : '';

    return (
        <div className="settlement-screen">
            {/* Header */}
            <header className="settlement-header">
                <h1 className="settlement-header__title">
                    💰 Liquidando a: <EntitySwitcher />
                </h1>
                <p className="settlement-header__date">{currentDate}</p>
            </header>

            {/* Main Content */}
            <div className="settlement-content">
                {!hasData ? (
                    <div className="settlement-empty">
                        <span className="settlement-empty__icon">📦</span>
                        <h2>Sin datos de peso</h2>
                        <p>Registra pesos en la pantalla de Pesaje para poder liquidar.</p>
                    </div>
                ) : (
                    <>
                        {/* Income Section - Category Table */}
                        <section className="settlement-section">
                            <h2 className="settlement-section__title">
                                <span className="settlement-section__icon">📥</span>
                                Ingresos por Categoría
                            </h2>

                            {/* Table Header */}
                            <div className="settlement-table-header">
                                <span>Categoría</span>
                                <span>Peso</span>
                                <span>Precio/kg</span>
                                <span>Subtotal</span>
                            </div>

                            {/* Category Lines */}
                            <div className="settlement-lines">
                                {summary.categoryBreakdown.map((line) => (
                                    <SettlementLineItem
                                        key={line.categoryId}
                                        line={line}
                                        onPriceChange={setPrice}
                                    />
                                ))}
                            </div>

                            {/* Gross Total */}
                            <div className="settlement-subtotal">
                                <span>Subtotal Bruto</span>
                                <span className="settlement-subtotal__value">
                                    S/ {summary.grossTotal.toFixed(2)}
                                </span>
                            </div>
                        </section>

                        {/* Deductions Section */}
                        <section className="settlement-section settlement-section--deductions">
                            <h2 className="settlement-section__title">
                                <span className="settlement-section__icon">📤</span>
                                Ajustes
                            </h2>

                            {/* Freight Row */}
                            <div className="settlement-adjustment settlement-adjustment--deduction">
                                <div className="settlement-adjustment__info">
                                    <span className="settlement-adjustment__label">🚚 Flete</span>
                                    <span className="settlement-adjustment__detail">
                                        {summary.totalWeight.toFixed(0)} kg ×
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={settlementData.freightRate || ''}
                                            onChange={(e) => setFreightRate(parseFloat(e.target.value) || 0)}
                                            placeholder="0.00"
                                            className="settlement-adjustment__input"
                                        />
                                        /kg
                                    </span>
                                </div>
                                <span className="settlement-adjustment__value settlement-adjustment__value--negative">
                                    - S/ {summary.freightTotal.toFixed(2)}
                                </span>
                            </div>

                            {/* Sacks Row */}
                            <div className="settlement-adjustment settlement-adjustment--addition">
                                <div className="settlement-adjustment__info">
                                    <span className="settlement-adjustment__label">🧺 Pago por Sacos</span>
                                </div>
                                <div className="settlement-adjustment__input-group">
                                    <span className="settlement-adjustment__currency">+ S/</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={settlementData.sackValue || ''}
                                        onChange={(e) => setSackValue(parseFloat(e.target.value) || 0)}
                                        placeholder="0.00"
                                        className="settlement-adjustment__input settlement-adjustment__input--wide"
                                    />
                                </div>
                            </div>
                        </section>
                    </>
                )}
            </div>

            {/* Sticky Footer with Total */}
            {hasData && (
                <footer className="settlement-footer">
                    {/* Formula breakdown */}
                    <div className="settlement-formula">
                        {formulaString}
                    </div>

                    {/* Final Amount */}
                    <div className="settlement-total">
                        <span className="settlement-total__label">A PAGAR</span>
                        <span className="settlement-total__amount">
                            S/ {summary.finalAmount.toFixed(2)}
                        </span>
                    </div>

                    {/* Action Button */}
                    <button className="settlement-submit">
                        ✅ Guardar y Cerrar
                    </button>
                </footer>
            )}
        </div>
    );
}

export default SettlementScreen;
