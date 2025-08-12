import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LandingPage from './pages/LandingPage';
import GamePage from './pages/GamePage';
import HowToPlayPage from './pages/HowToPlayPage';
import SettingsPage from './pages/SettingsPage';
import StatisticsPage from './pages/StatisticsPage';
import { useEffect } from 'react';
import { useSettingsStore } from './stores/settingsStore';
import { WalletConnect } from './components/WalletConnect';
import { GameAccessGuard } from './components/GameAccessGuard';

function App() {
  const { initializeSettings } = useSettingsStore();

  useEffect(() => {
    // Initialize settings from localStorage if available
    initializeSettings();
  }, [initializeSettings]);

  return (
    <div className="min-h-screen paper-bg">
      <main className="pt-16">
        <Routes>
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/game" element={
            <GameAccessGuard>
              <GamePage />
            </GameAccessGuard>
          } />
          <Route path="/how-to-play" element={<HowToPlayPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/statistics" element={<StatisticsPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;