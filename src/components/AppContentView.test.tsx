import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
      {onViewChange && <button onClick={() => onViewChange('bookmarks')}>Go to Bookmarks</button>}
    </div>
  )
}));

jest.mock('./BookmarkManager', () => ({
  BookmarkManager: ({ guide, onGotoLine, currentView, onViewChange }: { guide: Guide; onGotoLine: (line: number) => void; currentView?: string; onViewChange?: (view: string) => void }) => (
    <div data-testid="bookmark-manager">
      Bookmark Manager: {guide.title}
      <button onClick={() => onGotoLine(10)}>Go to Line 10</button>
      <button onClick={() => onGotoLine(50)}>Go to Line 50</button>
      {currentView && <div>Current View: {currentView}</div>}
      {onViewChange && <button onClick={() => onViewChange('reader')}>Go to Reader</button>}
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
    jest.resetModules();
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
    it('should pass currentView and onViewChange to GuideReader', () => {
      render(
        <AppContentView 
          {...defaultProps} 
          currentView="reader"
          currentGuide={mockGuide}
        />
      );
      
      expect(screen.getByText('Current View: reader')).toBeInTheDocument();
      expect(screen.getByText('Go to Bookmarks')).toBeInTheDocument();
    });

    it('should pass currentView and onViewChange to BookmarkManager', () => {
      render(
        <AppContentView 
          {...defaultProps} 
          currentView="bookmarks"
          currentGuide={mockGuide}
        />
      );
      
      expect(screen.getByText('Current View: bookmarks')).toBeInTheDocument();
      expect(screen.getByText('Go to Reader')).toBeInTheDocument();
    });

    it('should call onViewChange when navigation is triggered from child components', async () => {
      const user = userEvent.setup();
      
      render(
        <AppContentView 
          {...defaultProps} 
          currentView="reader"
          currentGuide={mockGuide}
        />
      );
      
      await user.click(screen.getByText('Go to Bookmarks'));
      expect(defaultProps.onViewChange).toHaveBeenCalledWith('bookmarks');
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