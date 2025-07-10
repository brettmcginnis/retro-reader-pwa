import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Guide } from '../types';
import { useProgress } from '../hooks/useProgress';
import { useBookmarks } from '../hooks/useBookmarks';
import { useToast } from '../contexts/useToast';
import { useApp } from '../contexts/useApp';
import { db } from '../services/database';
import { GuideReaderView } from '../components/GuideReaderView';
import { getScreenIdentifier } from '../utils/screenUtils';

interface GuideReaderContainerProps {
  guide: Guide;
  currentView?: 'library' | 'reader';
  onViewChange?: (view: 'library' | 'reader') => void;
}

export const GuideReaderContainer: React.FC<GuideReaderContainerProps> = ({ guide, currentView, onViewChange }) => {
  const { progress, saveProgress } = useProgress(guide.id);
  const { addBookmark, bookmarks, deleteBookmark, updateBookmark, refresh: refreshBookmarks } = useBookmarks(guide.id);
  const { showToast } = useToast();
  const { navigationTargetLine, setNavigationTargetLine } = useApp();
  
  // Basic state
  const [currentLine, setCurrentLine] = useState(1);
  const [totalLines, setTotalLines] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // Font size and zoom level state - will be loaded from progress
  const [fontSize, setFontSize] = useState(14); // Default to 14px
  const [zoomLevel, setZoomLevel] = useState(1); // Default to 100%
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  
  // References
  const guideRef = useRef<string[]>([]);
  const lastContentRef = useRef<string>('');
  const hasSetInitialPosition = useRef(false);
  const hasInitiallyScrolled = useRef(false);
  const userScrollingRef = useRef(false);
  const userScrollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Initialize guide data - only once
  useEffect(() => {
    // Only reload if content actually changed
    if (lastContentRef.current === guide.content) {
      return;
    }
    
    const loadGuide = () => {
      // Split content into lines
      const lines = guide.content.split('\n');
      guideRef.current = lines;
      setTotalLines(lines.length);
      lastContentRef.current = guide.content;
      
      setIsLoading(false);
    };
    
    setIsLoading(true);
    loadGuide();
    
    // Clean up on unmount
    return () => {
      guideRef.current = [];
    };
  }, [guide]);
  
  // Load font size and zoom from progress - check screen-specific settings first
  useEffect(() => {
    if (progress) {
      const screenId = getScreenIdentifier();
      
      // Check for screen-specific settings first
      if (progress.screenSettings && progress.screenSettings[screenId]) {
        const screenSettings = progress.screenSettings[screenId];
        setFontSize(screenSettings.fontSize);
        setZoomLevel(screenSettings.zoomLevel);
      } else {
        // Fall back to general settings
        if (progress.fontSize) setFontSize(progress.fontSize);
        if (progress.zoomLevel) setZoomLevel(progress.zoomLevel);
      }
    }
  }, [progress]);
  
  // Listen for window resize to update screen ID and reapply settings
  useEffect(() => {
    const handleResize = () => {
      const newScreenId = getScreenIdentifier();
      
      // Always reapply settings on resize
      if (progress) {
        // Check for screen-specific settings first
        if (progress.screenSettings && progress.screenSettings[newScreenId]) {
          const screenSettings = progress.screenSettings[newScreenId];
          setFontSize(screenSettings.fontSize);
          setZoomLevel(screenSettings.zoomLevel);
        } else {
          // Fall back to general settings if no screen-specific settings exist
          if (progress.fontSize) setFontSize(progress.fontSize);
          if (progress.zoomLevel) setZoomLevel(progress.zoomLevel);
        }
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [progress]);
  
  // Set initial position from navigation target, saved progress or current position bookmark - only once
  useEffect(() => {
    if (!isLoading && !hasSetInitialPosition.current) {
      console.log('[GuideReaderContainer] Setting initial position. Navigation target:', navigationTargetLine, 'Progress:', progress?.line);
      
      // Check for navigation target first
      if (navigationTargetLine !== null) {
        console.log('[GuideReaderContainer] Using navigation target line:', navigationTargetLine);
        setCurrentLine(navigationTargetLine);
        hasSetInitialPosition.current = true;
        // Clear the navigation target after using it
        setNavigationTargetLine(null);
      } else {
        // Check for current position bookmark
        db.getCurrentPositionBookmark(guide.id).then(currentPosBookmark => {
          if (currentPosBookmark) {
            console.log('[GuideReaderContainer] Using current position bookmark:', currentPosBookmark.line);
            setCurrentLine(currentPosBookmark.line);
            hasSetInitialPosition.current = true;
          } else if (progress) {
            // Fall back to progress if no current position bookmark
            console.log('[GuideReaderContainer] Using saved progress:', progress.line);
            setCurrentLine(progress.line);
            hasSetInitialPosition.current = true;
          } else {
            console.log('[GuideReaderContainer] No saved position found, staying at line 1');
          }
        }).catch(err => {
          console.error('Failed to load current position bookmark:', err);
          // Fall back to progress on error
          if (progress) {
            console.log('[GuideReaderContainer] Using saved progress after error:', progress.line);
            setCurrentLine(progress.line);
            hasSetInitialPosition.current = true;
          }
        });
      }
    }
  }, [progress, isLoading, guide.id, navigationTargetLine, setNavigationTargetLine]);

  // Handle navigation target changes after initial load
  useEffect(() => {
    if (navigationTargetLine !== null && hasSetInitialPosition.current && !isLoading) {
      setCurrentLine(navigationTargetLine);
      // Reset the scrolled flag to trigger scrolling
      hasInitiallyScrolled.current = false;
      // Clear the navigation target
      setNavigationTargetLine(null);
    }
  }, [navigationTargetLine, setNavigationTargetLine, isLoading]);
  
  // Save progress when current line changes (with debounce)
  useEffect(() => {
    if (isLoading || !totalLines) return;
    
    // Only save progress when the user is not actively scrolling
    if (userScrollingRef.current) return;
    
    // Don't save progress during initial setup
    if (!hasInitiallyScrolled.current) return;
    
    const timer = setTimeout(() => {
      const screenId = getScreenIdentifier();
      const existingProgress = progress || {
        guideId: guide.id,
        line: currentLine,
        percentage: 0,
        lastRead: new Date()
      };
      
      saveProgress({
        ...existingProgress,
        guideId: guide.id,
        line: currentLine,
        percentage: Math.min(100, Math.max(0, (currentLine / totalLines) * 100)),
        fontSize,
        zoomLevel,
        screenSettings: {
          ...existingProgress.screenSettings,
          [screenId]: {
            fontSize,
            zoomLevel
          }
        }
      }).catch(err => console.error('Failed to save progress:', err));
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [currentLine, guide.id, isLoading, saveProgress, totalLines, fontSize, zoomLevel, progress]);
  
  // Search handling
  const performSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);
  
  // Add bookmark
  const handleAddBookmark = useCallback(async (line: number, title: string, note?: string) => {
    try {
      await addBookmark({
        guideId: guide.id,
        line,
        title,
        note
      });
      showToast('success', 'Bookmark added!', `Bookmark '${title}' created at line ${line}`);
      return true;
    } catch (error) {
      showToast('error', 'Failed to add bookmark', error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  }, [guide.id, addBookmark, showToast]);
  
  // Set as current position
  const handleSetAsCurrentPosition = useCallback(async (line: number) => {
    try {
      await db.saveCurrentPositionBookmark(guide.id, line);
      return true;
    } catch (error) {
      showToast('error', 'Failed to set current position', error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  }, [guide.id, showToast]);
  
  // Jump to current position
  const handleJumpToCurrentPosition = useCallback(async () => {
    try {
      const currentPosBookmark = await db.getCurrentPositionBookmark(guide.id);
      if (currentPosBookmark) {
        return currentPosBookmark.line;
      } else {
        showToast('info', 'No current position saved', 'Tap any line to set your current reading position');
        return null;
      }
    } catch (error) {
      showToast('error', 'Failed to jump to position', error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  }, [guide.id, showToast]);
  
  // Handle line change with scrolling state management
  const handleLineChange = useCallback((line: number) => {
    setCurrentLine(line);
  }, []);
  
  const handleScrollingStateChange = useCallback((isScrolling: boolean) => {
    userScrollingRef.current = isScrolling;
    
    if (isScrolling) {
      // Clear existing timeout
      if (userScrollingTimeoutRef.current) {
        clearTimeout(userScrollingTimeoutRef.current);
      }
      
      userScrollingTimeoutRef.current = setTimeout(() => {
        userScrollingRef.current = false;
        userScrollingTimeoutRef.current = null;
      }, 500);
    }
  }, []);
  
  const handleInitialScroll = useCallback(() => {
    hasInitiallyScrolled.current = true;
  }, []);
  
  // Handle font size change
  const handleFontSizeChange = useCallback((newSize: number) => {
    const size = Math.max(10, Math.min(24, newSize)); // Clamp between 10 and 24
    setFontSize(size);
  }, []);
  
  // Handle zoom level change
  const handleZoomChange = useCallback((newZoom: number) => {
    const zoom = Math.max(0.5, Math.min(2, newZoom)); // Clamp between 50% and 200%
    setZoomLevel(zoom);
  }, []);
  
  const lines = guideRef.current;
  
  return (
    <GuideReaderView
      guide={guide}
      lines={lines}
      currentLine={currentLine}
      totalLines={totalLines}
      isLoading={isLoading}
      searchQuery={searchQuery}
      bookmarks={bookmarks}
      initialLine={navigationTargetLine || currentLine || progress?.line || 1}
      fontSize={fontSize}
      zoomLevel={zoomLevel}
      currentView={currentView}
      onLineChange={handleLineChange}
      onSearch={performSearch}
      onAddBookmark={handleAddBookmark}
      onSetAsCurrentPosition={handleSetAsCurrentPosition}
      onJumpToCurrentPosition={handleJumpToCurrentPosition}
      onScrollingStateChange={handleScrollingStateChange}
      onInitialScroll={handleInitialScroll}
      onFontSizeChange={handleFontSizeChange}
      onZoomChange={handleZoomChange}
      onBackToLibrary={() => onViewChange?.('library')}
      onViewChange={onViewChange}
      onDeleteBookmark={deleteBookmark}
      onUpdateBookmark={updateBookmark}
      onRefreshBookmarks={refreshBookmarks}
    />
  );
};