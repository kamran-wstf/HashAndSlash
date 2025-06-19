import React from 'react';
import { Play } from 'lucide-react';
import { useGameStore } from '../stores/gameStore';
import { playSound } from '../utils/audio';

const PauseOverlay: React.FC = () => {
  const { resumeGame } = useGameStore();

  const handleResume = () => {
    playSound('toggle');
    resumeGame();
  };

  return (
    <div className="fixed inset-0 bg-ink-800 bg-opacity-50 flex items-center justify-center z-50">
      <div className="paper-bg p-8 rounded-lg shadow-lg max-w-md mx-auto text-center">
        <h2 className="text-2xl font-bold mb-4">Game Paused</h2>
        <p className="mb-6">Take a moment to think about your next move...</p>
        <button
          className="px-6 py-3 bg-indigo-700 text-white rounded-md shadow-md
                     hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-700
                     focus:ring-opacity-50 flex items-center justify-center gap-2 mx-auto"
          onClick={handleResume}
        >
          <Play size={20} />
          Resume Game
        </button>
      </div>
    </div>
  );
};

export default PauseOverlay;