import React from 'react';
import { Search, X } from 'lucide-react';

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
    <div className="space-y-2">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-retro-400 dark:text-retro-500" />
        </div>
        <input
          type="text"
          placeholder="Search in guide..."
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          className="w-full pl-10 pr-10 py-2 border border-retro-300 dark:border-retro-600 rounded-md bg-white dark:bg-retro-800 text-retro-900 dark:text-retro-100 placeholder-retro-400 dark:placeholder-retro-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {searchQuery && (
          <button 
            onClick={() => onSearch('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-retro-400 hover:text-retro-600 dark:text-retro-500 dark:hover:text-retro-300"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      
      {searchQuery && searchResults.length > 0 && (
        <div className="bg-retro-50 dark:bg-retro-800 border border-retro-200 dark:border-retro-700 rounded-md">
          <div className="px-3 py-2 text-sm font-medium text-retro-700 dark:text-retro-300 border-b border-retro-200 dark:border-retro-700">
            Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
          </div>
          <div className="max-h-60 overflow-y-auto">
            {searchResults.slice(0, 10).map((result, index) => (
              <button
                key={`${result.line}-${index}`}
                className="w-full px-3 py-2 text-left text-sm hover:bg-retro-100 dark:hover:bg-retro-700 focus:bg-retro-100 dark:focus:bg-retro-700 focus:outline-none transition-colors"
                onClick={() => onJumpToResult(result.line)}
              >
                <span className="font-medium text-retro-600 dark:text-retro-400">Line {result.line}:</span>
                <span className="ml-2 text-retro-800 dark:text-retro-200 line-clamp-1">{result.content}</span>
              </button>
            ))}
            {searchResults.length > 10 && (
              <div className="px-3 py-2 text-sm text-retro-500 dark:text-retro-500 text-center border-t border-retro-200 dark:border-retro-700">
                ... and {searchResults.length - 10} more results
              </div>
            )}
          </div>
        </div>
      )}
      
      {searchQuery && searchResults.length === 0 && (
        <div className="px-3 py-2 text-sm text-retro-600 dark:text-retro-400 bg-retro-50 dark:bg-retro-800 border border-retro-200 dark:border-retro-700 rounded-md">
          No results found for &ldquo;{searchQuery}&rdquo;
        </div>
      )}
    </div>
  );
};