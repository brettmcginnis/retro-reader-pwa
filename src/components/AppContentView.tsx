import React from 'react';
import { GuideLibrary } from './GuideLibrary';
import { GuideReader } from './GuideReader';

interface AppContentViewProps {
  currentView: 'library' | 'reader';
  currentGuideId: string | null;
}

export const AppContentView: React.FC<AppContentViewProps> = ({
  currentView,
  currentGuideId
}) => {
  const renderContent = () => {
    switch (currentView) {
      case 'reader':
        return currentGuideId ? (
          <GuideReader 
            guideId={currentGuideId} 
          />
        ) : <GuideLibrary />;
        
      default:
        return <GuideLibrary />;
    }
  };

  return renderContent();
};
