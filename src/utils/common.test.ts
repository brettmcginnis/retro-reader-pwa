import { generateId, extractTitleFromUrl, wrapError } from './common';

describe('common utilities', () => {
  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      
      expect(id1).toBeTruthy();
      expect(id2).toBeTruthy();
      expect(id1).not.toBe(id2);
    });
    
    it('should generate IDs with expected format', () => {
      const id = generateId();
      
      // Should contain base36 characters
      expect(id).toMatch(/^[0-9a-z]+$/);
      // Should be reasonably long
      expect(id.length).toBeGreaterThan(10);
    });
  });
  
  describe('extractTitleFromUrl', () => {
    it('should extract title from simple URL', () => {
      expect(extractTitleFromUrl('https://example.com/my-guide.html')).toBe('My Guide');
    });
    
    it('should extract title from URL without extension', () => {
      expect(extractTitleFromUrl('https://example.com/my-guide')).toBe('My Guide');
    });
    
    it('should remove www prefix', () => {
      expect(extractTitleFromUrl('https://www.example.com')).toBe('Example');
    });
    
    it('should handle URLs with underscores', () => {
      expect(extractTitleFromUrl('https://example.com/my_awesome_guide.txt')).toBe('My Awesome Guide');
    });
    
    it('should handle URLs without path', () => {
      expect(extractTitleFromUrl('https://example.com')).toBe('Example');
    });
    
    it('should return default title for invalid URLs', () => {
      expect(extractTitleFromUrl('not a url')).toBe('Untitled Guide');
    });
    
    it('should handle empty strings', () => {
      expect(extractTitleFromUrl('')).toBe('Untitled Guide');
    });
  });
  
  describe('wrapError', () => {
    it('should wrap Error instances with context', () => {
      const originalError = new Error('Original message');
      const wrappedError = wrapError(originalError, 'Failed to save');
      
      expect(wrappedError.message).toBe('Failed to save: Original message');
    });
    
    it('should handle non-Error values', () => {
      const wrappedError = wrapError('Something went wrong', 'Operation failed');
      
      expect(wrappedError.message).toBe('Operation failed: Something went wrong');
    });
    
    it('should handle null/undefined', () => {
      const wrappedError1 = wrapError(null, 'Null error');
      const wrappedError2 = wrapError(undefined, 'Undefined error');
      
      expect(wrappedError1.message).toBe('Null error: null');
      expect(wrappedError2.message).toBe('Undefined error: undefined');
    });
  });
});