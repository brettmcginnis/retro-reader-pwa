import { render, screen } from '@testing-library/react';
import { AppContentView } from './AppContentView';
import { Guide } from '../types';

// Mock the child components
jest.mock('./GuideLibrary', () => ({
  GuideLibrary: () => <div data-testid="guide-library">Guide Library</div>
}));

jest.mock('./GuideReader', () => ({
  GuideReader: ({ guide, currentView, onViewChange }: { guide: Guide; currentView?: string; onViewChange?: (view: string) => void }) => (
    <div data-testid="guide-reader">
      Guide Reader: {guide.title}
      {currentView && <div>Current View: {currentView}</div>}
      {onViewChange && <button onClick={() => onViewChange('library')}>Go to Library</button>}
    </div>
  )
}));

jest.mock('./Loading', () => ({
  Loading: () => <div data-testid="loading">Loading guide...</div>
}));

describe('AppContentView', () => {
  const mockGuide: Guide = {
    id: 'test-guide-1',
    title: 'Test Guide',
    url: 'https://example.com/guide',
    content: 'Test content',
    dateAdded: new Date(),
    dateModified: new Date(),
    size: 1000
  };

  const defaultProps = {
    currentView: 'library' as const,
    currentGuide: null,
    isLoadingGuide: false,
    onBackToLibrary: jest.fn(),
    onViewChange: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  describe('View Rendering', () => {
    it('should render GuideLibrary when currentView is library', () => {
      render(<AppContentView {...defaultProps} />);
      
      expect(screen.getByTestId('guide-library')).toBeInTheDocument();
      expect(screen.queryByTestId('guide-reader')).not.toBeInTheDocument();
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    it('should render GuideReader when currentView is reader and guide is loaded', () => {
      render(
        <AppContentView 
          {...defaultProps} 
          currentView="reader"
          currentGuide={mockGuide}
        />
      );
      
      expect(screen.getByTestId('guide-reader')).toBeInTheDocument();
      expect(screen.getByText('Guide Reader: Test Guide')).toBeInTheDocument();
      expect(screen.queryByTestId('guide-library')).not.toBeInTheDocument();
    });

    it('should show loading state when isLoadingGuide is true', () => {
      render(
        <AppContentView 
          {...defaultProps} 
          currentView="reader"
          isLoadingGuide={true}
        />
      );
      
      expect(screen.getByTestId('loading')).toBeInTheDocument();
      expect(screen.queryByTestId('guide-reader')).not.toBeInTheDocument();
    });

    it('should fallback to GuideLibrary when no guide is loaded in reader view', () => {
      render(
        <AppContentView 
          {...defaultProps} 
          currentView="reader"
          currentGuide={null}
        />
      );
      
      expect(screen.getByTestId('guide-library')).toBeInTheDocument();
      expect(screen.queryByTestId('guide-reader')).not.toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should pass currentView and onViewChange to GuideReader', () => {
      render(
        <AppContentView 
          {...defaultProps} 
          currentView="reader"
          currentGuide={mockGuide}
        />
      );
      
      expect(screen.getByText('Current View: reader')).toBeInTheDocument();
      expect(screen.getByText('Go to Library')).toBeInTheDocument();
    });

    it('should handle default case by rendering GuideLibrary', () => {
      // Cast to unknown then to the expected type to simulate an unexpected view value
      const props = {
        ...defaultProps,
        currentView: 'unexpected' as unknown as 'library' | 'reader'
      };
      
      render(<AppContentView {...props} />);
      
      expect(screen.getByTestId('guide-library')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle switching between views', () => {
      const { rerender } = render(<AppContentView {...defaultProps} />);
      
      expect(screen.getByTestId('guide-library')).toBeInTheDocument();
      
      rerender(
        <AppContentView 
          {...defaultProps} 
          currentView="reader"
          currentGuide={mockGuide}
        />
      );
      expect(screen.getByTestId('guide-reader')).toBeInTheDocument();
      
      rerender(
        <AppContentView 
          {...defaultProps} 
          currentView="library"
        />
      );
      expect(screen.getByTestId('guide-library')).toBeInTheDocument();
    });
  });
});