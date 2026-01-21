import { useState, useCallback } from 'react';
import { SessionProvider } from './context/SessionContext';
import { WeighingScreen } from './features/weighing';
import { SettlementScreen } from './features/settlement';
import { HistoryScreen } from './features/history';
import { ConfirmModal } from './components/ui/ConfirmModal';
import { factoryReset, getStorageStats } from './services/storage';
import './App.css';

type AppView = 'weighing' | 'records' | 'settlement' | 'settings';

function App() {
  const [currentView, setCurrentView] = useState<AppView>('weighing');
  const [weightRecords, setWeightRecords] = useState<Array<{ weight: number; categoryId: string; entityId: string }>>([]);

  // Factory reset modal state
  const [showResetModal, setShowResetModal] = useState(false);

  const handleWeightSubmit = (weight: number, categoryId: string, entityId: string) => {
    setWeightRecords((prev) => [...prev, { weight, categoryId, entityId }]);
    console.log('Peso registrado:', weight, 'kg', 'Categoría:', categoryId, 'Entidad:', entityId);
    console.log('Total registros:', weightRecords.length + 1);
  };

  // Factory Reset Handler
  const handleFactoryReset = useCallback(() => {
    factoryReset();
    // Reload the page to reset all React state
    window.location.reload();
  }, []);

  // Settings View Component
  const SettingsView = () => {
    const stats = getStorageStats();

    return (
      <div className="settings-screen">
        <h2 className="settings-title">⚙️ Ajustes</h2>

        {/* Storage Info Section */}
        <section className="settings-section">
          <h3 className="settings-section-title">📊 Información de Datos</h3>
          <div className="settings-info-grid">
            <div className="settings-info-item">
              <span className="settings-info-label">Registros guardados:</span>
              <span className="settings-info-value">{stats.totalKeys}</span>
            </div>
            <div className="settings-info-item">
              <span className="settings-info-label">Espacio usado:</span>
              <span className="settings-info-value">{stats.estimatedSize}</span>
            </div>
          </div>
        </section>

        {/* Danger Zone Section */}
        <section className="settings-section settings-section--danger">
          <h3 className="settings-section-title">⚠️ Zona de Peligro</h3>
          <div className="settings-danger-zone">
            <div className="settings-danger-info">
              <h4>Restablecer de Fábrica</h4>
              <p>
                Esta acción eliminará <strong>TODOS</strong> los datos guardados:
                pesajes, categorías, entidades, liquidaciones y configuraciones.
                La aplicación quedará como nueva.
              </p>
            </div>
            <button
              className="settings-reset-btn"
              onClick={() => setShowResetModal(true)}
            >
              🗑️ Borrar Todo
            </button>
          </div>
        </section>

        {/* App Info Section */}
        <section className="settings-section">
          <h3 className="settings-section-title">ℹ️ Acerca de</h3>
          <div className="settings-about">
            <p><strong>Sistema Híbrido de Pesaje y Liquidación</strong></p>
            <p className="settings-about-version">Versión 1.0.0</p>
          </div>
        </section>
      </div>
    );
  };

  // Render the appropriate view
  const renderView = () => {
    switch (currentView) {
      case 'weighing':
        return <WeighingScreen onWeightSubmit={handleWeightSubmit} />;
      case 'records':
        return <HistoryScreen />;
      case 'settlement':
        return <SettlementScreen />;
      case 'settings':
        return <SettingsView />;
      default:
        return null;
    }
  };

  return (
    <SessionProvider>
      <div className="app">
        {/* Main Content */}
        <main className="app-main app-main--full">
          {renderView()}
        </main>

        {/* Bottom Navigation */}
        <nav className="app-nav">
          <button
            className={`nav-item ${currentView === 'weighing' ? 'active' : ''}`}
            onClick={() => setCurrentView('weighing')}
          >
            <span className="nav-icon">⚖️</span>
            <span className="nav-label">Pesaje</span>
          </button>
          <button
            className={`nav-item ${currentView === 'records' ? 'active' : ''}`}
            onClick={() => setCurrentView('records')}
          >
            <span className="nav-icon">📋</span>
            <span className="nav-label">Registros</span>
          </button>
          <button
            className={`nav-item ${currentView === 'settlement' ? 'active' : ''}`}
            onClick={() => setCurrentView('settlement')}
          >
            <span className="nav-icon">💰</span>
            <span className="nav-label">Liquidar</span>
          </button>
          <button
            className={`nav-item ${currentView === 'settings' ? 'active' : ''}`}
            onClick={() => setCurrentView('settings')}
          >
            <span className="nav-icon">⚙️</span>
            <span className="nav-label">Ajustes</span>
          </button>
        </nav>

        {/* Factory Reset Confirmation Modal */}
        <ConfirmModal
          isOpen={showResetModal}
          onClose={() => setShowResetModal(false)}
          onConfirm={handleFactoryReset}
          title="⚠️ ¿Restablecer de Fábrica?"
          message="Esta acción eliminará TODOS los datos guardados incluyendo pesajes, categorías, entidades y liquidaciones. Esta acción NO se puede deshacer."
          variant="danger"
          confirmText="Sí, Borrar Todo"
          cancelText="Cancelar"
        />
      </div>
    </SessionProvider>
  );
}

export default App;
