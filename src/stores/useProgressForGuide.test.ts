import { renderHook, act } from '@testing-library/react';
import { useProgressForGuide } from './useProgressForGuide';
import { useProgressStore } from './useProgressStore';

jest.mock('./useProgressStore');

describe('useProgressForGuide', () => {
  const mockLoadProgress = jest.fn();
  const mockSaveProgressToStore = jest.fn();
  const mockGetProgress = jest.fn();

  const mockProgressData = {
    guideId: 'test-guide-1',
    line: 50,
    percentage: 50,
    lastRead: new Date('2024-01-01')
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useProgressStore as unknown as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      loadProgress: mockLoadProgress,
      saveProgress: mockSaveProgressToStore,
      getProgress: mockGetProgress
    });
  });

  it('should load progress when guide ID is provided', () => {
    renderHook(() => useProgressForGuide('test-guide-1'));

    expect(mockLoadProgress).toHaveBeenCalledWith('test-guide-1');
  });

  it('should not load progress when guide ID changes to same value', () => {
    const { rerender } = renderHook(
      ({ guideId }) => useProgressForGuide(guideId),
      { initialProps: { guideId: 'test-guide-1' } }
    );

    expect(mockLoadProgress).toHaveBeenCalledTimes(1);

    rerender({ guideId: 'test-guide-1' });
    expect(mockLoadProgress).toHaveBeenCalledTimes(1);
  });

  it('should load progress when guide ID changes', () => {
    const { rerender } = renderHook(
      ({ guideId }) => useProgressForGuide(guideId),
      { initialProps: { guideId: 'test-guide-1' } }
    );

    expect(mockLoadProgress).toHaveBeenCalledWith('test-guide-1');

    rerender({ guideId: 'test-guide-2' });
    expect(mockLoadProgress).toHaveBeenCalledWith('test-guide-2');
    expect(mockLoadProgress).toHaveBeenCalledTimes(2);
  });

  it('should return progress for the specific guide', () => {
    mockGetProgress.mockReturnValue(mockProgressData);
    
    const { result } = renderHook(() => useProgressForGuide('test-guide-1'));

    expect(result.current.progress).toEqual(mockProgressData);
    expect(mockGetProgress).toHaveBeenCalledWith('test-guide-1');
  });

  it('should return null progress when getProgress returns null', () => {
    mockGetProgress.mockReturnValue(null);
    
    const { result } = renderHook(() => useProgressForGuide('test-guide-1'));

    expect(result.current.progress).toBeNull();
  });

  it('should save progress with lastRead date added', async () => {
    const { result } = renderHook(() => useProgressForGuide('test-guide-1'));

    const newProgress = {
      guideId: 'test-guide-1',
      line: 75,
      percentage: 75
    };

    await act(async () => {
      await result.current.saveProgress(newProgress);
    });

    expect(mockSaveProgressToStore).toHaveBeenCalledWith({
      ...newProgress,
      lastRead: expect.any(Date)
    });
  });

  it('should provide refresh function that reloads progress', async () => {
    const { result } = renderHook(() => useProgressForGuide('test-guide-1'));

    await act(async () => {
      await result.current.refresh();
    });

    expect(mockLoadProgress).toHaveBeenCalledWith('test-guide-1');
    expect(mockLoadProgress).toHaveBeenCalledTimes(2); // Once on mount, once on refresh
  });

  it('should return loading and error states from store', () => {
    (useProgressStore as unknown as jest.Mock).mockReturnValue({
      loading: true,
      error: 'Test error',
      loadProgress: mockLoadProgress,
      saveProgress: mockSaveProgressToStore,
      getProgress: mockGetProgress
    });

    const { result } = renderHook(() => useProgressForGuide('test-guide-1'));

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe('Test error');
  });
});