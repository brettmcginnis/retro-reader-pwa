import React, { useState } from 'react';
import { Bookmark } from '../stores/useBookmarkStore';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertCircle } from 'lucide-react';

interface EditBookmarkModalProps {
  bookmark: Bookmark;
  maxLine: number;
  onSave: (id: string, updates: Partial<Bookmark>) => Promise<void>;
  onClose: () => void;
}

export const EditBookmarkModal: React.FC<EditBookmarkModalProps> = ({ bookmark, maxLine, onSave, onClose }) => {
  const [line, setLine] = useState(bookmark.line);
  const [title, setTitle] = useState(bookmark.title);
  const [note, setNote] = useState(bookmark.note || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Please enter a title for the bookmark');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await onSave(bookmark.id, {
        line,
        title: title.trim(),
        note: note.trim() || undefined
      });
      onClose();
    } catch (error) {
      const errorMsg = `Failed to update bookmark: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Edit Bookmark"
      size="md"
    >
      <div className="space-y-4">
        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
            <button 
              onClick={() => setError(null)} 
              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200"
            >
              ×
            </button>
          </div>
        )}
        
        <div>
          <label htmlFor="edit-bookmark-line" className="block text-sm font-medium text-retro-700 dark:text-retro-300 mb-1">
            Line Number:
          </label>
          <input 
            type="number" 
            id="edit-bookmark-line"
            value={line}
            onChange={(e) => setLine(parseInt(e.target.value) || 1)}
            min="1" 
            max={maxLine}
            className="w-full px-3 py-2 border border-retro-300 dark:border-retro-600 rounded-md shadow-sm text-retro-900 dark:text-retro-100 bg-white dark:bg-retro-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="edit-bookmark-title" className="block text-sm font-medium text-retro-700 dark:text-retro-300 mb-1">
            Title:
          </label>
          <input 
            type="text" 
            id="edit-bookmark-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            className="w-full px-3 py-2 border border-retro-300 dark:border-retro-600 rounded-md shadow-sm text-retro-900 dark:text-retro-100 bg-white dark:bg-retro-800 placeholder-retro-400 dark:placeholder-retro-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="edit-bookmark-note" className="block text-sm font-medium text-retro-700 dark:text-retro-300 mb-1">
            Note (optional):
          </label>
          <textarea 
            id="edit-bookmark-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-retro-300 dark:border-retro-600 rounded-md shadow-sm text-retro-900 dark:text-retro-100 bg-white dark:bg-retro-800 placeholder-retro-400 dark:placeholder-retro-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Updating...' : 'Update'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};