import React, { useState } from 'react';
import clsx from 'clsx';
import { Bookmark, Guide } from '../types';
import { AddBookmarkModal } from './AddBookmarkModal';
import { EditBookmarkModal } from './EditBookmarkModal';
import { OverlayBackdrop } from './OverlayBackdrop';
import { OverlayHeader } from './OverlayHeader';
import { CurrentPositionBookmark } from './CurrentPositionBookmark';
import { BookmarkListItem } from './BookmarkListItem';
import { BookmarksEmptyState } from './BookmarksEmptyState';

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


  const handleGotoLine = (line: number) => {
    onGotoLine(line);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <OverlayBackdrop onClick={onClose} />

      {/* Overlay Panel */}
      <div className={clsx(
        'fixed inset-x-0 bottom-0 bg-white dark:bg-retro-900',
        'border-t border-retro-200 dark:border-retro-700',
        'z-50 max-h-[90vh] flex flex-col',
        'rounded-t-2xl shadow-2xl',
        'animate-slide-up'
      )}>
        <OverlayHeader title="Bookmarks" onClose={onClose} />

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="space-y-4 pb-20">
            {currentPositionBookmark && (
              <CurrentPositionBookmark 
                bookmark={currentPositionBookmark}
                onGotoLine={handleGotoLine}
              />
            )}

            {/* Saved Bookmarks */}
            {sortedBookmarks.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-retro-700 dark:text-retro-300 mb-2">
                  Saved Bookmarks
                </h3>
                <div className="space-y-2">
                  {sortedBookmarks.map(bookmark => (
                    <BookmarkListItem
                      key={bookmark.id}
                      bookmark={bookmark}
                      onGotoLine={handleGotoLine}
                      onEdit={setEditingBookmark}
                      onDelete={onDeleteBookmark}
                    />
                  ))}
                </div>
              </div>
            )}

            {sortedBookmarks.length === 0 && !currentPositionBookmark && (
              <BookmarksEmptyState />
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