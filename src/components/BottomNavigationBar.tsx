import React, { useState } from 'react';
import clsx from 'clsx';
import { Button } from './Button';
import { Navigation, Settings, Search, Book, Bookmark, Library } from 'lucide-react';

interface BottomNavigationBarProps {
  isLoading: boolean;
  fontSize: number;
  zoomLevel: number;
  showSearch: boolean;
  currentView: 'library' | 'reader' | 'bookmarks';
  onJumpToCurrentPosition: () => void;
  onFontSizeChange: (size: number) => void;
  onZoomChange: (zoom: number) => void;
  onToggleSearch: () => void;
  onViewChange: (view: 'library' | 'reader' | 'bookmarks') => void;
}

export const BottomNavigationBar: React.FC<BottomNavigationBarProps> = ({
  isLoading,
  fontSize,
  zoomLevel,
  showSearch,
  currentView,
  onJumpToCurrentPosition,
  onFontSizeChange,
  onZoomChange,
  onToggleSearch,
  onViewChange
}) => {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      {/* Settings Panel - Slides up when visible */}
      <div className={clsx(
        'fixed bottom-16 left-0 right-0 bg-white dark:bg-retro-900',
        'border-t border-retro-200 dark:border-retro-700',
        'transform transition-transform duration-300 ease-in-out z-40',
        showSettings ? 'translate-y-0' : 'translate-y-full'
      )}>
        <div className="p-4 space-y-4 max-w-2xl mx-auto">
          {/* Font Size Control */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-retro-700 dark:text-retro-300">Font Size</span>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => onFontSizeChange(fontSize - 1)}
                disabled={isLoading || fontSize <= 10}
                variant="secondary"
                size="sm"
                className="w-10 h-10 p-0 flex items-center justify-center"
              >
                <span className="text-lg">−</span>
              </Button>
              <span className="text-sm text-retro-700 dark:text-retro-300 w-12 text-center font-medium">
                {fontSize}px
              </span>
              <Button
                onClick={() => onFontSizeChange(fontSize + 1)}
                disabled={isLoading || fontSize >= 24}
                variant="secondary"
                size="sm"
                className="w-10 h-10 p-0 flex items-center justify-center"
              >
                <span className="text-lg">+</span>
              </Button>
            </div>
          </div>

          {/* Zoom Control */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-retro-700 dark:text-retro-300">Zoom</span>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => onZoomChange(zoomLevel - 0.1)}
                disabled={isLoading || zoomLevel <= 0.5}
                variant="secondary"
                size="sm"
                className="w-10 h-10 p-0 flex items-center justify-center"
              >
                <span className="text-lg">−</span>
              </Button>
              <span className="text-sm text-retro-700 dark:text-retro-300 w-12 text-center font-medium">
                {Math.round(zoomLevel * 100)}%
              </span>
              <Button
                onClick={() => onZoomChange(zoomLevel + 0.1)}
                disabled={isLoading || zoomLevel >= 2}
                variant="secondary"
                size="sm"
                className="w-10 h-10 p-0 flex items-center justify-center"
              >
                <span className="text-lg">+</span>
              </Button>
              <Button
                onClick={() => onZoomChange(1)}
                disabled={isLoading || zoomLevel === 1}
                variant="secondary"
                size="sm"
                className="px-3 h-10 ml-2"
              >
                Reset
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-retro-900 border-t border-retro-200 dark:border-retro-700 z-50">
        <div className="flex items-center justify-center gap-2 sm:gap-4 h-16 max-w-2xl mx-auto px-4">
          {/* Library Button */}
          <Button
            onClick={() => onViewChange('library')}
            disabled={isLoading}
            variant="ghost"
            className={clsx(
              'flex flex-col sm:flex-row items-center gap-1 p-2 h-14 min-w-[60px] sm:min-w-[80px]',
              currentView === 'library' && 'bg-retro-100 dark:bg-retro-800'
            )}
            title="Go to library"
          >
            <Library className="w-5 h-5" />
            <span className="text-xs sm:text-sm">Library</span>
          </Button>

          {/* Reader Button - Only when not in library */}
          {currentView !== 'library' && (
            <Button
              onClick={() => onViewChange('reader')}
              disabled={isLoading}
              variant="ghost"
              className={clsx(
                'flex flex-col sm:flex-row items-center gap-1 p-2 h-14 min-w-[60px] sm:min-w-[80px]',
                currentView === 'reader' && 'bg-retro-100 dark:bg-retro-800'
              )}
              title="Read guide"
            >
              <Book className="w-5 h-5" />
              <span className="text-xs sm:text-sm">Read</span>
            </Button>
          )}

          {/* Bookmarks Button - Only when not in library */}
          {currentView !== 'library' && (
            <Button
              onClick={() => onViewChange('bookmarks')}
              disabled={isLoading}
              variant="ghost"
              className={clsx(
                'flex flex-col sm:flex-row items-center gap-1 p-2 h-14 min-w-[60px] sm:min-w-[80px]',
                currentView === 'bookmarks' && 'bg-retro-100 dark:bg-retro-800'
              )}
              title="View bookmarks"
            >
              <Bookmark className="w-5 h-5" />
              <span className="text-xs sm:text-sm">Bookmarks</span>
            </Button>
          )}

          {/* Search Toggle (in reader view only) */}
          {currentView === 'reader' && (
            <Button
              onClick={onToggleSearch}
              disabled={isLoading}
              variant="ghost"
              className={clsx(
                'flex flex-col sm:flex-row items-center gap-1 p-2 h-14 min-w-[60px] sm:min-w-[80px]',
                showSearch && 'bg-retro-100 dark:bg-retro-800'
              )}
              title={showSearch ? 'Hide search' : 'Show search'}
            >
              <Search className="w-5 h-5" />
              <span className="text-xs sm:text-sm">Search</span>
            </Button>
          )}

          {/* Jump to Position (in reader view only) */}
          {currentView === 'reader' && (
            <Button
              onClick={onJumpToCurrentPosition}
              disabled={isLoading}
              variant="ghost"
              className="flex flex-col sm:flex-row items-center gap-1 p-2 h-14 min-w-[60px] sm:min-w-[80px]"
              title="Jump to saved position"
            >
              <Navigation className="w-5 h-5" />
              <span className="text-xs sm:text-sm">Position</span>
            </Button>
          )}

          {/* Settings Toggle (in reader view only) */}
          {currentView === 'reader' && (
            <Button
              onClick={() => setShowSettings(!showSettings)}
              variant="ghost"
              className={clsx(
                'flex flex-col sm:flex-row items-center gap-1 p-2 h-14 min-w-[60px] sm:min-w-[80px]',
                showSettings && 'bg-retro-100 dark:bg-retro-800'
              )}
              title="Display settings"
            >
              <Settings className="w-5 h-5" />
              <span className="text-xs sm:text-sm">Settings</span>
            </Button>
          )}
        </div>
      </div>
    </>
  );
};