jest.mock('./database', () => ({
  db: {
    init: jest.fn().mockResolvedValue(undefined),
    exportData: jest.fn(),
    getGuide: jest.fn(),
    saveGuide: jest.fn(),
    getBookmarks: jest.fn(),
    saveBookmark: jest.fn()
  }
}));

import { ImportExportService } from './importExportService';
import { GuideCollection } from '../types';
import { db } from './database';

const mockDb = db as jest.Mocked<typeof db>;

class MockBlob {
  public type: string;
  public size: number;
  private content: string;

  constructor(parts: BlobPart[], options: { type?: string } = {}) {
    this.type = options.type || '';
    this.content = parts.join('');
    this.size = this.content.length;
  }

  async text(): Promise<string> {
    return this.content;
  }
}

global.Blob = MockBlob as typeof Blob;

const mockCreateObjectURL = jest.fn();
const mockRevokeObjectURL = jest.fn();
const mockClick = jest.fn();
const mockAppendChild = jest.fn();
const mockRemoveChild = jest.fn();

Object.defineProperty(URL, 'createObjectURL', {
  value: mockCreateObjectURL,
  writable: true
});

Object.defineProperty(URL, 'revokeObjectURL', {
  value: mockRevokeObjectURL,
  writable: true
});

Object.defineProperty(document, 'createElement', {
  value: jest.fn(() => ({
    href: '',
    download: '',
    click: mockClick,
    style: { display: '' }
  })),
  writable: true
});

Object.defineProperty(document.body, 'appendChild', {
  value: mockAppendChild,
  writable: true
});

Object.defineProperty(document.body, 'removeChild', {
  value: mockRemoveChild,
  writable: true
});

