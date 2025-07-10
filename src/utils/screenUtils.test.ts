import { getScreenIdentifier, getWindowWidth } from './screenUtils';

describe('screenUtils', () => {
  describe('getScreenIdentifier', () => {
    it('should return screen identifier based on window width rounded to nearest 50px', () => {
      // Test various widths
      const testCases = [
        { width: 320, expected: 'screen_300' },
        { width: 375, expected: 'screen_400' },
        { width: 400, expected: 'screen_400' },
        { width: 425, expected: 'screen_450' },
        { width: 768, expected: 'screen_750' },
        { width: 1024, expected: 'screen_1000' },
        { width: 1366, expected: 'screen_1350' },
        { width: 1920, expected: 'screen_1900' }
      ];

      testCases.forEach(({ width, expected }) => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: width
        });

        expect(getScreenIdentifier()).toBe(expected);
      });
    });

    it('should handle edge cases for rounding', () => {
      // Exactly at 25px boundaries
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 325
      });
      expect(getScreenIdentifier()).toBe('screen_350');

      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 324
      });
      expect(getScreenIdentifier()).toBe('screen_300');
    });
  });

  describe('getWindowWidth', () => {
    it('should return current window width', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024
      });

      expect(getWindowWidth()).toBe(1024);

      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768
      });

      expect(getWindowWidth()).toBe(768);
    });
  });
});