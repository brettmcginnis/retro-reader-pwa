import React, { useState } from 'react';
import { Bookmark } from '../types';

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

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal">
        <div className="modal-header">
          <h3>Edit Bookmark</h3>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>
        <div className="modal-body">
          {error && (
            <div className="error-message">
              {error}
              <button onClick={() => setError(null)} className="error-close">&times;</button>
            </div>
          )}
          <div className="form-group">
            <label htmlFor="edit-bookmark-line">Line Number:</label>
            <input 
              type="number" 
              id="edit-bookmark-line"
              value={line}
              onChange={(e) => setLine(parseInt(e.target.value) || 1)}
              min="1" 
              max={maxLine}
            />
          </div>
          <div className="form-group">
            <label htmlFor="edit-bookmark-title">Title:</label>
            <input 
              type="text" 
              id="edit-bookmark-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>
          <div className="form-group">
            <label htmlFor="edit-bookmark-note">Note (optional):</label>
            <textarea 
              id="edit-bookmark-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>
        <div className="modal-actions">
          <button onClick={handleSave} disabled={saving} className="primary-btn">
            {saving ? 'Updating...' : 'Update'}
          </button>
          <button onClick={onClose} disabled={saving} className="secondary-btn">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};