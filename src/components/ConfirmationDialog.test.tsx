import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ConfirmationDialog } from './ConfirmationDialog';
import { useConfirmationStore } from '../stores/useConfirmationStore';
import { act } from '@testing-library/react';

describe('ConfirmationDialog', () => {
  beforeEach(() => {
    useConfirmationStore.setState({
      isOpen: false,
      options: null,
      resolve: null,
    });
  });

  it('should not render when not open', () => {
    render(<ConfirmationDialog />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should render dialog when open', async () => {
    act(() => {
      useConfirmationStore.setState({
        isOpen: true,
        options: {
          title: 'Test Confirmation',
          message: 'Are you sure?',
        },
        resolve: jest.fn(),
      });
    });

    render(<ConfirmationDialog />);
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Test Confirmation')).toBeInTheDocument();
      expect(screen.getByText('Are you sure?')).toBeInTheDocument();
    });
  });

  it('should use custom button text when provided', () => {
    act(() => {
      useConfirmationStore.setState({
        isOpen: true,
        options: {
          title: 'Delete Item',
          message: 'This cannot be undone',
          confirmText: 'Delete',
          cancelText: 'Keep',
        },
        resolve: jest.fn(),
      });
    });

    render(<ConfirmationDialog />);
    
    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('Keep')).toBeInTheDocument();
  });

  it('should use default button text when not provided', () => {
    act(() => {
      useConfirmationStore.setState({
        isOpen: true,
        options: {
          title: 'Confirm Action',
          message: 'Continue?',
        },
        resolve: jest.fn(),
      });
    });

    render(<ConfirmationDialog />);
    
    expect(screen.getByText('Confirm')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('should call handleConfirm when confirm button is clicked', () => {
    const mockResolve = jest.fn();
    
    act(() => {
      useConfirmationStore.setState({
        isOpen: true,
        options: {
          title: 'Test',
          message: 'Test message',
        },
        resolve: mockResolve,
      });
    });

    render(<ConfirmationDialog />);
    
    fireEvent.click(screen.getByText('Confirm'));
    
    expect(mockResolve).toHaveBeenCalledWith(true);
    expect(useConfirmationStore.getState().isOpen).toBe(false);
  });

  it('should call handleCancel when cancel button is clicked', () => {
    const mockResolve = jest.fn();
    
    act(() => {
      useConfirmationStore.setState({
        isOpen: true,
        options: {
          title: 'Test',
          message: 'Test message',
        },
        resolve: mockResolve,
      });
    });

    render(<ConfirmationDialog />);
    
    fireEvent.click(screen.getByText('Cancel'));
    
    expect(mockResolve).toHaveBeenCalledWith(false);
    expect(useConfirmationStore.getState().isOpen).toBe(false);
  });

  it('should call handleCancel when close button is clicked', async () => {
    const mockResolve = jest.fn();
    
    act(() => {
      useConfirmationStore.setState({
        isOpen: true,
        options: {
          title: 'Test',
          message: 'Test message',
        },
        resolve: mockResolve,
      });
    });

    render(<ConfirmationDialog />);
    
    // Wait for the dialog to be fully rendered
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    
    // Find the close button by its svg icon
    const closeButton = screen.getByRole('button', { name: 'Close' });
    fireEvent.click(closeButton);
    
    expect(mockResolve).toHaveBeenCalledWith(false);
    expect(useConfirmationStore.getState().isOpen).toBe(false);
  });
});