import React, { useState } from 'react';
import clsx from 'clsx';
import { Button } from './Button';
import { SettingsPanel } from './SettingsPanel';
import { SearchBar } from './SearchBar';
import { ChevronLeft, Settings, Search } from 'lucide-react';
import { useAppStore } from '../stores/useAppStore';

interface TopNavigationBarProps {
  guideTitle: string;
  currentLine: number;
  totalLines: number;
  fontSize: number;
  zoomLevel: number;
  searchQuery: string;
  isSearching: boolean;
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
  onSearch,
  onSearchToggle,
  onFontSizeChange,
  onZoomChange
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const { setCurrentGuideId } = useAppStore();
  
  const handleBack = () => {
    setCurrentGuideId(null);
    window.history.pushState({}, '', '/retro-reader-pwa/');
  };


  return (
    <>
      <div className={clsx(
        'fixed top-14 left-0 right-0 bg-white dark:bg-retro-900',
        'border-b border-retro-200 dark:border-retro-700',
        'transform transition-transform duration-300 ease-in-out z-40',
        'shadow-lg',
        showSettings ? 'translate-y-0' : '-translate-y-full'
      )}>
        <SettingsPanel
          fontSize={fontSize}
          zoomLevel={zoomLevel}
          onFontSizeChange={onFontSizeChange}
          onZoomChange={onZoomChange}
        />
      </div>

      <header className="fixed top-0 left-0 right-0 bg-white dark:bg-retro-900 border-b border-retro-200 dark:border-retro-700 z-50">
        <div className="flex items-center h-14 px-2 sm:px-4 gap-2">
          <Button
            onClick={handleBack}
            variant="ghost"
            size="sm"
            className="p-2"
            title="Back to library"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

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

          <div className={clsx(
            'flex items-center gap-2 transition-all duration-200',
            isSearching ? 'flex-1' : ''
          )}>
            {isSearching ? (
              <SearchBar
                searchQuery={searchQuery}
                onSearch={onSearch}
                onClose={onSearchToggle}
              />
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