import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

/**
 * Toast notification data
 */
interface Toast {
  /** Unique identifier for the toast */
  id: string;
  /** Type of toast notification */
  type: ToastType;
  /** Title text for the toast */
  title: string;
  /** Optional message text */
  message?: string;
  /** Duration in milliseconds before auto-dismiss */
  duration?: number;
  /** Timestamp when the toast was created */
  createdAt: number;
}

/**
 * State interface for toast notifications
 */
interface ToastState {
  /** Array of active toast notifications */
  toasts: Toast[];
}

/**
 * Actions for managing toast notifications
 */
interface ToastActions {
  /** Shows a new toast notification */
  showToast: (type: ToastType, title: string, message?: string, duration?: number) => string;
  /** Dismisses a specific toast by ID */
  dismissToast: (id: string) => void;
  /** Dismisses all active toasts */
  dismissAllToasts: () => void;
}

type ToastStore = ToastState & ToastActions;

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],

  showToast: (type, title, message, duration = 3000) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const toast: Toast = {
      id,
      type,
      title,
      message,
      duration,
      createdAt: Date.now(),
    };

    set((state) => ({
      toasts: [...state.toasts, toast],
    }));

    // Auto-dismiss after duration
    if (duration > 0) {
      setTimeout(() => {
        get().dismissToast(id);
      }, duration);
    }

    return id;
  },

  dismissToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },

  dismissAllToasts: () => {
    set({ toasts: [] });
  },
}));