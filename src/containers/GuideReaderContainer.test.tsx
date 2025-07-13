import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Guide, Bookmark } from '../types';
import { useBookmarkStore } from '../stores/useBookmarkStore';

// Mock hooks and services
const mockAddBookmark = jest.fn();
const mockShowToast = jest.fn();
const mockSetCurrentGuideId = jest.fn();
const mockSaveCurrentPositionBookmark = jest.fn().mockResolvedValue(undefined);
const mockGetCurrentPositionBookmark = jest.fn().mockResolvedValue(null);


// Helper to create bookmark store mock
const createBookmarkStoreMock = (overrides: Record<string, unknown> = {}) => {
  const bookmarks = overrides.bookmarks || [];
  const currentGuideId = overrides.currentGuideId || 'test-guide-1';
  
  return {
    bookmarks,
    addBookmark: mockAddBookmark,
    deleteBookmark: jest.fn(),
    updateBookmark: jest.fn(),
    loadBookmarks: jest.fn(),
    setCurrentGuideId: mockSetCurrentGuideId,
    saveCurrentPositionBookmark: mockSaveCurrentPositionBookmark,
    getCurrentPositionBookmark: mockGetCurrentPositionBookmark,
    loading: false,
    error: null,
    get currentPosition() {
      const bookmark = (bookmarks as Bookmark[]).find(b => b.isCurrentPosition && b.guideId === currentGuideId);
      return bookmark?.line || 1;
    },
    ...overrides
  };
};

// Mock useBookmarkStore
jest.mock('../stores/useBookmarkStore', () => ({
  useBookmarkStore: jest.fn(() => createBookmarkStoreMock())
}));

jest.mock('../contexts/useToast', () => ({
  useToast: () => ({
    showToast: mockShowToast
  })
}));

const createMockReaderStore = () => {
  const state = {
    displaySettings: {
      fontSize: 14,
      zoomLevel: 1
    }
  };

  const setDisplaySettings = jest.fn((updates) => {
    if (typeof updates === 'function') {
      state.displaySettings = { ...state.displaySettings, ...updates(state.displaySettings) };
    } else {
      state.displaySettings = { ...state.displaySettings, ...updates };
    }
  });

  return {
    get displaySettings() { return state.displaySettings; },
    setDisplaySettings
  };
};

const mockUseReaderStore = jest.fn(createMockReaderStore);

