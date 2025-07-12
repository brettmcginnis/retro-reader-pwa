import React from 'react';
import { Guide } from '../types';
import { GuideReaderContainer } from '../containers/GuideReaderContainer';

interface GuideReaderProps {
  guide: Guide;
}

export const GuideReader: React.FC<GuideReaderProps> = ({ guide }) => {
  return <GuideReaderContainer guide={guide} />;
};