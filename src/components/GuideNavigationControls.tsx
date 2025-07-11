import React from 'react';
import clsx from 'clsx';
import { Button } from './Button';
import { MapPin, Navigation, Minus, Plus, ZoomIn, ZoomOut } from 'lucide-react';

// UI Constants
const MIN_LINE = 1;

interface GuideNavigationControlsProps {
  currentLine: number;
  totalLines: number;
  isLoading: boolean;
  fontSize?: number;
  zoomLevel?: number;
  onLineChange: (line: number) => void;
  onJumpToCurrentPosition: () => void;
  onSetAsCurrentPosition: () => void;
  onFontSizeChange?: (size: number) => void;
  onZoomChange?: (zoom: number) => void;
}

export const GuideNavigationControls: React.FC<GuideNavigationControlsProps> = ({
  currentLine,
  totalLines,
  isLoading,
  fontSize = 14,
  zoomLevel = 1,
  onLineChange,
  onJumpToCurrentPosition,
  onSetAsCurrentPosition,
  onFontSizeChange,
  onZoomChange
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


  return (
    <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-between gap-4">
      <form onSubmit={handleGoToLine} className="flex items-center gap-2 w-full sm:w-auto">
        <label htmlFor="line-input" className={clsx(
          'text-sm font-medium',
          'text-retro-700 dark:text-retro-300',
          'whitespace-nowrap'
        )}>
          Go to line:
        </label>
        <input
          id="line-input"
          name="line"
          type="number"
          min={MIN_LINE}
          max={totalLines}
          value={currentLine}
          onChange={handleLineInputChange}
          disabled={isLoading}
          className={clsx(
            'w-20 px-2 py-1 text-sm',
            'border border-retro-300 dark:border-retro-600 rounded-md',
            'bg-white dark:bg-retro-800',
            'text-retro-900 dark:text-retro-100',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
            'disabled:opacity-50'
          )}
        />
        <Button type="submit" variant="secondary" size="sm" disabled={isLoading}>
          Go
        </Button>
      </form>
      
      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
        <Button 
          onClick={onJumpToCurrentPosition}
          disabled={isLoading}
          variant="secondary"
          size="sm"
          title="Jump to saved reading position"
          className="flex items-center gap-1 flex-1 sm:flex-initial"
        >
          <Navigation className="w-4 h-4" />
          <span className="hidden sm:inline">Current Position</span>
          <span className="sm:hidden">Position</span>
        </Button>
        <Button 
          onClick={onSetAsCurrentPosition}
          disabled={isLoading}
          variant="primary"
          size="sm"
          title="Save current line as reading position"
          className="flex items-center gap-1 flex-1 sm:flex-initial"
        >
          <MapPin className="w-4 h-4" />
          <span className="hidden sm:inline">Set Position</span>
          <span className="sm:hidden">Set</span>
        </Button>
      </div>
      
      {onFontSizeChange && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-retro-600 dark:text-retro-400">Font:</span>
          <Button
            onClick={() => onFontSizeChange(fontSize - 1)}
            disabled={isLoading || fontSize <= 10}
            variant="secondary"
            size="sm"
            title="Decrease font size"
            className="p-1"
          >
            <Minus className="w-4 h-4" />
          </Button>
          <span className="text-sm text-retro-700 dark:text-retro-300 w-8 text-center">
            {fontSize}
          </span>
          <Button
            onClick={() => onFontSizeChange(fontSize + 1)}
            disabled={isLoading || fontSize >= 24}
            variant="secondary"
            size="sm"
            title="Increase font size"
            className="p-1"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      )}
      
      {onZoomChange && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-retro-600 dark:text-retro-400">Zoom:</span>
          <Button
            onClick={() => onZoomChange(zoomLevel - 0.1)}
            disabled={isLoading || zoomLevel <= 0.5}
            variant="secondary"
            size="sm"
            title="Zoom out"
            className="p-1"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-sm text-retro-700 dark:text-retro-300 w-12 text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <Button
            onClick={() => onZoomChange(zoomLevel + 0.1)}
            disabled={isLoading || zoomLevel >= 2}
            variant="secondary"
            size="sm"
            title="Zoom in"
            className="p-1"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => onZoomChange(1)}
            disabled={isLoading || zoomLevel === 1}
            variant="secondary"
            size="sm"
            title="Reset zoom"
            className="text-xs px-2"
          >
            100%
          </Button>
        </div>
      )}
      
      <div className="text-sm text-retro-600 dark:text-retro-400 w-full sm:w-auto text-center sm:text-left">
        Line {currentLine} of {totalLines}
        {totalLines > 0 && (
          <span className="ml-2 text-retro-500 dark:text-retro-500">
            ({Math.round((currentLine / totalLines) * 100)}%)
          </span>
        )}
      </div>
    </div>
  );
};