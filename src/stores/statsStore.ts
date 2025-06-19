import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Difficulty } from './settingsStore';

interface GameStats {
  completed: number;
  bestTime: number | null;
  averageTime: number | null;
  streak: number;
  totalMoves: number;
  totalErrors: number;
}

interface StatsState {
  gamesStarted: number;
  lastPlayed: number | null;
  stats: Record<Difficulty, GameStats>;
  incrementGamesStarted: () => void;
  updateLastPlayed: () => void;
  recordGameCompletion: (difficulty: Difficulty, time: number, moves: number, errors: number) => void;
  resetStats: () => void;
}

const initialStats: GameStats = {
  completed: 0,
  bestTime: null,
  averageTime: null,
  streak: 0,
  totalMoves: 0,
  totalErrors: 0,
};

export const useStatsStore = create<StatsState>()(
  persist(
    (set, get) => ({
      gamesStarted: 0,
      lastPlayed: null,
      stats: {
        easy: { ...initialStats },
        medium: { ...initialStats },
        hard: { ...initialStats },
        expert: { ...initialStats },
      },

      incrementGamesStarted: () => {
        set(state => ({ gamesStarted: state.gamesStarted + 1 }));
      },

      updateLastPlayed: () => {
        set({ lastPlayed: Date.now() });
      },

      recordGameCompletion: (difficulty, time, moves, errors) => {
        set(state => {
          const currentStats = state.stats[difficulty];
          const newCompleted = currentStats.completed + 1;
          
          // Calculate new average time
          const currentTotalTime = (currentStats.averageTime || 0) * currentStats.completed;
          const newAverageTime = (currentTotalTime + time) / newCompleted;
          
          // Update best time if it's better than the current one or if it's the first completion
          const newBestTime = currentStats.bestTime === null || time < currentStats.bestTime
            ? time
            : currentStats.bestTime;
          
          return {
            stats: {
              ...state.stats,
              [difficulty]: {
                completed: newCompleted,
                bestTime: newBestTime,
                averageTime: newAverageTime,
                streak: currentStats.streak + 1,
                totalMoves: currentStats.totalMoves + moves,
                totalErrors: currentStats.totalErrors + errors,
              }
            }
          };
        });
      },

      resetStats: () => {
        set({
          gamesStarted: 0,
          lastPlayed: null,
          stats: {
            easy: { ...initialStats },
            medium: { ...initialStats },
            hard: { ...initialStats },
            expert: { ...initialStats },
          }
        });
      }
    }),
    {
      name: 'sudoku-stats',
    }
  )
);