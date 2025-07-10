import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Guide } from '../types';
import { ToastProvider } from '../contexts/ToastContext';

const mockUseProgress = {
  progress: null,
  saveProgress: jest.fn().mockResolvedValue(undefined),
  loading: false,
  error: null,
  refresh: jest.fn()
};

let mockBookmarksState: Bookmark[] = [];
const mockAddBookmark = jest.fn();
const mockDeleteBookmark = jest.fn();
const mockUpdateBookmark = jest.fn();
const mockRefresh = jest.fn();

const mockUseBookmarks = {
  get bookmarks() { return mockBookmarksState; },
  addBookmark: mockAddBookmark,
  deleteBookmark: mockDeleteBookmark,
  updateBookmark: mockUpdateBookmark,
  loading: false,
  error: null,
  refresh: mockRefresh
};

jest.mock('../hooks/useProgress', () => ({
  useProgress: () => mockUseProgress
}));

jest.mock('../hooks/useBookmarks', () => ({
  useBookmarks: () => mockUseBookmarks
}));

const mockDb = {
  saveCurrentPositionBookmark: jest.fn().mockResolvedValue(undefined),
  getCurrentPositionBookmark: jest.fn().mockResolvedValue(null),
  init: jest.fn().mockResolvedValue(undefined)
};

jest.mock('../services/database', () => ({
  db: mockDb
}));

const mockUseApp = jest.fn(() => ({
  navigationTargetLine: null,
  setNavigationTargetLine: jest.fn(),
  currentView: 'reader',
  setCurrentView: jest.fn(),
  currentGuideId: 'test-guide-1',
  setCurrentGuideId: jest.fn(),
  theme: 'light',
  toggleTheme: jest.fn()
}));

jest.mock('../contexts/useApp', () => ({
  useApp: () => mockUseApp()
}));

// Import after mocks are set up
import { GuideReader } from './GuideReader';

// Create a custom test wrapper that doesn't use the real AppProvider
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ToastProvider>
    {children}
  </ToastProvider>
);

