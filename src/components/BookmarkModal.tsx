import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

interface BookmarkModalProps {
  isOpen: boolean;
  line: number;
  title: string;
  note: string;
  onTitleChange: (title: string) => void;
  onNoteChange: (note: string) => void;
  onSave: () => void;
  onSetAsCurrentPosition: () => void;
  onClose: () => void;
}

export const BookmarkModal: React.FC<BookmarkModalProps> = ({
  isOpen,
  line,
  title,
  note,
  onTitleChange,
  onNoteChange,
  onSave,
  onSetAsCurrentPosition,
  onClose
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Add Bookmark at Line ${line}`}
      size="md"
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="bookmark-line" className="block text-sm font-medium text-retro-700 dark:text-retro-300 mb-1">
            Line
          </label>
          <input
            id="bookmark-line"
            type="text"
            value={line}
            readOnly
            className="w-full rounded-md border-retro-300 dark:border-retro-600 bg-retro-50 dark:bg-retro-900 text-retro-900 dark:text-retro-100 shadow-sm sm:text-sm cursor-not-allowed"
            aria-label="Line number"
          />
        </div>
        
        <div>
          <label htmlFor="bookmark-title" className="block text-sm font-medium text-retro-700 dark:text-retro-300 mb-1">
            Title
          </label>
          <input
            id="bookmark-title"
            type="text"
            placeholder="Bookmark title"
            aria-label="Title"
            value={title}
            onChange={e => onTitleChange(e.target.value)}
            className="w-full rounded-md border-retro-300 dark:border-retro-600 bg-white dark:bg-retro-800 text-retro-900 dark:text-retro-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            autoFocus
          />
        </div>
        
        <div>
          <label htmlFor="bookmark-notes" className="block text-sm font-medium text-retro-700 dark:text-retro-300 mb-1">
            Notes (optional)
          </label>
          <textarea
            id="bookmark-notes"
            placeholder="Notes (optional)"
            aria-label="Notes"
            value={note}
            onChange={e => onNoteChange(e.target.value)}
            rows={3}
            className="w-full rounded-md border-retro-300 dark:border-retro-600 bg-white dark:bg-retro-800 text-retro-900 dark:text-retro-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="secondary" onClick={onSetAsCurrentPosition}>
            Set as Current Position
          </Button>
          <div className="flex space-x-3">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={onSave}>
              Save
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};