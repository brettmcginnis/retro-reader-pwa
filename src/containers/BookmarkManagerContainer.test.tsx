import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BookmarkManagerContainer } from './BookmarkManagerContainer';
import { useBookmarks } from '../hooks/useBookmarks';
import { useToast } from '../contexts/useToast';
import { Guide, Bookmark } from '../types';

// Mock hooks
jest.mock('../hooks/useBookmarks');
jest.mock('../contexts/useToast');

// Mock BookmarkManagerView to avoid complex component tree
jest.mock('../components/BookmarkManagerView', () => ({
  BookmarkManagerView: jest.fn((_props) => <div data-testid="bookmark-manager-view">BookmarkManagerView</div>)
}));

describe('BookmarkManagerContainer', () => {
  const mockGuide: Guide = {
    id: 'guide-1',
    title: 'Test Guide',
    content: 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5',
    url: 'https://example.com/guide',
    dateAdded: new Date(),
    dateModified: new Date(),
    size: 100
  };

  const mockBookmarks: Bookmark[] = [
    {
      id: '1',
      guideId: 'guide-1',
      line: 2,
      title: 'Bookmark 1',
      dateCreated: new Date(),
      isCurrentPosition: false
    },
    {
      id: '2',
      guideId: 'guide-1',
      line: 4,
      title: 'Bookmark 2',
      dateCreated: new Date(),
      isCurrentPosition: false
    },
    {
      id: 'current-position-guide-1',
      guideId: 'guide-1',
      line: 3,
      title: 'Current Position',
      dateCreated: new Date(),
      isCurrentPosition: true
    }
  ];

  const mockAddBookmark = jest.fn();
  const mockDeleteBookmark = jest.fn();
  const mockUpdateBookmark = jest.fn();
  const mockShowToast = jest.fn();
  const mockShowConfirmation = jest.fn();
  const mockOnGotoLine = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    (useBookmarks as jest.Mock).mockReturnValue({
      bookmarks: mockBookmarks,
      addBookmark: mockAddBookmark,
      deleteBookmark: mockDeleteBookmark,
      updateBookmark: mockUpdateBookmark
    });

    (useToast as jest.Mock).mockReturnValue({
      showToast: mockShowToast,
      showConfirmation: mockShowConfirmation
    });

    // Mock URL methods
    global.URL.createObjectURL = jest.fn().mockReturnValue('blob:url');
    global.URL.revokeObjectURL = jest.fn();
    
    // Mock Blob
    const mockBlob = {
      size: 100,
      type: 'application/octet-stream',
      parts: [] as BlobPart[],
      options: {}
    };
    global.Blob = jest.fn().mockImplementation((parts: BlobPart[], options?: BlobPropertyBag) => ({
      ...mockBlob,
      type: options?.type || 'application/octet-stream',
      parts,
      options
    })) as unknown as typeof Blob;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render BookmarkManagerView with correct props', () => {
    const { BookmarkManagerView } = jest.requireMock('../components/BookmarkManagerView');
    
    render(<BookmarkManagerContainer guide={mockGuide} onGotoLine={mockOnGotoLine} />);

    expect(screen.getByTestId('bookmark-manager-view')).toBeInTheDocument();
    
    // Check that BookmarkManagerView was called with correct props
    expect(BookmarkManagerView).toHaveBeenCalled();
    const receivedProps = BookmarkManagerView.mock.calls[0][0];
    expect(receivedProps.guide).toEqual(mockGuide);
    expect(receivedProps.currentPositionBookmark).toEqual(mockBookmarks[2]);
    expect(receivedProps.sortedBookmarks).toEqual([mockBookmarks[0], mockBookmarks[1]]);
    expect(receivedProps.lineCount).toBe(5);
    expect(receivedProps.onGotoLine).toBe(mockOnGotoLine);
    expect(typeof receivedProps.onAddBookmark).toBe('function');
    expect(typeof receivedProps.onUpdateBookmark).toBe('function');
    expect(typeof receivedProps.onDeleteBookmark).toBe('function');
    expect(typeof receivedProps.onExportBookmarks).toBe('function');
    expect(typeof receivedProps.onClearAll).toBe('function');
  });

  it('should handle adding bookmark', async () => {
    const { BookmarkManagerView } = jest.requireMock('../components/BookmarkManagerView');
    mockAddBookmark.mockResolvedValue({ id: 'new-1' });
    
    render(<BookmarkManagerContainer guide={mockGuide} onGotoLine={mockOnGotoLine} />);
    
    const handleAddBookmark = BookmarkManagerView.mock.calls[0][0].onAddBookmark;
    const bookmarkData = { guideId: 'guide-1', line: 50, title: 'New', isCurrentPosition: false };
    
    await handleAddBookmark(bookmarkData);
    
    expect(mockAddBookmark).toHaveBeenCalledWith(bookmarkData);
    expect(mockShowToast).toHaveBeenCalledWith('success', 'Bookmark Added', 'Bookmark added successfully');
  });

  it('should handle adding bookmark error', async () => {
    const { BookmarkManagerView } = jest.requireMock('../components/BookmarkManagerView');
    const error = new Error('Add failed');
    mockAddBookmark.mockRejectedValue(error);
    
    render(<BookmarkManagerContainer guide={mockGuide} onGotoLine={mockOnGotoLine} />);
    
    const handleAddBookmark = BookmarkManagerView.mock.calls[0][0].onAddBookmark;
    
    await expect(handleAddBookmark({})).rejects.toThrow();
    expect(mockShowToast).toHaveBeenCalledWith('error', 'Error', 'Failed to save bookmark: Add failed');
  });

  it('should handle updating bookmark', async () => {
    const { BookmarkManagerView } = jest.requireMock('../components/BookmarkManagerView');
    mockUpdateBookmark.mockResolvedValue(undefined);
    
    render(<BookmarkManagerContainer guide={mockGuide} onGotoLine={mockOnGotoLine} />);
    
    const handleUpdateBookmark = BookmarkManagerView.mock.calls[0][0].onUpdateBookmark;
    
    await handleUpdateBookmark('1', { title: 'Updated' });
    
    expect(mockUpdateBookmark).toHaveBeenCalledWith('1', { title: 'Updated' });
    expect(mockShowToast).toHaveBeenCalledWith('success', 'Bookmark Updated', 'Bookmark updated successfully');
  });

  it('should handle updating bookmark error', async () => {
    const { BookmarkManagerView } = jest.requireMock('../components/BookmarkManagerView');
    const error = new Error('Update failed');
    mockUpdateBookmark.mockRejectedValue(error);
    
    render(<BookmarkManagerContainer guide={mockGuide} onGotoLine={mockOnGotoLine} />);
    
    const handleUpdateBookmark = BookmarkManagerView.mock.calls[0][0].onUpdateBookmark;
    
    await expect(handleUpdateBookmark('1', {})).rejects.toThrow();
    expect(mockShowToast).toHaveBeenCalledWith('error', 'Error', 'Failed to update bookmark: Update failed');
  });

  it('should show confirmation before deleting bookmark', () => {
    const { BookmarkManagerView } = jest.requireMock('../components/BookmarkManagerView');
    
    render(<BookmarkManagerContainer guide={mockGuide} onGotoLine={mockOnGotoLine} />);
    
    const handleDeleteBookmark = BookmarkManagerView.mock.calls[0][0].onDeleteBookmark;
    
    handleDeleteBookmark('1');
    
    expect(mockShowConfirmation).toHaveBeenCalledWith({
      title: 'Delete Bookmark',
      message: 'Are you sure you want to delete the bookmark "Bookmark 1"?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: expect.any(Function)
    });
  });

  it('should delete bookmark when confirmed', async () => {
    const { BookmarkManagerView } = jest.requireMock('../components/BookmarkManagerView');
    mockDeleteBookmark.mockResolvedValue(undefined);
    
    render(<BookmarkManagerContainer guide={mockGuide} onGotoLine={mockOnGotoLine} />);
    
    const handleDeleteBookmark = BookmarkManagerView.mock.calls[0][0].onDeleteBookmark;
    handleDeleteBookmark('1');
    
    // Get and call the onConfirm callback
    const confirmCall = mockShowConfirmation.mock.calls[0][0];
    await confirmCall.onConfirm();
    
    expect(mockDeleteBookmark).toHaveBeenCalledWith('1');
    expect(mockShowToast).toHaveBeenCalledWith('success', 'Bookmark deleted', 'Bookmark has been successfully deleted');
  });

  it('should show confirmation before clearing all bookmarks', () => {
    const { BookmarkManagerView } = jest.requireMock('../components/BookmarkManagerView');
    
    render(<BookmarkManagerContainer guide={mockGuide} onGotoLine={mockOnGotoLine} />);
    
    const handleClearAll = BookmarkManagerView.mock.calls[0][0].onClearAll;
    
    handleClearAll();
    
    expect(mockShowConfirmation).toHaveBeenCalledWith({
      title: 'Clear All Bookmarks',
      message: 'Are you sure you want to delete all bookmarks? This action cannot be undone.',
      confirmText: 'Clear All',
      cancelText: 'Cancel',
      onConfirm: expect.any(Function)
    });
  });

  it('should clear all bookmarks when confirmed', async () => {
    const { BookmarkManagerView } = jest.requireMock('../components/BookmarkManagerView');
    mockDeleteBookmark.mockResolvedValue(undefined);
    
    render(<BookmarkManagerContainer guide={mockGuide} onGotoLine={mockOnGotoLine} />);
    
    const handleClearAll = BookmarkManagerView.mock.calls[0][0].onClearAll;
    handleClearAll();
    
    const confirmCall = mockShowConfirmation.mock.calls[0][0];
    await confirmCall.onConfirm();
    
    expect(mockDeleteBookmark).toHaveBeenCalledTimes(3);
    expect(mockShowToast).toHaveBeenCalledWith('success', 'All bookmarks deleted', 'All bookmarks have been successfully deleted');
  });

  it('should handle clear all error', async () => {
    const { BookmarkManagerView } = jest.requireMock('../components/BookmarkManagerView');
    const error = new Error('Clear failed');
    mockDeleteBookmark.mockRejectedValue(error);
    
    render(<BookmarkManagerContainer guide={mockGuide} onGotoLine={mockOnGotoLine} />);
    
    const handleClearAll = BookmarkManagerView.mock.calls[0][0].onClearAll;
    handleClearAll();
    
    const confirmCall = mockShowConfirmation.mock.calls[0][0];
    await confirmCall.onConfirm();
    
    expect(mockShowToast).toHaveBeenCalledWith('error', 'Failed to clear bookmarks', 'Clear failed');
  });

  it('should export bookmarks', () => {
    const { BookmarkManagerView } = jest.requireMock('../components/BookmarkManagerView');
    
    render(<BookmarkManagerContainer guide={mockGuide} onGotoLine={mockOnGotoLine} />);
    
    // Mock document methods after render
    const mockLink = { 
      href: '', 
      download: '', 
      click: jest.fn(),
      remove: jest.fn()
    } as unknown as HTMLAnchorElement;
    const originalCreateElement = document.createElement;
    document.createElement = jest.fn((tagName: string) => {
      if (tagName === 'a') {
        return mockLink;
      }
      return originalCreateElement.call(document, tagName);
    }) as unknown as typeof document.createElement;
    
    const mockAppendChild = jest.fn();
    const mockRemoveChild = jest.fn();
    const originalAppendChild = document.body.appendChild;
    const originalRemoveChild = document.body.removeChild;
    document.body.appendChild = mockAppendChild;
    document.body.removeChild = mockRemoveChild;
    
    const handleExportBookmarks = BookmarkManagerView.mock.calls[0][0].onExportBookmarks;
    handleExportBookmarks();
    
    expect(global.Blob).toHaveBeenCalledWith(
      [expect.stringContaining('"guide"')],
      { type: 'application/json' }
    );
    expect(document.createElement).toHaveBeenCalledWith('a');
    expect(mockLink.download).toBe('Test_Guide_bookmarks.json');
    expect(mockLink.click).toHaveBeenCalled();
    expect(mockAppendChild).toHaveBeenCalledWith(mockLink);
    expect(mockRemoveChild).toHaveBeenCalledWith(mockLink);
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:url');
    expect(mockShowToast).toHaveBeenCalledWith('success', 'Bookmarks Exported', '3 bookmarks exported successfully');
    
    // Restore
    document.createElement = originalCreateElement;
    document.body.appendChild = originalAppendChild;
    document.body.removeChild = originalRemoveChild;
  });

  it('should handle guides with no bookmarks', () => {
    const { BookmarkManagerView } = jest.requireMock('../components/BookmarkManagerView');
    
    (useBookmarks as jest.Mock).mockReturnValue({
      bookmarks: [],
      addBookmark: mockAddBookmark,
      deleteBookmark: mockDeleteBookmark,
      updateBookmark: mockUpdateBookmark
    });
    
    render(<BookmarkManagerContainer guide={mockGuide} onGotoLine={mockOnGotoLine} />);
    
    expect(BookmarkManagerView).toHaveBeenCalled();
    const receivedProps = BookmarkManagerView.mock.calls[0][0];
    expect(receivedProps.currentPositionBookmark).toBeUndefined();
    expect(receivedProps.sortedBookmarks).toEqual([]);
  });

  it('should calculate line count correctly', () => {
    const { BookmarkManagerView } = jest.requireMock('../components/BookmarkManagerView');
    
    const multiLineGuide = {
      ...mockGuide,
      content: 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5\nLine 6\nLine 7\nLine 8\nLine 9\nLine 10'
    };
    
    render(<BookmarkManagerContainer guide={multiLineGuide} onGotoLine={mockOnGotoLine} />);
    
    expect(BookmarkManagerView).toHaveBeenCalled();
    const receivedProps = BookmarkManagerView.mock.calls[0][0];
    expect(receivedProps.lineCount).toBe(10);
  });

  it('should sort bookmarks by line number', () => {
    const { BookmarkManagerView } = jest.requireMock('../components/BookmarkManagerView');
    
    const unsortedBookmarks = [
      { ...mockBookmarks[1], line: 10 },
      { ...mockBookmarks[0], line: 5 },
      { ...mockBookmarks[2] } // current position
    ];
    
    (useBookmarks as jest.Mock).mockReturnValue({
      bookmarks: unsortedBookmarks,
      addBookmark: mockAddBookmark,
      deleteBookmark: mockDeleteBookmark,
      updateBookmark: mockUpdateBookmark
    });
    
    render(<BookmarkManagerContainer guide={mockGuide} onGotoLine={mockOnGotoLine} />);
    
    const sortedBookmarks = BookmarkManagerView.mock.calls[0][0].sortedBookmarks;
    expect(sortedBookmarks[0].line).toBe(5);
    expect(sortedBookmarks[1].line).toBe(10);
  });
});