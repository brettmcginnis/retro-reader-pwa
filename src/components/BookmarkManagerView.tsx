import React, { useState } from 'react';
import { Bookmark, Guide } from '../types';
import { AddBookmarkModal } from './AddBookmarkModal';
import { EditBookmarkModal } from './EditBookmarkModal';
import { Button } from './Button';
import { Bookmark as BookmarkIcon, MapPin, Calendar, Edit2, Trash2, Download, AlertCircle } from 'lucide-react';

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
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-retro-900 dark:text-retro-100">
          Bookmarks for {guide.title}
        </h2>
        <Button onClick={() => setShowAddModal(true)} variant="primary">
          <BookmarkIcon className="w-4 h-4 mr-2" />
          Add Bookmark
        </Button>
      </div>
      
      <div className="space-y-6">
        {currentPositionBookmark && (
          <div>
            <h3 className="text-lg font-semibold text-retro-800 dark:text-retro-200 mb-3">
              Current Reading Position
            </h3>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-blue-900 dark:text-blue-100 font-medium">
                    <MapPin className="w-4 h-4" />
                    {currentPositionBookmark.title}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-blue-700 dark:text-blue-300">
                    <span>Line {currentPositionBookmark.line}</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Last updated: {formatDate(currentPositionBookmark.dateCreated)}
                    </span>
                  </div>
                </div>
                <Button 
                  onClick={() => onGotoLine(currentPositionBookmark.line)} 
                  variant="primary"
                  size="sm"
                >
                  Resume
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {sortedBookmarks.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-retro-800 dark:text-retro-200 mb-3">
              Saved Bookmarks
            </h3>
            <div className="space-y-2">
              {sortedBookmarks.map(bookmark => (
                <div key={bookmark.id} className="bg-white dark:bg-retro-900 border border-retro-200 dark:border-retro-700 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-retro-900 dark:text-retro-100">
                        {bookmark.title}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-retro-600 dark:text-retro-400">
                        <span>Line {bookmark.line}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(bookmark.dateCreated)}
                        </span>
                      </div>
                      {bookmark.note && (
                        <div className="mt-2 text-sm text-retro-700 dark:text-retro-300 bg-retro-50 dark:bg-retro-800/50 rounded p-2">
                          {bookmark.note}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 ml-4">
                      <Button 
                        onClick={() => onGotoLine(bookmark.line)} 
                        variant="ghost"
                        size="sm"
                      >
                        Go
                      </Button>
                      <Button 
                        onClick={() => setEditingBookmark(bookmark)} 
                        variant="ghost"
                        size="sm"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        onClick={() => onDeleteBookmark(bookmark.id)} 
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {sortedBookmarks.length === 0 && !currentPositionBookmark && (
          <div className="text-center py-12 text-retro-600 dark:text-retro-400">
            <BookmarkIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No bookmarks yet. Add some while reading!</p>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-4 mt-8 pt-6 border-t border-retro-200 dark:border-retro-700">
        <Button onClick={onExportBookmarks} variant="secondary">
          <Download className="w-4 h-4 mr-2" />
          Export Bookmarks
        </Button>
        <Button 
          onClick={onClearAll} 
          variant="ghost"
          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <AlertCircle className="w-4 h-4 mr-2" />
          Clear All
        </Button>
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