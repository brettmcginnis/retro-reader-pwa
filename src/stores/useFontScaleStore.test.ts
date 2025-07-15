import { act } from '@testing-library/react';
import { useFontScaleStore } from './useFontScaleStore';
import { db } from '../services/database';

// Mock database service
jest.mock('../services/database', () => ({
  db: {
    getFontSettings: jest.fn(),
    saveFontSettings: jest.fn(),
    getAllFontSettingsByGuide: jest.fn()
  }
}));

const mockDb = db as jest.Mocked<typeof db>;

describe('useFontScaleStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    useFontScaleStore.setState({
      currentGuideId: null,
      currentScreenId: null,
      fontSize: 14,
      zoomLevel: 1,
      isLoading: false
    });
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial values', () => {
      const state = useFontScaleStore.getState();
      expect(state.currentGuideId).toBeNull();
      expect(state.currentScreenId).toBeNull();
      expect(state.fontSize).toBe(14);
      expect(state.zoomLevel).toBe(1);
      expect(state.isLoading).toBe(false);
    });
  });

  describe('setCurrentContext', () => {
    it('should set guide and screen IDs', () => {
      act(() => {
        useFontScaleStore.getState().setCurrentContext('guide-1', 'screen_1024');
      });

      const state = useFontScaleStore.getState();
      expect(state.currentGuideId).toBe('guide-1');
      expect(state.currentScreenId).toBe('screen_1024');
    });

    it('should use default for undefined screenId', () => {
      act(() => {
        useFontScaleStore.getState().setCurrentContext('guide-1');
      });

      const state = useFontScaleStore.getState();
      expect(state.currentGuideId).toBe('guide-1');
      expect(state.currentScreenId).toBe('default');
    });
  });

  describe('loadFontSettings', () => {
    it('should load settings from database', async () => {
      mockDb.getFontSettings.mockResolvedValue({
        id: 'guide-1:default',
        guideId: 'guide-1',
        screenId: 'default',
        fontSize: 18,
        zoomLevel: 1.5,
        dateModified: new Date()
      });

      await act(async () => {
        await useFontScaleStore.getState().loadFontSettings('guide-1');
      });

      const state = useFontScaleStore.getState();
      expect(state.fontSize).toBe(18);
      expect(state.zoomLevel).toBe(1.5);
      expect(state.isLoading).toBe(false);
    });

    it('should use defaults when no settings found', async () => {
      mockDb.getFontSettings.mockResolvedValue(undefined);

      await act(async () => {
        await useFontScaleStore.getState().loadFontSettings('guide-1');
      });

      const state = useFontScaleStore.getState();
      expect(state.fontSize).toBe(14);
      expect(state.zoomLevel).toBe(1);
      expect(state.isLoading).toBe(false);
    });

    it('should handle database errors', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      mockDb.getFontSettings.mockRejectedValue(new Error('DB Error'));

      await act(async () => {
        await useFontScaleStore.getState().loadFontSettings('guide-1');
      });

      expect(consoleError).toHaveBeenCalledWith('Failed to load font settings:', expect.any(Error));
      expect(useFontScaleStore.getState().isLoading).toBe(false);
      
      consoleError.mockRestore();
    });
  });

  describe('setFontSize', () => {
    beforeEach(() => {
      act(() => {
        useFontScaleStore.getState().setCurrentContext('guide-1', 'screen_1024');
      });
    });

    it('should save font size to database', async () => {
      mockDb.saveFontSettings.mockResolvedValue();

      await act(async () => {
        await useFontScaleStore.getState().setFontSize(20);
      });

      expect(mockDb.saveFontSettings).toHaveBeenCalledWith({
        guideId: 'guide-1',
        screenId: 'screen_1024',
        fontSize: 20,
        zoomLevel: 1
      });

      expect(useFontScaleStore.getState().fontSize).toBe(20);
    });

    it('should warn when no context is set', async () => {
      const consoleWarn = jest.spyOn(console, 'warn').mockImplementation();
      
      act(() => {
        useFontScaleStore.setState({ currentGuideId: null, currentScreenId: null });
      });

      await act(async () => {
        await useFontScaleStore.getState().setFontSize(20);
      });

      expect(consoleWarn).toHaveBeenCalledWith('Cannot set font size without guide/screen context');
      expect(mockDb.saveFontSettings).not.toHaveBeenCalled();
      
      consoleWarn.mockRestore();
    });

    it('should handle database errors', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      mockDb.saveFontSettings.mockRejectedValue(new Error('DB Error'));

      await act(async () => {
        await useFontScaleStore.getState().setFontSize(20);
      });

      expect(consoleError).toHaveBeenCalledWith('Failed to save font size:', expect.any(Error));
      
      consoleError.mockRestore();
    });
  });

  describe('setZoomLevel', () => {
    beforeEach(() => {
      act(() => {
        useFontScaleStore.getState().setCurrentContext('guide-1', 'screen_1024');
      });
    });

    it('should save zoom level to database', async () => {
      mockDb.saveFontSettings.mockResolvedValue();

      await act(async () => {
        await useFontScaleStore.getState().setZoomLevel(1.25);
      });

      expect(mockDb.saveFontSettings).toHaveBeenCalledWith({
        guideId: 'guide-1',
        screenId: 'screen_1024',
        fontSize: 14,
        zoomLevel: 1.25
      });

      expect(useFontScaleStore.getState().zoomLevel).toBe(1.25);
    });

    it('should warn when no context is set', async () => {
      const consoleWarn = jest.spyOn(console, 'warn').mockImplementation();
      
      act(() => {
        useFontScaleStore.setState({ currentGuideId: null, currentScreenId: null });
      });

      await act(async () => {
        await useFontScaleStore.getState().setZoomLevel(1.25);
      });

      expect(consoleWarn).toHaveBeenCalledWith('Cannot set zoom level without guide/screen context');
      expect(mockDb.saveFontSettings).not.toHaveBeenCalled();
      
      consoleWarn.mockRestore();
    });
  });

  describe('setFontSettings', () => {
    beforeEach(() => {
      act(() => {
        useFontScaleStore.getState().setCurrentContext('guide-1', 'screen_1024');
      });
    });

    it('should save both font size and zoom level', async () => {
      mockDb.saveFontSettings.mockResolvedValue();

      await act(async () => {
        await useFontScaleStore.getState().setFontSettings({ fontSize: 18, zoomLevel: 1.5 });
      });

      expect(mockDb.saveFontSettings).toHaveBeenCalledWith({
        guideId: 'guide-1',
        screenId: 'screen_1024',
        fontSize: 18,
        zoomLevel: 1.5
      });

      const state = useFontScaleStore.getState();
      expect(state.fontSize).toBe(18);
      expect(state.zoomLevel).toBe(1.5);
    });

    it('should update only font size when zoom not provided', async () => {
      mockDb.saveFontSettings.mockResolvedValue();
      
      act(() => {
        useFontScaleStore.setState({ zoomLevel: 1.25 });
      });

      await act(async () => {
        await useFontScaleStore.getState().setFontSettings({ fontSize: 16 });
      });

      expect(mockDb.saveFontSettings).toHaveBeenCalledWith({
        guideId: 'guide-1',
        screenId: 'screen_1024',
        fontSize: 16,
        zoomLevel: 1.25
      });
    });

    it('should update only zoom level when font size not provided', async () => {
      mockDb.saveFontSettings.mockResolvedValue();
      
      act(() => {
        useFontScaleStore.setState({ fontSize: 16 });
      });

      await act(async () => {
        await useFontScaleStore.getState().setFontSettings({ zoomLevel: 1.75 });
      });

      expect(mockDb.saveFontSettings).toHaveBeenCalledWith({
        guideId: 'guide-1',
        screenId: 'screen_1024',
        fontSize: 16,
        zoomLevel: 1.75
      });
    });
  });

  describe('per-guide isolation', () => {
    it('should maintain separate settings for different guides', async () => {
      // Setup mock for guide 1
      mockDb.getFontSettings.mockImplementation(async (guideId, _screenId) => {
        if (guideId === 'guide-1') {
          return {
            id: 'guide-1:default',
            guideId: 'guide-1',
            screenId: 'default',
            fontSize: 16,
            zoomLevel: 1.25,
            dateModified: new Date()
          };
        } else if (guideId === 'guide-2') {
          return {
            id: 'guide-2:default',
            guideId: 'guide-2',
            screenId: 'default',
            fontSize: 20,
            zoomLevel: 1.5,
            dateModified: new Date()
          };
        }
        return undefined;
      });

      // Load settings for guide 1
      await act(async () => {
        await useFontScaleStore.getState().loadFontSettings('guide-1');
      });

      let state = useFontScaleStore.getState();
      expect(state.fontSize).toBe(16);
      expect(state.zoomLevel).toBe(1.25);

      // Load settings for guide 2
      await act(async () => {
        await useFontScaleStore.getState().loadFontSettings('guide-2');
      });

      state = useFontScaleStore.getState();
      expect(state.fontSize).toBe(20);
      expect(state.zoomLevel).toBe(1.5);
    });
  });

  describe('screen-specific settings', () => {
    it('should maintain separate settings for different screens', async () => {
      // Setup mock for different screens
      mockDb.getFontSettings.mockImplementation(async (guideId, _screenId) => {
        if (_screenId === 'screen_768') {
          return {
            id: 'guide-1:screen_768',
            guideId: 'guide-1',
            screenId: 'screen_768',
            fontSize: 12,
            zoomLevel: 1,
            dateModified: new Date()
          };
        } else if (_screenId === 'screen_1920') {
          return {
            id: 'guide-1:screen_1920',
            guideId: 'guide-1',
            screenId: 'screen_1920',
            fontSize: 18,
            zoomLevel: 1.25,
            dateModified: new Date()
          };
        }
        return undefined;
      });

      // Load settings for mobile screen
      await act(async () => {
        await useFontScaleStore.getState().loadFontSettings('guide-1', 'screen_768');
      });

      let state = useFontScaleStore.getState();
      expect(state.fontSize).toBe(12);
      expect(state.zoomLevel).toBe(1);

      // Load settings for desktop screen
      await act(async () => {
        await useFontScaleStore.getState().loadFontSettings('guide-1', 'screen_1920');
      });

      state = useFontScaleStore.getState();
      expect(state.fontSize).toBe(18);
      expect(state.zoomLevel).toBe(1.25);
    });
  });
});