import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GuideLibrary } from '../GuideLibrary';
import { ToastProvider } from '../../contexts/ToastContext';
import { AppProvider } from '../../contexts/AppContext';

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

jest.mock('../../hooks/useGuides', () => ({
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
  });

  describe('Export All Functionality', () => {
    it('should export collection as JSON when Export All is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <GuideLibrary />
        </TestWrapper>
      );

      // Find and click Export All button
      const exportAllButton = screen.getByText('Export All');
      await user.click(exportAllButton);

      // Verify export function was called
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

      const exportAllButton = screen.getByText('Export All');
      await user.click(exportAllButton);

      // Wait for success toast to appear
      await waitFor(() => {
        expect(screen.getByText('Guide Exported')).toBeInTheDocument();
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

      const exportAllButton = screen.getByText('Export All');
      await user.click(exportAllButton);

      // Wait for error toast to appear
      await waitFor(() => {
        expect(screen.getByText('Failed to export guide')).toBeInTheDocument();
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
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

      // Find the hidden file input and simulate file selection
      const fileInput = screen.getByLabelText('Import Backup');
      await user.upload(fileInput, mockFile);

      // Verify import function was called with the file
      expect(mockUseGuides.importFromFile).toHaveBeenCalledWith(mockFile, expect.any(Function));

      // Wait for success toast
      await waitFor(() => {
        expect(screen.getByText('Import Completed')).toBeInTheDocument();
        expect(screen.getByText('Imported: 1, Skipped: 0, Errors: 0')).toBeInTheDocument();
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

      const fileInput = screen.getByLabelText('Import Backup');
      await user.upload(fileInput, invalidFile);

      // Wait for error toast
      await waitFor(() => {
        expect(screen.getByText('Import Failed')).toBeInTheDocument();
        expect(screen.getByText(/Failed to parse import file/)).toBeInTheDocument();
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

      const fileInput = screen.getByLabelText('Import Backup');
      await user.upload(fileInput, txtFile);

      // Verify import was called
      expect(mockUseGuides.importFromFile).toHaveBeenCalledWith(txtFile, expect.any(Function));

      // Wait for success toast
      await waitFor(() => {
        expect(screen.getByText('Guide Created')).toBeInTheDocument();
        expect(screen.getByText('Guide created successfully from "guide.txt"')).toBeInTheDocument();
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

      // Mock guides data
      mockUseGuides.guides = [mockGuide];

      render(
        <TestWrapper>
          <GuideLibrary />
        </TestWrapper>
      );

      // Find delete button (assuming it's rendered for the guide)
      const deleteButtons = screen.getAllByText('Delete');
      if (deleteButtons.length > 0) {
        await user.click(deleteButtons[0]);

        // Check for confirmation modal
        await waitFor(() => {
          expect(screen.getByText('Delete Guide')).toBeInTheDocument();
          expect(screen.getByText(/Are you sure you want to delete/)).toBeInTheDocument();
        });

        // Click confirm - find the button in the confirmation modal
        const confirmationModal = screen.getByText('Delete Guide').closest('.confirmation-modal');
        const confirmButton = confirmationModal?.querySelector('.confirm-btn');
        if (confirmButton) {
          await user.click(confirmButton);
        }

        expect(mockUseGuides.deleteGuide).toHaveBeenCalledWith('1');
      }
    });
  });

  describe('URL Import', () => {
    it('should show warning toast for empty URL', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <GuideLibrary />
        </TestWrapper>
      );

      // Click on "From URL" tab
      const urlTab = screen.getByText('From URL');
      await user.click(urlTab);

      // Find fetch button and click it with empty URL
      const fetchButton = screen.getByText('Fetch Guide');
      await user.click(fetchButton);

      // Should show warning toast for empty URL
      await waitFor(() => {
        expect(screen.getByText('URL Required')).toBeInTheDocument();
        expect(screen.getByText('Please enter a URL to fetch the guide')).toBeInTheDocument();
      });
    });

    it('should attempt to fetch guide with valid URL', async () => {
      const user = userEvent.setup();
      mockUseGuides.fetchGuide.mockResolvedValueOnce(undefined);
      
      render(
        <TestWrapper>
          <GuideLibrary />
        </TestWrapper>
      );

      // Click on "From URL" tab
      const urlTab = screen.getByText('From URL');
      await user.click(urlTab);

      // Enter URL
      const urlInput = screen.getByPlaceholderText(/Enter guide URL/);
      await user.type(urlInput, 'https://example.com/guide.txt');

      // Click fetch
      const fetchButton = screen.getByText('Fetch Guide');
      await user.click(fetchButton);

      expect(mockUseGuides.fetchGuide).toHaveBeenCalledWith('https://example.com/guide.txt');

      // Should show success toast
      await waitFor(() => {
        expect(screen.getByText('Guide Added')).toBeInTheDocument();
      });
    });
  });
});