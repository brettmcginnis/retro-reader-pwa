import { create } from 'zustand';

interface ScreenSettings {
  fontSize: number;
  zoomLevel: number;
}

interface ReaderState {
  currentLine: number;
  totalLines: number;
  isLoading: boolean;
  fontSize: number;
  zoomLevel: number;
  searchQuery: string;
  guideContent: string[];
  lastContentHash: string;
  hasSetInitialPosition: boolean;
  hasInitiallyScrolled: boolean;
  userScrolling: boolean;
}

interface ReaderActions {
  setCurrentLine: (line: number) => void;
  setTotalLines: (total: number) => void;
  setIsLoading: (loading: boolean) => void;
  setFontSize: (size: number) => void;
  setZoomLevel: (level: number) => void;
  setSearchQuery: (query: string) => void;
  setGuideContent: (lines: string[], contentHash: string) => void;
  setHasSetInitialPosition: (value: boolean) => void;
  setHasInitiallyScrolled: (value: boolean) => void;
  setUserScrolling: (scrolling: boolean) => void;
  resetReaderState: () => void;
  updateScreenSettings: (screenId: string, settings: ScreenSettings) => void;
}

type ReaderStore = ReaderState & ReaderActions;

const initialState: ReaderState = {
  currentLine: 1,
  totalLines: 0,
  isLoading: true,
  fontSize: 14,
  zoomLevel: 1,
  searchQuery: '',
  guideContent: [],
  lastContentHash: '',
  hasSetInitialPosition: false,
  hasInitiallyScrolled: false,
  userScrolling: false,
};

export const useReaderStore = create<ReaderStore>((set) => ({
  ...initialState,

  setCurrentLine: (line) => set({ currentLine: line }),
  setTotalLines: (total) => set({ totalLines: total }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setFontSize: (size) => set({ fontSize: size }),
  setZoomLevel: (level) => set({ zoomLevel: level }),
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
  
  updateScreenSettings: (_screenId, settings) => set({
    fontSize: settings.fontSize,
    zoomLevel: settings.zoomLevel,
  }),
}));