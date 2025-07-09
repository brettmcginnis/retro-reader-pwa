import React from 'react';
import { Bookmark, Guide } from '../types';
import { useBookmarks } from '../hooks/useBookmarks';
import { useToast } from '../contexts/useToast';
import { BookmarkManagerView } from '../components/BookmarkManagerView';

interface BookmarkManagerContainerProps {
  guide: Guide;
  onGotoLine: (line: number) => void;
}

export const BookmarkManagerContainer: React.FC<BookmarkManagerContainerProps> = ({ guide, onGotoLine }) => {
  const { bookmarks, addBookmark, deleteBookmark, updateBookmark } = useBookmarks(guide.id);
  const { showToast, showConfirmation } = useToast();

  const handleExportBookmarks = () => {
    const exportData = {
      guide: {
        id: guide.id,
        title: guide.title,
        url: guide.url
      },
      bookmarks: bookmarks,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${guide.title.replace(/[^a-z0-9]/gi, '_')}_bookmarks.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('success', 'Bookmarks Exported', `${bookmarks.length} bookmarks exported successfully`);
  };

  const handleClearAll = () => {
    showConfirmation({
      title: 'Clear All Bookmarks',
      message: 'Are you sure you want to delete all bookmarks? This action cannot be undone.',
      confirmText: 'Clear All',
      cancelText: 'Cancel',
      onConfirm: confirmClearAll
    });
  };

  const confirmClearAll = async () => {
    try {
      for (const bookmark of bookmarks) {
        await deleteBookmark(bookmark.id);
      }
      showToast('success', 'All bookmarks deleted', 'All bookmarks have been successfully deleted');
    } catch (error) {
      showToast('error', 'Failed to clear bookmarks', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handleDeleteBookmark = (bookmarkId: string) => {
    const bookmark = bookmarks.find(b => b.id === bookmarkId);
    showConfirmation({
      title: 'Delete Bookmark',
      message: `Are you sure you want to delete the bookmark "${bookmark?.title}"?`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: () => confirmDeleteBookmark(bookmarkId)
    });
  };

  const confirmDeleteBookmark = async (bookmarkId: string) => {
    try {
      await deleteBookmark(bookmarkId);
      showToast('success', 'Bookmark deleted', 'Bookmark has been successfully deleted');
    } catch (error) {
      showToast('error', 'Failed to delete bookmark', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handleAddBookmark = async (bookmark: Omit<Bookmark, 'id' | 'dateCreated'>) => {
    try {
      const newBookmark = await addBookmark(bookmark);
      showToast('success', 'Bookmark Added', 'Bookmark added successfully');
      return newBookmark;
    } catch (error) {
      showToast('error', 'Error', `Failed to save bookmark: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  };

  const handleUpdateBookmark = async (id: string, updates: Partial<Bookmark>) => {
    try {
      await updateBookmark(id, updates);
      showToast('success', 'Bookmark Updated', 'Bookmark updated successfully');
    } catch (error) {
      showToast('error', 'Error', `Failed to update bookmark: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  };

  const getLineCount = () => {
    return guide.content.split('\n').length;
  };

  // Separate current position bookmark from regular bookmarks
  const currentPositionBookmark = bookmarks.find(b => b.isCurrentPosition);
  const regularBookmarks = bookmarks.filter(b => !b.isCurrentPosition);
  const sortedBookmarks = [...regularBookmarks].sort((a, b) => a.line - b.line);

  return (
    <BookmarkManagerView
      guide={guide}
      currentPositionBookmark={currentPositionBookmark}
      sortedBookmarks={sortedBookmarks}
      lineCount={getLineCount()}
      onGotoLine={onGotoLine}
      onAddBookmark={handleAddBookmark}
      onUpdateBookmark={handleUpdateBookmark}
      onDeleteBookmark={handleDeleteBookmark}
      onExportBookmarks={handleExportBookmarks}
      onClearAll={handleClearAll}
    />
  );
};
