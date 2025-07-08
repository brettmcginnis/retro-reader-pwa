import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GuideLibrary } from './GuideLibrary';
import { ToastProvider } from '../contexts/ToastContext';
import { AppProvider } from '../contexts/AppContext';
import toast from 'react-hot-toast';

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
    custom: jest.fn(),
    dismiss: jest.fn(),
  },
  Toaster: () => <div data-testid="toaster" />,
}));

const mockUseGuides = {
  guides: [],
  fetchGuide: jest.fn(),
  createGuide: jest.fn(),
  deleteGuide: jest.fn(),
  exportGuide: jest.fn(),
  exportAll: jest.fn(),
  importFromFile: jest.fn(),
  loading: false,
  error: null,
  refresh: jest.fn(),
  getGuide: jest.fn()
};

jest.mock('../hooks/useGuides', () => ({
  useGuides: () => mockUseGuides
}));

const mockCreateObjectURL = jest.fn();
const mockRevokeObjectURL = jest.fn();
const mockClick = jest.fn();

Object.defineProperty(URL, 'createObjectURL', {
  value: mockCreateObjectURL,
  writable: true
});

Object.defineProperty(URL, 'revokeObjectURL', {
  value: mockRevokeObjectURL,
  writable: true
});

const originalCreateElement = document.createElement.bind(document);
jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
  if (tagName === 'a') {
    const anchor = originalCreateElement('a');
    anchor.click = mockClick;
    return anchor;
  }
  return originalCreateElement(tagName);
});

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AppProvider>
    <ToastProvider>
      {children}
    </ToastProvider>
  </AppProvider>
);

describe('GuideLibrary Import/Export Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateObjectURL.mockReturnValue('blob:mock-url');
    // Reset the fetchGuide mock to ensure it returns a resolved promise
    mockUseGuides.fetchGuide.mockResolvedValue(undefined);
  });

  describe('Export All Functionality', () => {
    it('should export collection as JSON when Export All is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <GuideLibrary />
        </TestWrapper>
      );

      const exportAllButton = screen.getByRole('button', { name: /export all/i });
      await user.click(exportAllButton);

      expect(mockUseGuides.exportAll).toHaveBeenCalledTimes(1);
    });

    it('should show success toast when export succeeds', async () => {
      const user = userEvent.setup();
      mockUseGuides.exportAll.mockResolvedValueOnce(undefined);
      
      render(
        <TestWrapper>
          <GuideLibrary />
        </TestWrapper>
      );

      const exportAllButton = screen.getByRole('button', { name: /export all/i });
      await user.click(exportAllButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalled();
      });
    });

    it('should show error toast when export fails', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Export failed: Network error';
      mockUseGuides.exportAll.mockRejectedValueOnce(new Error(errorMessage));
      
      render(
        <TestWrapper>
          <GuideLibrary />
        </TestWrapper>
      );

      const exportAllButton = screen.getByRole('button', { name: /export all/i });
      await user.click(exportAllButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });
    });
  });

  describe('Import Backup Functionality', () => {
    it('should import valid JSON collection file', async () => {
      const user = userEvent.setup();
      const mockFile = new File(
        [JSON.stringify({
          guides: [{ id: '1', title: 'Test Guide', content: 'Test content' }],
          bookmarks: [],
          progress: [],
          exportDate: '2023-01-01T00:00:00.000Z',
          version: '1.0.0'
        })],
        'collection.json',
        { type: 'application/json' }
      );

      mockUseGuides.importFromFile.mockResolvedValueOnce({
        imported: 1,
        skipped: 0,
        errors: []
      });

      render(
        <TestWrapper>
          <GuideLibrary />
        </TestWrapper>
      );

      const fileInput = screen.getByLabelText(/import backup/i);
      await user.upload(fileInput, mockFile);

      expect(mockUseGuides.importFromFile).toHaveBeenCalledWith(mockFile, expect.any(Function));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalled();
      });
    });

    it('should show error toast for invalid JSON file', async () => {
      const user = userEvent.setup();
      const invalidFile = new File(['invalid json content'], 'invalid.json', { type: 'application/json' });
      
      mockUseGuides.importFromFile.mockRejectedValueOnce(new Error('Failed to parse import file: Unexpected token'));

      render(
        <TestWrapper>
          <GuideLibrary />
        </TestWrapper>
      );

      const fileInput = screen.getByLabelText(/import backup/i);
      await user.upload(fileInput, invalidFile);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });
    });

    it('should handle text file import', async () => {
      const user = userEvent.setup();
      const txtFile = new File(['Guide content here'], 'guide.txt', { type: 'text/plain' });
      
      mockUseGuides.importFromFile.mockResolvedValueOnce({
        imported: 1,
        skipped: 0,
        errors: []
      });

      render(
        <TestWrapper>
          <GuideLibrary />
        </TestWrapper>
      );

      const fileInput = screen.getByLabelText(/import backup/i);
      await user.upload(fileInput, txtFile);

      expect(mockUseGuides.importFromFile).toHaveBeenCalledWith(txtFile, expect.any(Function));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalled();
      });
    });
  });

  describe('Confirmation Dialogs', () => {
    it('should show confirmation dialog when deleting guide', async () => {
      const user = userEvent.setup();
      const mockGuide = {
        id: '1',
        title: 'Test Guide',
        content: 'Test content',
        url: 'test://url',
        dateAdded: new Date(),
        dateModified: new Date(),
        size: 100
      };

      mockUseGuides.guides = [mockGuide];

      render(
        <TestWrapper>
          <GuideLibrary />
        </TestWrapper>
      );

      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      if (deleteButtons.length > 0) {
        await user.click(deleteButtons[0]);

        // Wait for confirmation toast to be called
        await waitFor(() => {
          expect(toast.custom).toHaveBeenCalled();
        });

        // Get the confirmation options from the showConfirmation call
        // The onConfirm callback should be available in the rendered component
        // For now, we'll just verify the confirmation was shown
        // In a real test, we would simulate clicking the confirm button
      }
    });
  });

  describe('URL Import', () => {
    it('should disable fetch button for empty URL', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <GuideLibrary />
        </TestWrapper>
      );

      const urlTab = screen.getByRole('button', { name: /from url/i });
      await user.click(urlTab);

      const fetchButton = screen.getByRole('button', { name: /fetch guide/i });
      
      // Button should be disabled when URL is empty
      expect(fetchButton).toBeDisabled();
      
      // Type a URL and button should be enabled
      const urlInput = screen.getByPlaceholderText(/enter guide url/i);
      await user.type(urlInput, 'https://example.com/guide.txt');
      
      expect(fetchButton).not.toBeDisabled();
    });

    it('should attempt to fetch guide with valid URL', async () => {
      const user = userEvent.setup();
      mockUseGuides.fetchGuide.mockResolvedValueOnce(undefined);
      
      render(
        <TestWrapper>
          <GuideLibrary />
        </TestWrapper>
      );

      const urlTab = screen.getByRole('button', { name: /from url/i });
      await user.click(urlTab);

      // Wait for the tab content to be visible
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/enter guide url/i)).toBeInTheDocument();
      });

      const urlInput = screen.getByPlaceholderText(/enter guide url/i);
      await user.type(urlInput, 'https://example.com/guide.txt');

      const fetchButton = screen.getByRole('button', { name: /fetch guide/i });
      await user.click(fetchButton);

      // Wait for the async operation to complete
      await waitFor(() => {
        expect(mockUseGuides.fetchGuide).toHaveBeenCalledWith('https://example.com/guide.txt');
      });

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalled();
      });
    });
  });
});