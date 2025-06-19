import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Difficulty } from './settingsStore';

interface PointsState {
  pointsByAddress: Record<string, number>;
  pointsPerDifficulty: Record<Difficulty, number>;
  addPoints: (address: string, difficulty: Difficulty) => void;
  getPoints: (address: string) => number;
  resetPoints: (address: string) => void;
}

export const usePointsStore = create<PointsState>()(
  persist(
    (set, get) => ({
      pointsByAddress: {},
      pointsPerDifficulty: {
        easy: 25,
        medium: 50,
        hard: 75,
        expert: 100,
      },
      addPoints: (address, difficulty) => 
        set((state) => ({
          pointsByAddress: {
            ...state.pointsByAddress,
            [address]: (state.pointsByAddress[address] || 0) + state.pointsPerDifficulty[difficulty]
          }
        })),
      getPoints: (address) => get().pointsByAddress[address] || 0,
      resetPoints: (address) => 
        set((state) => {
          const newPointsByAddress = { ...state.pointsByAddress };
          delete newPointsByAddress[address];
          return { pointsByAddress: newPointsByAddress };
        }),
    }),
    {
      name: 'sudoku-points',
    }
  )
); 