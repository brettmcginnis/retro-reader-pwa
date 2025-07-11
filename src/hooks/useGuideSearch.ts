import { useState, useEffect } from 'react';

interface SearchResult {
  line: number;
  content: string;
}

interface UseGuideSearchProps {
  lines: string[];
  searchQuery: string;
}

interface UseGuideSearchReturn {
  showSearch: boolean;
  searchResults: SearchResult[];
  setShowSearch: (show: boolean) => void;
  toggleSearch: () => void;
  handleJumpToResult: (line: number, scrollToLine: (line: number) => void) => void;
}

export const useGuideSearch = ({
  lines,
  searchQuery
}: UseGuideSearchProps): UseGuideSearchReturn => {
  const [showSearch, setShowSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  // Compute search results when search query changes
  useEffect(() => {
    if (!searchQuery) {
      setSearchResults([]);
      return;
    }

    const results: SearchResult[] = [];
    const query = searchQuery.toLowerCase();
    
    lines.forEach((line, index) => {
      if (line.toLowerCase().includes(query)) {
        results.push({
          line: index + 1,
          content: line
        });
      }
    });
    
    setSearchResults(results);
  }, [searchQuery, lines]);

  const toggleSearch = () => {
    setShowSearch(!showSearch);
  };

  const handleJumpToResult = (line: number, scrollToLine: (line: number) => void) => {
    scrollToLine(line);
    setShowSearch(false);
  };

  return {
    showSearch,
    searchResults,
    setShowSearch,
    toggleSearch,
    handleJumpToResult
  };
};