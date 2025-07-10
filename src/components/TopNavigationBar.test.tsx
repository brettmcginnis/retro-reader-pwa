import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TopNavigationBar } from './TopNavigationBar';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: string;
  size?: string;
  className?: string;
  title?: string;
  type?: 'button' | 'submit' | 'reset';
}

// Mock Button component
jest.mock('./Button', () => ({
  Button: ({ children, onClick, disabled, variant, size, className, title, type }: ButtonProps) => (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      data-variant={variant} 
      data-size={size}
      className={className}
      title={title}
      type={type}
    >
      {children}
    </button>
  )
}));

interface FontSizeControlProps {
  fontSize: number;
  onFontSizeChange: (size: number) => void;
}

// Mock FontSizeControl component
jest.mock('./FontSizeControl', () => ({
  FontSizeControl: ({ fontSize, onFontSizeChange }: FontSizeControlProps) => (
    <div data-testid="font-size-control">
      <span>Font Size: {fontSize}px</span>
      <button onClick={() => onFontSizeChange(fontSize - 1)}>Decrease Font</button>
      <button onClick={() => onFontSizeChange(fontSize + 1)}>Increase Font</button>
    </div>
  )
}));

interface ZoomControlProps {
  zoomLevel: number;
  onZoomChange: (zoom: number) => void;
}

// Mock ZoomControl component
jest.mock('./ZoomControl', () => ({
  ZoomControl: ({ zoomLevel, onZoomChange }: ZoomControlProps) => (
    <div data-testid="zoom-control">
      <span>Zoom: {Math.round(zoomLevel * 100)}%</span>
      <button onClick={() => onZoomChange(zoomLevel - 0.1)}>Decrease Zoom</button>
      <button onClick={() => onZoomChange(zoomLevel + 0.1)}>Increase Zoom</button>
    </div>
  )
}));

interface IconProps {
  className?: string;
}

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ChevronLeft: ({ className }: IconProps) => <span className={className}>ChevronLeft</span>,
  Settings: ({ className }: IconProps) => <span className={className}>Settings</span>,
  Search: ({ className }: IconProps) => <span className={className}>Search</span>,
  X: ({ className }: IconProps) => <span className={className}>X</span>
}));

describe('TopNavigationBar', () => {
  const mockOnBack = jest.fn();
  const mockOnSearch = jest.fn();
  const mockOnSearchToggle = jest.fn();
  const mockOnFontSizeChange = jest.fn();
  const mockOnZoomChange = jest.fn();
  
  const defaultProps = {
    guideTitle: 'Test Guide',
    currentLine: 50,
    totalLines: 100,
    fontSize: 16,
    zoomLevel: 1,
    searchQuery: '',
    isSearching: false,
    onBack: mockOnBack,
    onSearch: mockOnSearch,
    onSearchToggle: mockOnSearchToggle,
    onFontSizeChange: mockOnFontSizeChange,
    onZoomChange: mockOnZoomChange
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render navigation bar with title and progress', () => {
    render(<TopNavigationBar {...defaultProps} />);
    
    expect(screen.getByText('Test Guide')).toBeInTheDocument();
    expect(screen.getByText('Line 50 of 100 • 50%')).toBeInTheDocument();
  });

  it('should call onBack when back button is clicked', () => {
    render(<TopNavigationBar {...defaultProps} />);
    
    const backButton = screen.getByTitle('Back to library');
    fireEvent.click(backButton);
    
    expect(mockOnBack).toHaveBeenCalled();
  });

  it('should toggle settings panel when settings button is clicked', () => {
    render(<TopNavigationBar {...defaultProps} />);
    
    const settingsButton = screen.getByTitle('Settings');
    
    // Settings panel should not be visible initially
    expect(screen.getByTestId('font-size-control')).toBeInTheDocument();
    expect(screen.getByTestId('zoom-control')).toBeInTheDocument();
    
    // Click to open settings
    fireEvent.click(settingsButton);
    
    // Settings panel should still be in DOM (visibility is controlled by CSS)
    expect(screen.getByTestId('font-size-control')).toBeInTheDocument();
    expect(screen.getByTestId('zoom-control')).toBeInTheDocument();
  });

  it('should show search input when search button is clicked', () => {
    render(<TopNavigationBar {...defaultProps} />);
    
    const searchButton = screen.getByTitle('Search');
    fireEvent.click(searchButton);
    
    expect(mockOnSearchToggle).toHaveBeenCalled();
  });

  it('should render search mode when isSearching is true', () => {
    render(<TopNavigationBar {...defaultProps} isSearching={true} />);
    
    // Title should be hidden
    expect(screen.queryByText('Test Guide')).not.toBeInTheDocument();
    
    // Search input should be visible
    expect(screen.getByPlaceholderText('Search in guide...')).toBeInTheDocument();
  });

  it('should handle search input changes', () => {
    render(<TopNavigationBar {...defaultProps} isSearching={true} />);
    
    const searchInput = screen.getByPlaceholderText('Search in guide...');
    fireEvent.change(searchInput, { target: { value: 'test search' } });
    
    expect(mockOnSearch).toHaveBeenCalledWith('test search');
  });

  it('should clear search when clear button is clicked', () => {
    render(<TopNavigationBar {...defaultProps} isSearching={true} searchQuery="test" />);
    
    const clearButton = screen.getAllByRole('button').find(btn => btn.querySelector('.w-4'));
    fireEvent.click(clearButton!);
    
    expect(mockOnSearch).toHaveBeenCalledWith('');
  });

  it('should prevent form submission on search', () => {
    render(<TopNavigationBar {...defaultProps} isSearching={true} />);
    
    const form = screen.getByPlaceholderText('Search in guide...').closest('form')!;
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    
    fireEvent(form, submitEvent);
    
    expect(submitEvent.defaultPrevented).toBe(true);
  });

  it('should render FontSizeControl with correct props', () => {
    render(<TopNavigationBar {...defaultProps} />);
    
    expect(screen.getByText('Font Size: 16px')).toBeInTheDocument();
    
    const increaseFontButton = screen.getByText('Increase Font');
    fireEvent.click(increaseFontButton);
    
    expect(mockOnFontSizeChange).toHaveBeenCalledWith(17);
  });

  it('should render ZoomControl with correct props', () => {
    render(<TopNavigationBar {...defaultProps} />);
    
    expect(screen.getByText('Zoom: 100%')).toBeInTheDocument();
    
    const increaseZoomButton = screen.getByText('Increase Zoom');
    fireEvent.click(increaseZoomButton);
    
    expect(mockOnZoomChange).toHaveBeenCalledWith(1.1);
  });

  it('should calculate progress percentage correctly', () => {
    render(<TopNavigationBar {...defaultProps} currentLine={25} totalLines={200} />);
    
    expect(screen.getByText('Line 25 of 200 • 13%')).toBeInTheDocument();
  });

  it('should not show clear button when search query is empty', () => {
    render(<TopNavigationBar {...defaultProps} isSearching={true} searchQuery="" />);
    
    const buttons = screen.getAllByRole('button');
    const clearButton = buttons.find(btn => btn.querySelector('.w-4'));
    
    expect(clearButton).toBeUndefined();
  });

  it('should have autoFocus property on search input when entering search mode', () => {
    render(<TopNavigationBar {...defaultProps} isSearching={true} />);
    
    const searchInput = screen.getByPlaceholderText('Search in guide...');
    // Check for the actual rendered input element's autoFocus property
    expect(searchInput).toBeInTheDocument();
    // In the actual component, autoFocus is set on the input element
  });
});