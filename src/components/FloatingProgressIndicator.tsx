import React from 'react';
import clsx from 'clsx';

interface FloatingProgressIndicatorProps {
  currentLine: number;
  totalLines: number;
  isVisible: boolean;
}

export const FloatingProgressIndicator: React.FC<FloatingProgressIndicatorProps> = ({
  currentLine,
  totalLines,
  isVisible
}) => {
  const percentage = Math.round((currentLine / totalLines) * 100);
  
  return (
    <div className={clsx(
      'fixed top-20 right-4 bg-black/70 text-white px-3 py-2 rounded-lg',
      'text-sm font-medium transition-opacity duration-300',
      'pointer-events-none sm:hidden', // Only show on mobile
      isVisible ? 'opacity-100' : 'opacity-0'
    )}>
      Line {currentLine} • {percentage}%
    </div>
  );
};