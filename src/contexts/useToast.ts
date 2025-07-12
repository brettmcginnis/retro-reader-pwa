import { useToastStore } from '../stores/useToastStore';
import { ToastType, ConfirmationOptions } from '../types';

export const useToast = () => {
  const { showToast } = useToastStore();

  const confirm = async (options: ConfirmationOptions): Promise<boolean> => {
    // For now, we'll use the browser's native confirm dialog
    // In a future enhancement, this could be replaced with a custom modal
    return window.confirm(`${options.title}\n\n${options.message || ''}`);
  };

  return {
    showToast,
    confirm,
  };
}; 