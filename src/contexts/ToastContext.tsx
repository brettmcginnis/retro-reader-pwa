import React, { ReactNode } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { Check, X, AlertTriangle, Info } from 'lucide-react';
import { ToastContext } from './ToastContextInstance';
import { ToastType, ConfirmationOptions } from '../types';

interface ToastProviderProps {
  children: ReactNode;
}

/**
 * Provider component for toast notifications and confirmation dialogs.
 * @param props - Component props
 * @param props.children - Child components to wrap with toast context
 */
export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const showToast = (type: ToastType, title: string, message?: string, duration?: number): string => {
    const toastId = toast.custom(
      (t) => (
        <div 
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave pointer-events-none'
          } max-w-md w-full bg-white dark:bg-retro-900 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-20 cursor-pointer`}
          onClick={() => toast.dismiss(t.id)}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start space-x-3">
              {type === 'success' && <Check className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />}
              {type === 'error' && <X className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />}
              {type === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />}
              {type === 'info' && <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />}
              <div className="flex-1">
                <p className="font-medium text-retro-900 dark:text-retro-100">{title}</p>
                {message && <p className="text-sm text-retro-600 dark:text-retro-400 mt-1">{message}</p>}
              </div>
            </div>
          </div>
          <div className="flex border-l border-retro-200 dark:border-retro-700">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toast.dismiss(t.id);
              }}
              className="w-full p-4 flex items-center justify-center hover:bg-retro-50 dark:hover:bg-retro-800 rounded-r-lg transition-colors duration-150"
              aria-label="Dismiss notification"
            >
              <X className="w-5 h-5 text-retro-400 dark:text-retro-500" />
            </button>
          </div>
        </div>
      ),
      {
        duration: duration || (type === 'error' ? 6000 : 4000),
        position: 'top-right' as const,
      }
    );

    return String(toastId);
  };

  const showConfirmation = (options: ConfirmationOptions): void => {
    const toastId = toast.custom(
      (t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white dark:bg-retro-900 shadow-lg rounded-lg pointer-events-auto flex flex-col ring-1 ring-black ring-opacity-5`}>
          <div className="p-4">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5 mr-3" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-retro-900 dark:text-retro-100">
                  {options.title}
                </h3>
                <p className="mt-1 text-sm text-retro-600 dark:text-retro-400">
                  {options.message}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-retro-50 dark:bg-retro-800 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={() => {
                toast.dismiss(t.id);
                if (options.onConfirm) {
                  options.onConfirm();
                }
              }}
            >
              {options.confirmText || 'Confirm'}
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-retro-300 dark:border-retro-600 shadow-sm px-4 py-2 bg-white dark:bg-retro-800 text-base font-medium text-retro-700 dark:text-retro-300 hover:bg-retro-50 dark:hover:bg-retro-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={() => {
                toast.dismiss(t.id);
                if (options.onCancel) {
                  options.onCancel();
                }
              }}
            >
              {options.cancelText || 'Cancel'}
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        position: 'top-center',
      }
    );

    // Store toastId for potential cleanup
    (window as Window & { __confirmationToastId?: string }).__confirmationToastId = toastId;
  };

  const clearAllToasts = () => {
    toast.dismiss();
  };

  return (
    <ToastContext.Provider value={{ showToast, showConfirmation, clearAllToasts }}>
      {children}
      <Toaster
        position="top-right"
      />
    </ToastContext.Provider>
  );
};