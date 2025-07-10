import React, { useState } from 'react';
import clsx from 'clsx';
import { SettingsPanel } from './SettingsPanel';
import { NavigationButton } from './NavigationButton';
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
      <div className={clsx(
        'fixed bottom-16 left-0 right-0 bg-white dark:bg-retro-900',
        'border-t border-retro-200 dark:border-retro-700',
        'transform transition-transform duration-300 ease-in-out z-40',
        showSettings ? 'translate-y-0' : 'translate-y-full'
      )}>
        <SettingsPanel
          fontSize={fontSize}
          zoomLevel={zoomLevel}
          onFontSizeChange={(size) => !isLoading && onFontSizeChange(size)}
          onZoomChange={(zoom) => !isLoading && onZoomChange(zoom)}
        />
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-retro-900 border-t border-retro-200 dark:border-retro-700 z-50">
        <div className="flex items-center justify-center gap-2 sm:gap-4 h-16 max-w-2xl mx-auto px-4">
          <NavigationButton
            icon={<Library className="w-5 h-5" />}
            label="Library"
            isActive={currentView === 'library'}
            isDisabled={isLoading}
            title="Go to library"
            onClick={() => onViewChange('library')}
          />

          {currentView !== 'library' && (
            <NavigationButton
              icon={<Book className="w-5 h-5" />}
              label="Read"
              isActive={currentView === 'reader'}
              isDisabled={isLoading}
              title="Read guide"
              onClick={() => onViewChange('reader')}
            />
          )}

          {currentView !== 'library' && (
            <NavigationButton
              icon={<Bookmark className="w-5 h-5" />}
              label="Bookmarks"
              isActive={currentView === 'bookmarks'}
              isDisabled={isLoading}
              title="View bookmarks"
              onClick={() => onViewChange('bookmarks')}
            />
          )}

          {currentView === 'reader' && (
            <NavigationButton
              icon={<Search className="w-5 h-5" />}
              label="Search"
              isActive={showSearch}
              isDisabled={isLoading}
              title={showSearch ? 'Hide search' : 'Show search'}
              onClick={onToggleSearch}
            />
          )}

          {currentView === 'reader' && (
            <NavigationButton
              icon={<Navigation className="w-5 h-5" />}
              label="Position"
              isDisabled={isLoading}
              title="Jump to saved position"
              onClick={onJumpToCurrentPosition}
            />
          )}

          {currentView === 'reader' && (
            <NavigationButton
              icon={<Settings className="w-5 h-5" />}
              label="Settings"
              isActive={showSettings}
              isDisabled={isLoading}
              title="Display settings"
              onClick={() => setShowSettings(!showSettings)}
            />
          )}
        </div>
      </div>
    </>
  );
};