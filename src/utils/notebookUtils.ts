/**
 * Notebook Utility Functions
 * Transform flat batch data into a columnar grid structure for the notebook layout
 */

import type { Batch, Category } from '../types/domain';
import { BATCH_SIZE } from '../types/domain';
import { safeSum } from './math';

// ============================================
// Types
// ============================================

/**
 * Represents a single column in the notebook grid
 * Each column contains up to BATCH_SIZE (5) weights
 */
export interface NotebookColumn {
    batchId: string;
    categoryId: string;
    categoryName: string;
    categoryColor?: string;
    weights: (number | null)[];  // Array of weights (null for empty cells)
    subtotal: number;
    isFirstInCategory: boolean;  // True only for first column of each category
    isClosed: boolean;           // True if batch is complete
}

/**
 * Complete notebook data structure
 */
export interface NotebookData {
    columns: NotebookColumn[];
    categoryTotals: CategoryTotal[];
    grandTotal: number;
}

/**
 * Total weight per category
 */
export interface CategoryTotal {
    categoryId: string;
    categoryName: string;
    categoryColor?: string;
    totalWeight: number;
    batchCount: number;
}

// ============================================
// Main Transformation Function
// ============================================

/**
 * Transform batches by key into notebook column structure
 * Groups columns by category and marks first column of each category
 * 
 * @param batchesByKey - Record of entityId:categoryId -> Batch[]
 * @param entityId - Current entity ID to filter by
 * @param categories - List of all categories
 * @returns NotebookData with columns organized by category
 */
export function transformBatchesToNotebook(
    batchesByKey: Record<string, Batch[]>,
    entityId: string,
    categories: Category[]
): NotebookData {
    const columns: NotebookColumn[] = [];
    const categoryTotalsMap = new Map<string, CategoryTotal>();
    let grandTotal = 0;

    // Build a map of categories for quick lookup
    const categoryMap = new Map(categories.map(c => [c.id, c]));

    // Track which categories we've seen to mark first column
    const seenCategories = new Set<string>();

    // Process categories in order to group columns together
    for (const category of categories) {
        const key = `${entityId}:${category.id}`;
        const batches = batchesByKey[key] || [];

        // Skip categories with no data
        if (batches.length === 0) continue;

        // Filter out empty open batches (only show if they have weights)
        const filteredBatches = batches.filter(
            batch => batch.entries.length > 0 || batch.status === 'closed'
        );

        if (filteredBatches.length === 0) continue;

        // Initialize category total
        if (!categoryTotalsMap.has(category.id)) {
            categoryTotalsMap.set(category.id, {
                categoryId: category.id,
                categoryName: category.name,
                categoryColor: category.color,
                totalWeight: 0,
                batchCount: 0,
            });
        }

        // Process each batch as a column
        for (const batch of filteredBatches) {
            // Skip completely empty batches
            if (batch.entries.length === 0) continue;

            const categoryInfo = categoryMap.get(batch.categoryId);
            const isFirstInCategory = !seenCategories.has(batch.categoryId);

            if (isFirstInCategory) {
                seenCategories.add(batch.categoryId);
            }

            // Create weight array with nulls for empty slots
            const weights: (number | null)[] = [];
            for (let i = 0; i < BATCH_SIZE; i++) {
                weights.push(batch.entries[i]?.value ?? null);
            }

            // Calculate subtotal using safe math
            const subtotal = safeSum(batch.entries.map(e => e.value));

            columns.push({
                batchId: batch.id,
                categoryId: batch.categoryId,
                categoryName: categoryInfo?.name || 'Sin categoría',
                categoryColor: categoryInfo?.color,
                weights,
                subtotal,
                isFirstInCategory,
                isClosed: batch.status === 'closed',
            });

            // Update category totals
            const catTotal = categoryTotalsMap.get(batch.categoryId);
            if (catTotal) {
                catTotal.totalWeight += subtotal;
                if (batch.status === 'closed') {
                    catTotal.batchCount++;
                }
            }

            grandTotal += subtotal;
        }
    }

    return {
        columns,
        categoryTotals: Array.from(categoryTotalsMap.values()),
        grandTotal,
    };
}

// ============================================
// Helper Functions
// ============================================

/**
 * Format date as DD/MM/YY (like in the notebook)
 */
export function getFormattedDate(date: Date = new Date()): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
}

/**
 * Format number with thousands separator for display
 */
export function formatWeight(weight: number): string {
    return weight.toLocaleString('es-PE', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number): string {
    return amount.toLocaleString('es-PE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}
