import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Guide } from '../types';
import { useBookmarkStore } from '../stores/useBookmarkStore';
import { useToast } from '../contexts/useToast';
import { useReaderStore } from '../stores/useReaderStore';
import { GuideReaderView } from '../components/GuideReaderView';

interface GuideReaderContainerProps {
  guide: Guide;
}

export const GuideReaderContainer: React.FC<GuideReaderContainerProps> = ({ guide }) => {
  const { 
    bookmarks, 
    addBookmark, 
    deleteBookmark, 
    updateBookmark, 
    loadBookmarks,
    saveCurrentPositionBookmark,
    getCurrentPositionBookmark,
    setCurrentGuideId,
    currentPosition 
  } = useBookmarkStore();
  
  // Set the current guide ID when component mounts or guide changes
  useEffect(() => {
    setCurrentGuideId(guide.id);
  }, [guide.id, setCurrentGuideId]);
  const { showToast } = useToast();
  const { 
    displaySettings,
    setDisplaySettings 
  } = useReaderStore();
  
  // Basic state
  const [currentLine, setCurrentLine] = useState(1);
  const [totalLines, setTotalLines] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  
  // References
  const guideRef = useRef<string[]>([]);
  const lastContentRef = useRef<string>('');
  const hasSetInitialPosition = useRef(false);
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
  
  
  // Set initial position from current position bookmark - only once
  useEffect(() => {
    if (!isLoading && !hasSetInitialPosition.current && currentPosition > 1) {
      setCurrentLine(currentPosition);
      hasSetInitialPosition.current = true;
    }
  }, [isLoading, currentPosition]);
  
  
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
      await saveCurrentPositionBookmark(guide.id, line);
      return true;
    } catch (error) {
      showToast('error', 'Failed to set current position', error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  }, [guide.id, saveCurrentPositionBookmark, showToast]);
  
  // Jump to current position
  const handleJumpToCurrentPosition = useCallback(async () => {
    try {
      const currentPosBookmark = await getCurrentPositionBookmark(guide.id);
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
  }, [guide.id, getCurrentPositionBookmark, showToast]);
  
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
  
  
  // Handle font size change
  const handleFontSizeChange = useCallback((newSize: number) => {
    const size = Math.max(10, Math.min(24, newSize)); // Clamp between 10 and 24
    setDisplaySettings({ fontSize: size });
  }, [setDisplaySettings]);
  
  // Handle zoom level change
  const handleZoomChange = useCallback((newZoom: number) => {
    const zoom = Math.max(0.5, Math.min(2, newZoom)); // Clamp between 50% and 200%
    setDisplaySettings({ zoomLevel: zoom });
  }, [setDisplaySettings]);
  
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
      initialLine={currentPosition}
      fontSize={displaySettings.fontSize}
      zoomLevel={displaySettings.zoomLevel}
      onLineChange={handleLineChange}
      onSearch={performSearch}
      onAddBookmark={handleAddBookmark}
      onSetAsCurrentPosition={handleSetAsCurrentPosition}
      onJumpToCurrentPosition={handleJumpToCurrentPosition}
      onScrollingStateChange={handleScrollingStateChange}
      onFontSizeChange={handleFontSizeChange}
      onZoomChange={handleZoomChange}
      onDeleteBookmark={deleteBookmark}
      onUpdateBookmark={updateBookmark}
      onRefreshBookmarks={() => loadBookmarks(guide.id)}
    />
  );
};
