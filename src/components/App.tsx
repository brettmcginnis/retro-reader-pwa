import React from 'react';
import { AppProvider } from '../contexts/AppContext';
import { ToastProvider } from '../contexts/ToastContext';
import { AppContentContainer } from '../containers/AppContentContainer';

export const App: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden">
      <AppProvider>
        <ToastProvider>
          <AppContentContainer />
        </ToastProvider>
      </AppProvider>
    </div>
  );
};