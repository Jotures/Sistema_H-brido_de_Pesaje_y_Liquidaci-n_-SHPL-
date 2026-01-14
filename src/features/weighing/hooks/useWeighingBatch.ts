import { useState, useCallback, useMemo, useEffect } from 'react';
import type { Batch, WeightEntry, Category } from '../../../types/domain';
import { BATCH_SIZE, DEFAULT_CATEGORY, CATEGORY_COLORS, generateId } from '../../../types/domain';

// ============================================
// localStorage Keys
// ============================================
const STORAGE_KEYS = {
    CATEGORIES: 'shpl_categories',
    BATCHES_PREFIX: 'shpl_batches_', // Suffix: entityId:categoryId
    ALL_BATCH_KEYS: 'shpl_batch_keys', // Track all batch keys for cleanup
} as const;

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

/**
 * Generate composite storage key for entity + category batches
 */
function getBatchStorageKey(entityId: string, categoryId: string): string {
    return `${STORAGE_KEYS.BATCHES_PREFIX}${entityId}:${categoryId}`;
}

/**
 * Create a new empty batch for an entity + category combination
 */
const createNewBatch = (entityId: string, categoryId: string): Batch => ({
    id: generateId(),
    entries: [],
    status: 'open',
    subtotal: null,
    categoryId,
    entityId,
});

/**
 * Calculate the sum of all entries in a batch
 */
const calculateSubtotal = (entries: WeightEntry[]): number => {
    return entries.reduce((sum, entry) => sum + entry.value, 0);
};

/**
 * Get next available color for new category
 */
const getNextColor = (existingCategories: Category[]): string => {
    const usedColors = existingCategories.map((c) => c.color);
    const availableColor = CATEGORY_COLORS.find((c) => !usedColors.includes(c));
    return availableColor || CATEGORY_COLORS[existingCategories.length % CATEGORY_COLORS.length];
};

// ============================================
// Hook Definition
// ============================================

/**
 * Custom hook for managing weighing batches across multiple entities and categories.
 * Data is segregated by entityId:categoryId composite key and persisted to localStorage.
 * 
 * @param activeEntityId - The currently selected entity ID (from SessionContext)
 */
