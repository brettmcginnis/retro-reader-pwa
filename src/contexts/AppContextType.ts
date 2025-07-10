import { createContext } from 'react';

interface AppContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  currentView: 'library' | 'reader' | 'bookmarks';
  setCurrentView: (view: 'library' | 'reader' | 'bookmarks') => void;
  currentGuideId: string | null;
  setCurrentGuideId: (id: string | null) => void;
  navigationTargetLine: number | null;
  setNavigationTargetLine: (line: number | null) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);