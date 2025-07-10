import React, { useState, useEffect, useCallback, useRef } from 'react';

import { Guide, Bookmark } from '../types';
import { LINE_HEIGHT, LONGPRESS_DELAY, BOOKMARK_VIBRATION_DURATION, OVERSCAN_COUNT } from '../constants';

import { GuideLineRenderer } from './GuideLineRenderer';
import { TopNavigationBar } from './TopNavigationBar';
import { SimpleBottomNavigation } from './SimpleBottomNavigation';
import { NavigationModal } from './NavigationModal';
import { BookmarksOverlay } from './BookmarksOverlay';
import { BookmarkModal } from './BookmarkModal';
import { FloatingProgressIndicator } from './FloatingProgressIndicator';
import { GuideSearchBar } from './GuideSearchBar';
import { useToast } from '../contexts/useToast';

interface GuideReaderViewProps {
  guide: Guide;
  lines: string[];
  currentLine: number;
  totalLines: number;
  isLoading: boolean;
  searchQuery: string;
  bookmarks: Bookmark[];
  initialLine: number;
  fontSize: number;
  zoomLevel: number;
  currentView?: 'library' | 'reader' | 'bookmarks';
  onLineChange: (line: number) => void;
  onSearch: (query: string) => void;
  onAddBookmark: (line: number, title: string, note?: string) => Promise<boolean>;
  onSetAsCurrentPosition: (line: number) => Promise<boolean>;
  onJumpToCurrentPosition: () => Promise<number | null>;
  onScrollingStateChange: (isScrolling: boolean) => void;
  onInitialScroll: () => void;
  onFontSizeChange: (size: number) => void;
  onZoomChange: (zoom: number) => void;
  onBackToLibrary: () => void;
  onViewChange?: (view: 'library' | 'reader' | 'bookmarks') => void;
  onDeleteBookmark: (id: string) => Promise<void>;
  onUpdateBookmark: (id: string, updates: Partial<Bookmark>) => Promise<void>;
  onRefreshBookmarks: () => Promise<void>;
}

