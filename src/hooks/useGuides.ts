import { useState, useEffect, useCallback } from 'react';
import { Guide } from '../types';
import { GuideService } from '../services/guideService';
import { ImportExportService } from '../services/importExportService';
import { db } from '../services/database';
import { generateId } from '../utils/common';

const guideService = new GuideService();
const importExportService = new ImportExportService();

/**
 * Hook for managing guides collection - loading, adding, and deleting guides.
 * @returns Object containing guides array, loading state, error state, and guide operations
 */
export const useGuides = () => {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dbInitialized, setDbInitialized] = useState(false);

  // First ensure database is initialized
  useEffect(() => {
    const initDatabase = async () => {
      try {
        await db.init();
        setDbInitialized(true);
      } catch (err) {
        console.error('Failed to initialize database:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize database');
        setLoading(false);
      }
    };

    initDatabase();
  }, []);

  const loadGuides = async () => {
    try {
      setLoading(true);
      setError(null);
      const allGuides = await guideService.getAllGuides();
      setGuides(allGuides);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load guides');
    } finally {
      setLoading(false);
    }
  };

  // Only load guides after database is initialized
  useEffect(() => {
    if (dbInitialized) {
      loadGuides();
    }
  }, [dbInitialized]);

  const fetchGuide = useCallback(async (url: string) => {
    try {
      await guideService.fetchGuide(url);
      await loadGuides();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to fetch guide');
    }
  }, []);

  const createGuide = async (guide: Omit<Guide, 'id' | 'dateAdded' | 'dateModified'>) => {
    try {
      const newGuide: Guide = {
        ...guide,
        id: generateId(),
        dateAdded: new Date(),
        dateModified: new Date(),
        size: guide.content.length
      };
      await guideService.saveGuide(newGuide);
      await loadGuides();
      return newGuide;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create guide');
    }
  };

  const deleteGuide = async (id: string) => {
    try {
      await guideService.deleteGuide(id);
      await loadGuides();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete guide');
    }
  };

  const getGuide = useCallback(async (id: string): Promise<Guide | null> => {
    try {
      const guide = await guideService.getGuide(id);
      return guide || null;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to get guide');
    }
  }, []);

  const exportGuide = async (id: string) => {
    try {
      await importExportService.exportGuide(id);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to export guide');
    }
  };

  const exportAll = async () => {
    try {
      await importExportService.exportAll();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to export all guides');
    }
  };


  const importFromFile = async (file: File, onConfirm?: (title: string) => Promise<boolean>) => {
    try {
      const result = await importExportService.importFromFile(file, onConfirm);
      await loadGuides();
      return result;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to import file');
    }
  };

  return {
    guides,
    loading,
    error,
    fetchGuide,
    createGuide,
    deleteGuide,
    getGuide,
    exportGuide,
    exportAll,
    importFromFile,
    refresh: loadGuides,
  };
};