import React from 'react';
import { Guide } from '../stores/useGuideStore';
import { Bookmark } from '../stores/useBookmarkStore';
import { BookmarkModal } from './BookmarkModal';
import { BookmarksOverlay } from './BookmarksOverlay';

interface GuideBookmarksViewProps {
  guide: Guide;
  bookmarks: Bookmark[];
  totalLines: number;
  scrollToLine: (line: number) => void;
  // Bookmark modal props
  showBookmarkModal: boolean;
  bookmarkLine: number;
  bookmarkTitle: string;
  bookmarkNote: string;
  setBookmarkTitle: (title: string) => void;
  setBookmarkNote: (note: string) => void;
  handleSaveBookmark: () => Promise<void>;
  handleSetBookmarkLineAsCurrentPosition: () => Promise<void>;
  closeBookmarkModal: () => void;
  // Bookmarks overlay props
  showBookmarksOverlay: boolean;
  setShowBookmarksOverlay: (show: boolean) => void;
  handleAddBookmarkFromOverlay: (bookmark: Omit<Bookmark, 'id' | 'dateCreated'>) => Promise<Bookmark>;
  handleUpdateBookmark: (id: string, updates: Partial<Bookmark>) => Promise<void>;
  handleDeleteBookmark: (bookmarkId: string) => void;
}

export const GuideBookmarksView: React.FC<GuideBookmarksViewProps> = ({
  guide,
  bookmarks,
  totalLines,
  scrollToLine,
  showBookmarkModal,
  bookmarkLine,
  bookmarkTitle,
  bookmarkNote,
  setBookmarkTitle,
  setBookmarkNote,
  handleSaveBookmark,
  handleSetBookmarkLineAsCurrentPosition,
  closeBookmarkModal,
  showBookmarksOverlay,
  setShowBookmarksOverlay,
  handleAddBookmarkFromOverlay,
  handleUpdateBookmark,
  handleDeleteBookmark
}) => {
  return (
    <>
      <BookmarkModal
        isOpen={showBookmarkModal}
        line={bookmarkLine}
        title={bookmarkTitle}
        note={bookmarkNote}
        onTitleChange={setBookmarkTitle}
        onNoteChange={setBookmarkNote}
        onSave={handleSaveBookmark}
        onSetAsCurrentPosition={handleSetBookmarkLineAsCurrentPosition}
        onClose={closeBookmarkModal}
      />

      <BookmarksOverlay
        isOpen={showBookmarksOverlay}
        guide={guide}
        currentPositionBookmark={bookmarks.find(b => b.isCurrentPosition)}
        sortedBookmarks={bookmarks.filter(b => !b.isCurrentPosition).sort((a, b) => a.line - b.line)}
        lineCount={totalLines}
        onClose={() => setShowBookmarksOverlay(false)}
        onGotoLine={scrollToLine}
        onAddBookmark={handleAddBookmarkFromOverlay}
        onUpdateBookmark={handleUpdateBookmark}
        onDeleteBookmark={handleDeleteBookmark}
      />
    </>
  );
};