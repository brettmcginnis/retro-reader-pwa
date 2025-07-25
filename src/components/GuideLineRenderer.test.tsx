import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GuideLineRenderer } from './GuideLineRenderer';

describe('GuideLineRenderer', () => {
  const defaultProps = {
    line: 'This is a test line of content',
    lineNumber: 42,
    isSelected: false,
    isBookmarked: false,
    isCurrentPosition: false,
    lineHeight: 24,
    fontSize: 16,
    searchQuery: '',
    onClick: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render line number and content', () => {
    render(<GuideLineRenderer {...defaultProps} />);
    
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('This is a test line of content')).toBeInTheDocument();
  });

  it('should apply selected styling when isSelected is true', () => {
    render(<GuideLineRenderer {...defaultProps} isSelected={true} />);
    
    const lineElement = screen.getByTestId('line-42');
    expect(lineElement).toHaveClass('bg-blue-100', 'dark:bg-blue-900/30');
  });

  it('should apply bookmark styling when isBookmarked is true', () => {
    render(<GuideLineRenderer {...defaultProps} isBookmarked={true} />);
    
    const lineElement = screen.getByTestId('line-42');
    expect(lineElement).toHaveClass('bg-purple-50', 'dark:bg-purple-900/20');
  });

  it('should apply current position styling when isCurrentPosition is true', () => {
    render(<GuideLineRenderer {...defaultProps} isCurrentPosition={true} isBookmarked={true} />);
    
    const lineElement = screen.getByTestId('line-42');
    expect(lineElement).toHaveClass('bg-yellow-100', 'dark:bg-yellow-900/30', 'border-l-4', 'border-yellow-500');
    // Should not have regular bookmark styling
    expect(lineElement).not.toHaveClass('bg-purple-50');
  });

  it('should highlight search query matches', () => {
    render(<GuideLineRenderer {...defaultProps} searchQuery="test" />);
    
    const marks = screen.getAllByText('test');
    expect(marks[0].tagName).toBe('MARK');
  });

  it('should handle click events', async () => {
    const user = userEvent.setup();
    render(<GuideLineRenderer {...defaultProps} />);
    
    const lineElement = screen.getByTestId('line-42');
    
    await user.click(lineElement);
    expect(defaultProps.onClick).toHaveBeenCalledWith(42);
  });

  it('should handle touch click events', async () => {
    const user = userEvent.setup();
    render(<GuideLineRenderer {...defaultProps} />);
    
    const lineElement = screen.getByTestId('line-42');
    
    // Click events work for both mouse and touch in modern browsers
    await user.click(lineElement);
    expect(defaultProps.onClick).toHaveBeenCalledWith(42);
  });

  it('should set correct line height and font size', () => {
    render(<GuideLineRenderer {...defaultProps} lineHeight={32} fontSize={18} />);
    
    const lineElement = screen.getByTestId('line-42');
    expect(lineElement).toHaveStyle({ height: '32px', fontSize: '18px' });
  });

  it('should handle empty line content', () => {
    render(<GuideLineRenderer {...defaultProps} line="" />);
    
    expect(screen.getByText('42')).toBeInTheDocument();
    // The content span should exist but be empty
    const lineElement = screen.getByTestId('line-42');
    const contentSpan = lineElement.querySelector('span:last-child');
    expect(contentSpan?.textContent).toBe('');
  });

  it('should handle case-insensitive search highlighting', () => {
    render(<GuideLineRenderer {...defaultProps} line="Test LINE with TEST" searchQuery="test" />);
    
    const marks = screen.getAllByText(/test/i);
    expect(marks).toHaveLength(2);
    marks.forEach(mark => {
      expect(mark.tagName).toBe('MARK');
    });
  });
});
