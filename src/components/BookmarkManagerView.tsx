import React, { useState } from 'react';
import { Bookmark, Guide } from '../types';
import { AddBookmarkModal } from './AddBookmarkModal';
import { EditBookmarkModal } from './EditBookmarkModal';

interface BookmarkManagerViewProps {
  guide: Guide;
  currentPositionBookmark: Bookmark | undefined;
  sortedBookmarks: Bookmark[];
  lineCount: number;
  onGotoLine: (line: number) => void;
  onAddBookmark: (bookmark: Omit<Bookmark, 'id' | 'dateCreated'>) => Promise<Bookmark>;
  onUpdateBookmark: (id: string, updates: Partial<Bookmark>) => Promise<void>;
  onDeleteBookmark: (bookmarkId: string) => void;
  onExportBookmarks: () => void;
  onClearAll: () => void;
}

export const BookmarkManagerView: React.FC<BookmarkManagerViewProps> = ({
  guide,
  currentPositionBookmark,
  sortedBookmarks,
  lineCount,
  onGotoLine,
  onAddBookmark,
  onUpdateBookmark,
  onDeleteBookmark,
  onExportBookmarks,
  onClearAll
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

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
                <button onClick={() => onDeleteBookmark(bookmark.id)} className="delete-btn">
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="bookmark-actions">
        <button onClick={onExportBookmarks} className="secondary-btn">
          Export Bookmarks
        </button>
        <button onClick={onClearAll} className="danger-btn">
          Clear All
        </button>
      </div>

      {showAddModal && (
        <AddBookmarkModal
          guideId={guide.id}
          maxLine={lineCount}
          onSave={onAddBookmark}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {editingBookmark && (
        <EditBookmarkModal
          bookmark={editingBookmark}
          maxLine={lineCount}
          onSave={onUpdateBookmark}
          onClose={() => setEditingBookmark(null)}
        />
      )}
    </div>
  );
};