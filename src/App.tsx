import { useState } from 'react';
import { SessionProvider } from './context/SessionContext';
import { WeighingScreen } from './features/weighing';
import { SettlementScreen } from './features/settlement';
import './App.css';

type AppView = 'weighing' | 'records' | 'settlement' | 'settings';

function App() {
  const [currentView, setCurrentView] = useState<AppView>('weighing');
  const [weightRecords, setWeightRecords] = useState<Array<{ weight: number; categoryId: string; entityId: string }>>([]);

  const handleWeightSubmit = (weight: number, categoryId: string, entityId: string) => {
    setWeightRecords((prev) => [...prev, { weight, categoryId, entityId }]);
    console.log('Peso registrado:', weight, 'kg', 'Categoría:', categoryId, 'Entidad:', entityId);
    console.log('Total registros:', weightRecords.length + 1);
  };

  // Render the appropriate view
  const renderView = () => {
    switch (currentView) {
      case 'weighing':
        return <WeighingScreen onWeightSubmit={handleWeightSubmit} />;
      case 'records':
        return (
          <div className="placeholder-view">
            <h2>📋 Registros</h2>
            <p>Total: {weightRecords.length} pesajes</p>
            {weightRecords.length > 0 && (
              <ul className="records-list">
                {weightRecords.slice(-10).map((record, idx) => (
                  <li key={idx}>{record.weight} kg</li>
                ))}
              </ul>
            )}
          </div>
        );
      case 'settlement':
        return <SettlementScreen />;
      case 'settings':
        return (
          <div className="placeholder-view">
            <h2>⚙️ Ajustes</h2>
            <p>Configuración del sistema</p>
          </div>
        );
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
      </div>
    </SessionProvider>
  );
}

export default App;
