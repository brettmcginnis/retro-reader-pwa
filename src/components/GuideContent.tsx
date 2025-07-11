import React from 'react';
import { Bookmark } from '../types';
import { GuideLineRenderer } from './GuideLineRenderer';

interface GuideContentProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
  lines: string[];
  visibleRange: { start: number; end: number };
  currentLine: number;
  lineHeight: number;
  totalLines: number;
  fontSize: number;
  zoomLevel: number;
  searchQuery: string;
  bookmarkedLines: Map<number, Bookmark>;
  isLoading: boolean;
  onScroll: () => void;
  onLineClick: (lineNumber: number) => void;
  scrollToLine: (line: number) => void;
}

export const GuideContent: React.FC<GuideContentProps> = ({
  containerRef,
  contentRef,
  lines,
  visibleRange,
  currentLine,
  lineHeight,
  totalLines,
  fontSize,
  zoomLevel,
  searchQuery,
  bookmarkedLines,
  isLoading,
  onScroll,
  onLineClick,
  scrollToLine
}) => {
  const { start, end } = visibleRange;
  const visibleLines = lines.slice(start, end);
  const totalHeight = totalLines * lineHeight;
  const offsetTop = start * lineHeight;

  return (
    <>
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
        onScroll={onScroll}
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
                  lineHeight={lineHeight}
                  fontSize={fontSize}
                  searchQuery={searchQuery}
                  onClick={onLineClick}
                />
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};