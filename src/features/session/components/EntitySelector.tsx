import { useState, useCallback } from 'react';
import { useSession } from '../../../context/SessionContext';
import type { OperationMode } from '../../../types/domain';
import './EntitySelector.css';

interface EntitySelectorProps {
    getEntityStats: (entityId: string) => { weight: number; entries: number };
}

/**
 * EntitySelector - Compact, collapsible header for entity/mode management
 * Mobile-first design: always shows current entity, expands on tap for full list
 */
export function EntitySelector({ getEntityStats }: EntitySelectorProps) {
    const {
        mode,
        entities,
        activeEntityId,
        activeEntity,
        setMode,
        addEntity,
        setActiveEntity,
    } = useSession();

    const [isExpanded, setIsExpanded] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [newEntityName, setNewEntityName] = useState('');
    const [error, setError] = useState<string | null>(null);

    // ============================================
    // Event Handlers
    // ============================================

    const handleModeChange = useCallback((newMode: OperationMode) => {
        setMode(newMode);
        setIsExpanded(false);
    }, [setMode]);

    const handleEntitySelect = useCallback((entityId: string) => {
        setActiveEntity(entityId);
        setIsExpanded(false);
    }, [setActiveEntity]);

    const handleToggleExpand = useCallback(() => {
        setIsExpanded(prev => !prev);
        if (isAdding) {
            setIsAdding(false);
            setNewEntityName('');
            setError(null);
        }
    }, [isAdding]);

    const handleStartAdd = useCallback(() => {
        setIsAdding(true);
        setNewEntityName('');
        setError(null);
    }, []);

    const handleCancelAdd = useCallback(() => {
        setIsAdding(false);
        setNewEntityName('');
        setError(null);
    }, []);

    const handleSubmitAdd = useCallback(() => {
        const trimmed = newEntityName.trim();
        if (!trimmed) {
            setError('Ingrese un nombre');
            return;
        }

        const result = addEntity(trimmed);
        if (result) {
            setIsAdding(false);
            setNewEntityName('');
            setError(null);
            setIsExpanded(false);
        } else {
            setError('Ya existe ese nombre');
        }
    }, [newEntityName, addEntity]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSubmitAdd();
        } else if (e.key === 'Escape') {
            handleCancelAdd();
        }
    }, [handleSubmitAdd, handleCancelAdd]);

    // ============================================
    // Render Helpers
    // ============================================

    const getModeLabel = (m: OperationMode) =>
        m === 'DESCARGA' ? '📦 Descarga' : '🚛 Transbordo';

    const getEntityLabel = () => {
        if (mode === 'DESCARGA') {
            return 'Dueño';
        }
        return 'Comprador';
    };

    const activeStats = activeEntity ? getEntityStats(activeEntity.id) : { entries: 0 };

    // ============================================
    // Render
    // ============================================

    return (
        <div className={`entity-selector ${isExpanded ? 'expanded' : ''}`}>
            {/* Compact Header Row - Always Visible */}
            <button
                className="entity-selector__header"
                onClick={handleToggleExpand}
                type="button"
            >
                <div className="entity-selector__mode-badge">
                    {getModeLabel(mode)}
                </div>
                <div className="entity-selector__active">
                    <span className="entity-selector__label">
                        {getEntityLabel()}:
                    </span>
                    <span className="entity-selector__name">
                        {activeEntity?.name || 'Sin selección'}
                    </span>
                    {activeStats.entries > 0 && (
                        <span className="entity-selector__badge">
                            {activeStats.entries}
                        </span>
                    )}
                </div>
                <span className={`entity-selector__arrow ${isExpanded ? 'up' : 'down'}`}>
                    ▼
                </span>
            </button>

            {/* Expanded Panel */}
            {isExpanded && (
                <div className="entity-selector__panel">
                    {/* Mode Switcher */}
                    <div className="entity-selector__modes">
                        <button
                            className={`mode-btn ${mode === 'DESCARGA' ? 'active' : ''}`}
                            onClick={() => handleModeChange('DESCARGA')}
                        >
                            📦 Descarga
                        </button>
                        <button
                            className={`mode-btn ${mode === 'TRANSBORDO' ? 'active' : ''}`}
                            onClick={() => handleModeChange('TRANSBORDO')}
                        >
                            🚛 Transbordo
                        </button>
                    </div>

                    {/* Entity List */}
                    <div className="entity-selector__list">
                        <div className="entity-selector__list-label">
                            {mode === 'DESCARGA' ? 'Dueños/Agricultores' : 'Compradores'}:
                        </div>
                        <div className="entity-selector__chips">
                            {entities.map((entity) => {
                                const isActive = entity.id === activeEntityId;
                                const stats = getEntityStats(entity.id);

                                return (
                                    <button
                                        key={entity.id}
                                        className={`entity-chip ${isActive ? 'active' : ''}`}
                                        onClick={() => handleEntitySelect(entity.id)}
                                    >
                                        <span className="entity-chip__name">
                                            {entity.name}
                                        </span>
                                        {stats.entries > 0 && (
                                            <span className="entity-chip__badge">
                                                {stats.entries}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}

                            {/* Add New Entity */}
                            {isAdding ? (
                                <div className="entity-add-form">
                                    <input
                                        type="text"
                                        className="entity-add-input"
                                        placeholder={mode === 'DESCARGA' ? 'Nombre del dueño' : 'Nombre del comprador'}
                                        value={newEntityName}
                                        onChange={(e) => setNewEntityName(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        autoFocus
                                        maxLength={30}
                                    />
                                    <button
                                        type="button"
                                        className="entity-add-btn entity-add-btn--confirm"
                                        onClick={handleSubmitAdd}
                                        aria-label="Confirmar"
                                    >
                                        ✓
                                    </button>
                                    <button
                                        type="button"
                                        className="entity-add-btn entity-add-btn--cancel"
                                        onClick={handleCancelAdd}
                                        aria-label="Cancelar"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ) : (
                                <button
                                    className="entity-chip entity-chip--add"
                                    onClick={handleStartAdd}
                                >
                                    <span className="entity-chip__icon">+</span>
                                    <span className="entity-chip__name">Agregar</span>
                                </button>
                            )}
                        </div>
                        {error && (
                            <div className="entity-selector__error">{error}</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default EntitySelector;
