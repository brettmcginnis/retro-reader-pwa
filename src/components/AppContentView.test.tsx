import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppContentView } from './AppContentView';
import { Guide } from '../types';

// Mock the child components
jest.mock('./GuideLibrary', () => ({
  GuideLibrary: () => <div data-testid="guide-library">Guide Library</div>
}));

jest.mock('./GuideReader', () => ({
  GuideReader: ({ guide }: { guide: Guide }) => (
    <div data-testid="guide-reader">Guide Reader: {guide.title}</div>
  )
}));

jest.mock('./BookmarkManager', () => ({
  BookmarkManager: ({ guide, onGotoLine }: { guide: Guide; onGotoLine: (line: number) => void }) => (
    <div data-testid="bookmark-manager">
      Bookmark Manager: {guide.title}
      <button onClick={() => onGotoLine(10)}>Go to Line 10</button>
      <button onClick={() => onGotoLine(50)}>Go to Line 50</button>
    </div>
  )
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
    onViewChange: jest.fn(),
    onNavigateToLine: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('View Rendering', () => {
    it('should render GuideLibrary when currentView is library', () => {
      render(<AppContentView {...defaultProps} />);
      
      expect(screen.getByTestId('guide-library')).toBeInTheDocument();
      expect(screen.queryByTestId('guide-reader')).not.toBeInTheDocument();
      expect(screen.queryByTestId('bookmark-manager')).not.toBeInTheDocument();
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

    it('should render BookmarkManager when currentView is bookmarks', () => {
      render(
        <AppContentView 
          {...defaultProps} 
          currentView="bookmarks"
          currentGuide={mockGuide}
        />
      );
      
      expect(screen.getByTestId('bookmark-manager')).toBeInTheDocument();
      expect(screen.getByText('Bookmark Manager: Test Guide')).toBeInTheDocument();
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
      
      expect(screen.getByText('Loading guide...')).toBeInTheDocument();
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
    it('should show navigation when not in library view', () => {
      render(
        <AppContentView 
          {...defaultProps} 
          currentView="reader"
          currentGuide={mockGuide}
        />
      );
      
      expect(screen.getByText('← Library')).toBeInTheDocument();
      expect(screen.getByText('Bookmarks')).toBeInTheDocument();
    });

    it('should not show navigation in library view', () => {
      render(<AppContentView {...defaultProps} />);
      
      expect(screen.queryByText('← Library')).not.toBeInTheDocument();
      expect(screen.queryByText('Bookmarks')).not.toBeInTheDocument();
    });

    it('should call onBackToLibrary when Library button is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <AppContentView 
          {...defaultProps} 
          currentView="reader"
          currentGuide={mockGuide}
        />
      );
      
      await user.click(screen.getByText('← Library'));
      expect(defaultProps.onBackToLibrary).toHaveBeenCalledTimes(1);
    });

    it('should call onViewChange when navigation buttons are clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <AppContentView 
          {...defaultProps} 
          currentView="reader"
          currentGuide={mockGuide}
        />
      );
      
      await user.click(screen.getByText('Bookmarks'));
      expect(defaultProps.onViewChange).toHaveBeenCalledWith('bookmarks');
    });

    it('should show correct navigation buttons based on current view', async () => {
      const { rerender } = render(
        <AppContentView 
          {...defaultProps} 
          currentView="reader"
          currentGuide={mockGuide}
        />
      );
      
      expect(screen.getByText('Bookmarks')).toBeInTheDocument();
      expect(screen.queryByText('Read Guide')).not.toBeInTheDocument();
      
      rerender(
        <AppContentView 
          {...defaultProps} 
          currentView="bookmarks"
          currentGuide={mockGuide}
        />
      );
      
      expect(screen.getByText('Read Guide')).toBeInTheDocument();
      expect(screen.queryByText('Bookmarks')).not.toBeInTheDocument();
    });
  });

  describe('Bookmark Navigation', () => {
    it('should pass onNavigateToLine handler to BookmarkManager', async () => {
      const user = userEvent.setup();
      
      render(
        <AppContentView 
          {...defaultProps} 
          currentView="bookmarks"
          currentGuide={mockGuide}
        />
      );
      
      await user.click(screen.getByText('Go to Line 10'));
      expect(defaultProps.onNavigateToLine).toHaveBeenCalledWith(10);
      
      await user.click(screen.getByText('Go to Line 50'));
      expect(defaultProps.onNavigateToLine).toHaveBeenCalledWith(50);
    });

    it('should handle navigation correctly through handleGotoLine', async () => {
      const user = userEvent.setup();
      const onNavigateToLine = jest.fn();
      
      render(
        <AppContentView 
          {...defaultProps}
          onNavigateToLine={onNavigateToLine}
          currentView="bookmarks"
          currentGuide={mockGuide}
        />
      );
      
      await user.click(screen.getByText('Go to Line 10'));
      expect(onNavigateToLine).toHaveBeenCalledWith(10);
    });
  });

  describe('Edge Cases', () => {
    it('should handle switching between all views', () => {
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
          currentView="bookmarks"
          currentGuide={mockGuide}
        />
      );
      expect(screen.getByTestId('bookmark-manager')).toBeInTheDocument();
    });

    it('should handle missing guide in bookmarks view', () => {
      render(
        <AppContentView 
          {...defaultProps} 
          currentView="bookmarks"
          currentGuide={null}
        />
      );
      
      expect(screen.getByTestId('guide-library')).toBeInTheDocument();
      expect(screen.queryByTestId('bookmark-manager')).not.toBeInTheDocument();
    });
  });
});