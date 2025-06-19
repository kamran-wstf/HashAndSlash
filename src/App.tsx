import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import GamePage from './pages/GamePage';
import HowToPlayPage from './pages/HowToPlayPage';
import SettingsPage from './pages/SettingsPage';
import StatisticsPage from './pages/StatisticsPage';
import { useEffect } from 'react';
import { useSettingsStore } from './stores/settingsStore';
import { WalletConnect } from './components/WalletConnect';

function App() {
  const { initializeSettings } = useSettingsStore();

  useEffect(() => {
    // Initialize settings from localStorage if available
    initializeSettings();
  }, [initializeSettings]);

  return (
    <div className="min-h-screen paper-bg">
      {/* <header className="fixed top-0 left-0 right-0 z-50 p-4 bg-white/80 backdrop-blur-sm border-b">
        <div className="container mx-auto flex justify-end">
          <WalletConnect />
        </div>
      </header> */}
      <main className="pt-16">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/game" element={<GamePage />} />
          <Route path="/how-to-play" element={<HowToPlayPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/statistics" element={<StatisticsPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;