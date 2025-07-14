import React, { useState } from 'react';
import { Guide } from '../stores/useGuideStore';
import { Modal } from './Modal';
import { Button } from './Button';

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

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Paste Guide Content"
      size="lg"
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="paste-title" className="block text-sm font-medium text-retro-700 dark:text-retro-300 mb-1">
            Guide Title:
          </label>
          <input 
            type="text" 
            id="paste-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Final Fantasy VII Guide" 
            className="w-full px-3 py-2 border border-retro-300 dark:border-retro-600 rounded-md shadow-sm text-retro-900 dark:text-retro-100 bg-white dark:bg-retro-800 placeholder-retro-400 dark:placeholder-retro-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="paste-author" className="block text-sm font-medium text-retro-700 dark:text-retro-300 mb-1">
            Author (optional):
          </label>
          <input 
            type="text" 
            id="paste-author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Guide author" 
            className="w-full px-3 py-2 border border-retro-300 dark:border-retro-600 rounded-md shadow-sm text-retro-900 dark:text-retro-100 bg-white dark:bg-retro-800 placeholder-retro-400 dark:placeholder-retro-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="paste-game" className="block text-sm font-medium text-retro-700 dark:text-retro-300 mb-1">
            Game Title (optional):
          </label>
          <input 
            type="text" 
            id="paste-game"
            value={gameTitle}
            onChange={(e) => setGameTitle(e.target.value)}
            placeholder="e.g., Final Fantasy VII" 
            className="w-full px-3 py-2 border border-retro-300 dark:border-retro-600 rounded-md shadow-sm text-retro-900 dark:text-retro-100 bg-white dark:bg-retro-800 placeholder-retro-400 dark:placeholder-retro-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="paste-url" className="block text-sm font-medium text-retro-700 dark:text-retro-300 mb-1">
            Source URL (optional):
          </label>
          <input 
            type="url" 
            id="paste-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://gamefaqs.gamespot.com/..." 
            className="w-full px-3 py-2 border border-retro-300 dark:border-retro-600 rounded-md shadow-sm text-retro-900 dark:text-retro-100 bg-white dark:bg-retro-800 placeholder-retro-400 dark:placeholder-retro-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="paste-content" className="block text-sm font-medium text-retro-700 dark:text-retro-300 mb-1">
            Guide Content:
          </label>
          <textarea 
            id="paste-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste the complete guide text here...

Tip: Copy all text from the GameFAQs page and paste it here."
            rows={10}
            className="w-full px-3 py-2 border border-retro-300 dark:border-retro-600 rounded-md shadow-sm text-retro-900 dark:text-retro-100 bg-white dark:bg-retro-800 placeholder-retro-400 dark:placeholder-retro-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button 
            variant="primary"
            onClick={handleSave} 
            disabled={saving || !title.trim() || !content.trim()} 
          >
            {saving ? 'Saving...' : 'Save Guide'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};