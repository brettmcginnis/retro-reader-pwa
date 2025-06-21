import React, { useEffect } from 'react';
import { AppProvider, useApp } from '../contexts/AppContext';
import { GuideLibrary } from './GuideLibrary';
import { GuideReader } from './GuideReader';
import { BookmarkManager } from './BookmarkManager';
import { useGuides } from '../hooks/useGuides';
import { Guide } from '../types';

const AppContent: React.FC = () => {
  const { currentView, setCurrentView, currentGuideId, setCurrentGuideId } = useApp();
  const { getGuide } = useGuides();
  const [currentGuide, setCurrentGuide] = React.useState<Guide | null>(null);

  // Load current guide when ID changes
  useEffect(() => {
    const loadGuide = async () => {
      if (currentGuideId) {
        try {
          const guide = await getGuide(currentGuideId);
          setCurrentGuide(guide);
        } catch (error) {
          console.error('Failed to load guide:', error);
          setCurrentGuideId(null);
          setCurrentView('library');
        }
      } else {
        setCurrentGuide(null);
      }
    };

    loadGuide();
  }, [currentGuideId, getGuide, setCurrentGuideId, setCurrentView]);

  // Handle escape key to go back to library
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && currentView !== 'library') {
        setCurrentView('library');
        setCurrentGuideId(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentView, setCurrentView, setCurrentGuideId]);

  // Setup service worker
  useEffect(() => {
    const setupServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('SW registered: ', registration);
        } catch (registrationError) {
          console.log('SW registration failed: ', registrationError);
        }
      }
    };

    setupServiceWorker();
  }, []);

  const handleGotoLine = () => {
    // This will be handled by switching to reader view
    // The GuideReader component will handle the line navigation
    setCurrentView('reader');
  };

  const renderNavigation = () => {
    if (currentView === 'library') return null;

    return (
      <nav className={currentView === 'reader' ? 'reader-nav' : 'bookmarks-nav'}>
        <button 
          onClick={() => {
            setCurrentView('library');
            setCurrentGuideId(null);
          }} 
          className="nav-btn"
        >
          ← Library
        </button>
        {currentView === 'reader' && (
          <button 
            onClick={() => setCurrentView('bookmarks')} 
            className="nav-btn"
          >
            Bookmarks
          </button>
        )}
        {currentView === 'bookmarks' && (
          <button 
            onClick={() => setCurrentView('reader')} 
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
        if (!currentGuide) {
          setCurrentView('library');
          return <GuideLibrary />;
        }
        return (
          <div className="reader-container">
            {renderNavigation()}
            <GuideReader guide={currentGuide} />
          </div>
        );
        
      case 'bookmarks':
        if (!currentGuide) {
          setCurrentView('library');
          return <GuideLibrary />;
        }
        return (
          <div className="bookmarks-container">
            {renderNavigation()}
            <BookmarkManager 
              guide={currentGuide} 
              onGotoLine={handleGotoLine}
            />
          </div>
        );
        
      default:
        return <GuideLibrary />;
    }
  };

  return renderContent();
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};