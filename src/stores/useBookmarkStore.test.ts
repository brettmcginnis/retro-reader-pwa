import { act } from '@testing-library/react';
import { useBookmarkStore } from './useBookmarkStore';
import { db } from '../services/database';
import { Bookmark } from '../types';

// Mock database service
jest.mock('../services/database', () => ({
  db: {
    getBookmarks: jest.fn(),
    getAllBookmarks: jest.fn(),
    saveBookmark: jest.fn(),
    deleteBookmark: jest.fn(),
  },
}));

// Mock generateId
jest.mock('../utils/common', () => ({
  generateId: jest.fn(() => 'test-id-123'),
}));

describe('useBookmarkStore', () => {
  const mockBookmarks: Bookmark[] = [
    {
      id: 'bookmark-1',
      guideId: 'guide-1',
      line: 10,
      title: 'Test Bookmark 1',
      dateCreated: new Date('2024-01-01'),
    },
    {
      id: 'bookmark-2',
      guideId: 'guide-1',
      line: 20,
      title: 'Test Bookmark 2',
      note: 'Test note',
      dateCreated: new Date('2024-01-02'),
    },
  ];

  beforeEach(() => {
    // Reset store state
    useBookmarkStore.setState({
      bookmarks: [],
      loading: true,
      error: null,
      currentGuideId: null,
    });

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial values', () => {
      const state = useBookmarkStore.getState();
      expect(state.bookmarks).toEqual([]);
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
      expect(state.currentGuideId).toBeNull();
    });
  });

  describe('loadBookmarks', () => {
    it('should load bookmarks for a specific guide', async () => {
      (db.getBookmarks as jest.Mock).mockResolvedValue(mockBookmarks);

      await act(async () => {
        await useBookmarkStore.getState().loadBookmarks('guide-1');
      });

      const state = useBookmarkStore.getState();
      expect(db.getBookmarks).toHaveBeenCalledWith('guide-1');
      expect(state.bookmarks).toEqual(mockBookmarks);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should load all bookmarks when no guide ID provided', async () => {
      (db.getAllBookmarks as jest.Mock).mockResolvedValue(mockBookmarks);

      await act(async () => {
        await useBookmarkStore.getState().loadBookmarks();
      });

      const state = useBookmarkStore.getState();
      expect(db.getAllBookmarks).toHaveBeenCalled();
      expect(state.bookmarks).toEqual(mockBookmarks);
      expect(state.loading).toBe(false);
    });

    it('should handle load errors', async () => {
      const error = new Error('Failed to load');
      (db.getBookmarks as jest.Mock).mockRejectedValue(error);

      await act(async () => {
        await useBookmarkStore.getState().loadBookmarks('guide-1');
      });

      const state = useBookmarkStore.getState();
      expect(state.error).toBe('Failed to load');
      expect(state.loading).toBe(false);
      expect(state.bookmarks).toEqual([]);
    });
  });

  describe('addBookmark', () => {
    beforeEach(() => {
      useBookmarkStore.setState({ currentGuideId: 'guide-1' });
      (db.getBookmarks as jest.Mock).mockResolvedValue([]);
    });

    it('should add a new bookmark', async () => {
      const newBookmark = {
        guideId: 'guide-1',
        line: 30,
        title: 'New Bookmark',
        note: 'New note',
      };

      let result: Bookmark | undefined;
      await act(async () => {
        result = await useBookmarkStore.getState().addBookmark(newBookmark);
      });

      expect(db.saveBookmark).toHaveBeenCalledWith({
        ...newBookmark,
        id: 'test-id-123',
        dateCreated: expect.any(Date),
      });
      expect(result).toEqual({
        ...newBookmark,
        id: 'test-id-123',
        dateCreated: expect.any(Date),
      });
    });

    it('should reload bookmarks after adding', async () => {
      const newBookmark = {
        guideId: 'guide-1',
        line: 30,
        title: 'New Bookmark',
      };

      await act(async () => {
        await useBookmarkStore.getState().addBookmark(newBookmark);
      });

      expect(db.getBookmarks).toHaveBeenCalledWith('guide-1');
    });

    it('should handle add errors', async () => {
      const error = new Error('Save failed');
      (db.saveBookmark as jest.Mock).mockRejectedValue(error);

      const newBookmark = {
        guideId: 'guide-1',
        line: 30,
        title: 'New Bookmark',
      };

      await expect(
        useBookmarkStore.getState().addBookmark(newBookmark)
      ).rejects.toThrow('Save failed');
    });
  });

  describe('deleteBookmark', () => {
    beforeEach(() => {
      useBookmarkStore.setState({ 
        currentGuideId: 'guide-1',
        bookmarks: mockBookmarks,
      });
      (db.getBookmarks as jest.Mock).mockResolvedValue([mockBookmarks[1]]);
    });

    it('should delete a bookmark', async () => {
      await act(async () => {
        await useBookmarkStore.getState().deleteBookmark('bookmark-1');
      });

      expect(db.deleteBookmark).toHaveBeenCalledWith('bookmark-1');
      expect(db.getBookmarks).toHaveBeenCalledWith('guide-1');
    });

    it('should handle delete errors', async () => {
      const error = new Error('Delete failed');
      (db.deleteBookmark as jest.Mock).mockRejectedValue(error);

      await expect(
        useBookmarkStore.getState().deleteBookmark('bookmark-1')
      ).rejects.toThrow('Delete failed');
    });
  });

  describe('updateBookmark', () => {
    beforeEach(() => {
      useBookmarkStore.setState({ 
        bookmarks: mockBookmarks,
        currentGuideId: 'guide-1',
      });
      (db.getBookmarks as jest.Mock).mockResolvedValue(mockBookmarks);
    });

    it('should update an existing bookmark', async () => {
      const updates = { title: 'Updated Title', note: 'Updated note' };

      // Mock saveBookmark to succeed
      (db.saveBookmark as jest.Mock).mockResolvedValue(undefined);

      await act(async () => {
        await useBookmarkStore.getState().updateBookmark('bookmark-1', updates);
      });

      expect(db.saveBookmark).toHaveBeenCalledWith({
        ...mockBookmarks[0],
        ...updates,
      });
      expect(db.getBookmarks).toHaveBeenCalledWith('guide-1');
    });

    it('should throw error if bookmark not found', async () => {
      await expect(
        useBookmarkStore.getState().updateBookmark('non-existent', { title: 'New' })
      ).rejects.toThrow('Bookmark not found');
    });

    it('should handle update errors', async () => {
      const error = new Error('Update failed');
      (db.saveBookmark as jest.Mock).mockRejectedValue(error);

      await expect(
        useBookmarkStore.getState().updateBookmark('bookmark-1', { title: 'New' })
      ).rejects.toThrow('Update failed');
    });
  });

  describe('refresh', () => {
    it('should reload bookmarks', async () => {
      useBookmarkStore.setState({ currentGuideId: 'guide-1' });
      (db.getBookmarks as jest.Mock).mockResolvedValue(mockBookmarks);

      await act(async () => {
        await useBookmarkStore.getState().refresh();
      });

      expect(db.getBookmarks).toHaveBeenCalledWith('guide-1');
    });
  });

  describe('setCurrentGuideId', () => {
    it('should set guide ID and load bookmarks', async () => {
      (db.getBookmarks as jest.Mock).mockResolvedValue(mockBookmarks);

      await act(async () => {
        useBookmarkStore.getState().setCurrentGuideId('guide-2');
      });

      const state = useBookmarkStore.getState();
      expect(state.currentGuideId).toBe('guide-2');
      expect(db.getBookmarks).toHaveBeenCalledWith('guide-2');
    });

    it('should not load bookmarks when setting to null', () => {
      act(() => {
        useBookmarkStore.getState().setCurrentGuideId(null);
      });

      const state = useBookmarkStore.getState();
      expect(state.currentGuideId).toBeNull();
      expect(db.getBookmarks).not.toHaveBeenCalled();
    });
  });
});