import React from 'react';

interface LoadingProps {
  message?: string;
}

export const Loading: React.FC<LoadingProps> = ({ message = 'Loading guide...' }) => {
  return (
    <div className="flex items-center justify-center h-screen bg-retro-50 dark:bg-retro-950">
      <div className="text-lg text-retro-600 dark:text-retro-400">{message}</div>
    </div>
  );
};