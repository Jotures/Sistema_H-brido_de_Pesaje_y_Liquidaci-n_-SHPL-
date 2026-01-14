import { useState, useCallback } from 'react';
import { useSession } from '../../../context/SessionContext';
import type { OperationMode } from '../../../types/domain';
import { DEFAULT_ENTITY, WAREHOUSE_ENTITY } from '../../../types/domain';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';
import { InputModal } from '../../../components/ui/InputModal';
import './EntitySelector.css';

interface EntitySelectorProps {
    getEntityStats: (entityId: string) => { weight: number; entries: number };
    onEntityDeleted?: () => void;
}

/**
 * EntitySelector - Compact, collapsible header for entity/mode management
 * Mobile-first design: always shows current entity, expands on tap for full list
 * Supports renaming and deleting entities
 */
export function EntitySelector({ getEntityStats, onEntityDeleted }: EntitySelectorProps) {
    const {
        mode,
        entities,
        activeEntityId,
        activeEntity,
        setMode,
        addEntity,
        removeEntity,
        renameEntity,
        setActiveEntity,
    } = useSession();

    const [isExpanded, setIsExpanded] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [newEntityName, setNewEntityName] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Modal states for rename and delete
    const [isRenaming, setIsRenaming] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteMessage, setDeleteMessage] = useState('');

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

    // Edit entity handler - open input modal
    const handleEditEntity = useCallback(() => {
        if (!activeEntity) return;
        setIsRenaming(true);
    }, [activeEntity]);

    const handleRenameConfirm = useCallback((newName: string) => {
        if (!activeEntity) return;

        const success = renameEntity(activeEntity.id, newName);
        if (!success) {
            setError('Ya existe una entidad con ese nombre');
        } else {
            setError(null);
        }
        setIsRenaming(false);
    }, [activeEntity, renameEntity]);

    const handleRenameCancel = useCallback(() => {
        setIsRenaming(false);
    }, []);

    // Delete entity handler - open confirm modal
    const handleDeleteEntity = useCallback(() => {
        if (!activeEntity) return;

        // Don't allow deleting default entities
        if (activeEntity.id === DEFAULT_ENTITY.id || activeEntity.id === WAREHOUSE_ENTITY.id) {
            setError('No se puede eliminar la entidad por defecto');
            return;
        }

        // Don't allow if it's the only entity
        if (entities.length <= 1) {
            setError('Debe haber al menos una entidad');
            return;
        }

        const stats = getEntityStats(activeEntity.id);
        const hasData = stats.entries > 0;

        const message = hasData
            ? `¿Borrar a "${activeEntity.name}" y TODOS sus ${stats.entries} pesos registrados?`
            : `¿Eliminar a "${activeEntity.name}"?`;

        setDeleteMessage(message);
        setIsDeleting(true);
    }, [activeEntity, entities.length, getEntityStats]);

    const handleDeleteConfirm = useCallback(() => {
        if (!activeEntity) return;

        const success = removeEntity(activeEntity.id);
        if (success) {
            setError(null);
            onEntityDeleted?.();
        }
        setIsDeleting(false);
    }, [activeEntity, removeEntity, onEntityDeleted]);

    const handleDeleteCancel = useCallback(() => {
        setIsDeleting(false);
    }, []);

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

    // Check if active entity can be edited/deleted
    const canEditActiveEntity = activeEntity &&
        activeEntity.id !== DEFAULT_ENTITY.id &&
        activeEntity.id !== WAREHOUSE_ENTITY.id;

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

                    {/* Active Entity Actions */}
                    {canEditActiveEntity && (
                        <div className="entity-selector__actions">
                            <span className="entity-selector__actions-label">
                                Editar "{activeEntity?.name}":
                            </span>
                            <button
                                className="entity-action-btn entity-action-btn--edit"
                                onClick={handleEditEntity}
                                title="Renombrar"
                            >
                                ✏️ Renombrar
                            </button>
                            <button
                                className="entity-action-btn entity-action-btn--delete"
                                onClick={handleDeleteEntity}
                                title="Eliminar"
                            >
                                🗑️ Eliminar
                            </button>
                        </div>
                    )}

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

            {/* Rename Entity Modal */}
            <InputModal
                isOpen={isRenaming}
                onClose={handleRenameCancel}
                onConfirm={handleRenameConfirm}
                title={`Renombrar "${activeEntity?.name || ''}"`}
                initialValue={activeEntity?.name || ''}
                inputType="text"
                placeholder="Nuevo nombre"
            />

            {/* Delete Entity Modal */}
            <ConfirmModal
                isOpen={isDeleting}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title="Eliminar Entidad"
                message={deleteMessage}
                variant="danger"
            />
        </div>
    );
}

export default EntitySelector;

