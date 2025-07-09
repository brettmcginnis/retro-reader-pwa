import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AddBookmarkModal } from './AddBookmarkModal';
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

describe('AddBookmarkModal', () => {
  const mockOnSave = jest.fn();
  const mockOnClose = jest.fn();
  const defaultProps = {
    guideId: 'test-guide',
    maxLine: 100,
    onSave: mockOnSave,
    onClose: mockOnClose
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the modal with all form fields', () => {
    render(<AddBookmarkModal {...defaultProps} />);

    expect(screen.getByTestId('modal')).toBeInTheDocument();
    expect(screen.getByText('Add Bookmark')).toBeInTheDocument();
    expect(screen.getByLabelText('Line Number:')).toBeInTheDocument();
    expect(screen.getByLabelText('Title:')).toBeInTheDocument();
    expect(screen.getByLabelText('Note (optional):')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('should initialize with default values', () => {
    render(<AddBookmarkModal {...defaultProps} />);

    const lineInput = screen.getByLabelText('Line Number:') as HTMLInputElement;
    const titleInput = screen.getByLabelText('Title:') as HTMLInputElement;
    const noteInput = screen.getByLabelText('Note (optional):') as HTMLTextAreaElement;

    expect(lineInput.value).toBe('1');
    expect(titleInput.value).toBe('');
    expect(noteInput.value).toBe('');
  });

  it('should handle input changes', () => {
    render(<AddBookmarkModal {...defaultProps} />);

    const lineInput = screen.getByLabelText('Line Number:') as HTMLInputElement;
    const titleInput = screen.getByLabelText('Title:') as HTMLInputElement;
    const noteInput = screen.getByLabelText('Note (optional):') as HTMLTextAreaElement;

    fireEvent.change(lineInput, { target: { value: '50' } });
    fireEvent.change(titleInput, { target: { value: 'My Bookmark' } });
    fireEvent.change(noteInput, { target: { value: 'This is a note' } });

    expect(lineInput.value).toBe('50');
    expect(titleInput.value).toBe('My Bookmark');
    expect(noteInput.value).toBe('This is a note');
  });

  it('should enforce line number constraints', () => {
    render(<AddBookmarkModal {...defaultProps} />);

    const lineInput = screen.getByLabelText('Line Number:') as HTMLInputElement;
    
    expect(lineInput.min).toBe('1');
    expect(lineInput.max).toBe('100');
  });

  it('should show error when title is empty', async () => {
    render(<AddBookmarkModal {...defaultProps} />);

    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Please enter a title for the bookmark')).toBeInTheDocument();
    });
    
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('should save bookmark with valid data', async () => {
    const savedBookmark: Bookmark = {
      id: 'new-id',
      guideId: 'test-guide',
      line: 50,
      title: 'My Bookmark',
      note: 'This is a note',
      dateCreated: new Date()
    };
    mockOnSave.mockResolvedValue(savedBookmark);

    render(<AddBookmarkModal {...defaultProps} />);

    const titleInput = screen.getByLabelText('Title:');
    const lineInput = screen.getByLabelText('Line Number:');
    const noteInput = screen.getByLabelText('Note (optional):');

    fireEvent.change(lineInput, { target: { value: '50' } });
    fireEvent.change(titleInput, { target: { value: 'My Bookmark' } });
    fireEvent.change(noteInput, { target: { value: 'This is a note' } });

    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        guideId: 'test-guide',
        line: 50,
        title: 'My Bookmark',
        note: 'This is a note'
      });
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('should save bookmark without note', async () => {
    const savedBookmark: Bookmark = {
      id: 'new-id',
      guideId: 'test-guide',
      line: 25,
      title: 'My Bookmark',
      dateCreated: new Date()
    };
    mockOnSave.mockResolvedValue(savedBookmark);

    render(<AddBookmarkModal {...defaultProps} />);

    const titleInput = screen.getByLabelText('Title:');
    const lineInput = screen.getByLabelText('Line Number:');

    fireEvent.change(lineInput, { target: { value: '25' } });
    fireEvent.change(titleInput, { target: { value: 'My Bookmark' } });

    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        guideId: 'test-guide',
        line: 25,
        title: 'My Bookmark',
        note: undefined
      });
    });
  });

  it('should trim whitespace from inputs', async () => {
    const savedBookmark: Bookmark = {
      id: 'new-id',
      guideId: 'test-guide',
      line: 1,
      title: 'Trimmed Title',
      note: 'Trimmed Note',
      dateCreated: new Date()
    };
    mockOnSave.mockResolvedValue(savedBookmark);

    render(<AddBookmarkModal {...defaultProps} />);

    const titleInput = screen.getByLabelText('Title:');
    const noteInput = screen.getByLabelText('Note (optional):');

    fireEvent.change(titleInput, { target: { value: '  Trimmed Title  ' } });
    fireEvent.change(noteInput, { target: { value: '  Trimmed Note  ' } });

    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        guideId: 'test-guide',
        line: 1,
        title: 'Trimmed Title',
        note: 'Trimmed Note'
      });
    });
  });

  it('should handle save errors', async () => {
    const error = new Error('Save failed');
    mockOnSave.mockRejectedValue(error);

    render(<AddBookmarkModal {...defaultProps} />);

    const titleInput = screen.getByLabelText('Title:');
    fireEvent.change(titleInput, { target: { value: 'My Bookmark' } });

    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to save bookmark: Save failed')).toBeInTheDocument();
    });

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should handle unknown save errors', async () => {
    mockOnSave.mockRejectedValue('Unknown error');

    render(<AddBookmarkModal {...defaultProps} />);

    const titleInput = screen.getByLabelText('Title:');
    fireEvent.change(titleInput, { target: { value: 'My Bookmark' } });

    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to save bookmark: Unknown error')).toBeInTheDocument();
    });
  });

  it('should disable buttons while saving', async () => {
    let resolveSave: (value: Bookmark) => void = () => {};
    const savePromise = new Promise<Bookmark>((resolve) => {
      resolveSave = resolve;
    });
    mockOnSave.mockReturnValue(savePromise);

    render(<AddBookmarkModal {...defaultProps} />);

    const titleInput = screen.getByLabelText('Title:');
    fireEvent.change(titleInput, { target: { value: 'My Bookmark' } });

    const saveButton = screen.getByText('Save');
    const cancelButton = screen.getByText('Cancel');
    
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(saveButton.textContent).toBe('Saving...');
      expect(saveButton).toBeDisabled();
      expect(cancelButton).toBeDisabled();
    });

    await act(async () => {
      resolveSave({ id: 'test', guideId: 'test-guide', line: 1, title: 'Test', dateCreated: new Date() });
      await savePromise;
    });
  });

  it('should close error alert when X is clicked', async () => {
    render(<AddBookmarkModal {...defaultProps} />);

    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Please enter a title for the bookmark')).toBeInTheDocument();
    });

    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);

    expect(screen.queryByText('Please enter a title for the bookmark')).not.toBeInTheDocument();
  });

  it('should call onClose when Cancel is clicked', () => {
    render(<AddBookmarkModal {...defaultProps} />);

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should handle invalid line number input', () => {
    render(<AddBookmarkModal {...defaultProps} />);

    const lineInput = screen.getByLabelText('Line Number:') as HTMLInputElement;
    
    fireEvent.change(lineInput, { target: { value: 'abc' } });
    expect(lineInput.value).toBe('1'); // Should default to 1 for invalid input

    fireEvent.change(lineInput, { target: { value: '' } });
    expect(lineInput.value).toBe('1'); // Should default to 1 for empty input
  });

  it('should have correct placeholder texts', () => {
    render(<AddBookmarkModal {...defaultProps} />);

    const titleInput = screen.getByLabelText('Title:') as HTMLInputElement;
    const noteInput = screen.getByLabelText('Note (optional):') as HTMLTextAreaElement;
    
    expect(titleInput).toHaveAttribute('placeholder', 'Bookmark title');
    expect(noteInput).toHaveAttribute('placeholder', 'Add a note...');
  });
});