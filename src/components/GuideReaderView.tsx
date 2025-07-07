import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Guide } from '../types';

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

export const GuideReaderView: React.FC<GuideReaderViewProps> = ({
  guide,
  lines,
  currentLine,
  totalLines,
  isLoading,
  searchQuery,
  searchResults,
  initialLine,
  onLineChange,
  onSearch,
  onAddBookmark,
  onSetAsCurrentPosition,
  onJumpToCurrentPosition,
  onScrollingStateChange,
  onInitialScroll
}) => {
  // UI state
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 100 });
  const [showSearch, setShowSearch] = useState(false);
  const [showBookmarkModal, setShowBookmarkModal] = useState(false);
  const [bookmarkLine, setBookmarkLine] = useState<number>(1);
  const [bookmarkTitle, setBookmarkTitle] = useState('');
  const [bookmarkNote, setBookmarkNote] = useState('');
  
  // References
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const lineHeightRef = useRef(20);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasInitiallyScrolled = useRef(false);
  
  // Get line height after render
  useEffect(() => {
    if (!isLoading && contentRef.current) {
      const lineElement = contentRef.current.querySelector('.line');
      if (lineElement) {
        lineHeightRef.current = lineElement.clientHeight || 20;
      }
    }
  }, [isLoading]);
  
  // Calculate visible lines based on scroll position
  const updateVisibleRange = useCallback(() => {
    if (!containerRef.current || isLoading) return;
    
    const container = containerRef.current;
    const { scrollTop, clientHeight } = container;
    const lineHeight = lineHeightRef.current;
    
    // Calculate visible range with buffer
    const startIndex = Math.max(0, Math.floor(scrollTop / lineHeight) - 50);
    const endIndex = Math.min(totalLines, Math.ceil((scrollTop + clientHeight) / lineHeight) + 50);
    
    // Only update if the range actually changed significantly
    setVisibleRange(prev => {
      if (Math.abs(prev.start - startIndex) > 10 || Math.abs(prev.end - endIndex) > 10) {
        return { start: startIndex, end: endIndex };
      }
      return prev;
    });
  }, [isLoading, totalLines]);
  
  // Initialize visible range after mount
  useEffect(() => {
    if (!isLoading) {
      updateVisibleRange();
    }
  }, [isLoading, updateVisibleRange]);
  
  // Scroll to line when requested - optimized for virtual scrolling
  const scrollToLine = useCallback((lineNumber: number) => {
    if (isLoading || !containerRef.current) return;
    
    // Validate line number
    const targetLine = Math.max(1, Math.min(lineNumber, totalLines));
    
    // Set current line
    onLineChange(targetLine);
    
    // Calculate scroll position for virtual scrolling
    const targetScrollTop = (targetLine - 1) * lineHeightRef.current;
    const container = containerRef.current;
    
    onScrollingStateChange(true);
    container.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
    
    // Update visible range immediately
    updateVisibleRange();
    
    // Reset scrolling flag after animation
    setTimeout(() => {
      onScrollingStateChange(false);
    }, 800);
  }, [isLoading, totalLines, updateVisibleRange, onLineChange, onScrollingStateChange]);
  
  // Initial scroll to current line - only once on mount
  useEffect(() => {
    if (!isLoading && containerRef.current && !hasInitiallyScrolled.current) {
      // Use a small delay to ensure rendering is complete
      const timer = setTimeout(() => {
        const targetScrollTop = (initialLine - 1) * lineHeightRef.current;
        containerRef.current?.scrollTo({ top: targetScrollTop, behavior: 'auto' });
        
        updateVisibleRange();
        hasInitiallyScrolled.current = true;
        onInitialScroll();
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading, initialLine, updateVisibleRange, onInitialScroll]);
  
  // Track visible lines on scroll with virtual scrolling
  useEffect(() => {
    if (isLoading || !containerRef.current) return;
    
    const handleScroll = () => {
      // Update visible range for virtual scrolling
      updateVisibleRange();
      
      // Calculate current line based on scroll position
      const container = containerRef.current;
      if (container) {
        const scrollTop = container.scrollTop;
        const lineHeight = lineHeightRef.current;
        const currentLineFromScroll = Math.max(1, Math.floor(scrollTop / lineHeight) + 1);
        
        // Update current line if it has changed
        onLineChange(currentLineFromScroll);
      }
      
      // Mark that user is actively scrolling
      onScrollingStateChange(true);
    };
    
    // Use a debounced version for better performance
    let scrollTimer: ReturnType<typeof setTimeout> | null = null;
    
    const debouncedScroll = () => {
      if (scrollTimer) clearTimeout(scrollTimer);
      
      scrollTimer = setTimeout(() => {
        handleScroll();
        scrollTimer = null;
      }, 50); // Reduced debounce time for better responsiveness
    };
    
    const container = containerRef.current;
    container.addEventListener('scroll', debouncedScroll);
    
    return () => {
      container?.removeEventListener('scroll', debouncedScroll);
      if (scrollTimer) clearTimeout(scrollTimer);
    };
  }, [isLoading, updateVisibleRange, onLineChange, onScrollingStateChange]);
  
  // Line navigation
  const goToLine = useCallback((lineNumber: number) => {
    scrollToLine(lineNumber);
  }, [scrollToLine]);
  
  const previousLine = useCallback(() => {
    if (currentLine > 1) {
      scrollToLine(currentLine - 1);
    }
  }, [currentLine, scrollToLine]);
  
  const nextLine = useCallback(() => {
    if (currentLine < totalLines) {
      scrollToLine(currentLine + 1);
    }
  }, [currentLine, totalLines, scrollToLine]);
  
  // Add bookmark
  const handleAddBookmark = useCallback(async () => {
    const title = prompt('Bookmark title:', `Line ${currentLine}`);
    if (title) {
      await onAddBookmark(currentLine, title);
    }
  }, [currentLine, onAddBookmark]);
  
  // Jump to current position
  const handleJumpToCurrentPosition = useCallback(async () => {
    const line = await onJumpToCurrentPosition();
    if (line) {
      goToLine(line);
    }
  }, [onJumpToCurrentPosition, goToLine]);
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'f':
            e.preventDefault();
            setShowSearch(!showSearch);
            break;
          case 'b':
            e.preventDefault();
            handleAddBookmark();
            break;
        }
      } else if (!showSearch) {
        switch (e.key) {
          case 'ArrowUp':
            e.preventDefault();
            previousLine();
            break;
          case 'ArrowDown':
            e.preventDefault();
            nextLine();
            break;
          case 'PageUp':
            e.preventDefault();
            scrollToLine(Math.max(1, currentLine - 10));
            break;
          case 'PageDown':
            e.preventDefault();
            scrollToLine(Math.min(totalLines, currentLine + 10));
            break;
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showSearch, currentLine, totalLines, scrollToLine, handleAddBookmark, previousLine, nextLine]);
  
  // Search result highlighting
  const highlightSearch = (content: string, query: string): string => {
    if (!query) return escapeHtml(content);
    
    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
    return escapeHtml(content).replace(regex, '<mark>$1</mark>');
  };
  
  const escapeHtml = (text: string): string => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };
  
  const escapeRegex = (string: string): string => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };
  
  // Long press handlers
  const handleLongPressStart = useCallback((lineNumber: number) => {
    longPressTimerRef.current = setTimeout(() => {
      setBookmarkLine(lineNumber);
      setBookmarkTitle(`Line ${lineNumber}`);
      setBookmarkNote('');
      setShowBookmarkModal(true);
    }, 500); // 500ms for long press
  }, []);
  
  const handleLongPressEnd = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);
  
  // Save bookmark from modal
  const handleSaveBookmark = useCallback(async () => {
    if (!bookmarkTitle.trim()) {
      return;
    }
    
    const success = await onAddBookmark(
      bookmarkLine, 
      bookmarkTitle.trim(), 
      bookmarkNote.trim() || undefined
    );
    
    if (success) {
      setShowBookmarkModal(false);
      setBookmarkTitle('');
      setBookmarkNote('');
    }
  }, [bookmarkLine, bookmarkTitle, bookmarkNote, onAddBookmark]);
  
  // Set as current position
  const handleSetAsCurrentPosition = useCallback(async () => {
    const success = await onSetAsCurrentPosition(bookmarkLine);
    
    if (success) {
      setShowBookmarkModal(false);
      setBookmarkTitle('');
      setBookmarkNote('');
    }
  }, [bookmarkLine, onSetAsCurrentPosition]);
  
  // Rendering functions
  const renderLoadingState = () => (
    <div className="loading-state">
      <div className="loading-message">Loading guide...</div>
    </div>
  );
  
  const renderContent = useMemo(() => {
    if (isLoading || !lines.length) {
      return renderLoadingState();
    }
    
    // Virtual scrolling - only render visible lines
    const { start, end } = visibleRange;
    const visibleLines = lines.slice(start, end);
    const totalHeight = totalLines * lineHeightRef.current;
    const offsetTop = start * lineHeightRef.current;
    
    return (
      <div className="guide-content" ref={contentRef} style={{ height: totalHeight }}>
        <div style={{ transform: `translateY(${offsetTop}px)` }}>
          {visibleLines.map((line, index) => {
            const lineNumber = start + index + 1;
            const isCurrentLine = lineNumber === currentLine;
            
            return (
              <div 
                key={lineNumber}
                data-line={lineNumber}
                className={`line ${isCurrentLine ? 'current-line' : ''}`}
                onClick={() => goToLine(lineNumber)}
                onMouseDown={() => handleLongPressStart(lineNumber)}
                onMouseUp={handleLongPressEnd}
                onMouseLeave={handleLongPressEnd}
                onTouchStart={() => handleLongPressStart(lineNumber)}
                onTouchEnd={handleLongPressEnd}
                onTouchCancel={handleLongPressEnd}
                style={{ height: lineHeightRef.current }}
              >
                <span className="line-number">{lineNumber}</span>
                <span className="line-content">{line}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }, [isLoading, lines, currentLine, goToLine, visibleRange, totalLines, handleLongPressStart, handleLongPressEnd]);
  
  return (
    <div className="guide-reader">
      <div className="reader-header">
        <h1 className="guide-title">{guide.title}</h1>
        <div className="reader-controls">
          <button onClick={handleJumpToCurrentPosition} className="control-btn primary">
            📍 Current Position
          </button>
          <button onClick={() => setShowSearch(!showSearch)} className="control-btn">
            Search
          </button>
          <button onClick={handleAddBookmark} className="control-btn">
            Bookmark
          </button>
        </div>
      </div>
      
      <div className="reader-toolbar">
        <div className="progress-info">
          Line {currentLine} of {totalLines} 
          ({Math.round((currentLine / totalLines) * 100)}%)
        </div>
        <div className="navigation-controls">
          <input 
            type="number" 
            value={currentLine}
            onChange={(e) => {
              const line = parseInt(e.target.value) || 1;
              if (line >= 1 && line <= totalLines) {
                onLineChange(line);
              }
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                const line = parseInt((e.target as HTMLInputElement).value) || 1;
                goToLine(line);
              }
            }}
            min="1" 
            max={totalLines}
          />
          <button onClick={() => {
            const input = document.querySelector('.navigation-controls input') as HTMLInputElement;
            const line = parseInt(input.value) || 1;
            goToLine(line);
          }} className="nav-btn">Go to Line</button>
        </div>
      </div>

      {showSearch && (
        <div className="search-panel">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search in guide (min. 3 chars)..." 
            autoFocus
          />
          <div className="search-results">
            {searchResults.length === 0 && searchQuery.length >= 3 && (
              <div className="search-status">Searching...</div>
            )}
            {searchResults.map(result => (
              <div 
                key={result.line}
                className="search-result" 
                onClick={() => {
                  goToLine(result.line);
                  setShowSearch(false);
                }}
              >
                <span className="result-line">Line {result.line}:</span>
                <span 
                  className="result-content"
                  dangerouslySetInnerHTML={{ 
                    __html: highlightSearch(result.content, searchQuery) 
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div 
        ref={containerRef}
        className="reader-content-container"
        style={{
          height: '80vh',
          overflowY: 'auto'
        }}
      >
        {renderContent}
      </div>

      {showBookmarkModal && (
        <div className="bookmark-modal-overlay" onClick={() => setShowBookmarkModal(false)}>
          <div className="bookmark-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Bookmark at Line {bookmarkLine}</h3>
              <button onClick={() => setShowBookmarkModal(false)} className="close-btn">&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="bookmark-title">Title:</label>
                <input 
                  type="text" 
                  id="bookmark-title"
                  value={bookmarkTitle}
                  onChange={(e) => setBookmarkTitle(e.target.value)}
                  placeholder="Bookmark title"
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label htmlFor="bookmark-note">Note (optional):</label>
                <textarea 
                  id="bookmark-note"
                  value={bookmarkNote}
                  onChange={(e) => setBookmarkNote(e.target.value)}
                  placeholder="Add a note..."
                />
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={handleSaveBookmark} className="primary-btn">
                Save Bookmark
              </button>
              <button onClick={handleSetAsCurrentPosition} className="primary-btn">
                📍 Set as Current Position
              </button>
              <button onClick={() => setShowBookmarkModal(false)} className="secondary-btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};