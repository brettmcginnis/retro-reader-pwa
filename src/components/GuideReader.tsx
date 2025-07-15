import React, { useEffect, useState } from 'react';
import { Guide } from '../stores/useGuideStore';
import { GuideReaderContainer } from '../containers/GuideReaderContainer';
import { useGuideStore } from '../stores/useGuideStore';
import { Loading } from './Loading';

interface GuideReaderProps {
  guideId: string;
}

export const GuideReader: React.FC<GuideReaderProps> = ({ guideId }) => {
  const [guide, setGuide] = useState<Guide | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { getGuide } = useGuideStore();
  
  useEffect(() => {
    const loadGuide = async () => {
      setIsLoading(true);
      try {
        const loadedGuide = await getGuide(guideId);
        setGuide(loadedGuide);
      } catch (error) {
        console.error('Failed to load guide:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadGuide();
  }, [guideId, getGuide]);
  
  if (isLoading) {
    return <Loading />;
  }
  
  if (!guide) {
    return (
      <div className="flex items-center justify-center h-screen bg-retro-50 dark:bg-retro-950">
        <div className="text-lg text-retro-600 dark:text-retro-400">Guide not found</div>
      </div>
    );
  }
  
  return <GuideReaderContainer guide={guide} />;
};
