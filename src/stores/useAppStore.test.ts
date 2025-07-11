import { act } from '@testing-library/react';
import { useAppStore } from './useAppStore';

describe('useAppStore', () => {
  beforeEach(() => {
    // Reset store state
    useAppStore.setState({
      theme: 'light',
      currentView: 'library',
      currentGuideId: null,
      navigationTargetLine: null,
    });
    
    // Clear DOM
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.classList.remove('dark');
  });

  describe('initial state', () => {
    it('should have correct initial values', () => {
      const state = useAppStore.getState();
      expect(state.theme).toBe('light');
      expect(state.currentView).toBe('library');
      expect(state.currentGuideId).toBeNull();
      expect(state.navigationTargetLine).toBeNull();
    });
  });

  describe('theme management', () => {
    it('should toggle theme from light to dark', () => {
      act(() => {
        useAppStore.getState().toggleTheme();
      });

      const state = useAppStore.getState();
      expect(state.theme).toBe('dark');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('should toggle theme from dark to light', () => {
      useAppStore.setState({ theme: 'dark' });
      
      act(() => {
        useAppStore.getState().toggleTheme();
      });

      const state = useAppStore.getState();
      expect(state.theme).toBe('light');
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('should set theme directly', () => {
      act(() => {
        useAppStore.getState().setTheme('dark');
      });

      const state = useAppStore.getState();
      expect(state.theme).toBe('dark');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

  });

  describe('view management', () => {
    it('should set current view', () => {
      act(() => {
        useAppStore.getState().setCurrentView('reader');
      });

      expect(useAppStore.getState().currentView).toBe('reader');
    });

    it('should set current guide ID', () => {
      act(() => {
        useAppStore.getState().setCurrentGuideId('test-guide-123');
      });

      expect(useAppStore.getState().currentGuideId).toBe('test-guide-123');
    });

    it('should clear current guide ID', () => {
      useAppStore.setState({ currentGuideId: 'test-guide-123' });
      
      act(() => {
        useAppStore.getState().setCurrentGuideId(null);
      });

      expect(useAppStore.getState().currentGuideId).toBeNull();
    });
  });

  describe('navigation', () => {
    it('should set navigation target line', () => {
      act(() => {
        useAppStore.getState().setNavigationTargetLine(42);
      });

      expect(useAppStore.getState().navigationTargetLine).toBe(42);
    });

    it('should clear navigation target line', () => {
      useAppStore.setState({ navigationTargetLine: 42 });
      
      act(() => {
        useAppStore.getState().setNavigationTargetLine(null);
      });

      expect(useAppStore.getState().navigationTargetLine).toBeNull();
    });
  });

});