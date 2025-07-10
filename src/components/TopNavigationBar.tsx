import React, { useState } from 'react';
import clsx from 'clsx';
import { Button } from './Button';
import { ChevronLeft, Settings, Search, X } from 'lucide-react';
import { FontSizeControl } from './FontSizeControl';
import { ZoomControl } from './ZoomControl';

interface TopNavigationBarProps {
  guideTitle: string;
  currentLine: number;
  totalLines: number;
  fontSize: number;
  zoomLevel: number;
  searchQuery: string;
  isSearching: boolean;
  onBack: () => void;
  onSearch: (query: string) => void;
  onSearchToggle: () => void;
  onFontSizeChange: (size: number) => void;
  onZoomChange: (zoom: number) => void;
}

export const TopNavigationBar: React.FC<TopNavigationBarProps> = ({
  guideTitle,
  currentLine,
  totalLines,
  fontSize,
  zoomLevel,
  searchQuery,
  isSearching,
  onBack,
  onSearch,
  onSearchToggle,
  onFontSizeChange,
  onZoomChange
}) => {
  const [showSettings, setShowSettings] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Prevent form submission since we're handling search on every keystroke
  };

  const handleSearchClear = () => {
    onSearch('');
  };

  return (
    <>
      {/* Settings Panel - Slides down when visible */}
      <div className={clsx(
        'fixed top-14 left-0 right-0 bg-white dark:bg-retro-900',
        'border-b border-retro-200 dark:border-retro-700',
        'transform transition-transform duration-300 ease-in-out z-40',
        'shadow-lg',
        showSettings ? 'translate-y-0' : '-translate-y-full'
      )}>
        <div className="p-4 space-y-4 max-w-2xl mx-auto">
          <FontSizeControl
            fontSize={fontSize}
            onFontSizeChange={onFontSizeChange}
          />
          <ZoomControl
            zoomLevel={zoomLevel}
            onZoomChange={onZoomChange}
          />
        </div>
      </div>

      {/* Main Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 bg-white dark:bg-retro-900 border-b border-retro-200 dark:border-retro-700 z-50">
        <div className="flex items-center h-14 px-2 sm:px-4 gap-2">
          {/* Back Button */}
          <Button
            onClick={onBack}
            variant="ghost"
            size="sm"
            className="p-2"
            title="Back to library"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          {/* Title and Progress - Hidden when searching */}
          {!isSearching && (
            <div className="flex-1 min-w-0 px-2">
              <h1 className="text-sm font-semibold text-retro-900 dark:text-retro-100 truncate">
                {guideTitle}
              </h1>
              <div className="text-xs text-retro-600 dark:text-retro-400">
                Line {currentLine} of {totalLines} • {Math.round((currentLine / totalLines) * 100)}%
              </div>
            </div>
          )}

          {/* Search Bar - Expands when active */}
          <div className={clsx(
            'flex items-center gap-2 transition-all duration-200',
            isSearching ? 'flex-1' : ''
          )}>
            {isSearching ? (
              <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearch(e.target.value)}
                    placeholder="Search in guide..."
                    className="w-full pl-3 pr-8 py-1.5 text-sm bg-retro-50 dark:bg-retro-800 
                             border border-retro-200 dark:border-retro-700 rounded-lg
                             focus:outline-none focus:ring-2 focus:ring-retro-500 dark:focus:ring-retro-400
                             text-retro-900 dark:text-retro-100 placeholder-retro-500 dark:placeholder-retro-400"
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={handleSearchClear}
                      className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-retro-500 hover:text-retro-700 dark:text-retro-400 dark:hover:text-retro-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <Button
                  type="button"
                  onClick={onSearchToggle}
                  variant="ghost"
                  size="sm"
                  className="p-2"
                >
                  <X className="w-5 h-5" />
                </Button>
              </form>
            ) : (
              <Button
                onClick={onSearchToggle}
                variant="ghost"
                size="sm"
                className="p-2"
                title="Search"
              >
                <Search className="w-5 h-5" />
              </Button>
            )}
          </div>

          {/* Settings Button */}
          <Button
            onClick={() => setShowSettings(!showSettings)}
            variant="ghost"
            size="sm"
            className={clsx(
              'p-2',
              showSettings && 'bg-retro-100 dark:bg-retro-800'
            )}
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </header>
    </>
  );
};