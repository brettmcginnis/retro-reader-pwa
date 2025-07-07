import React, { useState } from 'react';
import { Guide } from '../types';

interface PasteModalProps {
  onSave: (guide: Omit<Guide, 'id' | 'dateAdded' | 'dateModified'>) => Promise<Guide>;
  onClose: () => void;
}

export const PasteModal: React.FC<PasteModalProps> = ({ onSave, onClose }) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [gameTitle, setGameTitle] = useState('');
  const [url, setUrl] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      return;
    }

    try {
      setSaving(true);
      await onSave({
        title: title.trim(),
        content: content.trim(),
        url: url.trim() || 'manual-import',
        size: content.trim().length,
        author: author.trim() || undefined,
        gameTitle: gameTitle.trim() || undefined
      });
      onClose();
    } catch {
      // Error handling is done in the container
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
      <div className="modal paste-modal">
        <div className="modal-header">
          <h3>Paste Guide Content</h3>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label htmlFor="paste-title">Guide Title:</label>
            <input 
              type="text" 
              id="paste-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Final Fantasy VII Guide" 
            />
          </div>
          <div className="form-group">
            <label htmlFor="paste-author">Author (optional):</label>
            <input 
              type="text" 
              id="paste-author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Guide author" 
            />
          </div>
          <div className="form-group">
            <label htmlFor="paste-game">Game Title (optional):</label>
            <input 
              type="text" 
              id="paste-game"
              value={gameTitle}
              onChange={(e) => setGameTitle(e.target.value)}
              placeholder="e.g., Final Fantasy VII" 
            />
          </div>
          <div className="form-group">
            <label htmlFor="paste-url">Source URL (optional):</label>
            <input 
              type="url" 
              id="paste-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://gamefaqs.gamespot.com/..." 
            />
          </div>
          <div className="form-group">
            <label htmlFor="paste-content">Guide Content:</label>
            <textarea 
              id="paste-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste the complete guide text here...&#10;&#10;Tip: Copy all text from the GameFAQs page and paste it here."
              rows={15}
            />
          </div>
        </div>
        <div className="modal-actions">
          <button 
            onClick={handleSave} 
            disabled={saving || !title.trim() || !content.trim()} 
            className="primary-btn"
          >
            {saving ? 'Saving...' : 'Save Guide'}
          </button>
          <button onClick={onClose} disabled={saving} className="secondary-btn">Cancel</button>
        </div>
      </div>
    </div>
  );
};