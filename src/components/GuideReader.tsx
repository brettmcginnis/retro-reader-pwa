import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Guide } from '../types';
import { useProgress } from '../hooks/useProgress';
import { useBookmarks } from '../hooks/useBookmarks';
import { useToast } from '../contexts/useToast';

interface GuideReaderProps {
  guide: Guide;
}

export const GuideReader: React.FC<GuideReaderProps> = ({ guide }) => {
  const { progress, saveProgress } = useProgress(guide.id);
  const { addBookmark } = useBookmarks(guide.id);
  const { showToast } = useToast();
  
  // Basic state
  const [currentLine, setCurrentLine] = useState(1);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [totalLines, setTotalLines] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 100 });
  
  // Search state
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ line: number; content: string }[]>([]);
  
  // References
  const guideRef = useRef<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const userScrollingRef = useRef(false);
  const userScrollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lineHeightRef = useRef(20);
  const lastContentRef = useRef<string>('');
  
  // Initialize guide data - only once
  useEffect(() => {
    console.log('Guide effect triggered. Guide ID:', guide.id, 'Content length:', guide.content.length);
    
    // Only reload if content actually changed
    if (lastContentRef.current === guide.content) {
      console.log('Content unchanged, skipping reload');
      return;
    }
    
    const loadGuide = () => {
      console.log('Loading guide data...');
      
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
  
  // Set initial position from saved progress - only once
  const hasSetInitialPosition = useRef(false);
  useEffect(() => {
    if (progress && !isLoading && !hasSetInitialPosition.current) {
      setCurrentLine(progress.line);
      setCurrentPosition(progress.position);
      hasSetInitialPosition.current = true;
    }
  }, [progress, isLoading]);
  
  // Get line height after render
  useEffect(() => {
    if (!isLoading && contentRef.current) {
      const lineElement = contentRef.current.querySelector('.line');
      if (lineElement) {
        lineHeightRef.current = lineElement.clientHeight || 20;
      }
    }
  }, [isLoading]);
  
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
        position: currentPosition,
        percentage: Math.min(100, Math.max(0, (currentLine / totalLines) * 100))
      }).catch(err => console.error('Failed to save progress:', err));
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [currentLine, currentPosition, guide.id, isLoading, saveProgress, totalLines]);
  
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
    setCurrentLine(targetLine);
    setCurrentPosition(0);
    
    // Calculate scroll position for virtual scrolling
    const targetScrollTop = (targetLine - 1) * lineHeightRef.current;
    const container = containerRef.current;
    
    userScrollingRef.current = true;
    container.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
    
    // Update visible range immediately
    updateVisibleRange();
    
    // Reset user scrolling flag after animation
    setTimeout(() => {
      userScrollingRef.current = false;
    }, 800);
  }, [isLoading, totalLines, updateVisibleRange]);
  
  // Initial scroll to current line - only once on mount
  const hasInitiallyScrolled = useRef(false);
  useEffect(() => {
    if (!isLoading && progress && containerRef.current && !hasInitiallyScrolled.current) {
      // Use a small delay to ensure rendering is complete
      const timer = setTimeout(() => {
        const targetScrollTop = (progress.line - 1) * lineHeightRef.current;
        containerRef.current?.scrollTo({ top: targetScrollTop, behavior: 'auto' });
        updateVisibleRange();
        hasInitiallyScrolled.current = true;
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading, progress, updateVisibleRange]);
  
  // Track visible lines on scroll with virtual scrolling
  useEffect(() => {
    if (isLoading || !containerRef.current) return;
    
    const handleScroll = () => {
      // Only update visible range, don't update current line automatically
      updateVisibleRange();
      
      // Mark that user is actively scrolling
      userScrollingRef.current = true;
      
      // Clear existing timeout and set new one
      if (userScrollingTimeoutRef.current) {
        clearTimeout(userScrollingTimeoutRef.current);
      }
      
      userScrollingTimeoutRef.current = setTimeout(() => {
        userScrollingRef.current = false;
        userScrollingTimeoutRef.current = null;
      }, 500);
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
      if (userScrollingTimeoutRef.current) {
        clearTimeout(userScrollingTimeoutRef.current);
        userScrollingTimeoutRef.current = null;
      }
    };
  }, [isLoading, updateVisibleRange]);
  
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
      try {
        await addBookmark({
          guideId: guide.id,
          line: currentLine,
          position: currentPosition,
          title
        });
        showToast('success', 'Bookmark added!', `Bookmark "${title}" created at line ${currentLine}`);
      } catch (error) {
        showToast('error', 'Failed to add bookmark', error instanceof Error ? error.message : 'Unknown error');
      }
    }
  }, [currentLine, currentPosition, guide.id, addBookmark, showToast]);
  
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
  
  // Search handling
  const performSearch = (query: string) => {
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
  };
  
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
  
  // Rendering functions
  const renderLoadingState = () => (
    <div className="loading-state">
      <div className="loading-message">Loading guide...</div>
    </div>
  );
  
  
  const renderContent = useMemo(() => {
    if (isLoading || !guideRef.current.length) {
      return renderLoadingState();
    }
    
    // Virtual scrolling - only render visible lines
    const { start, end } = visibleRange;
    const visibleLines = guideRef.current.slice(start, end);
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
  }, [isLoading, currentLine, goToLine, visibleRange, totalLines]);
  
  return (
    <div className="guide-reader">
      <div className="reader-header">
        <h1 className="guide-title">{guide.title}</h1>
        <div className="reader-controls">
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
                setCurrentLine(line);
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
            onChange={(e) => {
              setSearchQuery(e.target.value);
              performSearch(e.target.value);
            }}
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
    </div>
  );
};