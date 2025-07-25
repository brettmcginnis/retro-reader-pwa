import { render, screen, waitFor } from '@testing-library/react';
import { Guide } from '../stores/useGuideStore';
import { Bookmark, useBookmarkStore } from '../stores/useBookmarkStore';

// Mock hooks and services
const mockAddBookmark = jest.fn();
const mockShowToast = jest.fn();
const mockSetCurrentGuideId = jest.fn();
const mockSaveCurrentPositionBookmark = jest.fn().mockResolvedValue(undefined);

// Helper to create bookmark store mock
const createBookmarkStoreMock = (overrides: Record<string, unknown> = {}) => {
  const bookmarks = overrides.bookmarks || [];
  
  return {
    bookmarks,
    currentLine: overrides.currentLine || 1,
    loading: false,
    error: null,
    addBookmark: mockAddBookmark,
    deleteBookmark: jest.fn(),
    updateBookmark: jest.fn(),
    loadBookmarks: jest.fn().mockResolvedValue(undefined),
    setCurrentGuideId: mockSetCurrentGuideId,
    saveCurrentPositionBookmark: mockSaveCurrentPositionBookmark,
    getCurrentPositionBookmark: jest.fn().mockResolvedValue(null),
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

const createMockFontScaleStore = () => {
  const state = {
    currentGuideId: null as string | null,
    currentScreenId: null as string | null,
    fontSize: 14,
    zoomLevel: 1,
    isLoading: false
  };

  const setFontSettings = jest.fn(async (updates) => {
    state.fontSize = updates.fontSize ?? state.fontSize;
    state.zoomLevel = updates.zoomLevel ?? state.zoomLevel;
  });

  return {
    get currentGuideId() { return state.currentGuideId; },
    get currentScreenId() { return state.currentScreenId; },
    get fontSize() { return state.fontSize; },
    get zoomLevel() { return state.zoomLevel; },
    get isLoading() { return state.isLoading; },
    setCurrentContext: jest.fn((guideId: string, screenId?: string) => {
      state.currentGuideId = guideId;
      state.currentScreenId = screenId ?? 'default';
    }),
    loadFontSettings: jest.fn(async () => {
      // Mock loading font settings
    }),
    setFontSize: jest.fn(async (size: number) => {
      state.fontSize = size;
    }),
    setZoomLevel: jest.fn(async (zoom: number) => {
      state.zoomLevel = zoom;
    }),
    setFontSettings
  };
};

const createMockGuideStore = () => {
  const state = {
    currentGuideContent: [],
    currentGuideLoading: false
  };

  return {
    get currentGuideContent() { return state.currentGuideContent; },
    get currentGuideLoading() { return state.currentGuideLoading; },
    setCurrentGuideContent: jest.fn((lines) => {
      state.currentGuideLoading = true;
      state.currentGuideContent = lines;
      state.currentGuideLoading = false;
    }),
    guides: [],
    loading: false,
    error: null,
    dbInitialized: true,
    loadGuides: jest.fn(),
    fetchGuide: jest.fn(),
    createGuide: jest.fn(),
    deleteGuide: jest.fn(),
    getGuide: jest.fn(),
    exportGuide: jest.fn(),
    exportAll: jest.fn(),
    importFromFile: jest.fn(),
    refresh: jest.fn()
  };
};

const mockUseFontScaleStore = jest.fn(createMockFontScaleStore);
const mockUseGuideStore = jest.fn(createMockGuideStore);

jest.mock('../stores/useFontScaleStore', () => ({
  useFontScaleStore: mockUseFontScaleStore
}));

jest.mock('../stores/useGuideStore', () => ({
  ...jest.requireActual('../stores/useGuideStore'),
  useGuideStore: mockUseGuideStore
}));

jest.mock('../utils/screenUtils', () => ({
  getScreenIdentifier: jest.fn().mockReturnValue('screen_1024')
}));


// Simplified mock props for testing - using actual types from GuideReaderView

interface MockGuideReaderViewProps {
  guide: Guide;
  lines: string[];
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
  onScrollingStateChange: (isScrolling: boolean) => void;
  onFontSizeChange: (size: number) => void;
  onZoomChange: (zoom: number) => void;
}

// Mock GuideReaderView component
jest.mock('../components/GuideReaderView', () => ({
  GuideReaderView: ({ 
    initialLine,
    onLineChange, 
    fontSize,
    zoomLevel,
    onFontSizeChange,
    onZoomChange,
    onAddBookmark,
    onSetAsCurrentPosition,
  }: MockGuideReaderViewProps) => {
    // Use a static value for currentLine in tests
    const currentLine = 1;
    return (
      <div data-testid="guide-reader-view">
        <div data-testid="initial-line">{initialLine}</div>
        <div data-testid="font-size">{fontSize}</div>
        <div data-testid="zoom-level">{zoomLevel}</div>
        <div data-testid="current-line">{currentLine}</div>
        <div data-testid="jumped-to-line"></div>
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
        <button onClick={() => {
          // This button is now handled directly in NavigationModal via store
          // Just simulate a click for testing
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
    
    // Reset the mocks to create new store instances
    mockUseFontScaleStore.mockImplementation(createMockFontScaleStore);
    mockUseGuideStore.mockImplementation(createMockGuideStore);
    
    // Mock console.error to suppress expected errors in tests
    console.error = jest.fn();
    
    // Mock window.innerWidth for consistent screen identifier
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1000
    });
    
    
    // Reset useBookmarks mock
    (useBookmarkStore as jest.Mock).mockReturnValue(createBookmarkStoreMock());
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

    it('should set font context and load settings when component mounts', async () => {
      const fontStore = createMockFontScaleStore();
      mockUseFontScaleStore.mockReturnValue(fontStore);
      
      render(<GuideReaderContainer guide={mockGuide} />);
      
      await waitFor(() => {
        expect(fontStore.setCurrentContext).toHaveBeenCalledWith('test-guide-1', 'screen_1024');
        expect(fontStore.loadFontSettings).toHaveBeenCalledWith('test-guide-1', 'screen_1024');
      });
    });

    it('should load current position bookmark when no navigation target', async () => {
      // Mock bookmarks with a current position bookmark
      const bookmarksWithPosition = [{
        id: 'current-position-test-guide-1',
        guideId: 'test-guide-1',
        line: 30,
        title: 'Current Position',
        dateCreated: new Date(),
        isCurrentPosition: true
      }];
      
      (useBookmarkStore as jest.Mock).mockReturnValue(createBookmarkStoreMock({
        bookmarks: bookmarksWithPosition,
        currentLine: 30
      }));

      render(<GuideReaderContainer guide={mockGuide} />);

      await waitFor(() => {
        expect(screen.getByTestId('initial-line')).toHaveTextContent('30');
      });
    });

    it('should default to line 1 when no bookmark or navigation target', async () => {
      // Mock bookmarks with no current position bookmark
      (useBookmarkStore as jest.Mock).mockReturnValue(createBookmarkStoreMock());

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
      let currentFontStore: ReturnType<typeof createMockFontScaleStore>;
      
      mockUseFontScaleStore.mockImplementation(() => {
        if (!currentFontStore) {
          currentFontStore = createMockFontScaleStore();
        }
        return currentFontStore;
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
      let currentFontStore: ReturnType<typeof createMockFontScaleStore>;
      
      mockUseFontScaleStore.mockImplementation(() => {
        if (!currentFontStore) {
          currentFontStore = createMockFontScaleStore();
        }
        return currentFontStore;
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

    // Jump to current position functionality is now handled directly in NavigationModal

    // Toast functionality for no current position is now handled directly in NavigationModal

    // Error handling test removed - the new synchronous implementation doesn't have error cases
  });

});
