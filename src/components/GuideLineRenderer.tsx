import React from 'react';
import clsx from 'clsx';

interface GuideLineRendererProps {
  line: string;
  lineNumber: number;
  isSelected: boolean;
  isBookmarked: boolean;
  isCurrentPosition: boolean;
  lineHeight: number;
  fontSize: number;
  searchQuery: string;
  onMouseDown: (lineNumber: number) => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
  onTouchStart: (lineNumber: number) => void;
  onTouchEnd: () => void;
}

const GuideLineRendererComponent: React.FC<GuideLineRendererProps> = ({
  line,
  lineNumber,
  isSelected,
  isBookmarked,
  isCurrentPosition,
  lineHeight,
  fontSize,
  searchQuery,
  onMouseDown,
  onMouseUp,
  onMouseLeave,
  onTouchStart,
  onTouchEnd
}) => {
  const highlightSearchQuery = (text: string, query: string) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index}>{part}</mark>
      ) : (
        part
      )
    );
  };

  return (
    <div 
      className={clsx(
        // Layout and display
        'flex',
        // Typography
        'font-mono',
        // Interactive states
        'select-none cursor-pointer',
        'hover:bg-retro-100 dark:hover:bg-retro-800',
        // Selected state
        isSelected && 'bg-blue-100 dark:bg-blue-900/30',
        // Current position bookmark highlighting
        isCurrentPosition && 'bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-500',
        // Regular bookmark highlighting (subtle)
        isBookmarked && !isCurrentPosition && 'bg-purple-50 dark:bg-purple-900/20'
      )}
      style={{ height: `${lineHeight}px`, fontSize: `${fontSize}px` }}
      data-testid={`line-${lineNumber}`}
      onMouseDown={() => onMouseDown(lineNumber)}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onTouchStart={() => onTouchStart(lineNumber)}
      onTouchEnd={onTouchEnd}
    >
      <span className={clsx(
        // Layout
        'flex-shrink-0 w-16 pr-4',
        // Typography
        'text-right',
        // Colors
        'text-retro-500 dark:text-retro-500',
        // Interactive
        'select-none'
      )}>
        {lineNumber}
      </span>
      <span className={clsx(
        // Layout
        'flex-1 overflow-x-auto',
        // Typography
        'whitespace-pre',
        // Colors
        'text-retro-900 dark:text-retro-100'
      )}>
        {highlightSearchQuery(line, searchQuery)}
      </span>
    </div>
  );
};

GuideLineRendererComponent.displayName = 'GuideLineRenderer';

export const GuideLineRenderer = React.memo(GuideLineRendererComponent);