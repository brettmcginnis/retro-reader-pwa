import React from 'react';
import { ToastContainer } from './ToastContainer';
import { AppContentContainer } from '../containers/AppContentContainer';

export const App: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden">
      <AppContentContainer />
      <ToastContainer />
    </div>
  );
};