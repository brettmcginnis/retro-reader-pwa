import React from 'react';
import { Check, X, AlertTriangle, Info } from 'lucide-react';
import { useToastStore, ToastType } from '../stores/useToastStore';

/**
 * Component that renders toast notifications from the toast store
 */
export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useToastStore();

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <Check className="w-6 h-6 text-green-500 dark:text-green-400 flex-shrink-0" />;
      case 'error':
        return <X className="w-6 h-6 text-red-500 dark:text-red-400 flex-shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-amber-500 dark:text-amber-400 flex-shrink-0" />;
      case 'info':
        return <Info className="w-6 h-6 text-blue-500 dark:text-blue-400 flex-shrink-0" />;
    }
  };

  return (
    <div className="fixed top-4 right-4 space-y-3 z-[60] pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="w-80 sm:w-96 bg-white dark:bg-retro-800 shadow-xl rounded-lg pointer-events-auto flex ring-2 ring-black ring-opacity-10 dark:ring-white dark:ring-opacity-10 cursor-pointer animate-enter overflow-hidden"
          onClick={() => dismissToast(toast.id)}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start space-x-3">
              {getIcon(toast.type)}
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-gray-900 dark:text-white break-words">{toast.title}</p>
                {toast.message && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 break-words leading-5">{toast.message}</p>
                )}
              </div>
            </div>
          </div>
          <div className="flex border-l-2 border-gray-200 dark:border-gray-700">
            <button
              onClick={(e) => {
                e.stopPropagation();
                dismissToast(toast.id);
              }}
              className="w-full px-4 py-2 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-retro-700 transition-colors duration-150"
              aria-label="Dismiss notification"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};