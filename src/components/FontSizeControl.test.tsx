import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FontSizeControl } from './FontSizeControl';

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

describe('FontSizeControl', () => {
  const mockOnFontSizeChange = jest.fn();
  
  const defaultProps = {
    fontSize: 16,
    onFontSizeChange: mockOnFontSizeChange
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render font size control with current size', () => {
    render(<FontSizeControl {...defaultProps} />);
    
    expect(screen.getByText('Font Size')).toBeInTheDocument();
    expect(screen.getByText('16px')).toBeInTheDocument();
  });

  it('should render decrease button', () => {
    render(<FontSizeControl {...defaultProps} />);
    
    const decreaseButton = screen.getAllByRole('button')[0];
    expect(decreaseButton).toBeInTheDocument();
    expect(screen.getByText('−')).toBeInTheDocument();
  });

  it('should render increase button', () => {
    render(<FontSizeControl {...defaultProps} />);
    
    const increaseButton = screen.getAllByRole('button')[1];
    expect(increaseButton).toBeInTheDocument();
    expect(screen.getByText('+')).toBeInTheDocument();
  });

  it('should call onFontSizeChange with decreased value when minus button is clicked', () => {
    render(<FontSizeControl {...defaultProps} />);
    
    const decreaseButton = screen.getAllByRole('button')[0];
    fireEvent.click(decreaseButton);
    
    expect(mockOnFontSizeChange).toHaveBeenCalledWith(15);
  });

  it('should call onFontSizeChange with increased value when plus button is clicked', () => {
    render(<FontSizeControl {...defaultProps} />);
    
    const increaseButton = screen.getAllByRole('button')[1];
    fireEvent.click(increaseButton);
    
    expect(mockOnFontSizeChange).toHaveBeenCalledWith(17);
  });

  it('should disable decrease button at minimum font size', () => {
    render(<FontSizeControl {...defaultProps} fontSize={10} minSize={10} />);
    
    const decreaseButton = screen.getAllByRole('button')[0];
    expect(decreaseButton).toBeDisabled();
  });

  it('should disable increase button at maximum font size', () => {
    render(<FontSizeControl {...defaultProps} fontSize={24} maxSize={24} />);
    
    const increaseButton = screen.getAllByRole('button')[1];
    expect(increaseButton).toBeDisabled();
  });

  it('should use custom min and max sizes when provided', () => {
    render(
      <FontSizeControl 
        {...defaultProps} 
        fontSize={12} 
        minSize={12} 
        maxSize={20} 
      />
    );
    
    const decreaseButton = screen.getAllByRole('button')[0];
    const increaseButton = screen.getAllByRole('button')[1];
    
    expect(decreaseButton).toBeDisabled();
    expect(increaseButton).not.toBeDisabled();
  });

  it('should not disable buttons when font size is between min and max', () => {
    render(<FontSizeControl {...defaultProps} fontSize={16} />);
    
    const decreaseButton = screen.getAllByRole('button')[0];
    const increaseButton = screen.getAllByRole('button')[1];
    
    expect(decreaseButton).not.toBeDisabled();
    expect(increaseButton).not.toBeDisabled();
  });
});