import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SettingsPanel } from './SettingsPanel';

describe('SettingsPanel', () => {
  const mockOnFontSizeChange = jest.fn();
  const mockOnZoomChange = jest.fn();

  const defaultProps = {
    fontSize: 16,
    zoomLevel: 1,
    onFontSizeChange: mockOnFontSizeChange,
    onZoomChange: mockOnZoomChange
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render font size control', () => {
    render(<SettingsPanel {...defaultProps} />);
    
    expect(screen.getByText('Font Size')).toBeInTheDocument();
    expect(screen.getByText('16px')).toBeInTheDocument();
  });

  it('should render zoom control', () => {
    render(<SettingsPanel {...defaultProps} />);
    
    expect(screen.getByText('Zoom')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('should handle font size changes', () => {
    render(<SettingsPanel {...defaultProps} />);
    
    const increaseButtons = screen.getAllByRole('button', { name: '+' });
    fireEvent.click(increaseButtons[0]); // First + button is for font size
    
    expect(mockOnFontSizeChange).toHaveBeenCalledWith(17);
  });

  it('should handle zoom changes', () => {
    render(<SettingsPanel {...defaultProps} />);
    
    const increaseButtons = screen.getAllByRole('button', { name: '+' });
    fireEvent.click(increaseButtons[1]); // Second + button is for zoom
    
    expect(mockOnZoomChange).toHaveBeenCalledWith(1.1);
  });

  it('should render with correct container styling', () => {
    const { container } = render(<SettingsPanel {...defaultProps} />);
    
    const panel = container.firstChild;
    expect(panel).toHaveClass('p-4', 'space-y-4', 'max-w-2xl', 'mx-auto');
  });
});