export function useWeighingBatch(activeEntityId: string) {
    // ============================================
    // Categories State (shared across all entities)
    // ============================================
    const [categories, setCategories] = useState<Category[]>(() =>
        loadFromStorage(STORAGE_KEYS.CATEGORIES, [DEFAULT_CATEGORY])
    );

    // Active category ID
    const [activeCategoryId, setActiveCategoryId] = useState<string>(DEFAULT_CATEGORY.id);

    // ============================================
    // Batches State (per entity:category)
    // ============================================

    // Store batches indexed by composite key: entityId:categoryId
    const [batchesByKey, setBatchesByKey] = useState<Record<string, Batch[]>>(() => {
        // Load all known batch keys and their data
        const keys = loadFromStorage<string[]>(STORAGE_KEYS.ALL_BATCH_KEYS, []);
        const loaded: Record<string, Batch[]> = {};

        for (const key of keys) {
            const batches = loadFromStorage<Batch[]>(key, []);
            if (batches.length > 0) {
                // Extract the composite key from storage key (remove prefix)
                const compositeKey = key.replace(STORAGE_KEYS.BATCHES_PREFIX, '');
                loaded[compositeKey] = batches;
            }
        }

        return loaded;
    });

    // ============================================
    // Derived State
    // ============================================

    /**
     * Get the composite key for current entity + category
     */
    const currentKey = useMemo(() =>
        `${activeEntityId}:${activeCategoryId}`,
        [activeEntityId, activeCategoryId]
    );

    /**
     * Get batches for the current entity + category combination
     */
    const activeBatches = useMemo(() => {
        const batches = batchesByKey[currentKey];
        if (!batches || batches.length === 0) {
            return [createNewBatch(activeEntityId, activeCategoryId)];
        }
        return batches;
    }, [batchesByKey, currentKey, activeEntityId, activeCategoryId]);

    /**
     * Get the active category object
     */
    const activeCategory = useMemo(() => {
        return categories.find((c) => c.id === activeCategoryId) || DEFAULT_CATEGORY;
    }, [categories, activeCategoryId]);

    // ============================================
    // Persistence Effects
    // ============================================

    // Persist categories
    useEffect(() => {
        saveToStorage(STORAGE_KEYS.CATEGORIES, categories);
    }, [categories]);

    // Persist batches when they change
    useEffect(() => {
        // Save individual batch data
        const allKeys: string[] = [];

        Object.entries(batchesByKey).forEach(([compositeKey, batches]) => {
            const storageKey = getBatchStorageKey(
                compositeKey.split(':')[0],
                compositeKey.split(':')[1]
            );
            saveToStorage(storageKey, batches);
            allKeys.push(storageKey);
        });

        // Track all batch keys for loading on refresh
        saveToStorage(STORAGE_KEYS.ALL_BATCH_KEYS, allKeys);
    }, [batchesByKey]);

    // ============================================
    // Category Actions
    // ============================================

    /**
     * Add a new category
     */
    const addCategory = useCallback((name: string): Category | null => {
        const trimmedName = name.trim();
        if (!trimmedName) return null;

        // Check for duplicate names
        if (categories.some((c) => c.name.toLowerCase() === trimmedName.toLowerCase())) {
            return null;
        }

        const newCategory: Category = {
            id: generateId(),
            name: trimmedName,
            color: getNextColor(categories),
            createdAt: Date.now(),
        };

        setCategories((prev) => [...prev, newCategory]);

        // Auto-select the new category
        setActiveCategoryId(newCategory.id);

        return newCategory;
    }, [categories]);

    /**
     * Delete a category with cascade deletion of all associated weights
     * WARNING: This will delete ALL weights for this category across ALL entities
     */
    const deleteCategory = useCallback((categoryId: string): boolean => {
        // Don't allow deleting the default category
        if (categoryId === DEFAULT_CATEGORY.id) return false;

        // Don't allow deleting if it's the only category
        if (categories.length <= 1) return false;

        // Remove the category from the list
        setCategories((prev) => prev.filter((c) => c.id !== categoryId));

        // CASCADE DELETE: Remove all batch data for this category across ALL entities
        setBatchesByKey((prev) => {
            const updated = { ...prev };
            Object.keys(updated).forEach((key) => {
                const [, catId] = key.split(':');
                if (catId === categoryId) {
                    delete updated[key];
                }
            });
            return updated;
        });

        // If deleting active category, switch to default
        if (activeCategoryId === categoryId) {
            setActiveCategoryId(DEFAULT_CATEGORY.id);
        }

        return true;
    }, [categories.length, activeCategoryId]);

    /**
     * Rename an existing category
     */
    const renameCategory = useCallback((categoryId: string, newName: string): boolean => {
        const trimmedName = newName.trim();
        if (!trimmedName) return false;

        // Check for duplicate names (excluding current category)
        if (categories.some((c) => c.id !== categoryId && c.name.toLowerCase() === trimmedName.toLowerCase())) {
            return false;
        }

        setCategories((prev) =>
            prev.map((c) => (c.id === categoryId ? { ...c, name: trimmedName } : c))
        );

        return true;
    }, [categories]);

    /**
     * Switch to a different category
     */
    const switchCategory = useCallback((categoryId: string) => {
        if (categories.some((c) => c.id === categoryId)) {
            setActiveCategoryId(categoryId);
        }
    }, [categories]);

    // ============================================
    // Weight Actions
    // ============================================

    /**
     * Add a new weight to the current entity + category's batch
     */
    const addWeight = useCallback((value: number): boolean => {
        if (value <= 0) {
            console.warn('Invalid weight value:', value);
            return false;
        }

        setBatchesByKey((prev) => {
            const existingBatches = prev[currentKey] || [createNewBatch(activeEntityId, activeCategoryId)];

            const newEntry: WeightEntry = {
                id: generateId(),
                value,
                timestamp: Date.now(),
                categoryId: activeCategoryId,
                entityId: activeEntityId,
            };

            const lastBatchIndex = existingBatches.length - 1;
            const currentBatch = existingBatches[lastBatchIndex];

            // If current batch is closed, create new one
            if (currentBatch.status === 'closed') {
                const newBatch: Batch = {
                    ...createNewBatch(activeEntityId, activeCategoryId),
                    entries: [newEntry],
                };
                return {
                    ...prev,
                    [currentKey]: [...existingBatches, newBatch],
                };
            }

            // Add entry to current batch
            const updatedEntries = [...currentBatch.entries, newEntry];
            const isComplete = updatedEntries.length >= BATCH_SIZE;

            const updatedBatch: Batch = {
                ...currentBatch,
                entries: updatedEntries,
                status: isComplete ? 'closed' : 'open',
                subtotal: isComplete ? calculateSubtotal(updatedEntries) : null,
            };

            const updatedBatches = [
                ...existingBatches.slice(0, lastBatchIndex),
                updatedBatch,
            ];

            // If batch just closed, append new empty batch
            if (isComplete) {
                updatedBatches.push(createNewBatch(activeEntityId, activeCategoryId));
            }

            return {
                ...prev,
                [currentKey]: updatedBatches,
            };
        });

        return true;
    }, [currentKey, activeEntityId, activeCategoryId]);

    /**
     * Delete a specific weight entry and recalculate batch
     * - Reopens closed batches if they fall below BATCH_SIZE
     * - Removes empty batches (except the last one)
     */
    const deleteWeight = useCallback((entryId: string): boolean => {
        let found = false;

        setBatchesByKey((prev) => {
            const existingBatches = prev[currentKey];
            if (!existingBatches) return prev;

            const updatedBatches: Batch[] = [];

            for (const batch of existingBatches) {
                const entryIndex = batch.entries.findIndex((e) => e.id === entryId);

                if (entryIndex !== -1) {
                    found = true;
                    const updatedEntries = batch.entries.filter((e) => e.id !== entryId);

                    // If batch becomes empty, skip it (unless it's the only one)
                    if (updatedEntries.length === 0) {
                        // Keep at least one batch
                        if (updatedBatches.length === 0 && existingBatches.indexOf(batch) === existingBatches.length - 1) {
                            updatedBatches.push(createNewBatch(activeEntityId, activeCategoryId));
                        }
                        continue;
                    }

                    // Recalculate and possibly reopen the batch
                    const isComplete = updatedEntries.length >= BATCH_SIZE;
                    const updatedBatch: Batch = {
                        ...batch,
                        entries: updatedEntries,
                        status: isComplete ? 'closed' : 'open',
                        subtotal: isComplete ? calculateSubtotal(updatedEntries) : null,
                    };
                    updatedBatches.push(updatedBatch);
                } else {
                    updatedBatches.push(batch);
                }
            }

            // Ensure there's at least one batch
            if (updatedBatches.length === 0) {
                updatedBatches.push(createNewBatch(activeEntityId, activeCategoryId));
            }

            // Ensure the last batch is open for new entries
            const lastBatch = updatedBatches[updatedBatches.length - 1];
            if (lastBatch.status === 'closed') {
                updatedBatches.push(createNewBatch(activeEntityId, activeCategoryId));
            }

            return {
                ...prev,
                [currentKey]: updatedBatches,
            };
        });

        return found;
    }, [currentKey, activeEntityId, activeCategoryId]);

    /**
     * Update the value of an existing weight entry
     * - Validates that newValue > 0
     * - Recalculates batch subtotal if closed
     */
    const updateWeight = useCallback((entryId: string, newValue: number): boolean => {
        if (newValue <= 0) return false;

        let found = false;

        setBatchesByKey((prev) => {
            const existingBatches = prev[currentKey];
            if (!existingBatches) return prev;

            const updatedBatches = existingBatches.map((batch) => {
                const entryIndex = batch.entries.findIndex((e) => e.id === entryId);

                if (entryIndex !== -1) {
                    found = true;
                    const updatedEntries = batch.entries.map((e) =>
                        e.id === entryId ? { ...e, value: newValue } : e
                    );

                    return {
                        ...batch,
                        entries: updatedEntries,
                        subtotal: batch.status === 'closed' ? calculateSubtotal(updatedEntries) : null,
                    };
                }

                return batch;
            });

            return {
                ...prev,
                [currentKey]: updatedBatches,
            };
        });

        return found;
    }, [currentKey]);

    /**
     * Clear all batches for current entity + category
     */
    const clearActiveCategory = useCallback(() => {
        setBatchesByKey((prev) => ({
            ...prev,
            [currentKey]: [createNewBatch(activeEntityId, activeCategoryId)],
        }));
    }, [currentKey, activeEntityId, activeCategoryId]);

    // ============================================
    // Getters
    // ============================================

    /**
     * Get current open batch for active entity + category
     */
    const getCurrentBatch = useCallback((): Batch | null => {
        return activeBatches.find((b) => b.status === 'open') || null;
    }, [activeBatches]);

    /**
     * Get closed batches for active entity + category
     */
    const getClosedBatches = useCallback((): Batch[] => {
        return activeBatches.filter((b) => b.status === 'closed');
    }, [activeBatches]);

    /**
     * Get total weight for active entity + category
     */
    const getTotalWeight = useCallback((): number => {
        return activeBatches.reduce((total, batch) => {
            return total + batch.entries.reduce((sum, entry) => sum + entry.value, 0);
        }, 0);
    }, [activeBatches]);

    /**
     * Get total entry count for active entity + category
     */
    const getTotalEntries = useCallback((): number => {
        return activeBatches.reduce((count, batch) => count + batch.entries.length, 0);
    }, [activeBatches]);

    /**
     * Get stats for a specific category (current entity only)
     */
    const getCategoryStats = useCallback((categoryId: string): { weight: number; entries: number; batches: number } => {
        const key = `${activeEntityId}:${categoryId}`;
        const batches = batchesByKey[key] || [];
        return {
            weight: batches.reduce((total, batch) =>
                total + batch.entries.reduce((sum, entry) => sum + entry.value, 0), 0),
            entries: batches.reduce((count, batch) => count + batch.entries.length, 0),
            batches: batches.filter((b) => b.status === 'closed').length,
        };
    }, [batchesByKey, activeEntityId]);

    /**
     * Get grand total across all categories for current entity
     */
    const getGrandTotal = useCallback((): { weight: number; entries: number } => {
        let totalWeight = 0;
        let totalEntries = 0;

        Object.entries(batchesByKey).forEach(([key, batches]) => {
            const [entityId] = key.split(':');
            if (entityId === activeEntityId) {
                batches.forEach((batch) => {
                    batch.entries.forEach((entry) => {
                        totalWeight += entry.value;
                        totalEntries += 1;
                    });
                });
            }
        });

        return { weight: totalWeight, entries: totalEntries };
    }, [batchesByKey, activeEntityId]);

    /**
     * Get entity stats (total across all categories for an entity)
     */
    const getEntityStats = useCallback((entityId: string): { weight: number; entries: number } => {
        let totalWeight = 0;
        let totalEntries = 0;

        Object.entries(batchesByKey).forEach(([key, batches]) => {
            const [entId] = key.split(':');
            if (entId === entityId) {
                batches.forEach((batch) => {
                    batch.entries.forEach((entry) => {
                        totalWeight += entry.value;
                        totalEntries += 1;
                    });
                });
            }
        });

        return { weight: totalWeight, entries: totalEntries };
    }, [batchesByKey]);

    // ============================================
    // Return Value
    // ============================================

    return {
        // State
        categories,
        activeCategoryId,
        activeCategory,
        batches: activeBatches,
        batchesByKey,

        // Category actions
        addCategory,
        deleteCategory,
        renameCategory,
        switchCategory,

        // Weight actions
        addWeight,
        deleteWeight,
        updateWeight,
        clearActiveCategory,

        // Getters
        getCurrentBatch,
        getClosedBatches,
        getTotalWeight,
        getTotalEntries,
        getCategoryStats,
        getGrandTotal,
        getEntityStats,

        // Constants
        BATCH_SIZE,
    };
}

export default useWeighingBatch;
