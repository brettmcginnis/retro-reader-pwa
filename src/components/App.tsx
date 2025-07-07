import React from 'react';
import { AppProvider } from '../contexts/AppContext';
import { ToastProvider } from '../contexts/ToastContext';
import { AppContentContainer } from '../containers/AppContentContainer';

export const App: React.FC = () => {
  return (
    <AppProvider>
      <ToastProvider>
        <AppContentContainer />
      </ToastProvider>
    </AppProvider>
  );
};