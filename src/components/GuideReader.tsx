import React from 'react';
import { Guide } from '../types';
import { GuideReaderContainer } from '../containers/GuideReaderContainer';

interface GuideReaderProps {
  guide: Guide;
  currentView?: 'library' | 'reader';
  onViewChange?: (view: 'library' | 'reader') => void;
}

export const GuideReader: React.FC<GuideReaderProps> = ({ guide, currentView, onViewChange }) => {
  return <GuideReaderContainer guide={guide} currentView={currentView} onViewChange={onViewChange} />;
};