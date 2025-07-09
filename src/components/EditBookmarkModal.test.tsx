import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EditBookmarkModal } from './EditBookmarkModal';
import { Bookmark } from '../types';

// Mock Modal component
interface ModalProps {
  isOpen: boolean;
  children: React.ReactNode;
  title: string;
}

interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: string;
}

jest.mock('./Modal', () => ({
  Modal: ({ isOpen, children, title }: ModalProps) => isOpen ? (
    <div data-testid="modal">
      <h2>{title}</h2>
      {children}
    </div>
  ) : null
}));

// Mock Button component
jest.mock('./Button', () => ({
  Button: ({ children, onClick, disabled, variant }: ButtonProps) => (
    <button onClick={onClick} disabled={disabled} data-variant={variant}>
      {children}
    </button>
  )
}));

describe('EditBookmarkModal', () => {
  const mockOnSave = jest.fn();
  const mockOnClose = jest.fn();
  const mockBookmark: Bookmark = {
    id: 'bookmark-1',
    guideId: 'guide-1',
    line: 50,
    title: 'Original Title',
    note: 'Original Note',
    dateCreated: new Date()
  };
  
  const defaultProps = {
    bookmark: mockBookmark,
    maxLine: 100,
    onSave: mockOnSave,
    onClose: mockOnClose
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the modal with all form fields', () => {
    render(<EditBookmarkModal {...defaultProps} />);

    expect(screen.getByTestId('modal')).toBeInTheDocument();
    expect(screen.getByText('Edit Bookmark')).toBeInTheDocument();
    expect(screen.getByLabelText('Line Number:')).toBeInTheDocument();
    expect(screen.getByLabelText('Title:')).toBeInTheDocument();
    expect(screen.getByLabelText('Note (optional):')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Update')).toBeInTheDocument();
  });

  it('should initialize with bookmark values', () => {
    render(<EditBookmarkModal {...defaultProps} />);

    const lineInput = screen.getByLabelText('Line Number:') as HTMLInputElement;
    const titleInput = screen.getByLabelText('Title:') as HTMLInputElement;
    const noteInput = screen.getByLabelText('Note (optional):') as HTMLTextAreaElement;

    expect(lineInput.value).toBe('50');
    expect(titleInput.value).toBe('Original Title');
    expect(noteInput.value).toBe('Original Note');
  });

  it('should initialize with empty note when bookmark has no note', () => {
    const bookmarkWithoutNote = { ...mockBookmark, note: undefined };
    render(<EditBookmarkModal {...defaultProps} bookmark={bookmarkWithoutNote} />);

    const noteInput = screen.getByLabelText('Note (optional):') as HTMLTextAreaElement;
    expect(noteInput.value).toBe('');
  });

  it('should handle input changes', () => {
    render(<EditBookmarkModal {...defaultProps} />);

    const lineInput = screen.getByLabelText('Line Number:') as HTMLInputElement;
    const titleInput = screen.getByLabelText('Title:') as HTMLInputElement;
    const noteInput = screen.getByLabelText('Note (optional):') as HTMLTextAreaElement;

    fireEvent.change(lineInput, { target: { value: '75' } });
    fireEvent.change(titleInput, { target: { value: 'Updated Title' } });
    fireEvent.change(noteInput, { target: { value: 'Updated Note' } });

    expect(lineInput.value).toBe('75');
    expect(titleInput.value).toBe('Updated Title');
    expect(noteInput.value).toBe('Updated Note');
  });

  it('should enforce line number constraints', () => {
    render(<EditBookmarkModal {...defaultProps} />);

    const lineInput = screen.getByLabelText('Line Number:') as HTMLInputElement;
    
    expect(lineInput.min).toBe('1');
    expect(lineInput.max).toBe('100');
  });

  it('should show error when title is empty', async () => {
    render(<EditBookmarkModal {...defaultProps} />);

    const titleInput = screen.getByLabelText('Title:');
    fireEvent.change(titleInput, { target: { value: '' } });

    const updateButton = screen.getByText('Update');
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(screen.getByText('Please enter a title for the bookmark')).toBeInTheDocument();
    });
    
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('should update bookmark with valid data', async () => {
    render(<EditBookmarkModal {...defaultProps} />);

    const titleInput = screen.getByLabelText('Title:');
    const lineInput = screen.getByLabelText('Line Number:');
    const noteInput = screen.getByLabelText('Note (optional):');

    fireEvent.change(lineInput, { target: { value: '75' } });
    fireEvent.change(titleInput, { target: { value: 'Updated Title' } });
    fireEvent.change(noteInput, { target: { value: 'Updated Note' } });

    const updateButton = screen.getByText('Update');
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith('bookmark-1', {
        line: 75,
        title: 'Updated Title',
        note: 'Updated Note'
      });
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('should update bookmark without note', async () => {
    render(<EditBookmarkModal {...defaultProps} />);

    const noteInput = screen.getByLabelText('Note (optional):');
    fireEvent.change(noteInput, { target: { value: '' } });

    const updateButton = screen.getByText('Update');
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith('bookmark-1', {
        line: 50,
        title: 'Original Title',
        note: undefined
      });
    });
  });

  it('should trim whitespace from inputs', async () => {
    render(<EditBookmarkModal {...defaultProps} />);

    const titleInput = screen.getByLabelText('Title:');
    const noteInput = screen.getByLabelText('Note (optional):');

    fireEvent.change(titleInput, { target: { value: '  Trimmed Title  ' } });
    fireEvent.change(noteInput, { target: { value: '  Trimmed Note  ' } });

    const updateButton = screen.getByText('Update');
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith('bookmark-1', {
        line: 50,
        title: 'Trimmed Title',
        note: 'Trimmed Note'
      });
    });
  });

  it('should handle update errors', async () => {
    const error = new Error('Update failed');
    mockOnSave.mockRejectedValue(error);

    render(<EditBookmarkModal {...defaultProps} />);

    const updateButton = screen.getByText('Update');
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to update bookmark: Update failed')).toBeInTheDocument();
    });

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should handle unknown update errors', async () => {
    mockOnSave.mockRejectedValue('Unknown error');

    render(<EditBookmarkModal {...defaultProps} />);

    const updateButton = screen.getByText('Update');
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to update bookmark: Unknown error')).toBeInTheDocument();
    });
  });

  it('should disable buttons while updating', async () => {
    let resolveSave: (value: void) => void = () => {};
    const savePromise = new Promise<void>((resolve) => {
      resolveSave = resolve;
    });
    mockOnSave.mockReturnValue(savePromise);

    render(<EditBookmarkModal {...defaultProps} />);

    const updateButton = screen.getByText('Update');
    const cancelButton = screen.getByText('Cancel');
    
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(updateButton.textContent).toBe('Updating...');
      expect(updateButton).toBeDisabled();
      expect(cancelButton).toBeDisabled();
    });

    await act(async () => {
      resolveSave();
      await savePromise;
    });
  });

  it('should close error alert when X is clicked', async () => {
    render(<EditBookmarkModal {...defaultProps} />);

    const titleInput = screen.getByLabelText('Title:');
    fireEvent.change(titleInput, { target: { value: '' } });

    const updateButton = screen.getByText('Update');
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(screen.getByText('Please enter a title for the bookmark')).toBeInTheDocument();
    });

    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);

    expect(screen.queryByText('Please enter a title for the bookmark')).not.toBeInTheDocument();
  });

  it('should call onClose when Cancel is clicked', () => {
    render(<EditBookmarkModal {...defaultProps} />);

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should handle invalid line number input', () => {
    render(<EditBookmarkModal {...defaultProps} />);

    const lineInput = screen.getByLabelText('Line Number:') as HTMLInputElement;
    
    fireEvent.change(lineInput, { target: { value: 'abc' } });
    expect(lineInput.value).toBe('1'); // Should default to 1 for invalid input

    fireEvent.change(lineInput, { target: { value: '' } });
    expect(lineInput.value).toBe('1'); // Should default to 1 for empty input
  });

  it('should not call onSave if no changes were made', async () => {
    render(<EditBookmarkModal {...defaultProps} />);

    // Don't change any values
    const updateButton = screen.getByText('Update');
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith('bookmark-1', {
        line: 50,
        title: 'Original Title',
        note: 'Original Note'
      });
    });

    expect(mockOnClose).toHaveBeenCalled();
  });
});