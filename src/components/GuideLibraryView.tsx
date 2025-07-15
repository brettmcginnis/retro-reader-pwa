import React, { useState } from 'react';
import clsx from 'clsx';
import { Guide } from '../stores/useGuideStore';
import { UrlImport } from './UrlImport';
import { GuideCard } from './GuideCard';
import { PasteModal } from './PasteModal';
import { Button } from './Button';
import { Upload, FileText, Link, Moon, Sun } from 'lucide-react';

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
    <div className="min-h-screen bg-retro-50 dark:bg-retro-950">
      <header className="bg-white dark:bg-retro-900 border-b border-retro-200 dark:border-retro-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-retro-900 dark:text-retro-100">Retro Reader</h1>
            <button 
              onClick={onToggleTheme} 
              className="p-2 text-retro-600 dark:text-retro-400 hover:text-retro-900 dark:hover:text-retro-100 hover:bg-retro-100 dark:hover:bg-retro-800 rounded-lg transition-colors"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-retro-900 rounded-lg shadow-sm border border-retro-200 dark:border-retro-700 p-6 mb-8">
          <h2 className="text-lg font-semibold text-retro-900 dark:text-retro-100 mb-4">Add New Guide</h2>
          
          <div className="flex space-x-1 mb-6 border-b border-retro-200 dark:border-retro-700">
            <button 
              className={clsx(
                'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                activeTab === 'url' 
                  ? 'text-blue-600 border-blue-600' 
                  : 'text-retro-600 dark:text-retro-400 border-transparent hover:text-retro-900 dark:hover:text-retro-100'
              )}
              onClick={() => setActiveTab('url')}
            >
              <Link className="w-4 h-4 inline-block mr-2" />
              From URL
            </button>
            <button 
              className={clsx(
                'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                activeTab === 'paste' 
                  ? 'text-blue-600 border-blue-600' 
                  : 'text-retro-600 dark:text-retro-400 border-transparent hover:text-retro-900 dark:hover:text-retro-100'
              )}
              onClick={() => setActiveTab('paste')}
            >
              <FileText className="w-4 h-4 inline-block mr-2" />
              Paste Content
            </button>
            <button 
              className={clsx(
                'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                activeTab === 'upload' 
                  ? 'text-blue-600 border-blue-600' 
                  : 'text-retro-600 dark:text-retro-400 border-transparent hover:text-retro-900 dark:hover:text-retro-100'
              )}
              onClick={() => setActiveTab('upload')}
            >
              <Upload className="w-4 h-4 inline-block mr-2" />
              Upload File
            </button>
          </div>
          
          {activeTab === 'url' && (
            <div className="space-y-4">
              <UrlImport onFetch={onFetchGuide} loading={fetchLoading} />
            </div>
          )}
          
          {activeTab === 'paste' && (
            <div className="space-y-4">
              <Button variant="primary" onClick={() => setShowPasteModal(true)}>
                Paste Guide Content
              </Button>
              <p className="text-sm text-retro-600 dark:text-retro-400">
                Copy text from GameFAQs or other sites and paste it here.
              </p>
            </div>
          )}
          
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <label htmlFor="txt-upload" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer transition-colors">
                Choose Text File
              </label>
              <input 
                type="file" 
                id="txt-upload" 
                className="sr-only" 
                accept=".txt" 
                onChange={onFileSelect}
              />
              <p className="text-sm text-retro-600 dark:text-retro-400">
                Upload a .txt file to create a new guide. The filename will be used as the guide title.
              </p>
            </div>
          )}
          
          <div className="flex items-center gap-4 mt-6 pt-6 border-t border-retro-200 dark:border-retro-700">
            <label htmlFor="import-file" className="inline-flex items-center px-4 py-2 border border-retro-300 dark:border-retro-600 rounded-md shadow-sm text-sm font-medium text-retro-700 dark:text-retro-300 bg-white dark:bg-retro-800 hover:bg-retro-50 dark:hover:bg-retro-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer transition-colors">
              Import Backup
            </label>
            <input 
              type="file" 
              id="import-file" 
              ref={fileInputRef}
              className="sr-only" 
              accept=".json,.txt" 
              onChange={onFileSelect}
            />
            <Button variant="secondary" onClick={onExportAll}>
              Export All
            </Button>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-retro-900 dark:text-retro-100 mb-4">Your Guide Library</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {guides.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-retro-600 dark:text-retro-400">
                  No guides yet. Add your first guide by entering a URL above!
                </p>
              </div>
            ) : (
              guides.map(guide => (
                <GuideCard 
                  key={guide.id}
                  guide={guide}
                  onRead={() => onOpenGuide(guide)}
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