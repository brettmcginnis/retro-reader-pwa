import { Guide, ReadingProgress, Bookmark, AppSettings } from '../index';

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
      position: 50,
      percentage: 25.5,
      lastRead: new Date('2023-01-01'),
    };

    expect(typeof progress.guideId).toBe('string');
    expect(typeof progress.line).toBe('number');
    expect(typeof progress.position).toBe('number');
    expect(typeof progress.percentage).toBe('number');
    expect(progress.lastRead).toBeInstanceOf(Date);
  });

  it('should define Bookmark type correctly', () => {
    const bookmark: Bookmark = {
      id: 'bookmark-1',
      guideId: 'guide-1',
      line: 100,
      position: 0,
      title: 'Important Section',
      dateCreated: new Date('2023-01-01'),
    };

    expect(typeof bookmark.id).toBe('string');
    expect(typeof bookmark.guideId).toBe('string');
    expect(typeof bookmark.line).toBe('number');
    expect(typeof bookmark.position).toBe('number');
    expect(typeof bookmark.title).toBe('string');
    expect(bookmark.dateCreated).toBeInstanceOf(Date);
  });

  it('should define AppSettings type correctly', () => {
    const settings: AppSettings = {
      theme: 'light',
      fontSize: 16,
      fontFamily: 'monospace',
      lineHeight: 1.5,
      autoSave: true,
    };

    expect(typeof settings.theme).toBe('string');
    expect(typeof settings.fontSize).toBe('number');
    expect(typeof settings.fontFamily).toBe('string');
    expect(typeof settings.lineHeight).toBe('number');
    expect(typeof settings.autoSave).toBe('boolean');
  });

  it('should allow partial AppSettings updates', () => {
    const partialSettings: Partial<AppSettings> = {
      fontSize: 18,
    };

    expect(typeof partialSettings.fontSize).toBe('number');
    expect(partialSettings.fontFamily).toBeUndefined();
    expect(partialSettings.lineHeight).toBeUndefined();
    expect(partialSettings.theme).toBeUndefined();
    expect(partialSettings.autoSave).toBeUndefined();
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