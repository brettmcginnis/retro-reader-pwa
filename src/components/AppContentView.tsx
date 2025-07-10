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
  onBackToLibrary: _onBackToLibrary,
  onViewChange,
  onNavigateToLine
}) => {
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
        
        return currentGuide ? (
          <GuideReader 
            guide={currentGuide} 
            currentView={currentView}
            onViewChange={onViewChange}
          />
        ) : null;
        
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
        
        return currentGuide ? (
          <BookmarkManager 
            guide={currentGuide} 
            onGotoLine={onNavigateToLine}
            currentView={currentView}
            onViewChange={onViewChange}
          />
        ) : null;
        
      default:
        return <GuideLibrary />;
    }
  };

  return renderContent();
};