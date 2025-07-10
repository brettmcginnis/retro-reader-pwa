import React, { useState } from 'react';
import { Button } from './Button';
import { Navigation, X } from 'lucide-react';

interface NavigationModalProps {
  isOpen: boolean;
  currentLine: number;
  totalLines: number;
  onNavigate: (line: number) => void;
  onClose: () => void;
  onJumpToCurrentPosition: () => Promise<number | null>;
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

  const handleJumpToSaved = async () => {
    const position = await onJumpToCurrentPosition();
    if (position) {
      onNavigate(position);
      onClose();
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
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 bg-white dark:bg-retro-900 
                      rounded-lg shadow-2xl z-50 max-w-sm mx-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-retro-900 dark:text-retro-100 flex items-center gap-2">
              <Navigation className="w-5 h-5" />
              Go to Line
            </h2>
            <Button
              onClick={handleClose}
              variant="ghost"
              size="sm"
              className="p-1"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Current Position Info */}
          <div className="text-sm text-retro-600 dark:text-retro-400 mb-4">
            Currently at line {currentLine} of {totalLines}
          </div>

          {/* Form */}
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

            {/* Actions */}
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
