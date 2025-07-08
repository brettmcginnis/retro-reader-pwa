import React, { useEffect, useMemo } from 'react';
import { useApp } from '../contexts/useApp';
import { useGuides } from '../hooks/useGuides';
import { Guide } from '../types';
import { AppContentView } from '../components/AppContentView';

export const AppContentContainer: React.FC = () => {
  const { currentView, setCurrentView, currentGuideId, setCurrentGuideId, setNavigationTargetLine } = useApp();
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

  // On mount, check URL for guideId and open if present
  useEffect(() => {
    const match = window.location.pathname.match(/^\/retro-reader-pwa\/guide\/(.+)$/);
    if (match && match[1]) {
      setCurrentGuideId(match[1]);
      setCurrentView('reader');
    }
    // Listen for popstate to handle browser navigation
    const onPopState = () => {
      const match = window.location.pathname.match(/^\/retro-reader-pwa\/guide\/(.+)$/);
      if (match && match[1]) {
        setCurrentGuideId(match[1]);
        setCurrentView('reader');
      } else {
        setCurrentGuideId(null);
        setCurrentView('library');
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [setCurrentGuideId, setCurrentView]);

  const handleBackToLibrary = () => {
    setCurrentView('library');
    setCurrentGuideId(null);
    window.history.pushState({}, '', '/retro-reader-pwa/');
  };

  const handleViewChange = (view: 'library' | 'reader' | 'bookmarks') => {
    setCurrentView(view);
  };

  const handleNavigateToLine = (line: number) => {
    // Set the target line in context and switch to reader view
    setNavigationTargetLine(line);
    setCurrentView('reader');
  };

  return (
    <AppContentView
      currentView={currentView}
      currentGuide={memoizedCurrentGuide}
      isLoadingGuide={isLoadingGuide}
      onBackToLibrary={handleBackToLibrary}
      onViewChange={handleViewChange}
      onNavigateToLine={handleNavigateToLine}
    />
  );
};