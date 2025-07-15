import { renderHook, act } from '@testing-library/react';
import { useBookmarkUI } from './useBookmarkUI';
import { Bookmark } from '../stores/useBookmarkStore';

// Constants from useBookmarkUI.ts
const DOUBLE_TAP_DELAY = 300;
const BOOKMARK_VIBRATION_DURATION = 50;

// Mock dependencies
jest.mock('../utils/common', () => ({
  generateId: jest.fn(() => 'generated-id')
}));

const mockShowToast = jest.fn();
const mockConfirm = jest.fn().mockResolvedValue(true);

jest.mock('../contexts/useToast', () => ({
  useToast: () => ({
    showToast: mockShowToast,
    confirm: mockConfirm
  })
}));

describe('useBookmarkUI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockConfirm.mockResolvedValue(true);
  });

  const mockBookmarks: Bookmark[] = [
    {
      id: 'bookmark-1',
      guideId: 'guide-1',
      line: 10,
      title: 'Chapter 1',
      note: 'Start of chapter',
      dateCreated: new Date('2023-01-01'),
      isCurrentPosition: false
    },
    {
      id: 'bookmark-2',
      guideId: 'guide-1',
      line: 50,
      title: 'Current Position',
      dateCreated: new Date('2023-01-02'),
      isCurrentPosition: true
    }
  ];

  const mockLines = Array.from({ length: 100 }, (_, i) => `Line ${i + 1} content`);

  const defaultProps = {
    lines: mockLines,
    bookmarks: mockBookmarks,
    onAddBookmark: jest.fn().mockResolvedValue(true),
    onDeleteBookmark: jest.fn().mockResolvedValue(undefined),
    onUpdateBookmark: jest.fn().mockResolvedValue(undefined),
    onSetAsCurrentPosition: jest.fn().mockResolvedValue(true),
    onRefreshBookmarks: jest.fn().mockResolvedValue(undefined)
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // Mock navigator.vibrate
    Object.defineProperty(navigator, 'vibrate', {
      writable: true,
      configurable: true,
      value: jest.fn()
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('initial state', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => useBookmarkUI(defaultProps));

      expect(result.current.showBookmarkModal).toBe(false);
      expect(result.current.bookmarkLine).toBe(1);
      expect(result.current.bookmarkTitle).toBe('');
      expect(result.current.bookmarkNote).toBe('');
      expect(result.current.showBookmarksOverlay).toBe(false);
    });

    it('should create bookmarked lines map', () => {
      const { result } = renderHook(() => useBookmarkUI(defaultProps));

      expect(result.current.bookmarkedLines.size).toBe(2);
      expect(result.current.bookmarkedLines.get(10)).toEqual(mockBookmarks[0]);
      expect(result.current.bookmarkedLines.get(50)).toEqual(mockBookmarks[1]);
    });
  });

  describe('double tap detection', () => {
    it('should detect double tap within delay', () => {
      const { result } = renderHook(() => useBookmarkUI(defaultProps));

      act(() => {
        result.current.handleLineDoubleClick(25);
      });

      // First tap - should not open modal
      expect(result.current.showBookmarkModal).toBe(false);

      act(() => {
        jest.advanceTimersByTime(DOUBLE_TAP_DELAY - 100);
        result.current.handleLineDoubleClick(25);
      });

      // Second tap within delay - should open modal
      expect(result.current.showBookmarkModal).toBe(true);
      expect(result.current.bookmarkLine).toBe(25);
      expect(result.current.bookmarkTitle).toBe('Line 25 content');
      expect(result.current.bookmarkNote).toBe('');
      expect(navigator.vibrate).toHaveBeenCalledWith(BOOKMARK_VIBRATION_DURATION);
    });

    it('should not detect double tap after delay', () => {
      const { result } = renderHook(() => useBookmarkUI(defaultProps));

      act(() => {
        result.current.handleLineDoubleClick(25);
      });

      act(() => {
        jest.advanceTimersByTime(DOUBLE_TAP_DELAY + 100);
        result.current.handleLineDoubleClick(25);
      });

      // Second tap after delay - should not open modal
      expect(result.current.showBookmarkModal).toBe(false);
    });

    it('should not detect double tap on different lines', () => {
      const { result } = renderHook(() => useBookmarkUI(defaultProps));

      act(() => {
        result.current.handleLineDoubleClick(25);
      });

      act(() => {
        jest.advanceTimersByTime(DOUBLE_TAP_DELAY - 100);
        result.current.handleLineDoubleClick(30);
      });

      // Second tap on different line - should not open modal
      expect(result.current.showBookmarkModal).toBe(false);
    });

    it('should prevent triple tap', () => {
      const { result } = renderHook(() => useBookmarkUI(defaultProps));

      // First two taps open modal
      act(() => {
        result.current.handleLineDoubleClick(25);
        jest.advanceTimersByTime(100);
        result.current.handleLineDoubleClick(25);
      });

      expect(result.current.showBookmarkModal).toBe(true);

      // Close modal
      act(() => {
        result.current.closeBookmarkModal();
      });

      // Third tap should not immediately reopen
      act(() => {
        jest.advanceTimersByTime(100);
        result.current.handleLineDoubleClick(25);
      });

      expect(result.current.showBookmarkModal).toBe(false);
    });

    it('should handle missing line content gracefully', () => {
      const { result } = renderHook(() => useBookmarkUI({
        ...defaultProps,
        lines: [] // Empty lines array
      }));

      act(() => {
        result.current.handleLineDoubleClick(1);
        jest.advanceTimersByTime(100);
        result.current.handleLineDoubleClick(1);
      });

      expect(result.current.bookmarkTitle).toBe('Line 1');
    });
  });

  describe('bookmark modal operations', () => {
    it('should save bookmark successfully', async () => {
      const { result } = renderHook(() => useBookmarkUI(defaultProps));

      // Open modal
      act(() => {
        result.current.handleLineDoubleClick(30);
        jest.advanceTimersByTime(100);
        result.current.handleLineDoubleClick(30);
      });

      // Update title and note
      act(() => {
        result.current.setBookmarkTitle('Custom Title');
        result.current.setBookmarkNote('Custom Note');
      });

      // Save bookmark
      await act(async () => {
        await result.current.handleSaveBookmark();
      });

      expect(defaultProps.onAddBookmark).toHaveBeenCalledWith(30, 'Custom Title', 'Custom Note');
      expect(result.current.showBookmarkModal).toBe(false);
    });

    it('should not close modal if save fails', async () => {
      const onAddBookmark = jest.fn().mockResolvedValue(false);
      const { result } = renderHook(() => useBookmarkUI({
        ...defaultProps,
        onAddBookmark
      }));

      // Open modal
      act(() => {
        result.current.handleLineDoubleClick(30);
        jest.advanceTimersByTime(100);
        result.current.handleLineDoubleClick(30);
      });

      // Try to save
      await act(async () => {
        await result.current.handleSaveBookmark();
      });

      expect(result.current.showBookmarkModal).toBe(true);
    });

    it('should set bookmark as current position', async () => {
      const { result } = renderHook(() => useBookmarkUI(defaultProps));

      // Open modal for line 30
      act(() => {
        result.current.handleLineDoubleClick(30);
        jest.advanceTimersByTime(100);
        result.current.handleLineDoubleClick(30);
      });

      await act(async () => {
        await result.current.handleSetBookmarkLineAsCurrentPosition();
      });

      expect(defaultProps.onSetAsCurrentPosition).toHaveBeenCalledWith(30);
      expect(defaultProps.onRefreshBookmarks).toHaveBeenCalled();
      expect(result.current.showBookmarkModal).toBe(false);
    });

    it('should not close modal if set current position fails', async () => {
      const onSetAsCurrentPosition = jest.fn().mockResolvedValue(false);
      const { result } = renderHook(() => useBookmarkUI({
        ...defaultProps,
        onSetAsCurrentPosition
      }));

      // Open modal
      act(() => {
        result.current.handleLineDoubleClick(30);
        jest.advanceTimersByTime(100);
        result.current.handleLineDoubleClick(30);
      });

      await act(async () => {
        await result.current.handleSetBookmarkLineAsCurrentPosition();
      });

      expect(result.current.showBookmarkModal).toBe(true);
      expect(defaultProps.onRefreshBookmarks).not.toHaveBeenCalled();
    });
  });

  describe('bookmark deletion', () => {
    it('should show confirmation dialog before deletion', async () => {
      const { result } = renderHook(() => useBookmarkUI(defaultProps));

      await act(async () => {
        await result.current.handleDeleteBookmark('bookmark-1');
      });

      expect(mockConfirm).toHaveBeenCalledWith({
        title: 'Delete Bookmark',
        message: 'Are you sure you want to delete the bookmark "Chapter 1"?',
        confirmText: 'Delete',
        cancelText: 'Cancel'
      });
    });

    it('should delete bookmark on confirmation', async () => {
      mockConfirm.mockResolvedValueOnce(true);
      const { result } = renderHook(() => useBookmarkUI(defaultProps));

      await act(async () => {
        await result.current.handleDeleteBookmark('bookmark-1');
      });

      expect(defaultProps.onDeleteBookmark).toHaveBeenCalledWith('bookmark-1');
      expect(mockShowToast).toHaveBeenCalledWith(
        'success',
        'Bookmark deleted',
        'Bookmark has been successfully deleted'
      );
    });

    it('should show error toast if deletion fails', async () => {
      mockConfirm.mockResolvedValueOnce(true);
      const error = new Error('Delete failed');
      const onDeleteBookmark = jest.fn().mockRejectedValue(error);
      const { result } = renderHook(() => useBookmarkUI({
        ...defaultProps,
        onDeleteBookmark
      }));

      await act(async () => {
        await result.current.handleDeleteBookmark('bookmark-1');
      });

      expect(mockShowToast).toHaveBeenCalledWith(
        'error',
        'Failed to delete bookmark',
        'Delete failed'
      );
    });

    it('should not delete bookmark when user cancels', async () => {
      mockConfirm.mockResolvedValueOnce(false);
      const { result } = renderHook(() => useBookmarkUI(defaultProps));

      await act(async () => {
        await result.current.handleDeleteBookmark('bookmark-1');
      });

      expect(defaultProps.onDeleteBookmark).not.toHaveBeenCalled();
      expect(mockShowToast).not.toHaveBeenCalled();
    });
  });

  describe('bookmark overlay operations', () => {
    it('should add bookmark from overlay', async () => {
      const { result } = renderHook(() => useBookmarkUI(defaultProps));

      const newBookmark = {
        guideId: 'guide-1',
        line: 75,
        title: 'New Bookmark',
        note: 'From overlay'
      };

      await act(async () => {
        const created = await result.current.handleAddBookmarkFromOverlay(newBookmark);
        
        expect(created).toEqual({
          ...newBookmark,
          id: 'generated-id',
          dateCreated: expect.any(Date)
        });
      });

      expect(defaultProps.onAddBookmark).toHaveBeenCalledWith(75, 'New Bookmark', 'From overlay');
      expect(mockShowToast).toHaveBeenCalledWith(
        'success',
        'Bookmark Added',
        'Bookmark added successfully'
      );
    });

    it('should show error toast if add from overlay fails', async () => {
      const onAddBookmark = jest.fn().mockResolvedValue(false);
      const { result } = renderHook(() => useBookmarkUI({
        ...defaultProps,
        onAddBookmark
      }));

      const newBookmark = {
        guideId: 'guide-1',
        line: 75,
        title: 'New Bookmark',
        note: 'From overlay'
      };

      await expect(
        act(async () => {
          await result.current.handleAddBookmarkFromOverlay(newBookmark);
        })
      ).rejects.toThrow('Failed to add bookmark');

      expect(mockShowToast).toHaveBeenCalledWith(
        'error',
        'Error',
        'Failed to save bookmark: Failed to add bookmark'
      );
    });

    it('should update bookmark', async () => {
      const { result } = renderHook(() => useBookmarkUI(defaultProps));

      const updates = { title: 'Updated Title', note: 'Updated Note' };

      await act(async () => {
        await result.current.handleUpdateBookmark('bookmark-1', updates);
      });

      expect(defaultProps.onUpdateBookmark).toHaveBeenCalledWith('bookmark-1', updates);
      expect(mockShowToast).toHaveBeenCalledWith(
        'success',
        'Bookmark Updated',
        'Bookmark updated successfully'
      );
    });

    it('should show error toast if update fails', async () => {
      const error = new Error('Update failed');
      const onUpdateBookmark = jest.fn().mockRejectedValue(error);
      const { result } = renderHook(() => useBookmarkUI({
        ...defaultProps,
        onUpdateBookmark
      }));

      await expect(
        act(async () => {
          await result.current.handleUpdateBookmark('bookmark-1', { title: 'New' });
        })
      ).rejects.toThrow(error);

      expect(mockShowToast).toHaveBeenCalledWith(
        'error',
        'Error',
        'Failed to update bookmark: Update failed'
      );
    });

    it('should open bookmarks overlay with refresh', async () => {
      const { result } = renderHook(() => useBookmarkUI(defaultProps));

      await act(async () => {
        await result.current.openBookmarksOverlay();
      });

      expect(defaultProps.onRefreshBookmarks).toHaveBeenCalled();
      expect(result.current.showBookmarksOverlay).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle vibrate API not being available', () => {
      // Remove vibrate API
      delete (navigator as Navigator & { vibrate?: (pattern: number | number[]) => boolean }).vibrate;

      const { result } = renderHook(() => useBookmarkUI(defaultProps));

      // Should not throw when trying to vibrate
      expect(() => {
        act(() => {
          result.current.handleLineDoubleClick(25);
          jest.advanceTimersByTime(100);
          result.current.handleLineDoubleClick(25);
        });
      }).not.toThrow();

      expect(result.current.showBookmarkModal).toBe(true);
    });

    it('should update bookmarked lines map when bookmarks change', () => {
      const { result, rerender } = renderHook(
        (props) => useBookmarkUI(props),
        { initialProps: defaultProps }
      );

      expect(result.current.bookmarkedLines.size).toBe(2);

      const newBookmarks = [
        ...mockBookmarks,
        {
          id: 'bookmark-3',
          guideId: 'guide-1',
          line: 75,
          title: 'New Bookmark',
          dateCreated: new Date(),
          isCurrentPosition: false
        }
      ];

      rerender({ ...defaultProps, bookmarks: newBookmarks });

      expect(result.current.bookmarkedLines.size).toBe(3);
      expect(result.current.bookmarkedLines.has(75)).toBe(true);
    });
  });
});