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
 * State interface for the guide reader
 */
interface ReaderState {
  /** Loading state for guide content */
  isLoading: boolean;
  /** Font settings for the reader */
  fontSettings: FontSettings;
  /** Current search query */
  searchQuery: string;
  /** Array of guide content lines */
  guideContent: string[];
}

/**
 * Actions for managing reader state
 */
interface ReaderActions {
  /** Loads guide content */
  load: (lines: string[]) => void;
  /** Updates font settings */
  setFontSettings: (settings: Partial<FontSettings>) => void;
  /** Sets the search query */
  setSearchQuery: (query: string) => void;
  /** Updates screen-specific settings */
  updateScreenSettings: (settings: FontSettings) => void;
}

type ReaderStore = ReaderState & ReaderActions;

const initialState: ReaderState = {
  isLoading: true,
  fontSettings: {
    fontSize: 14,
    zoomLevel: 1,
  },
  searchQuery: '',
  guideContent: [],
};

export const useReaderStore = create<ReaderStore>((set) => ({
  ...initialState,

  load: (lines) => {
    set({ isLoading: true });
    set({ 
      guideContent: lines,
      isLoading: false 
    });
  },
  
  setFontSettings: (settings) => set((state) => ({
    fontSettings: { ...state.fontSettings, ...settings }
  })),
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  updateScreenSettings: (settings) => set((state) => ({
    fontSettings: {
      ...state.fontSettings,
      fontSize: settings.fontSize,
      zoomLevel: settings.zoomLevel,
    }
  })),
}));