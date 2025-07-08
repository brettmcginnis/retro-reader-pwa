import React, { useState } from 'react';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

interface UrlImportProps {
  onFetch: (url: string) => Promise<void>;
  loading: boolean;
}

export const UrlImport: React.FC<UrlImportProps> = ({ onFetch, loading }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onFetch(url);
    setUrl('');
  };

  const handleButtonClick = async () => {
    await onFetch(url);
    setUrl('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <input 
          type="url" 
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter guide URL (direct text file)..." 
          className="flex-1 px-3 py-2 border border-retro-300 dark:border-retro-600 rounded-md shadow-sm text-retro-900 dark:text-retro-100 bg-white dark:bg-retro-800 placeholder-retro-400 dark:placeholder-retro-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        />
        <Button 
          onClick={handleButtonClick}
          disabled={loading || !url.trim()}
          variant="primary"
        >
          {loading ? 'Fetching...' : 'Fetch Guide'}
        </Button>
      </div>
      <div className="flex items-start gap-2 text-sm text-yellow-600 dark:text-yellow-500">
        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>Note: Many sites (like GameFAQs) block direct access. Use &ldquo;Paste Content&rdquo; for those guides.</p>
      </div>
    </>
  );
};