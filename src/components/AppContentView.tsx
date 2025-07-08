import React from 'react';
import { Guide } from '../types';
import { GuideLibrary } from './GuideLibrary';
import { GuideReader } from './GuideReader';
import { BookmarkManager } from './BookmarkManager';

interface AppContentViewProps {
  currentView: 'library' | 'reader' | 'bookmarks';
  currentGuide: Guide | null;
  isLoadingGuide: boolean;
  onBackToLibrary: () => void;
  onViewChange: (view: 'library' | 'reader' | 'bookmarks') => void;
  onNavigateToLine: (line: number) => void;
}

export const AppContentView: React.FC<AppContentViewProps> = ({
  currentView,
  currentGuide,
  isLoadingGuide,
  onBackToLibrary,
  onViewChange,
  onNavigateToLine
}) => {
  const handleGotoLine = (line: number) => {
    // Navigate to the reader view with the target line
    onNavigateToLine(line);
  };

  const renderNavigation = () => {
    if (currentView === 'library') return null;

    return (
      <nav className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-retro-900 border-b border-retro-200 dark:border-retro-700">
        <button 
          onClick={onBackToLibrary} 
          className="px-4 py-2 text-sm font-medium text-retro-700 dark:text-retro-300 hover:text-retro-900 dark:hover:text-retro-100 hover:bg-retro-100 dark:hover:bg-retro-800 rounded-md transition-colors"
        >
          ← Library
        </button>
        {currentView === 'reader' && (
          <button 
            onClick={() => onViewChange('bookmarks')} 
            className="px-4 py-2 text-sm font-medium text-retro-700 dark:text-retro-300 hover:text-retro-900 dark:hover:text-retro-100 hover:bg-retro-100 dark:hover:bg-retro-800 rounded-md transition-colors"
          >
            Bookmarks
          </button>
        )}
        {currentView === 'bookmarks' && (
          <button 
            onClick={() => onViewChange('reader')} 
            className="px-4 py-2 text-sm font-medium text-retro-700 dark:text-retro-300 hover:text-retro-900 dark:hover:text-retro-100 hover:bg-retro-100 dark:hover:bg-retro-800 rounded-md transition-colors"
          >
            Read Guide
          </button>
        )}
      </nav>
    );
  };

  const renderContent = () => {
    switch (currentView) {
      case 'library':
        return <GuideLibrary />;
        
      case 'reader':
        if (isLoadingGuide) {
          return (
            <div className="flex items-center justify-center h-screen bg-retro-50 dark:bg-retro-950">
              <div className="text-lg text-retro-600 dark:text-retro-400">Loading guide...</div>
            </div>
          );
        }
        
        if (!currentGuide && !isLoadingGuide) {
          return <GuideLibrary />;
        }
        
        return (
          <div className="flex flex-col h-screen bg-retro-50 dark:bg-retro-950">
            {renderNavigation()}
            {currentGuide && <GuideReader guide={currentGuide} />}
          </div>
        );
        
      case 'bookmarks':
        if (isLoadingGuide) {
          return (
            <div className="flex items-center justify-center h-screen bg-retro-50 dark:bg-retro-950">
              <div className="text-lg text-retro-600 dark:text-retro-400">Loading guide...</div>
            </div>
          );
        }
        
        if (!currentGuide && !isLoadingGuide) {
          return <GuideLibrary />;
        }
        
        return (
          <div className="flex flex-col h-screen bg-retro-50 dark:bg-retro-950">
            {renderNavigation()}
            {currentGuide && (
              <BookmarkManager 
                guide={currentGuide} 
                onGotoLine={handleGotoLine}
              />
            )}
          </div>
        );
        
      default:
        return <GuideLibrary />;
    }
  };

  return renderContent();
};