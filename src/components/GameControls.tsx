import React from 'react';
import { useGameStore } from '../stores/gameStore';
import { Eraser, Undo, Pencil, RotateCcw, Play, Pause } from 'lucide-react';
import { playSound } from '../utils/audio';

const GameControls: React.FC = () => {
  const { 
    eraseCell, 
    useNotes, 
    toggleNoteMode, 
    resetGame,
    status,
    pauseGame,
    resumeGame
  } = useGameStore();

  // Handle erase button click
  const handleErase = () => {
    playSound('erase');
    eraseCell();
  };

  // Handle notes toggle
  const handleToggleNotes = () => {
    playSound('toggle');
    toggleNoteMode();
  };

  // Handle game reset
  const handleReset = () => {
    playSound('navigate');
    resetGame();
  };

  // Handle pause/resume
  const handlePauseResume = () => {
    playSound('toggle');
    if (status === 'playing') {
      pauseGame();
    } else if (status === 'paused') {
      resumeGame();
    }
  };

  return (
    <div className="flex justify-center mt-6 gap-3 max-w-md mx-auto">
      <button
        className="px-4 py-2 bg-paper-100 border border-ink-800 rounded-md shadow
                  hover:bg-paper-200 focus:outline-none focus:ring-2 focus:ring-indigo-700
                  focus:ring-opacity-50 flex items-center justify-center gap-1"
        onClick={handleErase}
      >
        <Eraser size={18} />
        <span className="hidden sm:inline">Erase</span>
      </button>
      
      <button
        className={`px-4 py-2 rounded-md shadow 
                  focus:outline-none focus:ring-2 focus:ring-indigo-700 focus:ring-opacity-50
                  flex items-center justify-center gap-1
                  ${useNotes ? 'bg-indigo-700 text-paper-100 border border-indigo-700' : 
                              'bg-paper-100 border border-ink-800 hover:bg-paper-200'}`}
        onClick={handleToggleNotes}
      >
        <Pencil size={18} />
        <span className="hidden sm:inline">Notes</span>
      </button>
      
      <button
        className="px-4 py-2 bg-paper-100 border border-ink-800 rounded-md shadow
                  hover:bg-paper-200 focus:outline-none focus:ring-2 focus:ring-indigo-700
                  focus:ring-opacity-50 flex items-center justify-center gap-1"
        onClick={handleReset}
      >
        <RotateCcw size={18} />
        <span className="hidden sm:inline">Reset</span>
      </button>
      
      {status === 'playing' || status === 'paused' ? (
        <button
          className="px-4 py-2 bg-paper-100 border border-ink-800 rounded-md shadow
                    hover:bg-paper-200 focus:outline-none focus:ring-2 focus:ring-indigo-700
                    focus:ring-opacity-50 flex items-center justify-center gap-1"
          onClick={handlePauseResume}
        >
          {status === 'playing' ? <Pause size={18} /> : <Play size={18} />}
          <span className="hidden sm:inline">{status === 'playing' ? 'Pause' : 'Resume'}</span>
        </button>
      ) : null}
    </div>
  );
};

export default GameControls;