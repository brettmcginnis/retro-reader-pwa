import { create } from 'zustand';
import { Bookmark } from '../types';
import { db } from '../services/database';
import { generateId } from '../utils/common';

/**
 * State interface for bookmark management
 */
interface BookmarkState {
  /** Array of bookmarks for the current guide */
  bookmarks: Bookmark[];
  /** ID of the currently selected guide for filtering bookmarks */
  currentGuideId: string | null;
}

/**
 * Actions for managing bookmarks
 */
interface BookmarkActions {
  /** Gets bookmarks for a specific guide or all bookmarks if no guide ID provided */
  getBookmarks: (guideId?: string) => Promise<Bookmark[]>;
  /** Creates a new bookmark and reloads the bookmark list */
  addBookmark: (bookmark: Omit<Bookmark, 'id' | 'dateCreated'>) => Promise<Bookmark>;
  /** Deletes a bookmark by ID */
  deleteBookmark: (id: string) => Promise<void>;
  /** Updates an existing bookmark with partial data */
  updateBookmark: (id: string, updates: Partial<Bookmark>) => Promise<void>;
  /** Sets the current guide ID and loads its bookmarks */
  setCurrentGuideId: (guideId: string | null) => void;
  /** Saves the current reading position as a special bookmark */
  saveCurrentPositionBookmark: (guideId: string, line: number) => Promise<void>;
  /** Gets the current position bookmark for a guide */
  getCurrentPositionBookmark: (guideId: string) => Promise<Bookmark | null>;
}

type BookmarkStore = BookmarkState & BookmarkActions;

export const useBookmarkStore = create<BookmarkStore>((set, get) => ({
  bookmarks: [],
  currentGuideId: null,

  getBookmarks: async (guideId?: string) => {
    const allBookmarks = guideId 
      ? await db.getBookmarks(guideId)
      : await db.getAllBookmarks();
    set({ bookmarks: allBookmarks });
    return allBookmarks;
  },

  addBookmark: async (bookmark) => {
    try {
      const newBookmark: Bookmark = {
        ...bookmark,
        id: generateId(),
        dateCreated: new Date()
      };
      await db.saveBookmark(newBookmark);
      await get().getBookmarks(get().currentGuideId || undefined);
      return newBookmark;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to add bookmark');
    }
  },

  deleteBookmark: async (id: string) => {
    try {
      await db.deleteBookmark(id);
      await get().getBookmarks(get().currentGuideId || undefined);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete bookmark');
    }
  },

  updateBookmark: async (id: string, updates: Partial<Bookmark>) => {
    try {
      const bookmarks = get().bookmarks;
      const bookmark = bookmarks.find(b => b.id === id);
      if (!bookmark) throw new Error('Bookmark not found');
      
      const updatedBookmark = { ...bookmark, ...updates };
      await db.saveBookmark(updatedBookmark);
      await get().getBookmarks(get().currentGuideId || undefined);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update bookmark');
    }
  },

  setCurrentGuideId: (guideId: string | null) => {
    set({ currentGuideId: guideId, bookmarks: [] });
    if (guideId) {
      get().getBookmarks(guideId);
    }
  },

  saveCurrentPositionBookmark: async (guideId: string, line: number) => {
    try {
      await db.saveCurrentPositionBookmark(guideId, line);
      // Reload bookmarks to reflect the change
      await get().getBookmarks(guideId);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to save current position');
    }
  },

  getCurrentPositionBookmark: async (guideId: string) => {
    try {
      return await db.getCurrentPositionBookmark(guideId);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to get current position');
    }
  }
}));

// Selector for currentLine - always returns the current bookmark.line || 1
export const useCurrentLine = () => {
  return useBookmarkStore((state) => {
    if (!state.currentGuideId) return 1;
    const bookmark = state.bookmarks.find(
      b => b.isCurrentPosition && b.guideId === state.currentGuideId
    );
    return bookmark?.line || 1;
  });
};