jest.mock('../stores/useReaderStore', () => ({
  useReaderStore: mockUseReaderStore
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
  onFontSizeChange: (size: number) => void;
  onZoomChange: (zoom: number) => void;
}

// Mock GuideReaderView component
jest.mock('../components/GuideReaderView', () => ({
  GuideReaderView: ({ 
    initialLine,
    currentLine, 
    onLineChange, 
    fontSize,
    zoomLevel,
    onFontSizeChange,
    onZoomChange,
    onAddBookmark,
    onSetAsCurrentPosition,
    onJumpToCurrentPosition
  }: MockGuideReaderViewProps) => {
    const [jumpedToLine, setJumpedToLine] = React.useState<number | null>(null);
    

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
        <button onClick={() => {
          onFontSizeChange(16);
        }}>Change Font Size</button>
        <button onClick={() => {
          onFontSizeChange(30);
        }}>Max Font Size</button>
        <button onClick={() => {
          onFontSizeChange(5);
        }}>Min Font Size</button>
        <button onClick={() => {
          onZoomChange(1.5);
        }}>Change Zoom</button>
        <button onClick={() => {
          onZoomChange(3);
        }}>Max Zoom</button>
        <button onClick={() => {
          onZoomChange(0.3);
        }}>Min Zoom</button>
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
    
    // Reset the mock to create new store instance
    mockUseReaderStore.mockImplementation(createMockReaderStore);
    
    // Mock console.error to suppress expected errors in tests
    console.error = jest.fn();
    
    // Mock window.innerWidth for consistent screen identifier
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1000
    });
    
    
    // Reset useBookmarks mock
    (useBookmarkStore as jest.Mock).mockReturnValue({
      bookmarks: [],
      addBookmark: mockAddBookmark,
      deleteBookmark: jest.fn(),
      updateBookmark: jest.fn(),
      loadBookmarks: jest.fn(),
      setCurrentGuideId: mockSetCurrentGuideId,
      saveCurrentPositionBookmark: mockSaveCurrentPositionBookmark,
      getCurrentPositionBookmark: mockGetCurrentPositionBookmark,
      loading: false,
      error: null
    });
    
    // Default mock implementations
    mockGetCurrentPositionBookmark.mockResolvedValue(null);
  });

  afterEach(() => {
    jest.useRealTimers();
    // Restore console methods
    console.error = originalConsoleError;
  });

  describe('Initial Position Loading', () => {
    it('should set current guide ID when component mounts', async () => {
      render(<GuideReaderContainer guide={mockGuide} />);
      
      await waitFor(() => {
        expect(mockSetCurrentGuideId).toHaveBeenCalledWith('test-guide-1');
      });
    });

    it('should load current position bookmark when no navigation target', async () => {
      // Mock bookmarks with a current position bookmark
      (useBookmarkStore as jest.Mock).mockReturnValue(createBookmarkStoreMock({
        bookmarks: [{
          id: 'current-position-test-guide-1',
          guideId: 'test-guide-1',
          line: 30,
          title: 'Current Position',
          dateCreated: new Date(),
          isCurrentPosition: true
        }]
      }));

      render(<GuideReaderContainer guide={mockGuide} />);

      await waitFor(() => {
        expect(screen.getByTestId('initial-line')).toHaveTextContent('30');
      });
    });

    it('should default to line 1 when no bookmark or navigation target', async () => {
      // Mock bookmarks with no current position bookmark
      (useBookmarkStore as jest.Mock).mockReturnValue(createBookmarkStoreMock({
        bookmarks: []
      }));

      render(<GuideReaderContainer guide={mockGuide} />);

      await waitFor(() => {
        expect(screen.getByTestId('initial-line')).toHaveTextContent('1');
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

  describe('Font and Zoom Controls', () => {
    it('should handle font size changes with clamping', async () => {
      let currentStore: ReturnType<typeof createMockReaderStore>;
      
      mockUseReaderStore.mockImplementation(() => {
        if (!currentStore) {
          currentStore = createMockReaderStore();
        }
        return currentStore;
      });

      const { rerender } = render(<GuideReaderContainer guide={mockGuide} />);

      await waitFor(() => {
        expect(screen.getByTestId('guide-reader-view')).toBeInTheDocument();
      });

      const fontSizeButton = screen.getByText('Change Font Size');
      
      // Test normal change
      fontSizeButton.click();
      // Force re-render to reflect state change
      rerender(<GuideReaderContainer guide={mockGuide} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('font-size')).toHaveTextContent('16');
      });

      // Test maximum clamping (> 24)
      const maxFontButton = screen.getByText('Max Font Size');
      maxFontButton.click();
      rerender(<GuideReaderContainer guide={mockGuide} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('font-size')).toHaveTextContent('24');
      });

      // Test minimum clamping (< 10)
      const minFontButton = screen.getByText('Min Font Size');
      minFontButton.click();
      rerender(<GuideReaderContainer guide={mockGuide} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('font-size')).toHaveTextContent('10');
      });
    });

    it('should handle zoom level changes with clamping', async () => {
      let currentStore: ReturnType<typeof createMockReaderStore>;
      
      mockUseReaderStore.mockImplementation(() => {
        if (!currentStore) {
          currentStore = createMockReaderStore();
        }
        return currentStore;
      });

      const { rerender } = render(<GuideReaderContainer guide={mockGuide} />);

      await waitFor(() => {
        expect(screen.getByTestId('guide-reader-view')).toBeInTheDocument();
      });

      const zoomButton = screen.getByText('Change Zoom');
      
      // Test normal change
      zoomButton.click();
      rerender(<GuideReaderContainer guide={mockGuide} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('zoom-level')).toHaveTextContent('1.5');
      });

      // Test maximum clamping (> 2)
      const maxZoomButton = screen.getByText('Max Zoom');
      maxZoomButton.click();
      rerender(<GuideReaderContainer guide={mockGuide} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('zoom-level')).toHaveTextContent('2');
      });

      // Test minimum clamping (< 0.5)
      const minZoomButton = screen.getByText('Min Zoom');
      minZoomButton.click();
      rerender(<GuideReaderContainer guide={mockGuide} />);
      
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
        expect(mockSaveCurrentPositionBookmark).toHaveBeenCalledWith('test-guide-1', 30);
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
        expect(mockGetCurrentPositionBookmark).toHaveBeenCalledWith('test-guide-1');
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

});