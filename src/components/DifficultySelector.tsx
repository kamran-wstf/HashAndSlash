import React from 'react';
import { useSettingsStore, Difficulty } from '../stores/settingsStore';
import { playSound } from '../utils/audio';

interface DifficultySelectorProps {
  onSelectDifficulty: (difficulty: Difficulty) => void;
  className?: string;
}

const DifficultySelector: React.FC<DifficultySelectorProps> = ({ 
  onSelectDifficulty,
  className = ""
}) => {
  const { difficulty, setDifficulty } = useSettingsStore();

  const difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'expert'];

  const handleSelect = (selectedDifficulty: Difficulty) => {
    playSound('navigate');
    setDifficulty(selectedDifficulty);
    onSelectDifficulty(selectedDifficulty);
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <h2 className="text-lg font-semibold mb-2">Difficulty</h2>
      <div className="flex flex-wrap justify-center gap-2">
        {difficulties.map((level) => (
          <button
            key={level}
            className={`px-4 py-2 rounded-md focus:outline-none transition-colors
                      ${level === difficulty 
                        ? 'bg-indigo-700 text-paper-100' 
                        : 'bg-paper-100 border border-ink-800 hover:bg-paper-200'}`}
            onClick={() => handleSelect(level)}
          >
            {level.charAt(0).toUpperCase() + level.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DifficultySelector;