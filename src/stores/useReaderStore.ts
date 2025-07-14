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
  /** Total number of lines in the guide */
  totalLines: number;
  /** Loading state for guide content */
  isLoading: boolean;
  /** Font settings for the reader */
  fontSettings: FontSettings;
  /** Current search query */
  searchQuery: string;
  /** Array of guide content lines */
  guideContent: string[];
  /** Hash of the last loaded content to detect changes */
  lastContentHash: string;
  /** Whether initial scroll position has been set */
  hasSetInitialPosition: boolean;
  /** Whether the initial scroll animation has completed */
  hasInitiallyScrolled: boolean;
  /** Whether the user is currently scrolling */
  userScrolling: boolean;
}

/**
 * Actions for managing reader state
 */
interface ReaderActions {
  /** Sets the total number of lines */
  setTotalLines: (total: number) => void;
  /** Sets the loading state */
  setIsLoading: (loading: boolean) => void;
  /** Updates font settings */
  setFontSettings: (settings: Partial<FontSettings>) => void;
  /** Sets the search query */
  setSearchQuery: (query: string) => void;
  /** Sets the guide content and its hash */
  setGuideContent: (lines: string[], contentHash: string) => void;
  /** Sets whether initial position has been set */
  setHasSetInitialPosition: (value: boolean) => void;
  /** Sets whether initial scroll has completed */
  setHasInitiallyScrolled: (value: boolean) => void;
  /** Sets whether user is currently scrolling */
  setUserScrolling: (scrolling: boolean) => void;
  /** Resets all reader state to initial values */
  resetReaderState: () => void;
  /** Updates screen-specific settings */
  updateScreenSettings: (screenId: string, settings: FontSettings) => void;
}

type ReaderStore = ReaderState & ReaderActions;

const initialState: ReaderState = {
  totalLines: 0,
  isLoading: true,
  fontSettings: {
    fontSize: 14,
    zoomLevel: 1,
  },
  searchQuery: '',
  guideContent: [],
  lastContentHash: '',
  hasSetInitialPosition: false,
  hasInitiallyScrolled: false,
  userScrolling: false,
};

export const useReaderStore = create<ReaderStore>((set) => ({
  ...initialState,

  setTotalLines: (total) => set({ totalLines: total }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setFontSettings: (settings) => set((state) => ({
    fontSettings: { ...state.fontSettings, ...settings }
  })),
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  setGuideContent: (lines, contentHash) => set({ 
    guideContent: lines, 
    lastContentHash: contentHash,
    totalLines: lines.length 
  }),
  
  setHasSetInitialPosition: (value) => set({ hasSetInitialPosition: value }),
  setHasInitiallyScrolled: (value) => set({ hasInitiallyScrolled: value }),
  setUserScrolling: (scrolling) => set({ userScrolling: scrolling }),
  
  resetReaderState: () => set(initialState),
  
  updateScreenSettings: (_screenId, settings) => set((state) => ({
    fontSettings: {
      ...state.fontSettings,
      fontSize: settings.fontSize,
      zoomLevel: settings.zoomLevel,
    }
  })),
}));