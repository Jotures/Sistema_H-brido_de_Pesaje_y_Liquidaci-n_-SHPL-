import { useState, useCallback } from 'react';
import { BigDisplay } from './components/BigDisplay';
import { NumericKeypad } from './components/NumericKeypad';
import { BatchList } from './components/BatchList';
import { CategorySelector } from './components/CategorySelector';
import { EntitySelector } from '../session/components/EntitySelector';
import { useSession } from '../../context/SessionContext';
import { useWeighingBatch } from './hooks/useWeighingBatch';
import './WeighingScreen.css';

type ViewMode = 'input' | 'history';

interface WeighingScreenProps {
    onWeightSubmit?: (weight: number, categoryId: string, entityId: string) => void;
}

/**
 * WeighingScreen - Main container for weight input
 * Supports multiple entities (owners/buyers) and product categories
 * with independent batch tracking per entity:category combination
 */
export function WeighingScreen({ onWeightSubmit }: WeighingScreenProps) {
    const [inputValue, setInputValue] = useState<string>('');
    const [viewMode, setViewMode] = useState<ViewMode>('input');

    // Get session context (entity management)
    const { activeEntityId, activeEntity, mode } = useSession();

    // Weighing batch hook now depends on activeEntityId
    const {
        categories,
        activeCategoryId,
        activeCategory,
        batches,
        addCategory,
        switchCategory,
        addWeight,
        deleteWeight,
        updateWeight,
        getCurrentBatch,
        getTotalWeight,
        getTotalEntries,
        getCategoryStats,
        getGrandTotal,
        getEntityStats,
        BATCH_SIZE,
    } = useWeighingBatch(activeEntityId);

    const currentBatch = getCurrentBatch();
    const currentProgress = currentBatch ? currentBatch.entries.length : 0;
    const grandTotal = getGrandTotal();

    const handleDigit = useCallback((digit: string) => {
        setInputValue((prev) => {
            if (digit === '.' && prev.includes('.')) return prev;
            if (prev.replace('.', '').length >= 7) return prev;
            if (prev === '0' && digit !== '.') return digit;
            return prev + digit;
        });
    }, []);

    const handleClear = useCallback(() => {
        setInputValue('');
    }, []);

    const handleBackspace = useCallback(() => {
        setInputValue((prev) => prev.slice(0, -1));
    }, []);

    const handleSubmit = useCallback(() => {
        const numericValue = parseFloat(inputValue);
        if (!isNaN(numericValue) && numericValue > 0) {
            const success = addWeight(numericValue);
            if (success) {
                onWeightSubmit?.(numericValue, activeCategoryId, activeEntityId);
                setInputValue('');
            }
        }
    }, [inputValue, addWeight, activeCategoryId, activeEntityId, onWeightSubmit]);

    const toggleView = useCallback(() => {
        setViewMode((prev) => (prev === 'input' ? 'history' : 'input'));
    }, []);

    // Get context label for display
    const getModeVerb = () => mode === 'DESCARGA' ? 'Recibiendo de' : 'Enviando a';

    return (
        <div className="weighing-screen">
            {/* Entity Selector (Collapsible) */}
            <EntitySelector getEntityStats={getEntityStats} />

            {/* View Toggle Tabs */}
            <div className="weighing-screen__tabs">
                <button
                    className={`tab-btn ${viewMode === 'input' ? 'active' : ''}`}
                    onClick={() => setViewMode('input')}
                >
                    ⚖️ Ingresar
                </button>
                <button
                    className={`tab-btn ${viewMode === 'history' ? 'active' : ''}`}
                    onClick={() => setViewMode('history')}
                >
                    📋 Historial ({grandTotal.entries})
                </button>
            </div>

            {/* Category Selector - Always Visible (Priority) */}
            <CategorySelector
                categories={categories}
                activeCategoryId={activeCategoryId}
                onSelectCategory={switchCategory}
                onAddCategory={addCategory}
                getCategoryStats={getCategoryStats}
            />

            {viewMode === 'input' ? (
                <>
                    {/* Display Area */}
                    <div className="weighing-screen__display">
                        <BigDisplay
                            value={inputValue}
                            label={`${activeCategory.name} - ${currentProgress + 1}/${BATCH_SIZE}`}
                        />
                    </div>

                    {/* Progress Indicator */}
                    <div
                        className="weighing-screen__progress"
                        style={{ '--progress-color': activeCategory.color || '#10b981' } as React.CSSProperties}
                    >
                        <div className="progress-bar">
                            {Array.from({ length: BATCH_SIZE }).map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`progress-dot ${idx < currentProgress ? 'filled' : ''} ${idx === currentProgress ? 'current' : ''}`}
                                />
                            ))}
                        </div>
                        <span className="progress-text">
                            {currentProgress === 0
                                ? `${getModeVerb()}: ${activeEntity?.name || 'Sin selección'}`
                                : `${BATCH_SIZE - currentProgress} restantes para cerrar lote`}
                        </span>
                    </div>

                    {/* Keypad Area */}
                    <div className="weighing-screen__keypad">
                        <NumericKeypad
                            onDigit={handleDigit}
                            onClear={handleClear}
                            onBackspace={handleBackspace}
                            onSubmit={handleSubmit}
                        />
                    </div>
                </>
            ) : (
                /* History View */
                <div className="weighing-screen__history">
                    <BatchList
                        batches={batches}
                        totalWeight={getTotalWeight()}
                        totalEntries={getTotalEntries()}
                        categoryName={activeCategory.name}
                        categoryColor={activeCategory.color}
                        onDeleteWeight={deleteWeight}
                        onUpdateWeight={updateWeight}
                    />
                </div>
            )}

            {/* Quick Stats Footer (visible in input mode) */}
            {viewMode === 'input' && getTotalEntries() > 0 && (
                <button className="weighing-screen__quick-stats" onClick={toggleView}>
                    <span>{activeCategory.name}: {getTotalWeight().toFixed(1)} kg</span>
                    <span>•</span>
                    <span>{getTotalEntries()} registros</span>
                    <span className="quick-stats__arrow">→</span>
                </button>
            )}
        </div>
    );
}

export default WeighingScreen;
