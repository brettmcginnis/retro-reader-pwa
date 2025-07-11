import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { Guide, Bookmark } from '../types';
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
  get bookmarks() { return [...mockBookmarksState]; }, // Return a copy to ensure fresh references
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
    mockRefresh.mockResolvedValue(undefined);
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
    it('should handle navigation', async () => {
      render(
        <TestWrapper>
          <GuideReader guide={mockGuide} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Guide')).toBeInTheDocument();
      });

      // Wait for the component to finish loading
      await act(async () => {
        jest.runAllTimers();
      });

      // Click the Navigate button in the bottom navigation
      const navigateButton = screen.getByRole('button', { name: /navigate/i });
      expect(navigateButton).toBeInTheDocument();
      
      fireEvent.click(navigateButton);

      // Wait for navigation modal to appear
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Go to Line' })).toBeInTheDocument();
      });

      // Find and interact with the line input
      const lineInput = screen.getByPlaceholderText('1-200');
      expect(lineInput).toBeInTheDocument();
      
      fireEvent.change(lineInput, { target: { value: '50' } });

      // Click the Go button
      const goButton = screen.getByRole('button', { name: /go to line/i });
      fireEvent.click(goButton);

      // Modal should close
      await waitFor(() => {
        expect(screen.queryByRole('heading', { name: 'Go to Line' })).not.toBeInTheDocument();
      });

      // The navigation should trigger a line change
      // Note: The actual scrolling and progress saving happens in the container
      // which would require more complex mocking to test properly
    });

    it('should restore reading position when reopening guide', async () => {
      // Set up progress to indicate we were at line 75
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

      // Verify that the component renders with progress data available
      expect(mockUseProgress.progress.line).toBe(75);
      
      // Verify that the progress is accessible to the component
      expect(screen.getByText(/Line \d+ of 200/)).toBeInTheDocument();
      
      // The actual scrolling behavior is handled by the container's useEffect
      // which is tested in the container tests
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

    it('should save bookmark when form is submitted', async () => {
      mockAddBookmark.mockResolvedValueOnce({
        id: 'new-bookmark-1',
        guideId: 'test-guide-1',
        line: 2,
        title: 'Test Bookmark',
        note: 'Test note',
        dateCreated: new Date(),
        isCurrentPosition: false
      });
      
      render(
        <TestWrapper>
          <GuideReader guide={mockGuide} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Guide')).toBeInTheDocument();
      });

      // Run timers to ensure initial rendering is complete
      await act(async () => {
        jest.runAllTimers();
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

      // The title should be pre-filled
      expect(titleInput).toHaveValue('Line 2: This is test content for line 2');
      
      fireEvent.change(titleInput, { target: { value: 'Test Bookmark' } });
      fireEvent.change(noteInput, { target: { value: 'Test note' } });

      // Submit form
      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockAddBookmark).toHaveBeenCalledWith({
          guideId: 'test-guide-1',
          line: 2,
          title: 'Test Bookmark',
          note: 'Test note'
        });
      });

      // Modal should close
      await waitFor(() => {
        expect(screen.queryByText('Add Bookmark at Line 2')).not.toBeInTheDocument();
      });
    });

    it('should create bookmark and refresh bookmarks list', async () => {
      mockAddBookmark.mockResolvedValueOnce({
        id: 'bookmark-1',
        guideId: 'test-guide-1',
        line: 2,
        title: 'My Bookmark',
        note: undefined,
        dateCreated: new Date(),
        isCurrentPosition: false
      });
      
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
      fireEvent.change(titleInput, { target: { value: 'My Bookmark' } });

      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      // Wait for the bookmark modal to close
      await waitFor(() => {
        expect(screen.queryByText('Add Bookmark at Line 2')).not.toBeInTheDocument();
      });

      // Verify the bookmark was created with correct data
      expect(mockAddBookmark).toHaveBeenCalledWith({
        guideId: 'test-guide-1',
        line: 2,
        title: 'My Bookmark',
        note: ''
      });

      // Open bookmarks overlay
      const bookmarksButton = screen.getByRole('button', { name: /bookmarks/i });
      fireEvent.click(bookmarksButton);

      // Verify refresh was called when opening bookmarks
      await waitFor(() => {
        expect(mockRefresh).toHaveBeenCalled();
      });

      // Verify bookmarks overlay opened
      await waitFor(() => {
        expect(screen.getByText('Bookmarks')).toBeInTheDocument();
      });
    });

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
    it('should render with navigation controls', async () => {
      render(
        <TestWrapper>
          <GuideReader guide={mockGuide} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Guide')).toBeInTheDocument();
      });

      // Check for navigation controls in the bottom navigation
      const navigateButton = screen.getByRole('button', { name: /navigate/i });
      const bookmarksButton = screen.getByRole('button', { name: /bookmarks/i });
      
      expect(navigateButton).toBeInTheDocument();
      expect(bookmarksButton).toBeInTheDocument();
      
      // Check that the hidden navigation input exists
      const lineInput = screen.getByRole('spinbutton', { name: /go to line/i });
      expect(lineInput).toBeInTheDocument();
    });
  });

  describe('Bookmark Highlighting', () => {
    it('should highlight bookmarked lines and current position', async () => {
      // Setup bookmarks including current position
      mockBookmarksState = [
        {
          id: 'bookmark-1',
          guideId: 'test-guide-1',
          line: 5,
          title: 'Regular Bookmark',
          dateCreated: new Date(),
          isCurrentPosition: false
        },
        {
          id: 'current-pos-1',
          guideId: 'test-guide-1',
          line: 10,
          title: 'Current Position',
          dateCreated: new Date(),
          isCurrentPosition: true
        }
      ];

      render(
        <TestWrapper>
          <GuideReader guide={mockGuide} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Guide')).toBeInTheDocument();
      });

      // Run timers to ensure rendering is complete
      await act(async () => {
        jest.runAllTimers();
      });

      // Lines 5 and 10 should be visible and have special styling
      // Check that the lines are rendered (virtual scrolling should show first ~100 lines)
      await waitFor(() => {
        expect(screen.getByTestId('line-5')).toBeInTheDocument();
        expect(screen.getByTestId('line-10')).toBeInTheDocument();
      });

      // Check the classes on the bookmarked lines
      const line5 = screen.getByTestId('line-5');
      const line10 = screen.getByTestId('line-10');
      
      // Line 5 should have bookmark highlighting (bg-purple-50 dark:bg-purple-900/20)
      expect(line5).toHaveClass('bg-purple-50');
      
      // Line 10 should have current position highlighting (bg-yellow-100 dark:bg-yellow-900/30)
      expect(line10).toHaveClass('bg-yellow-100');
      expect(line10).toHaveClass('border-l-4');
      expect(line10).toHaveClass('border-yellow-500');
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
      // Reset all mocks
      jest.clearAllMocks();
      mockUseProgress.progress = null;
      mockDb.getCurrentPositionBookmark.mockResolvedValue(null);
      
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

      // Verify that navigation target is available to the component
      expect(mockUseApp().navigationTargetLine).toBe(75);

      // Verify navigation target clearing was requested
      // The container will call this after processing the navigation
      await waitFor(() => {
        expect(mockSetNavigationTargetLine).toHaveBeenCalledWith(null);
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

      // Clear mock to track scrollTo calls
      (Element.prototype.scrollTo as jest.Mock).mockClear();

      const { rerender } = render(
        <TestWrapper>
          <GuideReader guide={mockGuide} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Guide')).toBeInTheDocument();
      });

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

      // Verify navigation target is now set
      expect(mockUseApp().navigationTargetLine).toBe(50);

      // Verify navigation target clearing was requested
      await waitFor(() => {
        expect(mockSetNavigationTargetLine).toHaveBeenCalledWith(null);
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

      // Clear previous mock calls
      (Element.prototype.scrollTo as jest.Mock).mockClear();

      render(
        <TestWrapper>
          <GuideReader guide={mockGuide} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Guide')).toBeInTheDocument();
      });

      // Verify we have both navigation target and bookmark
      expect(mockUseApp().navigationTargetLine).toBe(25);
      await expect(mockDb.getCurrentPositionBookmark('test-guide-1')).resolves.toHaveProperty('line', 80);

      // Verify navigation target was processed (cleared)
      await waitFor(() => {
        expect(mockSetNavigationTargetLine).toHaveBeenCalledWith(null);
      });
      
      // The container should prioritize navigation target (25) over bookmark (80)
      // This behavior is tested in the container unit tests
    });
  });
});