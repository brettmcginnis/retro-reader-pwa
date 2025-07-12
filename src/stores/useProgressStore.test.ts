import { act } from '@testing-library/react';
import { useProgressStore } from './useProgressStore';
import { db } from '../services/database';
import { ReadingProgress } from '../types';

// Mock database service
jest.mock('../services/database', () => ({
  db: {
    getProgress: jest.fn(),
    saveProgress: jest.fn(),
  },
}));

describe('useProgressStore', () => {
  const mockProgress: ReadingProgress = {
    guideId: 'guide-1',
    line: 42,
    percentage: 25.5,
    lastRead: new Date('2024-01-01'),
    fontSize: 16,
    zoomLevel: 1.2,
    screenSettings: {
      'desktop-1920x1080': {
        fontSize: 16,
        zoomLevel: 1.2,
      },
    },
  };

  beforeEach(() => {
    // Reset store state
    useProgressStore.setState({
      progress: {},
      loading: false,
      error: null,
    });

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial values', () => {
      const state = useProgressStore.getState();
      expect(state.progress).toEqual({});
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('loadProgress', () => {
    it('should load progress for a guide', async () => {
      (db.getProgress as jest.Mock).mockResolvedValue(mockProgress);

      await act(async () => {
        await useProgressStore.getState().loadProgress('guide-1');
      });

      const state = useProgressStore.getState();
      expect(db.getProgress).toHaveBeenCalledWith('guide-1');
      expect(state.progress['guide-1']).toEqual(mockProgress);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle when no progress exists', async () => {
      (db.getProgress as jest.Mock).mockResolvedValue(undefined);

      await act(async () => {
        await useProgressStore.getState().loadProgress('guide-1');
      });

      const state = useProgressStore.getState();
      expect(state.progress['guide-1']).toBeUndefined();
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle load errors', async () => {
      const error = new Error('Failed to load progress');
      (db.getProgress as jest.Mock).mockRejectedValue(error);

      await act(async () => {
        await useProgressStore.getState().loadProgress('guide-1');
      });

      const state = useProgressStore.getState();
      expect(state.error).toBe('Failed to load progress');
      expect(state.loading).toBe(false);
    });

    it('should set loading state during load', async () => {
      let loadingStateDuringCall = false;
      (db.getProgress as jest.Mock).mockImplementation(async () => {
        loadingStateDuringCall = useProgressStore.getState().loading;
        return mockProgress;
      });

      await act(async () => {
        await useProgressStore.getState().loadProgress('guide-1');
      });

      expect(loadingStateDuringCall).toBe(true);
      expect(useProgressStore.getState().loading).toBe(false);
    });
  });

  describe('saveProgress', () => {
    it('should save progress and update store', async () => {
      await act(async () => {
        await useProgressStore.getState().saveProgress(mockProgress);
      });

      expect(db.saveProgress).toHaveBeenCalledWith(mockProgress);
      
      const state = useProgressStore.getState();
      expect(state.progress['guide-1']).toEqual(mockProgress);
    });

    it('should handle save errors', async () => {
      const error = new Error('Failed to save');
      (db.saveProgress as jest.Mock).mockRejectedValue(error);

      await expect(
        useProgressStore.getState().saveProgress(mockProgress)
      ).rejects.toThrow('Failed to save');
    });

    it('should merge with existing progress data', async () => {
      const existingProgress: ReadingProgress = {
        guideId: 'guide-2',
        line: 10,
        percentage: 5,
        lastRead: new Date('2024-01-02'),
      };

      useProgressStore.setState({
        progress: { 'guide-2': existingProgress },
      });

      // Mock saveProgress to succeed
      (db.saveProgress as jest.Mock).mockResolvedValue(undefined);

      await act(async () => {
        await useProgressStore.getState().saveProgress(mockProgress);
      });

      const state = useProgressStore.getState();
      expect(state.progress).toEqual({
        'guide-1': mockProgress,
        'guide-2': existingProgress,
      });
    });
  });

  describe('getProgress', () => {
    it('should return progress for a guide', () => {
      useProgressStore.setState({
        progress: { 'guide-1': mockProgress },
      });

      const progress = useProgressStore.getState().getProgress('guide-1');
      expect(progress).toEqual(mockProgress);
    });

    it('should return null for non-existent guide', () => {
      const progress = useProgressStore.getState().getProgress('non-existent');
      expect(progress).toBeNull();
    });

    it('should return null when no progress data exists', () => {
      const progress = useProgressStore.getState().getProgress('guide-1');
      expect(progress).toBeNull();
    });
  });
});