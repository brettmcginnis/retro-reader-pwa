import React, { useEffect } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { AppContentView } from '../components/AppContentView';

export const AppContentContainer: React.FC = () => {
  const { currentGuideId, setCurrentGuideId } = useAppStore();


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
    }
    // Listen for popstate to handle browser navigation
    const onPopState = () => {
      const match = window.location.pathname.match(/^\/retro-reader-pwa\/guide\/(.+)$/);
      if (match && match[1]) {
        setCurrentGuideId(match[1]);
      } else {
        setCurrentGuideId(null);
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [setCurrentGuideId]);

  return (
    <AppContentView
      currentGuideId={currentGuideId}
    />
  );
};