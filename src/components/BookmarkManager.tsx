import React from 'react';
import { Guide } from '../types';
import { BookmarkManagerContainer } from '../containers/BookmarkManagerContainer';

interface BookmarkManagerProps {
  guide: Guide;
  onGotoLine: (line: number) => void;
}

export const BookmarkManager: React.FC<BookmarkManagerProps> = ({ guide, onGotoLine }) => {
  return <BookmarkManagerContainer guide={guide} onGotoLine={onGotoLine} />;
};