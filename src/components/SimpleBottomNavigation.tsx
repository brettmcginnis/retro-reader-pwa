import React from 'react';
import { NavigationButton } from './NavigationButton';
import { Navigation, Bookmark } from 'lucide-react';

interface SimpleBottomNavigationProps {
  onNavigate: () => void;
  onBookmarks: () => void;
  disabled?: boolean;
}

export const SimpleBottomNavigation: React.FC<SimpleBottomNavigationProps> = ({
  onNavigate,
  onBookmarks,
  disabled = false
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-retro-900 border-t border-retro-200 dark:border-retro-700 z-50">
      <div className="flex items-center justify-center gap-8 h-16 max-w-md mx-auto px-4">
        <NavigationButton
          icon={<Navigation className="w-5 h-5" />}
          label="Navigate"
          isDisabled={disabled}
          title="Go to line"
          onClick={onNavigate}
        />

        <NavigationButton
          icon={<Bookmark className="w-5 h-5" />}
          label="Bookmarks"
          isDisabled={disabled}
          title="View bookmarks"
          onClick={onBookmarks}
        />
      </div>
    </div>
  );
};