import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { GuideSearchBar } from './GuideSearchBar';

describe('GuideSearchBar', () => {
  const mockOnSearch = jest.fn();
  const mockOnJumpToResult = jest.fn();
  
  const defaultProps = {
    searchQuery: '',
    searchResults: [],
    onSearch: mockOnSearch,
    onJumpToResult: mockOnJumpToResult
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render search input with placeholder', () => {
    render(<GuideSearchBar {...defaultProps} />);
    
    const input = screen.getByPlaceholderText('Search in guide...');
    expect(input).toBeInTheDocument();
  });

  it('should display search icon', () => {
    const { container } = render(<GuideSearchBar {...defaultProps} />);
    
    const searchIcon = container.querySelector('svg.lucide-search');
    expect(searchIcon).toBeInTheDocument();
  });

  it('should handle search input changes', () => {
    render(<GuideSearchBar {...defaultProps} />);
    
    const input = screen.getByPlaceholderText('Search in guide...');
    fireEvent.change(input, { target: { value: 'test query' } });
    
    expect(mockOnSearch).toHaveBeenCalledWith('test query');
  });

  it('should display clear button when search query exists', () => {
    const props = { ...defaultProps, searchQuery: 'test' };
    render(<GuideSearchBar {...props} />);
    
    const clearButton = screen.getByLabelText('Clear search');
    expect(clearButton).toBeInTheDocument();
  });

  it('should not display clear button when search query is empty', () => {
    render(<GuideSearchBar {...defaultProps} />);
    
    const clearButton = screen.queryByLabelText('Clear search');
    expect(clearButton).not.toBeInTheDocument();
  });

  it('should clear search when clear button is clicked', () => {
    const props = { ...defaultProps, searchQuery: 'test' };
    render(<GuideSearchBar {...props} />);
    
    const clearButton = screen.getByLabelText('Clear search');
    fireEvent.click(clearButton);
    
    expect(mockOnSearch).toHaveBeenCalledWith('');
  });

  it('should display search results when available', () => {
    const props = {
      ...defaultProps,
      searchQuery: 'test',
      searchResults: [
        { line: 10, content: 'This is a test line' },
        { line: 25, content: 'Another test line' }
      ]
    };
    render(<GuideSearchBar {...props} />);
    
    expect(screen.getByText('Found 2 results')).toBeInTheDocument();
    expect(screen.getByText('Line 10:')).toBeInTheDocument();
    expect(screen.getByText('This is a test line')).toBeInTheDocument();
    expect(screen.getByText('Line 25:')).toBeInTheDocument();
    expect(screen.getByText('Another test line')).toBeInTheDocument();
  });

  it('should display singular result text for one result', () => {
    const props = {
      ...defaultProps,
      searchQuery: 'test',
      searchResults: [
        { line: 10, content: 'This is a test line' }
      ]
    };
    render(<GuideSearchBar {...props} />);
    
    expect(screen.getByText('Found 1 result')).toBeInTheDocument();
  });

  it('should handle clicking on search result', () => {
    const props = {
      ...defaultProps,
      searchQuery: 'test',
      searchResults: [
        { line: 10, content: 'This is a test line' },
        { line: 25, content: 'Another test line' }
      ]
    };
    render(<GuideSearchBar {...props} />);
    
    const firstResult = screen.getByText('Line 10:').closest('button');
    fireEvent.click(firstResult!);
    
    expect(mockOnJumpToResult).toHaveBeenCalledWith(10);
  });

  it('should display maximum 10 results', () => {
    const results = Array.from({ length: 15 }, (_, i) => ({
      line: i + 1,
      content: `Test line ${i + 1}`
    }));
    
    const props = {
      ...defaultProps,
      searchQuery: 'test',
      searchResults: results
    };
    render(<GuideSearchBar {...props} />);
    
    // Should show first 10 results
    expect(screen.getByText('Line 1:')).toBeInTheDocument();
    expect(screen.getByText('Line 10:')).toBeInTheDocument();
    
    // Should not show 11th result
    expect(screen.queryByText('Line 11:')).not.toBeInTheDocument();
    
    // Should show overflow message
    expect(screen.getByText('... and 5 more results')).toBeInTheDocument();
  });

  it('should display no results message when search has no matches', () => {
    const props = {
      ...defaultProps,
      searchQuery: 'nonexistent',
      searchResults: []
    };
    render(<GuideSearchBar {...props} />);
    
    expect(screen.getByText(/No results found for/)).toBeInTheDocument();
    expect(screen.getByText(/nonexistent/)).toBeInTheDocument();
  });

  it('should not display results section when search query is empty', () => {
    const props = {
      ...defaultProps,
      searchQuery: '',
      searchResults: [
        { line: 10, content: 'This is a test line' }
      ]
    };
    render(<GuideSearchBar {...props} />);
    
    expect(screen.queryByText('Found 1 result')).not.toBeInTheDocument();
    expect(screen.queryByText('No results found')).not.toBeInTheDocument();
  });

  it('should have correct value in search input', () => {
    const props = { ...defaultProps, searchQuery: 'test query' };
    render(<GuideSearchBar {...props} />);
    
    const input = screen.getByPlaceholderText('Search in guide...') as HTMLInputElement;
    expect(input.value).toBe('test query');
  });

  it('should render with correct CSS classes for dark mode', () => {
    const props = {
      ...defaultProps,
      searchQuery: 'test',
      searchResults: [
        { line: 10, content: 'Test line' }
      ]
    };
    const { container } = render(<GuideSearchBar {...props} />);
    
    const input = screen.getByPlaceholderText('Search in guide...');
    expect(input).toHaveClass('dark:bg-retro-800', 'dark:text-retro-100');
    
    const resultsContainer = container.querySelector('.bg-retro-50.dark\\:bg-retro-800');
    expect(resultsContainer).toBeInTheDocument();
  });

  it('should handle multiple search results with same line number', () => {
    const props = {
      ...defaultProps,
      searchQuery: 'test',
      searchResults: [
        { line: 10, content: 'First match on line 10' },
        { line: 10, content: 'Second match on line 10' },
        { line: 20, content: 'Match on line 20' }
      ]
    };
    render(<GuideSearchBar {...props} />);
    
    expect(screen.getByText('Found 3 results')).toBeInTheDocument();
    expect(screen.getAllByText('Line 10:').length).toBe(2);
    expect(screen.getByText('First match on line 10')).toBeInTheDocument();
    expect(screen.getByText('Second match on line 10')).toBeInTheDocument();
  });
});