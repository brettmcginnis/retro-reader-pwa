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