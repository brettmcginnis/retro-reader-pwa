import React from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

interface SearchBarProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  onClose: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearch,
  onClose
}) => {
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Prevent form submission since we're handling search on every keystroke
  };

  const handleSearchClear = () => {
    onSearch('');
  };

  return (
    <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2">
      <div className="flex-1 relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search in guide..."
          className="w-full pl-3 pr-8 py-1.5 text-sm bg-retro-50 dark:bg-retro-800 
                   border border-retro-200 dark:border-retro-700 rounded-lg
                   focus:outline-none focus:ring-2 focus:ring-retro-500 dark:focus:ring-retro-400
                   text-retro-900 dark:text-retro-100 placeholder-retro-500 dark:placeholder-retro-400"
          autoFocus
        />
        {searchQuery && (
          <button
            type="button"
            onClick={handleSearchClear}
            className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-retro-500 hover:text-retro-700 dark:text-retro-400 dark:hover:text-retro-200"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      <Button
        type="button"
        onClick={onClose}
        variant="ghost"
        size="sm"
        className="p-2"
      >
        <X className="w-5 h-5" />
      </Button>
    </form>
  );
};