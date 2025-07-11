import { act } from '@testing-library/react';
import { useReaderStore } from './useReaderStore';

describe('useReaderStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    useReaderStore.getState().resetReaderState();
  });

  describe('initial state', () => {
    it('should have correct initial values', () => {
      const state = useReaderStore.getState();
      expect(state.currentLine).toBe(1);
      expect(state.totalLines).toBe(0);
      expect(state.isLoading).toBe(true);
      expect(state.fontSize).toBe(14);
      expect(state.zoomLevel).toBe(1);
      expect(state.searchQuery).toBe('');
      expect(state.guideContent).toEqual([]);
      expect(state.lastContentHash).toBe('');
      expect(state.hasSetInitialPosition).toBe(false);
      expect(state.hasInitiallyScrolled).toBe(false);
      expect(state.userScrolling).toBe(false);
    });
  });

  describe('line navigation', () => {
    it('should set current line', () => {
      act(() => {
        useReaderStore.getState().setCurrentLine(42);
      });

      expect(useReaderStore.getState().currentLine).toBe(42);
    });

    it('should set total lines', () => {
      act(() => {
        useReaderStore.getState().setTotalLines(100);
      });

      expect(useReaderStore.getState().totalLines).toBe(100);
    });
  });

  describe('loading state', () => {
    it('should set loading state', () => {
      act(() => {
        useReaderStore.getState().setIsLoading(false);
      });

      expect(useReaderStore.getState().isLoading).toBe(false);

      act(() => {
        useReaderStore.getState().setIsLoading(true);
      });

      expect(useReaderStore.getState().isLoading).toBe(true);
    });
  });

  describe('display settings', () => {
    it('should set font size', () => {
      act(() => {
        useReaderStore.getState().setFontSize(18);
      });

      expect(useReaderStore.getState().fontSize).toBe(18);
    });

    it('should set zoom level', () => {
      act(() => {
        useReaderStore.getState().setZoomLevel(1.5);
      });

      expect(useReaderStore.getState().zoomLevel).toBe(1.5);
    });

    it('should update screen settings', () => {
      const settings = { fontSize: 20, zoomLevel: 1.25 };
      
      act(() => {
        useReaderStore.getState().updateScreenSettings('desktop-1920x1080', settings);
      });

      const state = useReaderStore.getState();
      expect(state.fontSize).toBe(20);
      expect(state.zoomLevel).toBe(1.25);
    });
  });

  describe('search', () => {
    it('should set search query', () => {
      act(() => {
        useReaderStore.getState().setSearchQuery('test query');
      });

      expect(useReaderStore.getState().searchQuery).toBe('test query');
    });
  });

  describe('guide content', () => {
    it('should set guide content and update total lines', () => {
      const content = ['Line 1', 'Line 2', 'Line 3'];
      const hash = 'abc123';

      act(() => {
        useReaderStore.getState().setGuideContent(content, hash);
      });

      const state = useReaderStore.getState();
      expect(state.guideContent).toEqual(content);
      expect(state.lastContentHash).toBe(hash);
      expect(state.totalLines).toBe(3);
    });

    it('should handle empty content', () => {
      act(() => {
        useReaderStore.getState().setGuideContent([], 'empty');
      });

      const state = useReaderStore.getState();
      expect(state.guideContent).toEqual([]);
      expect(state.totalLines).toBe(0);
    });
  });

  describe('position tracking', () => {
    it('should set initial position flag', () => {
      act(() => {
        useReaderStore.getState().setHasSetInitialPosition(true);
      });

      expect(useReaderStore.getState().hasSetInitialPosition).toBe(true);
    });

    it('should set initially scrolled flag', () => {
      act(() => {
        useReaderStore.getState().setHasInitiallyScrolled(true);
      });

      expect(useReaderStore.getState().hasInitiallyScrolled).toBe(true);
    });
  });

  describe('scrolling state', () => {
    it('should set user scrolling state', () => {
      act(() => {
        useReaderStore.getState().setUserScrolling(true);
      });

      expect(useReaderStore.getState().userScrolling).toBe(true);

      act(() => {
        useReaderStore.getState().setUserScrolling(false);
      });

      expect(useReaderStore.getState().userScrolling).toBe(false);
    });
  });

  describe('reset state', () => {
    it('should reset all state to initial values', () => {
      // Set some custom values
      act(() => {
        const store = useReaderStore.getState();
        store.setCurrentLine(50);
        store.setTotalLines(200);
        store.setIsLoading(false);
        store.setFontSize(20);
        store.setZoomLevel(1.5);
        store.setSearchQuery('search');
        store.setGuideContent(['Line 1'], 'hash');
        store.setHasSetInitialPosition(true);
        store.setHasInitiallyScrolled(true);
        store.setUserScrolling(true);
      });

      // Reset state
      act(() => {
        useReaderStore.getState().resetReaderState();
      });

      // Verify all values are back to initial
      const state = useReaderStore.getState();
      expect(state.currentLine).toBe(1);
      expect(state.totalLines).toBe(0);
      expect(state.isLoading).toBe(true);
      expect(state.fontSize).toBe(14);
      expect(state.zoomLevel).toBe(1);
      expect(state.searchQuery).toBe('');
      expect(state.guideContent).toEqual([]);
      expect(state.lastContentHash).toBe('');
      expect(state.hasSetInitialPosition).toBe(false);
      expect(state.hasInitiallyScrolled).toBe(false);
      expect(state.userScrolling).toBe(false);
    });
  });
});