import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Guide } from '../types';

// Mock hooks and components
const mockSetCurrentView = jest.fn();
const mockSetCurrentGuideId = jest.fn();
const mockSetNavigationTargetLine = jest.fn();
const mockGetGuide = jest.fn();

const mockUseApp = jest.fn(() => ({
  currentView: 'library',
  setCurrentView: mockSetCurrentView,
  currentGuideId: null,
  setCurrentGuideId: mockSetCurrentGuideId,
  setNavigationTargetLine: mockSetNavigationTargetLine
}));

jest.mock('../contexts/useApp', () => ({
  useApp: mockUseApp
}));

jest.mock('../hooks/useGuides', () => ({
  useGuides: () => ({
    getGuide: mockGetGuide
  })
}));

interface AppContentViewProps {
  currentView: string;
  isLoadingGuide: boolean;
  currentGuide: Guide | null;
  onBackToLibrary: () => void;
  onViewChange: (view: string) => void;
  onNavigateToLine: (line: number) => void;
}

jest.mock('../components/AppContentView', () => ({
  AppContentView: (props: AppContentViewProps) => (
    <div data-testid="app-content-view">
      <div data-testid="current-view">{props.currentView}</div>
      <div data-testid="is-loading">{props.isLoadingGuide.toString()}</div>
      <div data-testid="current-guide">{props.currentGuide?.title || 'null'}</div>
      <button onClick={props.onBackToLibrary}>Back to Library</button>
      <button onClick={() => props.onViewChange('reader')}>Switch to Reader</button>
      <button onClick={() => props.onViewChange('bookmarks')}>Switch to Bookmarks</button>
      <button onClick={() => props.onNavigateToLine(42)}>Navigate to Line 42</button>
    </div>
  )
}));

// Mock window.history
const mockPushState = jest.fn();
Object.defineProperty(window, 'history', {
  writable: true,
  value: {
    pushState: mockPushState
  }
});

// Mock service worker registration
Object.defineProperty(navigator, 'serviceWorker', {
  writable: true,
  value: {
    register: jest.fn().mockResolvedValue({ scope: '/retro-reader-pwa/' })
  }
});

// Import component after mocks
import { AppContentContainer } from './AppContentContainer';

