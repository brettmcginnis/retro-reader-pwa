import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PasteModal } from './PasteModal';
import { Guide } from '../stores/useGuideStore';

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

describe('PasteModal', () => {
  const mockOnSave = jest.fn();
  const mockOnClose = jest.fn();
  const defaultProps = {
    onSave: mockOnSave,
    onClose: mockOnClose
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the modal with all form fields', () => {
    render(<PasteModal {...defaultProps} />);

    expect(screen.getByTestId('modal')).toBeInTheDocument();
    expect(screen.getByText('Paste Guide Content')).toBeInTheDocument();
    expect(screen.getByLabelText('Guide Title:')).toBeInTheDocument();
    expect(screen.getByLabelText('Author (optional):')).toBeInTheDocument();
    expect(screen.getByLabelText('Game Title (optional):')).toBeInTheDocument();
    expect(screen.getByLabelText('Source URL (optional):')).toBeInTheDocument();
    expect(screen.getByLabelText('Guide Content:')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Save Guide')).toBeInTheDocument();
  });

  it('should initialize with empty values', () => {
    render(<PasteModal {...defaultProps} />);

    const titleInput = screen.getByLabelText('Guide Title:') as HTMLInputElement;
    const authorInput = screen.getByLabelText('Author (optional):') as HTMLInputElement;
    const gameInput = screen.getByLabelText('Game Title (optional):') as HTMLInputElement;
    const urlInput = screen.getByLabelText('Source URL (optional):') as HTMLInputElement;
    const contentInput = screen.getByLabelText('Guide Content:') as HTMLTextAreaElement;

    expect(titleInput.value).toBe('');
    expect(authorInput.value).toBe('');
    expect(gameInput.value).toBe('');
    expect(urlInput.value).toBe('');
    expect(contentInput.value).toBe('');
  });

  it('should handle input changes', () => {
    render(<PasteModal {...defaultProps} />);

    const titleInput = screen.getByLabelText('Guide Title:');
    const authorInput = screen.getByLabelText('Author (optional):');
    const gameInput = screen.getByLabelText('Game Title (optional):');
    const urlInput = screen.getByLabelText('Source URL (optional):');
    const contentInput = screen.getByLabelText('Guide Content:');

    fireEvent.change(titleInput, { target: { value: 'My Guide' } });
    fireEvent.change(authorInput, { target: { value: 'John Doe' } });
    fireEvent.change(gameInput, { target: { value: 'Super Mario' } });
    fireEvent.change(urlInput, { target: { value: 'https://example.com' } });
    fireEvent.change(contentInput, { target: { value: 'Guide content here' } });

    expect(titleInput).toHaveValue('My Guide');
    expect(authorInput).toHaveValue('John Doe');
    expect(gameInput).toHaveValue('Super Mario');
    expect(urlInput).toHaveValue('https://example.com');
    expect(contentInput).toHaveValue('Guide content here');
  });

  it('should have correct placeholder texts', () => {
    render(<PasteModal {...defaultProps} />);

    expect(screen.getByPlaceholderText('e.g., Final Fantasy VII Guide')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Guide author')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g., Final Fantasy VII')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('https://gamefaqs.gamespot.com/...')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Paste the complete guide text here/)).toBeInTheDocument();
  });

  it('should disable save button when title is empty', () => {
    render(<PasteModal {...defaultProps} />);

    const saveButton = screen.getByText('Save Guide');
    const contentInput = screen.getByLabelText('Guide Content:');

    // With empty title and content
    expect(saveButton).toBeDisabled();

    // With content but no title
    fireEvent.change(contentInput, { target: { value: 'Some content' } });
    expect(saveButton).toBeDisabled();
  });

  it('should disable save button when content is empty', () => {
    render(<PasteModal {...defaultProps} />);

    const saveButton = screen.getByText('Save Guide');
    const titleInput = screen.getByLabelText('Guide Title:');

    // With title but no content
    fireEvent.change(titleInput, { target: { value: 'My Guide' } });
    expect(saveButton).toBeDisabled();
  });

  it('should enable save button when both title and content are provided', () => {
    render(<PasteModal {...defaultProps} />);

    const saveButton = screen.getByText('Save Guide');
    const titleInput = screen.getByLabelText('Guide Title:');
    const contentInput = screen.getByLabelText('Guide Content:');

    fireEvent.change(titleInput, { target: { value: 'My Guide' } });
    fireEvent.change(contentInput, { target: { value: 'Some content' } });

    expect(saveButton).not.toBeDisabled();
  });

  it('should save guide with all fields', async () => {
    const savedGuide: Guide = {
      id: 'new-id',
      title: 'My Guide',
      content: 'Guide content',
      url: 'https://example.com',
      author: 'John Doe',
      gameTitle: 'Super Mario',
      size: 13,
      dateAdded: new Date(),
      dateModified: new Date()
    };
    mockOnSave.mockResolvedValue(savedGuide);

    render(<PasteModal {...defaultProps} />);

    fireEvent.change(screen.getByLabelText('Guide Title:'), { target: { value: 'My Guide' } });
    fireEvent.change(screen.getByLabelText('Author (optional):'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText('Game Title (optional):'), { target: { value: 'Super Mario' } });
    fireEvent.change(screen.getByLabelText('Source URL (optional):'), { target: { value: 'https://example.com' } });
    fireEvent.change(screen.getByLabelText('Guide Content:'), { target: { value: 'Guide content' } });

    const saveButton = screen.getByText('Save Guide');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        title: 'My Guide',
        content: 'Guide content',
        url: 'https://example.com',
        size: 13,
        author: 'John Doe',
        gameTitle: 'Super Mario'
      });
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('should save guide with only required fields', async () => {
    const savedGuide: Guide = {
      id: 'new-id',
      title: 'My Guide',
      content: 'Guide content',
      url: 'manual-import',
      size: 13,
      dateAdded: new Date(),
      dateModified: new Date()
    };
    mockOnSave.mockResolvedValue(savedGuide);

    render(<PasteModal {...defaultProps} />);

    fireEvent.change(screen.getByLabelText('Guide Title:'), { target: { value: 'My Guide' } });
    fireEvent.change(screen.getByLabelText('Guide Content:'), { target: { value: 'Guide content' } });

    const saveButton = screen.getByText('Save Guide');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        title: 'My Guide',
        content: 'Guide content',
        url: 'manual-import',
        size: 13,
        author: undefined,
        gameTitle: undefined
      });
    });
  });

  it('should trim whitespace from all inputs', async () => {
    const savedGuide: Guide = {
      id: 'new-id',
      title: 'Trimmed Guide',
      content: 'Trimmed content',
      url: 'https://trimmed.com',
      author: 'Trimmed Author',
      gameTitle: 'Trimmed Game',
      size: 15,
      dateAdded: new Date(),
      dateModified: new Date()
    };
    mockOnSave.mockResolvedValue(savedGuide);

    render(<PasteModal {...defaultProps} />);

    fireEvent.change(screen.getByLabelText('Guide Title:'), { target: { value: '  Trimmed Guide  ' } });
    fireEvent.change(screen.getByLabelText('Author (optional):'), { target: { value: '  Trimmed Author  ' } });
    fireEvent.change(screen.getByLabelText('Game Title (optional):'), { target: { value: '  Trimmed Game  ' } });
    fireEvent.change(screen.getByLabelText('Source URL (optional):'), { target: { value: '  https://trimmed.com  ' } });
    fireEvent.change(screen.getByLabelText('Guide Content:'), { target: { value: '  Trimmed content  ' } });

    const saveButton = screen.getByText('Save Guide');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        title: 'Trimmed Guide',
        content: 'Trimmed content',
        url: 'https://trimmed.com',
        size: 15,
        author: 'Trimmed Author',
        gameTitle: 'Trimmed Game'
      });
    });
  });

  it('should handle save errors silently', async () => {
    const error = new Error('Save failed');
    mockOnSave.mockRejectedValue(error);

    render(<PasteModal {...defaultProps} />);

    fireEvent.change(screen.getByLabelText('Guide Title:'), { target: { value: 'My Guide' } });
    fireEvent.change(screen.getByLabelText('Guide Content:'), { target: { value: 'Some content' } });

    const saveButton = screen.getByText('Save Guide');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalled();
    });

    // Should not close on error
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should disable buttons while saving', async () => {
    let resolveSave: (value: Guide) => void = () => {};
    const savePromise = new Promise<Guide>((resolve) => {
      resolveSave = resolve;
    });
    mockOnSave.mockReturnValue(savePromise);

    render(<PasteModal {...defaultProps} />);

    fireEvent.change(screen.getByLabelText('Guide Title:'), { target: { value: 'My Guide' } });
    fireEvent.change(screen.getByLabelText('Guide Content:'), { target: { value: 'Some content' } });

    const saveButton = screen.getByText('Save Guide');
    const cancelButton = screen.getByText('Cancel');
    
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(saveButton.textContent).toBe('Saving...');
      expect(saveButton).toBeDisabled();
      expect(cancelButton).toBeDisabled();
    });

    await act(async () => {
      resolveSave({
        id: 'test',
        title: 'My Guide',
        content: 'Some content',
        url: 'test',
        size: 12,
        dateAdded: new Date(),
        dateModified: new Date()
      });
      await savePromise;
    });
  });

  it('should call onClose when Cancel is clicked', () => {
    render(<PasteModal {...defaultProps} />);

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should not save when title has only whitespace', async () => {
    render(<PasteModal {...defaultProps} />);

    fireEvent.change(screen.getByLabelText('Guide Title:'), { target: { value: '   ' } });
    fireEvent.change(screen.getByLabelText('Guide Content:'), { target: { value: 'Some content' } });

    const saveButton = screen.getByText('Save Guide');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).not.toHaveBeenCalled();
    });
  });

  it('should not save when content has only whitespace', async () => {
    render(<PasteModal {...defaultProps} />);

    fireEvent.change(screen.getByLabelText('Guide Title:'), { target: { value: 'My Guide' } });
    fireEvent.change(screen.getByLabelText('Guide Content:'), { target: { value: '   ' } });

    const saveButton = screen.getByText('Save Guide');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).not.toHaveBeenCalled();
    });
  });

  it('should calculate content size correctly', async () => {
    const savedGuide: Guide = {
      id: 'new-id',
      title: 'My Guide',
      content: 'This is test content',
      url: 'manual-import',
      size: 20, // Length of 'This is test content'
      dateAdded: new Date(),
      dateModified: new Date()
    };
    mockOnSave.mockResolvedValue(savedGuide);

    render(<PasteModal {...defaultProps} />);

    fireEvent.change(screen.getByLabelText('Guide Title:'), { target: { value: 'My Guide' } });
    fireEvent.change(screen.getByLabelText('Guide Content:'), { target: { value: 'This is test content' } });

    const saveButton = screen.getByText('Save Guide');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          size: 20
        })
      );
    });
  });
});