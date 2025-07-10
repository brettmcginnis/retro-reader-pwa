import React from 'react';
import clsx from 'clsx';
import { Button } from './Button';

interface NavigationButtonProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  isDisabled?: boolean;
  title?: string;
  onClick: () => void;
}

export const NavigationButton: React.FC<NavigationButtonProps> = ({
  icon,
  label,
  isActive = false,
  isDisabled = false,
  title,
  onClick
}) => {
  return (
    <Button
      onClick={onClick}
      disabled={isDisabled}
      variant="ghost"
      className={clsx(
        'flex flex-col sm:flex-row items-center gap-1 p-2 h-14 min-w-[60px] sm:min-w-[80px]',
        isActive && 'bg-retro-100 dark:bg-retro-800'
      )}
      title={title}
    >
      {icon}
      <span className="text-xs sm:text-sm">{label}</span>
    </Button>
  );
};