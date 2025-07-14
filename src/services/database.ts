import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Guide } from '../stores/useGuideStore';
import { Bookmark } from '../stores/useBookmarkStore';
import { generateId } from '../utils/common';

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
        },
      });
    } catch (error) {
      console.error('Error initializing database:', error);
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
    const guide = await db.get('guides', id);
    if (!guide) return undefined;
    // Ensure date fields are Date objects, handle missing fields gracefully
    return {
      ...guide,
      dateAdded: guide.dateAdded 
        ? (guide.dateAdded instanceof Date ? guide.dateAdded : new Date(guide.dateAdded))
        : new Date(),
      dateModified: guide.dateModified 
        ? (guide.dateModified instanceof Date ? guide.dateModified : new Date(guide.dateModified))
        : new Date()
    };
  }

  async getAllGuides(): Promise<Guide[]> {
    const db = this.ensureDB();
    const guides = await db.getAll('guides');
    // Ensure date fields are Date objects, handle missing fields gracefully
    return guides.map(guide => ({
      ...guide,
      dateAdded: guide.dateAdded 
        ? (guide.dateAdded instanceof Date ? guide.dateAdded : new Date(guide.dateAdded))
        : new Date(),
      dateModified: guide.dateModified 
        ? (guide.dateModified instanceof Date ? guide.dateModified : new Date(guide.dateModified))
        : new Date()
    }));
  }

  async deleteGuide(id: string): Promise<void> {
    const db = this.ensureDB();
    const tx = db.transaction(['guides', 'bookmarks'], 'readwrite');
    
    await tx.objectStore('guides').delete(id);
    
    const bookmarks = await tx.objectStore('bookmarks').index('by-guide').getAllKeys(id);
    for (const bookmarkId of bookmarks) {
      await tx.objectStore('bookmarks').delete(bookmarkId);
    }
    
    await tx.done;
  }

  async saveBookmark(bookmark: Bookmark): Promise<void> {
    const db = this.ensureDB();
    await db.put('bookmarks', bookmark);
  }

  async getBookmarks(guideId: string): Promise<Bookmark[]> {
    const db = this.ensureDB();
    const bookmarks = await db.getAllFromIndex('bookmarks', 'by-guide', guideId);
    // Ensure dateCreated is a Date object
    return bookmarks.map(bookmark => ({
      ...bookmark,
      dateCreated: bookmark.dateCreated instanceof Date 
        ? bookmark.dateCreated 
        : new Date(bookmark.dateCreated)
    }));
  }


  async getAllBookmarks(): Promise<Bookmark[]> {
    const db = this.ensureDB();
    const bookmarks = await db.getAll('bookmarks');
    // Ensure dateCreated is a Date object
    return bookmarks.map(bookmark => ({
      ...bookmark,
      dateCreated: bookmark.dateCreated instanceof Date 
        ? bookmark.dateCreated 
        : new Date(bookmark.dateCreated)
    }));
  }

  async deleteBookmark(id: string): Promise<void> {
    const db = this.ensureDB();
    await db.delete('bookmarks', id);
  }

  async saveCurrentPositionBookmark(guideId: string, line: number): Promise<void> {
    this.ensureDB();
    
    // First, convert any existing current position bookmark to a regular bookmark
    const existingBookmarks = await this.getBookmarks(guideId);
    const currentPositionBookmark = existingBookmarks.find(b => b.isCurrentPosition);
    if (currentPositionBookmark) {
      // Convert to regular bookmark by removing isCurrentPosition flag
      const regularBookmark: Bookmark = {
        ...currentPositionBookmark,
        id: generateId(),
        title: currentPositionBookmark.title === 'Current Position' ? `Previous Position (Line ${currentPositionBookmark.line})` : currentPositionBookmark.title,
        isCurrentPosition: false
      };
      await this.saveBookmark(regularBookmark);
      
      // Delete the old current position bookmark
      await this.deleteBookmark(currentPositionBookmark.id);
    }
    
    // Create new current position bookmark
    const bookmark: Bookmark = {
      id: `current-position-${guideId}`,
      guideId,
      line,
      title: 'Current Position',
      dateCreated: new Date(),
      isCurrentPosition: true
    };
    
    await this.saveBookmark(bookmark);
  }

  async getCurrentPositionBookmark(guideId: string): Promise<Bookmark | null> {
    const bookmarks = await this.getBookmarks(guideId);
    return bookmarks.find(b => b.isCurrentPosition) || null;
  }



  async exportData(): Promise<{ guides: Guide[], bookmarks: Bookmark[] }> {
    const db = this.ensureDB();
    const [guidesRaw, bookmarksRaw] = await Promise.all([
      db.getAll('guides'),
      db.getAll('bookmarks')
    ]);
    
    // Ensure all date fields are Date objects
    const guides = guidesRaw.map(guide => ({
      ...guide,
      dateAdded: guide.dateAdded instanceof Date 
        ? guide.dateAdded 
        : new Date(guide.dateAdded),
      dateModified: guide.dateModified instanceof Date 
        ? guide.dateModified 
        : new Date(guide.dateModified)
    }));
    
    const bookmarks = bookmarksRaw.map(bookmark => ({
      ...bookmark,
      dateCreated: bookmark.dateCreated instanceof Date 
        ? bookmark.dateCreated 
        : new Date(bookmark.dateCreated)
    }));
    
    return { guides, bookmarks };
  }

  async importData(data: { guides: Guide[], bookmarks: Bookmark[] }): Promise<void> {
    const db = this.ensureDB();
    const tx = db.transaction(['guides', 'bookmarks'], 'readwrite');
    
    for (const guide of data.guides) {
      // Ensure date fields are Date objects before storing
      const guideWithDates = {
        ...guide,
        dateAdded: guide.dateAdded instanceof Date 
          ? guide.dateAdded 
          : new Date(guide.dateAdded),
        dateModified: guide.dateModified instanceof Date 
          ? guide.dateModified 
          : new Date(guide.dateModified)
      };
      await tx.objectStore('guides').put(guideWithDates);
    }
    
    for (const bookmark of data.bookmarks) {
      // Ensure dateCreated is a Date object before storing
      const bookmarkWithDate = {
        ...bookmark,
        dateCreated: bookmark.dateCreated instanceof Date 
          ? bookmark.dateCreated 
          : new Date(bookmark.dateCreated)
      };
      await tx.objectStore('bookmarks').put(bookmarkWithDate);
    }
    
    await tx.done;
  }
}

export const db = new DatabaseService();