import { Guide, GuideCollection } from '../types';
import { db } from './database';
import { generateId, extractTitleFromUrl, wrapError } from '../utils/common';

/**
 * Service for importing and exporting guides and bookmarks.
 * Handles file downloads, uploads, and URL imports.
 */
export class ImportExportService {
  private static readonly VERSION = '1.0.0';
  
  // Ensure database is initialized before operations
  private async ensureDbInitialized(): Promise<void> {
    try {
      // This is a no-op if the DB is already initialized
      await db.init();
    } catch (error) {
      console.error('Error initializing database:', error);
      throw wrapError(error, 'Database initialization failed');
    }
  }

  /**
   * Exports all guides and bookmarks as a JSON file download.
   */
  async exportAll(): Promise<void> {
    await this.ensureDbInitialized();
    const data = await db.exportData();
    const collection: GuideCollection = {
      guides: data.guides,
      bookmarks: data.bookmarks,
      exportDate: new Date(),
      version: ImportExportService.VERSION
    };

    this.downloadJSON(collection, 'retro-reader-collection.json');
  }

  /**
   * Exports a single guide with its bookmarks as a JSON file download.
   * @param guideId - The ID of the guide to export
   * @throws Error if guide is not found
   */
  async exportGuide(guideId: string): Promise<void> {
    await this.ensureDbInitialized();
    
    const guide = await db.getGuide(guideId);
    if (!guide) {
      throw new Error('Guide not found');
    }

    const bookmarks = await db.getBookmarks(guideId);

    const collection: GuideCollection = {
      guides: [guide],
      bookmarks,
      exportDate: new Date(),
      version: ImportExportService.VERSION
    };

    const filename = `${guide.title.replace(/[^a-z0-9]/gi, '_')}_guide.json`;
    this.downloadJSON(collection, filename);
  }

  /**
   * Imports guides and bookmarks from a JSON file.
   * @param file - The file to import from
   * @param onConfirm - Optional callback to confirm overwriting existing guides
   * @returns Import results with counts and any errors
   */
  async importFromFile(file: File, onConfirm?: (title: string) => Promise<boolean>): Promise<{ imported: number; skipped: number; errors: string[] }> {
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
          const result = await this.importData(data, onConfirm);
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
            id: generateId(),
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

  private async importData(data: unknown, onConfirm?: (title: string) => Promise<boolean>): Promise<{ imported: number; skipped: number; errors: string[] }> {
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
          const shouldReplace = onConfirm ? await onConfirm(guide.title) : false;
          if (shouldReplace) {
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
        result.errors.push(`Failed to import guide '${guide.title}': ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    for (const bookmark of collection.bookmarks) {
      try {
        await db.saveBookmark({
          ...bookmark,
          dateCreated: new Date(bookmark.dateCreated)
        });
      } catch (error) {
        result.errors.push(`Failed to import bookmark '${bookmark.title}': ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }


    return result;
  }

  private validateImportData(data: unknown): data is GuideCollection {
    if (!data || typeof data !== 'object' || data === null) {
      return false;
    }
    
    const collection = data as GuideCollection;
    
    // Check for valid date (can be Date object or valid date string)
    const isValidDate = (dateValue: unknown): boolean => {
      if (dateValue instanceof Date) return true;
      if (typeof dateValue === 'string') {
        const parsed = new Date(dateValue);
        return !isNaN(parsed.getTime());
      }
      return false;
    };
    
    return (
      Array.isArray(collection.guides) &&
      Array.isArray(collection.bookmarks) &&
      typeof collection.version === 'string' &&
      isValidDate(collection.exportDate)
    );
  }

  /**
   * Exports a guide's content as a plain text file download.
   * @param guideId - The ID of the guide to export
   * @throws Error if guide is not found
   */
  async exportAsText(guideId: string): Promise<void> {
    await this.ensureDbInitialized();
    
    const guide = await db.getGuide(guideId);
    if (!guide) {
      throw new Error('Guide not found');
    }

    const bookmarks = await db.getBookmarks(guideId);
    
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

  /**
   * Imports a guide from a URL.
   * @param url - The URL to import the guide from
   * @returns The imported guide
   */
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
        id: generateId(),
        title: extractTitleFromUrl(url),
        url,
        content,
        dateAdded: new Date(),
        dateModified: new Date(),
        size: content.length
      };

      await db.saveGuide(guide);
      return guide;
    } catch (error) {
      throw wrapError(error, 'Failed to import from URL');
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
}
