import React from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

interface ModalHeaderProps {
  title: string;
  icon?: React.ReactNode;
  onClose: () => void;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({ title, icon, onClose }) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold text-retro-900 dark:text-retro-100 flex items-center gap-2">
        {icon}
        {title}
      </h2>
      <Button
        onClick={onClose}
        variant="ghost"
        size="sm"
        className="p-1"
      >
        <X className="w-5 h-5" />
      </Button>
    </div>
  );
};