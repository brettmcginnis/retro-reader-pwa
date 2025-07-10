import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { OverlayHeader } from './OverlayHeader';

describe('OverlayHeader', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render title', () => {
    render(<OverlayHeader title="Test Header" onClose={mockOnClose} />);
    
    expect(screen.getByText('Test Header')).toBeInTheDocument();
  });

  it('should render close button', () => {
    render(<OverlayHeader title="Test Header" onClose={mockOnClose} />);
    
    const closeButton = screen.getByRole('button');
    expect(closeButton).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    render(<OverlayHeader title="Test Header" onClose={mockOnClose} />);
    
    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should render with correct styles', () => {
    const { container } = render(<OverlayHeader title="Test Header" onClose={mockOnClose} />);
    
    const header = container.firstChild;
    expect(header).toHaveClass('flex', 'items-center', 'justify-between', 'p-4', 'border-b');
  });
});