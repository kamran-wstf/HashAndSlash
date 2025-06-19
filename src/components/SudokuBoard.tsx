import React, { useEffect } from 'react';
import { useGameStore } from '../stores/gameStore';
import SudokuCell from './SudokuCell';
import { useSettingsStore } from '../stores/settingsStore';

const SudokuBoard: React.FC = () => {
  const { 
    board, 
    notes, 
    selectedCell, 
    originalBoard, 
    selectCell, 
    clearSelection,
    status
  } = useGameStore();
  
  const { highlightRelatedCells } = useSettingsStore();

  useEffect(() => {
    // Add keyboard event listeners
    const handleKeyDown = (e: KeyboardEvent) => {
      if (status !== 'playing') return;

      // Handle number keys (1-9)
      if (e.key >= '1' && e.key <= '9') {
        const numValue = parseInt(e.key, 10);
        useGameStore.getState().setValueInCell(numValue);
      }
      
      // Handle Delete or Backspace for erasing
      if (e.key === 'Delete' || e.key === 'Backspace') {
        useGameStore.getState().eraseCell();
      }
      
      // Arrow keys for navigation
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && selectedCell) {
        e.preventDefault();
        const [row, col] = selectedCell;
        
        let newRow = row;
        let newCol = col;
        
        if (e.key === 'ArrowUp') newRow = Math.max(0, row - 1);
        if (e.key === 'ArrowDown') newRow = Math.min(8, row + 1);
        if (e.key === 'ArrowLeft') newCol = Math.max(0, col - 1);
        if (e.key === 'ArrowRight') newCol = Math.min(8, col + 1);
        
        if (newRow !== row || newCol !== col) {
          selectCell(newRow, newCol);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [status, selectedCell, selectCell]);

  // Determine related cells for highlighting
  const getRelatedCells = () => {
    if (!selectedCell || !highlightRelatedCells) return [];
    
    const [selectedRow, selectedCol] = selectedCell;
    const relatedCells: [number, number][] = [];
    
    // Selected value for highlighting same values
    const selectedValue = board[selectedRow][selectedCol];
    
    // Get all cells in the same row, column, and 3x3 box
    for (let i = 0; i < 9; i++) {
      // Same row
      if (i !== selectedCol) {
        relatedCells.push([selectedRow, i]);
      }
      
      // Same column
      if (i !== selectedRow) {
        relatedCells.push([i, selectedCol]);
      }
    }
    
    // Same 3x3 box
    const boxRow = Math.floor(selectedRow / 3) * 3;
    const boxCol = Math.floor(selectedCol / 3) * 3;
    
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const r = boxRow + i;
        const c = boxCol + j;
        if (r !== selectedRow || c !== selectedCol) {
          relatedCells.push([r, c]);
        }
      }
    }
    
    // Get cells with the same value
    if (selectedValue !== null) {
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if ((r !== selectedRow || c !== selectedCol) && board[r][c] === selectedValue) {
            // Add as a separate type of related cell
            relatedCells.push([r, c]);
          }
        }
      }
    }
    
    return relatedCells;
  };

  const relatedCells = getRelatedCells();

  // Handle background click to clear selection
  const handleBackgroundClick = () => {
    clearSelection();
  };

  return (
    <div 
      className="relative max-w-md mx-auto" 
      onClick={handleBackgroundClick}
    >
      <div 
        className="grid grid-cols-9 gap-px border-2 border-ink-800 bg-ink-800 rounded shadow-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {board.map((row, rowIndex) => (
          row.map((cell, colIndex) => {
            // Check if cell is selected
            const isSelected = selectedCell && 
                              selectedCell[0] === rowIndex && 
                              selectedCell[1] === colIndex;
            
            // Check if cell is part of the related cells
            const isRelated = relatedCells.some(([r, c]) => r === rowIndex && c === colIndex);
            
            // Check if cell has the same value as the selected cell (for highlighting)
            const hasSameValue = selectedCell && 
                                board[selectedCell[0]][selectedCell[1]] !== null && 
                                board[selectedCell[0]][selectedCell[1]] === cell;
            
            // Check if cell is a pre-filled cell from the original board
            const isOriginal = originalBoard[rowIndex][colIndex] !== null;
            
            return (
              <SudokuCell
                key={`${rowIndex}-${colIndex}`}
                value={cell}
                notes={notes[rowIndex][colIndex]}
                row={rowIndex}
                col={colIndex}
                isSelected={isSelected}
                isRelated={isRelated}
                hasSameValue={hasSameValue}
                isOriginal={isOriginal}
                isCorrect={true} // We'll implement validation later
                onSelect={() => selectCell(rowIndex, colIndex)}
              />
            );
          })
        ))}
      </div>
    </div>
  );
};

export default SudokuBoard;