import React, { ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const ButtonComponent: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  ...props
}) => {
  return (
    <button
      className={clsx(
        // Base styles
        'inline-flex items-center justify-center font-medium rounded-md transition-colors',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        
        // Variant styles
        {
          'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500': variant === 'primary',
          'bg-retro-200 text-retro-900 hover:bg-retro-300 dark:bg-retro-700 dark:text-retro-100 dark:hover:bg-retro-600 focus:ring-retro-500': variant === 'secondary',
          'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500': variant === 'danger',
          'text-retro-700 hover:bg-retro-100 dark:text-retro-300 dark:hover:bg-retro-800 focus:ring-retro-500': variant === 'ghost',
        },
        
        // Size styles with min-height for touch targets
        {
          'px-3 py-1.5 text-sm min-h-[2.25rem]': size === 'sm',
          'px-4 py-2 text-sm min-h-[2.75rem]': size === 'md',
          'px-6 py-3 text-base min-h-[3rem]': size === 'lg',
        },
        
        // Width styles
        fullWidth && 'w-full',
        
        // Custom className
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

ButtonComponent.displayName = 'Button';

export const Button = React.memo(ButtonComponent);