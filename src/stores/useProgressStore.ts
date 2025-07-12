import { create } from 'zustand';
import { ReadingProgress } from '../types';
import { db } from '../services/database';

/**
 * State interface for reading progress tracking
 */
interface ProgressState {
  /** Map of guide IDs to their reading progress */
  progress: Record<string, ReadingProgress>;
  /** Loading state for progress operations */
  loading: boolean;
  /** Error message if progress operations fail */
  error: string | null;
}

/**
 * Actions for managing reading progress
 */
interface ProgressActions {
  /** Loads progress data for a specific guide */
  loadProgress: (guideId: string) => Promise<void>;
  /** Saves or updates reading progress for a guide */
  saveProgress: (progress: ReadingProgress) => Promise<void>;
  /** Gets the current progress for a specific guide */
  getProgress: (guideId: string) => ReadingProgress | null;
}

type ProgressStore = ProgressState & ProgressActions;

export const useProgressStore = create<ProgressStore>((set, get) => ({
  progress: {},
  loading: false,
  error: null,

  loadProgress: async (guideId: string) => {
    try {
      set({ loading: true, error: null });
      const progressData = await db.getProgress(guideId);
      if (progressData) {
        set((state) => ({
          progress: { ...state.progress, [guideId]: progressData },
          loading: false,
        }));
      } else {
        set({ loading: false });
      }
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to load progress',
        loading: false,
      });
    }
  },

  saveProgress: async (progress: ReadingProgress) => {
    try {
      await db.saveProgress(progress);
      set((state) => ({
        progress: { ...state.progress, [progress.guideId]: progress },
      }));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to save progress');
    }
  },

  getProgress: (guideId: string) => {
    return get().progress[guideId] || null;
  },
}));