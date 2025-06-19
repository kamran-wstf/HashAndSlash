import React from 'react';
import { useGameStore } from '../stores/gameStore';
import { playSound } from '../utils/audio';

const NumberSelector: React.FC = () => {
  const { setValueInCell, useNotes, toggleNoteInCell } = useGameStore();

  // Handle number button click
  const handleNumberClick = (number: number) => {
    if (useNotes) {
      playSound('toggle');
      toggleNoteInCell(number);
    } else {
      playSound('place');
      setValueInCell(number);
    }
  };

  return (
    <div className="flex justify-center mt-6 gap-2 flex-wrap max-w-md mx-auto">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(number => (
        <button
          key={number}
          className="number-btn"
          onClick={() => handleNumberClick(number)}
        >
          {number}
        </button>
      ))}
    </div>
  );
};

export default NumberSelector;