import React from 'react';
import { GuideLibraryContainer } from '../containers/GuideLibraryContainer';
import { GuideReader } from './GuideReader';

interface AppContentViewProps {
  currentGuideId: string | null;
}

export const AppContentView: React.FC<AppContentViewProps> = ({
  currentGuideId
}) => {
  return currentGuideId ? (
    <GuideReader 
      guideId={currentGuideId} 
    />
  ) : <GuideLibraryContainer />;
};
