import React from 'react';
import { Bookmark as BookmarkIcon } from 'lucide-react';

export const BookmarksEmptyState: React.FC = () => {
  return (
    <div className="text-center py-8 text-retro-600 dark:text-retro-400">
      <BookmarkIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
      <p className="text-sm">No bookmarks yet</p>
      <p className="text-xs mt-1">Long press on any line to create one</p>
    </div>
  );
};