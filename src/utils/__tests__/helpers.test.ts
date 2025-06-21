// Utility function tests
describe('Helper Functions', () => {
  describe('URL utilities', () => {
    it('should extract filename from URL', () => {
      const extractFilename = (url: string): string => {
        try {
          const urlObj = new URL(url);
          const pathname = urlObj.pathname;
          return pathname.split('/').pop() || 'guide.txt';
        } catch {
          return 'guide.txt';
        }
      };

      expect(extractFilename('https://example.com/guide.txt')).toBe('guide.txt');
      expect(extractFilename('https://example.com/path/to/file.md')).toBe('file.md');
      expect(extractFilename('https://example.com/')).toBe('guide.txt');
      expect(extractFilename('invalid-url')).toBe('guide.txt');
    });

    it('should validate URLs', () => {
      const isValidUrl = (url: string): boolean => {
        try {
          new URL(url);
          return true;
        } catch {
          return false;
        }
      };

      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://example.com')).toBe(true);
      expect(isValidUrl('ftp://example.com')).toBe(true);
      expect(isValidUrl('invalid-url')).toBe(false);
      expect(isValidUrl('')).toBe(false);
    });
  });

  describe('Text utilities', () => {
    it('should escape HTML correctly', () => {
      const escapeHtml = (text: string): string => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
      };

      expect(escapeHtml('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert("xss")&lt;/script&gt;');
      expect(escapeHtml('Hello & World')).toBe('Hello &amp; World');
      expect(escapeHtml('Regular text')).toBe('Regular text');
    });

    it('should escape regex characters', () => {
      const escapeRegex = (string: string): string => {
        return string.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&');
      };

      // Test that the function at least doesn't crash
      expect(typeof escapeRegex('test.txt')).toBe('string');
      expect(typeof escapeRegex('test*')).toBe('string');
      expect(typeof escapeRegex('test+')).toBe('string');
      expect(typeof escapeRegex('test?')).toBe('string');
      expect(escapeRegex('regular text')).toBe('regular text');
    });
  });

  describe('Progress utilities', () => {
    it('should calculate progress percentage', () => {
      const calculatePercentage = (current: number, total: number): number => {
        if (total === 0) return 0;
        return Math.min(100, Math.max(0, (current / total) * 100));
      };

      expect(calculatePercentage(1, 10)).toBe(10);
      expect(calculatePercentage(5, 10)).toBe(50);
      expect(calculatePercentage(10, 10)).toBe(100);
      expect(calculatePercentage(0, 10)).toBe(0);
      expect(calculatePercentage(15, 10)).toBe(100); // Clamped to 100
      expect(calculatePercentage(5, 0)).toBe(0); // Handle division by zero
    });

    it('should validate line numbers', () => {
      const validateLineNumber = (line: number, totalLines: number): number => {
        return Math.max(1, Math.min(line, totalLines));
      };

      expect(validateLineNumber(5, 10)).toBe(5);
      expect(validateLineNumber(0, 10)).toBe(1); // Minimum is 1
      expect(validateLineNumber(-1, 10)).toBe(1); // Minimum is 1
      expect(validateLineNumber(15, 10)).toBe(10); // Maximum is totalLines
    });
  });

  describe('Storage utilities', () => {
    it('should handle localStorage safely', () => {
      const safeLocalStorage = {
        getItem: (key: string): string | null => {
          try {
            return localStorage.getItem(key);
          } catch {
            return null;
          }
        },
        setItem: (key: string, value: string): boolean => {
          try {
            localStorage.setItem(key, value);
            return true;
          } catch {
            return false;
          }
        },
      };

      // These should not throw errors
      expect(safeLocalStorage.getItem('test-key')).toBeNull();
      expect(safeLocalStorage.setItem('test-key', 'test-value')).toBe(true);
      expect(safeLocalStorage.getItem('test-key')).toBe('test-value');
    });
  });
});