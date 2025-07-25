import React, { useState, useRef, useEffect } from 'react';
import { Guide } from '../stores/useGuideStore';
import { useGuideStore } from '../stores/useGuideStore';
import { useAppStore } from '../stores/useAppStore';
import { useToast } from '../contexts/useToast';
import { GuideLibraryView } from '../components/GuideLibraryView';

export const GuideLibraryContainer: React.FC = () => {
  const { guides, loadGuides, fetchGuide, createGuide, deleteGuide, exportGuide, exportAll, importFromFile } = useGuideStore();
  const { theme, toggleTheme, setCurrentGuideId } = useAppStore();
  const { showToast, confirm } = useToast();
  const [fetchLoading, setFetchLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load guides on mount
  useEffect(() => {
    loadGuides();
  }, [loadGuides]);

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
    const confirmed = await confirm({
      title: 'Delete Guide',
      message: `Are you sure you want to delete '${guide.title}'? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel'
    });
    
    if (confirmed) {
      try {
        await deleteGuide(guide.id);
        showToast('success', 'Guide Deleted', `'${guide.title}' has been deleted`);
      } catch (error) {
        showToast('error', 'Failed to delete guide', error instanceof Error ? error.message : 'Unknown error');
      }
    }
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
      const confirmCallback = async (title: string): Promise<boolean> => {
        return await confirm({
          title: 'Guide Already Exists',
          message: `A guide titled '${title}' already exists. Do you want to replace it?`,
          confirmText: 'Replace',
          cancelText: 'Skip'
        });
      };

      const result = await importFromFile(file, confirmCallback);
      const isTextFile = file.name.toLowerCase().endsWith('.txt');
      
      if (isTextFile && result.imported === 1) {
        showToast('success', 'Guide Created', `Guide created successfully from '${file.name}'`);
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
    window.history.pushState({ guideId: guide.id }, '', `/retro-reader-pwa/guide/${guide.id}`);
  };


  const handleCreateGuide = async (guide: Omit<Guide, 'id' | 'dateAdded' | 'dateModified'>) => {
    try {
      const newGuide = await createGuide(guide);
      showToast('success', 'Guide Saved', `"${newGuide.title}" has been saved successfully`);
      return newGuide;
    } catch (error) {
      showToast('error', 'Failed to save guide', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  };

  const sortedGuides = guides.sort((a, b) => b.dateModified.getTime() - a.dateModified.getTime());

  return (
    <GuideLibraryView
      guides={sortedGuides}
      theme={theme}
      fetchLoading={fetchLoading}
      fileInputRef={fileInputRef}
      onToggleTheme={toggleTheme}
      onFetchGuide={handleFetchGuide}
      onDeleteGuide={handleDeleteGuide}
      onExportGuide={handleExportGuide}
      onExportAll={handleExportAll}
      onFileSelect={handleFileSelect}
      onOpenGuide={openGuide}
      onCreateGuide={handleCreateGuide}
    />
  );
};