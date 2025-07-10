import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CurrentPositionBookmark } from './CurrentPositionBookmark';
import { Bookmark } from '../types';

describe('CurrentPositionBookmark', () => {
  const mockOnGotoLine = jest.fn();
  
  const mockBookmark: Bookmark = {
    id: '1',
    guideId: 'guide1',
    title: 'Test Bookmark',
    line: 100,
    note: '',
    isCurrentPosition: true,
    dateCreated: new Date('2024-01-01T10:00:00')
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render bookmark title', () => {
    render(<CurrentPositionBookmark bookmark={mockBookmark} onGotoLine={mockOnGotoLine} />);
    
    expect(screen.getByText('Test Bookmark')).toBeInTheDocument();
  });

  it('should render section heading', () => {
    render(<CurrentPositionBookmark bookmark={mockBookmark} onGotoLine={mockOnGotoLine} />);
    
    expect(screen.getByText('Current Position')).toBeInTheDocument();
  });

  it('should render line number', () => {
    render(<CurrentPositionBookmark bookmark={mockBookmark} onGotoLine={mockOnGotoLine} />);
    
    expect(screen.getByText('Line 100')).toBeInTheDocument();
  });

  it('should render formatted date', () => {
    render(<CurrentPositionBookmark bookmark={mockBookmark} onGotoLine={mockOnGotoLine} />);
    
    expect(screen.getByText(/Jan 1/)).toBeInTheDocument();
  });

  it('should render map pin icon', () => {
    const { container } = render(<CurrentPositionBookmark bookmark={mockBookmark} onGotoLine={mockOnGotoLine} />);
    
    const mapIcon = container.querySelector('svg.lucide-map-pin');
    expect(mapIcon).toBeInTheDocument();
  });

  it('should render calendar icon', () => {
    const { container } = render(<CurrentPositionBookmark bookmark={mockBookmark} onGotoLine={mockOnGotoLine} />);
    
    const calendarIcon = container.querySelector('svg.lucide-calendar');
    expect(calendarIcon).toBeInTheDocument();
  });

  it('should render Resume button', () => {
    render(<CurrentPositionBookmark bookmark={mockBookmark} onGotoLine={mockOnGotoLine} />);
    
    const resumeButton = screen.getByRole('button', { name: 'Resume' });
    expect(resumeButton).toBeInTheDocument();
  });

  it('should call onGotoLine with bookmark line when Resume is clicked', () => {
    render(<CurrentPositionBookmark bookmark={mockBookmark} onGotoLine={mockOnGotoLine} />);
    
    const resumeButton = screen.getByRole('button', { name: 'Resume' });
    fireEvent.click(resumeButton);
    
    expect(mockOnGotoLine).toHaveBeenCalledWith(100);
  });

  it('should have blue styling for current position', () => {
    const { container } = render(<CurrentPositionBookmark bookmark={mockBookmark} onGotoLine={mockOnGotoLine} />);
    
    const positionCard = container.querySelector('.bg-blue-50');
    expect(positionCard).toBeInTheDocument();
    expect(positionCard).toHaveClass('border-blue-200');
  });
});