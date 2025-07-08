import { IDBPDatabase, IDBPTransaction, IDBPObjectStore, IDBPIndex, StoreNames, DBSchema } from 'idb';
import { db } from './database';
import { Guide, Bookmark, ReadingProgress } from '../types';

// Define RetroReaderDB interface to match the one in database.ts
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

// Mock idb
jest.mock('idb');

import { openDB as mockOpenDB } from 'idb';
const openDB = mockOpenDB as jest.MockedFunction<typeof mockOpenDB>;

describe('DatabaseService', () => {
  let mockDb: Partial<IDBPDatabase<RetroReaderDB>>;
  let mockTransaction: Partial<IDBPTransaction<RetroReaderDB, StoreNames<RetroReaderDB>[], 'readwrite'>>;
  let mockObjectStore: Partial<IDBPObjectStore<RetroReaderDB, StoreNames<RetroReaderDB>[], StoreNames<RetroReaderDB>, 'readwrite'>>;
  let mockIndex: Partial<IDBPIndex<RetroReaderDB, StoreNames<RetroReaderDB>[], StoreNames<RetroReaderDB>, string, 'readwrite'>>;
  let consoleErrorSpy: jest.SpyInstance;

  beforeAll(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset the database instance
    // Access private property for testing
    (db as unknown as { db: IDBPDatabase<RetroReaderDB> | null }).db = null;

    // Mock object store
    mockObjectStore = {
      put: jest.fn().mockResolvedValue(undefined),
      get: jest.fn().mockResolvedValue(undefined),
      getAll: jest.fn().mockResolvedValue([]),
      delete: jest.fn().mockResolvedValue(undefined),
      getAllKeys: jest.fn().mockResolvedValue([]),
      index: jest.fn().mockReturnThis(),
      createIndex: jest.fn()
    };

    // Mock index
    mockIndex = {
      getAll: jest.fn().mockResolvedValue([]),
      getAllKeys: jest.fn().mockResolvedValue([])
    };
    mockObjectStore.index.mockReturnValue(mockIndex);

    // Mock transaction
    mockTransaction = {
      objectStore: jest.fn().mockReturnValue(mockObjectStore),
      done: Promise.resolve()
    };

    // Mock database
    mockDb = {
      put: jest.fn().mockResolvedValue(undefined),
      get: jest.fn().mockResolvedValue(undefined),
      getAll: jest.fn().mockResolvedValue([]),
      getAllFromIndex: jest.fn().mockResolvedValue([]),
      delete: jest.fn().mockResolvedValue(undefined),
      transaction: jest.fn().mockReturnValue(mockTransaction),
      objectStoreNames: {
        contains: jest.fn().mockReturnValue(false)
      },
      createObjectStore: jest.fn().mockReturnValue(mockObjectStore)
    };

    openDB.mockResolvedValue(mockDb as IDBPDatabase<RetroReaderDB>);
  });

  describe('init', () => {
    it('should initialize the database', async () => {
      await db.init();
      
      expect(openDB).toHaveBeenCalledWith('retro-reader', 1, expect.any(Object));
      expect((db as unknown as { db: IDBPDatabase<RetroReaderDB> | null }).db).toBe(mockDb);
    });

    it('should not reinitialize if already initialized', async () => {
      await db.init();
      await db.init();
      
      expect(openDB).toHaveBeenCalledTimes(1);
    });

    it('should create object stores during upgrade', async () => {
      await db.init();
      
      const upgradeCallback = openDB.mock.calls[0][2].upgrade;
      const mockUpgradeDb = {
        objectStoreNames: {
          contains: jest.fn().mockReturnValue(false)
        },
        createObjectStore: jest.fn().mockReturnValue(mockObjectStore)
      };
      
      upgradeCallback(mockUpgradeDb);
      
      expect(mockUpgradeDb.createObjectStore).toHaveBeenCalledWith('guides', { keyPath: 'id' });
      expect(mockUpgradeDb.createObjectStore).toHaveBeenCalledWith('bookmarks', { keyPath: 'id' });
      expect(mockUpgradeDb.createObjectStore).toHaveBeenCalledWith('progress', { keyPath: 'guideId' });
      expect(mockObjectStore.createIndex).toHaveBeenCalledTimes(5);
    });

    it('should not create stores if they already exist', async () => {
      await db.init();
      
      const upgradeCallback = openDB.mock.calls[0][2].upgrade;
      const mockUpgradeDb = {
        objectStoreNames: {
          contains: jest.fn().mockReturnValue(true)
        },
        createObjectStore: jest.fn()
      };
      
      upgradeCallback(mockUpgradeDb);
      
      expect(mockUpgradeDb.createObjectStore).not.toHaveBeenCalled();
    });

    it('should handle initialization errors', async () => {
      const error = new Error('Database error');
      openDB.mockRejectedValue(error);
      
      await expect(db.init()).rejects.toThrow('Database error');
    });
  });

  describe('ensureDB', () => {
    it('should throw error if database not initialized', () => {
      // Access private method for testing
      const dbWithPrivate = db as unknown as { ensureDB(): IDBPDatabase<RetroReaderDB> };
      expect(() => dbWithPrivate.ensureDB()).toThrow('Database not initialized. Call init() first.');
    });

    it('should return database if initialized', async () => {
      await db.init();
      // Access private method for testing
      const dbWithPrivate = db as unknown as { ensureDB(): IDBPDatabase<RetroReaderDB> };
      const result = dbWithPrivate.ensureDB();
      expect(result).toBe(mockDb);
    });
  });

  describe('Guide operations', () => {
    beforeEach(async () => {
      await db.init();
    });

    describe('saveGuide', () => {
      it('should save a guide', async () => {
        const guide: Guide = {
          id: 'test-id',
          title: 'Test Guide',
          content: 'Test content',
          dateAdded: new Date(),
          totalLines: 100,
          lastModified: new Date()
        };

        await db.saveGuide(guide);
        
        expect(mockDb.put).toHaveBeenCalledWith('guides', guide);
      });
    });

    describe('getGuide', () => {
      it('should get a guide by id', async () => {
        const guide: Guide = {
          id: 'test-id',
          title: 'Test Guide',
          content: 'Test content',
          dateAdded: new Date(),
          totalLines: 100,
          lastModified: new Date()
        };
        mockDb.get.mockResolvedValue(guide);

        const result = await db.getGuide('test-id');
        
        expect(mockDb.get).toHaveBeenCalledWith('guides', 'test-id');
        expect(result).toBe(guide);
      });

      it('should return undefined if guide not found', async () => {
        mockDb.get.mockResolvedValue(undefined);

        const result = await db.getGuide('non-existent');
        
        expect(result).toBeUndefined();
      });
    });

    describe('getAllGuides', () => {
      it('should get all guides', async () => {
        const guides: Guide[] = [
          {
            id: 'test-1',
            title: 'Guide 1',
            content: 'Content 1',
            dateAdded: new Date(),
            totalLines: 50,
            lastModified: new Date()
          },
          {
            id: 'test-2',
            title: 'Guide 2',
            content: 'Content 2',
            dateAdded: new Date(),
            totalLines: 75,
            lastModified: new Date()
          }
        ];
        mockDb.getAll.mockResolvedValue(guides);

        const result = await db.getAllGuides();
        
        expect(mockDb.getAll).toHaveBeenCalledWith('guides');
        expect(result).toBe(guides);
      });
    });

    describe('deleteGuide', () => {
      it('should delete guide and related data', async () => {
        const bookmarkIds = ['bookmark-1', 'bookmark-2'];
        mockIndex.getAllKeys.mockResolvedValue(bookmarkIds);

        await db.deleteGuide('guide-id');
        
        expect(mockTransaction.objectStore).toHaveBeenCalledWith('guides');
        expect(mockTransaction.objectStore).toHaveBeenCalledWith('bookmarks');
        expect(mockTransaction.objectStore).toHaveBeenCalledWith('progress');
        expect(mockObjectStore.delete).toHaveBeenCalledWith('guide-id');
        expect(mockObjectStore.delete).toHaveBeenCalledWith('bookmark-1');
        expect(mockObjectStore.delete).toHaveBeenCalledWith('bookmark-2');
      });
    });
  });

  describe('Bookmark operations', () => {
    beforeEach(async () => {
      await db.init();
    });

    describe('saveBookmark', () => {
      it('should save a bookmark', async () => {
        const bookmark: Bookmark = {
          id: 'bookmark-1',
          guideId: 'guide-1',
          line: 42,
          title: 'Test Bookmark',
          dateCreated: new Date(),
          isCurrentPosition: false
        };

        await db.saveBookmark(bookmark);
        
        expect(mockDb.put).toHaveBeenCalledWith('bookmarks', bookmark);
      });
    });

    describe('getBookmarks', () => {
      it('should get bookmarks for a guide', async () => {
        const bookmarks: Bookmark[] = [
          {
            id: 'bookmark-1',
            guideId: 'guide-1',
            line: 10,
            title: 'Bookmark 1',
            dateCreated: new Date(),
            isCurrentPosition: false
          },
          {
            id: 'bookmark-2',
            guideId: 'guide-1',
            line: 20,
            title: 'Bookmark 2',
            dateCreated: new Date(),
            isCurrentPosition: false
          }
        ];
        mockDb.getAllFromIndex.mockResolvedValue(bookmarks);

        const result = await db.getBookmarks('guide-1');
        
        expect(mockDb.getAllFromIndex).toHaveBeenCalledWith('bookmarks', 'by-guide', 'guide-1');
        expect(result).toBe(bookmarks);
      });
    });

    describe('getBookmarksForGuide', () => {
      it('should call getBookmarks', async () => {
        const bookmarks: Bookmark[] = [];
        mockDb.getAllFromIndex.mockResolvedValue(bookmarks);
        jest.spyOn(db, 'getBookmarks');

        const result = await db.getBookmarksForGuide('guide-1');
        
        expect(db.getBookmarks).toHaveBeenCalledWith('guide-1');
        expect(result).toBe(bookmarks);
      });
    });

    describe('getAllBookmarks', () => {
      it('should get all bookmarks', async () => {
        const bookmarks: Bookmark[] = [
          {
            id: 'bookmark-1',
            guideId: 'guide-1',
            line: 10,
            title: 'Bookmark 1',
            dateCreated: new Date(),
            isCurrentPosition: false
          }
        ];
        mockDb.getAll.mockResolvedValue(bookmarks);

        const result = await db.getAllBookmarks();
        
        expect(mockDb.getAll).toHaveBeenCalledWith('bookmarks');
        expect(result).toBe(bookmarks);
      });
    });

    describe('deleteBookmark', () => {
      it('should delete a bookmark', async () => {
        await db.deleteBookmark('bookmark-1');
        
        expect(mockDb.delete).toHaveBeenCalledWith('bookmarks', 'bookmark-1');
      });
    });

    describe('saveCurrentPositionBookmark', () => {
      it('should save current position bookmark', async () => {
        mockDb.getAllFromIndex.mockResolvedValue([]);

        await db.saveCurrentPositionBookmark('guide-1', 50);
        
        expect(mockDb.put).toHaveBeenCalledWith('bookmarks', expect.objectContaining({
          id: 'current-position-guide-1',
          guideId: 'guide-1',
          line: 50,
          title: 'Current Position',
          isCurrentPosition: true
        }));
      });

      it('should convert existing current position to regular bookmark', async () => {
        const existingBookmark: Bookmark = {
          id: 'current-position-guide-1',
          guideId: 'guide-1',
          line: 30,
          title: 'Current Position',
          dateCreated: new Date(),
          isCurrentPosition: true
        };
        mockDb.getAllFromIndex.mockResolvedValue([existingBookmark]);

        await db.saveCurrentPositionBookmark('guide-1', 50);
        
        // Should save converted bookmark
        expect(mockDb.put).toHaveBeenCalledWith('bookmarks', expect.objectContaining({
          line: 30,
          title: 'Previous Position (Line 30)',
          isCurrentPosition: false
        }));
        
        // Should delete old current position
        expect(mockDb.delete).toHaveBeenCalledWith('bookmarks', 'current-position-guide-1');
        
        // Should save new current position
        expect(mockDb.put).toHaveBeenCalledWith('bookmarks', expect.objectContaining({
          id: 'current-position-guide-1',
          line: 50,
          isCurrentPosition: true
        }));
      });
    });

    describe('getCurrentPositionBookmark', () => {
      it('should return current position bookmark', async () => {
        const bookmarks: Bookmark[] = [
          {
            id: 'bookmark-1',
            guideId: 'guide-1',
            line: 10,
            title: 'Regular',
            dateCreated: new Date(),
            isCurrentPosition: false
          },
          {
            id: 'current-position-guide-1',
            guideId: 'guide-1',
            line: 50,
            title: 'Current Position',
            dateCreated: new Date(),
            isCurrentPosition: true
          }
        ];
        mockDb.getAllFromIndex.mockResolvedValue(bookmarks);

        const result = await db.getCurrentPositionBookmark('guide-1');
        
        expect(result).toBe(bookmarks[1]);
      });

      it('should return null if no current position bookmark', async () => {
        mockDb.getAllFromIndex.mockResolvedValue([]);

        const result = await db.getCurrentPositionBookmark('guide-1');
        
        expect(result).toBeNull();
      });
    });
  });

  describe('Progress operations', () => {
    beforeEach(async () => {
      await db.init();
    });

    describe('saveProgress', () => {
      it('should save progress', async () => {
        const progress: ReadingProgress = {
          guideId: 'guide-1',
          currentLine: 100,
          totalLines: 500,
          lastRead: new Date()
        };

        await db.saveProgress(progress);
        
        expect(mockDb.put).toHaveBeenCalledWith('progress', progress);
      });
    });

    describe('getProgress', () => {
      it('should get progress for a guide', async () => {
        const progress: ReadingProgress = {
          guideId: 'guide-1',
          currentLine: 100,
          totalLines: 500,
          lastRead: new Date()
        };
        mockDb.get.mockResolvedValue(progress);

        const result = await db.getProgress('guide-1');
        
        expect(mockDb.get).toHaveBeenCalledWith('progress', 'guide-1');
        expect(result).toBe(progress);
      });
    });
  });

  describe('Import/Export operations', () => {
    beforeEach(async () => {
      await db.init();
    });

    describe('exportData', () => {
      it('should export all data', async () => {
        const guides = [{ id: 'guide-1', title: 'Guide 1' }];
        const bookmarks = [{ id: 'bookmark-1', guideId: 'guide-1' }];
        const progress = [{ guideId: 'guide-1', currentLine: 50 }];
        
        mockDb.getAll.mockImplementation((store) => {
          switch (store) {
            case 'guides': return Promise.resolve(guides);
            case 'bookmarks': return Promise.resolve(bookmarks);
            case 'progress': return Promise.resolve(progress);
            default: return Promise.resolve([]);
          }
        });

        const result = await db.exportData();
        
        expect(mockDb.getAll).toHaveBeenCalledWith('guides');
        expect(mockDb.getAll).toHaveBeenCalledWith('bookmarks');
        expect(mockDb.getAll).toHaveBeenCalledWith('progress');
        expect(result).toEqual({ guides, bookmarks, progress });
      });
    });

    describe('importData', () => {
      it('should import all data', async () => {
        const data = {
          guides: [
            { id: 'guide-1', title: 'Guide 1', content: '', dateAdded: new Date(), totalLines: 100, lastModified: new Date() }
          ] as Guide[],
          bookmarks: [
            { id: 'bookmark-1', guideId: 'guide-1', line: 10, title: 'Test', dateCreated: new Date(), isCurrentPosition: false }
          ] as Bookmark[],
          progress: [
            { guideId: 'guide-1', currentLine: 50, totalLines: 100, lastRead: new Date() }
          ] as ReadingProgress[]
        };

        await db.importData(data);
        
        expect(mockTransaction.objectStore).toHaveBeenCalledWith('guides');
        expect(mockTransaction.objectStore).toHaveBeenCalledWith('bookmarks');
        expect(mockTransaction.objectStore).toHaveBeenCalledWith('progress');
        expect(mockObjectStore.put).toHaveBeenCalledTimes(3);
      });
    });
  });

  describe('Error handling', () => {
    it('should throw error when database operations fail before init', async () => {
      await expect(db.saveGuide({} as Guide)).rejects.toThrow('Database not initialized');
      await expect(db.getGuide('test')).rejects.toThrow('Database not initialized');
      await expect(db.getAllGuides()).rejects.toThrow('Database not initialized');
    });
  });
});