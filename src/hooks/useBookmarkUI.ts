import { useState, useRef, useCallback } from 'react';
import { Bookmark } from '../types';
import { generateId } from '../utils/common';
import { useToast } from '../contexts/useToast';

// Timing constants
const DOUBLE_TAP_DELAY = 300; // milliseconds
const BOOKMARK_VIBRATION_DURATION = 50; // milliseconds

interface UseBookmarkUIProps {
  lines: string[];
  bookmarks: Bookmark[];
  onAddBookmark: (line: number, title: string, note?: string) => Promise<boolean>;
  onDeleteBookmark: (id: string) => Promise<void>;
  onUpdateBookmark: (id: string, updates: Partial<Bookmark>) => Promise<void>;
  onSetAsCurrentPosition: (line: number) => Promise<boolean>;
  onRefreshBookmarks: () => Promise<void>;
}

interface UseBookmarkUIReturn {
  showBookmarkModal: boolean;
  bookmarkLine: number;
  bookmarkTitle: string;
  bookmarkNote: string;
  showBookmarksOverlay: boolean;
  bookmarkedLines: Map<number, Bookmark>;
  setBookmarkTitle: (title: string) => void;
  setBookmarkNote: (note: string) => void;
  setShowBookmarksOverlay: (show: boolean) => void;
  handleLineDoubleClick: (lineNumber: number) => void;
  handleSaveBookmark: () => Promise<void>;
  handleDeleteBookmark: (bookmarkId: string) => void;
  handleAddBookmarkFromOverlay: (bookmark: Omit<Bookmark, 'id' | 'dateCreated'>) => Promise<Bookmark>;
  handleUpdateBookmark: (id: string, updates: Partial<Bookmark>) => Promise<void>;
  handleSetBookmarkLineAsCurrentPosition: () => Promise<void>;
  closeBookmarkModal: () => void;
  openBookmarksOverlay: () => Promise<void>;
}

export const useBookmarkUI = ({
  lines,
  bookmarks,
  onAddBookmark,
  onDeleteBookmark,
  onUpdateBookmark,
  onSetAsCurrentPosition,
  onRefreshBookmarks
}: UseBookmarkUIProps): UseBookmarkUIReturn => {
  const [showBookmarkModal, setShowBookmarkModal] = useState(false);
  const [bookmarkLine, setBookmarkLine] = useState(1);
  const [bookmarkTitle, setBookmarkTitle] = useState('');
  const [bookmarkNote, setBookmarkNote] = useState('');
  const [showBookmarksOverlay, setShowBookmarksOverlay] = useState(false);
  
  const lastTapTimeRef = useRef<number>(0);
  const lastTapLineRef = useRef<number>(0);
  
  const { showToast, confirm } = useToast();
  
  // Create a map of bookmarked lines for quick lookup
  const bookmarkedLines = new Map<number, Bookmark>();
  bookmarks.forEach(bookmark => {
    bookmarkedLines.set(bookmark.line, bookmark);
  });

  // Double tap handler
  const handleLineDoubleClick = useCallback((lineNumber: number) => {
    const currentTime = Date.now();
    const timeSinceLastTap = currentTime - lastTapTimeRef.current;
    
    if (lastTapLineRef.current === lineNumber && timeSinceLastTap < DOUBLE_TAP_DELAY) {
      // Double tap detected
      if ('vibrate' in navigator) {
        navigator.vibrate(BOOKMARK_VIBRATION_DURATION);
      }
      setBookmarkLine(lineNumber);
      // Pre-fill title with the actual line content, trimmed
      const lineContent = lines[lineNumber - 1]?.trim() || `Line ${lineNumber}`;
      setBookmarkTitle(lineContent);
      setBookmarkNote('');
      setShowBookmarkModal(true);
      
      // Reset to prevent triple tap
      lastTapTimeRef.current = 0;
      lastTapLineRef.current = 0;
    } else {
      // First tap
      lastTapTimeRef.current = currentTime;
      lastTapLineRef.current = lineNumber;
    }
  }, [lines]);

  // Bookmark modal handlers
  const handleSaveBookmark = async () => {
    const success = await onAddBookmark(bookmarkLine, bookmarkTitle, bookmarkNote);
    if (success) {
      setShowBookmarkModal(false);
    }
  };

  // Bookmark overlay handlers
  const handleDeleteBookmark = async (bookmarkId: string) => {
    const bookmark = bookmarks.find(b => b.id === bookmarkId);
    const confirmed = await confirm({
      title: 'Delete Bookmark',
      message: `Are you sure you want to delete the bookmark "${bookmark?.title}"?`,
      confirmText: 'Delete',
      cancelText: 'Cancel'
    });

    if (confirmed) {
      try {
        await onDeleteBookmark(bookmarkId);
        showToast('success', 'Bookmark deleted', 'Bookmark has been successfully deleted');
      } catch (error) {
        showToast('error', 'Failed to delete bookmark', error instanceof Error ? error.message : 'Unknown error');
      }
    }
  };

  const handleAddBookmarkFromOverlay = async (bookmark: Omit<Bookmark, 'id' | 'dateCreated'>) => {
    try {
      const success = await onAddBookmark(bookmark.line, bookmark.title, bookmark.note);
      if (success) {
        showToast('success', 'Bookmark Added', 'Bookmark added successfully');
        // Return a new bookmark object matching the expected return type
        const newBookmark: Bookmark = {
          ...bookmark,
          id: generateId(),
          dateCreated: new Date()
        };
        return newBookmark;
      } else {
        throw new Error('Failed to add bookmark');
      }
    } catch (error) {
      showToast('error', 'Error', `Failed to save bookmark: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  };

  const handleUpdateBookmark = async (id: string, updates: Partial<Bookmark>) => {
    try {
      await onUpdateBookmark(id, updates);
      showToast('success', 'Bookmark Updated', 'Bookmark updated successfully');
    } catch (error) {
      showToast('error', 'Error', `Failed to update bookmark: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  };

  const handleSetBookmarkLineAsCurrentPosition = async () => {
    const success = await onSetAsCurrentPosition(bookmarkLine);
    if (success) {
      await onRefreshBookmarks();
      setShowBookmarkModal(false);
    }
  };

  const closeBookmarkModal = () => {
    setShowBookmarkModal(false);
  };

  const openBookmarksOverlay = async () => {
    await onRefreshBookmarks();
    setShowBookmarksOverlay(true);
  };

  return {
    showBookmarkModal,
    bookmarkLine,
    bookmarkTitle,
    bookmarkNote,
    showBookmarksOverlay,
    bookmarkedLines,
    setBookmarkTitle,
    setBookmarkNote,
    setShowBookmarksOverlay,
    handleLineDoubleClick,
    handleSaveBookmark,
    handleDeleteBookmark,
    handleAddBookmarkFromOverlay,
    handleUpdateBookmark,
    handleSetBookmarkLineAsCurrentPosition,
    closeBookmarkModal,
    openBookmarksOverlay
  };
};