// Weighing Module Types

/**
 * Individual weight entry
 */
export interface WeightEntry {
    id: string;
    value: number;
    timestamp: number;
}

/**
 * Batch of weight entries (group of 5)
 */
export interface Batch {
    id: string;
    entries: WeightEntry[];
    status: 'open' | 'closed';
    subtotal: number | null;
}

/**
 * Configuration for batch size
 */
export const BATCH_SIZE = 5;
