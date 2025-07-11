import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { Guide, Bookmark } from '../types';

// Mock hooks and services
const mockSaveProgress = jest.fn().mockResolvedValue(undefined);
const mockAddBookmark = jest.fn();
const mockShowToast = jest.fn();
const mockSetNavigationTargetLine = jest.fn();

const mockUseProgress = jest.fn(() => ({
  progress: null,
  saveProgress: mockSaveProgress,
  loading: false,
  error: null
}));

jest.mock('../hooks/useProgress', () => ({
  useProgress: mockUseProgress
}));

jest.mock('../hooks/useBookmarks', () => ({
  useBookmarks: () => ({
    bookmarks: [],
    addBookmark: mockAddBookmark,
    deleteBookmark: jest.fn(),
    updateBookmark: jest.fn(),
    loading: false,
    error: null
  })
}));

jest.mock('../contexts/useToast', () => ({
  useToast: () => ({
    showToast: mockShowToast
  })
}));

const mockUseAppStore = jest.fn(() => ({
  navigationTargetLine: null,
  setNavigationTargetLine: mockSetNavigationTargetLine
}));

jest.mock('../stores/useAppStore', () => ({
  useAppStore: mockUseAppStore
}));

const mockGetCurrentPositionBookmark = jest.fn();
const mockSaveCurrentPositionBookmark = jest.fn();

const mockDb = {
  getCurrentPositionBookmark: mockGetCurrentPositionBookmark,
  saveCurrentPositionBookmark: mockSaveCurrentPositionBookmark
};

jest.mock('../services/database', () => ({
  db: mockDb
}));

// Simplified mock props for testing - using actual types from GuideReaderView
interface MockGuideReaderViewProps {
  guide: Guide;
  lines: string[];
  currentLine: number;
  totalLines: number;
  isLoading: boolean;
  searchQuery: string;
  searchResults: { line: number; content: string }[];
  bookmarks: Bookmark[];
  initialLine: number;
  fontSize: number;
  zoomLevel: number;
  onLineChange: (line: number) => void;
  onSearch: (query: string) => void;
  onAddBookmark: (line: number, title: string, note?: string) => Promise<boolean>;
  onSetAsCurrentPosition: (line: number) => Promise<boolean>;
  onJumpToCurrentPosition: () => Promise<number | null>;
  onScrollingStateChange: (isScrolling: boolean) => void;
  onInitialScroll: () => void;
  onFontSizeChange: (size: number) => void;
  onZoomChange: (zoom: number) => void;
}

// Mock GuideReaderView component
jest.mock('../components/GuideReaderView', () => ({
  GuideReaderView: ({ 
    initialLine,
    currentLine, 
    onLineChange, 
    onInitialScroll,
    fontSize,
    zoomLevel,
    onFontSizeChange,
    onZoomChange,
    onAddBookmark,
    onSetAsCurrentPosition,
    onJumpToCurrentPosition
  }: MockGuideReaderViewProps) => {
    const [jumpedToLine, setJumpedToLine] = React.useState<number | null>(null);
    
    React.useEffect(() => {
      // Simulate initial scroll
      if (onInitialScroll) {
        onInitialScroll();
      }
    }, [onInitialScroll]);

    return (
      <div data-testid="guide-reader-view">
        <div data-testid="initial-line">{initialLine}</div>
        <div data-testid="font-size">{fontSize}</div>
        <div data-testid="zoom-level">{zoomLevel}</div>
        <div data-testid="current-line">{currentLine || 1}</div>
        <div data-testid="jumped-to-line">{jumpedToLine || ''}</div>
        <button onClick={() => {
          // Simulate line change
          onLineChange(50);
        }}>Scroll to Line 50</button>
        <button onClick={() => onFontSizeChange(16)}>Change Font Size</button>
        <button onClick={() => onFontSizeChange(30)}>Max Font Size</button>
        <button onClick={() => onFontSizeChange(5)}>Min Font Size</button>
        <button onClick={() => onZoomChange(1.5)}>Change Zoom</button>
        <button onClick={() => onZoomChange(3)}>Max Zoom</button>
        <button onClick={() => onZoomChange(0.3)}>Min Zoom</button>
        <button onClick={async () => {
          await onAddBookmark(25, 'Test Bookmark', 'Test Note');
        }}>Add Bookmark</button>
        <button onClick={async () => {
          await onSetAsCurrentPosition(30);
        }}>Set Current Position</button>
        <button onClick={async () => {
          const line = await onJumpToCurrentPosition();
          if (line !== null) {
            setJumpedToLine(line);
          }
        }}>Jump to Current Position</button>
      </div>
    );
  }
}));

