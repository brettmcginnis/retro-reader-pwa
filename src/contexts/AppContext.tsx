import React, { useState, useEffect, ReactNode } from 'react';
import { AppContext } from './AppContextType';

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    // Load theme from localStorage or default to 'light'
    const savedTheme = localStorage.getItem('theme');
    const initialTheme = (savedTheme === 'dark' || savedTheme === 'light') ? savedTheme : 'light';
    
    // Apply initial theme immediately
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    }
    
    return initialTheme;
  });
  const [currentView, setCurrentView] = useState<'library' | 'reader' | 'bookmarks'>('library');
  const [currentGuideId, setCurrentGuideId] = useState<string | null>(null);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    // Also toggle the dark class for Tailwind
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        currentView,
        setCurrentView,
        currentGuideId,
        setCurrentGuideId,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};