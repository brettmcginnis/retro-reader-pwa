import React from 'react';
import { Guide } from '../types';
import { BookmarkManagerContainer } from '../containers/BookmarkManagerContainer';

interface BookmarkManagerProps {
  guide: Guide;
  onGotoLine: (line: number) => void;
  currentView?: 'library' | 'reader' | 'bookmarks';
  onViewChange?: (view: 'library' | 'reader' | 'bookmarks') => void;
}

export const BookmarkManager: React.FC<BookmarkManagerProps> = ({ guide, onGotoLine, currentView, onViewChange }) => {
  return <BookmarkManagerContainer guide={guide} onGotoLine={onGotoLine} currentView={currentView} onViewChange={onViewChange} />;
};