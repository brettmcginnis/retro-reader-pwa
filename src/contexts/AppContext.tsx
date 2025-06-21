import React, { useState, useEffect, ReactNode } from 'react';
import { AppSettings } from '../types';
import { db } from '../services/database';
import { AppContext } from './AppContextType';

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'light',
    fontSize: 14,
    lineHeight: 1.5,
    fontFamily: 'monospace',
    autoSave: true
  });
  const [currentView, setCurrentView] = useState<'library' | 'reader' | 'bookmarks'>('library');
  const [currentGuideId, setCurrentGuideId] = useState<string | null>(null);

  useEffect(() => {
    const initSettings = async () => {
      try {
        await db.init();
        const savedSettings = await db.getSettings();
        setSettings(savedSettings);
        applySettings(savedSettings);
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };

    initSettings();
  }, []);

  const applySettings = (settings: AppSettings) => {
    document.documentElement.setAttribute('data-theme', settings.theme);
    document.documentElement.style.setProperty('--base-font-size', `${settings.fontSize}px`);
    document.documentElement.style.setProperty('--base-line-height', settings.lineHeight.toString());
  };

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    applySettings(updatedSettings);
    await db.saveSettings(updatedSettings);
  };

  return (
    <AppContext.Provider
      value={{
        settings,
        updateSettings,
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