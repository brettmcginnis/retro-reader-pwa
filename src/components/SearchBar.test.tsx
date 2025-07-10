import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SearchBar } from './SearchBar';

describe('SearchBar', () => {
  const mockOnSearch = jest.fn();
  const mockOnClose = jest.fn();

  const defaultProps = {
    searchQuery: '',
    onSearch: mockOnSearch,
    onClose: mockOnClose
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render search input', () => {
    render(<SearchBar {...defaultProps} />);
    
    const input = screen.getByPlaceholderText('Search in guide...');
    expect(input).toBeInTheDocument();
  });

  it('should have autofocus on input', () => {
    render(<SearchBar {...defaultProps} />);
    
    const input = screen.getByPlaceholderText('Search in guide...');
    expect(input).toHaveFocus();
  });

  it('should display search query value', () => {
    render(<SearchBar {...defaultProps} searchQuery="test query" />);
    
    const input = screen.getByPlaceholderText('Search in guide...');
    expect(input).toHaveValue('test query');
  });

  it('should call onSearch when input changes', () => {
    render(<SearchBar {...defaultProps} />);
    
    const input = screen.getByPlaceholderText('Search in guide...');
    fireEvent.change(input, { target: { value: 'new search' } });
    
    expect(mockOnSearch).toHaveBeenCalledWith('new search');
  });

  it('should show clear button when search query exists', () => {
    render(<SearchBar {...defaultProps} searchQuery="test" />);
    
    const clearButtons = screen.getAllByRole('button');
    // Should have 2 buttons: clear (in input) and close
    expect(clearButtons).toHaveLength(2);
  });

  it('should not show clear button when search query is empty', () => {
    render(<SearchBar {...defaultProps} />);
    
    const buttons = screen.getAllByRole('button');
    // Should have only 1 button: close
    expect(buttons).toHaveLength(1);
  });

  it('should call onSearch with empty string when clear button is clicked', () => {
    render(<SearchBar {...defaultProps} searchQuery="test" />);
    
    const clearButtons = screen.getAllByRole('button');
    const clearButton = clearButtons[0]; // First button is the clear button
    fireEvent.click(clearButton);
    
    expect(mockOnSearch).toHaveBeenCalledWith('');
  });

  it('should call onClose when close button is clicked', () => {
    render(<SearchBar {...defaultProps} />);
    
    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should prevent form submission', () => {
    const { container } = render(<SearchBar {...defaultProps} />);
    
    const form = container.querySelector('form');
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    fireEvent(form!, submitEvent);
    
    expect(submitEvent.defaultPrevented).toBe(true);
  });

  it('should render with correct input styling', () => {
    render(<SearchBar {...defaultProps} />);
    
    const input = screen.getByPlaceholderText('Search in guide...');
    expect(input).toHaveClass('w-full', 'pl-3', 'pr-8', 'py-1.5', 'text-sm');
  });
});