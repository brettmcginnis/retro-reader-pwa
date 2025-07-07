import React from 'react';
import { Home, Book, Bookmark, Settings, Menu, X } from 'lucide-react';
import { Button } from './Button';

interface AppContentViewProps {
  isLoading: boolean;
  error: string | null;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  currentView: 'home' | 'reader' | 'bookmarks';
  onNavigate: (view: 'home' | 'reader' | 'bookmarks') => void;
  children: React.ReactNode;
}

export const AppContentView: React.FC<AppContentViewProps> = ({ 
  isLoading, 
  error, 
  isDarkMode,
  onToggleDarkMode,
  currentView, 
  onNavigate, 
  children 
}) => {
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-retro-50 dark:bg-retro-950">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-retro-600 dark:text-retro-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-retro-50 dark:bg-retro-950">
        <div className="text-center">
          <X className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg font-medium text-retro-900 dark:text-retro-100">Error</p>
          <p className="mt-2 text-retro-600 dark:text-retro-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-retro-50 dark:bg-retro-950">
      {/* Header */}
      <header className="bg-white dark:bg-retro-900 border-b border-retro-200 dark:border-retro-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-retro-900 dark:text-retro-100">
                Retro Reader
              </h1>
            </div>
            
            <nav className="hidden md:flex items-center space-x-4">
              <Button
                variant={currentView === 'home' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => onNavigate('home')}
                className="flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Library
              </Button>
              
              {currentView === 'reader' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onNavigate('reader')}
                  className="flex items-center gap-2"
                >
                  <Book className="w-4 h-4" />
                  Reader
                </Button>
              )}
              
              {currentView === 'bookmarks' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onNavigate('bookmarks')}
                  className="flex items-center gap-2"
                >
                  <Bookmark className="w-4 h-4" />
                  Bookmarks
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleDarkMode}
                className="flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                {isDarkMode ? 'Light' : 'Dark'} Mode
              </Button>
            </nav>
            
            <button className="md:hidden">
              <Menu className="w-6 h-6 text-retro-700 dark:text-retro-300" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
};