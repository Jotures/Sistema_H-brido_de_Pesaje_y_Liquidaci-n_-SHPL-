// Feature: Weighing Module (Pesaje)
// Exports all weighing-related components, hooks, and types

// Components
export { WeighingScreen } from './WeighingScreen';
export { BigDisplay } from './components/BigDisplay';
export { NumericKeypad } from './components/NumericKeypad';
export { BatchList } from './components/BatchList';
export { CategorySelector } from './components/CategorySelector';

// Hooks
export { useWeighingBatch } from './hooks/useWeighingBatch';

// Re-export domain types
export type { WeightEntry, Batch, Category } from '../../types/domain';
export { BATCH_SIZE, DEFAULT_CATEGORY, CATEGORY_COLORS } from '../../types/domain';
