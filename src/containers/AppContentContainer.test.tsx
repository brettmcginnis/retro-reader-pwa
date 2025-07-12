import { render, screen, waitFor } from '@testing-library/react';

// Mock hooks and components
const mockSetCurrentView = jest.fn();
const mockSetCurrentGuideId = jest.fn();

const mockUseAppStore = jest.fn(() => ({
  currentView: 'library',
  setCurrentView: mockSetCurrentView,
  currentGuideId: null,
  setCurrentGuideId: mockSetCurrentGuideId
}));

jest.mock('../stores/useAppStore', () => ({
  useAppStore: mockUseAppStore
}));

interface AppContentViewProps {
  currentView: string;
  currentGuideId: string | null;
}

jest.mock('../components/AppContentView', () => ({
  AppContentView: (props: AppContentViewProps) => (
    <div data-testid="app-content-view">
      <div data-testid="current-view">{props.currentView}</div>
      <div data-testid="current-guide-id">{props.currentGuideId || 'null'}</div>
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

  // Mock console to suppress service worker logs
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock console.log to suppress service worker messages
    console.log = jest.fn();
    console.error = jest.fn();
    
    // Reset mock to default state
    mockUseAppStore.mockReturnValue({
      currentView: 'library',
      setCurrentView: mockSetCurrentView,
      currentGuideId: null,
      setCurrentGuideId: mockSetCurrentGuideId
    });
  });

  afterEach(() => {
    // Restore console methods
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });

  describe('Guide ID Changes', () => {
    it('should pass currentGuideId to AppContentView', async () => {
      const { rerender } = render(<AppContentContainer />);
      
      expect(screen.getByTestId('current-guide-id')).toHaveTextContent('null');

      // Update the mock to simulate currentGuideId change
      mockUseAppStore.mockReturnValue({
        currentView: 'reader',
        setCurrentView: mockSetCurrentView,
        currentGuideId: 'test-guide-1',
        setCurrentGuideId: mockSetCurrentGuideId
      });

      rerender(<AppContentContainer />);
      
      await waitFor(() => {
        expect(screen.getByTestId('current-guide-id')).toHaveTextContent('test-guide-1');
      });
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
      // Don't spy on console.log since we already mocked it
      (navigator.serviceWorker.register as jest.Mock).mockRejectedValueOnce(new Error('SW failed'));
      
      render(<AppContentContainer />);
      
      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith('SW registration failed: ', expect.any(Error));
      });
    });
  });
});