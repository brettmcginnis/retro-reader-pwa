import { act } from '@testing-library/react';
import { useReaderStore } from './useReaderStore';

describe('useReaderStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    useReaderStore.setState({
      isLoading: true,
      fontSettings: { fontSize: 14, zoomLevel: 1 },
      searchQuery: '',
      guideContent: []
    });
  });

  describe('initial state', () => {
    it('should have correct initial values', () => {
      const state = useReaderStore.getState();
      expect(state.isLoading).toBe(true);
      expect(state.fontSettings.fontSize).toBe(14);
      expect(state.fontSettings.zoomLevel).toBe(1);
      expect(state.searchQuery).toBe('');
      expect(state.guideContent).toEqual([]);
    });
  });



  describe('font settings', () => {
    it('should set font settings', () => {
      act(() => {
        useReaderStore.getState().setFontSettings({ fontSize: 18 });
      });

      expect(useReaderStore.getState().fontSettings.fontSize).toBe(18);
      expect(useReaderStore.getState().fontSettings.zoomLevel).toBe(1); // unchanged

      act(() => {
        useReaderStore.getState().setFontSettings({ zoomLevel: 1.5 });
      });

      expect(useReaderStore.getState().fontSettings.fontSize).toBe(18); // unchanged
      expect(useReaderStore.getState().fontSettings.zoomLevel).toBe(1.5);
    });

    it('should update screen settings', () => {
      const settings = { fontSize: 20, zoomLevel: 1.25 };
      
      act(() => {
        useReaderStore.getState().updateScreenSettings(settings);
      });

      const state = useReaderStore.getState();
      expect(state.fontSettings.fontSize).toBe(20);
      expect(state.fontSettings.zoomLevel).toBe(1.25);
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
    it('should load guide content', () => {
      const content = ['Line 1', 'Line 2', 'Line 3'];

      act(() => {
        useReaderStore.getState().load(content);
      });

      const state = useReaderStore.getState();
      expect(state.guideContent).toEqual(content);
      expect(state.isLoading).toBe(false);
    });

    it('should handle empty content', () => {
      act(() => {
        useReaderStore.getState().load([]);
      });

      const state = useReaderStore.getState();
      expect(state.guideContent).toEqual([]);
      expect(state.isLoading).toBe(false);
    });

    it('should set loading to true before loading', () => {
      const content = ['Line 1', 'Line 2', 'Line 3'];
      const store = useReaderStore.getState();
      
      // Mock the set function to capture state changes
      const states: boolean[] = [];
      const originalLoad = store.load;
      store.load = (lines: string[]) => {
        // First state change should set loading to true
        states.push(true);
        // Then the original load completes and sets loading to false
        originalLoad.call(store, lines);
        states.push(useReaderStore.getState().isLoading);
      };

      act(() => {
        store.load(content);
      });

      // Verify loading was set to true first, then false
      expect(states[0]).toBe(true);
      expect(states[1]).toBe(false);
    });
  });

  describe('loading state', () => {
    it('should be loading by default', () => {
      expect(useReaderStore.getState().isLoading).toBe(true);
    });

    it('should set loading to false after content is loaded', () => {
      act(() => {
        useReaderStore.getState().load(['Line 1', 'Line 2']);
      });

      expect(useReaderStore.getState().isLoading).toBe(false);
    });
  });

});