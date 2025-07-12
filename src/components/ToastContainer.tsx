import React from 'react';
import { Check, X, AlertTriangle, Info } from 'lucide-react';
import { useToastStore } from '../stores/useToastStore';
import { ToastType } from '../types';

/**
 * Component that renders toast notifications from the toast store
 */
export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useToastStore();

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <Check className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />;
      case 'error':
        return <X className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />;
    }
  };

  return (
    <div className="fixed bottom-0 right-0 p-4 space-y-4 z-50 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="max-w-md w-full bg-white dark:bg-retro-900 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-20 cursor-pointer animate-enter"
          onClick={() => dismissToast(toast.id)}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start space-x-3">
              {getIcon(toast.type)}
              <div className="flex-1">
                <p className="font-medium text-retro-900 dark:text-retro-100">{toast.title}</p>
                {toast.message && (
                  <p className="text-sm text-retro-600 dark:text-retro-400 mt-1">{toast.message}</p>
                )}
              </div>
            </div>
          </div>
          <div className="flex border-l border-retro-200 dark:border-retro-700">
            <button
              onClick={(e) => {
                e.stopPropagation();
                dismissToast(toast.id);
              }}
              className="w-full p-4 flex items-center justify-center hover:bg-retro-50 dark:hover:bg-retro-800 rounded-r-lg transition-colors duration-150"
              aria-label="Dismiss notification"
            >
              <X className="w-5 h-5 text-retro-400 dark:text-retro-500" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};