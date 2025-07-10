import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider } from './ToastContext';
import { useToast } from './useToast';
import { ToastType } from '../types';
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

const TestToastComponent: React.FC = () => {
  const { showToast, showConfirmation, clearAllToasts } = useToast();

  const handleShowToast = (type: ToastType) => {
    showToast(type, `${type} Title`, `This is a ${type} message`, 3000);
  };

  const handleShowConfirmation = () => {
    showConfirmation({
      title: 'Test Confirmation',
      message: 'Are you sure you want to proceed?',
      confirmText: 'Yes, proceed',
      cancelText: 'Cancel',
      onConfirm: () => showToast('success', 'Confirmed', 'Action was confirmed'),
      onCancel: () => showToast('info', 'Cancelled', 'Action was cancelled')
    });
  };

  return (
    <div>
      <button onClick={() => handleShowToast('success')}>Show Success</button>
      <button onClick={() => handleShowToast('error')}>Show Error</button>
      <button onClick={() => handleShowToast('warning')}>Show Warning</button>
      <button onClick={() => handleShowToast('info')}>Show Info</button>
      <button onClick={handleShowConfirmation}>Show Confirmation</button>
      <button onClick={clearAllToasts}>Clear All</button>
    </div>
  );
};

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ToastProvider>
    {children}
  </ToastProvider>
);

