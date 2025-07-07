import React from 'react';

interface BookmarkModalProps {
  isOpen: boolean;
  line: number;
  title: string;
  note: string;
  onTitleChange: (title: string) => void;
  onNoteChange: (note: string) => void;
  onSave: () => void;
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
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>Add Bookmark at Line {line}</h3>
        <input
          type="text"
          placeholder="Bookmark title"
          aria-label="Title"
          value={title}
          onChange={e => onTitleChange(e.target.value)}
          autoFocus
        />
        <textarea
          placeholder="Notes (optional)"
          aria-label="Notes"
          value={note}
          onChange={e => onNoteChange(e.target.value)}
          rows={3}
        />
        <div className="modal-actions">
          <button onClick={onSave}>Save</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};