import { create } from 'zustand';
import { db } from '../services/database';

/**
 * State interface for font scale settings
 */
interface FontScaleState {
  /** Currently active guide ID */
  currentGuideId: string | null;
  /** Currently active screen ID */
  currentScreenId: string | null;
  /** Current font size in pixels */
  fontSize: number;
  /** Current zoom level multiplier (1 = 100%) */
  zoomLevel: number;
  /** Loading state */
  isLoading: boolean;
}

/**
 * Actions for managing font scale settings
 */
interface FontScaleActions {
  /** Sets the current guide and screen context */
  setCurrentContext: (guideId: string, screenId?: string) => void;
  /** Loads font settings from database for current context */
  loadFontSettings: (guideId: string, screenId?: string) => Promise<void>;
  /** Sets font size for current context */
  setFontSize: (size: number) => Promise<void>;
  /** Sets zoom level for current context */
  setZoomLevel: (zoom: number) => Promise<void>;
  /** Updates font settings (used internally and by setFontSettings) */
  setFontSettings: (settings: Partial<{ fontSize: number; zoomLevel: number }>) => Promise<void>;
}

type FontScaleStore = FontScaleState & FontScaleActions;

const DEFAULT_FONT_SIZE = 14;
const DEFAULT_ZOOM_LEVEL = 1;

export const useFontScaleStore = create<FontScaleStore>((set, get) => ({
  // State
  currentGuideId: null,
  currentScreenId: null,
  fontSize: DEFAULT_FONT_SIZE,
  zoomLevel: DEFAULT_ZOOM_LEVEL,
  isLoading: false,

  // Actions
  setCurrentContext: (guideId, screenId = 'default') => {
    set({ 
      currentGuideId: guideId, 
      currentScreenId: screenId 
    });
  },

  loadFontSettings: async (guideId, screenId = 'default') => {
    set({ isLoading: true });
    
    try {
      const settings = await db.getFontSettings(guideId, screenId);
      
      if (settings) {
        set({
          fontSize: settings.fontSize,
          zoomLevel: settings.zoomLevel,
          isLoading: false
        });
      } else {
        // Use defaults if no settings found
        set({
          fontSize: DEFAULT_FONT_SIZE,
          zoomLevel: DEFAULT_ZOOM_LEVEL,
          isLoading: false
        });
      }
    } catch (error) {
      console.error('Failed to load font settings:', error);
      set({ isLoading: false });
    }
  },

  setFontSize: async (size) => {
    const { currentGuideId, currentScreenId, zoomLevel } = get();
    
    if (!currentGuideId || !currentScreenId) {
      console.warn('Cannot set font size without guide/screen context');
      return;
    }

    try {
      await db.saveFontSettings({
        guideId: currentGuideId,
        screenId: currentScreenId,
        fontSize: size,
        zoomLevel
      });
      
      set({ fontSize: size });
    } catch (error) {
      console.error('Failed to save font size:', error);
    }
  },

  setZoomLevel: async (zoom) => {
    const { currentGuideId, currentScreenId, fontSize } = get();
    
    if (!currentGuideId || !currentScreenId) {
      console.warn('Cannot set zoom level without guide/screen context');
      return;
    }

    try {
      await db.saveFontSettings({
        guideId: currentGuideId,
        screenId: currentScreenId,
        fontSize,
        zoomLevel: zoom
      });
      
      set({ zoomLevel: zoom });
    } catch (error) {
      console.error('Failed to save zoom level:', error);
    }
  },

  setFontSettings: async (settings) => {
    const { currentGuideId, currentScreenId, fontSize, zoomLevel } = get();
    
    if (!currentGuideId || !currentScreenId) {
      console.warn('Cannot set font settings without guide/screen context');
      return;
    }

    const newFontSize = settings.fontSize ?? fontSize;
    const newZoomLevel = settings.zoomLevel ?? zoomLevel;

    try {
      await db.saveFontSettings({
        guideId: currentGuideId,
        screenId: currentScreenId,
        fontSize: newFontSize,
        zoomLevel: newZoomLevel
      });
      
      set({ 
        fontSize: newFontSize,
        zoomLevel: newZoomLevel
      });
    } catch (error) {
      console.error('Failed to save font settings:', error);
    }
  }
}));