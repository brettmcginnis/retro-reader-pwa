import { create } from 'zustand';
import { Guide } from '../types';
import { GuideService } from '../services/guideService';
import { ImportExportService } from '../services/importExportService';
import { db } from '../services/database';
import { generateId } from '../utils/common';

const guideService = new GuideService();
const importExportService = new ImportExportService();

interface GuideState {
  guides: Guide[];
  loading: boolean;
  error: string | null;
  dbInitialized: boolean;
}

interface GuideActions {
  initDatabase: () => Promise<void>;
  loadGuides: () => Promise<void>;
  fetchGuide: (url: string) => Promise<void>;
  createGuide: (guide: Omit<Guide, 'id' | 'dateAdded' | 'dateModified'>) => Promise<Guide>;
  deleteGuide: (id: string) => Promise<void>;
  getGuide: (id: string) => Promise<Guide | null>;
  exportGuide: (id: string) => Promise<void>;
  exportAll: () => Promise<void>;
  importFromFile: (file: File, onConfirm?: (title: string) => Promise<boolean>) => Promise<{ imported: number; skipped: number; errors: string[] }>;
  refresh: () => Promise<void>;
}

type GuideStore = GuideState & GuideActions;

export const useGuideStore = create<GuideStore>((set, get) => ({
  guides: [],
  loading: true,
  error: null,
  dbInitialized: false,

  initDatabase: async () => {
    try {
      await db.init();
      set({ dbInitialized: true });
      // Load guides after database is initialized
      await get().loadGuides();
    } catch (err) {
      console.error('Failed to initialize database:', err);
      set({ 
        error: err instanceof Error ? err.message : 'Failed to initialize database',
        loading: false 
      });
    }
  },

  loadGuides: async () => {
    try {
      set({ loading: true, error: null });
      const allGuides = await guideService.getAllGuides();
      set({ guides: allGuides, loading: false });
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : 'Failed to load guides',
        loading: false 
      });
    }
  },

  fetchGuide: async (url: string) => {
    try {
      await guideService.fetchGuide(url);
      await get().loadGuides();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to fetch guide');
    }
  },

  createGuide: async (guide) => {
    try {
      const newGuide: Guide = {
        ...guide,
        id: generateId(),
        dateAdded: new Date(),
        dateModified: new Date(),
        size: guide.content.length
      };
      await guideService.saveGuide(newGuide);
      await get().loadGuides();
      return newGuide;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create guide');
    }
  },

  deleteGuide: async (id: string) => {
    try {
      await guideService.deleteGuide(id);
      await get().loadGuides();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete guide');
    }
  },

  getGuide: async (id: string): Promise<Guide | null> => {
    try {
      const guide = await guideService.getGuide(id);
      return guide || null;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to get guide');
    }
  },

  exportGuide: async (id: string) => {
    try {
      await importExportService.exportGuide(id);
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to export guide');
    }
  },

  exportAll: async () => {
    try {
      await importExportService.exportAll();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to export all guides');
    }
  },

  importFromFile: async (file: File, onConfirm?: (title: string) => Promise<boolean>) => {
    try {
      const result = await importExportService.importFromFile(file, onConfirm);
      await get().loadGuides();
      return result;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to import file');
    }
  },

  refresh: async () => {
    await get().loadGuides();
  },
}));

// Initialize database on store creation
if (typeof window !== 'undefined') {
  useGuideStore.getState().initDatabase();
}