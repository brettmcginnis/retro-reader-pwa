import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BookmarkModal } from './BookmarkModal';

describe('BookmarkModal', () => {
  const defaultProps = {
    isOpen: true,
    line: 42,
    title: 'Test bookmark title',
    note: 'Test note',
    onTitleChange: jest.fn(),
    onNoteChange: jest.fn(),
    onSave: jest.fn(),
    onSetAsCurrentPosition: jest.fn(),
    onClose: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display the line number as read-only', () => {
    render(<BookmarkModal {...defaultProps} />);
    
    const lineInput = screen.getByLabelText('Line number');
    expect(lineInput).toBeInTheDocument();
    expect(lineInput).toHaveValue('42');
    expect(lineInput).toHaveAttribute('readOnly');
  });

  it('should display the modal title with line number', () => {
    render(<BookmarkModal {...defaultProps} />);
    
    expect(screen.getByText('Add Bookmark at Line 42')).toBeInTheDocument();
  });

  it('should display pre-filled title', () => {
    render(<BookmarkModal {...defaultProps} />);
    
    const titleInput = screen.getByLabelText('Title');
    expect(titleInput).toHaveValue('Test bookmark title');
  });

  it('should display optional notes field', () => {
    render(<BookmarkModal {...defaultProps} />);
    
    const notesTextarea = screen.getByLabelText('Notes');
    expect(notesTextarea).toHaveValue('Test note');
    expect(screen.getByText('Notes (optional)')).toBeInTheDocument();
  });

  it('should call onTitleChange when title is edited', async () => {
    const user = userEvent.setup();
    render(<BookmarkModal {...defaultProps} />);
    
    const titleInput = screen.getByLabelText('Title');
    // Clear and type new value
    await user.clear(titleInput);
    await user.type(titleInput, 'New title');
    
    // Verify that onTitleChange was called
    expect(defaultProps.onTitleChange).toHaveBeenCalled();
    // Check that it was called with empty string (from clear)
    expect(defaultProps.onTitleChange).toHaveBeenCalledWith('');
  });

  it('should call onNoteChange when note is edited', async () => {
    const user = userEvent.setup();
    render(<BookmarkModal {...defaultProps} />);
    
    const notesTextarea = screen.getByLabelText('Notes');
    // Clear and type new value
    await user.clear(notesTextarea);
    await user.type(notesTextarea, 'New note');
    
    // Verify that onNoteChange was called
    expect(defaultProps.onNoteChange).toHaveBeenCalled();
    // Check that it was called with empty string (from clear)
    expect(defaultProps.onNoteChange).toHaveBeenCalledWith('');
  });

  it('should display all action buttons', () => {
    render(<BookmarkModal {...defaultProps} />);
    
    expect(screen.getByRole('button', { name: 'Set as Current Position' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('should call onSetAsCurrentPosition when button is clicked', async () => {
    const user = userEvent.setup();
    render(<BookmarkModal {...defaultProps} />);
    
    const setCurrentButton = screen.getByRole('button', { name: 'Set as Current Position' });
    await user.click(setCurrentButton);
    
    expect(defaultProps.onSetAsCurrentPosition).toHaveBeenCalledTimes(1);
  });

  it('should call onSave when Save button is clicked', async () => {
    const user = userEvent.setup();
    render(<BookmarkModal {...defaultProps} />);
    
    const saveButton = screen.getByRole('button', { name: 'Save' });
    await user.click(saveButton);
    
    expect(defaultProps.onSave).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when Cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<BookmarkModal {...defaultProps} />);
    
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);
    
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('should not render when isOpen is false', () => {
    render(<BookmarkModal {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText('Add Bookmark at Line 42')).not.toBeInTheDocument();
  });

});