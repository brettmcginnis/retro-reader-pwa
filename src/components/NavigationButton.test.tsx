import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NavigationButton } from './NavigationButton';
import { Search } from 'lucide-react';

describe('NavigationButton', () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render icon and label', () => {
    render(
      <NavigationButton
        icon={<Search className="w-5 h-5" />}
        label="Search"
        onClick={mockOnClick}
      />
    );
    
    expect(screen.getByText('Search')).toBeInTheDocument();
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('should apply title attribute', () => {
    render(
      <NavigationButton
        icon={<Search className="w-5 h-5" />}
        label="Search"
        title="Open search"
        onClick={mockOnClick}
      />
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('title', 'Open search');
  });

  it('should call onClick when clicked', () => {
    render(
      <NavigationButton
        icon={<Search className="w-5 h-5" />}
        label="Search"
        onClick={mockOnClick}
      />
    );
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('should apply active styling when isActive is true', () => {
    render(
      <NavigationButton
        icon={<Search className="w-5 h-5" />}
        label="Search"
        isActive={true}
        onClick={mockOnClick}
      />
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-retro-100');
  });

  it('should not apply active styling when isActive is false', () => {
    render(
      <NavigationButton
        icon={<Search className="w-5 h-5" />}
        label="Search"
        isActive={false}
        onClick={mockOnClick}
      />
    );
    
    const button = screen.getByRole('button');
    expect(button).not.toHaveClass('bg-retro-100');
  });

  it('should be disabled when isDisabled is true', () => {
    render(
      <NavigationButton
        icon={<Search className="w-5 h-5" />}
        label="Search"
        isDisabled={true}
        onClick={mockOnClick}
      />
    );
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should not call onClick when disabled and clicked', () => {
    render(
      <NavigationButton
        icon={<Search className="w-5 h-5" />}
        label="Search"
        isDisabled={true}
        onClick={mockOnClick}
      />
    );
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('should render with correct styling classes', () => {
    render(
      <NavigationButton
        icon={<Search className="w-5 h-5" />}
        label="Search"
        onClick={mockOnClick}
      />
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('flex', 'flex-col', 'sm:flex-row', 'items-center', 'gap-1', 'p-2', 'h-14');
  });

  it('should render label with correct styling', () => {
    render(
      <NavigationButton
        icon={<Search className="w-5 h-5" />}
        label="Search"
        onClick={mockOnClick}
      />
    );
    
    const label = screen.getByText('Search');
    expect(label).toHaveClass('text-xs', 'sm:text-sm');
  });
});