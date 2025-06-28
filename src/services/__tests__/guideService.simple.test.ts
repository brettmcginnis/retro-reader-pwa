import { Guide } from '../../types';

describe('GuideService Types', () => {
  it('should define Guide interface correctly', () => {
    const guide: Guide = {
      id: 'test-id',
      title: 'Test Guide',
      content: 'Test content',
      url: 'https://example.com',
      dateAdded: new Date(),
      dateModified: new Date(),
      size: 100,
    };

    expect(guide.id).toBe('test-id');
    expect(guide.title).toBe('Test Guide');
    expect(guide.content).toBe('Test content');
    expect(guide.url).toBe('https://example.com');
    expect(guide.size).toBe(100);
    expect(guide.dateAdded).toBeInstanceOf(Date);
    expect(guide.dateModified).toBeInstanceOf(Date);
  });

  it('should calculate content size correctly', () => {
    const content = 'Line 1\nLine 2\nLine 3';
    const expectedSize = content.length;
    
    expect(expectedSize).toBe(20); // Corrected expected value
  });

  it('should handle empty content', () => {
    const content = '';
    const expectedSize = content.length;
    
    expect(expectedSize).toBe(0);
  });

  it('should split content into lines correctly', () => {
    const content = 'Line 1\nLine 2\nLine 3';
    const lines = content.split('\n');
    
    expect(lines).toHaveLength(3);
    expect(lines[0]).toBe('Line 1');
    expect(lines[1]).toBe('Line 2');
    expect(lines[2]).toBe('Line 3');
  });
});