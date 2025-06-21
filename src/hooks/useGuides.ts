import { useState, useEffect } from 'react';
import { Guide } from '../types';
import { GuideService } from '../services/guideService';
import { ImportExportService } from '../services/importExportService';

const guideService = new GuideService();
const importExportService = new ImportExportService();

export const useGuides = () => {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    loadGuides();
  }, []);

  const fetchGuide = async (url: string) => {
    try {
      await guideService.fetchGuide(url);
      await loadGuides();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to fetch guide');
    }
  };

  const createGuide = async (guide: Omit<Guide, 'id' | 'dateAdded' | 'dateModified'>) => {
    try {
      const newGuide: Guide = {
        ...guide,
        id: Date.now().toString(36) + Math.random().toString(36).substr(2),
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

  const getGuide = async (id: string): Promise<Guide | null> => {
    try {
      const guide = await guideService.getGuide(id);
      return guide || null;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to get guide');
    }
  };

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

  const createBackup = async () => {
    try {
      await importExportService.createBackup();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create backup');
    }
  };

  const importFromFile = async (file: File) => {
    try {
      const result = await importExportService.importFromFile(file);
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
    createBackup,
    importFromFile,
    refresh: loadGuides,
  };
};