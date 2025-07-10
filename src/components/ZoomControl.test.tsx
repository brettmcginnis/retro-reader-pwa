import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ZoomControl } from './ZoomControl';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: string;
  size?: string;
  className?: string;
}

// Mock Button component
jest.mock('./Button', () => ({
  Button: ({ children, onClick, disabled, variant, size, className }: ButtonProps) => (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      data-variant={variant} 
      data-size={size}
      className={className}
    >
      {children}
    </button>
  )
}));

describe('ZoomControl', () => {
  const mockOnZoomChange = jest.fn();
  
  const defaultProps = {
    zoomLevel: 1,
    onZoomChange: mockOnZoomChange
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render zoom control with current zoom level', () => {
    render(<ZoomControl {...defaultProps} />);
    
    expect(screen.getByText('Zoom')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('should display current zoom level as percentage', () => {
    render(<ZoomControl {...defaultProps} zoomLevel={1.5} />);
    
    expect(screen.getByText('150%')).toBeInTheDocument();
  });

  it('should round zoom percentage to nearest integer', () => {
    render(<ZoomControl {...defaultProps} zoomLevel={1.256} />);
    
    expect(screen.getByText('126%')).toBeInTheDocument();
  });

  it('should render decrease button', () => {
    render(<ZoomControl {...defaultProps} />);
    
    const decreaseButton = screen.getAllByRole('button')[0];
    expect(decreaseButton).toBeInTheDocument();
    expect(screen.getByText('−')).toBeInTheDocument();
  });

  it('should render increase button', () => {
    render(<ZoomControl {...defaultProps} />);
    
    const increaseButton = screen.getAllByRole('button')[1];
    expect(increaseButton).toBeInTheDocument();
    expect(screen.getByText('+')).toBeInTheDocument();
  });

  it('should render reset button', () => {
    render(<ZoomControl {...defaultProps} zoomLevel={1.5} />);
    
    const resetButton = screen.getByText('Reset');
    expect(resetButton).toBeInTheDocument();
  });

  it('should call onZoomChange with decreased value when minus button is clicked', () => {
    render(<ZoomControl {...defaultProps} />);
    
    const decreaseButton = screen.getAllByRole('button')[0];
    fireEvent.click(decreaseButton);
    
    expect(mockOnZoomChange).toHaveBeenCalledWith(0.9);
  });

  it('should call onZoomChange with increased value when plus button is clicked', () => {
    render(<ZoomControl {...defaultProps} />);
    
    const increaseButton = screen.getAllByRole('button')[1];
    fireEvent.click(increaseButton);
    
    expect(mockOnZoomChange).toHaveBeenCalledWith(1.1);
  });

  it('should call onZoomChange with 1 when reset button is clicked', () => {
    render(<ZoomControl {...defaultProps} zoomLevel={1.5} />);
    
    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);
    
    expect(mockOnZoomChange).toHaveBeenCalledWith(1);
  });

  it('should disable decrease button at minimum zoom level', () => {
    render(<ZoomControl {...defaultProps} zoomLevel={0.5} />);
    
    const decreaseButton = screen.getAllByRole('button')[0];
    expect(decreaseButton).toBeDisabled();
  });

  it('should disable increase button at maximum zoom level', () => {
    render(<ZoomControl {...defaultProps} zoomLevel={2} />);
    
    const increaseButton = screen.getAllByRole('button')[1];
    expect(increaseButton).toBeDisabled();
  });

  it('should disable reset button when zoom level is 1', () => {
    render(<ZoomControl {...defaultProps} zoomLevel={1} />);
    
    const resetButton = screen.getByText('Reset');
    expect(resetButton).toBeDisabled();
  });

  it('should not disable reset button when zoom level is not 1', () => {
    render(<ZoomControl {...defaultProps} zoomLevel={1.5} />);
    
    const resetButton = screen.getByText('Reset');
    expect(resetButton).not.toBeDisabled();
  });

  it('should use custom zoom step when provided', () => {
    render(<ZoomControl {...defaultProps} zoomStep={0.25} />);
    
    const decreaseButton = screen.getAllByRole('button')[0];
    fireEvent.click(decreaseButton);
    
    expect(mockOnZoomChange).toHaveBeenCalledWith(0.75);
  });

  it('should use custom min and max zoom when provided', () => {
    render(
      <ZoomControl 
        {...defaultProps} 
        zoomLevel={0.8} 
        minZoom={0.8} 
        maxZoom={1.5} 
      />
    );
    
    const decreaseButton = screen.getAllByRole('button')[0];
    const increaseButton = screen.getAllByRole('button')[1];
    
    expect(decreaseButton).toBeDisabled();
    expect(increaseButton).not.toBeDisabled();
  });

  it('should display correct percentage for various zoom levels', () => {
    const { rerender } = render(<ZoomControl {...defaultProps} zoomLevel={1.5} />);
    expect(screen.getByText('150%')).toBeInTheDocument();
    
    rerender(<ZoomControl {...defaultProps} zoomLevel={0.75} />);
    expect(screen.getByText('75%')).toBeInTheDocument();
    
    rerender(<ZoomControl {...defaultProps} zoomLevel={2} />);
    expect(screen.getByText('200%')).toBeInTheDocument();
  });

  it('should round zoom percentage correctly', () => {
    render(<ZoomControl {...defaultProps} zoomLevel={1.456} />);
    expect(screen.getByText('146%')).toBeInTheDocument();
  });
});