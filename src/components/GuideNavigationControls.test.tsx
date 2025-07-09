import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { GuideNavigationControls } from './GuideNavigationControls';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: string;
  size?: string;
}

// Mock Button component
jest.mock('./Button', () => ({
  Button: ({ children, onClick, disabled, variant, size }: ButtonProps) => (
    <button onClick={onClick} disabled={disabled} data-variant={variant} data-size={size}>
      {children}
    </button>
  )
}));

describe('GuideNavigationControls', () => {
  const mockOnLineChange = jest.fn();
  const mockOnJumpToCurrentPosition = jest.fn();
  const mockOnSetAsCurrentPosition = jest.fn();
  const mockOnFontSizeChange = jest.fn();
  const mockOnZoomChange = jest.fn();
  
  const defaultProps = {
    currentLine: 50,
    totalLines: 100,
    isLoading: false,
    onLineChange: mockOnLineChange,
    onJumpToCurrentPosition: mockOnJumpToCurrentPosition,
    onSetAsCurrentPosition: mockOnSetAsCurrentPosition,
    onFontSizeChange: mockOnFontSizeChange,
    onZoomChange: mockOnZoomChange
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render navigation controls', () => {
    render(<GuideNavigationControls {...defaultProps} />);
    
    expect(screen.getByText(/Line 50 of 100/)).toBeInTheDocument();
    expect(screen.getByText('Go to line:')).toBeInTheDocument();
    expect(screen.getByRole('spinbutton')).toHaveValue(50);
  });

  it('should handle line input changes', () => {
    render(<GuideNavigationControls {...defaultProps} />);
    
    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '75' } });
    
    expect(mockOnLineChange).toHaveBeenCalledWith(75);
  });

  it('should not change line for invalid input', () => {
    render(<GuideNavigationControls {...defaultProps} />);
    
    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '200' } }); // Beyond total lines
    
    expect(mockOnLineChange).not.toHaveBeenCalled();
  });

  it('should handle form submission', () => {
    const { container } = render(<GuideNavigationControls {...defaultProps} />);
    
    const form = container.querySelector('form')!;
    const input = screen.getByRole('spinbutton');
    
    fireEvent.change(input, { target: { value: '25' } });
    fireEvent.submit(form);
    
    expect(mockOnLineChange).toHaveBeenCalledWith(25);
  });

  it('should disable controls when loading', () => {
    render(<GuideNavigationControls {...defaultProps} isLoading={true} />);
    
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });

  it('should handle jump to current position', () => {
    render(<GuideNavigationControls {...defaultProps} />);
    
    // Find button with Navigation icon
    const buttons = screen.getAllByRole('button');
    const jumpButton = buttons.find(btn => btn.textContent?.includes('Current Position') || btn.textContent?.includes('Position'));
    fireEvent.click(jumpButton!);
    
    expect(mockOnJumpToCurrentPosition).toHaveBeenCalled();
  });

  it('should render with correct default props', () => {
    const minimalProps = {
      currentLine: 1,
      totalLines: 50,
      isLoading: false,
      onLineChange: mockOnLineChange,
      onJumpToCurrentPosition: mockOnJumpToCurrentPosition,
      onSetAsCurrentPosition: mockOnSetAsCurrentPosition
    };
    
    render(<GuideNavigationControls {...minimalProps} />);
    
    expect(screen.getByText(/Line 1 of 50/)).toBeInTheDocument();
  });


  it('should handle zoom controls when provided', () => {
    render(<GuideNavigationControls {...defaultProps} zoomLevel={1.5} />);
    
    // Check that zoom controls are rendered
    expect(screen.getByText('150%')).toBeInTheDocument();
  });
});