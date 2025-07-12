import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * State interface for global app configuration and navigation
 */
interface AppState {
  /** Current theme setting for the application */
  theme: 'light' | 'dark';
  /** ID of the currently opened guide, null if in library view */
  currentGuideId: string | null;
}

/**
 * Actions for managing app state
 */
interface AppActions {
  /** Toggles between light and dark theme */
  toggleTheme: () => void;
  /** Sets the theme to a specific value */
  setTheme: (theme: 'light' | 'dark') => void;
  /** Sets the current guide ID */
  setCurrentGuideId: (id: string | null) => void;
}

type AppStore = AppState & AppActions;

const applyThemeToDOM = (theme: 'light' | 'dark') => {
  document.documentElement.setAttribute('data-theme', theme);
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      theme: 'light',
      currentGuideId: null,

      toggleTheme: () =>
        set((state) => {
          const newTheme = state.theme === 'light' ? 'dark' : 'light';
          applyThemeToDOM(newTheme);
          return { theme: newTheme };
        }),

      setTheme: (theme) =>
        set(() => {
          applyThemeToDOM(theme);
          return { theme };
        }),

      setCurrentGuideId: (id) => set({ currentGuideId: id }),
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({ theme: state.theme }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyThemeToDOM(state.theme);
        }
      },
    }
  )
);