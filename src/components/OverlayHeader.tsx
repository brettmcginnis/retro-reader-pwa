import React from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

interface OverlayHeaderProps {
  title: string;
  onClose: () => void;
}

export const OverlayHeader: React.FC<OverlayHeaderProps> = ({ title, onClose }) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-retro-200 dark:border-retro-700">
      <h2 className="text-lg font-semibold text-retro-900 dark:text-retro-100">
        {title}
      </h2>
      <Button
        onClick={onClose}
        variant="ghost"
        size="sm"
        className="p-1.5"
      >
        <X className="w-5 h-5" />
      </Button>
    </div>
  );
};