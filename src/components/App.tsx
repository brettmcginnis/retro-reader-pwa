import React from 'react';
import { ToastProvider } from '../contexts/ToastContext';
import { AppContentContainer } from '../containers/AppContentContainer';

export const App: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden">
      <ToastProvider>
        <AppContentContainer />
      </ToastProvider>
    </div>
  );
};