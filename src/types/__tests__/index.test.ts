import { Guide, ReadingProgress, Bookmark } from '../index';

describe('Type Definitions', () => {
  it('should define Guide type correctly', () => {
    const guide: Guide = {
      id: 'test-id',
      title: 'Test Guide',
      content: 'Test content',
      url: 'https://example.com',
      dateAdded: new Date('2023-01-01'),
      dateModified: new Date('2023-01-02'),
      size: 12,
    };

    expect(typeof guide.id).toBe('string');
    expect(typeof guide.title).toBe('string');
    expect(typeof guide.content).toBe('string');
    expect(typeof guide.url).toBe('string');
    expect(guide.dateAdded).toBeInstanceOf(Date);
    expect(guide.dateModified).toBeInstanceOf(Date);
    expect(typeof guide.size).toBe('number');
  });

  it('should define ReadingProgress type correctly', () => {
    const progress: ReadingProgress = {
      guideId: 'guide-1',
      line: 10,
      percentage: 25.5,
      lastRead: new Date('2023-01-01'),
    };

    expect(typeof progress.guideId).toBe('string');
    expect(typeof progress.line).toBe('number');
    expect(typeof progress.percentage).toBe('number');
    expect(progress.lastRead).toBeInstanceOf(Date);
  });

  it('should define Bookmark type correctly', () => {
    const bookmark: Bookmark = {
      id: 'bookmark-1',
      guideId: 'guide-1',
      line: 100,
      title: 'Important Section',
      dateCreated: new Date('2023-01-01'),
    };

    expect(typeof bookmark.id).toBe('string');
    expect(typeof bookmark.guideId).toBe('string');
    expect(typeof bookmark.line).toBe('number');
    expect(typeof bookmark.title).toBe('string');
    expect(bookmark.dateCreated).toBeInstanceOf(Date);
  });


  it('should handle Guide creation without optional fields', () => {
    const minimalGuide: Omit<Guide, 'id' | 'dateAdded' | 'dateModified'> = {
      title: 'New Guide',
      content: 'Some content',
      url: 'https://example.com/new',
      size: 12,
    };

    expect(typeof minimalGuide.title).toBe('string');
    expect(typeof minimalGuide.content).toBe('string');
    expect(typeof minimalGuide.url).toBe('string');
    expect(typeof minimalGuide.size).toBe('number');
  });
});