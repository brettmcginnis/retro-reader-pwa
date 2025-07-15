import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { GuideContent } from './GuideContent';
import { Bookmark } from '../stores/useBookmarkStore';

// Mock GuideLineRenderer to avoid dependencies
jest.mock('./GuideLineRenderer', () => ({
  GuideLineRenderer: ({ 
    line, 
    lineNumber, 
    isSelected, 
    isBookmarked,
    isCurrentPosition,
    onClick 
  }: {
    line: string;
    lineNumber: number;
    isSelected: boolean;
    isBookmarked: boolean;
    isCurrentPosition: boolean;
    onClick: (lineNumber: number) => void;
  }) => (
    <div 
      data-testid={`line-${lineNumber}`}
      data-selected={isSelected}
      data-bookmarked={isBookmarked}
      data-current-position={isCurrentPosition}
      onClick={() => onClick(lineNumber)}
    >
      {line}
    </div>
  )
}));

describe('GuideContent', () => {
  const mockBookmarks: Map<number, Bookmark> = new Map([
    [10, {
      id: 'bookmark-1',
      guideId: 'guide-1',
      line: 10,
      title: 'Chapter 1',
      dateCreated: new Date(),
      isCurrentPosition: false
    }],
    [50, {
      id: 'bookmark-2',
      guideId: 'guide-1',
      line: 50,
      title: 'Current Position',
      dateCreated: new Date(),
      isCurrentPosition: true
    }]
  ]);

  const mockLines = Array.from({ length: 100 }, (_, i) => `Line ${i + 1} content`);
  
  const defaultProps = {
    containerRef: React.createRef<HTMLDivElement>(),
    contentRef: React.createRef<HTMLDivElement>(),
    lines: mockLines,
    visibleRange: { start: 0, end: 20 },
    currentLine: 10,
    lineHeight: 21,
    totalLines: 100,
    fontSize: 14,
    zoomLevel: 1,
    searchQuery: '',
    bookmarkedLines: mockBookmarks,
    isLoading: false,
    onScroll: jest.fn(),
    onLineClick: jest.fn(),
    scrollToLine: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render visible lines within range', () => {
      render(<GuideContent {...defaultProps} />);

      // Should render lines 1-20 (indices 0-19)
      expect(screen.getByTestId('line-1')).toBeInTheDocument();
      expect(screen.getByTestId('line-20')).toBeInTheDocument();
      
      // Should not render lines outside visible range
      expect(screen.queryByTestId('line-21')).not.toBeInTheDocument();
    });

    it('should update visible lines when range changes', () => {
      const { rerender } = render(<GuideContent {...defaultProps} />);

      expect(screen.getByTestId('line-1')).toBeInTheDocument();
      expect(screen.queryByTestId('line-30')).not.toBeInTheDocument();

      rerender(<GuideContent {...defaultProps} visibleRange={{ start: 20, end: 40 }} />);

      expect(screen.queryByTestId('line-1')).not.toBeInTheDocument();
      expect(screen.getByTestId('line-30')).toBeInTheDocument();
    });

    it('should mark current line as selected', () => {
      render(<GuideContent {...defaultProps} currentLine={10} />);

      const selectedLine = screen.getByTestId('line-10');
      expect(selectedLine).toHaveAttribute('data-selected', 'true');
      
      const otherLine = screen.getByTestId('line-11');
      expect(otherLine).toHaveAttribute('data-selected', 'false');
    });

    it('should mark bookmarked lines', () => {
      render(<GuideContent {...defaultProps} visibleRange={{ start: 5, end: 15 }} />);

      const bookmarkedLine = screen.getByTestId('line-10');
      expect(bookmarkedLine).toHaveAttribute('data-bookmarked', 'true');
      
      const regularLine = screen.getByTestId('line-11');
      expect(regularLine).toHaveAttribute('data-bookmarked', 'false');
    });

    it('should mark current position bookmark', () => {
      render(<GuideContent {...defaultProps} visibleRange={{ start: 45, end: 55 }} />);

      const currentPositionLine = screen.getByTestId('line-50');
      expect(currentPositionLine).toHaveAttribute('data-current-position', 'true');
    });
  });

  describe('scroll container', () => {
    it('should apply correct styles to container', () => {
      const { container } = render(<GuideContent {...defaultProps} />);
      
      const scrollContainer = container.querySelector('.overflow-auto');
      expect(scrollContainer).toHaveClass('flex-1', 'bg-white', 'dark:bg-retro-900', 'scrollbar-thin', 'pt-14', 'pb-16');
    });

    it('should calculate total height correctly', () => {
      const { container } = render(<GuideContent {...defaultProps} />);
      
      const contentDiv = container.querySelector('.relative');
      expect(contentDiv).toHaveStyle({ height: '2100px' }); // 100 lines * 21px
    });

    it('should apply zoom level', () => {
      const { container } = render(<GuideContent {...defaultProps} zoomLevel={1.5} />);
      
      const contentDiv = container.querySelector('.relative');
      expect(contentDiv).toHaveStyle({ zoom: 1.5 });
    });

    it('should calculate offset for virtual scrolling', () => {
      const { container } = render(<GuideContent {...defaultProps} visibleRange={{ start: 10, end: 30 }} />);
      
      const offsetDiv = container.querySelector('[style*="transform"]');
      expect(offsetDiv).toHaveStyle({ transform: 'translateY(210px)' }); // 10 * 21px
    });

    it('should trigger onScroll when scrolling', () => {
      const { container } = render(<GuideContent {...defaultProps} />);
      
      const scrollContainer = container.querySelector('.overflow-auto')!;
      fireEvent.scroll(scrollContainer);
      
      expect(defaultProps.onScroll).toHaveBeenCalled();
    });
  });

  describe('navigation controls', () => {
    it('should render hidden navigation input', () => {
      render(<GuideContent {...defaultProps} />);
      
      const navControls = screen.getByTestId('test-navigation-controls');
      expect(navControls).toHaveClass('sr-only');
      
      const input = screen.getByLabelText('Go to line') as HTMLInputElement;
      expect(input).toBeInTheDocument();
      expect(input.type).toBe('number');
      expect(input.min).toBe('1');
      expect(input.max).toBe('100');
      expect(input.value).toBe('10');
    });

    it('should navigate on form submission', () => {
      render(<GuideContent {...defaultProps} />);
      
      const input = screen.getByLabelText('Go to line') as HTMLInputElement;
      const form = input.closest('form')!;
      
      fireEvent.change(input, { target: { value: '50' } });
      fireEvent.submit(form);
      
      expect(defaultProps.scrollToLine).toHaveBeenCalledWith(50);
    });

    it('should navigate on input change', async () => {
      render(<GuideContent {...defaultProps} />);
      
      const input = screen.getByLabelText('Go to line');
      
      // Use fireEvent for synchronous behavior
      fireEvent.change(input, { target: { value: '25' } });
      
      expect(defaultProps.scrollToLine).toHaveBeenCalledWith(25);
    });

    it('should validate line number bounds on form submission', () => {
      render(<GuideContent {...defaultProps} />);
      
      const input = screen.getByLabelText('Go to line') as HTMLInputElement;
      const form = input.closest('form')!;
      
      // Try line 0 (too low)
      fireEvent.change(input, { target: { value: '0' } });
      fireEvent.submit(form);
      expect(defaultProps.scrollToLine).not.toHaveBeenCalledWith(0);
      
      // Try line 101 (too high)
      fireEvent.change(input, { target: { value: '101' } });
      fireEvent.submit(form);
      expect(defaultProps.scrollToLine).not.toHaveBeenCalledWith(101);
    });

    it('should validate line number bounds on change', () => {
      render(<GuideContent {...defaultProps} />);
      
      const input = screen.getByLabelText('Go to line');
      
      // Valid line
      fireEvent.change(input, { target: { value: '50' } });
      expect(defaultProps.scrollToLine).toHaveBeenCalledWith(50);
      
      jest.clearAllMocks();
      
      // Invalid line (negative)
      fireEvent.change(input, { target: { value: '-5' } });
      expect(defaultProps.scrollToLine).not.toHaveBeenCalled();
      
      // Invalid line (too high)
      fireEvent.change(input, { target: { value: '200' } });
      expect(defaultProps.scrollToLine).not.toHaveBeenCalled();
    });

    it('should handle non-numeric input', () => {
      render(<GuideContent {...defaultProps} />);
      
      const input = screen.getByLabelText('Go to line');
      
      fireEvent.change(input, { target: { value: 'abc' } });
      expect(defaultProps.scrollToLine).not.toHaveBeenCalled();
    });

    it('should disable input when loading', () => {
      render(<GuideContent {...defaultProps} isLoading={true} />);
      
      const input = screen.getByLabelText('Go to line');
      expect(input).toBeDisabled();
    });
  });

  describe('line interactions', () => {
    it('should handle line clicks', () => {
      render(<GuideContent {...defaultProps} />);
      
      const line = screen.getByTestId('line-5');
      fireEvent.click(line);
      
      expect(defaultProps.onLineClick).toHaveBeenCalledWith(5);
    });

    it('should render lines with correct props', () => {
      render(<GuideContent {...defaultProps} searchQuery="test" />);
      
      // Check that GuideLineRenderer receives correct props
      const line = screen.getByTestId('line-10');
      expect(line).toHaveTextContent('Line 10 content');
    });
  });

  describe('edge cases', () => {
    it('should handle empty lines array', () => {
      render(<GuideContent {...defaultProps} lines={[]} totalLines={0} />);
      
      expect(screen.queryByTestId('line-1')).not.toBeInTheDocument();
    });

    it('should handle visible range beyond lines length', () => {
      render(<GuideContent 
        {...defaultProps} 
        lines={['Line 1', 'Line 2']} 
        totalLines={2}
        visibleRange={{ start: 0, end: 10 }}
      />);
      
      expect(screen.getByTestId('line-1')).toBeInTheDocument();
      expect(screen.getByTestId('line-2')).toBeInTheDocument();
      expect(screen.queryByTestId('line-3')).not.toBeInTheDocument();
    });

    it('should handle refs not being set', () => {
      const props = {
        ...defaultProps,
        containerRef: React.createRef<HTMLDivElement>(),
        contentRef: React.createRef<HTMLDivElement>()
      };
      
      // Should render without errors even if refs are null
      expect(() => render(<GuideContent {...props} />)).not.toThrow();
    });

    it('should handle large zoom levels', () => {
      const { container } = render(<GuideContent {...defaultProps} zoomLevel={3} />);
      
      const contentDiv = container.querySelector('.relative');
      expect(contentDiv).toHaveStyle({ zoom: 3 });
    });

    it('should handle search highlighting', () => {
      render(<GuideContent 
        {...defaultProps} 
        searchQuery="Line 10"
        visibleRange={{ start: 8, end: 12 }}
      />);
      
      // GuideLineRenderer should receive the search query
      const line10 = screen.getByTestId('line-10');
      expect(line10).toBeInTheDocument();
    });
  });

  describe('performance', () => {
    it('should only render visible lines for large datasets', () => {
      const largeLines = Array.from({ length: 10000 }, (_, i) => `Line ${i + 1}`);
      
      render(<GuideContent 
        {...defaultProps}
        lines={largeLines}
        totalLines={10000}
        visibleRange={{ start: 5000, end: 5020 }}
      />);
      
      // Should only render 20 lines
      expect(screen.getByTestId('line-5001')).toBeInTheDocument();
      expect(screen.getByTestId('line-5020')).toBeInTheDocument();
      expect(screen.queryByTestId('line-1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('line-5021')).not.toBeInTheDocument();
    });
  });
});