import React from 'react';
import { Guide } from '../types';
import { GuideReaderContainer } from '../containers/GuideReaderContainer';

interface GuideReaderProps {
  guide: Guide;
  onViewChange?: (view: 'library' | 'reader') => void;
}

export const GuideReader: React.FC<GuideReaderProps> = ({ guide, onViewChange }) => {
  return <GuideReaderContainer guide={guide} onViewChange={onViewChange} />;
};