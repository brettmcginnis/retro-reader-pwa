import React, { useState, useEffect, useCallback } from 'react';
import { Guide } from '../types';
import { useProgress } from '../hooks/useProgress';
import { useBookmarks } from '../hooks/useBookmarks';
import { useApp } from '../contexts/AppContext';

interface GuideReaderProps {
  guide: Guide;
}

export const GuideReader: React.FC<GuideReaderProps> = ({ guide }) => {
  const { settings } = useApp();
  const { progress, saveProgress } = useProgress(guide.id);
  const { addBookmark } = useBookmarks(guide.id);
  
  const [currentLine, setCurrentLine] = useState(1);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ line: number; content: string }[]>([]);
  const [lines] = useState(() => guide.content.split('\n'));

  // Load progress on mount and scroll to saved position
  useEffect(() => {
    if (progress) {
      setCurrentLine(progress.line);
      setCurrentPosition(progress.position);
      // Delay scroll to ensure DOM is ready
      setTimeout(() => {
        scrollToLine(progress.line);
      }, 100);
    }
  }, [progress]);

  // Save progress when line changes
  const saveCurrentProgress = useCallback(async () => {
    try {
      await saveProgress({
        guideId: guide.id,
        line: currentLine,
        position: currentPosition,
        percentage: (currentLine / lines.length) * 100
      });
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  }, [guide.id, currentLine, currentPosition, lines.length, saveProgress]);

  useEffect(() => {
    saveCurrentProgress();
  }, [currentLine, saveCurrentProgress]);

  // Save progress on unmount
  useEffect(() => {
    return () => {
      saveCurrentProgress();
    };
  }, [saveCurrentProgress]);

  // Scroll tracking with Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const lineElement = entry.target as HTMLElement;
            const lineNumber = parseInt(lineElement.getAttribute('data-line') || '1');
            if (lineNumber !== currentLine) {
              setCurrentLine(lineNumber);
            }
          }
        });
      },
      {
        root: null,
        rootMargin: '-45% 0px -45% 0px', // Only trigger when line is near center
        threshold: 0.1
      }
    );

    // Observe all line elements
    const lineElements = document.querySelectorAll('[data-line]');
    lineElements.forEach((element) => observer.observe(element));

    return () => {
      observer.disconnect();
    };
  }, [currentLine, lines.length]);

  const gotoLine = (lineNumber: number) => {
    if (lineNumber < 1 || lineNumber > lines.length) return;
    
    setCurrentLine(lineNumber);
    setCurrentPosition(0);
    scrollToLine(lineNumber);
  };

  const previousLine = () => {
    if (currentLine > 1) {
      const newLine = currentLine - 1;
      setCurrentLine(newLine);
      scrollToLine(newLine);
    }
  };

  const nextLine = () => {
    if (currentLine < lines.length) {
      const newLine = currentLine + 1;
      setCurrentLine(newLine);
      scrollToLine(newLine);
    }
  };

  const scrollToLine = (lineNumber: number) => {
    const lineElement = document.querySelector(`[data-line="${lineNumber}"]`);
    if (lineElement) {
      lineElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
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
          const prevLine = Math.max(1, currentLine - 10);
          setCurrentLine(prevLine);
          scrollToLine(prevLine);
          break;
        case 'PageDown':
          e.preventDefault();
          const nextPageLine = Math.min(lines.length, currentLine + 10);
          setCurrentLine(nextPageLine);
          scrollToLine(nextPageLine);
          break;
      }
    }
  }, [showSearch, currentLine, lines.length]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleAddBookmark = async () => {
    const title = prompt('Bookmark title:', `Line ${currentLine}`);
    if (title) {
      try {
        await addBookmark({
          guideId: guide.id,
          line: currentLine,
          position: currentPosition,
          title
        });
        alert('Bookmark added!');
      } catch (error) {
        alert(`Failed to add bookmark: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  const performSearch = (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    const results: { line: number; content: string }[] = [];
    const searchTerm = query.toLowerCase();

    lines.forEach((line, index) => {
      if (line.toLowerCase().includes(searchTerm)) {
        results.push({
          line: index + 1,
          content: line
        });
      }
    });

    setSearchResults(results.slice(0, 20));
  };

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

  const renderContent = () => {
    return lines.map((line, index) => {
      const lineNumber = index + 1;
      const isCurrentLine = lineNumber === currentLine;
      
      return (
        <div 
          key={lineNumber}
          data-line={lineNumber}
          className={`line ${isCurrentLine ? 'current-line' : ''}`}
          onClick={() => gotoLine(lineNumber)}
        >
          <span className="line-number">{lineNumber}</span>
          <span className="line-content">{line}</span>
        </div>
      );
    });
  };

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
          <button onClick={() => alert('Settings panel coming soon!')} className="control-btn">
            Settings
          </button>
        </div>
      </div>
      
      <div className="reader-toolbar">
        <div className="progress-info">
          Line {currentLine} of {lines.length} 
          ({Math.round((currentLine / lines.length) * 100)}%)
        </div>
        <div className="navigation-controls">
          <input 
            type="number" 
            value={currentLine}
            onChange={(e) => {
              const line = parseInt(e.target.value) || 1;
              gotoLine(line);
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                const line = parseInt((e.target as HTMLInputElement).value) || 1;
                gotoLine(line);
              }
            }}
            min="1" 
            max={lines.length}
          />
          <button onClick={() => {
            const input = document.querySelector('.navigation-controls input') as HTMLInputElement;
            const line = parseInt(input.value) || 1;
            gotoLine(line);
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
            placeholder="Search in guide..." 
            autoFocus
          />
          <div className="search-results">
            {searchResults.map(result => (
              <div 
                key={result.line}
                className="search-result" 
                onClick={() => {
                  gotoLine(result.line);
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
        className="reader-content"
        style={{
          fontSize: `${settings.fontSize}px`,
          lineHeight: settings.lineHeight.toString(),
          fontFamily: settings.fontFamily
        }}
      >
        {renderContent()}
      </div>
    </div>
  );
};