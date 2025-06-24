import React, { useEffect, useMemo } from 'react';
import { AppProvider } from '../contexts/AppContext';
import { ToastProvider } from '../contexts/ToastContext';
import { useApp } from '../contexts/useApp';
import { GuideLibrary } from './GuideLibrary';
import { GuideReader } from './GuideReader';
import { BookmarkManager } from './BookmarkManager';
import { useGuides } from '../hooks/useGuides';
import { Guide } from '../types';

const AppContent: React.FC = () => {
  const { currentView, setCurrentView, currentGuideId, setCurrentGuideId } = useApp();
  const { getGuide } = useGuides();
  const [currentGuide, setCurrentGuide] = React.useState<Guide | null>(null);
  const [isLoadingGuide, setIsLoadingGuide] = React.useState<boolean>(false);
  
  // Memoize the current guide to prevent unnecessary re-renders
  const memoizedCurrentGuide = useMemo(() => currentGuide, [currentGuide]);

  // Load current guide when ID changes
  useEffect(() => {
    const loadGuide = async () => {
      if (currentGuideId) {
        setIsLoadingGuide(true);
        try {
          const guide = await getGuide(currentGuideId);
          setCurrentGuide(guide);
          if (!guide) {
            console.error('Guide not found:', currentGuideId);
            setCurrentGuideId(null);
            setCurrentView('library');
          }
        } catch (error) {
          console.error('Failed to load guide:', error);
          setCurrentGuideId(null);
          setCurrentView('library');
        } finally {
          setIsLoadingGuide(false);
        }
      } else {
        setCurrentGuide(null);
        setIsLoadingGuide(false);
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
          const registration = await navigator.serviceWorker.register('/retro-reader-pwa/sw.js');
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
            {memoizedCurrentGuide && <GuideReader guide={memoizedCurrentGuide} />}
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
            {memoizedCurrentGuide && (
              <BookmarkManager 
                guide={memoizedCurrentGuide} 
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

export const App: React.FC = () => {
  return (
    <AppProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AppProvider>
  );
};