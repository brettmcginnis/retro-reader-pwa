import React from 'react';
import { Guide } from '../types';

interface GuideCardProps {
  guide: Guide;
  onRead: () => void;
  onBookmarks: () => void;
  onExport: () => void;
  onDelete: () => void;
  formatFileSize: (bytes: number) => string;
  formatDate: (date: Date) => string;
}

export const GuideCard: React.FC<GuideCardProps> = ({ 
  guide, 
  onRead, 
  onBookmarks, 
  onExport, 
  onDelete,
  formatFileSize,
  formatDate 
}) => {
  const escapeHtml = (text: string): string => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  return (
    <div className="guide-card">
      <div className="guide-info">
        <h3 className="guide-title" dangerouslySetInnerHTML={{ __html: escapeHtml(guide.title) }} />
        {guide.author && (
          <p className="guide-author" dangerouslySetInnerHTML={{ __html: `by ${escapeHtml(guide.author)}` }} />
        )}
        {guide.gameTitle && (
          <p className="guide-game" dangerouslySetInnerHTML={{ __html: escapeHtml(guide.gameTitle) }} />
        )}
        <div className="guide-meta">
          <span className="guide-size">{formatFileSize(guide.size)}</span>
          <span className="guide-date">{formatDate(guide.dateModified)}</span>
        </div>
      </div>
      <div className="guide-actions">
        <button onClick={onRead} className="read-btn">Read</button>
        <button onClick={onBookmarks} className="bookmarks-btn">Bookmarks</button>
        <button onClick={onExport} className="export-btn">Export</button>
        <button onClick={onDelete} className="delete-btn">Delete</button>
      </div>
    </div>
  );
};