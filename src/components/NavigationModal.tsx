import React, { useState } from 'react';
import { Button } from './Button';
import { OverlayBackdrop } from './OverlayBackdrop';
import { ModalHeader } from './ModalHeader';
import { Navigation } from 'lucide-react';

/**
 * Props for the NavigationModal component that provides line navigation functionality
 */
interface NavigationModalProps {
  /** Controls whether the modal is visible */
  isOpen: boolean;
  /** The current line number being viewed in the guide */
  currentLine: number;
  /** Total number of lines in the guide */
  totalLines: number;
  /** Callback fired when user navigates to a specific line */
  onNavigate: (line: number) => void;
  /** Callback fired when the modal should be closed */
  onClose: () => void;
  /** Callback fired when user clicks the Current Position button */
  onJumpToCurrentPosition?: () => void;
}

export const NavigationModal: React.FC<NavigationModalProps> = ({
  isOpen,
  currentLine,
  totalLines,
  onNavigate,
  onClose,
  onJumpToCurrentPosition
}) => {
  const [targetLine, setTargetLine] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const lineNum = parseInt(targetLine, 10);
    
    if (isNaN(lineNum)) {
      setError('Please enter a valid number');
      return;
    }
    
    if (lineNum < 1 || lineNum > totalLines) {
      setError(`Line must be between 1 and ${totalLines}`);
      return;
    }
    
    onNavigate(lineNum);
    onClose();
    setTargetLine('');
    setError('');
  };

  const handleJumpToSaved = () => {
    if (onJumpToCurrentPosition) {
      onJumpToCurrentPosition();
    }
  };

  const handleClose = () => {
    onClose();
    setTargetLine('');
    setError('');
  };

  if (!isOpen) return null;

  return (
    <>
      <OverlayBackdrop onClick={handleClose} />

      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 bg-white dark:bg-retro-900 
                      rounded-lg shadow-2xl z-50 max-w-sm mx-auto">
        <div className="p-6">
          <ModalHeader 
            title="Go to Line"
            icon={<Navigation className="w-5 h-5" />}
            onClose={handleClose}
          />

          <div className="text-sm text-retro-600 dark:text-retro-400 mb-4">
            Currently at line {currentLine} of {totalLines}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="line-input" className="block text-sm font-medium text-retro-700 dark:text-retro-300 mb-1">
                Enter line number
              </label>
              <input
                id="line-input"
                type="number"
                value={targetLine}
                onChange={(e) => {
                  setTargetLine(e.target.value);
                  setError('');
                }}
                min="1"
                max={totalLines}
                placeholder={`1-${totalLines}`}
                className="w-full px-3 py-2 bg-retro-50 dark:bg-retro-800 
                         border border-retro-200 dark:border-retro-700 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-retro-500 dark:focus:ring-retro-400
                         text-retro-900 dark:text-retro-100 placeholder-retro-500 dark:placeholder-retro-400"
                autoFocus
              />
              {error && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
                disabled={!targetLine}
              >
                Go to Line
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleJumpToSaved}
                title="Jump to current position"
                disabled={!onJumpToCurrentPosition}
              >
                Current Position
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
