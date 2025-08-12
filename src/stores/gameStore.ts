import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateSudoku } from '../utils/sudokuGenerator';
import { Difficulty } from './settingsStore';
import { usePointsStore } from './pointsStore';
import { useWalletStore } from './walletStore';
import { ethers } from 'ethers';
import { checkUserBalances, startGameWithExistingTokens } from '../utils/gameStart';

import { startGameSession, recordGameActivity, redeemPoints } from '../utils/contract';

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
  activityLog: { action: string; row: number; col: number; value: number | null; points: number; timestamp: number }[];
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
  recordGameActivity: () => Promise<void>;
  checkBalances: () => Promise<void>;
  clearBlockchainError: () => void;
  canUserPlay: () => boolean;
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

          // Record all game activities when user wins
          (async () => {
            try {
              console.log('Recording game activities...');
              await get().recordGameActivity();
            } catch (e) {
              console.error('Failed to record game activities:', e);
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

      addActivity: (row: number, col: number, value: number | null, correct: boolean) => set((state) => {
        const points = correct ? 5 : -2;
        const newPoints = Math.max(0, state.points + points);
        const action = correct ? 'correctmove' : 'move';

        return {
          points: newPoints,
          activityLog: [
            ...state.activityLog,
            {
              action,
              row,
              col,
              value,
              points,
              timestamp: Date.now()
            }
          ]
        };
      }),

      clearBlockchainError: () => {
        set({ blockchainError: null });
      },

      canUserPlay: () => {
        const { balances } = get();
        const requiredTokens = BigInt(ethers.utils.parseEther('1').toString());
        return balances.gameTokenBalance >= requiredTokens;
      },

      recordGameActivity: async () => {
        const { address } = useWalletStore.getState();
        const { activityLog } = get();

        if (!address || activityLog.length === 0) return;

        try {
          if (!window.ethereum) {
            throw new Error('MetaMask not installed');
          }

          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();

          // Call the recordGameActivity function from utils
          await recordGameActivity(activityLog, signer, address);

          console.log('Game activities recorded successfully');
        } catch (error) {
          console.error('Failed to record game activities:', error);
          set({ blockchainError: 'Failed to record game activities' });
        }
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