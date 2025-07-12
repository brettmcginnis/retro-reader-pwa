import React from 'react';
import { GuideLibrary } from './GuideLibrary';
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
  ) : <GuideLibrary />;
};
