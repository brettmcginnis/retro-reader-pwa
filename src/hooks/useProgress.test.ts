import { renderHook, act, waitFor } from '@testing-library/react';
import { useProgress } from './useProgress';
import { db } from '../services/database';
import { ReadingProgress } from '../types';

// Mock the database
jest.mock('../services/database', () => ({
  db: {
    getProgress: jest.fn(),
    saveProgress: jest.fn()
  }
}));

describe('useProgress', () => {
  const mockProgress: ReadingProgress = {
    guideId: 'guide-1',
    currentLine: 100,
    totalLines: 500,
    lastRead: new Date('2023-01-01')
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (db.getProgress as jest.Mock).mockResolvedValue(mockProgress);
    (db.saveProgress as jest.Mock).mockResolvedValue(undefined);
  });

  describe('initial load', () => {
    it('should load progress for specific guide', async () => {
      const { result } = renderHook(() => useProgress('guide-1'));

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(db.getProgress).toHaveBeenCalledWith('guide-1');
      expect(result.current.progress).toEqual(mockProgress);
      expect(result.current.error).toBeNull();
    });

    it('should return null when no progress saved', async () => {
      (db.getProgress as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useProgress('guide-1'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.progress).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it('should not load when no guideId provided', async () => {
      const { result } = renderHook(() => useProgress());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(db.getProgress).not.toHaveBeenCalled();
      expect(result.current.progress).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it('should handle loading errors', async () => {
      const error = new Error('Database error');
      (db.getProgress as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useProgress('guide-1'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Database error');
      expect(result.current.progress).toBeNull();
    });

    it('should handle non-Error loading errors', async () => {
      (db.getProgress as jest.Mock).mockRejectedValue('String error');

      const { result } = renderHook(() => useProgress('guide-1'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Failed to load progress');
      expect(result.current.progress).toBeNull();
    });
  });

  describe('saveProgress', () => {
    it('should save progress with current date', async () => {
      const { result } = renderHook(() => useProgress('guide-1'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const newProgressData = {
        guideId: 'guide-1',
        currentLine: 150,
        totalLines: 500
      };

      await act(async () => {
        await result.current.saveProgress(newProgressData);
      });

      expect(db.saveProgress).toHaveBeenCalledWith({
        ...newProgressData,
        lastRead: expect.any(Date)
      });

      expect(result.current.progress).toMatchObject(newProgressData);
      expect(result.current.progress?.lastRead).toBeInstanceOf(Date);
    });

    it('should handle save progress errors', async () => {
      const error = new Error('Save failed');
      (db.saveProgress as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useProgress('guide-1'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.saveProgress({
            guideId: 'guide-1',
            currentLine: 150,
            totalLines: 500
          });
        })
      ).rejects.toThrow('Save failed');
    });

    it('should handle non-Error save progress errors', async () => {
      (db.saveProgress as jest.Mock).mockRejectedValue('String error');

      const { result } = renderHook(() => useProgress('guide-1'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.saveProgress({
            guideId: 'guide-1',
            currentLine: 150,
            totalLines: 500
          });
        })
      ).rejects.toThrow('Failed to save progress');
    });
  });

  describe('refresh', () => {
    it('should reload progress when refresh is called', async () => {
      const { result } = renderHook(() => useProgress('guide-1'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Initial load
      expect(db.getProgress).toHaveBeenCalledTimes(1);

      await act(async () => {
        await result.current.refresh();
      });

      // Should have been called again
      expect(db.getProgress).toHaveBeenCalledTimes(2);
      expect(db.getProgress).toHaveBeenCalledWith('guide-1');
    });

    it('should handle refresh without guideId', async () => {
      const { result } = renderHook(() => useProgress());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.refresh();
      });

      // Should not call db.getProgress
      expect(db.getProgress).not.toHaveBeenCalled();
      expect(result.current.progress).toBeNull();
      expect(result.current.loading).toBe(false);
    });
  });

  describe('guideId changes', () => {
    it('should reload progress when guideId changes', async () => {
      const { result, rerender } = renderHook(
        ({ guideId }) => useProgress(guideId),
        { initialProps: { guideId: 'guide-1' } }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(db.getProgress).toHaveBeenCalledWith('guide-1');

      // Change guideId
      const newProgress: ReadingProgress = {
        guideId: 'guide-2',
        currentLine: 50,
        totalLines: 300,
        lastRead: new Date('2023-01-02')
      };
      (db.getProgress as jest.Mock).mockResolvedValue(newProgress);

      rerender({ guideId: 'guide-2' });

      await waitFor(() => {
        expect(db.getProgress).toHaveBeenCalledWith('guide-2');
      });

      await waitFor(() => {
        expect(result.current.progress).toEqual(newProgress);
      });
    });

    it('should clear progress when guideId becomes undefined', async () => {
      const { result, rerender } = renderHook(
        ({ guideId }) => useProgress(guideId),
        { initialProps: { guideId: 'guide-1' as string | undefined } }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.progress).toEqual(mockProgress);

      // Remove guideId
      rerender({ guideId: undefined });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.progress).toBeNull();
      expect(db.getProgress).toHaveBeenCalledTimes(1); // Only initial call
    });
  });
});