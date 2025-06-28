import React, { useState, useRef } from 'react';
import { Guide } from '../types';
import { useGuides } from '../hooks/useGuides';
import { useApp } from '../contexts/useApp';
import { useToast } from '../contexts/useToast';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface GuideLibraryProps {}

export const GuideLibrary: React.FC<GuideLibraryProps> = () => {
  const { guides, fetchGuide, createGuide, deleteGuide, exportGuide, exportAll, importFromFile } = useGuides();
  const { theme, toggleTheme, setCurrentView, setCurrentGuideId } = useApp();
  const { showToast, showConfirmation } = useToast();
  const [activeTab, setActiveTab] = useState<'url' | 'paste' | 'upload'>('url');
  const [fetchLoading, setFetchLoading] = useState(false);
  const [showPasteModal, setShowPasteModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFetchGuide = async (url: string) => {
    if (!url.trim()) {
      showToast('warning', 'URL Required', 'Please enter a URL to fetch the guide');
      return;
    }

    try {
      setFetchLoading(true);
      await fetchGuide(url);
      showToast('success', 'Guide Added', 'Guide has been successfully imported');
    } catch (error) {
      showToast('error', 'Failed to fetch guide', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleDeleteGuide = async (guide: Guide) => {
    showConfirmation({
      title: 'Delete Guide',
      message: `Are you sure you want to delete "${guide.title}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          await deleteGuide(guide.id);
          showToast('success', 'Guide Deleted', `"${guide.title}" has been deleted`);
        } catch (error) {
          showToast('error', 'Failed to delete guide', error instanceof Error ? error.message : 'Unknown error');
        }
      }
    });
  };

  const handleExportGuide = async (id: string) => {
    try {
      await exportGuide(id);
      showToast('success', 'Guide Exported', 'Guide has been exported successfully');
    } catch (error) {
      showToast('error', 'Failed to export guide', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handleExportAll = async () => {
    try {
      await exportAll();
      showToast('success', 'Guide Exported', 'All guides have been exported successfully');
    } catch (error) {
      showToast('error', 'Failed to export guide', error instanceof Error ? error.message : 'Unknown error');
    }
  };


  const handleImportFile = async (file: File) => {
    try {
      const confirmCallback = (title: string): Promise<boolean> => {
        return new Promise((resolve) => {
          showConfirmation({
            title: 'Guide Already Exists',
            message: `A guide titled "${title}" already exists. Do you want to replace it?`,
            confirmText: 'Replace',
            cancelText: 'Skip',
            onConfirm: () => resolve(true),
            onCancel: () => resolve(false)
          });
        });
      };

      const result = await importFromFile(file, confirmCallback);
      const isTextFile = file.name.toLowerCase().endsWith('.txt');
      
      if (isTextFile && result.imported === 1) {
        showToast('success', 'Guide Created', `Guide created successfully from "${file.name}"`);
      } else {
        showToast('success', 'Import Completed', `Imported: ${result.imported}, Skipped: ${result.skipped}, Errors: ${result.errors.length}`);
      }
    } catch (error) {
      showToast('error', 'Import Failed', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImportFile(file);
    }
  };


  const openGuide = (guide: Guide) => {
    setCurrentGuideId(guide.id);
    setCurrentView('reader');
    window.history.pushState({ guideId: guide.id }, '', `/retro-reader-pwa/guide/${guide.id}`);
  };

  const openBookmarks = (guide: Guide) => {
    setCurrentGuideId(guide.id);
    setCurrentView('bookmarks');
  };

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

  const sortedGuides = guides.sort((a, b) => b.dateModified.getTime() - a.dateModified.getTime());

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Retro Reader</h1>
        <div className="header-actions">
          <button onClick={toggleTheme} className="icon-btn" title="Toggle Theme">
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
              <UrlImport onFetch={handleFetchGuide} loading={fetchLoading} />
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
                onChange={handleFileSelect}
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
              onChange={handleFileSelect}
            />
            <button onClick={handleExportAll} className="secondary-btn">Export All</button>
          </div>
        </div>

        <div className="guide-library">
          <h2>Your Guide Library</h2>
          <div className="guide-grid">
            {sortedGuides.length === 0 ? (
              <div className="empty-state">
                <p>No guides yet. Add your first guide by entering a URL above!</p>
              </div>
            ) : (
              sortedGuides.map(guide => (
                <GuideCard 
                  key={guide.id}
                  guide={guide}
                  onRead={() => openGuide(guide)}
                  onBookmarks={() => openBookmarks(guide)}
                  onExport={() => handleExportGuide(guide.id)}
                  onDelete={() => handleDeleteGuide(guide)}
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
          onSave={createGuide}
          onClose={() => setShowPasteModal(false)}
        />
      )}
    </div>
  );
};

interface UrlImportProps {
  onFetch: (url: string) => Promise<void>;
  loading: boolean;
}

const UrlImport: React.FC<UrlImportProps> = ({ onFetch, loading }) => {
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

interface GuideCardProps {
  guide: Guide;
  onRead: () => void;
  onBookmarks: () => void;
  onExport: () => void;
  onDelete: () => void;
  formatFileSize: (bytes: number) => string;
  formatDate: (date: Date) => string;
}

const GuideCard: React.FC<GuideCardProps> = ({ 
  guide, 
  onRead, 
  onBookmarks, 
  onExport, 
  onDelete,
  formatFileSize,
  formatDate 
}) => {
  const escapeHtml = (text: string): string => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  return (
    <div className="guide-card">
      <div className="guide-info">
        <h3 className="guide-title" dangerouslySetInnerHTML={{ __html: escapeHtml(guide.title) }} />
        {guide.author && (
          <p className="guide-author" dangerouslySetInnerHTML={{ __html: `by ${escapeHtml(guide.author)}` }} />
        )}
        {guide.gameTitle && (
          <p className="guide-game" dangerouslySetInnerHTML={{ __html: escapeHtml(guide.gameTitle) }} />
        )}
        <div className="guide-meta">
          <span className="guide-size">{formatFileSize(guide.size)}</span>
          <span className="guide-date">{formatDate(guide.dateModified)}</span>
        </div>
      </div>
      <div className="guide-actions">
        <button onClick={onRead} className="read-btn">Read</button>
        <button onClick={onBookmarks} className="bookmarks-btn">Bookmarks</button>
        <button onClick={onExport} className="export-btn">Export</button>
        <button onClick={onDelete} className="delete-btn">Delete</button>
      </div>
    </div>
  );
};

interface PasteModalProps {
  onSave: (guide: Omit<Guide, 'id' | 'dateAdded' | 'dateModified'>) => Promise<Guide>;
  onClose: () => void;
}

const PasteModal: React.FC<PasteModalProps> = ({ onSave, onClose }) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [gameTitle, setGameTitle] = useState('');
  const [url, setUrl] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const handleSave = async () => {
    if (!title.trim()) {
      showToast('warning', 'Title Required', 'Please enter a title for the guide');
      return;
    }

    if (!content.trim()) {
      showToast('warning', 'Content Required', 'Please paste the guide content');
      return;
    }

    try {
      setSaving(true);
      await onSave({
        title: title.trim(),
        content: content.trim(),
        url: url.trim() || 'manual-import',
        size: content.trim().length,
        author: author.trim() || undefined,
        gameTitle: gameTitle.trim() || undefined
      });
      onClose();
      showToast('success', 'Guide Saved', `"${title.trim()}" has been saved successfully`);
    } catch (error) {
      showToast('error', 'Failed to save guide', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setSaving(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal paste-modal">
        <div className="modal-header">
          <h3>Paste Guide Content</h3>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label htmlFor="paste-title">Guide Title:</label>
            <input 
              type="text" 
              id="paste-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Final Fantasy VII Guide" 
            />
          </div>
          <div className="form-group">
            <label htmlFor="paste-author">Author (optional):</label>
            <input 
              type="text" 
              id="paste-author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Guide author" 
            />
          </div>
          <div className="form-group">
            <label htmlFor="paste-game">Game Title (optional):</label>
            <input 
              type="text" 
              id="paste-game"
              value={gameTitle}
              onChange={(e) => setGameTitle(e.target.value)}
              placeholder="e.g., Final Fantasy VII" 
            />
          </div>
          <div className="form-group">
            <label htmlFor="paste-url">Source URL (optional):</label>
            <input 
              type="url" 
              id="paste-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://gamefaqs.gamespot.com/..." 
            />
          </div>
          <div className="form-group">
            <label htmlFor="paste-content">Guide Content:</label>
            <textarea 
              id="paste-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste the complete guide text here...&#10;&#10;Tip: Copy all text from the GameFAQs page and paste it here."
              rows={15}
            />
          </div>
        </div>
        <div className="modal-actions">
          <button onClick={handleSave} disabled={saving} className="primary-btn">
            {saving ? 'Saving...' : 'Save Guide'}
          </button>
          <button onClick={onClose} disabled={saving} className="secondary-btn">Cancel</button>
        </div>
      </div>
    </div>
  );
};