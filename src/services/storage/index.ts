/**
 * Storage Service
 * Centralized localStorage management for SHPL application
 */

// ============================================
// All localStorage Keys Used by the App
// ============================================

/**
 * All storage keys used by the application
 * Organized by feature/context
 */
export const ALL_STORAGE_KEYS = {
    // Session Context
    SESSION_MODE: 'shpl_session_mode',
    ENTITIES_DESCARGA: 'shpl_entities_descarga',
    ENTITIES_TRANSBORDO: 'shpl_entities_transbordo',
    ACTIVE_ENTITY_DESCARGA: 'shpl_active_entity_descarga',
    ACTIVE_ENTITY_TRANSBORDO: 'shpl_active_entity_transbordo',

    // Weighing (useWeighingBatch)
    CATEGORIES: 'shpl_categories',
    ACTIVE_CATEGORY: 'shpl_active_category',
    ALL_BATCH_KEYS: 'shpl_batch_keys',

    // Settlement (prefix - multiple keys per entity)
    SETTLEMENT_PREFIX: 'shpl_settlement_',

    // Batches (prefix - multiple keys per entity:category)
    BATCHES_PREFIX: 'shpl_batches_',
} as const;

// ============================================
// Factory Reset Function
// ============================================

/**
 * Clears ALL application data from localStorage.
 * This resets the app to a "factory fresh" state.
 * WARNING: This action is irreversible!
 * 
 * @returns {number} Number of keys cleared
 */
export function factoryReset(): number {
    let keysCleared = 0;

    // Get all keys that match our app prefix
    const allKeys: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('shpl_')) {
            allKeys.push(key);
        }
    }

    // Clear all matching keys
    for (const key of allKeys) {
        localStorage.removeItem(key);
        keysCleared++;
    }

    console.log(`[SHPL] Factory reset complete. Cleared ${keysCleared} storage keys.`);

    return keysCleared;
}

/**
 * Get storage statistics
 * @returns Object with storage info
 */
export function getStorageStats(): {
    totalKeys: number;
    estimatedSize: string;
    keysByCategory: Record<string, number>;
} {
    let totalSize = 0;
    const keysByCategory: Record<string, number> = {
        session: 0,
        weighing: 0,
        settlement: 0,
        batches: 0,
        other: 0,
    };

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('shpl_')) {
            const value = localStorage.getItem(key) || '';
            totalSize += key.length + value.length;

            if (key.includes('session') || key.includes('entities') || key === 'shpl_session_mode') {
                keysByCategory.session++;
            } else if (key.includes('batch') || key.includes('categor')) {
                keysByCategory.weighing++;
            } else if (key.includes('settlement')) {
                keysByCategory.settlement++;
            } else {
                keysByCategory.other++;
            }
        }
    }

    // Calculate total SHPL keys
    let totalKeys = 0;
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('shpl_')) {
            totalKeys++;
        }
    }

    // Format size
    const sizeKB = totalSize / 1024;
    const estimatedSize = sizeKB < 1
        ? `${totalSize} bytes`
        : `${sizeKB.toFixed(2)} KB`;

    return {
        totalKeys,
        estimatedSize,
        keysByCategory,
    };
}

export default { factoryReset, getStorageStats, ALL_STORAGE_KEYS };
