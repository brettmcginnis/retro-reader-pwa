import { Toast, ToastType, ConfirmationOptions } from '../types';

export interface ToastContextType {
  toasts: Toast[];
  showToast: (type: ToastType, title: string, message?: string, duration?: number) => string;
  showConfirmation: (options: ConfirmationOptions) => void;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
} 