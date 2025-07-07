import React, { useEffect, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// Mock that renders content without HeadlessUI transitions
export const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children,
  size = 'md' 
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      // Focus the modal content when opened
      const focusableElement = modalRef.current.querySelector<HTMLElement>(
        'input, textarea, button, select, a[href], [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElement) {
        focusableElement.focus();
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-xl',
  };

  return (
    <div className="relative z-50" role="dialog" ref={modalRef}>
      <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center">
          <div className={`w-full transform overflow-hidden rounded-2xl bg-white dark:bg-retro-900 p-6 text-left align-middle shadow-xl transition-all ${sizeClasses[size]}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium leading-6 text-retro-900 dark:text-retro-100">
                {title}
              </h3>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md p-2 text-retro-400 hover:text-retro-500 dark:hover:text-retro-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 min-w-[2.75rem] min-h-[2.75rem]"
                onClick={onClose}
              >
                <span className="sr-only">Close</span>
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

Modal.displayName = 'Modal';