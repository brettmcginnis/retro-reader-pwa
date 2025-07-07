import React, { useState } from 'react';

interface UrlImportProps {
  onFetch: (url: string) => Promise<void>;
  loading: boolean;
}

export const UrlImport: React.FC<UrlImportProps> = ({ onFetch, loading }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFetch(url);
    setUrl('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <>
      <div className="add-guide-form">
        <input 
          type="url" 
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter guide URL (direct text file)..." 
          className="url-input"
          disabled={loading}
        />
        <button 
          onClick={handleSubmit}
          disabled={loading}
          className="primary-btn"
        >
          {loading ? 'Fetching...' : 'Fetch Guide'}
        </button>
      </div>
      <p className="help-text">⚠️ Note: Many sites (like GameFAQs) block direct access. Use &quot;Paste Content&quot; for those guides.</p>
    </>
  );
};