import { createContext } from 'react';
import { AppSettings } from '../types';

export interface AppContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  currentView: 'library' | 'reader' | 'bookmarks';
  setCurrentView: (view: 'library' | 'reader' | 'bookmarks') => void;
  currentGuideId: string | null;
  setCurrentGuideId: (id: string | null) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);