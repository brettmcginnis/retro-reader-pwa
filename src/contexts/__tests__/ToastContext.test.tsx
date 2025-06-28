import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider } from '../ToastContext';
import { useToast } from '../useToast';
import { ToastType } from '../../types';

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
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    // Clean up any pending timers
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  describe('Toast Display', () => {
    it('should display success toast with correct styling', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      
      render(
        <TestWrapper>
          <TestToastComponent />
        </TestWrapper>
      );

      const successButton = screen.getByRole('button', { name: /show success/i });
      await user.click(successButton);

      expect(screen.getByText('success Title')).toBeInTheDocument();
      expect(screen.getByText('This is a success message')).toBeInTheDocument();
      
      const toast = screen.getByText('success Title').closest('.toast');
      expect(toast).toHaveClass('toast-success');
      
      expect(screen.getByText('✅')).toBeInTheDocument();
    });

    it('should display error toast with correct styling', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      
      render(
        <TestWrapper>
          <TestToastComponent />
        </TestWrapper>
      );

      const errorButton = screen.getByRole('button', { name: /show error/i });
      await user.click(errorButton);

      expect(screen.getByText('error Title')).toBeInTheDocument();
      expect(screen.getByText('This is a error message')).toBeInTheDocument();
      
      const toast = screen.getByText('error Title').closest('.toast');
      expect(toast).toHaveClass('toast-error');
      expect(screen.getByText('❌')).toBeInTheDocument();
    });

    it('should display warning toast with correct styling', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      
      render(
        <TestWrapper>
          <TestToastComponent />
        </TestWrapper>
      );

      const warningButton = screen.getByRole('button', { name: /show warning/i });
      await user.click(warningButton);

      expect(screen.getByText('warning Title')).toBeInTheDocument();
      const toast = screen.getByText('warning Title').closest('.toast');
      expect(toast).toHaveClass('toast-warning');
      expect(screen.getByText('⚠️')).toBeInTheDocument();
    });

    it('should display info toast with correct styling', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      
      render(
        <TestWrapper>
          <TestToastComponent />
        </TestWrapper>
      );

      const infoButton = screen.getByRole('button', { name: /show info/i });
      await user.click(infoButton);

      expect(screen.getByText('info Title')).toBeInTheDocument();
      const toast = screen.getByText('info Title').closest('.toast');
      expect(toast).toHaveClass('toast-info');
      expect(screen.getByText('ℹ️')).toBeInTheDocument();
    });
  });

  describe('Toast Auto-Dismiss', () => {
    it('should auto-dismiss toast after specified duration', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      
      render(
        <TestWrapper>
          <TestToastComponent />
        </TestWrapper>
      );

      const successButton = screen.getByRole('button', { name: /show success/i });
      await user.click(successButton);

      expect(screen.getByText('success Title')).toBeInTheDocument();

      // Advance timers without manual act()
      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(screen.queryByText('success Title')).not.toBeInTheDocument();
      });
    });

    it('should allow manual dismissal of toast', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      
      render(
        <TestWrapper>
          <TestToastComponent />
        </TestWrapper>
      );

      const successButton = screen.getByRole('button', { name: /show success/i });
      await user.click(successButton);

      expect(screen.getByText('success Title')).toBeInTheDocument();

      const closeButton = screen.getByRole('button', { name: /close notification/i });
      await user.click(closeButton);

      expect(screen.queryByText('success Title')).not.toBeInTheDocument();
    });
  });

  describe('Multiple Toasts', () => {
    it('should display multiple toasts stacked', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      
      render(
        <TestWrapper>
          <TestToastComponent />
        </TestWrapper>
      );

      await user.click(screen.getByRole('button', { name: /show success/i }));
      await user.click(screen.getByRole('button', { name: /show error/i }));
      await user.click(screen.getByRole('button', { name: /show warning/i }));

      expect(screen.getByText('success Title')).toBeInTheDocument();
      expect(screen.getByText('error Title')).toBeInTheDocument();
      expect(screen.getByText('warning Title')).toBeInTheDocument();
    });

    it('should clear all toasts when clearAllToasts is called', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      
      render(
        <TestWrapper>
          <TestToastComponent />
        </TestWrapper>
      );

      await user.click(screen.getByRole('button', { name: /show success/i }));
      await user.click(screen.getByRole('button', { name: /show error/i }));

      expect(screen.getByText('success Title')).toBeInTheDocument();
      expect(screen.getByText('error Title')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /clear all/i }));

      expect(screen.queryByText('success Title')).not.toBeInTheDocument();
      expect(screen.queryByText('error Title')).not.toBeInTheDocument();
    });
  });

  describe('Confirmation Dialog', () => {
    it('should display confirmation modal with correct content', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      
      render(
        <TestWrapper>
          <TestToastComponent />
        </TestWrapper>
      );

      const confirmButton = screen.getByRole('button', { name: /show confirmation/i });
      await user.click(confirmButton);

      expect(screen.getByText('Test Confirmation')).toBeInTheDocument();
      expect(screen.getByText('Are you sure you want to proceed?')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /yes, proceed/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('should handle confirmation action', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      
      render(
        <TestWrapper>
          <TestToastComponent />
        </TestWrapper>
      );

      await user.click(screen.getByRole('button', { name: /show confirmation/i }));

      const confirmButton = screen.getByRole('button', { name: /yes, proceed/i });
      await user.click(confirmButton);

      expect(screen.queryByText('Test Confirmation')).not.toBeInTheDocument();

      expect(await screen.findByText('Confirmed')).toBeInTheDocument();
      expect(screen.getByText('Action was confirmed')).toBeInTheDocument();
    });

    it('should handle cancel action', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      
      render(
        <TestWrapper>
          <TestToastComponent />
        </TestWrapper>
      );

      await user.click(screen.getByRole('button', { name: /show confirmation/i }));

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(screen.queryByText('Test Confirmation')).not.toBeInTheDocument();

      expect(await screen.findByText('Cancelled')).toBeInTheDocument();
      expect(screen.getByText('Action was cancelled')).toBeInTheDocument();
    });

    it('should close modal when clicking overlay', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      
      render(
        <TestWrapper>
          <TestToastComponent />
        </TestWrapper>
      );

      await user.click(screen.getByRole('button', { name: /show confirmation/i }));

      const overlay = screen.getByText('Test Confirmation').closest('.confirmation-overlay');
      await user.click(overlay!);

      expect(screen.queryByText('Test Confirmation')).not.toBeInTheDocument();

      expect(await screen.findByText('Cancelled')).toBeInTheDocument();
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