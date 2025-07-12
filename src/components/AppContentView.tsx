import React from 'react';
import { Guide } from '../types';
import { GuideLibrary } from './GuideLibrary';
import { GuideReader } from './GuideReader';
import { Loading } from './Loading';

interface AppContentViewProps {
  currentView: 'library' | 'reader';
  currentGuide: Guide | null;
  isLoadingGuide: boolean;
  onBackToLibrary: () => void;
  onViewChange: (view: 'library' | 'reader') => void;
}

export const AppContentView: React.FC<AppContentViewProps> = ({
  currentView,
  currentGuide,
  isLoadingGuide,
  onBackToLibrary: _onBackToLibrary,
  onViewChange
}) => {
  const renderContent = () => {
    switch (currentView) {
      case 'library':
        return <GuideLibrary />;
        
      case 'reader':
        if (isLoadingGuide) {
          return <Loading />;
        }
        
        return currentGuide ? (
          <GuideReader 
            guide={currentGuide} 
            onViewChange={onViewChange}
          />
        ) : <GuideLibrary />;
        
      default:
        return <GuideLibrary />;
    }
  };

  return renderContent();
};