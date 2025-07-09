import { useState, useEffect, useCallback } from 'react';
import { ReadingProgress } from '../types';
import { db } from '../services/database';

/**
 * Hook for managing reading progress - loading and saving progress state.
 * @param guideId - Optional guide ID to manage progress for a specific guide
 * @returns Object containing progress data, loading state, and save operation
 */
export const useProgress = (guideId?: string) => {
  const [progress, setProgress] = useState<ReadingProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProgress = useCallback(async () => {
    if (!guideId) {
      setProgress(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const savedProgress = await db.getProgress(guideId);
      setProgress(savedProgress || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load progress');
    } finally {
      setLoading(false);
    }
  }, [guideId]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  const saveProgress = async (newProgress: Omit<ReadingProgress, 'lastRead'>) => {
    try {
      const progressToSave: ReadingProgress = {
        ...newProgress,
        lastRead: new Date()
      };
      await db.saveProgress(progressToSave);
      setProgress(progressToSave);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to save progress');
    }
  };

  return {
    progress,
    loading,
    error,
    saveProgress,
    refresh: loadProgress,
  };
};