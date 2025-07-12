import React from 'react';
import { Calendar, Edit2, Trash2 } from 'lucide-react';
import { Button } from './Button';
import { Bookmark } from '../types';

/**
 * Props for the BookmarkListItem component.
 * Renders a single bookmark item with controls for navigation and management.
 */
interface BookmarkListItemProps {
  /** The bookmark data to display. */
  bookmark: Bookmark;
  
  /** Callback invoked when the user clicks to navigate to the bookmark's line. */
  onGotoLine: (line: number) => void;
  
  /** Callback invoked when the user clicks to edit the bookmark. */
  onEdit: (bookmark: Bookmark) => void;
  
  /** Callback invoked when the user clicks to delete the bookmark. */
  onDelete: (bookmarkId: string) => void;
}

export const BookmarkListItem: React.FC<BookmarkListItemProps> = ({ 
  bookmark, 
  onGotoLine,
  onEdit,
  onDelete
}) => {
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="bg-retro-50 dark:bg-retro-800 rounded-lg p-3">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm text-retro-900 dark:text-retro-100 truncate">
            {bookmark.title}
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-retro-600 dark:text-retro-400">
            <span>Line {bookmark.line}</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(bookmark.dateCreated)}
            </span>
          </div>
          {bookmark.note && (
            <div className="mt-2 text-xs text-retro-700 dark:text-retro-300 bg-white dark:bg-retro-900/50 rounded p-2">
              {bookmark.note}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 ml-2 flex-shrink-0">
          <Button 
            onClick={() => onGotoLine(bookmark.line)} 
            variant="ghost"
            size="sm"
            className="px-2 py-1 text-xs"
          >
            Go
          </Button>
          <Button 
            onClick={() => onEdit(bookmark)} 
            variant="ghost"
            size="sm"
            className="p-1"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
          <Button 
            onClick={() => onDelete(bookmark.id)} 
            variant="ghost"
            size="sm"
            className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};