import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BookmarkListItem } from './BookmarkListItem';
import { Bookmark } from '../stores/useBookmarkStore';

describe('BookmarkListItem', () => {
  const mockOnGotoLine = jest.fn();
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();
  
  const mockBookmark: Bookmark = {
    id: '1',
    guideId: 'guide1',
    title: 'Test Bookmark',
    line: 100,
    note: 'Test note',
    isCurrentPosition: false,
    dateCreated: new Date('2024-01-01T10:00:00')
  };

  const mockBookmarkNoNote: Bookmark = {
    ...mockBookmark,
    note: ''
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render bookmark title', () => {
    render(
      <BookmarkListItem 
        bookmark={mockBookmark} 
        onGotoLine={mockOnGotoLine}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    
    expect(screen.getByText('Test Bookmark')).toBeInTheDocument();
  });

  it('should render line number', () => {
    render(
      <BookmarkListItem 
        bookmark={mockBookmark} 
        onGotoLine={mockOnGotoLine}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    
    expect(screen.getByText('Line 100')).toBeInTheDocument();
  });

  it('should render formatted date', () => {
    render(
      <BookmarkListItem 
        bookmark={mockBookmark} 
        onGotoLine={mockOnGotoLine}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    
    expect(screen.getByText(/Jan 1/)).toBeInTheDocument();
  });

  it('should render note when provided', () => {
    render(
      <BookmarkListItem 
        bookmark={mockBookmark} 
        onGotoLine={mockOnGotoLine}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    
    expect(screen.getByText('Test note')).toBeInTheDocument();
  });

  it('should not render note when not provided', () => {
    render(
      <BookmarkListItem 
        bookmark={mockBookmarkNoNote} 
        onGotoLine={mockOnGotoLine}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    
    expect(screen.queryByText('Test note')).not.toBeInTheDocument();
  });

  it('should render Go button', () => {
    render(
      <BookmarkListItem 
        bookmark={mockBookmark} 
        onGotoLine={mockOnGotoLine}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    
    expect(screen.getByRole('button', { name: 'Go' })).toBeInTheDocument();
  });

  it('should call onGotoLine when Go button is clicked', () => {
    render(
      <BookmarkListItem 
        bookmark={mockBookmark} 
        onGotoLine={mockOnGotoLine}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    
    fireEvent.click(screen.getByRole('button', { name: 'Go' }));
    expect(mockOnGotoLine).toHaveBeenCalledWith(100);
  });

  it('should render edit button', () => {
    render(
      <BookmarkListItem 
        bookmark={mockBookmark} 
        onGotoLine={mockOnGotoLine}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3); // Go, Edit, Delete
  });

  it('should call onEdit when edit button is clicked', () => {
    render(
      <BookmarkListItem 
        bookmark={mockBookmark} 
        onGotoLine={mockOnGotoLine}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    
    const buttons = screen.getAllByRole('button');
    const editButton = buttons[1]; // Second button is edit
    fireEvent.click(editButton);
    expect(mockOnEdit).toHaveBeenCalledWith(mockBookmark);
  });

  it('should render delete button with red styling', () => {
    render(
      <BookmarkListItem 
        bookmark={mockBookmark} 
        onGotoLine={mockOnGotoLine}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    
    const buttons = screen.getAllByRole('button');
    const deleteButton = buttons[2]; // Third button is delete
    expect(deleteButton).toHaveClass('text-red-600');
  });

  it('should call onDelete when delete button is clicked', () => {
    render(
      <BookmarkListItem 
        bookmark={mockBookmark} 
        onGotoLine={mockOnGotoLine}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    
    const buttons = screen.getAllByRole('button');
    const deleteButton = buttons[2]; // Third button is delete
    fireEvent.click(deleteButton);
    expect(mockOnDelete).toHaveBeenCalledWith('1');
  });

  it('should render date with calendar text', () => {
    render(
      <BookmarkListItem 
        bookmark={mockBookmark} 
        onGotoLine={mockOnGotoLine}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    
    expect(screen.getByText(/Jan 1/)).toBeInTheDocument();
  });
});