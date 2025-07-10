import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { OverlayBackdrop } from './OverlayBackdrop';

describe('OverlayBackdrop', () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render backdrop with correct styles', () => {
    const { container } = render(<OverlayBackdrop onClick={mockOnClick} />);
    
    const backdrop = container.firstChild;
    expect(backdrop).toHaveClass('fixed', 'inset-0', 'bg-black/50', 'z-40');
  });

  it('should call onClick when backdrop is clicked', () => {
    const { container } = render(<OverlayBackdrop onClick={mockOnClick} />);
    
    const backdrop = container.firstChild as HTMLElement;
    fireEvent.click(backdrop);
    
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });
});