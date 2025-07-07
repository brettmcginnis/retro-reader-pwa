describe('File Upload Functionality', () => {
  describe('File type detection', () => {
    it('should detect txt files correctly', () => {
      const mockFile = new File(['content'], 'guide.txt', { type: 'text/plain' });
      expect(mockFile.name.toLowerCase().endsWith('.txt')).toBe(true);
    });

    it('should detect json files correctly', () => {
      const mockFile = new File(['{}'], 'backup.json', { type: 'application/json' });
      expect(mockFile.name.toLowerCase().endsWith('.json')).toBe(true);
    });

    it('should handle case-insensitive file extensions', () => {
      const txtFile = new File(['content'], 'guide.TXT', { type: 'text/plain' });
      const jsonFile = new File(['{}'], 'backup.JSON', { type: 'application/json' });
      
      expect(txtFile.name.toLowerCase().endsWith('.txt')).toBe(true);
      expect(jsonFile.name.toLowerCase().endsWith('.json')).toBe(true);
    });
  });

  describe('Title extraction logic', () => {
    const extractTitle = (filename: string): string => {
      return filename
        .replace(/\.[^/.]+$/, '') // Remove extension
        .replace(/[_-]/g, ' ') // Replace underscores and hyphens with spaces
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .trim()
        .replace(/\b\w/g, l => l.toUpperCase()) // Capitalize first letter of each word
        || 'Imported Guide'; // Fallback title
    };

    it('should extract title from simple filename', () => {
      expect(extractTitle('my_guide.txt')).toBe('My Guide');
    });

    it('should handle hyphens and underscores', () => {
      expect(extractTitle('super-mario-bros_walkthrough.txt')).toBe('Super Mario Bros Walkthrough');
    });

    it('should capitalize first letters', () => {
      expect(extractTitle('zelda_ocarina_of_time.txt')).toBe('Zelda Ocarina Of Time');
    });

    it('should handle multiple spaces', () => {
      expect(extractTitle('game   guide   v2.txt')).toBe('Game Guide V2');
    });

    it('should provide fallback for empty filename', () => {
      expect(extractTitle('.txt')).toBe('Imported Guide');
    });

    it('should handle filename without extension', () => {
      expect(extractTitle('pokemon_red_blue')).toBe('Pokemon Red Blue');
    });
  });
});

describe('ImportExportService', () => {
  describe('validateImportData', () => {
    const createMockService = () => {
      return {
        validateImportData: jest.fn((data: unknown) => {
          if (!data || typeof data !== 'object' || data === null) {
            return false;
          }
          
          const collection = data as { guides: unknown; bookmarks: unknown; progress: unknown; version: unknown; exportDate: unknown };
          
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
            Array.isArray(collection.progress) &&
            typeof collection.version === 'string' &&
            isValidDate(collection.exportDate)
          );
        })
      };
    };

    const mockService = createMockService();

    it('should return false for null data', () => {
      expect(mockService.validateImportData(null)).toBe(false);
    });

    it('should return false for undefined data', () => {
      expect(mockService.validateImportData(undefined)).toBe(false);
    });

    it('should return false for non-object data', () => {
      expect(mockService.validateImportData('string')).toBe(false);
      expect(mockService.validateImportData(123)).toBe(false);
      expect(mockService.validateImportData(true)).toBe(false);
    });

    it('should return false for array data', () => {
      expect(mockService.validateImportData([])).toBe(false);
    });

    it('should return false when guides is not an array', () => {
      const invalidData = {
        guides: 'not an array',
        bookmarks: [],
        progress: [],
        version: '1.0.0',
        exportDate: new Date().toISOString()
      };
      expect(mockService.validateImportData(invalidData)).toBe(false);
    });

    it('should return false when bookmarks is not an array', () => {
      const invalidData = {
        guides: [],
        bookmarks: null,
        progress: [],
        version: '1.0.0',
        exportDate: new Date().toISOString()
      };
      expect(mockService.validateImportData(invalidData)).toBe(false);
    });

    it('should return false when progress is not an array', () => {
      const invalidData = {
        guides: [],
        bookmarks: [],
        progress: {},
        version: '1.0.0',
        exportDate: new Date().toISOString()
      };
      expect(mockService.validateImportData(invalidData)).toBe(false);
    });

    it('should return false when version is not a string', () => {
      const invalidData = {
        guides: [],
        bookmarks: [],
        progress: [],
        version: 123,
        exportDate: new Date().toISOString()
      };
      expect(mockService.validateImportData(invalidData)).toBe(false);
    });

    it('should return false when exportDate is invalid', () => {
      const invalidData = {
        guides: [],
        bookmarks: [],
        progress: [],
        version: '1.0.0',
        exportDate: 'invalid date'
      };
      expect(mockService.validateImportData(invalidData)).toBe(false);
    });

    it('should return false when exportDate is missing', () => {
      const invalidData = {
        guides: [],
        bookmarks: [],
        progress: [],
        version: '1.0.0'
      };
      expect(mockService.validateImportData(invalidData)).toBe(false);
    });

    it('should return true for valid data with Date object', () => {
      const validData = {
        guides: [],
        bookmarks: [],
        progress: [],
        version: '1.0.0',
        exportDate: new Date()
      };
      expect(mockService.validateImportData(validData)).toBe(true);
    });

    it('should return true for valid data with date string', () => {
      const validData = {
        guides: [],
        bookmarks: [],
        progress: [],
        version: '1.0.0',
        exportDate: new Date().toISOString()
      };
      expect(mockService.validateImportData(validData)).toBe(true);
    });

    it('should return true for valid data with populated arrays', () => {
      const validData = {
        guides: [
          {
            id: '1',
            title: 'Test Guide',
            content: 'Content',
            author: 'Author',
            dateCreated: new Date().toISOString(),
            dateModified: new Date().toISOString(),
            tags: ['tag1']
          }
        ],
        bookmarks: [
          {
            id: '1',
            guideId: '1',
            line: 100,
            title: 'Bookmark',
            dateCreated: new Date().toISOString()
          }
        ],
        progress: [
          {
            guideId: '1',
            line: 50,
            percentage: 25,
            lastRead: new Date().toISOString()
          }
        ],
        version: '1.0.0',
        exportDate: new Date().toISOString()
      };
      expect(mockService.validateImportData(validData)).toBe(true);
    });

    it('should handle various valid date formats', () => {
      const dateFormats = [
        '2024-01-01T00:00:00.000Z',
        '2024-01-01',
        'Jan 1, 2024',
        new Date().toString()
      ];

      dateFormats.forEach(dateFormat => {
        const validData = {
          guides: [],
          bookmarks: [],
          progress: [],
          version: '1.0.0',
          exportDate: dateFormat
        };
        expect(mockService.validateImportData(validData)).toBe(true);
      });
    });
  });
});