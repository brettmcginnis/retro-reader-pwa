import React, { useState, useEffect, useCallback, useRef } from 'react';

import { Guide } from '../types';
import { LINE_HEIGHT, LONGPRESS_DELAY, BOOKMARK_VIBRATION_DURATION, OVERSCAN_COUNT } from '../constants';

import { GuideLineRenderer } from './GuideLineRenderer';
import { GuideNavigationControls } from './GuideNavigationControls';
import { GuideSearchBar } from './GuideSearchBar';
import { BookmarkModal } from './BookmarkModal';

interface GuideReaderViewProps {
  guide: Guide;
  lines: string[];
  currentLine: number;
  totalLines: number;
  isLoading: boolean;
  searchQuery: string;
  searchResults: { line: number; content: string }[];
  initialLine: number;
  onLineChange: (line: number) => void;
  onSearch: (query: string) => void;
  onAddBookmark: (line: number, title: string, note?: string) => Promise<boolean>;
  onSetAsCurrentPosition: (line: number) => Promise<boolean>;
  onJumpToCurrentPosition: () => Promise<number | null>;
  onScrollingStateChange: (isScrolling: boolean) => void;
  onInitialScroll: () => void;
}

const GuideReaderViewComponent: React.FC<GuideReaderViewProps> = ({
  guide,
  lines,
  currentLine,
  totalLines,
  isLoading,
  searchQuery,
  searchResults,
  initialLine,
  onLineChange: _onLineChange,
  onSearch,
  onAddBookmark,
  onSetAsCurrentPosition,
  onJumpToCurrentPosition,
  onScrollingStateChange: _onScrollingStateChange,
  onInitialScroll
}) => {
  const [showSearch, setShowSearch] = useState(false);
  const [showBookmarkModal, setShowBookmarkModal] = useState(false);
  const [bookmarkLine, setBookmarkLine] = useState(1);
  const [bookmarkTitle, setBookmarkTitle] = useState('');
  const [bookmarkNote, setBookmarkNote] = useState('');
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 100 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const lineHeightRef = useRef(LINE_HEIGHT);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasInitiallyScrolled = useRef(false);

  // Calculate visible range for virtual scrolling
  const updateVisibleRange = useCallback(() => {
    if (!containerRef.current || isLoading) return;
    
    const container = containerRef.current;
    const { scrollTop, clientHeight } = container;
    const lineHeight = lineHeightRef.current;
    
    const startIndex = Math.max(0, Math.floor(scrollTop / lineHeight) - OVERSCAN_COUNT * 5);
    const endIndex = Math.min(totalLines, Math.ceil((scrollTop + clientHeight) / lineHeight) + OVERSCAN_COUNT * 5);
    
    setVisibleRange(prev => {
      if (Math.abs(prev.start - startIndex) > OVERSCAN_COUNT || Math.abs(prev.end - endIndex) > OVERSCAN_COUNT) {
        return { start: startIndex, end: endIndex };
      }
      return prev;
    });
  }, [isLoading, totalLines]);

  // Scroll to a specific line
  const scrollToLine = useCallback((line: number, behavior: ScrollBehavior = 'smooth') => {
    if (!containerRef.current || !lineHeightRef.current) return;
    
    const targetScrollTop = (line - 1) * lineHeightRef.current;
    containerRef.current.scrollTo({
      top: targetScrollTop,
      behavior
    });
  }, []);

  // Long press handlers
  const handleLongPressStart = useCallback((lineNumber: number) => {
    longPressTimerRef.current = setTimeout(() => {
      if ('vibrate' in navigator) {
        navigator.vibrate(BOOKMARK_VIBRATION_DURATION);
      }
      setBookmarkLine(lineNumber);
      setBookmarkTitle(`Line ${lineNumber}`);
      setBookmarkNote('');
      setShowBookmarkModal(true);
    }, LONGPRESS_DELAY);
  }, []);

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

  const handleJumpToCurrentPosition = async () => {
    const position = await onJumpToCurrentPosition();
    if (position) {
      scrollToLine(position);
    }
  };

  const handleSetAsCurrentPosition = async () => {
    await onSetAsCurrentPosition(currentLine);
  };

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
      <header className="bg-white dark:bg-retro-900 border-b border-retro-200 dark:border-retro-700 p-4">
        <h1>{guide.title}</h1>
        <button onClick={() => setShowSearch(!showSearch)}>
          {showSearch ? 'Hide Search' : 'Search'}
        </button>
      </header>

      {showSearch && (
        <GuideSearchBar
          searchQuery={searchQuery}
          searchResults={searchResults}
          onSearch={onSearch}
          onJumpToResult={scrollToLine}
        />
      )}

      <GuideNavigationControls
        currentLine={currentLine}
        totalLines={totalLines}
        isLoading={isLoading}
        onLineChange={scrollToLine}
        onJumpToCurrentPosition={handleJumpToCurrentPosition}
        onSetAsCurrentPosition={handleSetAsCurrentPosition}
      />

      <div 
        className="flex-1 overflow-y-auto bg-white dark:bg-retro-900 scrollbar-thin" 
        ref={containerRef}
        onScroll={updateVisibleRange}
      >
        <div className="relative" ref={contentRef} style={{ height: totalHeight }}>
          <div style={{ transform: `translateY(${offsetTop}px)` }}>
            {visibleLines.map((line, index) => {
              const lineNumber = start + index + 1;
              return (
                <GuideLineRenderer
                  key={lineNumber}
                  line={line}
                  lineNumber={lineNumber}
                  isSelected={lineNumber === currentLine}
                  lineHeight={lineHeightRef.current}
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
        onClose={() => setShowBookmarkModal(false)}
      />
    </div>
  );
};

GuideReaderViewComponent.displayName = 'GuideReaderView';

export const GuideReaderView = React.memo(GuideReaderViewComponent);