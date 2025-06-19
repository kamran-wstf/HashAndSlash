import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

interface SettingsState {
  soundEnabled: boolean;
  musicEnabled: boolean;
  difficulty: Difficulty;
  darkMode: boolean;
  notesEnabled: boolean;
  highlightRelatedCells: boolean;
  toggleSound: () => void;
  toggleMusic: () => void;
  setDifficulty: (difficulty: Difficulty) => void;
  toggleDarkMode: () => void;
  toggleNotes: () => void;
  toggleHighlightRelatedCells: () => void;
  initializeSettings: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      soundEnabled: true,
      musicEnabled: true,
      difficulty: 'medium' as Difficulty,
      darkMode: false,
      notesEnabled: true,
      highlightRelatedCells: true,

      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
      toggleMusic: () => set((state) => ({ musicEnabled: !state.musicEnabled })),
      setDifficulty: (difficulty) => set({ difficulty }),
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      toggleNotes: () => set((state) => ({ notesEnabled: !state.notesEnabled })),
      toggleHighlightRelatedCells: () => set((state) => ({ highlightRelatedCells: !state.highlightRelatedCells })),

      initializeSettings: () => {
        // This function is called once when the app starts
        // You can add any initialization logic here if needed
        // The persist middleware will automatically restore the state from localStorage
      },
    }),
    {
      name: 'sudoku-settings',
    }
  )
);