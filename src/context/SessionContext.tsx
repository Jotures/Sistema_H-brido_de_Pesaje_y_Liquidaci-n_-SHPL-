import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { OperationMode, Entity, EntityType } from '../types/domain';
import { WAREHOUSE_ENTITY, DEFAULT_ENTITY, generateId } from '../types/domain';

// ============================================
// localStorage Keys
// ============================================
const STORAGE_KEYS = {
    MODE: 'shpl_session_mode',
    ENTITIES_DESCARGA: 'shpl_entities_descarga',
    ENTITIES_TRANSBORDO: 'shpl_entities_transbordo',
    ACTIVE_ENTITY_DESCARGA: 'shpl_active_entity_descarga',
    ACTIVE_ENTITY_TRANSBORDO: 'shpl_active_entity_transbordo',
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

function getEntityTypeForMode(mode: OperationMode): EntityType {
    return mode === 'DESCARGA' ? 'PROVIDER' : 'CLIENT';
}

// ============================================
// Context Types
// ============================================

interface SessionContextValue {
    // State
    mode: OperationMode;
    entities: Entity[];
    activeEntityId: string;
    activeEntity: Entity | null;

    // Mode Actions
    setMode: (mode: OperationMode) => void;

    // Entity Actions
    addEntity: (name: string) => Entity | null;
    removeEntity: (id: string) => boolean;
    renameEntity: (id: string, newName: string) => boolean;
    setActiveEntity: (id: string) => void;

    // Helpers
    getTotalEntitiesWithData: () => number;
}

const SessionContext = createContext<SessionContextValue | null>(null);

// ============================================
// Provider Component
// ============================================

interface SessionProviderProps {
    children: ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
    // Load initial mode from storage
    const [mode, setModeState] = useState<OperationMode>(() =>
        loadFromStorage(STORAGE_KEYS.MODE, 'DESCARGA')
    );

    // Load entities for current mode
    const [entitiesByMode, setEntitiesByMode] = useState<Record<OperationMode, Entity[]>>(() => ({
        DESCARGA: loadFromStorage(STORAGE_KEYS.ENTITIES_DESCARGA, [DEFAULT_ENTITY]),
        TRANSBORDO: loadFromStorage(STORAGE_KEYS.ENTITIES_TRANSBORDO, [WAREHOUSE_ENTITY]),
    }));

    // Load active entity per mode
    const [activeEntityByMode, setActiveEntityByMode] = useState<Record<OperationMode, string>>(() => ({
        DESCARGA: loadFromStorage(STORAGE_KEYS.ACTIVE_ENTITY_DESCARGA, DEFAULT_ENTITY.id),
        TRANSBORDO: loadFromStorage(STORAGE_KEYS.ACTIVE_ENTITY_TRANSBORDO, WAREHOUSE_ENTITY.id),
    }));

    // Derived state for current mode
    const entities = entitiesByMode[mode];
    const activeEntityId = activeEntityByMode[mode];
    const activeEntity = entities.find(e => e.id === activeEntityId) || entities[0] || null;

    // ============================================
    // Persistence Effects
    // ============================================

    // Persist mode changes
    useEffect(() => {
        saveToStorage(STORAGE_KEYS.MODE, mode);
    }, [mode]);

    // Persist entities for DESCARGA
    useEffect(() => {
        saveToStorage(STORAGE_KEYS.ENTITIES_DESCARGA, entitiesByMode.DESCARGA);
    }, [entitiesByMode.DESCARGA]);

    // Persist entities for TRANSBORDO
    useEffect(() => {
        saveToStorage(STORAGE_KEYS.ENTITIES_TRANSBORDO, entitiesByMode.TRANSBORDO);
    }, [entitiesByMode.TRANSBORDO]);

    // Persist active entity for DESCARGA
    useEffect(() => {
        saveToStorage(STORAGE_KEYS.ACTIVE_ENTITY_DESCARGA, activeEntityByMode.DESCARGA);
    }, [activeEntityByMode.DESCARGA]);

    // Persist active entity for TRANSBORDO
    useEffect(() => {
        saveToStorage(STORAGE_KEYS.ACTIVE_ENTITY_TRANSBORDO, activeEntityByMode.TRANSBORDO);
    }, [activeEntityByMode.TRANSBORDO]);

    // ============================================
    // Mode Actions
    // ============================================

    const setMode = useCallback((newMode: OperationMode) => {
        // Simply switch modes - data is preserved per mode
        setModeState(newMode);
    }, []);

    // ============================================
    // Entity Actions
    // ============================================

    const addEntity = useCallback((name: string): Entity | null => {
        const trimmedName = name.trim();
        if (!trimmedName) return null;

        // Check for duplicate names in current mode
        if (entities.some(e => e.name.toLowerCase() === trimmedName.toLowerCase())) {
            return null;
        }

        const newEntity: Entity = {
            id: generateId(),
            name: trimmedName,
            type: getEntityTypeForMode(mode),
            createdAt: Date.now(),
        };

        setEntitiesByMode(prev => ({
            ...prev,
            [mode]: [...prev[mode], newEntity],
        }));

        // Auto-select the new entity
        setActiveEntityByMode(prev => ({
            ...prev,
            [mode]: newEntity.id,
        }));

        return newEntity;
    }, [mode, entities]);

    const removeEntity = useCallback((id: string): boolean => {
        // Don't allow removing default entities
        if (id === DEFAULT_ENTITY.id || id === WAREHOUSE_ENTITY.id) {
            return false;
        }

        const currentEntities = entitiesByMode[mode];
        if (currentEntities.length <= 1) {
            return false; // Must have at least one entity
        }

        setEntitiesByMode(prev => ({
            ...prev,
            [mode]: prev[mode].filter(e => e.id !== id),
        }));

        // If removing active entity, switch to first available
        if (activeEntityByMode[mode] === id) {
            const remaining = currentEntities.filter(e => e.id !== id);
            setActiveEntityByMode(prev => ({
                ...prev,
                [mode]: remaining[0]?.id || '',
            }));
        }

        return true;
    }, [mode, entitiesByMode, activeEntityByMode]);

    const setActiveEntity = useCallback((id: string) => {
        if (entities.some(e => e.id === id)) {
            setActiveEntityByMode(prev => ({
                ...prev,
                [mode]: id,
            }));
        }
    }, [mode, entities]);

    /**
     * Rename an existing entity
     */
    const renameEntity = useCallback((id: string, newName: string): boolean => {
        const trimmedName = newName.trim();
        if (!trimmedName) return false;

        // Check for duplicate names in current mode (excluding current entity)
        if (entities.some((e) => e.id !== id && e.name.toLowerCase() === trimmedName.toLowerCase())) {
            return false;
        }

        setEntitiesByMode((prev) => ({
            ...prev,
            [mode]: prev[mode].map((e) =>
                e.id === id ? { ...e, name: trimmedName } : e
            ),
        }));

        return true;
    }, [mode, entities]);

    // ============================================
    // Helpers
    // ============================================

    const getTotalEntitiesWithData = useCallback(() => {
        // This will be used to show how many entities have data
        // For now, return the count of non-default entities
        return entities.filter(e =>
            e.id !== DEFAULT_ENTITY.id && e.id !== WAREHOUSE_ENTITY.id
        ).length;
    }, [entities]);

    // ============================================
    // Context Value
    // ============================================

    const value: SessionContextValue = {
        mode,
        entities,
        activeEntityId: activeEntity?.id || '',
        activeEntity,
        setMode,
        addEntity,
        removeEntity,
        renameEntity,
        setActiveEntity,
        getTotalEntitiesWithData,
    };

    return (
        <SessionContext.Provider value={value}>
            {children}
        </SessionContext.Provider>
    );
}

// ============================================
// Hook
// ============================================

export function useSession(): SessionContextValue {
    const context = useContext(SessionContext);
    if (!context) {
        throw new Error('useSession must be used within a SessionProvider');
    }
    return context;
}

export default SessionContext;
