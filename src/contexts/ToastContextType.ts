import { ToastType, ConfirmationOptions } from '../types';

export interface ToastContextType {
  showToast: (type: ToastType, title: string, message?: string, duration?: number) => string;
  showConfirmation: (options: ConfirmationOptions) => void;
  clearAllToasts: () => void;
} 