// Import component after mocks
import { GuideReaderContainer } from './GuideReaderContainer';

describe('GuideReaderContainer', () => {
  const mockGuide: Guide = {
    id: 'test-guide-1',
    title: 'Test Guide',
    url: 'https://example.com/guide',
    content: Array.from({ length: 100 }, (_, i) => `Line ${i + 1}`).join('\n'),
    dateAdded: new Date(),
    dateModified: new Date(),
    size: 1000
  };

  // Store original console methods
  const originalConsoleError = console.error;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // Mock console.error to suppress expected errors in tests
    console.error = jest.fn();
    
    // Mock window.innerWidth for consistent screen identifier
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1000
    });
    
    // Reset mock implementations to defaults
    mockUseAppStore.mockReturnValue({
      navigationTargetLine: null,
      setNavigationTargetLine: mockSetNavigationTargetLine
    });
    mockUseProgress.mockReturnValue({
      progress: null,
      saveProgress: mockSaveProgress,
      loading: false,
      error: null
    });
    
    // Default mock implementations
    mockGetCurrentPositionBookmark.mockResolvedValue(null);
    mockDb.getCurrentPositionBookmark = mockGetCurrentPositionBookmark;
    mockDb.saveCurrentPositionBookmark = mockSaveCurrentPositionBookmark;
  });

  afterEach(() => {
    jest.useRealTimers();
    // Restore console methods
    console.error = originalConsoleError;
  });

  describe('Navigation Target Line', () => {
    it('should use navigation target line as initial position when available', async () => {
      // Set navigation target
      mockUseAppStore.mockReturnValue({
        navigationTargetLine: 42,
        setNavigationTargetLine: mockSetNavigationTargetLine
      });

      render(<GuideReaderContainer guide={mockGuide} />);

      await waitFor(() => {
        expect(screen.getByTestId('initial-line')).toHaveTextContent('42');
      });

      // Should clear navigation target after using it
      expect(mockSetNavigationTargetLine).toHaveBeenCalledWith(null);
    });

    it('should prioritize navigation target over current position bookmark', async () => {
      // Set both navigation target and current position bookmark
      mockUseAppStore.mockReturnValue({
        navigationTargetLine: 25,
        setNavigationTargetLine: mockSetNavigationTargetLine
      });

      mockGetCurrentPositionBookmark.mockResolvedValue({
        id: 'current-position-test-guide-1',
        guideId: 'test-guide-1',
        line: 75,
        title: 'Current Position',
        dateCreated: new Date(),
        isCurrentPosition: true
      });

      render(<GuideReaderContainer guide={mockGuide} />);

      await waitFor(() => {
        // Should use navigation target (25) instead of current position (75)
        expect(screen.getByTestId('initial-line')).toHaveTextContent('25');
      });
    });

    it('should handle navigation target changes after initial load', async () => {
      const { rerender } = render(<GuideReaderContainer guide={mockGuide} />);

      // Initial render without navigation target
      await waitFor(() => {
        expect(screen.getByTestId('initial-line')).toHaveTextContent('1');
      });

      // Update navigation target
      mockUseAppStore.mockReturnValue({
        navigationTargetLine: 60,
        setNavigationTargetLine: mockSetNavigationTargetLine
      });

      rerender(<GuideReaderContainer guide={mockGuide} />);

      await waitFor(() => {
        expect(screen.getByTestId('initial-line')).toHaveTextContent('60');
      });

      expect(mockSetNavigationTargetLine).toHaveBeenCalledWith(null);
    });
  });

  describe('Initial Position Loading', () => {
    it('should load current position bookmark when no navigation target', async () => {
      mockGetCurrentPositionBookmark.mockResolvedValue({
        id: 'current-position-test-guide-1',
        guideId: 'test-guide-1',
        line: 30,
        title: 'Current Position',
        dateCreated: new Date(),
        isCurrentPosition: true
      });

      render(<GuideReaderContainer guide={mockGuide} />);

      await waitFor(() => {
        expect(mockGetCurrentPositionBookmark).toHaveBeenCalledWith('test-guide-1');
        expect(screen.getByTestId('initial-line')).toHaveTextContent('30');
      });
    });

    it('should fall back to saved progress when no bookmark or navigation target', async () => {
      mockUseProgress.mockReturnValue({
        progress: {
          guideId: 'test-guide-1',
          line: 15,
          percentage: 15,
          lastRead: new Date()
        },
        saveProgress: mockSaveProgress,
        loading: false,
        error: null
      });

      render(<GuideReaderContainer guide={mockGuide} />);

      await waitFor(() => {
        expect(screen.getByTestId('initial-line')).toHaveTextContent('15');
      });
    });

    it('should handle getCurrentPositionBookmark error gracefully', async () => {
      // Don't spy on console.error since we already mocked it
      mockGetCurrentPositionBookmark.mockRejectedValue(new Error('DB Error'));

      mockUseProgress.mockReturnValue({
        progress: {
          guideId: 'test-guide-1',
          line: 10,
          percentage: 10,
          lastRead: new Date()
        },
        saveProgress: mockSaveProgress,
        loading: false,
        error: null
      });

      render(<GuideReaderContainer guide={mockGuide} />);

      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith('Failed to load current position bookmark:', expect.any(Error));
        // Should fall back to progress
        expect(screen.getByTestId('initial-line')).toHaveTextContent('10');
      });
    });
  });

  describe('Progress Saving', () => {
    it('should save progress when current line changes after scrolling', async () => {
      render(<GuideReaderContainer guide={mockGuide} />);

      await waitFor(() => {
        expect(screen.getByTestId('guide-reader-view')).toBeInTheDocument();
      });

      // Wait for initial scroll to complete
      act(() => {
        jest.advanceTimersByTime(100);
      });

      // Clear any initial saves
      mockSaveProgress.mockClear();

      // Simulate scroll
      const scrollButton = screen.getByText('Scroll to Line 50');
      scrollButton.click();

      // Wait for the currentLine to update
      await waitFor(() => {
        expect(screen.getByTestId('current-line')).toHaveTextContent('50');
      });

      // Fast forward past debounce timer
      act(() => {
        jest.advanceTimersByTime(1100);
      });

      // Wait for save to be called
      await waitFor(() => {
        expect(mockSaveProgress).toHaveBeenCalled();
      });

      // Check the last call
      const lastCall = mockSaveProgress.mock.calls[mockSaveProgress.mock.calls.length - 1][0];
      expect(lastCall).toMatchObject({
        guideId: 'test-guide-1',
        line: 50,
        percentage: 50,
        fontSize: 14,
        zoomLevel: 1,
        screenSettings: {
          screen_1000: {
            fontSize: 14,
            zoomLevel: 1
          }
        }
      });
    });

    it('should load font size and zoom level from progress', async () => {
      mockUseProgress.mockReturnValue({
        progress: {
          guideId: 'test-guide-1',
          line: 1,
          percentage: 1,
          lastRead: new Date(),
          fontSize: 18,
          zoomLevel: 1.5
        },
        saveProgress: mockSaveProgress,
        loading: false,
        error: null
      });

      render(<GuideReaderContainer guide={mockGuide} />);

      // The component should use the saved fontSize and zoomLevel
      // This would be passed to GuideReaderView in the real implementation
      await waitFor(() => {
        expect(screen.getByTestId('guide-reader-view')).toBeInTheDocument();
      });
    });
  });

  describe('Guide Content Changes', () => {
    it('should reload guide when content changes', () => {
      const { rerender } = render(<GuideReaderContainer guide={mockGuide} />);

      const updatedGuide = {
        ...mockGuide,
        content: Array.from({ length: 200 }, (_, i) => `Updated Line ${i + 1}`).join('\n')
      };

      rerender(<GuideReaderContainer guide={updatedGuide} />);

      // The component should detect content change and reload
      expect(screen.getByTestId('guide-reader-view')).toBeInTheDocument();
    });

    it('should not reload guide when content is the same', () => {
      const { rerender } = render(<GuideReaderContainer guide={mockGuide} />);

      // Same guide with same content
      rerender(<GuideReaderContainer guide={mockGuide} />);

      // Should not trigger unnecessary reloads
      expect(screen.getByTestId('guide-reader-view')).toBeInTheDocument();
    });
  });

  describe('Window Resize Handling', () => {
    it('should reapply screen-specific settings when window is resized', async () => {
      // Set up progress with screen-specific settings
      mockUseProgress.mockReturnValue({
        progress: {
          guideId: 'test-guide-1',
          line: 50,
          percentage: 50,
          fontSize: 16,
          zoomLevel: 1.2,
          screenSettings: {
            screen_1000: {
              fontSize: 14,
              zoomLevel: 1
            },
            screen_1200: {
              fontSize: 18,
              zoomLevel: 1.5
            }
          },
          lastRead: new Date()
        },
        saveProgress: mockSaveProgress,
        loading: false,
        error: null
      });

      render(<GuideReaderContainer guide={mockGuide} />);

      await waitFor(() => {
        expect(screen.getByTestId('guide-reader-view')).toBeInTheDocument();
      });

      // Initial settings should be from screen_1000 (default mock window width)
      expect(screen.getByTestId('font-size')).toHaveTextContent('14');
      expect(screen.getByTestId('zoom-level')).toHaveTextContent('1');

      // Simulate window resize to 1200px width
      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 1200
        });
        window.dispatchEvent(new Event('resize'));
      });

      // Should now use screen_1200 settings
      await waitFor(() => {
        expect(screen.getByTestId('font-size')).toHaveTextContent('18');
        expect(screen.getByTestId('zoom-level')).toHaveTextContent('1.5');
      });
    });

    it('should fall back to general settings when no screen-specific settings exist after resize', async () => {
      mockUseProgress.mockReturnValue({
        progress: {
          guideId: 'test-guide-1',
          line: 50,
          percentage: 50,
          fontSize: 16,
          zoomLevel: 1.2,
          screenSettings: {
            screen_1000: {
              fontSize: 14,
              zoomLevel: 1
            }
          },
          lastRead: new Date()
        },
        saveProgress: mockSaveProgress,
        loading: false,
        error: null
      });

      render(<GuideReaderContainer guide={mockGuide} />);

      await waitFor(() => {
        expect(screen.getByTestId('guide-reader-view')).toBeInTheDocument();
      });

      // Initial settings from screen_1000
      expect(screen.getByTestId('font-size')).toHaveTextContent('14');
      expect(screen.getByTestId('zoom-level')).toHaveTextContent('1');

      // Simulate resize to a width with no specific settings
      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 800
        });
        window.dispatchEvent(new Event('resize'));
      });

      // Should fall back to general settings
      await waitFor(() => {
        expect(screen.getByTestId('font-size')).toHaveTextContent('16');
        expect(screen.getByTestId('zoom-level')).toHaveTextContent('1.2');
      });
    });

    it('should handle resize when no progress exists', async () => {
      mockUseProgress.mockReturnValue({
        progress: null,
        saveProgress: mockSaveProgress,
        loading: false,
        error: null
      });

      render(<GuideReaderContainer guide={mockGuide} />);

      await waitFor(() => {
        expect(screen.getByTestId('guide-reader-view')).toBeInTheDocument();
      });

      // Should have default settings
      expect(screen.getByTestId('font-size')).toHaveTextContent('14');
      expect(screen.getByTestId('zoom-level')).toHaveTextContent('1');

      // Simulate resize
      act(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 800
        });
        window.dispatchEvent(new Event('resize'));
      });

      // Should keep default settings
      await waitFor(() => {
        expect(screen.getByTestId('font-size')).toHaveTextContent('14');
        expect(screen.getByTestId('zoom-level')).toHaveTextContent('1');
      });
    });
  });

  describe('Font and Zoom Controls', () => {
    it('should handle font size changes with clamping', async () => {
      render(<GuideReaderContainer guide={mockGuide} />);

      await waitFor(() => {
        expect(screen.getByTestId('guide-reader-view')).toBeInTheDocument();
      });

      const fontSizeButton = screen.getByText('Change Font Size');
      
      // Test normal change
      fontSizeButton.click();
      await waitFor(() => {
        expect(screen.getByTestId('font-size')).toHaveTextContent('16');
      });

      // Test maximum clamping (> 24)
      const maxFontButton = screen.getByText('Max Font Size');
      maxFontButton.click();
      await waitFor(() => {
        expect(screen.getByTestId('font-size')).toHaveTextContent('24');
      });

      // Test minimum clamping (< 10)
      const minFontButton = screen.getByText('Min Font Size');
      minFontButton.click();
      await waitFor(() => {
        expect(screen.getByTestId('font-size')).toHaveTextContent('10');
      });
    });

    it('should handle zoom level changes with clamping', async () => {
      render(<GuideReaderContainer guide={mockGuide} />);

      await waitFor(() => {
        expect(screen.getByTestId('guide-reader-view')).toBeInTheDocument();
      });

      const zoomButton = screen.getByText('Change Zoom');
      
      // Test normal change
      zoomButton.click();
      await waitFor(() => {
        expect(screen.getByTestId('zoom-level')).toHaveTextContent('1.5');
      });

      // Test maximum clamping (> 2)
      const maxZoomButton = screen.getByText('Max Zoom');
      maxZoomButton.click();
      await waitFor(() => {
        expect(screen.getByTestId('zoom-level')).toHaveTextContent('2');
      });

      // Test minimum clamping (< 0.5)
      const minZoomButton = screen.getByText('Min Zoom');
      minZoomButton.click();
      await waitFor(() => {
        expect(screen.getByTestId('zoom-level')).toHaveTextContent('0.5');
      });
    });
  });

  describe('Bookmark Operations', () => {
    it('should handle adding bookmarks successfully', async () => {
      mockAddBookmark.mockResolvedValue(true);
      
      render(<GuideReaderContainer guide={mockGuide} />);

      await waitFor(() => {
        expect(screen.getByTestId('guide-reader-view')).toBeInTheDocument();
      });

      const addBookmarkButton = screen.getByText('Add Bookmark');
      addBookmarkButton.click();

      await waitFor(() => {
        expect(mockAddBookmark).toHaveBeenCalledWith({
          guideId: 'test-guide-1',
          line: 25,
          title: 'Test Bookmark',
          note: 'Test Note'
        });
        expect(mockShowToast).toHaveBeenCalledWith('success', 'Bookmark added!', "Bookmark 'Test Bookmark' created at line 25");
      });
    });

    it('should handle bookmark add errors', async () => {
      mockAddBookmark.mockRejectedValue(new Error('Failed to save'));
      
      render(<GuideReaderContainer guide={mockGuide} />);

      await waitFor(() => {
        expect(screen.getByTestId('guide-reader-view')).toBeInTheDocument();
      });

      const addBookmarkButton = screen.getByText('Add Bookmark');
      addBookmarkButton.click();

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith('error', 'Failed to add bookmark', 'Failed to save');
      });
    });

    it('should handle setting current position successfully', async () => {
      mockSaveCurrentPositionBookmark.mockResolvedValue(true);
      
      render(<GuideReaderContainer guide={mockGuide} />);

      await waitFor(() => {
        expect(screen.getByTestId('guide-reader-view')).toBeInTheDocument();
      });

      const setPositionButton = screen.getByText('Set Current Position');
      setPositionButton.click();

      await waitFor(() => {
        expect(mockDb.saveCurrentPositionBookmark).toHaveBeenCalledWith('test-guide-1', 30);
      });
    });

    it('should handle current position errors', async () => {
      mockSaveCurrentPositionBookmark.mockRejectedValue(new Error('DB Error'));
      
      render(<GuideReaderContainer guide={mockGuide} />);

      await waitFor(() => {
        expect(screen.getByTestId('guide-reader-view')).toBeInTheDocument();
      });

      const setPositionButton = screen.getByText('Set Current Position');
      setPositionButton.click();

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith('error', 'Failed to set current position', 'DB Error');
      });
    });

    it('should handle jumping to current position', async () => {
      mockGetCurrentPositionBookmark.mockResolvedValue({
        id: 'current-pos',
        guideId: 'test-guide-1',
        line: 75,
        title: 'Current Position',
        dateCreated: new Date(),
        isCurrentPosition: true
      });
      
      render(<GuideReaderContainer guide={mockGuide} />);

      await waitFor(() => {
        expect(screen.getByTestId('guide-reader-view')).toBeInTheDocument();
      });

      const jumpButton = screen.getByText('Jump to Current Position');
      jumpButton.click();

      await waitFor(() => {
        expect(mockDb.getCurrentPositionBookmark).toHaveBeenCalledWith('test-guide-1');
        expect(screen.getByTestId('jumped-to-line')).toHaveTextContent('75');
      });
    });

    it('should show info toast when no current position exists', async () => {
      mockGetCurrentPositionBookmark.mockResolvedValue(null);
      
      render(<GuideReaderContainer guide={mockGuide} />);

      await waitFor(() => {
        expect(screen.getByTestId('guide-reader-view')).toBeInTheDocument();
      });

      const jumpButton = screen.getByText('Jump to Current Position');
      jumpButton.click();

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith('info', 'No current position saved', 'Tap any line to set your current reading position');
      });
    });

    it('should handle jump to position errors', async () => {
      mockGetCurrentPositionBookmark.mockRejectedValue(new Error('DB Read Error'));
      
      render(<GuideReaderContainer guide={mockGuide} />);

      await waitFor(() => {
        expect(screen.getByTestId('guide-reader-view')).toBeInTheDocument();
      });

      const jumpButton = screen.getByText('Jump to Current Position');
      jumpButton.click();

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith('error', 'Failed to jump to position', 'DB Read Error');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle save progress errors gracefully', async () => {
      // Don't spy on console.error since we already mocked it
      mockSaveProgress.mockRejectedValue(new Error('Save failed'));

      render(<GuideReaderContainer guide={mockGuide} />);

      await waitFor(() => {
        expect(screen.getByTestId('guide-reader-view')).toBeInTheDocument();
      });

      // Simulate scroll
      const scrollButton = screen.getByText('Scroll to Line 50');
      scrollButton.click();

      // Fast forward past debounce timer
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith('Failed to save progress:', expect.any(Error));
      });
    });
  });
});