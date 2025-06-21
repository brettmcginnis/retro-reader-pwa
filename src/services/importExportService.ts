import { Guide, GuideCollection } from '../types';
import { db } from './database';

export class ImportExportService {
  private static readonly VERSION = '1.0.0';
  
  // Ensure database is initialized before operations
  private async ensureDbInitialized(): Promise<void> {
    try {
      // This is a no-op if the DB is already initialized
      await db.init();
    } catch (error) {
      console.error("Error initializing database:", error);
      throw new Error(`Database initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async exportAll(): Promise<void> {
    await this.ensureDbInitialized();
    const data = await db.exportData();
    const collection: GuideCollection = {
      guides: data.guides,
      bookmarks: data.bookmarks,
      progress: data.progress,
      exportDate: new Date(),
      version: ImportExportService.VERSION
    };

    this.downloadJSON(collection, 'retro-reader-collection.json');
  }

  async exportGuide(guideId: string): Promise<void> {
    await this.ensureDbInitialized();
    
    const guide = await db.getGuide(guideId);
    if (!guide) {
      throw new Error('Guide not found');
    }

    const bookmarks = await db.getBookmarksForGuide(guideId);
    const progress = await db.getProgress(guideId);

    const collection: GuideCollection = {
      guides: [guide],
      bookmarks,
      progress: progress ? [progress] : [],
      exportDate: new Date(),
      version: ImportExportService.VERSION
    };

    const filename = `${guide.title.replace(/[^a-z0-9]/gi, '_')}_guide.json`;
    this.downloadJSON(collection, filename);
  }

  async importFromFile(file: File): Promise<{ imported: number; skipped: number; errors: string[] }> {
    await this.ensureDbInitialized();
    
    // Check if it's a txt file
    if (file.name.toLowerCase().endsWith('.txt')) {
      return this.importTxtFile(file);
    }
    
    // Handle JSON files (backup format)
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          const data = JSON.parse(content);
          const result = await this.importData(data);
          resolve(result);
        } catch (error) {
          reject(new Error(`Failed to parse import file: ${error instanceof Error ? error.message : 'Unknown error'}`));
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsText(file);
    });
  }

  private async importTxtFile(file: File): Promise<{ imported: number; skipped: number; errors: string[] }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          
          if (!content.trim()) {
            reject(new Error('Text file is empty'));
            return;
          }

          // Create guide from txt file
          const guide: Guide = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
            title: this.extractTitleFromFilename(file.name),
            content: content,
            url: '', // No URL for uploaded files
            dateAdded: new Date(),
            dateModified: new Date(),
            size: content.length
          };

          // Save to database
          await db.saveGuide(guide);
          
          resolve({ 
            imported: 1, 
            skipped: 0, 
            errors: [] 
          });
        } catch (error) {
          reject(new Error(`Failed to import text file: ${error instanceof Error ? error.message : 'Unknown error'}`));
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsText(file);
    });
  }

  private async importData(data: unknown): Promise<{ imported: number; skipped: number; errors: string[] }> {
    await this.ensureDbInitialized();
    
    const result = { imported: 0, skipped: 0, errors: [] as string[] };

    if (!this.validateImportData(data)) {
      throw new Error('Invalid import data format');
    }

    const collection = data as GuideCollection;

    for (const guide of collection.guides) {
      try {
        const existingGuide = await db.getGuide(guide.id);
        if (existingGuide) {
          if (confirm(`Guide "${guide.title}" already exists. Replace it?`)) {
            await db.saveGuide({
              ...guide,
              dateAdded: new Date(guide.dateAdded),
              dateModified: new Date(guide.dateModified)
            });
            result.imported++;
          } else {
            result.skipped++;
          }
        } else {
          await db.saveGuide({
            ...guide,
            dateAdded: new Date(guide.dateAdded),
            dateModified: new Date(guide.dateModified)
          });
          result.imported++;
        }
      } catch (error) {
        result.errors.push(`Failed to import guide "${guide.title}": ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    for (const bookmark of collection.bookmarks) {
      try {
        await db.saveBookmark({
          ...bookmark,
          dateCreated: new Date(bookmark.dateCreated)
        });
      } catch (error) {
        result.errors.push(`Failed to import bookmark "${bookmark.title}": ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    for (const progress of collection.progress) {
      try {
        await db.saveProgress({
          ...progress,
          lastRead: new Date(progress.lastRead)
        });
      } catch (error) {
        result.errors.push(`Failed to import progress for guide ${progress.guideId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return result;
  }

  private validateImportData(data: unknown): data is GuideCollection {
    if (!data || typeof data !== 'object' || data === null) {
      return false;
    }
    
    const collection = data as GuideCollection;
    return (
      Array.isArray(collection.guides) &&
      Array.isArray(collection.bookmarks) &&
      Array.isArray(collection.progress) &&
      typeof collection.version === 'string' &&
      collection.exportDate instanceof Date
    );
  }

  async exportAsText(guideId: string): Promise<void> {
    await this.ensureDbInitialized();
    
    const guide = await db.getGuide(guideId);
    if (!guide) {
      throw new Error('Guide not found');
    }

    const bookmarks = await db.getBookmarksForGuide(guideId);
    
    let content = `${guide.title}\n`;
    content += `${'='.repeat(guide.title.length)}\n\n`;
    
    if (guide.author) {
      content += `Author: ${guide.author}\n`;
    }
    
    if (guide.gameTitle) {
      content += `Game: ${guide.gameTitle}\n`;
    }
    
    content += `URL: ${guide.url}\n`;
    content += `Date Added: ${guide.dateAdded.toLocaleDateString()}\n\n`;

    if (bookmarks.length > 0) {
      content += 'BOOKMARKS:\n';
      content += '-----------\n';
      bookmarks.forEach(bookmark => {
        content += `Line ${bookmark.line}: ${bookmark.title}\n`;
        if (bookmark.note) {
          content += `  Note: ${bookmark.note}\n`;
        }
      });
      content += '\n';
    }

    content += 'CONTENT:\n';
    content += '--------\n';
    content += guide.content;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${guide.title.replace(/[^a-z0-9]/gi, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async importFromUrl(url: string): Promise<Guide> {
    await this.ensureDbInitialized();
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
      }

      const content = await response.text();
      
      if (this.isJSONContent(content)) {
        const data = JSON.parse(content);
        if (this.validateImportData(data)) {
          await this.importData(data);
          return data.guides[0];
        }
      }

      const guide: Guide = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2),
        title: this.extractTitleFromUrl(url),
        url,
        content,
        dateAdded: new Date(),
        dateModified: new Date(),
        size: content.length
      };

      await db.saveGuide(guide);
      return guide;
    } catch (error) {
      throw new Error(`Failed to import from URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private isJSONContent(content: string): boolean {
    try {
      JSON.parse(content);
      return true;
    } catch {
      return false;
    }
  }

  private extractTitleFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const filename = pathname.split('/').pop() || 'imported-guide';
      return filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    } catch {
      return 'Imported Guide';
    }
  }

  private extractTitleFromFilename(filename: string): string {
    // Remove file extension and replace underscores/hyphens with spaces
    return filename
      .replace(/\.[^/.]+$/, '') // Remove extension
      .replace(/[_-]/g, ' ') // Replace underscores and hyphens with spaces
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim()
      .replace(/\b\w/g, l => l.toUpperCase()) // Capitalize first letter of each word
      || 'Imported Guide'; // Fallback title
  }

  private downloadJSON(data: unknown, filename: string): void {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async createBackup(): Promise<void> {
    await this.ensureDbInitialized();
    
    const data = await db.exportData();
    const backup = {
      ...data,
      backupDate: new Date(),
      version: ImportExportService.VERSION,
      type: 'backup'
    };

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.downloadJSON(backup, `retro-reader-backup-${timestamp}.json`);
  }

  async restoreFromBackup(file: File): Promise<void> {
    await this.ensureDbInitialized();
    
    const result = await this.importFromFile(file);
    
    if (result.errors.length > 0) {
      console.warn('Import completed with errors:', result.errors);
    }

    alert(`Backup restored! Imported: ${result.imported}, Skipped: ${result.skipped}, Errors: ${result.errors.length}`);
  }
}