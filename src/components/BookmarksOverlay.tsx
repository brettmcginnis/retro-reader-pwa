import React, { useState } from 'react';
import clsx from 'clsx';
import { Bookmark, Guide } from '../types';
import { AddBookmarkModal } from './AddBookmarkModal';
import { EditBookmarkModal } from './EditBookmarkModal';
import { Button } from './Button';
import { 
  X, 
  Bookmark as BookmarkIcon, 
  MapPin, 
  Calendar, 
  Edit2, 
  Trash2
} from 'lucide-react';

interface BookmarksOverlayProps {
  isOpen: boolean;
  guide: Guide;
  currentPositionBookmark: Bookmark | undefined;
  sortedBookmarks: Bookmark[];
  lineCount: number;
  onClose: () => void;
  onGotoLine: (line: number) => void;
  onAddBookmark: (bookmark: Omit<Bookmark, 'id' | 'dateCreated'>) => Promise<Bookmark>;
  onUpdateBookmark: (id: string, updates: Partial<Bookmark>) => Promise<void>;
  onDeleteBookmark: (bookmarkId: string) => void;
}

export const BookmarksOverlay: React.FC<BookmarksOverlayProps> = ({
  isOpen,
  guide,
  currentPositionBookmark,
  sortedBookmarks,
  lineCount,
  onClose,
  onGotoLine,
  onAddBookmark,
  onUpdateBookmark,
  onDeleteBookmark
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleGotoLine = (line: number) => {
    onGotoLine(line);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Overlay Panel */}
      <div className={clsx(
        'fixed inset-x-0 bottom-0 bg-white dark:bg-retro-900',
        'border-t border-retro-200 dark:border-retro-700',
        'z-50 max-h-[90vh] flex flex-col',
        'rounded-t-2xl shadow-2xl',
        'animate-slide-up'
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-retro-200 dark:border-retro-700">
          <h2 className="text-lg font-semibold text-retro-900 dark:text-retro-100">
            Bookmarks
          </h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="p-1.5"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="space-y-4 pb-20">
            {/* Current Position */}
            {currentPositionBookmark && (
              <div>
                <h3 className="text-sm font-medium text-retro-700 dark:text-retro-300 mb-2">
                  Current Position
                </h3>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-blue-900 dark:text-blue-100 font-medium text-sm">
                        <MapPin className="w-4 h-4" />
                        {currentPositionBookmark.title}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-blue-700 dark:text-blue-300">
                        <span>Line {currentPositionBookmark.line}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(currentPositionBookmark.dateCreated)}
                        </span>
                      </div>
                    </div>
                    <Button 
                      onClick={() => handleGotoLine(currentPositionBookmark.line)} 
                      variant="primary"
                      size="sm"
                    >
                      Resume
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Saved Bookmarks */}
            {sortedBookmarks.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-retro-700 dark:text-retro-300 mb-2">
                  Saved Bookmarks
                </h3>
                <div className="space-y-2">
                  {sortedBookmarks.map(bookmark => (
                    <div 
                      key={bookmark.id} 
                      className="bg-retro-50 dark:bg-retro-800 rounded-lg p-3"
                    >
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
                            onClick={() => handleGotoLine(bookmark.line)} 
                            variant="ghost"
                            size="sm"
                            className="px-2 py-1 text-xs"
                          >
                            Go
                          </Button>
                          <Button 
                            onClick={() => setEditingBookmark(bookmark)} 
                            variant="ghost"
                            size="sm"
                            className="p-1"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button 
                            onClick={() => onDeleteBookmark(bookmark.id)} 
                            variant="ghost"
                            size="sm"
                            className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {sortedBookmarks.length === 0 && !currentPositionBookmark && (
              <div className="text-center py-8 text-retro-600 dark:text-retro-400">
                <BookmarkIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No bookmarks yet</p>
                <p className="text-xs mt-1">Long press on any line to create one</p>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddBookmarkModal
          guideId={guide.id}
          maxLine={lineCount}
          onSave={onAddBookmark}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {editingBookmark && (
        <EditBookmarkModal
          bookmark={editingBookmark}
          maxLine={lineCount}
          onSave={onUpdateBookmark}
          onClose={() => setEditingBookmark(null)}
        />
      )}
    </>
  );
};