describe('GuideReader Tests', () => {
  let mockGuide: Guide;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    const lines = Array.from({ length: 200 }, (_, i) => `Line ${i + 1}: This is test content for line ${i + 1}`);
    
    mockGuide = {
      id: 'test-guide-1',
      title: 'Test Guide',
      url: 'test://url',
      content: lines.join('\n'),
      dateAdded: new Date(),
      dateModified: new Date(),
      size: 1000
    };

    // Reset mock state
    mockUseProgress.progress = null;
    mockUseProgress.saveProgress.mockClear();
    mockBookmarksState = []; // Reset bookmarks
    mockAddBookmark.mockClear();
    mockDeleteBookmark.mockClear();
    mockUpdateBookmark.mockClear();
    mockRefresh.mockClear();
    mockDb.saveCurrentPositionBookmark.mockClear();
    mockDb.getCurrentPositionBookmark.mockClear().mockResolvedValue(null);
    
    // Reset mockUseApp to default
    mockUseApp.mockReturnValue({
      navigationTargetLine: null,
      setNavigationTargetLine: jest.fn(),
      currentView: 'reader',
      setCurrentView: jest.fn(),
      currentGuideId: 'test-guide-1',
      setCurrentGuideId: jest.fn(),
      theme: 'light',
      toggleTheme: jest.fn()
    });
    
    // Mock scrollTo to avoid errors
    Element.prototype.scrollTo = jest.fn();
    
    // Mock requestAnimationFrame for tests
    global.requestAnimationFrame = (callback: FrameRequestCallback) => {
      setTimeout(() => callback(0), 0);
      return 0;
    };
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Reading Position Persistence', () => {
    it.skip('should handle navigation', async () => {
      const { container } = render(
        <TestWrapper>
          <GuideReader guide={mockGuide} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Guide')).toBeInTheDocument();
      });

      // Click Go to line button using the button element directly
      const goToLineButton = container.querySelector('button[title="Go to line"]');
      expect(goToLineButton).toBeInTheDocument();
      
      if (goToLineButton) {
        fireEvent.click(goToLineButton);
      }

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const input = screen.getByRole('spinbutton');
      expect(input).toBeInTheDocument();
      
      await userEvent.clear(input);
      await userEvent.type(input, '50');

      const goButton = screen.getByRole('button', { name: /go/i });
      await userEvent.click(goButton);

      // Check the scrollbar container
      const scrollContainer = container.querySelector('.overflow-auto');
      expect(scrollContainer).toBeInTheDocument();

      // Verify save progress was called
      await waitFor(() => {
        expect(mockUseProgress.saveProgress).toHaveBeenCalledWith(expect.objectContaining({
          line: 50
        }));
      });
    });

    it.skip('should restore reading position when reopening guide', async () => {
      mockUseProgress.progress = {
        guideId: 'test-guide-1',
        line: 75,
        totalLines: 200,
        fontSize: 14,
        zoomLevel: 1,
        screenIdentifier: 'test-screen',
        dateModified: new Date()
      };

      render(
        <TestWrapper>
          <GuideReader guide={mockGuide} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Guide')).toBeInTheDocument();
      });

      // Fast-forward timers to trigger the initial scroll
      await act(async () => {
        jest.advanceTimersByTime(100);
      });

      // The initial line should be set from progress
      const goToLineInput = screen.getByRole('spinbutton');
      expect(goToLineInput).toHaveValue(75);
    });
  });

  describe('Double Tap Bookmark Feature', () => {
    it('should show bookmark modal on double tap', async () => {
      render(
        <TestWrapper>
          <GuideReader guide={mockGuide} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Guide')).toBeInTheDocument();
      });

      // Wait for lines to be rendered
      await waitFor(() => {
        expect(screen.getByTestId('line-2')).toBeInTheDocument();
      });

      // Find line 2 element by test id
      const lineElement = screen.getByTestId('line-2');

      // Simulate double tap
      fireEvent.click(lineElement);
      fireEvent.click(lineElement);

      // Wait for the modal to appear - check for the specific title
      await waitFor(() => {
        expect(screen.getByText('Add Bookmark at Line 2')).toBeInTheDocument();
      }, { timeout: 3000 });

      const modalTitleInput = screen.getByRole('textbox', { name: /title/i });
      expect(modalTitleInput).toHaveValue('Line 2: This is test content for line 2');
    });

    it('should not leave reading area when bookmark modal appears', async () => {
      render(
        <TestWrapper>
          <GuideReader guide={mockGuide} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Guide')).toBeInTheDocument();
      });

      // Wait for lines to be rendered
      await waitFor(() => {
        expect(screen.getByTestId('line-2')).toBeInTheDocument();
      });

      // Get initial progress
      const initialProgressText = screen.getByText(/Line \d+ of 200/);
      const initialProgress = initialProgressText.textContent;

      // Find line 2 element
      const lineElement = screen.getByTestId('line-2');

      // Simulate double tap
      fireEvent.click(lineElement);
      fireEvent.click(lineElement);

      await waitFor(() => {
        // Check for the bookmark modal text to be displayed
        expect(screen.getByText('Add Bookmark at Line 2')).toBeInTheDocument();
      });

      // Check that progress hasn't changed
      const currentProgressText = screen.getByText(/Line \d+ of 200/);
      expect(currentProgressText.textContent).toBe(initialProgress);
      
      // Check that line 2 is still visible
      expect(screen.getByText(/Line 2: This is test content for line 2/)).toBeInTheDocument();
    });

    it.skip('should save bookmark when form is submitted', async () => {
      mockAddBookmark.mockResolvedValueOnce(true);
      jest.useRealTimers(); // Use real timers for userEvent
      
      render(
        <TestWrapper>
          <GuideReader guide={mockGuide} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Guide')).toBeInTheDocument();
      });

      // Wait for lines to be rendered
      await waitFor(() => {
        expect(screen.getByTestId('line-2')).toBeInTheDocument();
      });

      // Find and double tap line 2
      const lineElement = screen.getByTestId('line-2');

      fireEvent.click(lineElement);
      fireEvent.click(lineElement);

      await waitFor(() => {
        // Check for the bookmark modal text to be displayed
        expect(screen.getByText('Add Bookmark at Line 2')).toBeInTheDocument();
      });

      // Fill in the form
      const titleInput = screen.getByRole('textbox', { name: /title/i });
      const noteInput = screen.getByRole('textbox', { name: /note/i });

      await userEvent.clear(titleInput);
      await userEvent.type(titleInput, 'Test Bookmark');
      await userEvent.type(noteInput, 'Test note');

      // Submit form
      const saveButton = screen.getByRole('button', { name: /save bookmark/i });
      await userEvent.click(saveButton);

      await waitFor(() => {
        expect(mockAddBookmark).toHaveBeenCalledWith(2, 'Test Bookmark', 'Test note');
      });

      // Modal should close
      await waitFor(() => {
        expect(screen.queryByText('Add Bookmark at Line 2')).not.toBeInTheDocument();
      });
      
      jest.useFakeTimers(); // Switch back to fake timers
    }, 10000);

    it.skip('should display newly created bookmark in bookmarks overlay', async () => {
      mockAddBookmark.mockImplementation(async (line, title, note) => {
        const newBookmark = {
          id: 'bookmark-1',
          guideId: 'test-guide-1',
          line,
          title,
          note,
          dateCreated: new Date(),
          isCurrentPosition: false
        };
        mockBookmarksState.push(newBookmark);
        return true;
      });
      
      jest.useRealTimers(); // Use real timers for userEvent
      
      render(
        <TestWrapper>
          <GuideReader guide={mockGuide} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Guide')).toBeInTheDocument();
      });

      // Wait for lines to be rendered
      await waitFor(() => {
        expect(screen.getByTestId('line-2')).toBeInTheDocument();
      });

      // Double tap to create bookmark
      const lineElement = screen.getByTestId('line-2');
      fireEvent.click(lineElement);
      fireEvent.click(lineElement);

      await waitFor(() => {
        expect(screen.getByText('Add Bookmark at Line 2')).toBeInTheDocument();
      });

      const titleInput = screen.getByRole('textbox', { name: /title/i });
      await userEvent.clear(titleInput);
      await userEvent.type(titleInput, 'My Bookmark');

      const saveButton = screen.getByRole('button', { name: /save bookmark/i });
      await userEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.queryByText('Add Bookmark at Line 2')).not.toBeInTheDocument();
      });

      // Refresh bookmarks
      await act(async () => {
        mockRefresh();
      });

      // Open bookmarks overlay
      const bookmarksButton = screen.getByRole('button', { name: /bookmarks/i });
      await userEvent.click(bookmarksButton);

      await waitFor(() => {
        expect(screen.getByText('Bookmarks')).toBeInTheDocument();
        expect(screen.getByText('My Bookmark')).toBeInTheDocument();
      });
      
      jest.useFakeTimers(); // Switch back to fake timers
    }, 10000);

    it('should not trigger bookmark modal on single tap', async () => {
      render(
        <TestWrapper>
          <GuideReader guide={mockGuide} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Guide')).toBeInTheDocument();
      });

      // Wait for lines to be rendered
      await waitFor(() => {
        expect(screen.getByTestId('line-2')).toBeInTheDocument();
      });

      // Find line 2 element
      const lineElement = screen.getByTestId('line-2');

      // Single tap only
      fireEvent.click(lineElement);

      // Wait a bit to ensure no modal appears
      act(() => {
        jest.advanceTimersByTime(400);
      });

      // Modal should not appear
      expect(screen.queryByText('Add Bookmark')).not.toBeInTheDocument();
    });

    it('should work with touch events for mobile', async () => {
      render(
        <TestWrapper>
          <GuideReader guide={mockGuide} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Guide')).toBeInTheDocument();
      });

      // Wait for lines to be rendered
      await waitFor(() => {
        expect(screen.getByTestId('line-2')).toBeInTheDocument();
      });

      // Find line 2 element
      const lineElement = screen.getByTestId('line-2');

      // Simulate double tap (touch)
      fireEvent.click(lineElement);
      fireEvent.click(lineElement);

      await waitFor(() => {
        expect(screen.getByText('Add Bookmark at Line 2')).toBeInTheDocument();
      });
    });
  });

  describe('Jump to Current Position', () => {
    it.skip('should render with navigation controls', async () => {
      render(
        <TestWrapper>
          <GuideReader guide={mockGuide} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Guide')).toBeInTheDocument();
      });

      // Check for navigation controls
      const positionButton = screen.getByRole('button', { name: /position/i });
      expect(positionButton).toBeInTheDocument();
    });
  });

  describe('Bookmark Highlighting', () => {
    it.skip('should highlight bookmarked lines and current position', async () => {
      // Setup bookmarks
      mockBookmarksState = [
        {
          id: 'bookmark-1',
          guideId: 'test-guide-1',
          line: 5,
          title: 'Regular Bookmark',
          dateCreated: new Date(),
          isCurrentPosition: false
        }
      ];

      // Setup current position bookmark
      mockDb.getCurrentPositionBookmark.mockResolvedValueOnce({
        id: 'current-pos-1',
        guideId: 'test-guide-1',
        line: 10,
        title: 'Current Position',
        dateCreated: new Date(),
        isCurrentPosition: true
      });

      render(
        <TestWrapper>
          <GuideReader guide={mockGuide} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Guide')).toBeInTheDocument();
      });

      // Check for bookmark indicators
      const bookmarkLines = screen.getAllByTestId(/bookmark-indicator/);
      expect(bookmarkLines.length).toBeGreaterThan(0);
    });

    it('should pre-fill bookmark title with line content', async () => {
      render(
        <TestWrapper>
          <GuideReader guide={mockGuide} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Guide')).toBeInTheDocument();
      });

      // Wait for lines to be rendered
      await waitFor(() => {
        expect(screen.getByTestId('line-2')).toBeInTheDocument();
      });

      // Simulate double tap on line 2
      const lineElement = screen.getByTestId('line-2');
      fireEvent.click(lineElement);
      fireEvent.click(lineElement);

      await waitFor(() => {
        expect(screen.getByText('Add Bookmark at Line 2')).toBeInTheDocument();
      });

      // Check that title is pre-filled with line content
      const titleInput = screen.getByLabelText('Title');
      expect(titleInput).toHaveValue('Line 2: This is test content for line 2');
    });

    it('should display Set as Current Position button in bookmark modal', async () => {
      render(
        <TestWrapper>
          <GuideReader guide={mockGuide} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Guide')).toBeInTheDocument();
      });

      // Wait for lines to be rendered
      await waitFor(() => {
        expect(screen.getByTestId('line-2')).toBeInTheDocument();
      });

      // Open bookmark modal with double tap
      const lineElement = screen.getByTestId('line-2');
      fireEvent.click(lineElement);
      fireEvent.click(lineElement);

      await waitFor(() => {
        expect(screen.getByText('Add Bookmark at Line 2')).toBeInTheDocument();
      });

      // Check for Set as Current Position button
      const setCurrentButton = screen.getByRole('button', { name: /set as current position/i });
      expect(setCurrentButton).toBeInTheDocument();
    });
  });

  describe('Bookmark Navigation Integration', () => {
    it('should scroll to bookmark line when navigating from bookmark manager', async () => {
      // Setup navigation target in context
      const mockSetNavigationTargetLine = jest.fn();
      mockUseApp.mockReturnValue({
        navigationTargetLine: 75,
        setNavigationTargetLine: mockSetNavigationTargetLine,
        currentView: 'reader',
        setCurrentView: jest.fn(),
        currentGuideId: 'test-guide-1',
        setCurrentGuideId: jest.fn(),
        theme: 'light',
        toggleTheme: jest.fn()
      });

      render(
        <TestWrapper>
          <GuideReader guide={mockGuide} />
        </TestWrapper>
      );

      // Wait for component to mount
      await waitFor(() => {
        expect(screen.getByText('Test Guide')).toBeInTheDocument();
      });

      // The navigation target should be processed in the first render cycle
      // Since we're providing navigationTargetLine: 75, the container should:
      // 1. Set currentLine to 75
      // 2. Clear navigationTargetLine
      // 3. Pass currentLine to the view
      
      // Wait for navigation target to be cleared
      await waitFor(() => {
        expect(mockSetNavigationTargetLine).toHaveBeenCalledWith(null);
      });

      // At this point, currentLine should be 75
      // Get the input and check its value
      const goToLineInput = screen.getByRole('spinbutton');
      
      // Wait for the state update to propagate and re-render
      await waitFor(() => {
        expect(goToLineInput).toHaveValue(75);
      }, { 
        timeout: 2000,
        interval: 100 
      });
    });

    it('should handle navigation target after component is already loaded', async () => {
      const mockSetNavigationTargetLine = jest.fn();
      
      // Start without navigation target
      mockUseApp.mockReturnValue({
        navigationTargetLine: null,
        setNavigationTargetLine: mockSetNavigationTargetLine,
        currentView: 'reader',
        setCurrentView: jest.fn(),
        currentGuideId: 'test-guide-1',
        setCurrentGuideId: jest.fn(),
        theme: 'light',
        toggleTheme: jest.fn()
      });

      const { rerender } = render(
        <TestWrapper>
          <GuideReader guide={mockGuide} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Guide')).toBeInTheDocument();
      });

      // Run timers for initial load
      await act(async () => {
        jest.runAllTimers();
      });

      // Verify starting at line 1
      const goToLineInput = screen.getByRole('spinbutton') as HTMLInputElement;
      expect(goToLineInput.value).toBe('1');

      // Update context with navigation target
      mockUseApp.mockReturnValue({
        navigationTargetLine: 50,
        setNavigationTargetLine: mockSetNavigationTargetLine,
        currentView: 'reader',
        setCurrentView: jest.fn(),
        currentGuideId: 'test-guide-1',
        setCurrentGuideId: jest.fn(),
        theme: 'light',
        toggleTheme: jest.fn()
      });

      rerender(
        <TestWrapper>
          <GuideReader guide={mockGuide} />
        </TestWrapper>
      );

      // Wait for navigation target to be processed
      await waitFor(() => {
        expect(mockSetNavigationTargetLine).toHaveBeenCalledWith(null);
      });

      // Wait for state update to propagate
      await waitFor(() => {
        expect(goToLineInput).toHaveValue(50);
      }, { 
        timeout: 2000,
        interval: 100 
      });
    });

    it('should prioritize navigation target over current position bookmark', async () => {
      const mockSetNavigationTargetLine = jest.fn();
      
      // Set up both navigation target and current position bookmark
      mockUseApp.mockReturnValue({
        navigationTargetLine: 25,
        setNavigationTargetLine: mockSetNavigationTargetLine,
        currentView: 'reader',
        setCurrentView: jest.fn(),
        currentGuideId: 'test-guide-1',
        setCurrentGuideId: jest.fn(),
        theme: 'light',
        toggleTheme: jest.fn()
      });

      // Mock getCurrentPositionBookmark to return a bookmark
      mockDb.getCurrentPositionBookmark.mockResolvedValue({
        id: 'current-position-test-guide-1',
        guideId: 'test-guide-1',
        line: 80,
        title: 'Current Position',
        dateCreated: new Date(),
        isCurrentPosition: true
      });

      render(
        <TestWrapper>
          <GuideReader guide={mockGuide} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Guide')).toBeInTheDocument();
      });

      // Wait for navigation target to be processed
      await waitFor(() => {
        expect(mockSetNavigationTargetLine).toHaveBeenCalledWith(null);
      });

      // Should use navigation target (25) instead of current position (80)
      const goToLineInput = screen.getByRole('spinbutton') as HTMLInputElement;
      
      // Wait for state update to propagate
      await waitFor(() => {
        expect(goToLineInput).toHaveValue(25);
      }, { 
        timeout: 2000,
        interval: 100 
      });
    });
  });
});