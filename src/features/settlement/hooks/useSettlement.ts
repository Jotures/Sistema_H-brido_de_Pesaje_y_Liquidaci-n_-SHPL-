import { useState, useCallback, useMemo, useEffect } from 'react';
import type { Category, Batch, SettlementData, SettlementSummary, CategoryLine } from '../../../types/domain';
import { safeAdd, safeSub, safeMult, roundToTwo, safeSum } from '../../../utils/math';

// ============================================
// localStorage Keys
// ============================================
const STORAGE_KEY_PREFIX = 'shpl_settlement_';

// ============================================
// Helper Functions
// ============================================

function loadFromStorage<T>(key: string, defaultValue: T): T {
    try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : defaultValue;
    } catch {
        return defaultValue;
    }
}

function saveToStorage<T>(key: string, value: T): void {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

// NOTE: roundToTwo is now imported from '../../../utils/math'

// ============================================
// Hook Definition
// ============================================

interface UseSettlementParams {
    entityId: string;
    entityName: string;
    categories: Category[];
    batchesByKey: Record<string, Batch[]>;
}

/**
 * Custom hook for settlement calculations.
 * Aggregates weights by category, calculates subtotals, freight, and final payment.
 */
export function useSettlement({
    entityId,
    entityName,
    categories,
    batchesByKey,
}: UseSettlementParams) {
    const storageKey = `${STORAGE_KEY_PREFIX}${entityId}`;

    // ============================================
    // State - Settlement Input Data
    // ============================================
    const [settlementData, setSettlementData] = useState<SettlementData>(() =>
        loadFromStorage(storageKey, {
            prices: {},
            freightRate: 0,
            sackValue: 0,
        })
    );

    // ============================================
    // Persistence
    // ============================================
    useEffect(() => {
        saveToStorage(storageKey, settlementData);
    }, [settlementData, storageKey]);

    // ============================================
    // Aggregate Weights by Category
    // ============================================
    const weightsByCategory = useMemo(() => {
        const weights: Record<string, number> = {};

        Object.entries(batchesByKey).forEach(([key, batches]) => {
            const [entId, catId] = key.split(':');
            if (entId === entityId) {
                // Use safe math for all weight calculations
                const categoryWeight = batches.reduce((total, batch) => {
                    const batchWeight = safeSum(batch.entries.map(e => e.value));
                    return safeAdd(total, batchWeight);
                }, 0);
                weights[catId] = safeAdd(weights[catId] || 0, categoryWeight);
            }
        });

        return weights;
    }, [batchesByKey, entityId]);

    // ============================================
    // Calculate Settlement Summary
    // ============================================
    const summary: SettlementSummary = useMemo(() => {
        const categoryBreakdown: CategoryLine[] = [];
        let grossTotal = 0;
        let totalWeight = 0;

        // Build category breakdown using safe math
        categories.forEach((category) => {
            const weight = weightsByCategory[category.id] || 0;
            if (weight > 0) {
                const unitPrice = settlementData.prices[category.id] || 0;
                // SubtotalCategoria = safeMult(PesoCategoria, PrecioCategoria)
                const subtotal = safeMult(weight, unitPrice);

                categoryBreakdown.push({
                    categoryId: category.id,
                    categoryName: category.name,
                    categoryColor: category.color,
                    totalWeight: weight,
                    unitPrice,
                    subtotal: roundToTwo(subtotal),
                });

                grossTotal = safeAdd(grossTotal, subtotal);
                totalWeight = safeAdd(totalWeight, weight);
            }
        });

        // FleteTotal = safeMult(TotalPeso, TasaFlete)
        const freightTotal = safeMult(totalWeight, settlementData.freightRate);

        // GranTotal = (SumaSubtotales - FleteTotal) + ValorSacos
        const finalAmount = roundToTwo(safeAdd(safeSub(grossTotal, freightTotal), settlementData.sackValue));

        return {
            categoryBreakdown,
            grossTotal: roundToTwo(grossTotal),
            totalWeight,
            freightTotal,
            sackValue: settlementData.sackValue,
            finalAmount,
        };
    }, [categories, weightsByCategory, settlementData]);

    // ============================================
    // Actions
    // ============================================

    /**
     * Update price for a specific category
     */
    const setPrice = useCallback((categoryId: string, price: number) => {
        // Prevent negative prices
        const sanitizedPrice = Math.max(0, price);
        setSettlementData((prev) => ({
            ...prev,
            prices: {
                ...prev.prices,
                [categoryId]: sanitizedPrice,
            },
        }));
    }, []);

    /**
     * Update freight rate
     */
    const setFreightRate = useCallback((rate: number) => {
        // Prevent negative rates
        const sanitizedRate = Math.max(0, rate);
        setSettlementData((prev) => ({
            ...prev,
            freightRate: sanitizedRate,
        }));
    }, []);

    /**
     * Update sack value
     */
    const setSackValue = useCallback((value: number) => {
        // Prevent negative values
        const sanitizedValue = Math.max(0, value);
        setSettlementData((prev) => ({
            ...prev,
            sackValue: sanitizedValue,
        }));
    }, []);

    /**
     * Get price for a category
     */
    const getPrice = useCallback((categoryId: string): number => {
        return settlementData.prices[categoryId] || 0;
    }, [settlementData.prices]);

    /**
     * Reset all settlement data for this entity
     */
    const resetSettlement = useCallback(() => {
        setSettlementData({
            prices: {},
            freightRate: 0,
            sackValue: 0,
        });
    }, []);

    // ============================================
    // Return Value
    // ============================================

    return {
        // State
        entityName,
        settlementData,
        summary,

        // Actions
        setPrice,
        setFreightRate,
        setSackValue,
        getPrice,
        resetSettlement,

        // Helpers
        hasData: summary.totalWeight > 0,
    };
}

export default useSettlement;
