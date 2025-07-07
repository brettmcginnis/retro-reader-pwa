import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Guide } from '../types';
import { useProgress } from '../hooks/useProgress';
import { useBookmarks } from '../hooks/useBookmarks';
import { useToast } from '../contexts/useToast';
import { db } from '../services/database';
import { GuideReaderView } from '../components/GuideReaderView';

interface GuideReaderContainerProps {
  guide: Guide;
}

export const GuideReaderContainer: React.FC<GuideReaderContainerProps> = ({ guide }) => {
  const { progress, saveProgress } = useProgress(guide.id);
  const { addBookmark, bookmarks } = useBookmarks(guide.id);
  const { showToast } = useToast();
  
  // Basic state
  const [currentLine, setCurrentLine] = useState(1);
  const [totalLines, setTotalLines] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  // Font size and zoom level state - will be loaded from progress
  const [fontSize, setFontSize] = useState(14); // Default to 14px
  const [zoomLevel, setZoomLevel] = useState(1); // Default to 100%
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ line: number; content: string }[]>([]);
  
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
  
  // Load font size and zoom from progress
  useEffect(() => {
    if (progress) {
      if (progress.fontSize) setFontSize(progress.fontSize);
      if (progress.zoomLevel) setZoomLevel(progress.zoomLevel);
    }
  }, [progress]);
  
  // Set initial position from saved progress or current position bookmark - only once
  useEffect(() => {
    if (!isLoading && !hasSetInitialPosition.current) {
      // Check for current position bookmark first
      db.getCurrentPositionBookmark(guide.id).then(currentPosBookmark => {
        if (currentPosBookmark) {
          setCurrentLine(currentPosBookmark.line);
          hasSetInitialPosition.current = true;
        } else if (progress) {
          // Fall back to progress if no current position bookmark
          setCurrentLine(progress.line);
          hasSetInitialPosition.current = true;
        }
      }).catch(err => {
        console.error('Failed to load current position bookmark:', err);
        // Fall back to progress on error
        if (progress) {
          setCurrentLine(progress.line);
          hasSetInitialPosition.current = true;
        }
      });
    }
  }, [progress, isLoading, guide.id]);
  
  // Save progress when current line changes (with debounce)
  useEffect(() => {
    if (isLoading || !totalLines) return;
    
    // Only save progress when the user is not actively scrolling
    if (userScrollingRef.current) return;
    
    // Don't save progress during initial setup
    if (!hasInitiallyScrolled.current) return;
    
    const timer = setTimeout(() => {
      saveProgress({
        guideId: guide.id,
        line: currentLine,
        percentage: Math.min(100, Math.max(0, (currentLine / totalLines) * 100)),
        fontSize,
        zoomLevel
      }).catch(err => console.error('Failed to save progress:', err));
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [currentLine, guide.id, isLoading, saveProgress, totalLines, fontSize, zoomLevel]);
  
  // Search handling
  const performSearch = useCallback((query: string) => {
    setSearchQuery(query);
    
    if (query.length < 3 || isLoading) {
      setSearchResults([]);
      return;
    }
    
    // Simple search implementation
    const results: { line: number; content: string }[] = [];
    const searchTerm = query.toLowerCase();
    
    // Limit search to 10,000 lines for better performance
    const searchLimit = Math.min(guideRef.current.length, 10000);
    
    for (let i = 0; i < searchLimit; i++) {
      if (guideRef.current[i].toLowerCase().includes(searchTerm)) {
        results.push({
          line: i + 1,
          content: guideRef.current[i]
        });
        
        // Limit to 20 results
        if (results.length >= 20) break;
      }
    }
    
    setSearchResults(results);
  }, [isLoading]);
  
  // Add bookmark
  const handleAddBookmark = useCallback(async (line: number, title: string, note?: string) => {
    try {
      await addBookmark({
        guideId: guide.id,
        line,
        title,
        note
      });
      showToast('success', 'Bookmark added!', `Bookmark "${title}" created at line ${line}`);
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
      showToast('success', 'Current position set!', `Line ${line} is now your current reading position`);
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
        showToast('success', 'Jumped to current position', `Line ${currentPosBookmark.line}`);
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
      searchResults={searchResults}
      bookmarks={bookmarks}
      initialLine={hasSetInitialPosition.current ? currentLine : (progress?.line || 1)}
      fontSize={fontSize}
      zoomLevel={zoomLevel}
      onLineChange={handleLineChange}
      onSearch={performSearch}
      onAddBookmark={handleAddBookmark}
      onSetAsCurrentPosition={handleSetAsCurrentPosition}
      onJumpToCurrentPosition={handleJumpToCurrentPosition}
      onScrollingStateChange={handleScrollingStateChange}
      onInitialScroll={handleInitialScroll}
      onFontSizeChange={handleFontSizeChange}
      onZoomChange={handleZoomChange}
    />
  );
};