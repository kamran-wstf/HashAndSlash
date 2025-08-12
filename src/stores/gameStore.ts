import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateSudoku } from '../utils/sudokuGenerator';
import { Difficulty } from './settingsStore';
import { usePointsStore } from './pointsStore';
import { useWalletStore } from './walletStore';
import { ethers } from 'ethers';
import { checkUserBalances, startGameWithExistingTokens } from '../utils/gameStart';

import { startGameSession, submitGameBatch, redeemPoints } from '../utils/contract';

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
  points: number;
  activityLog: { row: number, col: number, value: number | null, correct: boolean, timestamp: number }[];
  balances: {
    gameTokenBalance: bigint;
    hnsBalance: bigint;
  };
  blockchainError: string | null;

  // Actions
  initializeGame: (difficulty: Difficulty) => Promise<{ success: boolean; error?: string }>;
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
  addActivity: (row: number, col: number, value: number | null, correct: boolean) => void;
  checkBalances: () => Promise<void>;
  clearBlockchainError: () => void;
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
      points: 0,
      activityLog: [],
      balances: {
        gameTokenBalance: BigInt(0),
        hnsBalance: BigInt(0)
      },
      blockchainError: null,

      checkBalances: async () => {
        const { address } = useWalletStore.getState();
        if (!address) return;

        try {
          if (!window.ethereum) {
            throw new Error('MetaMask not installed');
          }
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const userBalances = await checkUserBalances(address, provider);
          set({ balances: userBalances });
        } catch (error) {
          console.error('Failed to check balances:', error);
          set({ blockchainError: 'Failed to check balances' });
        }
      },

      initializeGame: async (difficulty) => {
        const { address } = useWalletStore.getState();
        if (!address) {
          return { success: false, error: 'Please connect your wallet' };
        }

        try {
          // Check user balances first
          await get().checkBalances();
          const { balances } = get();

          // Check if user has sufficient tokens
          const requiredTokens = BigInt(ethers.utils.parseEther('1').toString());

          if (balances.gameTokenBalance === BigInt(0) && balances.hnsBalance === BigInt(0)) {
            return {
              success: false,
              error: 'Insufficient balance. You need at least 1 SD token or HNS to start the game.'
            };
          }

          if (balances.gameTokenBalance < requiredTokens) {
            return {
              success: false,
              error: 'Insufficient SD tokens. You need at least 1 SD token to start the game.'
            };
          }

          // Start game with existing tokens
          if (!window.ethereum) {
            return { success: false, error: 'MetaMask not installed' };
          }
          const result = await startGameWithExistingTokens(address, await new ethers.providers.Web3Provider(window.ethereum).getSigner());

          if (!result.success) {
            return { success: false, error: result.error || 'Failed to start game' };
          }

          // Generate puzzle and initialize game state
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
            errors: 0,
            blockchainError: null
          });

          return { success: true };
        } catch (error) {
          console.error('Failed to initialize game:', error);
          return { success: false, error: 'Failed to start game. Please try again.' };
        }
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

        // ✅ Add this line to log the activity and update points
        get().addActivity(row, col, value, isCorrect);

        // Check if the game is completed
        if (get().checkCompletion()) {
          set({ status: 'completed' });

          // Only call batch transaction and redeem points when user wins
          (async () => {
            try {
              // Use number of moves as the batch size
              const moves = get().moves;
              const gameId = 2; // Use GAME_ID = 2 for Sudoku
              // Create dummy actions array with length = moves
              const actions = Array.from({ length: moves }, (_, i) => ({
                timestamp: Date.now(),
                actionType: 0, // Replace with actual action type if needed
                value: 0,      // Replace with actual value if needed
                scoreChange: 0 // Replace with actual score change if needed
              }));
              const finalScore = moves; // Or use your own scoring logic
              const finalStateHash = '0x' + '0'.repeat(64); // placeholder
              const proof = '0x'; // placeholder'
              console.log('Submitting game batch...');
              await submitGameBatch(gameId, actions, finalScore, finalStateHash, proof);

              // Redeem points (replace with actual points logic)
              await redeemPoints(100);
            } catch (e) {
              console.error('Failed to submit batch or redeem points:', e);
            }
          })();
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
      },

      addActivity: (row: any, col: any, value: any, correct: any) => set((state) => {
        const newPoints = Math.max(0, state.points + (correct ? 5 : -2));
        return {
          points: newPoints,
          activityLog: [
            ...state.activityLog,
            { row, col, value, correct, timestamp: Date.now() }
          ]
        };
      }),

      clearBlockchainError: () => {
        set({ blockchainError: null });
      },
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