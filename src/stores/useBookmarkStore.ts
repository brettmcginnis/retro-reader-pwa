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
  /** Loading state for bookmark operations */
  loading: boolean;
  /** Error message if bookmark operations fail */
  error: string | null;
  /** ID of the currently selected guide for filtering bookmarks */
  currentGuideId: string | null;
}

/**
 * Actions for managing bookmarks
 */
interface BookmarkActions {
  /** Loads bookmarks for a specific guide or all bookmarks if no guide ID provided */
  loadBookmarks: (guideId?: string) => Promise<void>;
  /** Creates a new bookmark and reloads the bookmark list */
  addBookmark: (bookmark: Omit<Bookmark, 'id' | 'dateCreated'>) => Promise<Bookmark>;
  /** Deletes a bookmark by ID */
  deleteBookmark: (id: string) => Promise<void>;
  /** Updates an existing bookmark with partial data */
  updateBookmark: (id: string, updates: Partial<Bookmark>) => Promise<void>;
  /** Sets the current guide ID and loads its bookmarks */
  setCurrentGuideId: (guideId: string | null) => void;
}

type BookmarkStore = BookmarkState & BookmarkActions;

export const useBookmarkStore = create<BookmarkStore>((set, get) => ({
  bookmarks: [],
  loading: true,
  error: null,
  currentGuideId: null,

  loadBookmarks: async (guideId?: string) => {
    try {
      set({ loading: true, error: null });
      const allBookmarks = guideId 
        ? await db.getBookmarks(guideId)
        : await db.getAllBookmarks();
      set({ bookmarks: allBookmarks, loading: false });
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : 'Failed to load bookmarks',
        loading: false 
      });
    }
  },

  addBookmark: async (bookmark) => {
    try {
      const newBookmark: Bookmark = {
        ...bookmark,
        id: generateId(),
        dateCreated: new Date()
      };
      await db.saveBookmark(newBookmark);
      await get().loadBookmarks(get().currentGuideId || undefined);
      return newBookmark;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to add bookmark');
    }
  },

  deleteBookmark: async (id: string) => {
    try {
      await db.deleteBookmark(id);
      await get().loadBookmarks(get().currentGuideId || undefined);
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
      await get().loadBookmarks(get().currentGuideId || undefined);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update bookmark');
    }
  },

  setCurrentGuideId: (guideId: string | null) => {
    set({ currentGuideId: guideId });
    if (guideId) {
      get().loadBookmarks(guideId);
    }
  },
}));