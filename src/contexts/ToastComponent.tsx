import React from 'react';
import { Toast, ToastType } from '../types';

interface ToastComponentProps {
  toast: Toast;
  onRemove: () => void;
}

const ToastComponent: React.FC<ToastComponentProps> = ({ toast, onRemove }) => {
  const getToastIcon = (type: ToastType): string => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className={`toast toast-${toast.type}`}>
      <div className="toast-content">
        <div className="toast-icon">
          {getToastIcon(toast.type)}
        </div>
        <div className="toast-text">
          <div className="toast-title">{toast.title}</div>
          {toast.message && (
            <div className="toast-message">{toast.message}</div>
          )}
        </div>
        <button
          onClick={onRemove}
          className="toast-close"
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
      {toast.action && (
        <div className="toast-action">
          <button
            onClick={toast.action.onClick}
            className="toast-action-btn"
          >
            {toast.action.label}
          </button>
        </div>
      )}
    </div>
  );
};

export default ToastComponent; 