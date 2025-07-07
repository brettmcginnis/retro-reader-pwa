import React, { useState } from 'react';
import { Bookmark } from '../types';

interface AddBookmarkModalProps {
  guideId: string;
  maxLine: number;
  onSave: (bookmark: Omit<Bookmark, 'id' | 'dateCreated'>) => Promise<Bookmark>;
  onClose: () => void;
}

export const AddBookmarkModal: React.FC<AddBookmarkModalProps> = ({ guideId, maxLine, onSave, onClose }) => {
  const [line, setLine] = useState(1);
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
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
      await onSave({
        guideId,
        line,
        title: title.trim(),
        note: note.trim() || undefined
      });
      onClose();
    } catch (error) {
      const errorMsg = `Failed to save bookmark: ${error instanceof Error ? error.message : 'Unknown error'}`;
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
          <h3>Add Bookmark</h3>
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
            <label htmlFor="bookmark-line">Line Number:</label>
            <input 
              type="number" 
              id="bookmark-line"
              value={line}
              onChange={(e) => setLine(parseInt(e.target.value) || 1)}
              min="1" 
              max={maxLine}
            />
          </div>
          <div className="form-group">
            <label htmlFor="bookmark-title">Title:</label>
            <input 
              type="text" 
              id="bookmark-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Bookmark title"
              autoFocus
            />
          </div>
          <div className="form-group">
            <label htmlFor="bookmark-note">Note (optional):</label>
            <textarea 
              id="bookmark-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note..."
            />
          </div>
        </div>
        <div className="modal-actions">
          <button onClick={handleSave} disabled={saving} className="primary-btn">
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button onClick={onClose} disabled={saving} className="secondary-btn">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};