describe('AppContentContainer', () => {
  const mockGuide: Guide = {
    id: 'test-guide-1',
    title: 'Test Guide',
    url: 'https://example.com/guide',
    content: 'Test content',
    dateAdded: new Date(),
    dateModified: new Date(),
    size: 1000
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetGuide.mockResolvedValue(mockGuide);
    
    // Reset mock to default state
    mockUseApp.mockReturnValue({
      currentView: 'library',
      setCurrentView: mockSetCurrentView,
      currentGuideId: null,
      setCurrentGuideId: mockSetCurrentGuideId,
      setNavigationTargetLine: mockSetNavigationTargetLine
    });
  });

  describe('Guide Loading', () => {
    it('should load guide when currentGuideId changes', async () => {
      const { rerender } = render(<AppContentContainer />);
      
      expect(screen.getByTestId('current-guide')).toHaveTextContent('null');
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false');

      // Update the mock to simulate currentGuideId change
      mockUseApp.mockReturnValue({
        currentView: 'reader',
        setCurrentView: mockSetCurrentView,
        currentGuideId: 'test-guide-1',
        setCurrentGuideId: mockSetCurrentGuideId,
        setNavigationTargetLine: mockSetNavigationTargetLine
      });

      rerender(<AppContentContainer />);

      await waitFor(() => {
        expect(mockGetGuide).toHaveBeenCalledWith('test-guide-1');
      });

      await waitFor(() => {
        expect(screen.getByTestId('current-guide')).toHaveTextContent('Test Guide');
      });
    });

    it('should handle guide loading error', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      mockGetGuide.mockRejectedValueOnce(new Error('Failed to load'));

      mockUseApp.mockReturnValue({
        currentView: 'reader',
        setCurrentView: mockSetCurrentView,
        currentGuideId: 'test-guide-1',
        setCurrentGuideId: mockSetCurrentGuideId,
        setNavigationTargetLine: mockSetNavigationTargetLine
      });

      render(<AppContentContainer />);

      await waitFor(() => {
        expect(mockSetCurrentGuideId).toHaveBeenCalledWith(null);
        expect(mockSetCurrentView).toHaveBeenCalledWith('library');
      });

      consoleError.mockRestore();
    });

    it('should handle missing guide', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      mockGetGuide.mockResolvedValueOnce(null);

      mockUseApp.mockReturnValue({
        currentView: 'reader',
        setCurrentView: mockSetCurrentView,
        currentGuideId: 'test-guide-1',
        setCurrentGuideId: mockSetCurrentGuideId,
        setNavigationTargetLine: mockSetNavigationTargetLine
      });

      render(<AppContentContainer />);

      await waitFor(() => {
        expect(mockSetCurrentGuideId).toHaveBeenCalledWith(null);
        expect(mockSetCurrentView).toHaveBeenCalledWith('library');
      });

      consoleError.mockRestore();
    });
  });

  describe('Navigation', () => {
    it('should handle back to library navigation', async () => {
      const user = userEvent.setup();
      
      render(<AppContentContainer />);
      
      await user.click(screen.getByText('Back to Library'));
      
      expect(mockSetCurrentView).toHaveBeenCalledWith('library');
      expect(mockSetCurrentGuideId).toHaveBeenCalledWith(null);
      expect(mockPushState).toHaveBeenCalledWith({}, '', '/retro-reader-pwa/');
    });

    it('should handle view changes', async () => {
      const user = userEvent.setup();
      
      render(<AppContentContainer />);
      
      await user.click(screen.getByText('Switch to Reader'));
      expect(mockSetCurrentView).toHaveBeenCalledWith('reader');
      
      await user.click(screen.getByText('Switch to Bookmarks'));
      expect(mockSetCurrentView).toHaveBeenCalledWith('bookmarks');
    });

    it('should handle navigate to line', async () => {
      const user = userEvent.setup();
      
      render(<AppContentContainer />);
      
      await user.click(screen.getByText('Navigate to Line 42'));
      
      expect(mockSetNavigationTargetLine).toHaveBeenCalledWith(42);
      expect(mockSetCurrentView).toHaveBeenCalledWith('reader');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should handle escape key to go back to library', async () => {
      mockUseApp.mockReturnValue({
        currentView: 'reader',
        setCurrentView: mockSetCurrentView,
        currentGuideId: 'test-guide-1',
        setCurrentGuideId: mockSetCurrentGuideId,
        setNavigationTargetLine: mockSetNavigationTargetLine
      });

      render(<AppContentContainer />);
      
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(event);
      
      expect(mockSetCurrentView).toHaveBeenCalledWith('library');
      expect(mockSetCurrentGuideId).toHaveBeenCalledWith(null);
    });

    it('should not handle escape key when already in library view', () => {
      // Clear the previous calls
      jest.clearAllMocks();
      
      render(<AppContentContainer />);
      
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(event);
      
      expect(mockSetCurrentView).not.toHaveBeenCalled();
      expect(mockSetCurrentGuideId).not.toHaveBeenCalled();
    });
  });

  describe('URL Handling', () => {
    it('should handle URL with guide ID on mount', () => {
      const originalPathname = window.location.pathname;
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { pathname: '/retro-reader-pwa/guide/test-guide-123' }
      });

      render(<AppContentContainer />);
      
      expect(mockSetCurrentGuideId).toHaveBeenCalledWith('test-guide-123');
      expect(mockSetCurrentView).toHaveBeenCalledWith('reader');

      // Restore original pathname
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { pathname: originalPathname }
      });
    });

    it('should handle popstate events', () => {
      const originalPathname = window.location.pathname;
      
      render(<AppContentContainer />);
      
      // Simulate navigating to a guide
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { pathname: '/retro-reader-pwa/guide/another-guide' }
      });
      
      window.dispatchEvent(new PopStateEvent('popstate'));
      
      expect(mockSetCurrentGuideId).toHaveBeenCalledWith('another-guide');
      expect(mockSetCurrentView).toHaveBeenCalledWith('reader');
      
      // Simulate navigating back to root
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { pathname: '/retro-reader-pwa/' }
      });
      
      window.dispatchEvent(new PopStateEvent('popstate'));
      
      expect(mockSetCurrentGuideId).toHaveBeenCalledWith(null);
      expect(mockSetCurrentView).toHaveBeenCalledWith('library');

      // Restore original pathname
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { pathname: originalPathname }
      });
    });
  });

  describe('Service Worker', () => {
    it('should register service worker on mount', async () => {
      render(<AppContentContainer />);
      
      await waitFor(() => {
        expect(navigator.serviceWorker.register).toHaveBeenCalledWith('/retro-reader-pwa/sw.js');
      });
    });

    it('should handle service worker registration failure', async () => {
      const consoleLog = jest.spyOn(console, 'log').mockImplementation();
      (navigator.serviceWorker.register as jest.Mock).mockRejectedValueOnce(new Error('SW failed'));
      
      render(<AppContentContainer />);
      
      await waitFor(() => {
        expect(consoleLog).toHaveBeenCalledWith('SW registration failed: ', expect.any(Error));
      });
      
      consoleLog.mockRestore();
    });
  });
});