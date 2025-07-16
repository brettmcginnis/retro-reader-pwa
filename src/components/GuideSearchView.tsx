import React from 'react';
import { useGuideSearch } from '../hooks/useGuideSearch';
import { GuideSearchBar } from './GuideSearchBar';

interface GuideSearchViewProps {
  lines: string[];
  searchQuery: string;
  showSearch: boolean;
  onSearch: (query: string) => void;
  scrollToLine: (line: number) => void;
}

export const GuideSearchView: React.FC<GuideSearchViewProps> = ({
  lines,
  searchQuery,
  showSearch,
  onSearch,
  scrollToLine
}) => {
  const {
    searchResults,
    handleJumpToResult
  } = useGuideSearch({
    lines,
    searchQuery
  });

  if (!showSearch) {
    return null;
  }

  return (
    <div className="px-4 py-2 bg-retro-50 dark:bg-retro-900 border-b border-retro-200 dark:border-retro-700">
      <GuideSearchBar
        searchQuery={searchQuery}
        searchResults={searchResults}
        onSearch={onSearch}
        onJumpToResult={(line) => handleJumpToResult(line, scrollToLine)}
      />
    </div>
  );
};