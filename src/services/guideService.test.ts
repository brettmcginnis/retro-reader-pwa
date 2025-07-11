import { GuideService } from './guideService';
import { db } from './database';
import { Guide } from '../types';

// Type helper for accessing private methods in tests
type GuideServiceWithPrivates = GuideService & {
  ensureDbInitialized(): Promise<void>;
  parseMetadata(content: string, url: string): {
    title: string;
    author?: string;
    gameTitle?: string;
    contentPreview: string;
  };
  extractTitle(content: string): string | null;
  extractTitleFromUrl(url: string): string;
  extractAuthor(content: string): string | undefined;
  extractGameTitle(content: string): string | undefined;
};

// Mock the database module
jest.mock('./database', () => ({
  db: {
    init: jest.fn(),
    saveGuide: jest.fn(),
    getGuide: jest.fn(),
    getAllGuides: jest.fn(),
    deleteGuide: jest.fn()
  }
}));

// Mock fetch globally
global.fetch = jest.fn();

describe('GuideService', () => {
  let guideService: GuideService;
  let consoleErrorSpy: jest.SpyInstance;

  beforeAll(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    guideService = new GuideService();
    (db.init as jest.Mock).mockResolvedValue(undefined);
  });

  describe('ensureDbInitialized', () => {
    it('should initialize database successfully', async () => {
      const serviceWithPrivates = guideService as unknown as GuideServiceWithPrivates;
      await serviceWithPrivates.ensureDbInitialized();
      
      expect(db.init).toHaveBeenCalled();
    });

    it('should handle database initialization errors', async () => {
      const error = new Error('DB init failed');
      (db.init as jest.Mock).mockRejectedValue(error);
      const serviceWithPrivates = guideService as unknown as GuideServiceWithPrivates;

      await expect(serviceWithPrivates.ensureDbInitialized()).rejects.toThrow('Database initialization failed: DB init failed');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error initializing database:', error);
    });
  });


  describe('fetchGuide', () => {
    const mockUrl = 'https://example.com/guide.txt';
    const mockContent = `Super Mario 64 Guide
by GameFAQs User
Version 1.0

This is a guide for Super Mario 64.
Let's-a-go!`;

    beforeEach(() => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        text: jest.fn().mockResolvedValue(mockContent)
      });
    });

    it('should fetch and save a guide successfully', async () => {
      const result = await guideService.fetchGuide(mockUrl);

      expect(db.init).toHaveBeenCalled();
      expect(global.fetch).toHaveBeenCalledWith(mockUrl);
      expect(db.saveGuide).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Super Mario 64',
        url: mockUrl,
        content: mockContent,
        size: mockContent.length,
        author: 'GameFAQs User',
        gameTitle: 'Super Mario 64'
      }));
      expect(result).toMatchObject({
        title: 'Super Mario 64',
        url: mockUrl,
        content: mockContent
      });
    });

    it('should handle fetch errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      await expect(guideService.fetchGuide(mockUrl)).rejects.toThrow('Failed to fetch guide from https://example.com/guide.txt: Failed to fetch guide: 404 Not Found');
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(guideService.fetchGuide(mockUrl)).rejects.toThrow('Failed to fetch guide from https://example.com/guide.txt: Network error');
    });
  });

  describe('parseMetadata', () => {
    it('should extract metadata from content', () => {
      const content = `The Legend of Zelda: Ocarina of Time FAQ/Walkthrough
by ZeldaMaster
Version 2.5

For Nintendo 64

Table of Contents:
1. Introduction`;
      
      const serviceWithPrivates = guideService as unknown as GuideServiceWithPrivates;
      const metadata = serviceWithPrivates.parseMetadata(content, 'https://example.com/zelda.txt');
      
      expect(metadata).toEqual({
        title: 'The Legend of Zelda: Ocarina of Time',
        author: 'ZeldaMaster',
        gameTitle: 'The Legend of Zelda: Ocarina of Time',
        contentPreview: expect.any(String)
      });
    });

    it('should fall back to URL-based title when extraction fails', () => {
      const content = '123456789'; // Content too short for title extraction
      const url = 'https://example.com/final-fantasy-vii-guide.txt';
      
      const serviceWithPrivates = guideService as unknown as GuideServiceWithPrivates;
      const metadata = serviceWithPrivates.parseMetadata(content, url);
      
      expect(metadata.title).toBe('final fantasy vii guide');
      expect(metadata.author).toBeUndefined();
      expect(metadata.gameTitle).toBeUndefined();
    });
  });

  describe('extractTitle', () => {
    it('should extract title with "Guide" pattern', () => {
      const content = 'Final Fantasy VII Guide\nby Someone';
      const serviceWithPrivates = guideService as unknown as GuideServiceWithPrivates;
      const title = serviceWithPrivates.extractTitle(content);
      expect(title).toBe('Final Fantasy VII');
    });

    it('should extract title with "FAQ" pattern', () => {
      const content = 'Resident Evil 2 FAQ\nVersion 1.0';
      const serviceWithPrivates = guideService as unknown as GuideServiceWithPrivates;
      const title = serviceWithPrivates.extractTitle(content);
      expect(title).toBe('Resident Evil 2');
    });

    it('should extract title with "Walkthrough" pattern', () => {
      const content = 'Silent Hill Walkthrough\nComplete guide';
      const serviceWithPrivates = guideService as unknown as GuideServiceWithPrivates;
      const title = serviceWithPrivates.extractTitle(content);
      expect(title).toBe('Silent Hill');
    });

    it('should extract title with "by" pattern', () => {
      const content = 'Metal Gear Solid by AuthorName';
      const serviceWithPrivates = guideService as unknown as GuideServiceWithPrivates;
      const title = serviceWithPrivates.extractTitle(content);
      expect(title).toBe('Metal Gear Solid');
    });

    it('should extract title with version pattern', () => {
      const content = 'Chrono Trigger Guide v1.5\nUpdated guide';
      const serviceWithPrivates = guideService as unknown as GuideServiceWithPrivates;
      const title = serviceWithPrivates.extractTitle(content);
      expect(title).toBe('Chrono Trigger');
    });

    it('should return null for invalid titles', () => {
      const serviceWithPrivates = guideService as unknown as GuideServiceWithPrivates;
      expect(serviceWithPrivates.extractTitle('Short')).toBeNull();
      expect(serviceWithPrivates.extractTitle('A'.repeat(101))).toBeNull();
      expect(serviceWithPrivates.extractTitle('')).toBeNull();
    });
  });

  describe('extractTitleFromUrl', () => {
    it('should extract title from URL filename', () => {
      const serviceWithPrivates = guideService as unknown as GuideServiceWithPrivates;
      expect(serviceWithPrivates.extractTitleFromUrl('https://example.com/super-mario-guide.txt'))
        .toBe('super mario guide');
      expect(serviceWithPrivates.extractTitleFromUrl('https://example.com/final_fantasy_vii.html'))
        .toBe('final fantasy vii');
    });

    it('should handle URLs without filename', () => {
      const serviceWithPrivates = guideService as unknown as GuideServiceWithPrivates;
      expect(serviceWithPrivates.extractTitleFromUrl('https://example.com/'))
        .toBe('guide');
    });

    it('should handle invalid URLs', () => {
      const serviceWithPrivates = guideService as unknown as GuideServiceWithPrivates;
      expect(serviceWithPrivates.extractTitleFromUrl('not-a-url'))
        .toBe('Untitled Guide');
    });
  });

  describe('extractAuthor', () => {
    it('should extract author with "by" pattern', () => {
      const content = 'Guide by John Doe';
      const serviceWithPrivates = guideService as unknown as GuideServiceWithPrivates;
      expect(serviceWithPrivates.extractAuthor(content)).toBe('John Doe');
    });

    it('should extract author with "author:" pattern', () => {
      const content = 'Author: Jane Smith';
      const serviceWithPrivates = guideService as unknown as GuideServiceWithPrivates;
      expect(serviceWithPrivates.extractAuthor(content)).toBe('Jane Smith');
    });

    it('should extract author with "written by" pattern', () => {
      const content = 'Written by GameMaster2000';
      const serviceWithPrivates = guideService as unknown as GuideServiceWithPrivates;
      expect(serviceWithPrivates.extractAuthor(content)).toBe('GameMaster2000');
    });

    it('should return undefined for invalid authors', () => {
      const serviceWithPrivates = guideService as unknown as GuideServiceWithPrivates;
      expect(serviceWithPrivates.extractAuthor('by AB')).toBeUndefined(); // Too short
      expect(serviceWithPrivates.extractAuthor('by ' + 'A'.repeat(51))).toBeUndefined(); // Too long
      expect(serviceWithPrivates.extractAuthor('No author here')).toBeUndefined();
    });
  });

  describe('extractGameTitle', () => {
    it('should extract game title with Guide pattern', () => {
      const content = 'Super Mario 64 Guide';
      const serviceWithPrivates = guideService as unknown as GuideServiceWithPrivates;
      expect(serviceWithPrivates.extractGameTitle(content)).toBe('Super Mario 64');
    });

    it('should extract game title with "for" pattern', () => {
      const content = 'Strategy tips for The Legend of Zelda\nMore content here';
      const serviceWithPrivates = guideService as unknown as GuideServiceWithPrivates;
      expect(serviceWithPrivates.extractGameTitle(content)).toBe('The Legend of Zelda');
    });

    it('should return undefined for invalid game titles', () => {
      const serviceWithPrivates = guideService as unknown as GuideServiceWithPrivates;
      expect(serviceWithPrivates.extractGameTitle('for ABC')).toBeUndefined(); // Too short
      expect(serviceWithPrivates.extractGameTitle('for ' + 'A'.repeat(101))).toBeUndefined(); // Too long
      expect(serviceWithPrivates.extractGameTitle('No game title')).toBeUndefined();
    });
  });

  describe('getAllGuides', () => {
    it('should get all guides from database', async () => {
      const mockGuides: Guide[] = [
        {
          id: '1',
          title: 'Guide 1',
          content: 'Content 1',
          url: 'url1',
          dateAdded: new Date(),
          dateModified: new Date(),
          size: 100
        }
      ];
      (db.getAllGuides as jest.Mock).mockResolvedValue(mockGuides);

      const result = await guideService.getAllGuides();

      expect(db.init).toHaveBeenCalled();
      expect(db.getAllGuides).toHaveBeenCalled();
      expect(result).toBe(mockGuides);
    });
  });

  describe('getGuide', () => {
    it('should get a specific guide from database', async () => {
      const mockGuide: Guide = {
        id: '1',
        title: 'Test Guide',
        content: 'Test content',
        url: 'test-url',
        dateAdded: new Date(),
        dateModified: new Date(),
        size: 100
      };
      (db.getGuide as jest.Mock).mockResolvedValue(mockGuide);

      const result = await guideService.getGuide('1');

      expect(db.init).toHaveBeenCalled();
      expect(db.getGuide).toHaveBeenCalledWith('1');
      expect(result).toBe(mockGuide);
    });

    it('should return undefined for non-existent guide', async () => {
      (db.getGuide as jest.Mock).mockResolvedValue(undefined);

      const result = await guideService.getGuide('non-existent');

      expect(result).toBeUndefined();
    });
  });

  describe('deleteGuide', () => {
    it('should delete a guide from database', async () => {
      await guideService.deleteGuide('1');

      expect(db.init).toHaveBeenCalled();
      expect(db.deleteGuide).toHaveBeenCalledWith('1');
    });
  });

  describe('saveGuide', () => {
    it('should save a guide to database', async () => {
      const guide: Guide = {
        id: '1',
        title: 'Test Guide',
        content: 'Test content',
        url: 'test-url',
        dateAdded: new Date(),
        dateModified: new Date(),
        size: 100
      };

      await guideService.saveGuide(guide);

      expect(db.init).toHaveBeenCalled();
      expect(db.saveGuide).toHaveBeenCalledWith(guide);
    });
  });

  describe('updateGuide', () => {
    it('should update guide with new modified date', async () => {
      const guide: Guide = {
        id: '1',
        title: 'Test Guide',
        content: 'Test content',
        url: 'test-url',
        dateAdded: new Date('2023-01-01'),
        dateModified: new Date('2023-01-01'),
        size: 100
      };

      await guideService.updateGuide(guide);

      expect(db.init).toHaveBeenCalled();
      expect(db.saveGuide).toHaveBeenCalledWith(expect.objectContaining({
        ...guide,
        dateModified: expect.any(Date)
      }));
      expect(guide.dateModified.getTime()).toBeGreaterThan(new Date('2023-01-01').getTime());
    });
  });

  describe('searchInGuide', () => {
    const guide: Guide = {
      id: '1',
      title: 'Test Guide',
      content: `Line 1: Hello world
Line 2: This is a test
Line 3: Hello again
Line 4: Another test line
Line 5: Final hello`,
      url: 'test-url',
      dateAdded: new Date(),
      dateModified: new Date(),
      size: 100
    };

    it('should find matching lines', () => {
      const results = guideService.searchInGuide(guide, 'hello');

      expect(results).toHaveLength(3);
      expect(results[0]).toEqual({
        line: 1,
        content: 'Line 1: Hello world',
        matches: 1
      });
      expect(results[1]).toEqual({
        line: 3,
        content: 'Line 3: Hello again',
        matches: 1
      });
      expect(results[2]).toEqual({
        line: 5,
        content: 'Line 5: Final hello',
        matches: 1
      });
    });

    it('should count multiple matches in a line', () => {
      const guideWithDuplicates: Guide = {
        ...guide,
        content: 'test test test\nAnother line\ntest again test'
      };
      
      const results = guideService.searchInGuide(guideWithDuplicates, 'test');
      
      expect(results).toHaveLength(2);
      expect(results[0].matches).toBe(3);
      expect(results[1].matches).toBe(2);
    });

    it('should handle case-insensitive search', () => {
      const results = guideService.searchInGuide(guide, 'HELLO');
      
      expect(results).toHaveLength(3);
    });

    it('should return empty array for no matches', () => {
      const results = guideService.searchInGuide(guide, 'nonexistent');
      
      expect(results).toEqual([]);
    });
  });

  describe('getLineCount', () => {
    it('should return correct line count', () => {
      const guide: Guide = {
        id: '1',
        title: 'Test',
        content: 'Line 1\nLine 2\nLine 3',
        url: 'test',
        dateAdded: new Date(),
        dateModified: new Date(),
        size: 100
      };

      expect(guideService.getLineCount(guide)).toBe(3);
    });

    it('should handle empty content', () => {
      const guide: Guide = {
        id: '1',
        title: 'Test',
        content: '',
        url: 'test',
        dateAdded: new Date(),
        dateModified: new Date(),
        size: 0
      };

      expect(guideService.getLineCount(guide)).toBe(1); // Empty string splits to ['']
    });
  });

  describe('getLineContent', () => {
    const guide: Guide = {
      id: '1',
      title: 'Test',
      content: 'Line 1\nLine 2\nLine 3',
      url: 'test',
      dateAdded: new Date(),
      dateModified: new Date(),
      size: 100
    };

    it('should return correct line content', () => {
      expect(guideService.getLineContent(guide, 1)).toBe('Line 1');
      expect(guideService.getLineContent(guide, 2)).toBe('Line 2');
      expect(guideService.getLineContent(guide, 3)).toBe('Line 3');
    });

    it('should return empty string for out of bounds line numbers', () => {
      expect(guideService.getLineContent(guide, 0)).toBe('');
      expect(guideService.getLineContent(guide, 4)).toBe('');
      expect(guideService.getLineContent(guide, -1)).toBe('');
    });
  });
});