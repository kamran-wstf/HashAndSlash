import React from 'react';
import { playSound } from '../utils/audio';

interface SudokuCellProps {
  value: number | null;
  notes: number[];
  row: number;
  col: number;
  isSelected: boolean;
  isRelated: boolean;
  hasSameValue: boolean;
  isOriginal: boolean;
  isCorrect: boolean;
  onSelect: () => void;
}

const SudokuCell: React.FC<SudokuCellProps> = ({
  value,
  notes,
  row,
  col,
  isSelected,
  isRelated,
  hasSameValue,
  isOriginal,
  isCorrect,
  onSelect
}) => {
  // Determine cell styling based on props
  const getCellClasses = () => {
    let classes = "w-full h-full flex items-center justify-center transition-all duration-150";

    // Base styling
    classes += " bg-paper-100 text-ink-800";
    
    // Border styling for 3x3 grid sections
    if (row % 3 === 2 && row < 8) classes += " border-b-2 border-ink-800";
    if (col % 3 === 2 && col < 8) classes += " border-r-2 border-ink-800";
    
    // Highlighting for selected, related, and same value cells
    if (isSelected) {
      classes += " cell-selected";
    } else if (hasSameValue && value !== null) {
      classes += " cell-same-value";
    } else if (isRelated) {
      classes += " bg-paper-200";
    } else {
      classes += " cell-hover";
    }
    
    // Styling for original (pre-filled) cells
    if (isOriginal) {
      classes += " cell-fixed";
    }
    
    // Error styling
    if (!isCorrect && !isOriginal) {
      classes += " cell-error";
    }
    
    return classes;
  };

  // Handle cell click
  const handleClick = () => {
    playSound('select');
    onSelect();
  };

  return (
    <div 
      className={getCellClasses()}
      onClick={handleClick}
      style={{ 
        aspectRatio: "1/1",
        fontSize: value ? '1.25rem' : '0.75rem'
      }}
    >
      {value ? (
        <span className={`${isOriginal ? 'font-bold' : 'font-normal'} ${!isCorrect ? 'text-red-600' : ''}`}>
          {value}
        </span>
      ) : (
        notes.length > 0 && (
          <div className="grid grid-cols-3 grid-rows-3 gap-0 w-full h-full p-0.5">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <div key={num} className="flex items-center justify-center text-[0.6rem] text-ink-800 opacity-60">
                {notes.includes(num) ? num : ''}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default SudokuCell;