const GuideReaderViewComponent: React.FC<GuideReaderViewProps> = ({
  guide,
  lines,
  currentLine,
  totalLines,
  isLoading,
  searchQuery,
  bookmarks,
  initialLine,
  fontSize,
  zoomLevel,
  currentView: _currentView,
  onLineChange: _onLineChange,
  onSearch,
  onAddBookmark,
  onSetAsCurrentPosition,
  onJumpToCurrentPosition,
  onScrollingStateChange: _onScrollingStateChange,
  onInitialScroll,
  onFontSizeChange,
  onZoomChange,
  onBackToLibrary,
  onViewChange: _onViewChange,
  onDeleteBookmark,
  onUpdateBookmark,
  onRefreshBookmarks
}) => {
  const [showSearch, setShowSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<{ line: number; content: string }[]>([]);
  const [showBookmarkModal, setShowBookmarkModal] = useState(false);
  const [bookmarkLine, setBookmarkLine] = useState(1);
  const [bookmarkTitle, setBookmarkTitle] = useState('');
  const [bookmarkNote, setBookmarkNote] = useState('');
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 100 });
  const [showFloatingProgress, setShowFloatingProgress] = useState(false);
  const [showNavigationModal, setShowNavigationModal] = useState(false);
  const [showBookmarksOverlay, setShowBookmarksOverlay] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const lineHeightRef = useRef(LINE_HEIGHT);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasInitiallyScrolled = useRef(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const { showToast, showConfirmation } = useToast();
  
  // Create a map of bookmarked lines for quick lookup
  const bookmarkedLines = new Map<number, Bookmark>();
  bookmarks.forEach(bookmark => {
    bookmarkedLines.set(bookmark.line, bookmark);
  });

  // Calculate visible range for virtual scrolling
  const updateVisibleRange = useCallback(() => {
    if (!containerRef.current || isLoading) return;
    
    const container = containerRef.current;
    const { scrollTop, clientHeight } = container;
    const lineHeight = lineHeightRef.current * zoomLevel;
    
    const startIndex = Math.max(0, Math.floor(scrollTop / lineHeight) - OVERSCAN_COUNT * 10);
    const endIndex = Math.min(totalLines, Math.ceil((scrollTop + clientHeight) / lineHeight) + OVERSCAN_COUNT * 10);
    
    setVisibleRange(prev => {
      if (Math.abs(prev.start - startIndex) > OVERSCAN_COUNT || Math.abs(prev.end - endIndex) > OVERSCAN_COUNT) {
        return { start: startIndex, end: endIndex };
      }
      return prev;
    });

    // Show floating progress on mobile when scrolling
    if (window.innerWidth < 640) {
      setShowFloatingProgress(true);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        setShowFloatingProgress(false);
      }, 1500);
    }
  }, [isLoading, totalLines, zoomLevel]);

  // Scroll to a specific line
  const scrollToLine = useCallback((line: number, behavior: ScrollBehavior = 'smooth') => {
    if (!containerRef.current || !lineHeightRef.current) return;
    
    const targetScrollTop = (line - 1) * lineHeightRef.current * zoomLevel;
    containerRef.current.scrollTo({
      top: targetScrollTop,
      behavior
    });
  }, [zoomLevel]);

  // Long press handlers
  const handleLongPressStart = useCallback((lineNumber: number) => {
    longPressTimerRef.current = setTimeout(() => {
      if ('vibrate' in navigator) {
        navigator.vibrate(BOOKMARK_VIBRATION_DURATION);
      }
      setBookmarkLine(lineNumber);
      // Pre-fill title with the actual line content, trimmed
      const lineContent = lines[lineNumber - 1]?.trim() || `Line ${lineNumber}`;
      setBookmarkTitle(lineContent);
      setBookmarkNote('');
      setShowBookmarkModal(true);
    }, LONGPRESS_DELAY);
  }, [lines]);

  const handleLongPressEnd = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  // Bookmark modal handlers
  const handleSaveBookmark = async () => {
    const success = await onAddBookmark(bookmarkLine, bookmarkTitle, bookmarkNote);
    if (success) {
      setShowBookmarkModal(false);
    }
  };

  // Bookmark overlay handlers
  const handleDeleteBookmark = (bookmarkId: string) => {
    const bookmark = bookmarks.find(b => b.id === bookmarkId);
    showConfirmation({
      title: 'Delete Bookmark',
      message: `Are you sure you want to delete the bookmark "${bookmark?.title}"?`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          await onDeleteBookmark(bookmarkId);
          showToast('success', 'Bookmark deleted', 'Bookmark has been successfully deleted');
        } catch (error) {
          showToast('error', 'Failed to delete bookmark', error instanceof Error ? error.message : 'Unknown error');
        }
      }
    });
  };

  const handleAddBookmarkFromOverlay = async (bookmark: Omit<Bookmark, 'id' | 'dateCreated'>) => {
    try {
      const success = await onAddBookmark(bookmark.line, bookmark.title, bookmark.note);
      if (success) {
        showToast('success', 'Bookmark Added', 'Bookmark added successfully');
        // Return a new bookmark object matching the expected return type
        const newBookmark: Bookmark = {
          ...bookmark,
          id: Date.now().toString(36) + Math.random().toString(36).substr(2),
          dateCreated: new Date()
        };
        return newBookmark;
      } else {
        throw new Error('Failed to add bookmark');
      }
    } catch (error) {
      showToast('error', 'Error', `Failed to save bookmark: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  };

  const handleUpdateBookmark = async (id: string, updates: Partial<Bookmark>) => {
    try {
      await onUpdateBookmark(id, updates);
      showToast('success', 'Bookmark Updated', 'Bookmark updated successfully');
    } catch (error) {
      showToast('error', 'Error', `Failed to update bookmark: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  };

  const handleSetBookmarkLineAsCurrentPosition = async () => {
    const success = await onSetAsCurrentPosition(bookmarkLine);
    if (success) {
      await onRefreshBookmarks();
      setShowBookmarkModal(false);
    }
  };

  // Update line height when font size or zoom changes
  useEffect(() => {
    lineHeightRef.current = Math.ceil(fontSize * 1.5);
    // Trigger a recalculation of visible range
    updateVisibleRange();
  }, [fontSize, zoomLevel, updateVisibleRange]);

  // Compute search results when search query changes
  useEffect(() => {
    if (!searchQuery) {
      setSearchResults([]);
      return;
    }

    const results: { line: number; content: string }[] = [];
    const query = searchQuery.toLowerCase();
    
    lines.forEach((line, index) => {
      if (line.toLowerCase().includes(query)) {
        results.push({
          line: index + 1,
          content: line
        });
      }
    });
    
    setSearchResults(results);
  }, [searchQuery, lines]);

  // Initial scroll to saved position
  useEffect(() => {
    if (!hasInitiallyScrolled.current && initialLine > 1 && totalLines > 0) {
      hasInitiallyScrolled.current = true;
      scrollToLine(initialLine, 'auto');
      onInitialScroll();
    }
  }, [initialLine, totalLines, scrollToLine, onInitialScroll]);

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-retro-50 dark:bg-retro-950">
        <div className="text-lg text-retro-600 dark:text-retro-400">Loading guide...</div>
      </div>
    );
  }

  const { start, end } = visibleRange;
  const visibleLines = lines.slice(start, end);
  const totalHeight = totalLines * lineHeightRef.current;
  const offsetTop = start * lineHeightRef.current;

  return (
    <div className="flex flex-col h-screen bg-retro-50 dark:bg-retro-950">
      <TopNavigationBar
        guideTitle={guide.title}
        currentLine={currentLine}
        totalLines={totalLines}
        fontSize={fontSize}
        zoomLevel={zoomLevel}
        searchQuery={searchQuery}
        isSearching={showSearch}
        onBack={onBackToLibrary}
        onSearch={onSearch}
        onSearchToggle={() => setShowSearch(!showSearch)}
        onFontSizeChange={onFontSizeChange}
        onZoomChange={onZoomChange}
      />

      {/* Search Bar */}
      {showSearch && (
        <div className="px-4 py-2 bg-retro-50 dark:bg-retro-900 border-b border-retro-200 dark:border-retro-700">
          <GuideSearchBar
            searchQuery={searchQuery}
            searchResults={searchResults}
            onSearch={onSearch}
            onJumpToResult={(line) => {
              scrollToLine(line);
              setShowSearch(false);
            }}
          />
        </div>
      )}

      {/* Navigation controls for testing - contains only the input, not the line info */}
      <div className="sr-only" data-testid="test-navigation-controls">
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const targetLine = parseInt(formData.get('line') as string, 10);
          if (targetLine >= 1 && targetLine <= totalLines) {
            scrollToLine(targetLine);
          }
        }}>
          <input
            id="line-input"
            name="line"
            type="number"
            min={1}
            max={totalLines}
            value={currentLine}
            onChange={(e) => {
              const value = parseInt(e.target.value, 10);
              if (!isNaN(value) && value >= 1 && value <= totalLines) {
                scrollToLine(value);
              }
            }}
            disabled={isLoading}
            aria-label="Go to line"
          />
        </form>
      </div>

      <div 
        className="flex-1 overflow-auto bg-white dark:bg-retro-900 scrollbar-thin pt-14 pb-16"
        ref={containerRef}
        onScroll={updateVisibleRange}
        style={{
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
          touchAction: 'pan-y'
        }}
      >
        <div 
          className="relative" 
          ref={contentRef} 
          style={{ 
            height: totalHeight,
            zoom: zoomLevel,
            willChange: 'zoom'
          }}
        >
          <div style={{ 
            transform: `translateY(${offsetTop}px)`,
            willChange: 'transform'
          }}>
            {visibleLines.map((line, index) => {
              const lineNumber = start + index + 1;
              const bookmark = bookmarkedLines.get(lineNumber);
              return (
                <GuideLineRenderer
                  key={lineNumber}
                  line={line}
                  lineNumber={lineNumber}
                  isSelected={lineNumber === currentLine}
                  isBookmarked={!!bookmark}
                  isCurrentPosition={bookmark?.isCurrentPosition || false}
                  lineHeight={lineHeightRef.current}
                  fontSize={fontSize}
                  searchQuery={searchQuery}
                  onMouseDown={handleLongPressStart}
                  onMouseUp={handleLongPressEnd}
                  onMouseLeave={handleLongPressEnd}
                  onTouchStart={handleLongPressStart}
                  onTouchEnd={handleLongPressEnd}
                />
              );
            })}
          </div>
        </div>
      </div>

      <BookmarkModal
        isOpen={showBookmarkModal}
        line={bookmarkLine}
        title={bookmarkTitle}
        note={bookmarkNote}
        onTitleChange={setBookmarkTitle}
        onNoteChange={setBookmarkNote}
        onSave={handleSaveBookmark}
        onSetAsCurrentPosition={handleSetBookmarkLineAsCurrentPosition}
        onClose={() => setShowBookmarkModal(false)}
      />

      <NavigationModal
        isOpen={showNavigationModal}
        currentLine={currentLine}
        totalLines={totalLines}
        onNavigate={scrollToLine}
        onClose={() => setShowNavigationModal(false)}
        onJumpToCurrentPosition={onJumpToCurrentPosition}
      />

      <BookmarksOverlay
        isOpen={showBookmarksOverlay}
        guide={guide}
        currentPositionBookmark={bookmarks.find(b => b.isCurrentPosition)}
        sortedBookmarks={bookmarks.filter(b => !b.isCurrentPosition).sort((a, b) => a.line - b.line)}
        lineCount={totalLines}
        onClose={() => setShowBookmarksOverlay(false)}
        onGotoLine={scrollToLine}
        onAddBookmark={handleAddBookmarkFromOverlay}
        onUpdateBookmark={handleUpdateBookmark}
        onDeleteBookmark={handleDeleteBookmark}
      />

      <SimpleBottomNavigation
        onNavigate={() => setShowNavigationModal(true)}
        onBookmarks={async () => {
          await onRefreshBookmarks();
          setShowBookmarksOverlay(true);
        }}
        disabled={isLoading}
      />

      {/* Floating Progress Indicator - Only on mobile */}
      <FloatingProgressIndicator
        currentLine={currentLine}
        totalLines={totalLines}
        isVisible={showFloatingProgress}
      />
    </div>
  );
};

GuideReaderViewComponent.displayName = 'GuideReaderView';

export const GuideReaderView = React.memo(GuideReaderViewComponent);
