import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GuideReader } from '../GuideReader';
import { Guide } from '../../types';
import { ToastProvider } from '../../contexts/ToastContext';
import { AppProvider } from '../../contexts/AppContext';

const mockUseProgress = {
  progress: null,
  saveProgress: jest.fn(),
  loading: false,
  error: null,
  refresh: jest.fn()
};

const mockUseBookmarks = {
  bookmarks: [],
  addBookmark: jest.fn(),
  deleteBookmark: jest.fn(),
  updateBookmark: jest.fn(),
  loading: false,
  error: null,
  refresh: jest.fn()
};

jest.mock('../../hooks/useProgress', () => ({
  useProgress: () => mockUseProgress
}));

jest.mock('../../hooks/useBookmarks', () => ({
  useBookmarks: () => mockUseBookmarks
}));

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AppProvider>
    <ToastProvider>
      {children}
    </ToastProvider>
  </AppProvider>
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
    mockUseBookmarks.addBookmark.mockClear();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Reading Position Persistence', () => {
    it('should preserve reading position when scrolling', async () => {
      const user = userEvent.setup({ delay: null });
      
      render(
        <TestWrapper>
          <GuideReader guide={mockGuide} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Guide')).toBeInTheDocument();
      });

      // Navigate to line 50 (more reasonable test)
      const goToLineInput = screen.getByRole('spinbutton');
      await user.clear(goToLineInput);
      await user.type(goToLineInput, '50');
      
      const goToLineButton = screen.getByRole('button', { name: /go to line/i });
      await user.click(goToLineButton);

      // Fast-forward timers to trigger save progress
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(mockUseProgress.saveProgress).toHaveBeenCalledWith(
          expect.objectContaining({
            guideId: 'test-guide-1',
            line: 50,
            position: 0,
            percentage: 25
          })
        );
      });
    });

    it('should track current line when scrolling naturally', async () => {
      render(
        <TestWrapper>
          <GuideReader guide={mockGuide} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Guide')).toBeInTheDocument();
      });

      const container = screen.getByText(/Line 1:/).closest('.reader-content-container');
      
      // Simulate scrolling to line 30 (20px per line * 29 lines = 580px)
      fireEvent.scroll(container!, { target: { scrollTop: 580 } });

      // Run the debounced scroll handler
      act(() => {
        jest.advanceTimersByTime(100);
      });

      // Wait for scroll to stop and progress to save
      act(() => {
        jest.advanceTimersByTime(1500);
      });

      await waitFor(() => {
        expect(mockUseProgress.saveProgress).toHaveBeenCalledWith(
          expect.objectContaining({
            guideId: 'test-guide-1',
            line: 30,
            position: 0,
            percentage: 15
          })
        );
      });
    });

    it('should restore reading position when reopening guide', async () => {
      // Set initial progress
      mockUseProgress.progress = {
        guideId: 'test-guide-1',
        line: 100,
        position: 0,
        percentage: 50,
        lastRead: new Date()
      };

      render(
        <TestWrapper>
          <GuideReader guide={mockGuide} />
        </TestWrapper>
      );

      // Wait for initial render and check progress is restored
      await waitFor(() => {
        const progressInfo = screen.getByText(/Line 100 of 200/);
        expect(progressInfo).toBeInTheDocument();
      });
    });
  });

  describe('Tap and Hold Bookmark Feature', () => {
    it('should show bookmark modal on long press', async () => {
      render(
        <TestWrapper>
          <GuideReader guide={mockGuide} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Guide')).toBeInTheDocument();
      });

      // Find line 2 element
      const line2Content = screen.getByText(/Line 2: This is test content for line 2/);
      const lineElement = line2Content.closest('.line');

      // Simulate mousedown
      fireEvent.mouseDown(lineElement!);

      // Fast-forward timer to trigger long press
      act(() => {
        jest.advanceTimersByTime(600);
      });

      await waitFor(() => {
        expect(screen.getByText('Add Bookmark at Line 2')).toBeInTheDocument();
      });

      const modalTitleInput = screen.getByRole('textbox', { name: /title/i });
      expect(modalTitleInput).toHaveValue('Line 2');
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

      // Get initial progress
      const initialProgressText = screen.getByText(/Line \d+ of 200/);
      const initialProgress = initialProgressText.textContent;

      // Find line 2 element
      const line2Content = screen.getByText(/Line 2: This is test content for line 2/);
      const lineElement = line2Content.closest('.line');

      // Simulate long press
      fireEvent.mouseDown(lineElement!);
      act(() => {
        jest.advanceTimersByTime(600);
      });

      await waitFor(() => {
        expect(screen.getByText('Add Bookmark at Line 2')).toBeInTheDocument();
      });

      // Check that progress hasn't changed
      const currentProgressText = screen.getByText(/Line \d+ of 200/);
      expect(currentProgressText.textContent).toBe(initialProgress);
      
      // Check that line 2 is still visible
      expect(line2Content).toBeInTheDocument();
    });

    it('should save bookmark when form is submitted', async () => {
      const user = userEvent.setup({ delay: null });
      
      mockUseBookmarks.addBookmark.mockResolvedValueOnce({
        id: 'bookmark-1',
        guideId: 'test-guide-1',
        line: 2,
        position: 0,
        title: 'Important Section',
        note: 'Remember this',
        dateCreated: new Date()
      });
      
      render(
        <TestWrapper>
          <GuideReader guide={mockGuide} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Guide')).toBeInTheDocument();
      });

      // Find and long press line 2
      const line2Content = screen.getByText(/Line 2: This is test content for line 2/);
      const lineElement = line2Content.closest('.line');

      fireEvent.mouseDown(lineElement!);
      act(() => {
        jest.advanceTimersByTime(600);
      });

      await waitFor(() => {
        expect(screen.getByText('Add Bookmark at Line 2')).toBeInTheDocument();
      });

      // Fill in the form
      const titleInput = screen.getByRole('textbox', { name: /title/i });
      await user.clear(titleInput);
      await user.type(titleInput, 'Important Section');

      const noteInput = screen.getByRole('textbox', { name: /note/i });
      await user.type(noteInput, 'Remember this');

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      expect(mockUseBookmarks.addBookmark).toHaveBeenCalledWith({
        guideId: 'test-guide-1',
        line: 2,
        position: 0,
        title: 'Important Section',
        note: 'Remember this'
      });

      await waitFor(() => {
        expect(screen.getByText('Bookmark added!')).toBeInTheDocument();
      });
    });

    it('should cancel long press when mouse leaves', async () => {
      render(
        <TestWrapper>
          <GuideReader guide={mockGuide} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Guide')).toBeInTheDocument();
      });

      // Find line 2 element
      const line2Content = screen.getByText(/Line 2: This is test content for line 2/);
      const lineElement = line2Content.closest('.line');

      // Start long press
      fireEvent.mouseDown(lineElement!);

      // Fast-forward timer partially
      act(() => {
        jest.advanceTimersByTime(300);
      });

      // Mouse leaves before long press completes
      fireEvent.mouseLeave(lineElement!);

      // Fast-forward rest of timer
      act(() => {
        jest.advanceTimersByTime(400);
      });

      // Modal should not appear
      expect(screen.queryByText('Add Bookmark at Line 2')).not.toBeInTheDocument();
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

      // Find line 2 element
      const line2Content = screen.getByText(/Line 2: This is test content for line 2/);
      const lineElement = line2Content.closest('.line');

      // Simulate touch start
      fireEvent.touchStart(lineElement!);

      // Fast-forward timer to trigger long press
      act(() => {
        jest.advanceTimersByTime(600);
      });

      await waitFor(() => {
        expect(screen.getByText('Add Bookmark at Line 2')).toBeInTheDocument();
      });
    });
  });
});