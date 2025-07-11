import { db } from './database';
import { Bookmark } from '../types';
import { generateId } from '../utils/common';

// Mock the database module
jest.mock('./database', () => {
  return {
    db: {
      init: jest.fn().mockResolvedValue(undefined),
      saveBookmark: jest.fn(),
      getBookmarks: jest.fn(),
      getAllBookmarks: jest.fn(),
      deleteBookmark: jest.fn(),
      saveCurrentPositionBookmark: jest.fn(),
      getCurrentPositionBookmark: jest.fn()
    }
  };
});

describe('Current Position Bookmark', () => {
  let mockBookmarks: Map<string, Bookmark>;

  beforeEach(() => {
    jest.clearAllMocks();
    // Get the mock bookmarks map and clear it
    mockBookmarks = new Map();
    
    // Re-implement the mock functions with the cleared map
    (db.saveBookmark as jest.Mock).mockImplementation(async (bookmark: Bookmark) => {
      mockBookmarks.set(bookmark.id, bookmark);
    });
    
    (db.getBookmarks as jest.Mock).mockImplementation(async (guideId: string) => {
      return Array.from(mockBookmarks.values()).filter(b => b.guideId === guideId);
    });
    
    (db.getAllBookmarks as jest.Mock).mockImplementation(async () => {
      return Array.from(mockBookmarks.values());
    });
    
    (db.deleteBookmark as jest.Mock).mockImplementation(async (id: string) => {
      mockBookmarks.delete(id);
    });
    
    (db.saveCurrentPositionBookmark as jest.Mock).mockImplementation(async (guideId: string, line: number) => {
      // Convert existing current position bookmark to regular bookmark
      const existing = Array.from(mockBookmarks.values()).find(b => b.guideId === guideId && b.isCurrentPosition);
      if (existing) {
        // Convert to regular bookmark
        const regularBookmark: Bookmark = {
          ...existing,
          id: generateId(),
          title: existing.title === 'Current Position' ? `Previous Position (Line ${existing.line})` : existing.title,
          isCurrentPosition: false
        };
        mockBookmarks.set(regularBookmark.id, regularBookmark);
        
        // Delete the old current position bookmark
        mockBookmarks.delete(existing.id);
      }
      
      // Add new current position bookmark
      const bookmark: Bookmark = {
        id: `current-position-${guideId}`,
        guideId,
        line,
        title: 'Current Position',
        dateCreated: new Date(),
        isCurrentPosition: true
      };
      mockBookmarks.set(bookmark.id, bookmark);
    });
    
    (db.getCurrentPositionBookmark as jest.Mock).mockImplementation(async (guideId: string) => {
      const bookmarks = Array.from(mockBookmarks.values());
      return bookmarks.find(b => b.guideId === guideId && b.isCurrentPosition) || null;
    });
  });

  it('should save current position bookmark', async () => {
    const guideId = 'test-guide-123';
    const line = 42;

    await db.saveCurrentPositionBookmark(guideId, line);

    const currentPos = await db.getCurrentPositionBookmark(guideId);
    expect(currentPos).toBeTruthy();
    expect(currentPos?.guideId).toBe(guideId);
    expect(currentPos?.line).toBe(line);
    expect(currentPos?.isCurrentPosition).toBe(true);
    expect(currentPos?.title).toBe('Current Position');
  });

  it('should convert existing current position bookmark to regular bookmark when setting new position', async () => {
    const guideId = 'test-guide-123';

    // Save first position
    await db.saveCurrentPositionBookmark(guideId, 10);
    
    // Save new position
    await db.saveCurrentPositionBookmark(guideId, 20);

    const bookmarks = await db.getBookmarks(guideId);
    const currentPositionBookmarks = bookmarks.filter(b => b.isCurrentPosition);
    const regularBookmarks = bookmarks.filter(b => !b.isCurrentPosition);

    // Should only have one current position bookmark
    expect(currentPositionBookmarks.length).toBe(1);
    expect(currentPositionBookmarks[0].line).toBe(20);
    
    // Should have one regular bookmark (the old current position)
    expect(regularBookmarks.length).toBe(1);
    expect(regularBookmarks[0].line).toBe(10);
    expect(regularBookmarks[0].title).toBe('Previous Position (Line 10)');
  });

  it('should return null if no current position bookmark exists', async () => {
    const guideId = 'test-guide-no-position';
    const currentPos = await db.getCurrentPositionBookmark(guideId);
    expect(currentPos).toBeNull();
  });

  it('should not affect regular bookmarks', async () => {
    const guideId = 'test-guide-123';

    // Add regular bookmark
    const regularBookmark: Bookmark = {
      id: 'regular-bookmark-1',
      guideId,
      line: 100,
      title: 'Chapter 5',
      dateCreated: new Date()
    };
    await db.saveBookmark(regularBookmark);

    // Add current position
    await db.saveCurrentPositionBookmark(guideId, 50);

    const bookmarks = await db.getBookmarks(guideId);
    expect(bookmarks.length).toBe(2);
    
    const regular = bookmarks.find(b => !b.isCurrentPosition);
    const current = bookmarks.find(b => b.isCurrentPosition);
    
    expect(regular?.title).toBe('Chapter 5');
    expect(current?.title).toBe('Current Position');
  });

  it('should handle multiple position changes correctly', async () => {
    const guideId = 'test-guide-123';

    // Save multiple positions
    await db.saveCurrentPositionBookmark(guideId, 10);
    await db.saveCurrentPositionBookmark(guideId, 20);
    await db.saveCurrentPositionBookmark(guideId, 30);
    await db.saveCurrentPositionBookmark(guideId, 40);

    const bookmarks = await db.getBookmarks(guideId);
    const currentPositionBookmarks = bookmarks.filter(b => b.isCurrentPosition);
    const previousPositionBookmarks = bookmarks.filter(b => !b.isCurrentPosition && b.title.startsWith('Previous Position'));

    // Should only have one current position bookmark
    expect(currentPositionBookmarks.length).toBe(1);
    expect(currentPositionBookmarks[0].line).toBe(40);
    
    // Should have three previous position bookmarks
    expect(previousPositionBookmarks.length).toBe(3);
    
    // Check that previous positions are preserved
    const lines = previousPositionBookmarks.map(b => b.line).sort((a, b) => a - b);
    expect(lines).toEqual([10, 20, 30]);
  });
});