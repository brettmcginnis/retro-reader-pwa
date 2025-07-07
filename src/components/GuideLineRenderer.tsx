import React from 'react';

interface GuideLineRendererProps {
  line: string;
  lineNumber: number;
  isSelected: boolean;
  lineHeight: number;
  searchQuery: string;
  onMouseDown: (lineNumber: number) => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
  onTouchStart: (lineNumber: number) => void;
  onTouchEnd: () => void;
}

export const GuideLineRenderer: React.FC<GuideLineRendererProps> = ({
  line,
  lineNumber,
  isSelected,
  lineHeight,
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
      className={`line ${isSelected ? 'selected' : ''}`}
      style={{ height: `${lineHeight}px` }}
      onMouseDown={() => onMouseDown(lineNumber)}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onTouchStart={() => onTouchStart(lineNumber)}
      onTouchEnd={onTouchEnd}
    >
      <span className="line-number">{lineNumber}</span>
      <span className="line-content">
        {highlightSearchQuery(line, searchQuery)}
      </span>
    </div>
  );
};