import React from 'react';
import NavBar from '../components/NavBar';
import { useSettingsStore } from '../stores/settingsStore';
import { Volume2, VolumeX, Music, Trash2, Pen, Grid } from 'lucide-react';
import { playSound, toggleBackgroundMusic } from '../utils/audio';
import { useStatsStore } from '../stores/statsStore';

const SettingsPage: React.FC = () => {
  const { 
    soundEnabled, 
    musicEnabled, 
    notesEnabled, 
    highlightRelatedCells,
    toggleSound, 
    toggleMusic, 
    toggleNotes,
    toggleHighlightRelatedCells
  } = useSettingsStore();
  
  const { resetStats } = useStatsStore();

  const handleToggleSound = () => {
    if (soundEnabled) {
      // Play sound before disabling
      playSound('toggle');
    }
    toggleSound();
    if (!soundEnabled) {
      // If we're enabling sounds, play a sound
      playSound('toggle');
    }
  };

  const handleToggleMusic = () => {
    toggleMusic();
    playSound('toggle');
    toggleBackgroundMusic(!musicEnabled);
  };

  const handleToggleNotes = () => {
    playSound('toggle');
    toggleNotes();
  };

  const handleToggleHighlightCells = () => {
    playSound('toggle');
    toggleHighlightRelatedCells();
  };

  const handleResetStats = () => {
    if (confirm('Are you sure you want to reset all statistics? This cannot be undone.')) {
      playSound('erase');
      resetStats();
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      
      <main className="flex-1 max-w-4xl mx-auto py-8 px-4">
        <div className="paper-bg rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6 text-center">Settings</h1>
          
          <div className="space-y-6 max-w-md mx-auto">
            <section>
              <h2 className="text-xl font-semibold mb-4 text-indigo-700">Audio</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {soundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
                    <span>Sound Effects</span>
                  </div>
                  <button
                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                      soundEnabled ? 'bg-indigo-700' : 'bg-gray-300'
                    } transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-700 focus:ring-offset-2`}
                    onClick={handleToggleSound}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        soundEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Music size={24} />
                    <span>Background Music</span>
                  </div>
                  <button
                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                      musicEnabled ? 'bg-indigo-700' : 'bg-gray-300'
                    } transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-700 focus:ring-offset-2`}
                    onClick={handleToggleMusic}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        musicEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-4 text-indigo-700">Gameplay</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Pen size={24} />
                    <span>Enable Notes by Default</span>
                  </div>
                  <button
                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                      notesEnabled ? 'bg-indigo-700' : 'bg-gray-300'
                    } transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-700 focus:ring-offset-2`}
                    onClick={handleToggleNotes}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notesEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Grid size={24} />
                    <span>Highlight Related Cells</span>
                  </div>
                  <button
                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                      highlightRelatedCells ? 'bg-indigo-700' : 'bg-gray-300'
                    } transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-700 focus:ring-offset-2`}
                    onClick={handleToggleHighlightCells}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        highlightRelatedCells ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-4 text-indigo-700">Data</h2>
              
              <button
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md
                           hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-opacity-50"
                onClick={handleResetStats}
              >
                <Trash2 size={20} />
                Reset Statistics
              </button>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;