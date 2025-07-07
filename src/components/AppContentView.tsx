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
}

export const AppContentView: React.FC<AppContentViewProps> = ({
  currentView,
  currentGuide,
  isLoadingGuide,
  onBackToLibrary,
  onViewChange
}) => {
  const handleGotoLine = () => {
    // This will be handled by switching to reader view
    // The GuideReader component will handle the line navigation
    onViewChange('reader');
  };

  const renderNavigation = () => {
    if (currentView === 'library') return null;

    return (
      <nav className={currentView === 'reader' ? 'reader-nav' : 'bookmarks-nav'}>
        <button 
          onClick={onBackToLibrary} 
          className="nav-btn"
        >
          ← Library
        </button>
        {currentView === 'reader' && (
          <button 
            onClick={() => onViewChange('bookmarks')} 
            className="nav-btn"
          >
            Bookmarks
          </button>
        )}
        {currentView === 'bookmarks' && (
          <button 
            onClick={() => onViewChange('reader')} 
            className="nav-btn"
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
            <div className="loading-container">
              <div className="loading-message">Loading guide...</div>
            </div>
          );
        }
        
        if (!currentGuide && !isLoadingGuide) {
          return <GuideLibrary />;
        }
        
        return (
          <div className="reader-container">
            {renderNavigation()}
            {currentGuide && <GuideReader guide={currentGuide} />}
          </div>
        );
        
      case 'bookmarks':
        if (isLoadingGuide) {
          return (
            <div className="loading-container">
              <div className="loading-message">Loading guide...</div>
            </div>
          );
        }
        
        if (!currentGuide && !isLoadingGuide) {
          return <GuideLibrary />;
        }
        
        return (
          <div className="bookmarks-container">
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