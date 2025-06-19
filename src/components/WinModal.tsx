import React from 'react';
import { Trophy, Home, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../stores/gameStore';
import { formatTime } from '../utils/timeFormat';
import { playSound } from '../utils/audio';

interface WinModalProps {
  time: number;
  moves: number;
  errors: number;
  difficulty: string;
  onNewGame: () => void;
}

const WinModal: React.FC<WinModalProps> = ({
  time,
  moves,
  errors,
  difficulty,
  onNewGame,
}) => {
  const navigate = useNavigate();

  const handleNewGame = () => {
    playSound('navigate');
    onNewGame();
  };

  const handleHome = () => {
    playSound('navigate');
    navigate('/');
  };

  return (
    <div className="fixed inset-0 bg-ink-800 bg-opacity-50 flex items-center justify-center z-50">
      <div className="paper-bg p-8 rounded-lg shadow-lg max-w-md w-full mx-auto text-center animate-ink-wash">
        <div className="mb-4 flex justify-center">
          <Trophy size={48} className="text-red-600" />
        </div>
        <h2 className="text-3xl font-bold mb-2">Puzzle Complete!</h2>
        <p className="mb-6 text-ink-800 text-opacity-80">Well done! You've mastered this challenge.</p>
        
        <div className="mb-6 bg-paper-200 p-4 rounded-md">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Time</p>
              <p className="text-xl font-semibold">{formatTime(time)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Difficulty</p>
              <p className="text-xl font-semibold capitalize">{difficulty}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Moves</p>
              <p className="text-xl font-semibold">{moves}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Errors</p>
              <p className="text-xl font-semibold">{errors}</p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center gap-4">
          <button
            className="px-4 py-2 bg-paper-100 border border-ink-800 rounded-md shadow
                      hover:bg-paper-200 focus:outline-none focus:ring-2 focus:ring-indigo-700
                      focus:ring-opacity-50 flex items-center justify-center gap-2"
            onClick={handleHome}
          >
            <Home size={20} />
            Home
          </button>
          
          <button
            className="px-4 py-2 bg-indigo-700 text-white rounded-md shadow
                      hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-700
                      focus:ring-opacity-50 flex items-center justify-center gap-2"
            onClick={handleNewGame}
          >
            <RotateCcw size={20} />
            New Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default WinModal;