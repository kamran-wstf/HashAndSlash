import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateSudoku } from '../utils/sudokuGenerator';
import { Difficulty } from './settingsStore';
import { usePointsStore } from './pointsStore';
import { useWalletStore } from './walletStore';

export type CellValue = number | null;
export type CellNotes = number[];
export type GameStatus = 'playing' | 'paused' | 'completed' | 'idle';

export interface GameState {
  board: CellValue[][];
  solution: number[][];
  originalBoard: CellValue[][];
  notes: CellNotes[][];
  difficulty: Difficulty;
  selectedCell: [number, number] | null;
  status: GameStatus;
  startTime: number | null;
  elapsedTime: number;
  moves: number;
  errors: number;
  useNotes: boolean;
  
  // Actions
  initializeGame: (difficulty: Difficulty) => void;
  selectCell: (row: number, col: number) => void;
  setValueInCell: (value: number | null) => void;
  toggleNoteInCell: (value: number) => void;
  eraseCell: () => void;
  toggleNoteMode: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  updateTimer: () => void;
  checkCompletion: () => boolean;
  resetGame: () => void;
  clearSelection: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      board: Array(9).fill(null).map(() => Array(9).fill(null)),
      solution: Array(9).fill(null).map(() => Array(9).fill(0)),
      originalBoard: Array(9).fill(null).map(() => Array(9).fill(null)),
      notes: Array(9).fill(null).map(() => Array(9).fill([])),
      difficulty: 'medium',
      selectedCell: null,
      status: 'idle',
      startTime: null,
      elapsedTime: 0,
      moves: 0,
      errors: 0,
      useNotes: false,

      initializeGame: (difficulty) => {
        const { puzzle, solution } = generateSudoku(difficulty);
        
        set({
          board: JSON.parse(JSON.stringify(puzzle)),
          solution: solution,
          originalBoard: JSON.parse(JSON.stringify(puzzle)),
          notes: Array(9).fill(null).map(() => Array(9).fill([])),
          difficulty,
          selectedCell: null,
          status: 'playing',
          startTime: Date.now(),
          elapsedTime: 0,
          moves: 0,
          errors: 0
        });
      },

      selectCell: (row, col) => {
        const { board, originalBoard } = get();
        
        // Only allow selecting cells that were not pre-filled
        if (originalBoard[row][col] === null) {
          set({ selectedCell: [row, col] });
        }
      },

      setValueInCell: (value) => {
        const { selectedCell, board, originalBoard, solution, useNotes } = get();
        
        if (!selectedCell) return;
        
        const [row, col] = selectedCell;
        
        // Don't allow modifying pre-filled cells
        if (originalBoard[row][col] !== null) return;

        // If in notes mode, handle notes instead
        if (useNotes) {
          get().toggleNoteInCell(value as number);
          return;
        }
        
        // Create a new board with the updated value
        const newBoard = JSON.parse(JSON.stringify(board));
        newBoard[row][col] = value;
        
        // Check if the value is correct according to the solution
        const isCorrect = value === null || value === solution[row][col];
        
        set(state => ({
          board: newBoard,
          moves: state.moves + 1,
          errors: isCorrect ? state.errors : state.errors + 1,
        }));
        
        // Clear notes for this cell when a value is set
        if (value !== null) {
          const newNotes = JSON.parse(JSON.stringify(get().notes));
          newNotes[row][col] = [];
          set({ notes: newNotes });
        }
        
        // Check if the game is completed
        if (get().checkCompletion()) {
          set({ status: 'completed' });
        }
      },

      toggleNoteInCell: (value) => {
        const { selectedCell, notes, board } = get();
        
        if (!selectedCell) return;
        
        const [row, col] = selectedCell;
        
        // Only toggle notes in empty cells
        if (board[row][col] !== null) return;
        
        const newNotes = JSON.parse(JSON.stringify(notes));
        
        // Toggle the note value (add if not present, remove if present)
        if (newNotes[row][col].includes(value)) {
          newNotes[row][col] = newNotes[row][col].filter((n: number) => n !== value);
        } else {
          newNotes[row][col] = [...newNotes[row][col], value].sort();
        }
        
        set({ notes: newNotes });
      },

      eraseCell: () => {
        const { selectedCell, board, originalBoard } = get();
        
        if (!selectedCell) return;
        
        const [row, col] = selectedCell;
        
        // Don't allow erasing pre-filled cells
        if (originalBoard[row][col] !== null) return;
        
        // Create a new board with the cell erased
        const newBoard = JSON.parse(JSON.stringify(board));
        newBoard[row][col] = null;
        
        set(state => ({
          board: newBoard,
          moves: state.moves + 1
        }));
      },

      toggleNoteMode: () => {
        set(state => ({ useNotes: !state.useNotes }));
      },

      pauseGame: () => {
        if (get().status === 'playing') {
          set(state => ({
            status: 'paused',
            elapsedTime: state.elapsedTime + (Date.now() - (state.startTime || Date.now()))
          }));
        }
      },

      resumeGame: () => {
        if (get().status === 'paused') {
          set({
            status: 'playing',
            startTime: Date.now()
          });
        }
      },

      updateTimer: () => {
        const { status, startTime } = get();
        
        if (status === 'playing' && startTime) {
          set(state => ({
            elapsedTime: state.elapsedTime + (Date.now() - (state.startTime || Date.now())),
            startTime: Date.now()
          }));
        }
      },

      checkCompletion: () => {
        const { board, solution } = get();
        
        // Check if all cells are filled correctly
        for (let row = 0; row < 9; row++) {
          for (let col = 0; col < 9; col++) {
            if (board[row][col] !== solution[row][col]) {
              return false;
            }
          }
        }
        
        // If we get here, the game is completed
        // Award points based on difficulty and wallet address
        const { addPoints } = usePointsStore.getState();
        const { address } = useWalletStore.getState();
        
        if (address) {
          addPoints(address, get().difficulty);
        }
        
        return true;
      },

      resetGame: () => {
        set(state => ({
          board: JSON.parse(JSON.stringify(state.originalBoard)),
          notes: Array(9).fill(null).map(() => Array(9).fill([])),
          selectedCell: null,
          status: 'playing',
          startTime: Date.now(),
          elapsedTime: 0,
          moves: 0,
          errors: 0
        }));
      },

      clearSelection: () => {
        set({ selectedCell: null });
      }
    }),
    {
      name: 'sudoku-game-state',
      partialize: (state) => ({
        // Only persist these fields
        board: state.board,
        originalBoard: state.originalBoard,
        solution: state.solution,
        notes: state.notes,
        difficulty: state.difficulty,
        status: state.status,
        elapsedTime: state.elapsedTime,
        moves: state.moves,
        errors: state.errors
      })
    }
  )
);