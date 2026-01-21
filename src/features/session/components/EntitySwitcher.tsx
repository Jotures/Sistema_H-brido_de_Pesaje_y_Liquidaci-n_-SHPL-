import { useState, useCallback } from 'react';
import { useSession } from '../../../context/SessionContext';
import { Modal } from '../../../components/ui/Modal';
import './EntitySwitcher.css';

/**
 * EntitySwitcher - Compact dropdown to quickly switch between entities
 * Shows current entity name with a chevron, opens modal with entity list on click
 * Used in HistoryScreen and SettlementScreen headers
 */
export function EntitySwitcher() {
    const {
        entities,
        activeEntityId,
        activeEntity,
        setActiveEntity,
        mode,
    } = useSession();

    const [isModalOpen, setIsModalOpen] = useState(false);

    // Open the entity selection modal
    const handleOpenModal = useCallback(() => {
        setIsModalOpen(true);
    }, []);

    // Close the modal
    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
    }, []);

    // Select an entity and close modal
    const handleSelectEntity = useCallback((entityId: string) => {
        setActiveEntity(entityId);
        setIsModalOpen(false);
    }, [setActiveEntity]);

    // Get entity type label based on mode
    const getEntityTypeLabel = () => {
        return mode === 'DESCARGA' ? 'Dueño/Agricultor' : 'Comprador';
    };

    return (
        <>
            {/* Switcher Button */}
            <button
                type="button"
                className="entity-switcher"
                onClick={handleOpenModal}
                aria-haspopup="listbox"
                aria-expanded={isModalOpen}
            >
                <span className="entity-switcher__name">
                    {activeEntity?.name || 'Sin selección'}
                </span>
                <span className={`entity-switcher__chevron ${isModalOpen ? 'open' : ''}`}>
                    ▼
                </span>
            </button>

            {/* Entity Selection Modal */}
            <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
                <div className="entity-switcher-modal">
                    <div className="modal-header">
                        <h2 className="modal-title">
                            Seleccionar {getEntityTypeLabel()}
                        </h2>
                    </div>

                    <div className="modal-body">
                        <div className="entity-switcher-list" role="listbox">
                            {entities.map((entity) => {
                                const isActive = entity.id === activeEntityId;

                                return (
                                    <button
                                        key={entity.id}
                                        type="button"
                                        role="option"
                                        aria-selected={isActive}
                                        className={`entity-switcher-item ${isActive ? 'active' : ''}`}
                                        onClick={() => handleSelectEntity(entity.id)}
                                    >
                                        <span className="entity-switcher-item__name">
                                            {entity.name}
                                        </span>
                                        {isActive && (
                                            <span className="entity-switcher-item__check">
                                                ✓
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button
                            type="button"
                            className="modal-btn modal-btn--cancel"
                            onClick={handleCloseModal}
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
}

export default EntitySwitcher;
