import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ModalHeader } from './ModalHeader';
import { Navigation } from 'lucide-react';

describe('ModalHeader', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render title', () => {
    render(<ModalHeader title="Test Modal" onClose={mockOnClose} />);
    
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
  });

  it('should render title with icon', () => {
    render(
      <ModalHeader 
        title="Navigation" 
        icon={<Navigation className="w-5 h-5" />} 
        onClose={mockOnClose} 
      />
    );
    
    expect(screen.getByText('Navigation')).toBeInTheDocument();
    const header = screen.getByRole('heading');
    expect(header.querySelector('svg')).toBeInTheDocument();
  });

  it('should render close button', () => {
    render(<ModalHeader title="Test Modal" onClose={mockOnClose} />);
    
    const closeButton = screen.getByRole('button');
    expect(closeButton).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    render(<ModalHeader title="Test Modal" onClose={mockOnClose} />);
    
    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should render with correct styles', () => {
    const { container } = render(<ModalHeader title="Test Modal" onClose={mockOnClose} />);
    
    const headerDiv = container.firstChild;
    expect(headerDiv).toHaveClass('flex', 'items-center', 'justify-between', 'mb-4');
  });

  it('should render title with correct styles', () => {
    render(<ModalHeader title="Test Modal" onClose={mockOnClose} />);
    
    const title = screen.getByRole('heading');
    expect(title).toHaveClass('text-lg', 'font-semibold', 'text-retro-900');
  });

  it('should render without icon when not provided', () => {
    render(<ModalHeader title="Test Modal" onClose={mockOnClose} />);
    
    const header = screen.getByRole('heading');
    expect(header.querySelector('svg')).not.toBeInTheDocument();
  });
});