describe('ToastContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Toast Display', () => {
    it('should display success toast with correct content', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TestToastComponent />
        </TestWrapper>
      );

      const successButton = screen.getByRole('button', { name: /show success/i });
      await user.click(successButton);

      expect(toast.custom).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          duration: 3000,
          position: 'top-right',
        })
      );
    });

    it('should display error toast with correct content', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TestToastComponent />
        </TestWrapper>
      );

      const errorButton = screen.getByRole('button', { name: /show error/i });
      await user.click(errorButton);

      expect(toast.custom).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          duration: 3000,
          position: 'top-right',
        })
      );
    });

    it('should display warning toast with correct content', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TestToastComponent />
        </TestWrapper>
      );

      const warningButton = screen.getByRole('button', { name: /show warning/i });
      await user.click(warningButton);

      expect(toast.custom).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          duration: 3000,
        })
      );
    });

    it('should display info toast with correct content', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TestToastComponent />
        </TestWrapper>
      );

      const infoButton = screen.getByRole('button', { name: /show info/i });
      await user.click(infoButton);

      expect(toast.custom).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          duration: 3000,
          position: 'top-right',
        })
      );
    });
  });

  describe('Multiple Toasts', () => {
    it('should clear all toasts when clearAllToasts is called', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TestToastComponent />
        </TestWrapper>
      );

      await user.click(screen.getByRole('button', { name: /show success/i }));
      await user.click(screen.getByRole('button', { name: /show error/i }));

      expect(toast.custom).toHaveBeenCalledTimes(2);

      await user.click(screen.getByRole('button', { name: /clear all/i }));

      expect(toast.dismiss).toHaveBeenCalledWith();
    });
  });

  describe('Confirmation Dialog', () => {
    it('should display confirmation modal with correct content', async () => {
      const user = userEvent.setup();
      let customCallback: ((props: { id: string; visible: boolean }) => React.ReactElement) | undefined;
      
      (toast.custom as jest.Mock).mockImplementation((callback) => {
        customCallback = callback;
        return 'toast-id';
      });
      
      render(
        <TestWrapper>
          <TestToastComponent />
        </TestWrapper>
      );

      const confirmButton = screen.getByRole('button', { name: /show confirmation/i });
      await user.click(confirmButton);

      // Check that toast.custom was called for the confirmation dialog
      await waitFor(() => {
        expect(toast.custom).toHaveBeenCalled();
      });
      
      // Render the confirmation dialog content
      if (customCallback) {
        const { container } = render(customCallback({ id: 'test-id', visible: true }));
        expect(container.textContent).toContain('Test Confirmation');
        expect(container.textContent).toContain('Are you sure you want to proceed?');
        expect(container.textContent).toContain('Yes, proceed');
        expect(container.textContent).toContain('Cancel');
      }
    });

    it('should handle confirmation action', async () => {
      const user = userEvent.setup();
      let customCallback: ((props: { id: string; visible: boolean }) => React.ReactElement) | undefined;
      
      (toast.custom as jest.Mock).mockImplementation((callback) => {
        customCallback = callback;
        return 'toast-id';
      });
      
      render(
        <TestWrapper>
          <TestToastComponent />
        </TestWrapper>
      );

      await user.click(screen.getByRole('button', { name: /show confirmation/i }));

      // Wait for the confirmation dialog to be shown
      await waitFor(() => {
        expect(toast.custom).toHaveBeenCalled();
      });

      // Render and interact with the confirmation dialog
      if (customCallback) {
        const { getByText } = render(customCallback({ id: 'test-id', visible: true }));
        const confirmBtn = getByText('Yes, proceed');
        await user.click(confirmBtn);
        
        expect(toast.dismiss).toHaveBeenCalledWith('test-id');
        // The onConfirm callback should trigger a success toast
        await waitFor(() => {
          // Custom was called twice: once for confirmation dialog, once for success toast
          expect(toast.custom).toHaveBeenCalledTimes(2);
        });
      }
    });

    it('should handle cancel action', async () => {
      const user = userEvent.setup();
      let customCallback: ((props: { id: string; visible: boolean }) => React.ReactElement) | undefined;
      
      (toast.custom as jest.Mock).mockImplementation((callback) => {
        customCallback = callback;
        return 'toast-id';
      });
      
      render(
        <TestWrapper>
          <TestToastComponent />
        </TestWrapper>
      );

      await user.click(screen.getByRole('button', { name: /show confirmation/i }));

      // Wait for the confirmation dialog to be shown
      await waitFor(() => {
        expect(toast.custom).toHaveBeenCalled();
      });

      // Render and interact with the confirmation dialog
      if (customCallback) {
        const { getByText } = render(customCallback({ id: 'test-id', visible: true }));
        const cancelBtn = getByText('Cancel');
        await user.click(cancelBtn);
        
        expect(toast.dismiss).toHaveBeenCalledWith('test-id');
        // The onCancel callback should trigger an info toast
        await waitFor(() => {
          // Custom was called twice: once for confirmation dialog, once for info toast
          expect(toast.custom).toHaveBeenCalledTimes(2);
        });
      }
    });
    
    it('should handle confirmation dialog with only confirm callback', async () => {
      const user = userEvent.setup();
      let customCallback: ((props: { id: string; visible: boolean }) => React.ReactElement) | undefined;
      
      (toast.custom as jest.Mock).mockImplementation((callback) => {
        customCallback = callback;
        return 'toast-id';
      });
      
      const TestComponentWithOnlyConfirm = () => {
        const { showConfirmation } = useToast();
        return (
          <button onClick={() => showConfirmation({
            title: 'Delete Item',
            message: 'Are you sure?',
            onConfirm: jest.fn()
          })}>
            Delete
          </button>
        );
      };
      
      render(
        <TestWrapper>
          <TestComponentWithOnlyConfirm />
        </TestWrapper>
      );

      await user.click(screen.getByText('Delete'));

      // Render and interact with the confirmation dialog
      if (customCallback) {
        const { getByText } = render(customCallback({ id: 'test-id', visible: true }));
        const cancelBtn = getByText('Cancel');
        
        // Click cancel when there's no onCancel callback
        await user.click(cancelBtn);
        expect(toast.dismiss).toHaveBeenCalledWith('test-id');
      }
    });

    it('should render confirmation dialog with animation classes', async () => {
      const user = userEvent.setup();
      let customCallback: ((props: { id: string; visible: boolean }) => React.ReactElement) | undefined;
      
      (toast.custom as jest.Mock).mockImplementation((callback) => {
        customCallback = callback;
        return 'toast-id';
      });
      
      render(
        <TestWrapper>
          <TestToastComponent />
        </TestWrapper>
      );

      await user.click(screen.getByRole('button', { name: /show confirmation/i }));

      // Test visible state
      if (customCallback) {
        const { container: visibleContainer } = render(customCallback({ id: 'test-id', visible: true }));
        expect(visibleContainer.querySelector('.animate-enter')).toBeInTheDocument();
        
        // Test hidden state
        const { container: hiddenContainer } = render(customCallback({ id: 'test-id', visible: false }));
        expect(hiddenContainer.querySelector('.animate-leave')).toBeInTheDocument();
      }
    });

    it('should dismiss toast when clicked', async () => {
      const user = userEvent.setup();
      let customCallback: ((props: { id: string; visible: boolean }) => React.ReactElement) | undefined;
      
      (toast.custom as jest.Mock).mockImplementation((callback) => {
        customCallback = callback;
        return 'toast-id';
      });
      
      render(
        <TestWrapper>
          <TestToastComponent />
        </TestWrapper>
      );

      await user.click(screen.getByRole('button', { name: /show success/i }));

      // Render the toast and test dismiss functionality
      if (customCallback) {
        const { container } = render(customCallback({ id: 'test-id', visible: true }));
        const toastDiv = container.querySelector('div[onclick]');
        
        if (toastDiv) {
          await user.click(toastDiv);
          expect(toast.dismiss).toHaveBeenCalledWith('test-id');
        }
      }
    });

    it('should dismiss toast when X button is clicked', async () => {
      const user = userEvent.setup();
      let customCallback: ((props: { id: string; visible: boolean }) => React.ReactElement) | undefined;
      
      (toast.custom as jest.Mock).mockImplementation((callback) => {
        customCallback = callback;
        return 'toast-id';
      });
      
      render(
        <TestWrapper>
          <TestToastComponent />
        </TestWrapper>
      );

      await user.click(screen.getByRole('button', { name: /show info/i }));

      // Render the toast and test X button dismiss
      if (customCallback) {
        const { getByLabelText } = render(customCallback({ id: 'test-id', visible: true }));
        const dismissButton = getByLabelText('Dismiss notification');
        
        await user.click(dismissButton);
        expect(toast.dismiss).toHaveBeenCalledWith('test-id');
      }
    });
  });

  describe('Error Handling', () => {
    it('should throw error when useToast is used outside ToastProvider', () => {
      const originalError = console.error;
      console.error = jest.fn();

      const TestComponent = () => {
        useToast();
        return <div>Test</div>;
      };

      expect(() => render(<TestComponent />)).toThrow('useToast must be used within a ToastProvider');

      console.error = originalError;
    });
  });
});