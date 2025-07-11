import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  theme: 'light' | 'dark';
  currentView: 'library' | 'reader';
  currentGuideId: string | null;
  navigationTargetLine: number | null;
}

interface AppActions {
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setCurrentView: (view: 'library' | 'reader') => void;
  setCurrentGuideId: (id: string | null) => void;
  setNavigationTargetLine: (line: number | null) => void;
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
      currentView: 'library',
      currentGuideId: null,
      navigationTargetLine: null,

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

      setCurrentView: (view) => set({ currentView: view }),
      setCurrentGuideId: (id) => set({ currentGuideId: id }),
      setNavigationTargetLine: (line) => set({ navigationTargetLine: line }),
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