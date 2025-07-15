import { renderHook, act } from '@testing-library/react';
import { useFontScaleStore } from './useFontScaleStore';

describe('useFontScaleStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useFontScaleStore.setState({
      fontSettings: {
        fontSize: 14,
        zoomLevel: 1,
      },
    });
  });

  it('should have initial state', () => {
    const { result } = renderHook(() => useFontScaleStore());
    
    expect(result.current.fontSettings).toEqual({
      fontSize: 14,
      zoomLevel: 1,
    });
  });

  it('should update font size', () => {
    const { result } = renderHook(() => useFontScaleStore());
    
    act(() => {
      result.current.setFontSettings({ fontSize: 18 });
    });
    
    expect(result.current.fontSettings.fontSize).toBe(18);
    expect(result.current.fontSettings.zoomLevel).toBe(1); // Should not change
  });

  it('should update zoom level', () => {
    const { result } = renderHook(() => useFontScaleStore());
    
    act(() => {
      result.current.setFontSettings({ zoomLevel: 1.5 });
    });
    
    expect(result.current.fontSettings.zoomLevel).toBe(1.5);
    expect(result.current.fontSettings.fontSize).toBe(14); // Should not change
  });

  it('should update both font size and zoom level', () => {
    const { result } = renderHook(() => useFontScaleStore());
    
    act(() => {
      result.current.setFontSettings({ fontSize: 20, zoomLevel: 2 });
    });
    
    expect(result.current.fontSettings).toEqual({
      fontSize: 20,
      zoomLevel: 2,
    });
  });

  it('should handle partial updates', () => {
    const { result } = renderHook(() => useFontScaleStore());
    
    // First update font size
    act(() => {
      result.current.setFontSettings({ fontSize: 16 });
    });
    
    // Then update zoom level
    act(() => {
      result.current.setFontSettings({ zoomLevel: 1.25 });
    });
    
    // Both should be updated
    expect(result.current.fontSettings).toEqual({
      fontSize: 16,
      zoomLevel: 1.25,
    });
  });
});