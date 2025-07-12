import { createContext } from 'react';

export interface AppContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  currentView: 'library' | 'reader';
  setCurrentView: (view: 'library' | 'reader') => void;
  currentGuideId: string | null;
  setCurrentGuideId: (id: string | null) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);