describe('ImportExportService UI Integration Tests', () => {
  let service: ImportExportService;

  beforeEach(() => {
    service = new ImportExportService();
    jest.clearAllMocks();
    mockCreateObjectURL.mockReturnValue('blob:mock-url');
  });

  describe('Export All Collection Test Case', () => {
    it('should export complete collection as JSON file (Test Case 1)', async () => {
      const mockExportData = {
        guides: [
          {
            id: '1',
            title: 'Test Guide 1',
            content: 'Guide content 1',
            url: 'test://url1',
            dateAdded: new Date('2023-01-01'),
            dateModified: new Date('2023-01-02'),
            size: 100
          },
          {
            id: '2', 
            title: 'Test Guide 2',
            content: 'Guide content 2',
            url: 'test://url2',
            dateAdded: new Date('2023-01-03'),
            dateModified: new Date('2023-01-04'),
            size: 200
          }
        ],
        bookmarks: [
          {
            id: 'b1',
            guideId: '1',
            line: 10,
            title: 'Important Section',
            note: 'This is important',
            dateCreated: new Date('2023-01-05')
          }
        ]
      };

      mockDb.exportData.mockResolvedValue(mockExportData);

      await service.exportAll();

      expect(mockDb.init).toHaveBeenCalled();
      expect(mockDb.exportData).toHaveBeenCalled();

      expect(mockCreateObjectURL).toHaveBeenCalledWith(expect.any(Blob));
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(mockAppendChild).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');

      const createObjectURLCall = mockCreateObjectURL.mock.calls[0];
      const blob = createObjectURLCall[0] as Blob;
      
      expect(blob.type).toBe('application/json');
      
      const blobText = await blob.text();
      const exportedData = JSON.parse(blobText);
      
      expect(exportedData).toHaveProperty('guides');
      expect(exportedData).toHaveProperty('bookmarks');
      expect(exportedData).toHaveProperty('exportDate');
      expect(exportedData).toHaveProperty('version', '1.0.0');
      expect(exportedData.guides).toHaveLength(2);
      expect(exportedData.bookmarks).toHaveLength(1);
    });
  });

  describe('Import Collection Test Case', () => {
    it('should import valid collection and restore guides and bookmarks (Test Case 2)', async () => {
      const validCollection: GuideCollection = {
        guides: [
          {
            id: 'imported-1',
            title: 'Imported Guide',
            content: 'Imported content',
            url: 'import://url',
            dateAdded: new Date('2023-01-01'),
            dateModified: new Date('2023-01-02'),
            size: 150
          }
        ],
        bookmarks: [
          {
            id: 'imported-b1',
            guideId: 'imported-1',
            line: 20,
            title: 'Imported Bookmark',
            dateCreated: new Date('2023-01-03')
          }
        ],
        exportDate: new Date('2023-01-05'),
        version: '1.0.0'
      };

      const file = new File(
        [JSON.stringify(validCollection)],
        'collection.json',
        { type: 'application/json' }
      );

      mockDb.getGuide.mockResolvedValue(null);
      mockDb.saveGuide.mockResolvedValue(undefined);
      mockDb.saveBookmark.mockResolvedValue(undefined);

      const result = await service.importFromFile(file);

      expect(result.imported).toBe(1);
      expect(result.skipped).toBe(0);
      expect(result.errors).toHaveLength(0);

      expect(mockDb.getGuide).toHaveBeenCalledWith('imported-1');
      expect(mockDb.saveGuide).toHaveBeenCalledWith({
        ...validCollection.guides[0],
        dateAdded: expect.any(Date),
        dateModified: expect.any(Date)
      });
      expect(mockDb.saveBookmark).toHaveBeenCalledWith({
        ...validCollection.bookmarks[0],
        dateCreated: expect.any(Date)
      });
    });

    it('should handle guide replacement confirmation', async () => {
      const validCollection: GuideCollection = {
        guides: [
          {
            id: 'existing-1',
            title: 'Existing Guide',
            content: 'Updated content',
            url: 'update://url',
            dateAdded: new Date('2023-01-01'),
            dateModified: new Date('2023-01-02'),
            size: 150
          }
        ],
        bookmarks: [],
        exportDate: new Date('2023-01-05'),
        version: '1.0.0'
      };

      const file = new File(
        [JSON.stringify(validCollection)],
        'collection.json',
        { type: 'application/json' }
      );

      const existingGuide = { id: 'existing-1', title: 'Existing Guide' };
      mockDb.getGuide.mockResolvedValue(existingGuide);
      mockDb.saveGuide.mockResolvedValue(undefined);

      const confirmCallback = jest.fn().mockResolvedValue(true);

      const result = await service.importFromFile(file, confirmCallback);

      expect(confirmCallback).toHaveBeenCalledWith('Existing Guide');

      expect(result.imported).toBe(1);
      expect(result.skipped).toBe(0);
      expect(mockDb.saveGuide).toHaveBeenCalled();
    });

    it('should skip guide when user cancels replacement', async () => {
      const validCollection: GuideCollection = {
        guides: [
          {
            id: 'existing-1',
            title: 'Existing Guide',
            content: 'Updated content',
            url: 'update://url',
            dateAdded: new Date('2023-01-01'),
            dateModified: new Date('2023-01-02'),
            size: 150
          }
        ],
        bookmarks: [],
        exportDate: new Date('2023-01-05'),
        version: '1.0.0'
      };

      const file = new File(
        [JSON.stringify(validCollection)],
        'collection.json',
        { type: 'application/json' }
      );

      const existingGuide = { id: 'existing-1', title: 'Existing Guide' };
      mockDb.getGuide.mockResolvedValue(existingGuide);

      const confirmCallback = jest.fn().mockResolvedValue(false);

      const result = await service.importFromFile(file, confirmCallback);

      expect(confirmCallback).toHaveBeenCalledWith('Existing Guide');

      expect(result.imported).toBe(0);
      expect(result.skipped).toBe(1);
      expect(mockDb.saveGuide).not.toHaveBeenCalled();
    });
  });

  describe('Invalid Import Test Case', () => {
    it('should reject invalid JSON and throw error (Test Case 3)', async () => {
      const invalidFile = new File(
        ['{ invalid json content'],
        'invalid.json',
        { type: 'application/json' }
      );

      await expect(service.importFromFile(invalidFile)).rejects.toThrow(/Failed to parse import file/);
    });

    it('should reject JSON with invalid structure', async () => {
      const invalidStructure = {
        wrongProperty: 'value',
        missingGuides: true
      };

      const invalidFile = new File(
        [JSON.stringify(invalidStructure)],
        'invalid-structure.json',
        { type: 'application/json' }
      );

      await expect(service.importFromFile(invalidFile)).rejects.toThrow('Invalid import data format');
    });

    it('should handle missing required properties', async () => {
      const incompleteData = {
        guides: [],
        bookmarks: [],
      };

      const invalidFile = new File(
        [JSON.stringify(incompleteData)],
        'incomplete.json',
        { type: 'application/json' }
      );

      await expect(service.importFromFile(invalidFile)).rejects.toThrow('Invalid import data format');
    });

    it('should accept valid date strings (fixes the original bug)', async () => {
      const collectionWithStringDate = {
        guides: [],
        bookmarks: [],
        exportDate: '2023-01-01T00:00:00.000Z', // String date
        version: '1.0.0'
      };

      const file = new File(
        [JSON.stringify(collectionWithStringDate)],
        'string-date.json',
        { type: 'application/json' }
      );

      const result = await service.importFromFile(file);
      expect(result.imported).toBe(0);
      expect(result.skipped).toBe(0);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Text File Import', () => {
    it('should import .txt files as guides', async () => {
      const textContent = 'This is guide content\nLine 2\nLine 3';
      const txtFile = new File([textContent], 'my-guide.txt', { type: 'text/plain' });

      mockDb.saveGuide.mockResolvedValue(undefined);

      const result = await service.importFromFile(txtFile);

      expect(result.imported).toBe(1);
      expect(result.skipped).toBe(0);
      expect(result.errors).toHaveLength(0);

      expect(mockDb.saveGuide).toHaveBeenCalledWith({
        id: expect.any(String),
        title: 'My Guide', // Extracted from filename
        content: textContent,
        url: '',
        dateAdded: expect.any(Date),
        dateModified: expect.any(Date),
        size: textContent.length
      });
    });

    it('should reject empty text files', async () => {
      const emptyFile = new File([''], 'empty.txt', { type: 'text/plain' });

      await expect(service.importFromFile(emptyFile)).rejects.toThrow('Text file is empty');
    });
  });
});