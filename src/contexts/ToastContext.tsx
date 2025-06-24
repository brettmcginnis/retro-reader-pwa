import React, { useState, ReactNode, useCallback } from 'react';
import { Toast, ToastType, ConfirmationOptions } from '../types';
import ToastComponent from './ToastComponent';
import { ToastContext } from './ToastContextInstance';

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmation, setConfirmation] = useState<ConfirmationOptions | null>(null);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showToast = useCallback((
    type: ToastType,
    title: string,
    message?: string,
    duration: number = 5000
  ): string => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    
    const toast: Toast = {
      id,
      type,
      title,
      message,
      duration
    };

    setToasts(prev => [...prev, toast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, [removeToast]);

  const showConfirmation = useCallback((options: ConfirmationOptions) => {
    setConfirmation(options);
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const hideConfirmation = useCallback(() => {
    setConfirmation(null);
  }, []);

  const handleConfirm = useCallback(() => {
    if (confirmation) {
      confirmation.onConfirm();
      hideConfirmation();
    }
  }, [confirmation, hideConfirmation]);

  const handleCancel = useCallback(() => {
    if (confirmation) {
      confirmation.onCancel?.();
      hideConfirmation();
    }
  }, [confirmation, hideConfirmation]);

  return (
    <ToastContext.Provider
      value={{
        toasts,
        showToast,
        showConfirmation,
        removeToast,
        clearAllToasts
      }}
    >
      {children}
      
      {/* Toast Container */}
      <div className="toast-container">
        {toasts.map(toast => (
          <ToastComponent
            key={toast.id}
            toast={toast}
            onRemove={() => removeToast(toast.id)}
          />
        ))}
      </div>

      {/* Confirmation Modal */}
      {confirmation && (
        <div className="confirmation-overlay" onClick={handleCancel}>
          <div className="confirmation-modal" onClick={e => e.stopPropagation()}>
            <div className="confirmation-header">
              <h3>{confirmation.title}</h3>
            </div>
            <div className="confirmation-body">
              <p>{confirmation.message}</p>
            </div>
            <div className="confirmation-actions">
              <button
                onClick={handleConfirm}
                className="confirm-btn primary-btn"
              >
                {confirmation.confirmText || 'Confirm'}
              </button>
              <button
                onClick={handleCancel}
                className="cancel-btn secondary-btn"
              >
                {confirmation.cancelText || 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
};

export default ToastProvider;