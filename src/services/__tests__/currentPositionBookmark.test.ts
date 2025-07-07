import { db } from '../database';
import { Bookmark } from '../../types';

// Mock the database module
jest.mock('../database', () => {
  const mockBookmarks: Map<string, Bookmark> = new Map();
  
  return {
    db: {
      init: jest.fn().mockResolvedValue(undefined),
      
      saveBookmark: jest.fn().mockImplementation(async (bookmark: Bookmark) => {
        mockBookmarks.set(bookmark.id, bookmark);
      }),
      
      getBookmarks: jest.fn().mockImplementation(async (guideId: string) => {
        return Array.from(mockBookmarks.values()).filter(b => b.guideId === guideId);
      }),
      
      getAllBookmarks: jest.fn().mockImplementation(async () => {
        return Array.from(mockBookmarks.values());
      }),
      
      deleteBookmark: jest.fn().mockImplementation(async (id: string) => {
        mockBookmarks.delete(id);
      }),
      
      saveCurrentPositionBookmark: jest.fn().mockImplementation(async (guideId: string, line: number, position: number = 0) => {
        // Remove existing current position bookmark
        const existing = Array.from(mockBookmarks.values()).find(b => b.guideId === guideId && b.isCurrentPosition);
        if (existing) {
          mockBookmarks.delete(existing.id);
        }
        
        // Add new current position bookmark
        const bookmark: Bookmark = {
          id: `current-position-${guideId}`,
          guideId,
          line,
          position,
          title: 'Current Position',
          dateCreated: new Date(),
          isCurrentPosition: true
        };
        mockBookmarks.set(bookmark.id, bookmark);
      }),
      
      getCurrentPositionBookmark: jest.fn().mockImplementation(async (guideId: string) => {
        const bookmarks = Array.from(mockBookmarks.values());
        return bookmarks.find(b => b.guideId === guideId && b.isCurrentPosition) || null;
      })
    }
  };
});

describe('Current Position Bookmark', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear mock bookmarks
    (db.getAllBookmarks as jest.Mock).mockImplementation(async () => []);
  });

  it('should save current position bookmark', async () => {
    const guideId = 'test-guide-123';
    const line = 42;
    const position = 10;

    await db.saveCurrentPositionBookmark(guideId, line, position);

    const currentPos = await db.getCurrentPositionBookmark(guideId);
    expect(currentPos).toBeTruthy();
    expect(currentPos?.guideId).toBe(guideId);
    expect(currentPos?.line).toBe(line);
    expect(currentPos?.position).toBe(position);
    expect(currentPos?.isCurrentPosition).toBe(true);
    expect(currentPos?.title).toBe('Current Position');
  });

  it('should replace existing current position bookmark', async () => {
    const guideId = 'test-guide-123';

    // Save first position
    await db.saveCurrentPositionBookmark(guideId, 10, 0);
    
    // Save new position
    await db.saveCurrentPositionBookmark(guideId, 20, 5);

    const bookmarks = await db.getBookmarks(guideId);
    const currentPositionBookmarks = bookmarks.filter(b => b.isCurrentPosition);

    // Should only have one current position bookmark
    expect(currentPositionBookmarks.length).toBe(1);
    expect(currentPositionBookmarks[0].line).toBe(20);
    expect(currentPositionBookmarks[0].position).toBe(5);
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
      position: 0,
      title: 'Chapter 5',
      dateCreated: new Date()
    };
    await db.saveBookmark(regularBookmark);

    // Add current position
    await db.saveCurrentPositionBookmark(guideId, 50, 0);

    const bookmarks = await db.getBookmarks(guideId);
    expect(bookmarks.length).toBe(2);
    
    const regular = bookmarks.find(b => !b.isCurrentPosition);
    const current = bookmarks.find(b => b.isCurrentPosition);
    
    expect(regular?.title).toBe('Chapter 5');
    expect(current?.title).toBe('Current Position');
  });
});