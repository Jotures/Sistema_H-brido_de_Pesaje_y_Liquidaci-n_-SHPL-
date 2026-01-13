// Domain Types for SHPL Application

// ============================================
// Operation Mode Types
// ============================================

/**
 * Operation mode determines entity semantics
 * DESCARGA: Unloading from truck - entities are providers (dueños/agricultores)
 * TRANSBORDO: Transshipment - entities are clients (compradores)
 */
export type OperationMode = 'DESCARGA' | 'TRANSBORDO';

/**
 * Entity type based on operation mode
 */
export type EntityType = 'PROVIDER' | 'CLIENT' | 'WAREHOUSE';

/**
 * Entity represents an owner (DESCARGA) or buyer (TRANSBORDO)
 */
export interface Entity {
    id: string;
    name: string;
    type: EntityType;
    createdAt: number;
}

/**
 * Default warehouse entity for TRANSBORDO mode
 */
export const WAREHOUSE_ENTITY: Entity = {
    id: 'warehouse',
    name: 'ALMACÉN/SOBRANTE',
    type: 'WAREHOUSE',
    createdAt: 0,
};

/**
 * Default entity for DESCARGA mode (first provider)
 */
export const DEFAULT_ENTITY: Entity = {
    id: 'default-provider',
    name: 'Dueño Principal',
    type: 'PROVIDER',
    createdAt: 0,
};

// ============================================
// Category Types
// ============================================

/**
 * Product category (e.g., type of potato)
 */
export interface Category {
    id: string;
    name: string;
    color?: string; // Optional color for visual distinction
    createdAt: number;
}

// ============================================
// Weight Entry & Batch Types
// ============================================

/**
 * Individual weight entry
 */
export interface WeightEntry {
    id: string;
    value: number;
    timestamp: number;
    categoryId: string;
    entityId: string;
}

/**
 * Batch of weight entries (group of BATCH_SIZE)
 */
export interface Batch {
    id: string;
    entries: WeightEntry[];
    status: 'open' | 'closed';
    subtotal: number | null;
    categoryId: string;
    entityId: string;
}

/**
 * State for a single category's weighing session
 */
export interface CategoryWeighingState {
    categoryId: string;
    batches: Batch[];
}

/**
 * Configuration constants
 */
export const BATCH_SIZE = 5;

/**
 * Default category for new sessions
 */
export const DEFAULT_CATEGORY: Category = {
    id: 'default',
    name: 'Papa Blanca',
    color: '#10b981',
    createdAt: 0,
};

/**
 * Preset category colors for visual distinction
 */
export const CATEGORY_COLORS = [
    '#10b981', // Emerald (default)
    '#3b82f6', // Blue
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#8b5cf6', // Violet
    '#ec4899', // Pink
    '#14b8a6', // Teal
    '#f97316', // Orange
];

// ============================================
// Settlement Types
// ============================================

/**
 * Settlement input data (user-provided values)
 */
export interface SettlementData {
    prices: Record<string, number>;   // { 'categoryId': unitPrice }
    freightRate: number;              // Cost per Kg
    sackValue: number;                // Total sack payment
}

/**
 * Category line item for settlement breakdown
 */
export interface CategoryLine {
    categoryId: string;
    categoryName: string;
    categoryColor?: string;
    totalWeight: number;
    unitPrice: number;
    subtotal: number;
}

/**
 * Complete settlement calculation summary
 */
export interface SettlementSummary {
    categoryBreakdown: CategoryLine[];
    grossTotal: number;
    totalWeight: number;
    freightTotal: number;
    sackValue: number;
    finalAmount: number;
}

/**
 * Generate a unique ID
 */
export const generateId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};
