import React, { useState } from 'react';
import { Guide } from '../types';
import { UrlImport } from './UrlImport';
import { GuideCard } from './GuideCard';
import { PasteModal } from './PasteModal';

interface GuideLibraryViewProps {
  guides: Guide[];
  theme: 'light' | 'dark';
  fetchLoading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onToggleTheme: () => void;
  onFetchGuide: (url: string) => Promise<void>;
  onDeleteGuide: (guide: Guide) => void;
  onExportGuide: (id: string) => void;
  onExportAll: () => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenGuide: (guide: Guide) => void;
  onOpenBookmarks: (guide: Guide) => void;
  onCreateGuide: (guide: Omit<Guide, 'id' | 'dateAdded' | 'dateModified'>) => Promise<Guide>;
}

export const GuideLibraryView: React.FC<GuideLibraryViewProps> = ({
  guides,
  theme,
  fetchLoading,
  fileInputRef,
  onToggleTheme,
  onFetchGuide,
  onDeleteGuide,
  onExportGuide,
  onExportAll,
  onFileSelect,
  onOpenGuide,
  onOpenBookmarks,
  onCreateGuide
}) => {
  const [activeTab, setActiveTab] = useState<'url' | 'paste' | 'upload'>('url');
  const [showPasteModal, setShowPasteModal] = useState(false);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Retro Reader</h1>
        <div className="header-actions">
          <button onClick={onToggleTheme} className="icon-btn" title="Toggle Theme">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      <main className="main-content">
        <div className="add-guide-section">
          <h2>Add New Guide</h2>
          <div className="add-guide-tabs">
            <button 
              className={`tab-btn ${activeTab === 'url' ? 'active' : ''}`}
              onClick={() => setActiveTab('url')}
            >
              From URL
            </button>
            <button 
              className={`tab-btn ${activeTab === 'paste' ? 'active' : ''}`}
              onClick={() => setActiveTab('paste')}
            >
              Paste Content
            </button>
            <button 
              className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
              onClick={() => setActiveTab('upload')}
            >
              Upload File
            </button>
          </div>
          
          {activeTab === 'url' && (
            <div className="import-method">
              <UrlImport onFetch={onFetchGuide} loading={fetchLoading} />
            </div>
          )}
          
          {activeTab === 'paste' && (
            <div className="import-method">
              <button onClick={() => setShowPasteModal(true)} className="primary-btn">
                Paste Guide Content
              </button>
              <p className="help-text">Copy text from GameFAQs or other sites and paste it here.</p>
            </div>
          )}
          
          {activeTab === 'upload' && (
            <div className="import-method">
              <label htmlFor="txt-upload" className="primary-btn file-upload-btn">
                Choose Text File
              </label>
              <input 
                type="file" 
                id="txt-upload" 
                style={{ display: 'none' }} 
                accept=".txt" 
                onChange={onFileSelect}
              />
              <p className="help-text">Upload a .txt file to create a new guide. The filename will be used as the guide title.</p>
            </div>
          )}
          
          <div className="import-export-actions">
            <label htmlFor="import-file" className="secondary-btn">Import Backup</label>
            <input 
              type="file" 
              id="import-file" 
              ref={fileInputRef}
              style={{ display: 'none' }} 
              accept=".json,.txt" 
              onChange={onFileSelect}
            />
            <button onClick={onExportAll} className="secondary-btn">Export All</button>
          </div>
        </div>

        <div className="guide-library">
          <h2>Your Guide Library</h2>
          <div className="guide-grid">
            {guides.length === 0 ? (
              <div className="empty-state">
                <p>No guides yet. Add your first guide by entering a URL above!</p>
              </div>
            ) : (
              guides.map(guide => (
                <GuideCard 
                  key={guide.id}
                  guide={guide}
                  onRead={() => onOpenGuide(guide)}
                  onBookmarks={() => onOpenBookmarks(guide)}
                  onExport={() => onExportGuide(guide.id)}
                  onDelete={() => onDeleteGuide(guide)}
                  formatFileSize={formatFileSize}
                  formatDate={formatDate}
                />
              ))
            )}
          </div>
        </div>
      </main>

      {showPasteModal && (
        <PasteModal 
          onSave={onCreateGuide}
          onClose={() => setShowPasteModal(false)}
        />
      )}
    </div>
  );
};