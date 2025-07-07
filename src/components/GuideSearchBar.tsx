import React from 'react';

interface GuideSearchBarProps {
  searchQuery: string;
  searchResults: { line: number; content: string }[];
  onSearch: (query: string) => void;
  onJumpToResult: (line: number) => void;
}

export const GuideSearchBar: React.FC<GuideSearchBarProps> = ({
  searchQuery,
  searchResults,
  onSearch,
  onJumpToResult
}) => {
  return (
    <div className="search-section">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search in guide..."
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          className="search-input"
        />
        {searchQuery && (
          <button 
            onClick={() => onSearch('')}
            className="clear-search"
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>
      
      {searchQuery && searchResults.length > 0 && (
        <div className="search-results">
          <div className="search-results-header">
            Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
          </div>
          <div className="search-results-list">
            {searchResults.slice(0, 10).map((result) => (
              <button
                key={result.line}
                className="search-result"
                onClick={() => onJumpToResult(result.line)}
              >
                <span className="result-line">Line {result.line}:</span>
                <span className="result-content">{result.content}</span>
              </button>
            ))}
            {searchResults.length > 10 && (
              <div className="search-results-more">
                ... and {searchResults.length - 10} more results
              </div>
            )}
          </div>
        </div>
      )}
      
      {searchQuery && searchResults.length === 0 && (
        <div className="search-no-results">
          No results found for &ldquo;{searchQuery}&rdquo;
        </div>
      )}
    </div>
  );
};