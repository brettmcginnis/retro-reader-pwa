import React from 'react';
import { MapPin, Calendar } from 'lucide-react';
import { Button } from './Button';
import { Bookmark } from '../types';

interface CurrentPositionBookmarkProps {
  bookmark: Bookmark;
  onGotoLine: (line: number) => void;
}

export const CurrentPositionBookmark: React.FC<CurrentPositionBookmarkProps> = ({ 
  bookmark, 
  onGotoLine 
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
    <div>
      <h3 className="text-sm font-medium text-retro-700 dark:text-retro-300 mb-2">
        Current Position
      </h3>
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-blue-900 dark:text-blue-100 font-medium text-sm">
              <MapPin className="w-4 h-4" />
              {bookmark.title}
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-blue-700 dark:text-blue-300">
              <span>Line {bookmark.line}</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(bookmark.dateCreated)}
              </span>
            </div>
          </div>
          <Button 
            onClick={() => onGotoLine(bookmark.line)} 
            variant="primary"
            size="sm"
          >
            Resume
          </Button>
        </div>
      </div>
    </div>
  );
};