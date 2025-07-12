import { renderHook, act, waitFor } from '@testing-library/react';
import { useBookmarks } from './useBookmarks';
import { db } from '../services/database';
import { Bookmark } from '../types';

// Mock the database
jest.mock('../services/database', () => ({
  db: {
    getBookmarks: jest.fn(),
    getAllBookmarks: jest.fn(),
    saveBookmark: jest.fn(),
    deleteBookmark: jest.fn()
  }
}));

describe('useBookmarks', () => {
  const mockBookmarks: Bookmark[] = [
    {
      id: '1',
      guideId: 'guide-1',
      line: 10,
      title: 'Bookmark 1',
      dateCreated: new Date('2023-01-01'),
      isCurrentPosition: false
    },
    {
      id: '2',
      guideId: 'guide-1',
      line: 20,
      title: 'Bookmark 2',
      dateCreated: new Date('2023-01-02'),
      isCurrentPosition: false
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (db.getBookmarks as jest.Mock).mockResolvedValue(mockBookmarks);
    (db.getAllBookmarks as jest.Mock).mockResolvedValue(mockBookmarks);
    (db.saveBookmark as jest.Mock).mockResolvedValue(undefined);
    (db.deleteBookmark as jest.Mock).mockResolvedValue(undefined);
  });

  describe('initial load', () => {
    it('should load bookmarks for specific guide', async () => {
      const { result } = renderHook(() => useBookmarks('guide-1'));

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(db.getBookmarks).toHaveBeenCalledWith('guide-1');
      expect(result.current.bookmarks).toEqual(mockBookmarks);
      expect(result.current.error).toBeNull();
    });

    it('should load all bookmarks when no guideId provided', async () => {
      const { result } = renderHook(() => useBookmarks());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(db.getAllBookmarks).toHaveBeenCalled();
      expect(result.current.bookmarks).toEqual(mockBookmarks);
    });

    it('should handle loading errors', async () => {
      const error = new Error('Database error');
      (db.getBookmarks as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useBookmarks('guide-1'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Database error');
      expect(result.current.bookmarks).toEqual([]);
    });

    it('should handle non-Error loading errors', async () => {
      (db.getBookmarks as jest.Mock).mockRejectedValue('String error');

      const { result } = renderHook(() => useBookmarks('guide-1'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Failed to load bookmarks');
    });
  });

  describe('addBookmark', () => {
    it('should add a new bookmark', async () => {
      const { result } = renderHook(() => useBookmarks('guide-1'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const newBookmarkData = {
        guideId: 'guide-1',
        line: 30,
        title: 'New Bookmark',
        isCurrentPosition: false
      };

      let addedBookmark: Bookmark | undefined;
      await act(async () => {
        addedBookmark = await result.current.addBookmark(newBookmarkData);
      });

      expect(db.saveBookmark).toHaveBeenCalledWith(expect.objectContaining({
        ...newBookmarkData,
        id: expect.any(String),
        dateCreated: expect.any(Date)
      }));

      expect(addedBookmark).toMatchObject(newBookmarkData);
      expect(addedBookmark?.id).toBeTruthy();
      expect(addedBookmark?.dateCreated).toBeInstanceOf(Date);

      // Should reload bookmarks after adding
      expect(db.getBookmarks).toHaveBeenCalledTimes(2);
    });

    it('should handle add bookmark errors', async () => {
      const error = new Error('Save failed');
      (db.saveBookmark as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useBookmarks('guide-1'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.addBookmark({
            guideId: 'guide-1',
            line: 30,
            title: 'New Bookmark',
            isCurrentPosition: false
          });
        })
      ).rejects.toThrow('Save failed');
    });

    it('should handle non-Error add bookmark errors', async () => {
      (db.saveBookmark as jest.Mock).mockRejectedValue('String error');

      const { result } = renderHook(() => useBookmarks('guide-1'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.addBookmark({
            guideId: 'guide-1',
            line: 30,
            title: 'New Bookmark',
            isCurrentPosition: false
          });
        })
      ).rejects.toThrow('Failed to add bookmark');
    });
  });

  describe('deleteBookmark', () => {
    it('should delete a bookmark', async () => {
      const { result } = renderHook(() => useBookmarks('guide-1'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.deleteBookmark('1');
      });

      expect(db.deleteBookmark).toHaveBeenCalledWith('1');
      // Should reload bookmarks after deleting
      expect(db.getBookmarks).toHaveBeenCalledTimes(2);
    });

    it('should handle delete bookmark errors', async () => {
      const error = new Error('Delete failed');
      (db.deleteBookmark as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useBookmarks('guide-1'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.deleteBookmark('1');
        })
      ).rejects.toThrow('Delete failed');
    });

    it('should handle non-Error delete bookmark errors', async () => {
      (db.deleteBookmark as jest.Mock).mockRejectedValue('String error');

      const { result } = renderHook(() => useBookmarks('guide-1'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.deleteBookmark('1');
        })
      ).rejects.toThrow('Failed to delete bookmark');
    });
  });

  describe('updateBookmark', () => {
    it('should update an existing bookmark', async () => {
      const { result } = renderHook(() => useBookmarks('guide-1'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const updates = { title: 'Updated Title', line: 15 };

      await act(async () => {
        await result.current.updateBookmark('1', updates);
      });

      expect(db.saveBookmark).toHaveBeenCalledWith({
        ...mockBookmarks[0],
        ...updates
      });

      // Should reload bookmarks after updating
      expect(db.getBookmarks).toHaveBeenCalledTimes(2);
    });

    it('should throw error when bookmark not found', async () => {
      const { result } = renderHook(() => useBookmarks('guide-1'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.updateBookmark('non-existent', { title: 'Updated' });
        })
      ).rejects.toThrow('Bookmark not found');
    });

    it('should handle update bookmark errors', async () => {
      const error = new Error('Update failed');
      (db.saveBookmark as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useBookmarks('guide-1'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.updateBookmark('1', { title: 'Updated' });
        })
      ).rejects.toThrow('Update failed');
    });

    it('should handle non-Error update bookmark errors', async () => {
      (db.saveBookmark as jest.Mock).mockRejectedValue('String error');

      const { result } = renderHook(() => useBookmarks('guide-1'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.updateBookmark('1', { title: 'Updated' });
        })
      ).rejects.toThrow('Failed to update bookmark');
    });
  });

  describe('loadBookmarks', () => {
    it('should reload bookmarks when loadBookmarks is called', async () => {
      const { result } = renderHook(() => useBookmarks('guide-1'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Initial load
      expect(db.getBookmarks).toHaveBeenCalledTimes(1);

      await act(async () => {
        await result.current.loadBookmarks();
      });

      // Should have been called again
      expect(db.getBookmarks).toHaveBeenCalledTimes(2);
    });
  });

  describe('guideId changes', () => {
    it('should reload bookmarks when guideId changes', async () => {
      const { result, rerender } = renderHook(
        ({ guideId }) => useBookmarks(guideId),
        { initialProps: { guideId: 'guide-1' } }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(db.getBookmarks).toHaveBeenCalledWith('guide-1');

      // Change guideId
      rerender({ guideId: 'guide-2' });

      await waitFor(() => {
        expect(db.getBookmarks).toHaveBeenCalledWith('guide-2');
      });
    });

    it('should switch from specific guide to all bookmarks', async () => {
      const { result, rerender } = renderHook(
        ({ guideId }) => useBookmarks(guideId),
        { initialProps: { guideId: 'guide-1' as string | undefined } }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(db.getBookmarks).toHaveBeenCalledWith('guide-1');

      // Remove guideId
      rerender({ guideId: undefined });

      await waitFor(() => {
        expect(db.getAllBookmarks).toHaveBeenCalled();
      });
    });
  });
});