import React from 'react';
import { Button } from './Button';
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
        {/* Navigation Button */}
        <Button
          onClick={onNavigate}
          disabled={disabled}
          variant="ghost"
          className="flex flex-col items-center gap-1 p-2 h-14 min-w-[80px]"
          title="Go to line"
        >
          <Navigation className="w-5 h-5" />
          <span className="text-xs">Navigate</span>
        </Button>

        {/* Bookmarks Button */}
        <Button
          onClick={onBookmarks}
          disabled={disabled}
          variant="ghost"
          className="flex flex-col items-center gap-1 p-2 h-14 min-w-[80px]"
          title="View bookmarks"
        >
          <Bookmark className="w-5 h-5" />
          <span className="text-xs">Bookmarks</span>
        </Button>
      </div>
    </div>
  );
};