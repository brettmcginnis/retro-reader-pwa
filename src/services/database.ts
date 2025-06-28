import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Guide, Bookmark, ReadingProgress } from '../types';

interface RetroReaderDB extends DBSchema {
  guides: {
    key: string;
    value: Guide;
    indexes: { 'by-date-added': Date; 'by-title': string };
  };
  bookmarks: {
    key: string;
    value: Bookmark;
    indexes: { 'by-guide': string; 'by-date': Date };
  };
  progress: {
    key: string;
    value: ReadingProgress;
    indexes: { 'by-last-read': Date };
  };
}

class DatabaseService {
  private db: IDBPDatabase<RetroReaderDB> | null = null;

  async init(): Promise<void> {
    // If the database is already initialized, just return
    if (this.db) {
      return;
    }
    
    try {
      this.db = await openDB<RetroReaderDB>('retro-reader', 1, {
        upgrade(db) {
          // Check if stores already exist before creating them
          if (!db.objectStoreNames.contains('guides')) {
            const guidesStore = db.createObjectStore('guides', { keyPath: 'id' });
            guidesStore.createIndex('by-date-added', 'dateAdded');
            guidesStore.createIndex('by-title', 'title');
          }
  
          if (!db.objectStoreNames.contains('bookmarks')) {
            const bookmarksStore = db.createObjectStore('bookmarks', { keyPath: 'id' });
            bookmarksStore.createIndex('by-guide', 'guideId');
            bookmarksStore.createIndex('by-date', 'dateCreated');
          }
  
          if (!db.objectStoreNames.contains('progress')) {
            const progressStore = db.createObjectStore('progress', { keyPath: 'guideId' });
            progressStore.createIndex('by-last-read', 'lastRead');
          }
        },
      });
    } catch (error) {
      console.error("Error initializing database:", error);
      throw error;
    }
  }

  private ensureDB(): IDBPDatabase<RetroReaderDB> {
    if (!this.db) {
      throw new Error('Database not initialized. Call init() first.');
    }
    return this.db;
  }

  async saveGuide(guide: Guide): Promise<void> {
    const db = this.ensureDB();
    await db.put('guides', guide);
  }

  async getGuide(id: string): Promise<Guide | undefined> {
    const db = this.ensureDB();
    return await db.get('guides', id);
  }

  async getAllGuides(): Promise<Guide[]> {
    const db = this.ensureDB();
    return await db.getAll('guides');
  }

  async deleteGuide(id: string): Promise<void> {
    const db = this.ensureDB();
    const tx = db.transaction(['guides', 'bookmarks', 'progress'], 'readwrite');
    
    await tx.objectStore('guides').delete(id);
    
    const bookmarks = await tx.objectStore('bookmarks').index('by-guide').getAllKeys(id);
    for (const bookmarkId of bookmarks) {
      await tx.objectStore('bookmarks').delete(bookmarkId);
    }
    
    await tx.objectStore('progress').delete(id);
    await tx.done;
  }

  async saveBookmark(bookmark: Bookmark): Promise<void> {
    const db = this.ensureDB();
    await db.put('bookmarks', bookmark);
  }

  async getBookmarks(guideId: string): Promise<Bookmark[]> {
    const db = this.ensureDB();
    return await db.getAllFromIndex('bookmarks', 'by-guide', guideId);
  }

  async getBookmarksForGuide(guideId: string): Promise<Bookmark[]> {
    return this.getBookmarks(guideId);
  }

  async getAllBookmarks(): Promise<Bookmark[]> {
    const db = this.ensureDB();
    return await db.getAll('bookmarks');
  }

  async deleteBookmark(id: string): Promise<void> {
    const db = this.ensureDB();
    await db.delete('bookmarks', id);
  }

  async saveProgress(progress: ReadingProgress): Promise<void> {
    const db = this.ensureDB();
    await db.put('progress', progress);
  }

  async getProgress(guideId: string): Promise<ReadingProgress | undefined> {
    const db = this.ensureDB();
    return await db.get('progress', guideId);
  }


  async exportData(): Promise<{ guides: Guide[], bookmarks: Bookmark[], progress: ReadingProgress[] }> {
    const db = this.ensureDB();
    const [guides, bookmarks, progress] = await Promise.all([
      db.getAll('guides'),
      db.getAll('bookmarks'),
      db.getAll('progress')
    ]);
    
    return { guides, bookmarks, progress };
  }

  async importData(data: { guides: Guide[], bookmarks: Bookmark[], progress: ReadingProgress[] }): Promise<void> {
    const db = this.ensureDB();
    const tx = db.transaction(['guides', 'bookmarks', 'progress'], 'readwrite');
    
    for (const guide of data.guides) {
      await tx.objectStore('guides').put(guide);
    }
    
    for (const bookmark of data.bookmarks) {
      await tx.objectStore('bookmarks').put(bookmark);
    }
    
    for (const progress of data.progress) {
      await tx.objectStore('progress').put(progress);
    }
    
    await tx.done;
  }
}

export const db = new DatabaseService();