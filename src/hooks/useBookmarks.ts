import { useState, useEffect, useCallback } from 'react';
import { Bookmark } from '../types';
import { db } from '../services/database';
import { generateId } from '../utils/common';

/**
 * Hook for managing bookmarks - loading, adding, updating, and deleting.
 * @param guideId - Optional guide ID to filter bookmarks for a specific guide
 * @returns Object containing bookmarks array, loading state, error state, and bookmark operations
 */
export const useBookmarks = (guideId?: string) => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBookmarks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const allBookmarks = guideId 
        ? await db.getBookmarks(guideId)
        : await db.getAllBookmarks();
      setBookmarks(allBookmarks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bookmarks');
    } finally {
      setLoading(false);
    }
  }, [guideId]);

  useEffect(() => {
    loadBookmarks();
  }, [guideId, loadBookmarks]);

  const addBookmark = async (bookmark: Omit<Bookmark, 'id' | 'dateCreated'>) => {
    try {
      const newBookmark: Bookmark = {
        ...bookmark,
        id: generateId(),
        dateCreated: new Date()
      };
      await db.saveBookmark(newBookmark);
      await loadBookmarks();
      return newBookmark;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to add bookmark');
    }
  };

  const deleteBookmark = async (id: string) => {
    try {
      await db.deleteBookmark(id);
      await loadBookmarks();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete bookmark');
    }
  };

  const updateBookmark = async (id: string, updates: Partial<Bookmark>) => {
    try {
      const bookmark = bookmarks.find(b => b.id === id);
      if (!bookmark) throw new Error('Bookmark not found');
      
      const updatedBookmark = { ...bookmark, ...updates };
      await db.saveBookmark(updatedBookmark);
      await loadBookmarks();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update bookmark');
    }
  };

  return {
    bookmarks,
    loading,
    error,
    addBookmark,
    deleteBookmark,
    updateBookmark,
    refresh: loadBookmarks,
  };
};