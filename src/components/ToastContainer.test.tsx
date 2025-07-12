import { render, screen, fireEvent } from '@testing-library/react';
import { ToastContainer } from './ToastContainer';
import { useToastStore } from '../stores/useToastStore';
import { act } from '@testing-library/react';

describe('ToastContainer', () => {
  beforeEach(() => {
    // Reset store state
    useToastStore.setState({ toasts: [] });
  });

  it('should render empty when no toasts', () => {
    const { container } = render(<ToastContainer />);
    expect(container.querySelector('.animate-enter')).not.toBeInTheDocument();
  });

  it('should render success toast', () => {
    act(() => {
      useToastStore.getState().showToast('success', 'Success!', 'Operation completed');
    });

    render(<ToastContainer />);

    expect(screen.getByText('Success!')).toBeInTheDocument();
    expect(screen.getByText('Operation completed')).toBeInTheDocument();
  });

  it('should render multiple toasts', () => {
    act(() => {
      useToastStore.getState().showToast('error', 'Error occurred');
      useToastStore.getState().showToast('info', 'Information');
      useToastStore.getState().showToast('warning', 'Warning message');
    });

    render(<ToastContainer />);

    expect(screen.getByText('Error occurred')).toBeInTheDocument();
    expect(screen.getByText('Information')).toBeInTheDocument();
    expect(screen.getByText('Warning message')).toBeInTheDocument();
  });

  it('should dismiss toast when clicked', () => {
    act(() => {
      useToastStore.getState().showToast('info', 'Click me to dismiss');
    });

    render(<ToastContainer />);

    const toast = screen.getByText('Click me to dismiss').closest('.animate-enter');
    expect(toast).toBeInTheDocument();

    fireEvent.click(toast!);

    expect(screen.queryByText('Click me to dismiss')).not.toBeInTheDocument();
  });

  it('should dismiss toast when X button clicked', () => {
    act(() => {
      useToastStore.getState().showToast('info', 'Dismissible toast');
    });

    render(<ToastContainer />);

    const dismissButton = screen.getByLabelText('Dismiss notification');
    fireEvent.click(dismissButton);

    expect(screen.queryByText('Dismissible toast')).not.toBeInTheDocument();
  });

  it('should render toast without message', () => {
    act(() => {
      useToastStore.getState().showToast('success', 'Title only');
    });

    render(<ToastContainer />);

    expect(screen.getByText('Title only')).toBeInTheDocument();
    expect(screen.queryByText('undefined')).not.toBeInTheDocument();
  });

  it('should render correct icons for each toast type', () => {
    act(() => {
      useToastStore.getState().showToast('success', 'Success');
      useToastStore.getState().showToast('error', 'Error');
      useToastStore.getState().showToast('warning', 'Warning');
      useToastStore.getState().showToast('info', 'Info');
    });

    const { container } = render(<ToastContainer />);

    // Check for presence of different colored icons
    expect(container.querySelector('.text-green-500')).toBeInTheDocument(); // success
    expect(container.querySelector('.text-red-500')).toBeInTheDocument(); // error
    expect(container.querySelector('.text-amber-500')).toBeInTheDocument(); // warning
    expect(container.querySelector('.text-blue-500')).toBeInTheDocument(); // info
  });
});