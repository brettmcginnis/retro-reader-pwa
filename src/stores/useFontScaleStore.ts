import { create } from 'zustand';

/**
 * Font and display settings
 */
interface FontSettings {
  /** Font size in pixels */
  fontSize: number;
  /** Zoom level multiplier (1 = 100%) */
  zoomLevel: number;
}

/**
 * State interface for font scale settings
 */
interface FontScaleState {
  /** Font settings for the reader */
  fontSettings: FontSettings;
}

/**
 * Actions for managing font scale settings
 */
interface FontScaleActions {
  /** Updates font settings */
  setFontSettings: (settings: Partial<FontSettings>) => void;
}

type FontScaleStore = FontScaleState & FontScaleActions;

const initialState: FontScaleState = {
  fontSettings: {
    fontSize: 14,
    zoomLevel: 1,
  },
};

export const useFontScaleStore = create<FontScaleStore>((set) => ({
  ...initialState,
  
  setFontSettings: (settings) => set((state) => ({
    fontSettings: { ...state.fontSettings, ...settings }
  })),
}));