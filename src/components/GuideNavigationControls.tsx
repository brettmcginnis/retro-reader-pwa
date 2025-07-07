import React from 'react';

import { MIN_LINE } from '../constants';

interface GuideNavigationControlsProps {
  currentLine: number;
  totalLines: number;
  isLoading: boolean;
  onLineChange: (line: number) => void;
  onJumpToCurrentPosition: () => void;
  onSetAsCurrentPosition: () => void;
}

export const GuideNavigationControls: React.FC<GuideNavigationControlsProps> = ({
  currentLine,
  totalLines,
  isLoading,
  onLineChange,
  onJumpToCurrentPosition,
  onSetAsCurrentPosition
}) => {
  const handleGoToLine = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const targetLine = parseInt(formData.get('line') as string, 10);
    
    if (targetLine >= MIN_LINE && targetLine <= totalLines) {
      onLineChange(targetLine);
    }
  };

  const handleLineInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= MIN_LINE && value <= totalLines) {
      onLineChange(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        onLineChange(Math.max(MIN_LINE, currentLine - 1));
        break;
      case 'ArrowDown':
        e.preventDefault();
        onLineChange(Math.min(totalLines, currentLine + 1));
        break;
      case 'PageUp':
        e.preventDefault();
        onLineChange(Math.max(MIN_LINE, currentLine - 10));
        break;
      case 'PageDown':
        e.preventDefault();
        onLineChange(Math.min(totalLines, currentLine + 10));
        break;
    }
  };

  return (
    <div className="guide-navigation">
      <form onSubmit={handleGoToLine} className="go-to-line">
        <label htmlFor="line-input">Go to line:</label>
        <input
          id="line-input"
          name="line"
          type="number"
          min={MIN_LINE}
          max={totalLines}
          value={currentLine}
          onChange={handleLineInputChange}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>Go</button>
      </form>
      
      <div className="navigation-buttons">
        <button 
          onClick={onJumpToCurrentPosition}
          disabled={isLoading}
          className="jump-btn"
          title="Jump to saved reading position"
        >
          Current Position
        </button>
        <button 
          onClick={onSetAsCurrentPosition}
          disabled={isLoading}
          className="set-position-btn"
          title="Save current line as reading position"
        >
          Set Position
        </button>
      </div>
      
      <div className="progress-info">
        Line {currentLine} of {totalLines}
        {totalLines > 0 && (
          <span className="progress-percentage">
            ({Math.round((currentLine / totalLines) * 100)}%)
          </span>
        )}
      </div>
    </div>
  );
};