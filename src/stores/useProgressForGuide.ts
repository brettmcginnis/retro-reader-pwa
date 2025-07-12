import { useEffect, useCallback } from 'react';
import { useProgressStore } from './useProgressStore';
import { ReadingProgress } from '../types';

/**
 * Convenience hook for managing progress for a single guide.
 * Provides a simpler interface similar to the old useProgress hook.
 * @param guideId - The guide ID to manage progress for
 * @returns Object containing progress data, loading state, error, and operations
 */
export const useProgressForGuide = (guideId: string) => {
  const { 
    loading, 
    error, 
    loadProgress, 
    saveProgress: saveProgressToStore,
    getProgress 
  } = useProgressStore();

  // Load progress when guide ID changes
  useEffect(() => {
    if (guideId) {
      loadProgress(guideId);
    }
  }, [guideId, loadProgress]);

  // Get progress for the specific guide
  const progress = guideId ? getProgress(guideId) : null;

  // Wrapper that adds lastRead date automatically
  const saveProgress = useCallback(async (newProgress: Omit<ReadingProgress, 'lastRead'>) => {
    const progressToSave: ReadingProgress = {
      ...newProgress,
      lastRead: new Date()
    };
    await saveProgressToStore(progressToSave);
  }, [saveProgressToStore]);

  // Refresh function to reload progress
  const refresh = useCallback(() => {
    if (guideId) {
      return loadProgress(guideId);
    }
    return Promise.resolve();
  }, [guideId, loadProgress]);

  return {
    progress,
    loading,
    error,
    saveProgress,
    refresh
  };
};