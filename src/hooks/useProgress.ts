import { useState, useEffect } from 'react';
import { ReadingProgress } from '../types';
import { db } from '../services/database';

export const useProgress = (guideId?: string) => {
  const [progress, setProgress] = useState<ReadingProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProgress = async () => {
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
  };

  useEffect(() => {
    loadProgress();
  }, [guideId]);

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