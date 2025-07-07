import React, { useState } from 'react';
import { Bookmark, Guide } from '../types';
import { useBookmarks } from '../hooks/useBookmarks';
import { useToast } from '../contexts/useToast';

interface BookmarkManagerProps {
  guide: Guide;
  onGotoLine: (line: number) => void;
}

export const BookmarkManager: React.FC<BookmarkManagerProps> = ({ guide, onGotoLine }) => {
  const { bookmarks, addBookmark, deleteBookmark, updateBookmark } = useBookmarks(guide.id);
  const { showToast, showConfirmation } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);

  const handleExportBookmarks = () => {
    const exportData = {
      guide: {
        id: guide.id,
        title: guide.title,
        url: guide.url
      },
      bookmarks: bookmarks,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${guide.title.replace(/[^a-z0-9]/gi, '_')}_bookmarks.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('success', 'Bookmarks Exported', `${bookmarks.length} bookmarks exported successfully`);
  };

  const handleClearAll = () => {
    showConfirmation({
      title: 'Clear All Bookmarks',
      message: 'Are you sure you want to delete all bookmarks? This action cannot be undone.',
      confirmText: 'Clear All',
      cancelText: 'Cancel',
      onConfirm: confirmClearAll
    });
  };

  const confirmClearAll = async () => {
    try {
      for (const bookmark of bookmarks) {
        await deleteBookmark(bookmark.id);
      }
      showToast('success', 'All bookmarks deleted', 'All bookmarks have been successfully deleted');
    } catch (error) {
      showToast('error', 'Failed to clear bookmarks', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handleDeleteBookmark = (bookmarkId: string) => {
    const bookmark = bookmarks.find(b => b.id === bookmarkId);
    showConfirmation({
      title: 'Delete Bookmark',
      message: `Are you sure you want to delete the bookmark "${bookmark?.title}"?`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: () => confirmDeleteBookmark(bookmarkId)
    });
  };

  const confirmDeleteBookmark = async (bookmarkId: string) => {
    try {
      await deleteBookmark(bookmarkId);
      showToast('success', 'Bookmark deleted', 'Bookmark has been successfully deleted');
    } catch (error) {
      showToast('error', 'Failed to delete bookmark', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const getLineCount = () => {
    return guide.content.split('\n').length;
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };


  // Separate current position bookmark from regular bookmarks
  const currentPositionBookmark = bookmarks.find(b => b.isCurrentPosition);
  const regularBookmarks = bookmarks.filter(b => !b.isCurrentPosition);
  const sortedBookmarks = [...regularBookmarks].sort((a, b) => a.line - b.line);


  return (
    <div className="bookmark-manager">
      <div className="bookmark-header">
        <h2>Bookmarks for {guide.title}</h2>
        <button onClick={() => setShowAddModal(true)} className="primary-btn">
          Add Bookmark
        </button>
      </div>
      
      
      <div className="bookmark-list">
        {currentPositionBookmark && (
          <div className="current-position-section">
            <h3>Current Reading Position</h3>
            <div className="bookmark-item current-position">
              <div className="bookmark-info">
                <div className="bookmark-title">📍 {currentPositionBookmark.title}</div>
                <div className="bookmark-details">
                  Line {currentPositionBookmark.line} • Last updated: {formatDate(currentPositionBookmark.dateCreated)}
                </div>
              </div>
              <div className="bookmark-actions">
                <button onClick={() => onGotoLine(currentPositionBookmark.line)} className="goto-btn">
                  Resume
                </button>
              </div>
            </div>
          </div>
        )}
        
        {sortedBookmarks.length > 0 && <h3>Saved Bookmarks</h3>}
        
        {sortedBookmarks.length === 0 && !currentPositionBookmark ? (
          <div className="empty-state">No bookmarks yet. Add some while reading!</div>
        ) : (
          sortedBookmarks.map(bookmark => (
            <div key={bookmark.id} className="bookmark-item">
              <div className="bookmark-info">
                <div className="bookmark-title">{bookmark.title}</div>
                <div className="bookmark-details">
                  Line {bookmark.line} • {formatDate(bookmark.dateCreated)}
                </div>
                {bookmark.note && (
                  <div className="bookmark-note">{bookmark.note}</div>
                )}
              </div>
              <div className="bookmark-actions">
                <button onClick={() => onGotoLine(bookmark.line)} className="goto-btn">
                  Go
                </button>
                <button onClick={() => setEditingBookmark(bookmark)} className="edit-btn">
                  Edit
                </button>
                <button onClick={() => handleDeleteBookmark(bookmark.id)} className="delete-btn">
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="bookmark-actions">
        <button onClick={handleExportBookmarks} className="secondary-btn">
          Export Bookmarks
        </button>
        <button onClick={handleClearAll} className="danger-btn">
          Clear All
        </button>
      </div>

      {showAddModal && (
        <AddBookmarkModal
          guideId={guide.id}
          maxLine={getLineCount()}
          onSave={addBookmark}
          onClose={() => setShowAddModal(false)}
          onSuccess={(msg) => showToast('success', 'Bookmark Added', msg)}
          onError={(msg) => showToast('error', 'Error', msg)}
        />
      )}

      {editingBookmark && (
        <EditBookmarkModal
          bookmark={editingBookmark}
          maxLine={getLineCount()}
          onSave={updateBookmark}
          onClose={() => setEditingBookmark(null)}
          onSuccess={(msg) => showToast('success', 'Bookmark Updated', msg)}
          onError={(msg) => showToast('error', 'Error', msg)}
        />
      )}

    </div>
  );
};

interface AddBookmarkModalProps {
  guideId: string;
  maxLine: number;
  onSave: (bookmark: Omit<Bookmark, 'id' | 'dateCreated'>) => Promise<Bookmark>;
  onClose: () => void;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

const AddBookmarkModal: React.FC<AddBookmarkModalProps> = ({ guideId, maxLine, onSave, onClose, onSuccess, onError }) => {
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
        position: 0,
        title: title.trim(),
        note: note.trim() || undefined
      });
      onSuccess?.('Bookmark added successfully');
      onClose();
    } catch (error) {
      const errorMsg = `Failed to save bookmark: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setError(errorMsg);
      onError?.(errorMsg);
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

interface EditBookmarkModalProps {
  bookmark: Bookmark;
  maxLine: number;
  onSave: (id: string, updates: Partial<Bookmark>) => Promise<void>;
  onClose: () => void;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

const EditBookmarkModal: React.FC<EditBookmarkModalProps> = ({ bookmark, maxLine, onSave, onClose, onSuccess, onError }) => {
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
      onSuccess?.('Bookmark updated successfully');
      onClose();
    } catch (error) {
      const errorMsg = `Failed to update bookmark: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setError(errorMsg);
      onError?.(errorMsg);
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